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
    const { messages, activeNodes = [] } = await req.json();
    
    // Build dynamic system prompt based on active nodes
    const nodeDescriptions = {
      semantic: "Semantic Reasoning AI (Mustererkennung & Kontextanalyse)",
      decision: "Decision Engine (Strategische Entscheidungsfindung)",
      resource: "Resource Orchestration (API & Cloud Service Integration)",
      knowledge: "Knowledge Manager (Wissensgraph & Informationsvernetzung)",
      web: "Web Interaction Agent (Browser Automation & Scraping)",
      visual: "Visual Concept Generator (Bildgenerierung & visuelle Konzepte)",
      skill: "Skill Manager (Code-Ausführung & Dynamic Skills)",
    };

    const activeNodesList = activeNodes.length > 0 
      ? activeNodes.map((id: string) => nodeDescriptions[id as keyof typeof nodeDescriptions]).filter(Boolean).join(", ")
      : "Alle Spezialisten";
    
    const systemPrompt = `Du bist eine hochentwickelte Fusion-KI, die aus mehreren spezialisierten AI-Agenten besteht.

AKTIVE SPEZIALISTEN: ${activeNodesList}

Deine Aufgabe:
1. Analysiere die Anfrage aus der Perspektive ALLER aktiven Spezialisten
2. Die Spezialisten debattieren intern und entwickeln eine optimale Strategie
3. Du präsentierst NUR die finale, vereinte Antwort - OHNE die interne Diskussion zu zeigen
4. Die Antwort sollte präzise, umsetzbar und aus allen Perspektiven durchdacht sein

Wichtig: Der Nutzer sieht NICHT wie die einzelnen Spezialisten denken. Er erhält nur deine finale, fusionierte Antwort.`;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
