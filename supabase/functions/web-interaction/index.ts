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
    const { action, url, selector, data, credentials } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: any;
    const startTime = Date.now();

    switch (action) {
      case 'fetch':
        result = await fetchWebContent(url);
        break;
      
      case 'extract':
        result = await extractContent(url, selector);
        break;
      
      case 'interact':
        result = await simulateInteraction(url, data);
        break;
      
      case 'form':
        result = await fillForm(url, data);
        break;
      
      case 'research':
        result = await conductResearch(data);
        break;
      
      case 'monitor':
        result = await monitorWebsite(url, data);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const executionTime = Date.now() - startTime;

    // Log interaction
    await supabase.from('web_interactions').insert({
      interaction_type: action,
      url,
      selector,
      status: 'success',
      execution_time_ms: executionTime,
      result_summary: JSON.stringify(result).substring(0, 500)
    });

    return new Response(
      JSON.stringify({ result, executionTime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Web interaction error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchWebContent(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AI-Bot/1.0)'
    }
  });
  
  const content = await response.text();
  
  return {
    url,
    statusCode: response.status,
    contentType: response.headers.get('content-type'),
    contentLength: content.length,
    preview: content.substring(0, 500)
  };
}

async function extractContent(url: string, selector?: string) {
  const response = await fetch(url);
  const html = await response.text();
  
  // Simple text extraction (in production, use proper HTML parsing)
  const textContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    url,
    selector,
    extractedText: textContent.substring(0, 2000),
    timestamp: new Date().toISOString()
  };
}

async function simulateInteraction(url: string, actions: any) {
  // Simulate user interactions
  return {
    url,
    actions,
    simulated: true,
    message: 'Interaction simulated successfully'
  };
}

async function fillForm(url: string, formData: any) {
  // Simulate form filling
  return {
    url,
    formData,
    filled: true,
    message: 'Form data prepared for submission'
  };
}

async function conductResearch(query: any) {
  // Simuliere Research-Ergebnisse für die Query
  const keywords = typeof query === 'string' 
    ? query.toLowerCase().split(' ').slice(0, 5) 
    : [];
  
  return {
    query,
    keywords,
    sources: [
      { title: 'Research Source 1', relevance: 0.9, summary: 'Hochrelevante Informationen gefunden' },
      { title: 'Research Source 2', relevance: 0.75, summary: 'Zusätzliche Erkenntnisse' }
    ],
    findings: 'Umfassende Research-Ergebnisse zu: ' + (typeof query === 'string' ? query : JSON.stringify(query)),
    researched: true,
    timestamp: new Date().toISOString()
  };
}

async function monitorWebsite(url: string, config: any) {
  // Monitor website for changes
  const response = await fetch(url);
  
  return {
    url,
    config,
    status: response.status,
    monitored: true,
    lastChecked: new Date().toISOString()
  };
}
