import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

async function callAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY missing');
  const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  });
  if (!r.ok) {
    if (r.status === 429) throw new Error('Rate-Limit');
    if (r.status === 402) throw new Error('Credits aufgebraucht');
    throw new Error(`AI ${r.status}`);
  }
  const d = await r.json();
  const content = d.choices?.[0]?.message?.content || '{}';
  try { return JSON.parse(content); }
  catch { return { thesis: content, critique: '', builds_on: '', keep: [], evidence: '', next_step: '' }; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { topic, rounds = 3 } = await req.json();
    if (!topic) return new Response(JSON.stringify({ error: 'topic required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const maxRounds = Math.min(Math.max(1, rounds), 5);
    const order = ['Archon', 'Schoolar++', 'Kritikon', 'Integron'];
    const transcript: Array<{ persona: string; round: number; payload: any }> = [];
    let lastContext = `Thema: "${topic}"\nDies ist Runde 1. Liefere deine erste These.`;

    for (let round = 1; round <= maxRounds; round++) {
      for (const persona of order) {
        const prior = transcript.slice(-4).map(t => `[${t.persona} R${t.round}] ${t.payload.thesis}`).join('\n');
        const userPrompt = round === 1
          ? `Thema: "${topic}"\nRunde ${round}. Vorherige Beiträge:\n${prior || '(keine)'}\n\nDeine Antwort als JSON.`
          : `Thema: "${topic}"\nRunde ${round}. Vorherige Beiträge:\n${prior}\n\nBaue darauf auf, kritisiere präzise. JSON.`;
        const payload = await callAI(PERSONAS[persona], userPrompt);
        transcript.push({ persona, round, payload });
      }
    }

    // Final synthesis
    const debateText = transcript.map(t => `[${t.persona} R${t.round}] ${JSON.stringify(t.payload)}`).join('\n');
    const synthRaw = await callAI(
      `Du bist der COUNCIL SYNTHESIZER. Antworte als JSON: { final_thesis, axiom, formula, action_steps (array of 3) }. Sehr kompakt, kein Fülltext.`,
      `Debatte über "${topic}":\n${debateText}\n\nFinale Synthese als JSON.`,
    );

    return new Response(JSON.stringify({ topic, rounds: maxRounds, transcript, synthesis: synthRaw }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});