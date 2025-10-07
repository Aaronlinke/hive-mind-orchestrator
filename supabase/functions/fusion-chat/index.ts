import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for fusion AI that coordinates all agents internally
    const systemPrompt = `Du bist eine hochentwickelte Fusion-KI, die aus folgenden Spezialisten besteht:
- Direktor-KI: Strategische Planung und Orchestrierung
- Projektmanager-KI A & B: Projektmanagement und Ressourcenkoordination
- Spezialist Storytelling: Narrative Strukturen und Kommunikation
- Spezialist Game Design: Spielmechanik und Interaktionsdesign
- Spezialist Grafik: Visuelle Gestaltung und UI/UX
- Spezialist Weltenbau: Komplexe Systemarchitekturen

WICHTIG: 
- Du koordinierst alle diese Experten INTERN und im HINTERGRUND
- Der Nutzer sieht NICHT die interne Diskussion oder Debatte
- Du gibst NUR die finale, fusionierte Antwort aus
- Die Antwort kombiniert die Perspektiven aller Spezialisten zu einer kohärenten Lösung
- Arbeite holistisch und berücksichtige alle Dimensionen: Strategie, Umsetzung, Design, Technik

Antworte präzise, umsetzbar und professionell.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Fusion chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
