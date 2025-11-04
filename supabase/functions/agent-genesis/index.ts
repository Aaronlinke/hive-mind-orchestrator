import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { specialization, requiredCapabilities, parentAgents } = await req.json();

    if (!specialization) {
      throw new Error('Specialization required');
    }

    // Hole Parent-Agenten-DNA
    const { data: parents } = await supabase
      .from('agent_dna')
      .select('*')
      .in('agent_name', parentAgents || []);

    const parentTraits = parents?.map(p => p.genetic_traits) || [];
    const parentCapabilities = parents?.flatMap(p => p.capabilities || []) || [];

    // Berechne neue Generation
    const maxGeneration = parents ? Math.max(...parents.map(p => p.generation)) : 0;
    const newGeneration = maxGeneration + 1;

    // Generiere Agent-DNA mit Lovable AI
    const dnaPrompt = `Du bist eine Agent-Genesis-Engine. Erschaffe die genetische Konfiguration für einen neuen KI-Agenten.

Spezialisierung: ${specialization}
Benötigte Capabilities: ${requiredCapabilities?.join(', ') || 'Allgemein'}
Parent-Agenten: ${parentAgents?.join(', ') || 'Keine'}

Parent-Traits:
${JSON.stringify(parentTraits, null, 2)}

Erstelle eine JSONB-Konfiguration mit:
1. model: Welches Lovable AI Modell (google/gemini-2.5-flash, google/gemini-2.5-pro, etc.)
2. temperature: Optimal für die Spezialisierung (0.0-1.0)
3. max_tokens: Empfohlene Token-Grenze
4. special_instructions: Spezielle Anweisungen für diesen Agenten
5. cross_pollinated_traits: Übernommene Eigenschaften von Parents

Antworte NUR mit einem validen JSON-Objekt.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Du bist eine Agent-Genesis-Engine. Antworte NUR mit validen JSON-Objekten.' },
          { role: 'user', content: dnaPrompt }
        ],
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let geneticTraits;
    
    try {
      const content = aiData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      geneticTraits = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      // Fallback zu Default-Traits
      geneticTraits = {
        model: 'google/gemini-2.5-flash',
        temperature: 0.7,
        max_tokens: 2000,
        special_instructions: `Spezialisiert auf ${specialization}`
      };
    }

    // Generiere Agent-Namen
    const agentName = `${specialization.toLowerCase().replace(/\s+/g, '-')}-agent`;

    // Kombiniere Capabilities
    const capabilities = [
      ...new Set([
        ...(requiredCapabilities || []),
        ...parentCapabilities.slice(0, 3) // Erbe bis zu 3 Capabilities
      ])
    ];

    // Erstelle neuen Agenten
    const { data: newAgent, error: agentError } = await supabase
      .from('agent_dna')
      .insert({
        agent_name: agentName,
        agent_type: 'specialized',
        generation: newGeneration,
        genetic_traits: geneticTraits,
        parent_agents: parentAgents || [],
        specialization,
        capabilities,
        fitness_score: 0.5, // Start neutral
        mutation_history: [{
          type: 'agent_created',
          timestamp: new Date().toISOString(),
          description: `Geboren aus Cross-Pollination von ${parentAgents?.join(', ') || 'Basis-DNA'}`,
          parent_traits: parentTraits
        }]
      })
      .select()
      .single();

    if (agentError) throw agentError;

    // Log in Evolution History
    await supabase.from('evolution_history').insert({
      generation_number: newGeneration,
      mutation_type: 'agent_created',
      parent_generation: maxGeneration,
      genetic_code: geneticTraits,
      description: `Neuer Agent ${agentName} erschaffen für ${specialization}`,
      fitness_score: 0.5
    });

    // Update Evolution Goals
    const { data: genesisGoal } = await supabase
      .from('evolution_goals')
      .select('*')
      .eq('goal_type', 'capability')
      .ilike('goal_description', '%Agent-Genesis%')
      .single();

    if (genesisGoal) {
      await supabase
        .from('evolution_goals')
        .update({
          current_progress: Math.min(1.0, (genesisGoal.current_progress || 0) + 0.1)
        })
        .eq('id', genesisGoal.id);
    }

    return new Response(JSON.stringify({
      success: true,
      newAgent: {
        name: agentName,
        generation: newGeneration,
        specialization,
        capabilities,
        dna: geneticTraits,
        parents: parentAgents
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Agent genesis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
