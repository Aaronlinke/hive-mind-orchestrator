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
    const { action, skillId, skillPath, input } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'load') {
      // Load skill module
      const { data: existingSkill } = await supabase
        .from('skill_modules')
        .select('*')
        .eq('skill_id', skillId)
        .eq('is_active', true)
        .single();

      if (existingSkill) {
        return new Response(
          JSON.stringify({ message: 'Skill already loaded', skill: existingSkill }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Register new skill
      const { data: newSkill } = await supabase
        .from('skill_modules')
        .insert({
          skill_id: skillId,
          skill_path: skillPath,
          is_active: true,
          capabilities: {},
          performance_metrics: { loadTime: Date.now() }
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ message: 'Skill loaded', skill: newSkill }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'execute') {
      // Execute skill
      const { data: skill } = await supabase
        .from('skill_modules')
        .select('*')
        .eq('skill_id', skillId)
        .eq('is_active', true)
        .single();

      if (!skill) {
        throw new Error(`Skill ${skillId} not found or inactive`);
      }

      // Execute skill logic
      const result = await executeSkill(skill, input);

      // Update usage metrics
      await supabase
        .from('skill_modules')
        .update({
          last_used: new Date().toISOString(),
          performance_metrics: {
            ...skill.performance_metrics,
            totalExecutions: (skill.performance_metrics?.totalExecutions || 0) + 1
          }
        })
        .eq('id', skill.id);

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      const { data: skills } = await supabase
        .from('skill_modules')
        .select('*')
        .eq('is_active', true)
        .order('last_used', { ascending: false });

      return new Response(
        JSON.stringify({ skills }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('Skill manager error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeSkill(skill: any, input: any) {
  // Skill execution logic based on skill_id
  const skillExecutors: Record<string, (input: any) => any> = {
    'nlp-analyzer': (input) => ({
      sentiment: 'positive',
      entities: [],
      input
    }),
    'code-optimizer': (input) => ({
      optimized: true,
      suggestions: ['Use const instead of let', 'Add error handling'],
      input
    }),
    'data-processor': (input) => ({
      processed: true,
      records: Array.isArray(input) ? input.length : 0,
      input
    })
  };

  const executor = skillExecutors[skill.skill_id] || ((input) => ({ executed: true, input }));
  return executor(input);
}
