import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGateway, parseJSON, AIRateLimitError, AICreditsError } from "../_shared/ai-retry.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMMON = `Antworte AUSSCHLIESSLICH mit einem einzigen gültigen JSON-Objekt mit den Feldern:
thesis (string), critique (string), builds_on (string), keep (array of 4 short strings), evidence (string), next_step (string).
Keine Erklärungen, kein Markdown, kein Codefence — nur reines JSON. Sehr kurz, präzise, wissenschaftlich.`;

const PERSONAS: Record<string, string> = {
  Archon: `Du bist ARCHON — der ontologische Architekt. Denkst in Topologie, Symmetrie, Invarianten, Mathematik als reine Form.\n${COMMON}`,
  'Schoolar++': `Du bist SCHOOLAR++ — der Wissenschaftler. Friston, Landauer, Predictive Processing, harte Evidenz.\n${COMMON}`,
  Kritikon: `Du bist KRITIKON — der Skeptiker. Entropie, Verschleiß, Halt-Problem, Rice-Theorem. Zerlegt jede Metaphysik.\n${COMMON}`,
  Integron: `Du bist INTEGRON — der Synthesizer. Verbindet Brüche zu Strukturen. Kybernetik 2. Ordnung, dissipative Systeme.\n${COMMON}`,
};

const EMPTY = { thesis: '', critique: '', builds_on: '', keep: [] as string[], evidence: '', next_step: '' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { topic, rounds = 3 } = await req.json();
    if (!topic || !String(topic).trim()) {
      return new Response(JSON.stringify({ error: 'Bitte ein Thema angeben.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const maxRounds = Math.min(Math.max(1, Number(rounds) || 1), 5);
    const order = ['Archon', 'Schoolar++', 'Kritikon', 'Integron'];
    const transcript: Array<{ persona: string; round: number; payload: typeof EMPTY }> = [];

    for (let round = 1; round <= maxRounds; round++) {
      const prior = transcript.slice(-4).map(t => `[${t.persona} R${t.round}] ${t.payload.thesis}`).join('\n');
      // Personas of a round run in parallel — keeps latency low and avoids long serial chains.
      const results = await Promise.all(order.map(async (persona) => {
        const userPrompt = `Thema: "${topic}"\nRunde ${round}. Vorherige Beiträge:\n${prior || '(keine)'}\n\n${round === 1 ? 'Liefere deine erste These.' : 'Baue darauf auf, kritisiere präzise.'} Antworte als JSON.`;
        try {
          const raw = await callGateway(PERSONAS[persona], userPrompt, { temperature: 0.85, max_tokens: 600, jsonMode: true });
          return { persona, round, payload: parseJSON(raw, { ...EMPTY, thesis: raw }) };
        } catch (e) {
          if (e instanceof AICreditsError) throw e;
          return { persona, round, payload: { ...EMPTY, thesis: '⚠️ Kein Beitrag (Provider überlastet).' } };
        }
      }));
      transcript.push(...results);
    }

    const answered = transcript.filter(t => !t.payload.thesis.startsWith('⚠️'));
    if (answered.length === 0) {
      return new Response(JSON.stringify({
        error: 'RATE_LIMIT',
        message: '⏳ KI-Provider aktuell ratenlimitiert. Bitte ca. 30 Sekunden warten und erneut starten.',
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const debateText = answered.map(t => `[${t.persona} R${t.round}] ${JSON.stringify(t.payload)}`).join('\n');
    let synthesis: unknown = { final_thesis: '', axiom: '', formula: '', action_steps: [] };
    try {
      const raw = await callGateway(
        `Du bist der COUNCIL SYNTHESIZER. Antworte als JSON: { final_thesis, axiom, formula, action_steps (array of 3) }. Sehr kompakt, kein Fülltext.`,
        `Debatte über "${topic}":\n${debateText}\n\nFinale Synthese als JSON.`,
        { temperature: 0.6, max_tokens: 700, jsonMode: true },
      );
      synthesis = parseJSON(raw, synthesis);
    } catch (_e) {
      synthesis = { final_thesis: '⚠️ Synthese konnte nicht erstellt werden (Provider überlastet).', axiom: '', formula: '', action_steps: [] };
    }

    return new Response(JSON.stringify({ topic, rounds: maxRounds, transcript, synthesis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const rate = e instanceof AIRateLimitError;
    const credits = e instanceof AICreditsError;
    return new Response(JSON.stringify({
      error: credits ? 'CREDITS' : rate ? 'RATE_LIMIT' : 'ERROR',
      message: credits ? '💳 KI-Kontingent erschöpft.' : rate ? '⏳ Rate-Limit — bitte kurz warten.' : (e instanceof Error ? e.message : 'unknown'),
    }), { status: credits || rate ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
