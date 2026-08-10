import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGateway, AIRateLimitError, AICreditsError } from "../_shared/ai-retry.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildConceptPrompt(description: string, context: unknown, type: string): string {
  let prompt = `Erstelle ein konkretes visuelles Konzept für: ${description}\n\n`;
  if (type === 'ui') prompt += 'Fokus:\n- Layout & Hierarchie\n- Farbpalette\n- Typografie\n- Interaktive Elemente\n- Spacing\n';
  else if (type === 'data-viz') prompt += 'Fokus:\n- Chart-Typ\n- Datenrepräsentation\n- Farbcodierung\n- Labels/Legenden\n';
  else if (type === 'branding') prompt += 'Fokus:\n- Brand Identity\n- Visueller Stil\n- Farbpsychologie\n- Logo-Konzept\n';
  if (context && Object.keys(context as object).length) prompt += `\nKontext: ${JSON.stringify(context)}`;
  prompt += '\nMax. 5 kompakte Stichpunkte, keine Floskeln.';
  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { description, context, type, request } = await req.json();
    const effectiveDescription = description || request || 'Visual concept';
    const effectiveContext = context || {};
    const effectiveType = type || 'general';

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    let concept: string;
    try {
      concept = await callGateway(
        'Du bist Experte für visuelles Design. Liefere präzise, umsetzbare Konzepte — Layout, Farben, Typografie, Komposition. Keine Füllsätze.',
        buildConceptPrompt(effectiveDescription, effectiveContext, effectiveType),
        { temperature: 0.7, max_tokens: 900 },
      );
    } catch (e) {
      const rate = e instanceof AIRateLimitError;
      const credits = e instanceof AICreditsError;
      // Never hard-fail the orchestrator: return a 200 with a clear notice.
      return new Response(JSON.stringify({
        concept: null,
        unavailable: true,
        message: credits
          ? '💳 KI-Kontingent erschöpft — visuelles Konzept nicht erstellt.'
          : rate
            ? '⏳ Provider ratenlimitiert — visuelles Konzept übersprungen.'
            : (e instanceof Error ? e.message : 'Unbekannter Fehler'),
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: visualConcept } = await supabase
      .from('visual_concepts')
      .insert({
        description: effectiveDescription,
        concept_type: effectiveType,
        generated_concept: concept,
        context_data: effectiveContext,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ concept: visualConcept ?? { generated_concept: concept, description: effectiveDescription, concept_type: effectiveType } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Visual concept generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
