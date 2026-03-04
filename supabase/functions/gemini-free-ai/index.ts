import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Model mapping: translate simplified names to actual Gemini API models
const MODEL_MAP: Record<string, string> = {
  'gemini-2.5-flash': 'gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro': 'gemini-2.5-pro-preview-06-05',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt, model = "gemini-2.5-flash", temperature = 0.9 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY nicht konfiguriert. Bitte API-Key in den Einstellungen hinterlegen.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Kein Prompt angegeben.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve model name
    const resolvedModel = MODEL_MAP[model] || model;
    
    // Build contents array
    const contents = [];
    
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Verstanden. Ich werde entsprechend deiner Anweisung antworten.' }]
      });
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate-Limit erreicht. Bitte einen Moment warten und erneut versuchen.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 400) {
        // Try fallback model
        console.log('Trying fallback model gemini-1.5-pro...');
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }],
              generationConfig: { temperature, topK: 40, topP: 0.95, maxOutputTokens: 8192 }
            })
          }
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const text = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return new Response(
            JSON.stringify({ text, model: 'gemini-1.5-pro (fallback)', usage: fallbackData.usageMetadata }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      throw new Error(`Gemini API Fehler: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle finish reasons
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error('Keine Antwort von der KI erhalten');
    }
    
    if (candidate.finishReason === 'SAFETY') {
      return new Response(
        JSON.stringify({ error: 'Anfrage durch Sicherheitsfilter blockiert. Bitte Formulierung anpassen.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const text = candidate.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ text, model: resolvedModel, usage: data.usageMetadata }),
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
