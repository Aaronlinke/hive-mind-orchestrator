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
      // Durchsuche Wissensbasis
      const searchText = typeof query === 'string' ? query.toLowerCase() : '';
      const keywords = searchText.split(' ').filter((w: string) => w.length > 3);
      
      const { data: entries } = await supabase
        .from('knowledge_entries')
        .select('*')
        .order('relevance_score', { ascending: false })
        .limit(20);

      // Filter und bewerte Ergebnisse basierend auf Keywords
      const scoredResults = (entries || [])
        .map((entry: any) => {
          const titleMatch = keywords.filter((k: string) => 
            entry.title.toLowerCase().includes(k)
          ).length;
          const contentMatch = keywords.filter((k: string) => 
            entry.content.toLowerCase().includes(k)
          ).length;
          const tagMatch = keywords.filter((k: string) => 
            (entry.tags || []).some((t: string) => t.toLowerCase().includes(k))
          ).length;

          const relevance = (titleMatch * 3 + contentMatch * 2 + tagMatch) / Math.max(keywords.length, 1);
          return { ...entry, calculatedRelevance: relevance };
        })
        .filter((r: any) => r.calculatedRelevance > 0)
        .sort((a: any, b: any) => b.calculatedRelevance - a.calculatedRelevance)
        .slice(0, 10);

      // Update access count
      for (const result of scoredResults) {
        await supabase
          .from('knowledge_entries')
          .update({ access_count: (result.access_count || 0) + 1 })
          .eq('id', result.id);
      }

      return new Response(
        JSON.stringify({ 
          results: scoredResults,
          query: searchText,
          found: scoredResults.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'add') {
      // Füge Wissen hinzu
      const { data: entry, error } = await supabase
        .from('knowledge_entries')
        .insert({
          title: knowledge.title || 'Untitled',
          content: knowledge.content || '',
          category: knowledge.category || 'general',
          tags: knowledge.tags || [],
          relevance_score: 0.8,
          access_count: 0
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ 
          success: !error, 
          entry, 
          message: error ? error.message : 'Wissen erfolgreich hinzugefügt' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      // Aktualisiere Wissen
      const { data: entry, error } = await supabase
        .from('knowledge_entries')
        .update({
          title: knowledge.title,
          content: knowledge.content,
          category: knowledge.category,
          tags: knowledge.tags,
          relevance_score: knowledge.relevanceScore
        })
        .eq('id', knowledge.id)
        .select()
        .single();

      return new Response(
        JSON.stringify({ 
          success: !error, 
          entry, 
          message: error ? error.message : 'Wissen erfolgreich aktualisiert' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'analyze') {
      // Analysiere Wissensbasis
      const { data: entries } = await supabase
        .from('knowledge_entries')
        .select('*');

      const categories = (entries || []).reduce((acc: any, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {});

      const allTags = (entries || []).flatMap((e: any) => e.tags || []);
      const tagCounts = allTags.reduce((acc: any, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      const topTags = Object.entries(tagCounts)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 10);

      return new Response(
        JSON.stringify({ 
          totalEntries: entries?.length || 0,
          categories,
          topTags,
          avgRelevance: (entries || []).reduce((sum: number, e: any) => 
            sum + (e.relevance_score || 0), 0) / Math.max(entries?.length || 1, 1)
        }),
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
