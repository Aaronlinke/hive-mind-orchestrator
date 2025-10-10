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
      .gte('confidence', 0.3)
      .order('confidence', { ascending: false })
      .limit(50);

    // Enhanced pattern matching with keyword extraction
    const implications: string[] = [];
    const matchedPatterns: any[] = [];
    
    // Extract keywords for better matching
    const keywords = extractKeywords(request);
    console.log("🔍 Extracted keywords:", keywords);

    // Match against existing patterns
    for (const pattern of patterns || []) {
      const regex = new RegExp(pattern.pattern, 'i');
      if (regex.test(request)) {
        implications.push(...pattern.implications);
        matchedPatterns.push(pattern);
      }
    }

    // Dynamic pattern generation if no matches found
    if (matchedPatterns.length === 0) {
      console.log("⚡ Generating dynamic patterns from keywords...");
      for (const keyword of keywords) {
        const dynamicImplications = generateImplicationsFromKeyword(keyword);
        implications.push(...dynamicImplications);
      }
    }

    // Analyze historical context
    const historicalInsights = await analyzeHistory(history || []);
    
    // Generate prognostic analysis with improved confidence
    const prognosis = {
      immediateNeeds: [...new Set(implications.length > 0 ? implications : ["Informationsanfrage", "Problemlösung", "Wissenssuche"])],
      matchedPatterns,
      historicalInsights,
      confidence: calculateConfidence(matchedPatterns, keywords.length),
      recommendations: generateRecommendations(matchedPatterns, historicalInsights, keywords)
    };

    // Store analysis for learning
    try {
      await supabase.from('semantic_patterns').insert({
        pattern: request.substring(0, 200),
        implications: prognosis.immediateNeeds,
        confidence: prognosis.confidence,
        context: { prognosis, context, keywords }
      }).select().single();
    } catch (insertError) {
      console.log("ℹ️ Pattern storage skipped:", insertError);
    }

    return new Response(
      JSON.stringify(prognosis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Semantic reasoning error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
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

function extractKeywords(text: string): string[] {
  const stopwords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'ist', 'sind', 'kann', 'wie', 'was'];
  const words = text.toLowerCase()
    .replace(/[^\wäöüß\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));
  return [...new Set(words)].slice(0, 10);
}

function generateImplicationsFromKeyword(keyword: string): string[] {
  const implications: string[] = [];
  
  // Domain-specific mappings
  if (['energie', 'solar', 'wind', 'strom'].some(k => keyword.includes(k))) {
    implications.push("Energieeffizienz", "Nachhaltigkeit", "Technische Lösungen");
  }
  if (['geschäft', 'business', 'unternehmen', 'firma'].some(k => keyword.includes(k))) {
    implications.push("Geschäftsoptimierung", "ROI-Analyse", "Strategische Planung");
  }
  if (['forschung', 'wissenschaft', 'studie', 'analyse'].some(k => keyword.includes(k))) {
    implications.push("Wissenschaftliche Methodik", "Datenanalyse", "Hypothesenbildung");
  }
  if (['problem', 'lösung', 'help', 'hilfe'].some(k => keyword.includes(k))) {
    implications.push("Problemlösung", "Lösungsfindung", "Handlungsempfehlung");
  }
  
  return implications.length > 0 ? implications : ["Allgemeine Anfrage"];
}

function calculateConfidence(patterns: any[], keywordCount: number): number {
  if (patterns.length === 0) {
    // Base confidence on keyword extraction quality
    return Math.min(0.5 + (keywordCount * 0.05), 0.75);
  }
  const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
  return Math.min(avgConfidence * 1.2, 1.0);
}

function generateRecommendations(patterns: any[], insights: any, keywords: string[]): string[] {
  const recommendations: string[] = [];
  
  if (patterns.length > 0) {
    recommendations.push(`Basierend auf ${patterns.length} erkannten Mustern: Proaktive Vorbereitung empfohlen`);
  }
  
  if (insights.frequentPatterns.length > 0) {
    recommendations.push(`Häufigste Interaktionen: ${insights.frequentPatterns[0][0]} (${insights.frequentPatterns[0][1]}x)`);
  }

  if (keywords.length > 5) {
    recommendations.push(`Komplexe Anfrage mit ${keywords.length} Schlüsselwörtern - Multi-Dimensionale Analyse erforderlich`);
  }

  return recommendations.length > 0 ? recommendations : ["Standard-Analyse durchführen"];
}
