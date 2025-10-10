import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, knowledge, nodeId, edgeData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'search') {
      // Search knowledge base
      const { data: entries } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .order('access_count', { ascending: false })
        .limit(10);

      // Search knowledge graph
      const { data: nodes } = await supabase
        .from('knowledge_graph_nodes')
        .select('*')
        .or(`node_label.ilike.%${query}%,properties->>description.ilike.%${query}%`)
        .limit(10);

      return new Response(
        JSON.stringify({ entries, nodes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'add') {
      // Add to knowledge base
      const { data: entry } = await supabase
        .from('knowledge_base')
        .insert({
          title: knowledge.title,
          content: knowledge.content,
          category: knowledge.category || 'general',
          tags: knowledge.tags || [],
          source_url: knowledge.sourceUrl,
          metadata: knowledge.metadata || {}
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ entry }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'addNode') {
      // Add knowledge graph node
      const { data: node } = await supabase
        .from('knowledge_graph_nodes')
        .insert({
          node_label: knowledge.label,
          node_type: knowledge.type,
          properties: knowledge.properties || {}
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ node }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'addEdge') {
      // Add knowledge graph edge
      const { data: edge } = await supabase
        .from('knowledge_graph_edges')
        .insert({
          source_node_id: edgeData.sourceId,
          target_node_id: edgeData.targetId,
          relationship_type: edgeData.relationshipType,
          properties: edgeData.properties || {}
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ edge }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'getGraph') {
      // Get knowledge graph starting from a node
      const { data: nodes } = await supabase
        .from('knowledge_graph_nodes')
        .select(`
          *,
          outgoing:knowledge_graph_edges!source_node_id(*),
          incoming:knowledge_graph_edges!target_node_id(*)
        `)
        .eq('id', nodeId)
        .single();

      return new Response(
        JSON.stringify({ graph: nodes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'updateAccess') {
      // Track knowledge access
      await supabase.rpc('increment_access_count', { 
        entry_id: knowledge.id 
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('Knowledge manager error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
