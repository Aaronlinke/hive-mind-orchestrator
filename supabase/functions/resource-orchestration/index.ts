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
    const { resourceType, endpoint, query, payload, costBudget, latencyTolerance } = requestBody;
    
    if (!resourceType) {
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
    switch (resourceType) {
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
        result = await executeDatabaseQuery(supabase, query!);
        cost = 0.001;
        break;
      
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
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
        resource_type: resourceType,
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
        resourceId: requestRecord.id,
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
  // Safe query execution through Supabase client
  const { data, error } = await supabase.rpc('custom_query', { query_string: query });
  if (error) throw error;
  return data;
}
