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
    const requestBody = await req.json();
    const { resourceType, endpoint, query, payload, costBudget, latencyTolerance, request, context } = requestBody;
    
    // Support both direct calls (with resourceType) and orchestrator calls (with request)
    const effectiveResourceType = resourceType || (request ? 'DatabaseQuery' : undefined);
    
    if (!effectiveResourceType) {
      return new Response(
        JSON.stringify({ error: 'Missing resourceType parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const startTime = Date.now();
    let result: any;
    let cost = 0;

    // Execute resource request based on type
    switch (effectiveResourceType) {
      case 'API':
        result = await executeAPIRequest(endpoint!, payload);
        cost = 0.01; // Example cost
        break;
      
      case 'WebScraping':
        result = await executeWebScraping(endpoint!, query);
        cost = 0.05;
        break;
      
      case 'CloudService':
        result = await executeCloudService(endpoint!, payload);
        cost = 0.1;
        break;
      
      case 'DatabaseQuery':
        result = await executeDatabaseQuery(supabase, query || request || '');
        cost = 0.001;
        break;
      
      default:
        throw new Error(`Unknown resource type: ${effectiveResourceType}`);
    }

    const latency = Date.now() - startTime;

    // Check constraints
    if (costBudget && cost > costBudget) {
      throw new Error(`Cost ${cost} exceeds budget ${costBudget}`);
    }

    if (latencyTolerance && latency > latencyTolerance) {
      console.warn(`Latency ${latency}ms exceeds tolerance ${latencyTolerance}ms`);
    }

    // Store request record
    const { data: requestRecord } = await supabase
      .from('resource_requests')
      .insert({
        resource_type: effectiveResourceType,
        endpoint,
        query,
        status: 'completed',
        cost_actual: cost,
        latency_ms: latency,
        result_summary: JSON.stringify(result).substring(0, 500)
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        resourceId: requestRecord?.id ?? null,
        result,
        metrics: {
          latency,
          cost,
          status: 'success'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Resource orchestration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeAPIRequest(endpoint: string, payload: any) {
  const response = await fetch(endpoint, {
    method: payload ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined
  });
  return await response.json();
}

async function executeWebScraping(url: string, selector?: string) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Simple extraction (in production, use a proper HTML parser)
  return {
    url,
    content: html.substring(0, 1000),
    selector,
    timestamp: new Date().toISOString()
  };
}

async function executeCloudService(endpoint: string, payload: any) {
  // Placeholder for cloud service integration
  return {
    service: 'cloud',
    endpoint,
    payload,
    result: 'executed'
  };
}

async function executeDatabaseQuery(supabase: any, query: string) {
  // Real, safe system inventory via the typed client (no raw SQL, no RPC).
  const TABLES = [
    'knowledge_entries',
    'chat_sessions',
    'chat_messages',
    'evolution_history',
    'emergent_patterns',
    'resource_requests',
    'web_interactions',
    'visual_concepts',
    'skill_development',
  ];

  const counts: Record<string, number> = {};
  await Promise.all(TABLES.map(async (t) => {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    counts[t] = error ? -1 : (count ?? 0);
  }));

  const q = (query || '').toLowerCase().trim();
  let matchedKnowledge: any[] = [];
  if (q) {
    const { data } = await supabase
      .from('knowledge_entries')
      .select('title, category, content')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(5);
    matchedKnowledge = data ?? [];
  }

  const { data: recentRequests } = await supabase
    .from('resource_requests')
    .select('resource_type, status, latency_ms, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const available = Object.values(counts).filter((c) => c >= 0).length;

  return {
    query: query || null,
    inventory: counts,
    availableSources: available,
    matchedKnowledge,
    recentRequests: recentRequests ?? [],
    timestamp: new Date().toISOString(),
  };
}
