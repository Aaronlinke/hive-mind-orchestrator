import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log('Collective Intelligence Request:', { request, context, brainCount });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Parallel execution of all AI subsystems
    const [
      semanticResult,
      decisionResult,
      knowledgeResult,
      visualResult,
      skillResult,
      resourceResult,
      webResult
    ] = await Promise.allSettled([
      supabaseClient.functions.invoke('semantic-reasoning', { 
        body: { request, context, history: context.history || [] }
      }),
      supabaseClient.functions.invoke('decision-engine', {
        body: { 
          request,
          systemState: context,
          source: 'collective_intelligence',
          history: context.history || []
        }
      }),
      supabaseClient.functions.invoke('knowledge-manager', {
        body: { query: request, context, action: 'search' }
      }),
      supabaseClient.functions.invoke('visual-concept-generator', {
        body: { description: request, context, type: 'analysis' }
      }),
      supabaseClient.functions.invoke('skill-manager', {
        body: { query: request, context, action: 'analyze' }
      }),
      supabaseClient.functions.invoke('resource-orchestration', {
        body: { request, requirements: context.requirements || [], priority: 'high' }
      }),
      supabaseClient.functions.invoke('web-interaction', {
        body: { action: 'research', data: request }
      })
    ]);

    // Extract results
    const extractResult = (result: any) => {
      if (result.status === 'fulfilled') {
        return result.value.data || result.value;
      }
      console.error('Agent failed:', result.reason);
      return null;
    };

    const semantic = extractResult(semanticResult);
    const decision = extractResult(decisionResult);
    const knowledge = extractResult(knowledgeResult);
    const visual = extractResult(visualResult);
    const skill = extractResult(skillResult);
    const resource = extractResult(resourceResult);
    const web = extractResult(webResult);

    // Collective synthesis
    const agentResults = [
      { name: 'Semantisches Reasoning', data: semantic, confidence: semantic?.confidence || 0 },
      { name: 'Entscheidungs-Engine', data: decision, confidence: decision?.confidence || 0 },
      { name: 'Wissensmanagement', data: knowledge, confidence: knowledge?.results?.length > 0 ? 0.85 : 0.4 },
      { name: 'Visuelle Konzepte', data: visual, confidence: 0.75 },
      { name: 'Skill-Manager', data: skill, confidence: skill?.relevantSkills?.length > 0 ? 0.8 : 0.5 },
      { name: 'Ressourcen-Orchestrierung', data: resource, confidence: resource?.allocation ? 0.9 : 0.6 },
      { name: 'Web-Interaktion', data: web, confidence: web?.sources?.length > 0 ? 0.8 : 0.5 }
    ];

    // Calculate collective metrics
    const totalConfidence = agentResults.reduce((sum, r) => sum + r.confidence, 0) / agentResults.length;
    const consensusLevel = totalConfidence * 100;
    const activeAgents = agentResults.filter(r => r.data).length;

    // Synthesize collective insights
    const collectiveInsights = {
      immediateNeeds: semantic?.immediateNeeds || [],
      recommendations: [
        ...(semantic?.recommendations || []),
        ...(resource?.recommendations || [])
      ].slice(0, 5),
      knowledgeBase: knowledge?.results || [],
      visualConcepts: visual?.concepts || [],
      requiredSkills: skill?.relevantSkills || [],
      resourceAllocation: resource?.allocation || {},
      externalSources: web?.sources || [],
      decisionPath: decision?.reasoning || []
    };

    // Generate meta-analysis using collective intelligence
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const metaAnalysisPrompt = `Als kollektive KI-Intelligenz analysiere folgende Schwarm-Ergebnisse und erstelle eine Meta-Synthese:

Anfrage: ${request}

Agent-Ergebnisse (${activeAgents}/${brainCount} aktiv):
${agentResults.map(a => `- ${a.name}: Konfidenz ${(a.confidence * 100).toFixed(1)}%`).join('\n')}

Kollektive Erkenntnisse:
- Unmittelbare Bedürfnisse: ${collectiveInsights.immediateNeeds.join(', ')}
- Empfehlungen: ${collectiveInsights.recommendations.join(', ')}
- Wissensbasis: ${collectiveInsights.knowledgeBase.length} Einträge
- Benötigte Skills: ${collectiveInsights.requiredSkills.length} identifiziert

Erstelle eine prägnante Meta-Analyse mit:
1. Kernerkenntnisse (3-5 Punkte)
2. Handlungsempfehlungen (3-5 konkrete Schritte)
3. Synergien zwischen Agenten
4. Risiken und Chancen
5. Nächste Schritte`;

    let metaAnalysis = '';
    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Du bist ein Meta-Analyse-System für kollektive KI-Intelligenz. Deine Aufgabe ist es, die Ergebnisse mehrerer spezialisierter KI-Agenten zu einer kohärenten Meta-Synthese zu verschmelzen.' },
              { role: 'user', content: metaAnalysisPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          metaAnalysis = aiData.choices[0]?.message?.content || '';
        }
      } catch (error) {
        console.error('Meta-analysis AI error:', error);
      }
    }

    const response = {
      success: true,
      request,
      collectiveMetrics: {
        consensusLevel,
        totalConfidence,
        activeAgents,
        totalAgents: brainCount,
        convergenceRate: (activeAgents / brainCount) * 100
      },
      agentResults: agentResults.map(r => ({
        name: r.name,
        confidence: r.confidence,
        hasData: !!r.data
      })),
      collectiveInsights,
      metaAnalysis,
      timestamp: new Date().toISOString()
    };

    console.log('Collective Intelligence Response:', {
      consensusLevel,
      activeAgents,
      metaAnalysisLength: metaAnalysis.length
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Collective intelligence error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
