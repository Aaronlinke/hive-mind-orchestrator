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
    const { description, context, type } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate visual concept using AI
    const conceptPrompt = buildConceptPrompt(description, context, type);
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a visual design expert. Generate detailed visual concepts including layout, color schemes, typography, and composition.'
          },
          {
            role: 'user',
            content: conceptPrompt
          }
        ]
      })
    });

    const aiResult = await aiResponse.json();
    const concept = aiResult.choices[0].message.content;

    // Store visual concept
    const { data: visualConcept } = await supabase
      .from('visual_concepts')
      .insert({
        description,
        concept_type: type || 'general',
        generated_concept: concept,
        context_data: context || {}
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ concept: visualConcept }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Visual concept generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildConceptPrompt(description: string, context: any, type: string): string {
  let prompt = `Create a detailed visual concept for: ${description}\n\n`;
  
  if (type === 'ui') {
    prompt += 'Focus on:\n- Layout structure and hierarchy\n- Color palette and theming\n- Typography choices\n- Interactive elements\n- Spacing and whitespace\n';
  } else if (type === 'data-viz') {
    prompt += 'Focus on:\n- Chart type selection\n- Data representation\n- Color coding\n- Labels and legends\n- Interactive features\n';
  } else if (type === 'branding') {
    prompt += 'Focus on:\n- Brand identity\n- Visual style\n- Color psychology\n- Logo concepts\n- Brand guidelines\n';
  }

  if (context) {
    prompt += `\nContext: ${JSON.stringify(context)}`;
  }

  return prompt;
}
