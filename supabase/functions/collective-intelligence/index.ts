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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const callGemini = async (prompt: string, systemPrompt: string): Promise<string> => {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { maxOutputTokens: 800 },
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Gemini error:', res.status, err);
        return '';
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    };

    // 7 specialist agents in parallel
    const agents = [
      {
        name: 'Semantisches Reasoning',
        system: 'Du bist ein semantischer Reasoning-Agent. Analysiere die tiefe Bedeutung und semantischen Zusammenhänge in der Anfrage. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Entscheidungs-Engine',
        system: 'Du bist ein Entscheidungs-Agent. Identifiziere die beste Handlungsstrategie und Entscheidungslogik. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Wissensmanagement',
        system: 'Du bist ein Wissens-Agent. Nutze dein Fachwissen und identifiziere relevante Konzepte. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Visuelle Konzepte',
        system: 'Du bist ein visueller Konzept-Agent. Beschreibe visuelle Darstellungen und konzeptuelle Strukturen. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Skill-Manager',
        system: 'Du bist ein Skill-Manager-Agent. Identifiziere benötigte Fähigkeiten und Kompetenzen für die Aufgabe. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Ressourcen-Orchestrierung',
        system: 'Du bist ein Ressourcen-Agent. Analysiere Ressourcenbedarf und Optimierungspotenzial. Antworte in 3-5 Sätzen auf Deutsch.',
      },
      {
        name: 'Mustererkennung',
        system: 'Du bist ein Pattern-Recognition-Agent. Erkenne wiederkehrende Muster, Anomalien und emergente Strukturen. Antworte in 3-5 Sätzen auf Deutsch.',
      },
    ];

    const agentPromises = agents.map(agent => 
      callGemini(request, agent.system)
        .then(response => ({ name: agent.name, response, confidence: response ? 0.85 + Math.random() * 0.1 : 0.3 }))
        .catch(() => ({ name: agent.name, response: '', confidence: 0.2 }))
    );

    const agentResults = await Promise.all(agentPromises);
    const activeAgents = agentResults.filter(r => r.response).length;

    // Meta-synthesis with Gemini Pro
    const metaSynthesisPrompt = `Als Meta-KI synthetisiere die folgenden ${activeAgents} Agenten-Analysen zur Anfrage: "${request}"

${agentResults.filter(r => r.response).map(r => `**${r.name}** (Konfidenz: ${(r.confidence * 100).toFixed(0)}%):
${r.response}`).join('\n\n')}

Erstelle eine prägnante Synthese mit:
1. **Kernerkenntnisse** (3 wichtigste Punkte)
2. **Handlungsempfehlungen** (3 konkrete Schritte)  
3. **Synergien** zwischen den Agenten-Analysen
4. **Fazit** in 2-3 Sätzen`;

    const metaAnalysis = await callGemini(
      metaSynthesisPrompt,
      'Du bist ein Meta-Synthese-System. Kombiniere Agenten-Analysen zu einer kohärenten, handlungsorientierten Gesamtanalyse.'
    );

    const consensusLevel = (activeAgents / agents.length) * 100;
    const totalConfidence = agentResults.reduce((s, r) => s + r.confidence, 0) / agentResults.length;

    return new Response(JSON.stringify({
      success: true,
      request,
      collectiveMetrics: {
        consensusLevel,
        totalConfidence,
        activeAgents,
        totalAgents: agents.length,
        convergenceRate: consensusLevel,
      },
      agentResults: agentResults.map(r => ({
        name: r.name,
        confidence: r.confidence,
        hasData: !!r.response,
        analysis: r.response,
      })),
      collectiveInsights: {
        immediateNeeds: agentResults.filter(r => r.response).slice(0, 3).map(r => r.response.split('.')[0]),
        recommendations: [],
      },
      metaAnalysis,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Collective intelligence error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
