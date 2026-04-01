import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map simplified model names to Lovable AI gateway model names
const LOVABLE_MODEL_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'google/gemini-2.5-flash',
  'gemini-2.5-pro': 'google/gemini-2.5-pro',
  'gemini-2.0-flash': 'google/gemini-2.5-flash',
  'gemini-1.5-pro': 'google/gemini-2.5-pro',
  'gemini-1.5-flash': 'google/gemini-2.5-flash',
};

// Map simplified model names to raw Gemini API model names
const GEMINI_MODEL_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-2.0-flash',
  'gemini-2.5-pro': 'gemini-1.5-pro',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
};

async function callLovableAI(prompt: string, systemPrompt: string | undefined, model: string, temperature: number): Promise<{ text: string; model: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY nicht konfiguriert');

  const resolvedModel = LOVABLE_MODEL_MAP[model] || 'google/gemini-2.5-flash';
  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature,
      max_tokens: 16384,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Lovable AI error:', response.status, errText);
    if (response.status === 429) {
      throw new Error('Rate-Limit erreicht. Bitte einen Moment warten und erneut versuchen.');
    }
    if (response.status === 402) {
      throw new Error('AI-Kontingent erschöpft. Bitte Credits aufladen.');
    }
    throw new Error(`AI Gateway Fehler: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { text, model: resolvedModel };
}

async function callGeminiDirect(prompt: string, systemPrompt: string | undefined, model: string, temperature: number): Promise<{ text: string; model: string; usage?: any }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_API_KEY) throw new Error('NO_GEMINI_KEY');

  const resolvedModel = GEMINI_MODEL_MAP[model] || 'gemini-2.0-flash';

  const contents = [];
  if (systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: 'Verstanden. Ich werde entsprechend deiner Anweisung antworten.' }] });
  }
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 16384,
          responseMimeType: 'text/plain',
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', response.status, error);
    throw new Error(`GEMINI_${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error('Keine Antwort von der KI erhalten');
  if (candidate.finishReason === 'SAFETY') throw new Error('SAFETY_BLOCKED');

  const text = candidate.content?.parts?.[0]?.text || '';
  return { text, model: resolvedModel, usage: data.usageMetadata };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt, model = "gemini-2.5-flash", temperature = 0.9 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Kein Prompt angegeben.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strategy: Try Gemini direct first, fallback to Lovable AI Gateway on quota/rate errors
    let result: { text: string; model: string; usage?: any };

    try {
      result = await callGeminiDirect(prompt, systemPrompt, model, temperature);
    } catch (directError: any) {
      const msg = directError.message || '';
      // Fallback to Lovable AI on: no key, rate limit, quota, model not found
      if (msg.includes('NO_GEMINI_KEY') || msg.includes('GEMINI_429') || msg.includes('GEMINI_4')) {
        console.log('Gemini direct failed, falling back to Lovable AI Gateway...');
        try {
          const lovResult = await callLovableAI(prompt, systemPrompt, model, temperature);
          result = { text: lovResult.text, model: `${lovResult.model} (gateway)` };
        } catch (lovError: any) {
          // If Lovable AI also fails, return the error
          const errMsg = lovError.message || 'KI-Anfrage fehlgeschlagen';
          const status = errMsg.includes('Rate-Limit') ? 429 : errMsg.includes('Kontingent') ? 402 : 500;
          return new Response(
            JSON.stringify({ error: errMsg }),
            { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (msg === 'SAFETY_BLOCKED') {
        return new Response(
          JSON.stringify({ error: 'Anfrage durch Sicherheitsfilter blockiert. Bitte Formulierung anpassen.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw directError;
      }
    }

    return new Response(
      JSON.stringify({ text: result.text, model: result.model, usage: result.usage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('gemini-free-ai error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unbekannter Fehler aufgetreten' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
