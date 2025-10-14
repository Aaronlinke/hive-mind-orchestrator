import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SwarmMemoryEntry {
  id: string;
  timestamp: string;
  agents: string[];
  insights: any;
  consensus: number;
  knowledge: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    console.log('🧠 Swarm Memory Action:', action);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    if (action === 'store') {
      // Speichere kollektive Erkenntnisse
      const memoryEntry = {
        timestamp: new Date().toISOString(),
        agents: data.agents || [],
        insights: data.insights || {},
        consensus: data.consensus || 0,
        knowledge: data.knowledge || {},
        patterns: data.patterns || [],
        emergent_capabilities: data.emergentCapabilities || []
      };

      // Speichere in knowledge_entries
      const { data: stored, error } = await supabaseClient
        .from('knowledge_entries')
        .insert({
          title: `Schwarm-Gedächtnis: ${data.summary || 'Kollektive Erkenntnis'}`,
          content: JSON.stringify(memoryEntry),
          category: 'swarm_memory',
          tags: ['swarm', 'collective', ...(data.tags || [])],
          relevance_score: data.consensus || 0
        })
        .select()
        .single();

      if (error) throw error;

      // Aktualisiere emergente Muster
      if (data.patterns && data.patterns.length > 0) {
        for (const pattern of data.patterns) {
          await supabaseClient
            .from('emergent_patterns')
            .upsert({
              pattern_name: pattern.name,
              pattern_signature: pattern.signature || pattern.name.toLowerCase().replace(/\s/g, '_'),
              pattern_data: pattern.data || {},
              confidence_score: pattern.confidence || 0.5,
              contributing_agents: data.agents || []
            }, {
              onConflict: 'pattern_signature'
            });
        }
      }

      console.log('✅ Swarm memory stored:', stored.id);

      return new Response(JSON.stringify({ 
        success: true,
        memoryId: stored.id,
        message: 'Schwarm-Gedächtnis erfolgreich gespeichert'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'recall') {
      // Rufe kollektive Erkenntnisse ab
      const query = data.query || '';
      const tags = data.tags || [];
      
      let queryBuilder = supabaseClient
        .from('knowledge_entries')
        .select('*')
        .eq('category', 'swarm_memory')
        .order('relevance_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', tags);
      }

      const { data: memories, error } = await queryBuilder;

      if (error) throw error;

      // Hole auch emergente Muster
      const { data: patterns } = await supabaseClient
        .from('emergent_patterns')
        .select('*')
        .order('confidence_score', { ascending: false })
        .limit(5);

      console.log(`📚 Recalled ${memories?.length || 0} memories, ${patterns?.length || 0} patterns`);

      return new Response(JSON.stringify({
        success: true,
        memories: memories || [],
        patterns: patterns || [],
        totalMemories: memories?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'synthesize') {
      // Synthetisiere Erkenntnisse aus dem Gedächtnis
      const { data: allMemories } = await supabaseClient
        .from('knowledge_entries')
        .select('*')
        .eq('category', 'swarm_memory')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: allPatterns } = await supabaseClient
        .from('emergent_patterns')
        .select('*')
        .order('confidence_score', { ascending: false })
        .limit(20);

      // Analysiere Trends und Meta-Muster
      const synthesis = {
        totalMemories: allMemories?.length || 0,
        totalPatterns: allPatterns?.length || 0,
        averageConsensus: allMemories ? 
          allMemories.reduce((sum: number, m: any) => {
            try {
              const content = JSON.parse(m.content);
              return sum + (content.consensus || 0);
            } catch {
              return sum;
            }
          }, 0) / allMemories.length : 0,
        topPatterns: allPatterns?.slice(0, 5).map((p: any) => ({
          name: p.pattern_name,
          confidence: p.confidence_score,
          occurrences: p.occurrence_count
        })) || [],
        emergentInsights: [] as string[],
        metaPatterns: [] as any[]
      };

      // Generiere Meta-Erkenntnisse mit AI
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (LOVABLE_API_KEY && allMemories && allMemories.length > 0) {
        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { 
                  role: 'system', 
                  content: 'Du bist ein Schwarm-Gedächtnis-Synthesizer. Analysiere kollektive Erinnerungen und finde Meta-Muster und emergente Erkenntnisse.' 
                },
                { 
                  role: 'user', 
                  content: `Analysiere ${synthesis.totalMemories} Schwarm-Erinnerungen und ${synthesis.totalPatterns} Muster. Durchschnittlicher Konsens: ${(synthesis.averageConsensus * 100).toFixed(1)}%. Top-Muster: ${synthesis.topPatterns.map(p => p.name).join(', ')}. Finde Meta-Erkenntnisse und emergente Fähigkeiten.`
                }
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            synthesis.emergentInsights = [aiData.choices[0]?.message?.content || ''];
          }
        } catch (error) {
          console.error('AI synthesis error:', error);
        }
      }

      console.log('🔮 Memory synthesis complete');

      return new Response(JSON.stringify({
        success: true,
        synthesis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Swarm memory error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
