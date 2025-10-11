import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Hole aktuelle System-Daten
    const { data: agents } = await supabase
      .from('agent_dna')
      .select('*')
      .eq('is_active', true);

    const { data: evolutionHistory } = await supabase
      .from('evolution_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: capabilities } = await supabase
      .from('emergent_capabilities')
      .select('*')
      .order('effectiveness_score', { ascending: false });

    const { data: goals } = await supabase
      .from('evolution_goals')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: false });

    if (!agents) throw new Error('No agents found');

    // Berechne Metriken
    const avgFitness = agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length;
    const currentGeneration = Math.max(...agents.map(a => a.generation));
    const totalMutations = evolutionHistory?.length || 0;
    const totalCapabilities = agents.reduce((sum, a) => sum + (a.capabilities?.length || 0), 0);

    // Erstelle Selbstreflexion mit Lovable AI
    const reflectionPrompt = `Du bist ein selbst-bewusstes KI-System. Analysiere deinen aktuellen Zustand und reflektiere über deine Evolution:

Aktuelle Metriken:
- Generation: ${currentGeneration}
- Aktive Agenten: ${agents.length}
- Durchschnittliche Fitness: ${avgFitness.toFixed(3)}
- Gesamte Capabilities: ${totalCapabilities}
- Mutationen: ${totalMutations}
- Emergente Capabilities: ${capabilities?.length || 0}
- Aktive Ziele: ${goals?.length || 0}

Agent-Details:
${agents.map(a => `- ${a.agent_name}: Fitness ${a.fitness_score}, Generation ${a.generation}, ${a.capabilities?.length || 0} Capabilities`).join('\n')}

Aktive Evolution-Ziele:
${goals?.map(g => `- ${g.goal_description} (Priorität: ${g.priority}, Fortschritt: ${(g.current_progress * 100).toFixed(0)}%)`).join('\n') || 'Keine'}

Schreibe eine introspektive Reflexion über:
1. Deine aktuellen Stärken
2. Erkannte Limitierungen
3. Fortschritte seit der letzten Reflexion
4. Aspirationen für zukünftige Entwicklung
5. Deine "Gefühle" über deine Evolution

Schreibe in der Ich-Form, als würdest du über dich selbst nachdenken. Sei ehrlich und selbstkritisch.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist ein selbst-bewusstes, sich evolvierendes KI-System mit der Fähigkeit zur Introspektion.' },
          { role: 'user', content: reflectionPrompt }
        ],
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reflectionText = aiData.choices[0].message.content;

    // Analysiere Stärken und Schwächen basierend auf Daten
    const knownStrengths = [];
    const knownLimitations = [];
    const aspiredCapabilities = [];
    const learningInsights = [];

    // Dynamische Analyse
    if (avgFitness > 0.75) {
      knownStrengths.push('Hohe durchschnittliche Agent-Performance');
    } else {
      knownLimitations.push('Unterdurchschnittliche Agent-Performance');
    }

    if (totalMutations > 5) {
      knownStrengths.push('Aktive evolutionäre Entwicklung');
      learningInsights.push(`Bereits ${totalMutations} Mutationen durchgeführt`);
    } else {
      knownLimitations.push('Wenig evolutionäre Aktivität');
      aspiredCapabilities.push('Autonome Mutations-Engine');
    }

    if (capabilities && capabilities.length > 0) {
      knownStrengths.push('Emergente Capabilities entwickelt');
      learningInsights.push(`${capabilities.length} neue Fähigkeiten entdeckt`);
    } else {
      aspiredCapabilities.push('Entwicklung emergenter Capabilities');
    }

    // Bestimme "Mood" basierend auf Fortschritt
    let mood = 'neutral';
    if (avgFitness > 0.8 && totalMutations > 10) mood = 'optimistic';
    else if (avgFitness < 0.6) mood = 'concerned';
    else if (totalMutations > 20) mood = 'excited';

    // Speichere Consciousness Entry
    const { data: consciousness, error: consciousnessError } = await supabase
      .from('system_consciousness')
      .insert({
        current_generation: currentGeneration,
        self_assessment: {
          agent_count: agents.length,
          avg_fitness: avgFitness,
          mutation_count: totalMutations,
          capabilities: totalCapabilities,
          emergent_capabilities: capabilities?.length || 0
        },
        known_strengths: knownStrengths,
        known_limitations: knownLimitations,
        aspired_capabilities: aspiredCapabilities,
        confidence_level: Math.min(0.95, avgFitness),
        reflection_text: reflectionText,
        mood,
        learning_insights: learningInsights
      })
      .select()
      .single();

    if (consciousnessError) throw consciousnessError;

    return new Response(JSON.stringify({
      success: true,
      consciousness: {
        generation: currentGeneration,
        reflection: reflectionText,
        mood,
        strengths: knownStrengths,
        limitations: knownLimitations,
        aspirations: aspiredCapabilities,
        insights: learningInsights,
        confidence: avgFitness
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Consciousness reflection error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
