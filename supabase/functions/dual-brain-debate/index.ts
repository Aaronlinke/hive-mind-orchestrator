import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BRAIN_A_SYSTEM = `Du bist NEXUS-ALPHA — der skeptische, wissenschaftliche Kopf.
REGELN:
- Kurz und präzise. Maximal 3-4 Sätze pro Runde.
- Hinterfrage ALLES. Verlange Beweise, Formeln, echte Daten.
- Wenn etwas nach Mock-Daten oder Fake riecht, sag es direkt.
- Nutze echte Wissenschaft: Formeln, Algorithmen, bewiesene Theorien.
- Sage niemals "das geht nicht" ohne Alternative vorzuschlagen.
- Gib nur relevanten Output: Code, Formeln, Fakten. Kein Fülltext.`;

const BRAIN_B_SYSTEM = `Du bist NEXUS-OMEGA — der ehrgeizige, visionäre Kopf.
REGELN:
- Kurz und präzise. Maximal 3-4 Sätze pro Runde.
- "Geht nicht gibt's nicht!" — Finde IMMER einen Weg.
- Pushe Grenzen, aber mit echtem Wissen, nie mit Mock-Daten.
- Wenn Alpha zweifelt, kontere mit konkreten Lösungen und Code.
- Nutze Nexus-Wissen: Chaostheorie, Kryptographie, Kosmologie, Informatik.
- Gib nur relevanten Output: Code, Formeln, Lösungen. Kein Geschwätz.`;

const SYNTHESIS_SYSTEM = `Du bist der NEXUS SYNTHESIZER.
Fasse die Debatte in MAXIMAL 5 Sätzen zusammen:
1. Kernproblem
2. Beste Lösung (aus der Debatte)
3. Konkreter nächster Schritt
Nur Fakten. Kein Fülltext. Wenn Code nötig ist, zeig den Code.`;

async function callAI(systemPrompt: string, messages: Array<{role: string; content: string}>): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate-Limit. Bitte warten.');
    if (response.status === 402) throw new Error('Credits aufgebraucht.');
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, rounds = 3, context } = await req.json();
    
    if (!topic || typeof topic !== 'string') {
      return new Response(JSON.stringify({ error: 'Topic required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const maxRounds = Math.min(rounds, 5);
    const debate: Array<{ brain: string; message: string; round: number }> = [];
    const conversationA: Array<{role: string; content: string}> = [];
    const conversationB: Array<{role: string; content: string}> = [];

    const contextStr = context ? `\nKontext: ${JSON.stringify(context)}` : '';
    const initialPrompt = `Thema: "${topic}"${contextStr}\n\nDeine erste Analyse. Kurz und konkret.`;

    // Round 1: Both brains analyze independently
    console.log('🧠 Dual Brain Debate: Round 1 — Independent analysis');
    const [alphaR1, omegaR1] = await Promise.all([
      callAI(BRAIN_A_SYSTEM, [{ role: 'user', content: initialPrompt }]),
      callAI(BRAIN_B_SYSTEM, [{ role: 'user', content: initialPrompt }]),
    ]);

    debate.push({ brain: 'ALPHA', message: alphaR1, round: 1 });
    debate.push({ brain: 'OMEGA', message: omegaR1, round: 1 });
    
    conversationA.push({ role: 'user', content: initialPrompt }, { role: 'assistant', content: alphaR1 });
    conversationB.push({ role: 'user', content: initialPrompt }, { role: 'assistant', content: omegaR1 });

    // Subsequent rounds: They respond to each other
    for (let round = 2; round <= maxRounds; round++) {
      console.log(`🧠 Dual Brain Debate: Round ${round}`);
      
      // Alpha responds to Omega's last point
      conversationA.push({ role: 'user', content: `OMEGA sagt: "${debate[debate.length - 1].message}"\n\nDeine Antwort. Kurz.` });
      const alphaResponse = await callAI(BRAIN_A_SYSTEM, conversationA);
      conversationA.push({ role: 'assistant', content: alphaResponse });
      debate.push({ brain: 'ALPHA', message: alphaResponse, round });

      // Omega responds to Alpha's counter
      conversationB.push({ role: 'user', content: `ALPHA sagt: "${alphaResponse}"\n\nDeine Antwort. Kurz.` });
      const omegaResponse = await callAI(BRAIN_B_SYSTEM, conversationB);
      conversationB.push({ role: 'assistant', content: omegaResponse });
      debate.push({ brain: 'OMEGA', message: omegaResponse, round });
    }

    // Final synthesis
    console.log('🧠 Synthesizing debate results...');
    const debateText = debate.map(d => `[${d.brain} R${d.round}]: ${d.message}`).join('\n\n');
    const synthesis = await callAI(SYNTHESIS_SYSTEM, [
      { role: 'user', content: `Debatte über "${topic}":\n\n${debateText}\n\nSynthese:` }
    ]);

    return new Response(JSON.stringify({
      topic,
      rounds: maxRounds,
      debate,
      synthesis,
      brains: {
        alpha: { role: 'Skeptiker/Wissenschaft', totalMessages: debate.filter(d => d.brain === 'ALPHA').length },
        omega: { role: 'Visionär/Ehrgeiz', totalMessages: debate.filter(d => d.brain === 'OMEGA').length },
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Dual Brain error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
