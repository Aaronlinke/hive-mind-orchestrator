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

    if (action === 'load' || action === 'develop') {
      // Entwickle neue Skill
      const { data: newSkill, error } = await supabase
        .from('skill_development')
        .insert({
          skill_name: input?.skillName || skillId,
          skill_category: input?.category || 'general',
          proficiency_level: 0.5,
          usage_count: 0,
          learning_resources: input?.learningResources || []
        })
        .select()
        .single();

      if (error) {
        console.error('Skill creation error:', error);
      }

      return new Response(
        JSON.stringify({ message: 'Skill entwickelt', skill: newSkill, success: !error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'execute' || action === 'use') {
      // Führe Skill aus und verbessere Proficiency
      const queryText = typeof input === 'string' ? input : (input?.query || '');
      const category = input?.category || 'general';
      
      const { data: skills } = await supabase
        .from('skill_development')
        .select('*')
        .eq('skill_category', category);

      const skill = skills?.[0];
      
      if (skill) {
        // Update usage und erhöhe Proficiency
        const newProficiency = Math.min((skill.proficiency_level || 0.5) + 0.05, 1.0);
        
        await supabase
          .from('skill_development')
          .update({
            last_used: new Date().toISOString(),
            usage_count: (skill.usage_count || 0) + 1,
            proficiency_level: newProficiency
          })
          .eq('id', skill.id);
      }

      const result = {
        executed: true,
        skill: skill?.skill_name || 'general',
        proficiency: skill?.proficiency_level || 0.5,
        input
      };

      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      const { data: skills } = await supabase
        .from('skill_development')
        .select('*')
        .order('proficiency_level', { ascending: false });

      return new Response(
        JSON.stringify({ skills }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'analyze') {
      // Analysiere Skills und liefere Erkenntnisse
      const queryText = typeof input === 'string' ? input.toLowerCase() : (input?.query || '').toLowerCase();
      
      const { data: allSkills } = await supabase
        .from('skill_development')
        .select('*');

      // Finde relevante Skills basierend auf Query
      const relevantSkills = allSkills?.filter(s => {
        const category = s.skill_category.toLowerCase();
        const name = s.skill_name.toLowerCase();
        return queryText.includes(category) || queryText.includes(name) || 
               category.includes(queryText) || name.includes(queryText);
      }) || [];

      const analysis = {
        totalSkills: allSkills?.length || 0,
        relevantSkills: relevantSkills.map(s => ({
          name: s.skill_name,
          category: s.skill_category,
          proficiency: s.proficiency_level,
          usageCount: s.usage_count
        })),
        avgProficiency: allSkills?.reduce((acc, s) => 
          acc + (s.proficiency_level || 0), 0) / (allSkills?.length || 1),
        topSkills: allSkills?.sort((a, b) => 
          (b.proficiency_level || 0) - (a.proficiency_level || 0)
        ).slice(0, 5) || []
      };

      return new Response(
        JSON.stringify(analysis),
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
