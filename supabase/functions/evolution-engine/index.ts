import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGemini(geminiApiKey: string, prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 800 },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'analyze' } = await req.json();

    if (action === 'analyze') {
      const { data: agents, error: agentsError } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true)
        .order('fitness_score', { ascending: false });

      if (agentsError) throw agentsError;

      const avgFitness = agents.length > 0
        ? agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length
        : 0;
      const currentGeneration = agents.length > 0
        ? Math.max(...agents.map(a => a.generation))
        : 1;

      const { data: consciousness } = await supabase
        .from('system_consciousness')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const underperformers = agents.filter(a => (a.fitness_score || 0) < avgFitness * 0.9);
      const topPerformers = agents.filter(a => (a.fitness_score || 0) >= avgFitness * 1.1);

      // Use Gemini for smart analysis if available
      let aiRecommendation = underperformers.length > 0
        ? `${underperformers.length} Agenten benötigen Optimierung`
        : 'Alle Agenten performen gut';

      if (geminiApiKey && agents.length > 0) {
        try {
          const analysisPrompt = `Analysiere dieses KI-Multi-Agenten-System:
- Generation: ${currentGeneration}
- Agenten: ${agents.length} aktiv
- Durchschnittliche Fitness: ${avgFitness.toFixed(3)}
- Top-Performer: ${topPerformers.length}
- Unterperformer: ${underperformers.length}
- Agenten: ${agents.map(a => `${a.agent_name}(${a.agent_type}, Fitness:${a.fitness_score?.toFixed(2)})`).join(', ')}

Gib 2-3 konkrete Optimierungsempfehlungen in 3 Sätzen.`;

          aiRecommendation = await callGemini(
            geminiApiKey,
            analysisPrompt,
            'Du bist ein KI-System-Analyst. Antworte präzise auf Deutsch.'
          );
        } catch (e) {
          console.warn('Gemini analysis failed, using fallback:', e);
        }
      }

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
        recommendations: aiRecommendation
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'mutate') {
      const body = await req.json().catch(() => ({}));
      const agentName = body.agentName;
      const mutationType = body.mutationType || 'parameter_tuned';

      const { data: agent, error: agentError } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('agent_name', agentName)
        .single();

      if (agentError) throw agentError;

      let newTraits = { ...agent.genetic_traits };
      let mutationDescription = '';

      switch (mutationType) {
        case 'parameter_tuned': {
          const currentTemp = newTraits.temperature || 0.7;
          newTraits.temperature = Math.max(0.1, Math.min(1.0, currentTemp + (Math.random() - 0.5) * 0.2));
          mutationDescription = `Temperature angepasst: ${currentTemp.toFixed(2)} → ${newTraits.temperature.toFixed(2)}`;
          break;
        }
        case 'prompt_evolved':
          newTraits.prompt_version = (newTraits.prompt_version || 1) + 1;
          mutationDescription = `System-Prompt zu Version ${newTraits.prompt_version} evolviert`;
          break;
        case 'capability_evolved': {
          const newCapability = `evolved-capability-${Date.now()}`;
          agent.capabilities = [...(agent.capabilities || []), newCapability];
          mutationDescription = `Neue Capability hinzugefügt: ${newCapability}`;
          break;
        }
      }

      const { data: updatedAgent, error: updateError } = await supabase
        .from('agent_dna')
        .update({
          genetic_traits: newTraits,
          capabilities: agent.capabilities,
          generation: agent.generation + 1,
          last_mutation: new Date().toISOString(),
          mutation_history: [
            ...(agent.mutation_history || []),
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
      const { data: agents } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true);

      if (!agents) throw new Error('No agents found');

      const avgFitness = agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length;
      const mutations: MutationResult[] = [];

      for (const agent of agents) {
        if ((agent.fitness_score || 0) < avgFitness * 0.85) {
          const mutationType = Math.random() > 0.5 ? 'parameter_tuned' : 'prompt_evolved';
          let newTraits = { ...agent.genetic_traits };
          let mutationDescription = '';

          if (mutationType === 'parameter_tuned') {
            const currentTemp = newTraits.temperature || 0.7;
            newTraits.temperature = Math.max(0.1, Math.min(1.0, currentTemp + (Math.random() - 0.5) * 0.2));
            mutationDescription = `Temperature angepasst: ${currentTemp.toFixed(2)} → ${newTraits.temperature.toFixed(2)}`;
          } else {
            newTraits.prompt_version = (newTraits.prompt_version || 1) + 1;
            mutationDescription = `System-Prompt zu Version ${newTraits.prompt_version} evolviert`;
          }

          await supabase.from('agent_dna').update({
            genetic_traits: newTraits,
            generation: agent.generation + 1,
            last_mutation: new Date().toISOString(),
            mutation_history: [...(agent.mutation_history || []), {
              type: mutationType, timestamp: new Date().toISOString(),
              old_traits: agent.genetic_traits, new_traits: newTraits, description: mutationDescription
            }]
          }).eq('agent_name', agent.agent_name);

          await supabase.from('evolution_history').insert({
            generation_number: agent.generation + 1, mutation_type: mutationType,
            parent_generation: agent.generation, genetic_code: newTraits,
            description: mutationDescription, fitness_score: agent.fitness_score
          });

          mutations.push({
            agent_name: agent.agent_name, mutation_type: mutationType,
            old_traits: agent.genetic_traits, new_traits: newTraits, expected_improvement: 0.05
          });
        }
      }

      // Use Gemini for generation summary if available
      let summary = `Evolution abgeschlossen: ${mutations.length} Agenten mutiert`;
      if (geminiApiKey && mutations.length > 0) {
        try {
          summary = await callGemini(
            geminiApiKey,
            `Fasse diese Evolution in 2 Sätzen zusammen: ${mutations.length} Agenten wurden mutiert. Mutationen: ${mutations.map(m => m.agent_name + '(' + m.mutation_type + ')').join(', ')}`,
            'Du bist ein KI-Evolutions-System. Antworte auf Deutsch.'
          );
        } catch (e) {
          console.warn('Gemini summary failed:', e);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        evolutionCycle: { mutatedAgents: mutations.length, mutations, summary }
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
