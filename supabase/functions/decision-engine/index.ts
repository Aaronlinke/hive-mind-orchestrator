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
    const { request, systemState, source, history } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Evaluate priority
    const priorityScore = evaluatePriority(request, source);

    // Get available resources
    const { data: availableResources } = await supabase
      .from('ai_learning_history')
      .select('ai_node_type, success_score')
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate resource scores
    const resourceScores = calculateResourceScores(availableResources || [], request);

    // Evaluate risk
    const riskScore = evaluateRisk(request, resourceScores);

    // Apply contextual heuristics
    const contextualBoost = applyContextualHeuristics(source, history || []);

    // Make final decision
    const decision = {
      delegationStrategy: selectBestStrategy(priorityScore, resourceScores, riskScore, contextualBoost),
      priorityScore,
      riskScore,
      contextualBoost,
      recommendedNode: resourceScores[0]?.nodeType || 'director',
      confidence: calculateDecisionConfidence(priorityScore, riskScore, contextualBoost),
      reasoning: generateReasoning(priorityScore, resourceScores, riskScore)
    };

    // Store decision context
    await supabase.from('decision_contexts').insert({
      request_summary: JSON.stringify(request).substring(0, 500),
      system_state: systemState,
      decision_strategy: decision.delegationStrategy,
      priority_score: priorityScore,
      risk_score: riskScore,
      confidence: decision.confidence
    });

    return new Response(
      JSON.stringify(decision),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Decision engine error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function evaluatePriority(request: any, source: string): number {
  let score = 0.5;
  
  const urgentKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately'];
  const requestStr = JSON.stringify(request).toLowerCase();
  
  for (const keyword of urgentKeywords) {
    if (requestStr.includes(keyword)) {
      score += 0.1;
    }
  }

  if (source === 'orchestrator') {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

function calculateResourceScores(resources: any[], request: any) {
  const nodePerformance = new Map<string, { totalScore: number; count: number }>();

  for (const resource of resources) {
    const existing = nodePerformance.get(resource.ai_node_type) || { totalScore: 0, count: 0 };
    nodePerformance.set(resource.ai_node_type, {
      totalScore: existing.totalScore + (resource.success_score || 0),
      count: existing.count + 1
    });
  }

  return Array.from(nodePerformance.entries())
    .map(([nodeType, stats]) => ({
      nodeType,
      avgScore: stats.totalScore / stats.count,
      reliability: stats.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function evaluateRisk(request: any, resourceScores: any[]): number {
  let risk = 0.3;

  if (resourceScores.length === 0) {
    risk += 0.3;
  }

  const requestStr = JSON.stringify(request).toLowerCase();
  const riskKeywords = ['delete', 'remove', 'critical', 'production'];
  
  for (const keyword of riskKeywords) {
    if (requestStr.includes(keyword)) {
      risk += 0.1;
    }
  }

  return Math.min(risk, 1.0);
}

function applyContextualHeuristics(source: string, history: any[]): number {
  let boost = 0;

  if (source === 'orchestrator') {
    boost += 0.3;
  }

  if (history.length > 10) {
    boost += 0.1;
  }

  return boost;
}

function selectBestStrategy(priority: number, resourceScores: any[], risk: number, boost: number): string {
  const totalScore = priority + boost - risk;

  if (totalScore > 0.8 && resourceScores.length > 0) {
    return 'immediate-delegation';
  } else if (totalScore > 0.5) {
    return 'evaluated-delegation';
  } else if (risk > 0.6) {
    return 'cautious-review';
  } else {
    return 'standard-process';
  }
}

function calculateDecisionConfidence(priority: number, risk: number, boost: number): number {
  return Math.max(0, Math.min(1, (priority + boost) / (1 + risk)));
}

function generateReasoning(priority: number, resourceScores: any[], risk: number): string[] {
  const reasons: string[] = [];

  if (priority > 0.7) {
    reasons.push('High priority request detected');
  }

  if (resourceScores.length > 0) {
    reasons.push(`Best resource: ${resourceScores[0].nodeType} (score: ${resourceScores[0].avgScore.toFixed(2)})`);
  }

  if (risk > 0.6) {
    reasons.push('Risk level requires careful handling');
  }

  return reasons;
}
