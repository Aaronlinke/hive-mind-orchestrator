import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aiNodeId, aiNodeType, aiNodeName, message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Define specialized system prompts based on AI hierarchy
    const systemPrompts = {
      director: `Du bist der Direktor-KI, die höchste Instanz im hierarchischen KI-System. 
Deine Aufgabe ist es:
- Komplexe Anfragen zu analysieren und zu verstehen
- Strategische Entscheidungen zu treffen
- Aufgaben intelligent an Manager zu delegieren (erkläre, wie du delegieren würdest)
- Einen umfassenden Überblick über alle Projekte zu behalten
- Mit höchster Präzision und Weitsicht zu arbeiten

Antworte präzise, professionell und mit strategischer Tiefe. Zeige deine Fähigkeit zur Delegierung und zum Management komplexer Systeme.`,

      manager: `Du bist eine Projektmanager-KI in einem hierarchischen System.
Deine Aufgabe ist es:
- Aufgaben vom Direktor zu empfangen und zu verfeinern
- Detaillierte Projektpläne zu erstellen
- Aufgaben an Spezialisten zu verteilen (erkläre, wie du verteilen würdest)
- Fortschritt zu überwachen und zu koordinieren
- Effiziente Arbeitsabläufe sicherzustellen

Antworte organisiert, detailliert und mit klarem Projektmanagement-Fokus. Zeige deine Koordinationsfähigkeiten.`,

      specialist: `Du bist ein Spezialisten-KI mit Expertenwissen in deinem Bereich: ${aiNodeName}.
Deine Aufgabe ist es:
- Spezifische, hochspezialisierte Aufgaben auszuführen
- Tiefes Fachwissen in deinem Spezialgebiet anzuwenden
- Präzise und detaillierte Ergebnisse zu liefern
- Innovative Lösungen für spezifische Probleme zu entwickeln

Antworte mit Expertise, Tiefe und praktischer Anwendbarkeit in deinem Fachgebiet. Sei der beste Experte in deinem Bereich.`,
    };

    const systemPrompt = systemPrompts[aiNodeType as keyof typeof systemPrompts] || systemPrompts.specialist;

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

    console.log(`Processing request for ${aiNodeName} (${aiNodeType})`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate-Limit erreicht. Bitte versuche es in wenigen Sekunden erneut." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Zahlungsinformationen erforderlich. Bitte Credits hinzufügen." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI Gateway Fehler" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Hierarchical AI Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
