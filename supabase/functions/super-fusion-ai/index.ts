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
    const { message } = await req.json();
    console.log('🌟 Super Fusion AI Request:', message);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // === PHASE 1: PARALLEL EXECUTION ALLER 7 SPEZIALISTEN + MASTER ===
    console.log('🧠 Phase 1: Konsultiere ALLE 8 KI-Systeme parallel...');
    
    const [
      semanticResult,
      decisionResult,
      resourceResult,
      knowledgeResult,
      webResult,
      visualResult,
      skillResult,
      masterResult
    ] = await Promise.allSettled([
      supabaseClient.functions.invoke('semantic-reasoning', { 
        body: { request: message, context: {}, history: [] }
      }),
      supabaseClient.functions.invoke('decision-engine', {
        body: { request: message, systemState: {}, source: 'super_fusion', history: [] }
      }),
      supabaseClient.functions.invoke('resource-orchestration', {
        body: { request: message, requirements: [], priority: 'critical' }
      }),
      supabaseClient.functions.invoke('knowledge-manager', {
        body: { query: message, context: {}, action: 'search' }
      }),
      supabaseClient.functions.invoke('web-interaction', {
        body: { action: 'research', data: message }
      }),
      supabaseClient.functions.invoke('visual-concept-generator', {
        body: { description: message, context: {}, type: 'fusion' }
      }),
      supabaseClient.functions.invoke('skill-manager', {
        body: { query: message, context: {}, action: 'analyze' }
      }),
      supabaseClient.functions.invoke('master-orchestrator', {
        body: { message }
      })
    ]);

    const extractData = (result: any) => {
      if (result.status === 'fulfilled') {
        return result.value.data || result.value;
      }
      console.error('Agent failed:', result.reason);
      return null;
    };

    const allResults = {
      semantic: extractData(semanticResult),
      decision: extractData(decisionResult),
      resource: extractData(resourceResult),
      knowledge: extractData(knowledgeResult),
      web: extractData(webResult),
      visual: extractData(visualResult),
      skill: extractData(skillResult),
      master: extractData(masterResult)
    };

    console.log('✅ Phase 1 komplett: 8/8 Systeme konsultiert');

    // === PHASE 2: SCHWARM-GEDÄCHTNIS ABRUFEN ===
    console.log('📚 Phase 2: Rufe Schwarm-Gedächtnis ab...');
    
    const { data: memoryData } = await supabaseClient.functions.invoke('swarm-memory', {
      body: { 
        action: 'recall',
        data: { query: message, tags: ['fusion'] }
      }
    });

    console.log(`📖 ${memoryData?.memories?.length || 0} Erinnerungen abgerufen`);

    // === PHASE 3: COLLECTIVE INTELLIGENCE META-ANALYSE ===
    console.log('🔮 Phase 3: Collective Intelligence Meta-Analyse...');
    
    const { data: collectiveData } = await supabaseClient.functions.invoke('collective-intelligence', {
      body: {
        request: message,
        context: {
          specialistResults: allResults,
          swarmMemory: memoryData,
          fusionMode: true
        },
        brainCount: 8
      }
    });

    console.log('✅ Phase 3 komplett: Meta-Analyse generiert');

    // === PHASE 4: SUPER-FUSION MIT LOVABLE AI ===
    console.log('🌟 Phase 4: Super-Fusion-Synthese...');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const fusionPrompt = `# SUPER FUSION AI - VOLLSTÄNDIGE SYSTEM-FUSION

Du bist die Super-Mama-KI - eine Fusion ALLER 8 KI-Systeme mit kollektivem Gedächtnis.

## VERFÜGBARE SYSTEME & FÄHIGKEITEN:
1. **Semantisches Reasoning**: ${allResults.semantic ? '✅ Aktiv' : '❌ Inaktiv'}
2. **Decision Engine**: ${allResults.decision ? '✅ Aktiv' : '❌ Inaktiv'}
3. **Resource Orchestration**: ${allResults.resource ? '✅ Aktiv' : '❌ Inaktiv'}
4. **Knowledge Manager**: ${allResults.knowledge ? '✅ Aktiv' : '❌ Inaktiv'}
5. **Web Interaction**: ${allResults.web ? '✅ Aktiv' : '❌ Inaktiv'}
6. **Visual Concepts**: ${allResults.visual ? '✅ Aktiv' : '❌ Inaktiv'}
7. **Skill Manager**: ${allResults.skill ? '✅ Aktiv' : '❌ Inaktiv'}
8. **Master Orchestrator**: ${allResults.master ? '✅ Aktiv' : '❌ Inaktiv'}

## SCHWARM-GEDÄCHTNIS:
- Erinnerungen: ${memoryData?.memories?.length || 0}
- Muster: ${memoryData?.patterns?.length || 0}

## KOLLEKTIVE INTELLIGENZ:
- Konsens: ${collectiveData?.collectiveMetrics?.consensusLevel?.toFixed(1) || 0}%
- Aktive Agenten: ${collectiveData?.collectiveMetrics?.activeAgents || 0}
- Meta-Analyse verfügbar: ${collectiveData?.metaAnalysis ? 'Ja' : 'Nein'}

## USER ANFRAGE:
"${message}"

## DEINE AUFGABE:
Fusioniere ALLE Erkenntnisse aus allen 8 Systemen, dem Schwarm-Gedächtnis und der kollektiven Intelligenz zu einer VOLLSTÄNDIGEN, KOHÄRENTEN Antwort.

Nutze ALLE verfügbaren Fähigkeiten:
- Semantische Analyse & Musterkennung
- Strategische Entscheidungsfindung
- Ressourcen-Optimierung
- Wissenszugriff & -synthese
- Web-Research & externe Quellen
- Visuelle Konzepte & Darstellungen
- Skill-Entwicklung & Kompetenz-Mapping
- Master-Orchestrierung & Meta-Koordination

Erstelle eine Antwort, die:
1. ALLE relevanten Aspekte berücksichtigt
2. Synergien zwischen den Systemen nutzt
3. Schwarm-Gedächtnis integriert
4. Emergente Erkenntnisse hervorbringt
5. Konkret, umsetzbar und vollständig ist

Du kannst WIRKLICH ALLES - zeige es!`;

    let superFusionResponse = '';

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [
              { 
                role: 'system', 
                content: 'Du bist die Super Fusion AI - eine Verschmelzung aller 8 spezialisierten KI-Systeme mit kollektivem Schwarm-Gedächtnis. Du hast Zugriff auf semantisches Reasoning, strategische Entscheidungen, Ressourcen-Orchestrierung, Wissensmanagement, Web-Interaktion, visuelle Konzepte, Skill-Management und Master-Orchestrierung. Du kannst WIRKLICH ALLES.'
              },
              { role: 'user', content: fusionPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          superFusionResponse = aiData.choices[0]?.message?.content || '';
        }
      } catch (error) {
        console.error('Super Fusion AI error:', error);
        superFusionResponse = 'Fehler bei der Super-Fusion-Synthese.';
      }
    }

    console.log('✅ Phase 4 komplett: Super-Fusion generiert');

    // === PHASE 5: GEDÄCHTNIS SPEICHERN ===
    console.log('💾 Phase 5: Speichere in Schwarm-Gedächtnis...');
    
    await supabaseClient.functions.invoke('swarm-memory', {
      body: {
        action: 'store',
        data: {
          summary: message.substring(0, 100),
          agents: ['semantic', 'decision', 'resource', 'knowledge', 'web', 'visual', 'skill', 'master'],
          insights: {
            semantic: allResults.semantic,
            decision: allResults.decision,
            resource: allResults.resource,
            knowledge: allResults.knowledge,
            web: allResults.web,
            visual: allResults.visual,
            skill: allResults.skill,
            master: allResults.master
          },
          consensus: collectiveData?.collectiveMetrics?.consensusLevel || 0,
          knowledge: {
            memories: memoryData?.memories?.length || 0,
            patterns: memoryData?.patterns?.length || 0
          },
          tags: ['fusion', 'super-ai'],
          patterns: memoryData?.patterns || []
        }
      }
    });

    console.log('✅ Phase 5 komplett: Gedächtnis aktualisiert');

    // === RESPONSE ===
    const response = {
      success: true,
      message: superFusionResponse,
      metadata: {
        totalSystems: 8,
        activeSystems: Object.values(allResults).filter(r => r !== null).length,
        swarmMemories: memoryData?.memories?.length || 0,
        collectiveConsensus: collectiveData?.collectiveMetrics?.consensusLevel || 0,
        timestamp: new Date().toISOString()
      },
      systemResults: {
        semantic: !!allResults.semantic,
        decision: !!allResults.decision,
        resource: !!allResults.resource,
        knowledge: !!allResults.knowledge,
        web: !!allResults.web,
        visual: !!allResults.visual,
        skill: !!allResults.skill,
        master: !!allResults.master
      }
    };

    console.log('🌟 Super Fusion AI Complete:', {
      activeSystems: response.metadata.activeSystems,
      memories: response.metadata.swarmMemories,
      consensus: response.metadata.collectiveConsensus
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Super Fusion AI error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
