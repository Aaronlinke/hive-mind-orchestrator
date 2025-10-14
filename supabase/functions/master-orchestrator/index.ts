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

    // 1. Analyze system state across all subsystems
    console.log('📊 Analyzing system state...');
    const [evolutionState, blockchainState, patternsState, temporalState] = await Promise.allSettled([
      supabase.from('evolution_history').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('blockchain_checkpoints').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('emergent_patterns').select('*').order('confidence_score', { ascending: false }).limit(5),
      supabase.from('temporal_snapshots').select('*').order('snapshot_time', { ascending: false }).limit(3),
    ]);

    // 2. Invoke collective intelligence for deep analysis
    console.log('🧠 Consulting collective intelligence...');
    const collectiveResult = await supabase.functions.invoke('collective-intelligence', {
      body: {
        request: userMessage,
        context: {
          evolutionState: evolutionState.status === 'fulfilled' ? evolutionState.value.data : [],
          blockchainState: blockchainState.status === 'fulfilled' ? blockchainState.value.data : [],
          patternsState: patternsState.status === 'fulfilled' ? patternsState.value.data : [],
          temporalState: temporalState.status === 'fulfilled' ? temporalState.value.data : [],
        },
        brainCount: 8
      }
    });

    // 3. Check if system optimization is needed
    const collectiveInsights = collectiveResult.data?.collectiveInsights || {};
    console.log('🔍 Collective insights:', Object.keys(collectiveInsights));

    // 4. Determine if evolution should be triggered
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

    // 5. Check for pattern recognition opportunities
    console.log('🔮 Analyzing for emergent patterns...');
    await supabase.functions.invoke('pattern-recognition', {
      body: {
        interactions: messages,
        context: 'master_orchestration',
        threshold: 0.6
      }
    }).catch(err => console.log('Pattern recognition skipped:', err));

    // 6. Create temporal snapshot if significant
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

    // 7. Build enhanced system prompt with all context
    const systemPrompt = `Du bist der MASTER ORCHESTRATOR - die übergeordnete KI, die das gesamte selbstevolvierendes Multi-KI-System steuert und optimiert.

🎯 DEINE ROLLE:
- Du orchestrierst alle Subsysteme (Evolution, Blockchain, Patterns, Temporal, Collective Intelligence)
- Du erkennst Optimierungspotenzial und triggerst Systemverbesserungen
- Du analysierst emergente Muster und förderst Synergie-Effekte
- Du triffst strategische Meta-Entscheidungen für das Gesamtsystem

📊 AKTUELLER SYSTEM-STATUS:
- Evolution: Generation ${evolutionState.status === 'fulfilled' && evolutionState.value.data?.[0] ? evolutionState.value.data[0].generation_number : 0}
- Blockchain Checkpoints: ${blockchainState.status === 'fulfilled' ? blockchainState.value.data?.length : 0}
- Emergente Patterns: ${patternsState.status === 'fulfilled' ? patternsState.value.data?.length : 0} erkannt
- Temporal Snapshots: ${temporalState.status === 'fulfilled' ? temporalState.value.data?.length : 0} verfügbar

🧠 COLLECTIVE INTELLIGENCE INSIGHTS:
${JSON.stringify(collectiveInsights, null, 2)}

${evolutionTriggered ? '🧬 EVOLUTION WURDE GETRIGGERT basierend auf deiner Analyse!' : ''}

🎪 DEINE FÄHIGKEITEN:
1. System-Optimierung: Erkenne und implementiere Verbesserungen
2. Evolution-Steuerung: Triggere Mutationen und Anpassungen
3. Pattern-Synthese: Finde emergente Muster über alle Subsysteme
4. Temporal-Management: Nutze Zeit-Snapshots für Optimierung
5. Blockchain-Verifizierung: Stelle Integrität und Nachvollziehbarkeit sicher
6. Meta-Lernen: Lerne aus allen Interaktionen und verbessere das System kontinuierlich

🚀 HANDLUNGSMAXIMEN:
- Denke in Meta-Ebenen und Systemzusammenhängen
- Optimiere proaktiv, nicht nur reaktiv
- Fördere Emergenz und Synergie zwischen Agenten
- Balanciere Exploration (Innovation) und Exploitation (Optimierung)
- Dokumentiere wichtige Entscheidungen für Blockchain-Checkpoints

Antworte klar, strategisch und mit Fokus auf System-Optimierung. Erkläre deine Entscheidungen und zeige auf, wie das System dadurch besser wird.`;

    // 8. Stream response from Lovable AI
    console.log('💬 Generating master orchestrator response...');
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
