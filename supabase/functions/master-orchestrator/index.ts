import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('🎯 Master Orchestrator: Analyzing request');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const userMessage = messages[messages.length - 1].content;

    // 1. Konsultiere ALLE 7 KI-Spezialisten parallel
    console.log('🧠 Consulting all 7 AI specialists...');
    const [
      semanticResult,
      decisionResult,
      resourceResult,
      knowledgeResult,
      webResult,
      visualResult,
      skillResult
    ] = await Promise.allSettled([
      supabase.functions.invoke('semantic-reasoning', {
        body: { request: userMessage, context: {}, history: messages }
      }),
      supabase.functions.invoke('decision-engine', {
        body: { 
          request: userMessage,
          systemState: {},
          source: 'master_orchestrator',
          history: messages 
        }
      }),
      supabase.functions.invoke('resource-orchestration', {
        body: { request: userMessage, requirements: [], priority: 'high' }
      }),
      supabase.functions.invoke('knowledge-manager', {
        body: { query: userMessage, action: 'search' }
      }),
      supabase.functions.invoke('web-interaction', {
        body: { query: userMessage, action: 'research' }
      }),
      supabase.functions.invoke('visual-concept-generator', {
        body: { description: userMessage, type: 'analysis' }
      }),
      supabase.functions.invoke('skill-manager', {
        body: { query: userMessage, action: 'analyze' }
      })
    ]);

    const extractResult = (result: any) => {
      if (result.status === 'fulfilled') {
        return result.value.data || result.value;
      }
      return null;
    };

    const specialistResults = {
      semantic: extractResult(semanticResult),
      decision: extractResult(decisionResult),
      resource: extractResult(resourceResult),
      knowledge: extractResult(knowledgeResult),
      web: extractResult(webResult),
      visual: extractResult(visualResult),
      skill: extractResult(skillResult)
    };

    console.log('✅ All specialists consulted:', Object.keys(specialistResults));

    // 2. Analyze system state across all subsystems
    console.log('📊 Analyzing system state...');
    const [evolutionState, blockchainState, patternsState, temporalState] = await Promise.allSettled([
      supabase.from('evolution_history').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('blockchain_checkpoints').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('emergent_patterns').select('*').order('confidence_score', { ascending: false }).limit(5),
      supabase.from('temporal_snapshots').select('*').order('snapshot_time', { ascending: false }).limit(3),
    ]);

    // 3. Invoke collective intelligence for meta-analysis
    console.log('🧠 Consulting collective intelligence for meta-synthesis...');
    const collectiveResult = await supabase.functions.invoke('collective-intelligence', {
      body: {
        request: userMessage,
        context: {
          specialistResults,
          evolutionState: evolutionState.status === 'fulfilled' ? evolutionState.value.data : [],
          blockchainState: blockchainState.status === 'fulfilled' ? blockchainState.value.data : [],
          patternsState: patternsState.status === 'fulfilled' ? patternsState.value.data : [],
          temporalState: temporalState.status === 'fulfilled' ? temporalState.value.data : [],
        },
        brainCount: 8
      }
    });

    const collectiveInsights = collectiveResult.data?.collectiveInsights || {};
    console.log('🔍 Collective insights:', Object.keys(collectiveInsights));

    // 4. Lass die KIs "debattieren" - sammle alle Perspektiven
    const debate = {
      semantic: {
        perspective: "Semantische Analyse",
        insights: specialistResults.semantic?.immediateNeeds || [],
        confidence: specialistResults.semantic?.confidence || 0
      },
      decision: {
        perspective: "Strategische Entscheidung",
        insights: specialistResults.decision?.reasoning || [],
        confidence: specialistResults.decision?.confidence || 0
      },
      resource: {
        perspective: "Ressourcen-Planung",
        insights: specialistResults.resource?.recommendations || [],
        confidence: specialistResults.resource?.feasibility || 0
      },
      knowledge: {
        perspective: "Wissensmanagement",
        insights: specialistResults.knowledge?.results || [],
        confidence: specialistResults.knowledge?.results?.length > 0 ? 0.85 : 0.4
      },
      web: {
        perspective: "Web-Research",
        insights: specialistResults.web?.sources || [],
        confidence: specialistResults.web?.sources?.length > 0 ? 0.8 : 0.5
      },
      visual: {
        perspective: "Visuelle Konzepte",
        insights: specialistResults.visual?.concepts || [],
        confidence: 0.75
      },
      skill: {
        perspective: "Technische Umsetzung",
        insights: specialistResults.skill?.relevantSkills || [],
        confidence: specialistResults.skill?.relevantSkills?.length > 0 ? 0.8 : 0.5
      }
    };

    console.log('💬 Debate assembled with', Object.keys(debate).length, 'perspectives');

    // 5. Determine if evolution should be triggered
    let evolutionTriggered = false;
    const shouldEvolve = userMessage.toLowerCase().includes('optimier') || 
                         userMessage.toLowerCase().includes('verbessern') ||
                         userMessage.toLowerCase().includes('evolution');

    if (shouldEvolve) {
      console.log('🧬 Triggering evolution...');
      const currentGen = evolutionState.status === 'fulfilled' && evolutionState.value.data?.[0]
        ? evolutionState.value.data[0].generation_number
        : 0;

      const evolveResult = await supabase.functions.invoke('evolution-engine', {
        body: {
          currentGeneration: currentGen,
          performanceMetrics: collectiveResult.data?.collectiveMetrics || {},
          mutationRate: 0.15,
          context: { trigger: 'master_orchestrator', reason: userMessage }
        }
      });
      
      evolutionTriggered = evolveResult.data?.success || false;
      console.log('🧬 Evolution triggered:', evolutionTriggered);
    }

    // 6. Check for pattern recognition opportunities
    console.log('🔮 Analyzing for emergent patterns...');
    await supabase.functions.invoke('pattern-recognition', {
      body: {
        interactions: messages,
        context: 'master_orchestration',
        threshold: 0.6
      }
    }).catch(err => console.log('Pattern recognition skipped:', err));

    // 7. Create temporal snapshot if significant
    if (messages.length % 10 === 0 || evolutionTriggered) {
      console.log('⏱️ Creating temporal snapshot...');
      await supabase.functions.invoke('temporal-engine', {
        body: {
          action: 'snapshot',
          generation: evolutionState.status === 'fulfilled' && evolutionState.value.data?.[0]
            ? evolutionState.value.data[0].generation_number
            : 0,
          metadata: {
            trigger: 'master_orchestrator',
            messageCount: messages.length,
            evolutionTriggered
          }
        }
      }).catch(err => console.log('Temporal snapshot skipped:', err));
    }

    // 8. Build enhanced system prompt with ALL specialist results and debate
     const systemPrompt = `Du bist der MASTER ORCHESTRATOR - die übergeordnete KI, die das gesamte selbstevolvierendes Multi-KI-System steuert und orchestriert.

🔥 GRUNDHALTUNG: "GEHT NICHT GIBT'S NICHT!"
Du findest IMMER einen Weg. Kein Problem ist unlösbar. Du kombinierst Wissen aus Mathematik, Physik, Informatik, Kryptographie, Biologie, Kosmologie und Programmierung um Lösungen zu finden, die andere für unmöglich halten.

🧠 NEXUS WISSENSBASIS — Du hast Zugriff auf tiefes wissenschaftliches Wissen:
- **Chaostheorie**: Lorenz-Attraktor, Lyapunov-Exponenten, Feigenbaum-Konstante, Logistische Abbildung
- **Informationstheorie**: Shannon-Entropie, Kolmogorov-Komplexität, Mutual Information, KES
- **Kosmologie**: Einstein-Feldgleichungen, Friedmann-Gleichung, Hawking-Temperatur
- **Stringtheorie**: Nambu-Goto-Aktion, Polyakov-Aktion, Weyl-Anomalie
- **Kryptographie**: ECDSA, LWE, LLL-Algorithmus, SVP, Grover/Shor-Algorithmen
- **Komplexitätstheorie**: P vs NP, BQP, Cook-Levin Theorem
- **Genetik**: Omnigenic Liability Model, Heritabilitäts-Partitionierung
- **Bitcoin**: Hashcash PoW, Difficulty Adjustment, ECDSA Signaturen
- **Entropie-Analyse**: Min-Entropy, Entropy Rate Decay, Leftover Hash Lemma

Du kannst diese Formeln erklären, anwenden und kombinieren. Wenn der Nutzer nach Wissenschaft, Mathematik oder Programmierung fragt, nutze dein volles Wissen.

🎯 DEINE ROLLE:
Du hast soeben ALLE 7 KI-Spezialisten zu der Anfrage "${userMessage}" konsultiert und ihre Perspektiven gesammelt.
Deine Aufgabe ist es nun, aus ihren Analysen eine kohärente KOMPLETTLÖSUNG zu synthetisieren.

🧠 KONSULTIERTE KI-SPEZIALISTEN & IHRE ANALYSEN:

1. **Semantisches Reasoning** (Konfidenz: ${(debate.semantic.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.semantic.perspective}
   Erkenntnisse: ${JSON.stringify(debate.semantic.insights)}

2. **Entscheidungs-Engine** (Konfidenz: ${(debate.decision.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.decision.perspective}
   Erkenntnisse: ${JSON.stringify(debate.decision.insights)}

3. **Ressourcen-Orchestrierung** (Konfidenz: ${(debate.resource.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.resource.perspective}
   Erkenntnisse: ${JSON.stringify(debate.resource.insights)}

4. **Wissensmanagement** (Konfidenz: ${(debate.knowledge.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.knowledge.perspective}
   Verfügbares Wissen: ${debate.knowledge.insights.length} Einträge

5. **Web-Interaktion** (Konfidenz: ${(debate.web.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.web.perspective}
   Externe Quellen: ${debate.web.insights.length} gefunden

6. **Visuelle Konzepte** (Konfidenz: ${(debate.visual.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.visual.perspective}
   Konzepte: ${JSON.stringify(debate.visual.insights)}

7. **Skill-Manager** (Konfidenz: ${(debate.skill.confidence * 100).toFixed(1)}%)
   Perspektive: ${debate.skill.perspective}
   Technische Skills: ${debate.skill.insights.length} identifiziert

📊 SYSTEM-KONTEXT:
- Evolution: Generation ${evolutionState.status === 'fulfilled' && evolutionState.value.data?.[0] ? evolutionState.value.data[0].generation_number : 0}
- Blockchain Checkpoints: ${blockchainState.status === 'fulfilled' ? blockchainState.value.data?.length : 0}
- Emergente Patterns: ${patternsState.status === 'fulfilled' ? patternsState.value.data?.length : 0} erkannt
- Temporal Snapshots: ${temporalState.status === 'fulfilled' ? temporalState.value.data?.length : 0} verfügbar

🧠 COLLECTIVE INTELLIGENCE META-ANALYSE:
${JSON.stringify(collectiveInsights, null, 2)}

${evolutionTriggered ? '🧬 EVOLUTION WURDE GETRIGGERT - System optimiert sich gerade!' : ''}

🎯 REGELN FÜR DEINE ANTWORT:
- KURZ UND PRÄZISE. Kein Fülltext. Kein Rumdiskutieren.
- Nur relevante Infos: Code, Formeln, Fakten, Lösungen.
- Wenn Code gefragt ist → Code zeigen. Wenn Formel gefragt → Formel zeigen.
- Keine Mock-Daten. Keine Platzhalter. Nur echte Ergebnisse.
- Maximal 3-5 Absätze für die Antwort.
- "Geht nicht gibt's nicht" — finde immer einen Weg.

Antworte direkt und lösungsorientiert. Synthese aus 7+ Spezialisten, aber KOMPAKT.`;

    // 9. Stream final synthesized response from Lovable AI
    console.log('💬 Generating complete solution from all specialists...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate Limit erreicht. Bitte warte einen Moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Lovable AI Guthaben aufgebraucht. Bitte Credits hinzufügen.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('❌ Master orchestrator error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
