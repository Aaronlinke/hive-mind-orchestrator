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

    const { action } = await req.json();

    if (action === 'detect-patterns') {
      // Analyze agent collaborations
      const { data: collabs } = await supabase
        .from('agent_collaborations')
        .select('*')
        .gte('synergy_score', 0.7);

      // Analyze evolution history
      const { data: history } = await supabase
        .from('evolution_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const patterns = [];

      // Pattern 1: High-synergy agent pairs
      if (collabs && collabs.length > 0) {
        const topPairs = collabs.slice(0, 5);
        patterns.push({
          pattern_name: 'high_synergy_collaboration',
          pattern_signature: topPairs.map(c => `${c.agent_a}-${c.agent_b}`).join('|'),
          occurrence_count: topPairs.reduce((sum, c) => sum + c.interaction_count, 0),
          confidence_score: topPairs.reduce((sum, c) => sum + c.synergy_score, 0) / topPairs.length,
          contributing_agents: [...new Set(topPairs.flatMap(c => [c.agent_a, c.agent_b]))],
          pattern_data: { pairs: topPairs }
        });
      }

      // Pattern 2: Rapid mutation cycles
      if (history && history.length > 10) {
        const recentMutations = history.filter(h => {
          const age = Date.now() - new Date(h.created_at).getTime();
          return age < 24 * 60 * 60 * 1000; // Last 24 hours
        });

        if (recentMutations.length > 5) {
          patterns.push({
            pattern_name: 'rapid_evolution_cycle',
            pattern_signature: `${recentMutations.length}_mutations_24h`,
            occurrence_count: recentMutations.length,
            confidence_score: Math.min(recentMutations.length / 10, 1),
            contributing_agents: ['system'],
            pattern_data: { mutations: recentMutations }
          });
        }
      }

      // Pattern 3: Fitness score improvement trend
      if (history && history.length > 5) {
        const fitnessScores = history
          .filter(h => h.fitness_score)
          .map(h => h.fitness_score)
          .slice(0, 10);
        
        if (fitnessScores.length > 3) {
          const avgRecent = fitnessScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const avgOlder = fitnessScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
          
          if (avgRecent > avgOlder * 1.1) {
            patterns.push({
              pattern_name: 'fitness_improvement_trend',
              pattern_signature: `${avgRecent.toFixed(2)}_vs_${avgOlder.toFixed(2)}`,
              occurrence_count: 1,
              confidence_score: Math.min((avgRecent - avgOlder) / avgOlder, 1),
              contributing_agents: ['evolution-engine'],
              pattern_data: { avgRecent, avgOlder, improvement: ((avgRecent - avgOlder) / avgOlder * 100).toFixed(1) }
            });
          }
        }
      }

      // Store or update patterns
      for (const pattern of patterns) {
        const { data: existing } = await supabase
          .from('emergent_patterns')
          .select('*')
          .eq('pattern_name', pattern.pattern_name)
          .single();

        if (existing) {
          await supabase
            .from('emergent_patterns')
            .update({
              occurrence_count: existing.occurrence_count + 1,
              confidence_score: (existing.confidence_score + pattern.confidence_score) / 2,
              last_seen: new Date().toISOString(),
              pattern_data: pattern.pattern_data
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('emergent_patterns')
            .insert(pattern);
        }
      }

      // Add to feed
      if (patterns.length > 0) {
        await supabase.from('evolution_feed').insert({
          event_type: 'patterns_detected',
          event_data: { patternCount: patterns.length, patterns: patterns.map(p => p.pattern_name) },
          generation: 0
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        patternsDetected: patterns.length,
        patterns 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Pattern recognition error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});