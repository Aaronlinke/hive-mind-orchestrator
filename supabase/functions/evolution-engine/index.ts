import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MutationResult {
  agent_name: string;
  mutation_type: string;
  old_traits: any;
  new_traits: any;
  expected_improvement: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'analyze' } = await req.json();

    if (action === 'analyze') {
      // Analyse der aktuellen Agent-Performance
      const { data: agents, error: agentsError } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true)
        .order('fitness_score', { ascending: false });

      if (agentsError) throw agentsError;

      // Berechne System-Metriken
      const avgFitness = agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length;
      const currentGeneration = Math.max(...agents.map(a => a.generation));

      // Hole aktuelle System-Consciousness
      const { data: consciousness } = await supabase
        .from('system_consciousness')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Identifiziere Verbesserungspotentiale
      const underperformers = agents.filter(a => (a.fitness_score || 0) < avgFitness * 0.9);
      const topPerformers = agents.filter(a => (a.fitness_score || 0) >= avgFitness * 1.1);

      return new Response(JSON.stringify({
        success: true,
        metrics: {
          currentGeneration,
          avgFitness: avgFitness.toFixed(3),
          activeAgents: agents.length,
          underperformers: underperformers.length,
          topPerformers: topPerformers.length
        },
        agents: agents.map(a => ({
          name: a.agent_name,
          fitness: a.fitness_score,
          generation: a.generation,
          capabilities: a.capabilities
        })),
        consciousness: consciousness?.reflection_text,
        recommendations: underperformers.length > 0 
          ? `${underperformers.length} Agenten benötigen Optimierung`
          : 'Alle Agenten performen gut'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'mutate') {
      const { agentName, mutationType = 'parameter_tuned' } = await req.json();

      // Hole Agent-DNA
      const { data: agent, error: agentError } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('agent_name', agentName)
        .single();

      if (agentError) throw agentError;

      // Generiere Mutation basierend auf Typ
      let newTraits = { ...agent.genetic_traits };
      let mutationDescription = '';

      switch (mutationType) {
        case 'parameter_tuned':
          // Optimiere Temperature
          const currentTemp = newTraits.temperature || 0.7;
          newTraits.temperature = Math.max(0.1, Math.min(1.0, currentTemp + (Math.random() - 0.5) * 0.2));
          mutationDescription = `Temperature angepasst: ${currentTemp.toFixed(2)} → ${newTraits.temperature.toFixed(2)}`;
          break;

        case 'prompt_evolved':
          // Verbessere System-Prompt (hier simplified)
          newTraits.prompt_version = (newTraits.prompt_version || 1) + 1;
          mutationDescription = `System-Prompt zu Version ${newTraits.prompt_version} evolviert`;
          break;

        case 'capability_evolved':
          // Füge neue Capability hinzu (simplified)
          const newCapability = `evolved-capability-${Date.now()}`;
          agent.capabilities.push(newCapability);
          mutationDescription = `Neue Capability hinzugefügt: ${newCapability}`;
          break;
      }

      // Update Agent mit neuer DNA
      const { data: updatedAgent, error: updateError } = await supabase
        .from('agent_dna')
        .update({
          genetic_traits: newTraits,
          capabilities: agent.capabilities,
          generation: agent.generation + 1,
          last_mutation: new Date().toISOString(),
          mutation_history: [
            ...agent.mutation_history,
            {
              type: mutationType,
              timestamp: new Date().toISOString(),
              old_traits: agent.genetic_traits,
              new_traits: newTraits,
              description: mutationDescription
            }
          ]
        })
        .eq('agent_name', agentName)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log Evolution
      await supabase.from('evolution_history').insert({
        generation_number: updatedAgent.generation,
        mutation_type: mutationType,
        parent_generation: agent.generation,
        genetic_code: newTraits,
        description: mutationDescription,
        fitness_score: agent.fitness_score
      });

      return new Response(JSON.stringify({
        success: true,
        mutation: {
          agent: agentName,
          type: mutationType,
          description: mutationDescription,
          newGeneration: updatedAgent.generation
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'evolve-generation') {
      // Vollständiger Evolution-Cycle
      const { data: agents } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true);

      if (!agents) throw new Error('No agents found');

      const avgFitness = agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length;
      const mutations: MutationResult[] = [];

      // Mutiere underperforming Agenten
      for (const agent of agents) {
        if ((agent.fitness_score || 0) < avgFitness * 0.85) {
          const mutationType = Math.random() > 0.5 ? 'parameter_tuned' : 'prompt_evolved';
          
          // Rekursiver Aufruf für Mutation
          const mutationResult = await fetch(`${req.url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mutate', agentName: agent.agent_name, mutationType })
          });

          const result = await mutationResult.json();
          mutations.push({
            agent_name: agent.agent_name,
            mutation_type: mutationType,
            old_traits: agent.genetic_traits,
            new_traits: result.mutation,
            expected_improvement: 0.05
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        evolutionCycle: {
          mutatedAgents: mutations.length,
          mutations
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Evolution engine error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
