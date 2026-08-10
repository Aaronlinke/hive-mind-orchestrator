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
    const body = await req.json();
    const { url, selector, credentials } = body;
    const query = body.query ?? body.request ?? body.data;
    // Default to real web research when no explicit action is given
    // (orchestrators call this function with just `request`/`query`).
    const action = body.action && body.action !== 'search' ? body.action : (url ? 'fetch' : 'research');
    const data = body.data ?? query;
    
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
      
      case 'search':
        result = await conductResearch(query);
        break;

      default:
        result = await conductResearch(query ?? action);
        break;
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
  const q = typeof query === 'string' ? query : JSON.stringify(query ?? '');
  if (!q.trim()) {
    return { query: q, sources: [], findings: 'Keine Suchanfrage übergeben.', timestamp: new Date().toISOString() };
  }

  // Real search against DuckDuckGo's HTML endpoint — no simulated results.
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AI-Bot/1.0)',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!res.ok) {
    return { query: q, sources: [], findings: `Suche fehlgeschlagen (HTTP ${res.status}).`, timestamp: new Date().toISOString() };
  }

  const html = await res.text();
  const strip = (t: string) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

  const snippets: string[] = [];
  const snippetRe = /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = snippetRe.exec(html)) !== null && snippets.length < 8) snippets.push(strip(m[1]));

  const sources: Array<{ title: string; url: string; snippet: string }> = [];
  const linkRe = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let i = 0;
  while ((m = linkRe.exec(html)) !== null && sources.length < 6) {
    let href = m[1];
    const uddg = href.match(/uddg=([^&]+)/);
    if (uddg) href = decodeURIComponent(uddg[1]);
    sources.push({ title: strip(m[2]), url: href, snippet: snippets[i] ?? '' });
    i++;
  }

  return {
    query: q,
    sources,
    findings: sources.length
      ? sources.map((s, n) => `${n + 1}. ${s.title} — ${s.snippet} (${s.url})`).join('\n')
      : 'Keine Treffer gefunden.',
    resultCount: sources.length,
    timestamp: new Date().toISOString(),
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
