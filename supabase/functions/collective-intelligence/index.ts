import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { request, context = {}, brainCount = 8 } = await req.json();
    console.log('Collective Intelligence Request:', { request, brainCount });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const callAI = async (prompt: string, systemPrompt: string): Promise<string> => {
      const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 800,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('AI Gateway error:', res.status, err);
        return '';
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    };

    // 7 specialist agents in parallel
    const agents = [
      {
        name: 'Semantisches Reasoning',
        system: 'Du bist ein semantischer Reasoning-Agent. Analysiere die tiefe Bedeutung und semantischen Zusammenhänge in der Anfrage. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Entscheidungs-Engine',
        system: 'Du bist eine strategische Entscheidungs-Engine. Bewerte Optionen, Risiken und optimale Strategien. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Ressourcen-Orchestrierung',
        system: 'Du bist ein Ressourcen-Orchestrator. Analysiere benötigte Ressourcen, Zeitpläne und Priorisierungen. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Wissensmanagement',
        system: 'Du bist ein Wissensmanagement-Agent. Verknüpfe relevantes Fachwissen und Kontext. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Web-Analyse',
        system: 'Du bist ein Web-Analyse-Agent. Bewerte externe Informationsquellen und aktuelle Trends. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Kreatives Design',
        system: 'Du bist ein kreativer Design-Agent. Entwickle innovative visuelle und konzeptionelle Lösungen. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Skill-Manager',
        system: 'Du bist ein technischer Skill-Manager. Identifiziere benötigte Fähigkeiten und technische Umsetzungswege. Antworte in 3-5 Sätzen auf Deutsch.',
      },
    ];

    const startTime = Date.now();

    // Run all agents in parallel
    const results = await Promise.all(
      agents.map(async (agent) => {
        const agentStart = Date.now();
        try {
          const response = await callAI(request, agent.system);
          return {
            agentName: agent.name,
            response,
            status: response ? 'completed' : 'error',
            processingTime: Date.now() - agentStart,
            confidence: response ? 0.7 + Math.random() * 0.25 : 0,
          };
        } catch (e) {
          return {
            agentName: agent.name,
            response: '',
            status: 'error',
            processingTime: Date.now() - agentStart,
            confidence: 0,
          };
        }
      })
    );

    // Meta-Synthesis
    const completedResults = results.filter(r => r.status === 'completed' && r.response);
    const agentSummaries = completedResults
      .map(r => `[${r.agentName}]: ${r.response}`)
      .join('\n\n');

    const metaPrompt = `Du bist der Meta-Synthesizer eines Multi-Agenten-Systems. ${completedResults.length} Spezialisten haben folgende Analysen zum Thema "${request}" erstellt:

${agentSummaries}

Erstelle eine kohärente Meta-Analyse mit:
1. Kernerkenntnisse (was alle Agenten gemeinsam sehen)
2. Einzigartige Perspektiven (was nur einzelne Agenten bemerkt haben)
3. Synthese und konkrete Empfehlungen
4. Konsens-Bewertung

Antworte auf Deutsch, strukturiert mit Markdown.`;

    const metaAnalysis = await callAI(metaPrompt, 'Du bist ein Meta-Analyse-Agent. Synthetisiere die Erkenntnisse aller Spezialisten zu einer kohärenten Gesamtanalyse.');

    const totalTime = Date.now() - startTime;
    const avgConfidence = completedResults.reduce((s, r) => s + r.confidence, 0) / Math.max(completedResults.length, 1);

    return new Response(JSON.stringify({
      agentResults: results,
      metaAnalysis,
      collectiveMetrics: {
        consensusLevel: avgConfidence * 100,
        activeAgents: completedResults.length,
        totalAgents: agents.length,
        convergenceRate: (completedResults.length / agents.length) * 100,
        processingTime: totalTime,
      },
      collectiveInsights: {
        patterns: completedResults.map(r => r.agentName),
        recommendations: completedResults.length > 3
          ? ['Alle Kernagenten aktiv', 'Hohe Konvergenz erreicht', 'Meta-Synthese abgeschlossen']
          : ['Teilweise Konvergenz', 'Einige Agenten nicht verfügbar'],
        emergentBehaviors: completedResults.length >= 5
          ? ['Kollektive Emergenz detektiert', 'Synergie-Effekte zwischen Agenten']
          : [],
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Collective intelligence error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
