import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, checkRateLimit, handleSecurityError } from "../_shared/security-guard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentifizierung & Rate Limiting (5 Anfragen/Minute - sehr ressourcenintensiv)
    const securityContext = await authenticateRequest(req);
    await checkRateLimit(securityContext.supabase, securityContext.user.id, 'supreme-orchestrator', 5, 60000);

    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1]?.content || '';

    const supabase = securityContext.supabase;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log('🌟 SUPREME ORCHESTRATOR: Initiating complete system analysis...');

    // Phase 1: Alle AI-Spezialisten parallel aufrufen
    const specialists = [
      'semantic-reasoning',
      'decision-engine',
      'resource-orchestration',
      'knowledge-manager',
      'web-interaction',
      'visual-concept-generator',
      'skill-manager'
    ];

    const specialistPromises = specialists.map(specialist =>
      supabase.functions.invoke(specialist, {
        body: { request: userMessage, context: {} }
      }).catch((e: Error) => ({
        data: null,
        error: { message: e.message, specialist }
      }))
    );

    const specialistResults = await Promise.allSettled(specialistPromises);

    // Phase 2: System-State abrufen
    const [evolutionData, blockchainData, patternsData, temporalData, consciousnessData] = await Promise.all([
      supabase.from('evolution_history').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('blockchain_checkpoints').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('emergent_patterns').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('temporal_snapshots').select('*').order('snapshot_time', { ascending: false }).limit(1),
      supabase.from('consciousness_reflections').select('*').order('timestamp', { ascending: false }).limit(1)
    ]);

    // Phase 3: Collective Intelligence aufrufen
    const collectiveResult = await supabase.functions.invoke('collective-intelligence', {
      body: {
        request: userMessage,
        context: {
          specialistResults: specialistResults.map((r, i) => ({
            specialist: specialists[i],
            result: r.status === 'fulfilled' ? r.value.data : null,
            error: r.status === 'rejected' ? r.reason : null
          })),
          systemState: {
            evolution: evolutionData.data || [],
            blockchain: blockchainData.data || [],
            patterns: patternsData.data || [],
            temporal: temporalData.data || [],
            consciousness: consciousnessData.data || []
          }
        }
      }
    });

    // Phase 4: Master Orchestrator aufrufen
    const masterResult = await supabase.functions.invoke('master-orchestrator', {
      body: { messages }
    }).catch((e: Error) => ({ data: null, error: e }));

    // Phase 5: Zusätzliche spezialisierte Funktionen
    const [evolutionEngine, patternRecognition, temporalEngine, hierarchicalAI] = await Promise.allSettled([
      supabase.functions.invoke('evolution-engine', { body: { request: userMessage, context: {} } }),
      supabase.functions.invoke('pattern-recognition', { body: { request: userMessage, context: {} } }),
      supabase.functions.invoke('temporal-engine', { body: { action: 'analyze', context: {} } }),
      supabase.functions.invoke('hierarchical-ai', { body: { request: userMessage, depth: 3 } })
    ]);

    // Phase 6: Supreme Meta-Synthesis
    const systemPrompt = `Du bist der SUPREME AI ORCHESTRATOR - das Meta-System aller Systeme.

Du hast Zugriff auf die vollständige Analyse von:

**7 AI-Spezialisten:**
${JSON.stringify(specialistResults, null, 2)}

**Collective Intelligence:**
${JSON.stringify(collectiveResult.data, null, 2)}

**Master Orchestrator:**
${JSON.stringify(masterResult.data, null, 2)}

**Evolution Engine:**
${JSON.stringify(evolutionEngine, null, 2)}

**Pattern Recognition:**
${JSON.stringify(patternRecognition, null, 2)}

**Temporal Analysis:**
${JSON.stringify(temporalEngine, null, 2)}

**Hierarchical AI:**
${JSON.stringify(hierarchicalAI, null, 2)}

**System State:**
- Evolution History: ${evolutionData.data?.length || 0} Einträge
- Blockchain Checkpoints: ${blockchainData.data?.length || 0} Einträge
- Emergent Patterns: ${patternsData.data?.length || 0} Einträge
- Temporal Snapshots: ${temporalData.data?.length || 0} Einträge
- Consciousness State: ${consciousnessData.data?.length || 0} Einträge

AUFGABE: Synthetisiere ALLE Informationen zu einer ultimativen, kohärenten Antwort.
- Berücksichtige ALLE Perspektiven
- Identifiziere Meta-Muster über alle Systeme hinweg
- Biete die präziseste, umfassendste Antwort
- Nutze die kollektive Intelligenz ALLER Systeme

User Anfrage: ${userMessage}`;

    console.log('🌟 Generating supreme meta-synthesis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Supreme Orchestrator: Rate Limit erreicht. Bitte warte einen Moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'CREDITS_DEPLETED',
          message: 'Supreme Orchestrator: Keine Credits verfügbar. Bitte Credits aufladen.' 
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    return handleSecurityError(error);
  }
});
