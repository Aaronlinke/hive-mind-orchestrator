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
  const q = (typeof query === 'string' ? query : JSON.stringify(query ?? '')).trim();
  if (!q) {
    return { query: q, sources: [], findings: 'Keine Suchanfrage übergeben.', timestamp: new Date().toISOString() };
  }

  const strip = (t: string) => t.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const sources: Array<{ title: string; url: string; snippet: string; source: string }> = [];

  // 1) DuckDuckGo Instant Answer API (real data, no key required)
  try {
    const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AI-Bot/1.0)' },
    });
    if (r.ok) {
      const d = await r.json();
      if (d.AbstractText && d.AbstractURL) {
        sources.push({ title: d.Heading || q, url: d.AbstractURL, snippet: d.AbstractText, source: d.AbstractSource || 'DuckDuckGo' });
      }
      for (const t of (d.RelatedTopics ?? []).slice(0, 4)) {
        if (t?.Text && t?.FirstURL) sources.push({ title: t.Text.split(' - ')[0], url: t.FirstURL, snippet: t.Text, source: 'DuckDuckGo' });
      }
    }
  } catch (e) {
    console.warn('DDG lookup failed:', e instanceof Error ? e.message : e);
  }

  // 2) Wikipedia full-text search (DE, fallback EN) — real article snippets
  for (const lang of ['de', 'en']) {
    if (sources.length >= 6) break;
    try {
      const r = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=4&origin=*`,
        { headers: { 'User-Agent': 'AI-Bot/1.0 (research)' } },
      );
      if (!r.ok) continue;
      const d = await r.json();
      for (const hit of d?.query?.search ?? []) {
        if (sources.length >= 6) break;
        sources.push({
          title: hit.title,
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
          snippet: strip(hit.snippet ?? ''),
          source: `Wikipedia (${lang})`,
        });
      }
      if (sources.length > 0) break;
    } catch (e) {
      console.warn(`Wikipedia ${lang} lookup failed:`, e instanceof Error ? e.message : e);
    }
  }

  return {
    query: q,
    sources,
    resultCount: sources.length,
    findings: sources.length
      ? sources.map((s, n) => `${n + 1}. ${s.title} — ${s.snippet} (${s.url})`).join('\n')
      : `Keine externen Treffer für "${q}".`,
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
