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
    const { request, context, history } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load semantic patterns
    const { data: patterns } = await supabase
      .from('semantic_patterns')
      .select('*')
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false });

    // Analyze request against patterns
    const implications: string[] = [];
    const matchedPatterns: any[] = [];

    for (const pattern of patterns || []) {
      const regex = new RegExp(pattern.pattern, 'i');
      if (regex.test(request)) {
        implications.push(...pattern.implications);
        matchedPatterns.push(pattern);
      }
    }

    // Analyze historical context
    const historicalInsights = await analyzeHistory(history || []);
    
    // Generate prognostic analysis
    const prognosis = {
      immediateNeeds: [...new Set(implications)],
      matchedPatterns,
      historicalInsights,
      confidence: calculateConfidence(matchedPatterns),
      recommendations: generateRecommendations(matchedPatterns, historicalInsights)
    };

    // Store analysis
    await supabase.from('semantic_patterns').insert({
      pattern: request,
      implications: prognosis.immediateNeeds,
      confidence: prognosis.confidence,
      context: { prognosis, context }
    });

    return new Response(
      JSON.stringify(prognosis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Semantic reasoning error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeHistory(history: any[]) {
  const patterns = new Map<string, number>();
  
  for (const item of history) {
    const key = item.type || 'unknown';
    patterns.set(key, (patterns.get(key) || 0) + 1);
  }

  return {
    frequentPatterns: Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    totalInteractions: history.length
  };
}

function calculateConfidence(patterns: any[]): number {
  if (patterns.length === 0) return 0;
  const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
  return Math.min(avgConfidence * 1.2, 1.0);
}

function generateRecommendations(patterns: any[], insights: any): string[] {
  const recommendations: string[] = [];
  
  if (patterns.length > 0) {
    recommendations.push(`Based on ${patterns.length} matched patterns, consider proactive preparation`);
  }
  
  if (insights.frequentPatterns.length > 0) {
    recommendations.push(`Historical data shows frequent ${insights.frequentPatterns[0][0]} requests`);
  }

  return recommendations;
}
