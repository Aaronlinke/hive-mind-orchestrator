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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, generation } = await req.json();

    if (action === 'create-snapshot') {
      // Capture complete system state
      const { data: agents } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true);

      const { data: consciousness } = await supabase
        .from('system_consciousness')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const { data: collaborations } = await supabase
        .from('agent_collaborations')
        .select('*');

      const { data: patterns } = await supabase
        .from('emergent_patterns')
        .select('*');

      const systemState = {
        timestamp: new Date().toISOString(),
        generation: generation || consciousness?.current_generation || 0,
        totalAgents: agents?.length || 0,
        activePatterns: patterns?.length || 0,
        collaborations: collaborations?.length || 0
      };

      const agentStates = agents?.map(a => ({
        name: a.agent_name,
        fitness: a.fitness_score,
        generation: a.generation,
        capabilities: a.capabilities
      })) || [];

      const { data: snapshot, error } = await supabase
        .from('temporal_snapshots')
        .insert({
          generation: systemState.generation,
          system_state: systemState,
          agent_states: agentStates,
          consciousness_state: consciousness
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, snapshot }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'restore-snapshot') {
      const { snapshotId } = await req.json();

      const { data: snapshot, error } = await supabase
        .from('temporal_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .single();

      if (error) throw error;

      // In a real implementation, this would restore the system state
      // For now, just return the snapshot data
      return new Response(JSON.stringify({ 
        success: true, 
        snapshot,
        message: 'Snapshot loaded. System state can be compared or restored.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list-snapshots') {
      const { data: snapshots, error } = await supabase
        .from('temporal_snapshots')
        .select('*')
        .order('snapshot_time', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, snapshots }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Temporal engine error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});