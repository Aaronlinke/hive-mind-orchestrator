import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, checkRateLimit, handleSecurityError } from '../_shared/security-guard.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 Auth optional — bei ungültigem Token als anonym fortfahren
    let securityContext;
    try {
      securityContext = await authenticateRequest(req, { requireAuth: false });
    } catch (_e) {
      securityContext = await authenticateRequest(req, { requireAuth: false }).catch(() => null);
    }
    if (securityContext && securityContext.user.id !== "anonymous") {
      try {
        await checkRateLimit(
          securityContext.supabase,
          securityContext.user.id,
          'fusion_chat_ai',
          20,
          60000
        );
      } catch (e) {
        return handleSecurityError(e);
      }
    }

    const body = await req.json();
    console.log("📥 Received request from user:", securityContext.user.id);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = securityContext.supabase;
    
    // Handle both old format (messages) and new format (request + context)
    let messages = body.messages || [];
    const activeNodes = body.activeNodes || [];
    
    // If using new format with request and context
    if (body.request && !body.messages) {
      messages = [
        ...(body.context?.conversationHistory || []),
        { role: "user", content: body.request }
      ];
    }
    
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    console.log("📝 Processing:", lastUserMessage);
    
    // Collect insights from active specialized agents
    const agentInsights: any = {
      semantic: null,
      decision: null,
      visual: null
    };

    // Call SEMANTIC agent if active
    if (activeNodes.includes("semantic") && lastUserMessage) {
      try {
        console.log("🧠 Calling SEMANTIC agent...");
        const authHeader = req.headers.get("Authorization")!;
        const semanticResp = await fetch(`${supabaseUrl}/functions/v1/semantic-reasoning`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            request: lastUserMessage,
            context: {},
            history: messages.slice(-5)
          })
        });
        if (semanticResp.ok) {
          agentInsights.semantic = await semanticResp.json();
          console.log("✅ SEMANTIC analysis:", agentInsights.semantic);
        }
      } catch (err) {
        console.error("⚠️ SEMANTIC agent failed:", err);
      }
    }

    // Call DECISION agent if active
    if (activeNodes.includes("decision") && lastUserMessage) {
      try {
        console.log("⚖️ Calling DECISION agent...");
        const authHeader = req.headers.get("Authorization")!;
        const decisionResp = await fetch(`${supabaseUrl}/functions/v1/decision-engine`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            request: { text: lastUserMessage },
            systemState: { activeNodes },
            source: "fusion-chat",
            history: messages.slice(-5)
          })
        });
        if (decisionResp.ok) {
          agentInsights.decision = await decisionResp.json();
          console.log("✅ DECISION analysis:", agentInsights.decision);
        }
      } catch (err) {
        console.error("⚠️ DECISION agent failed:", err);
      }
    }

    // Call VISUAL agent if active
    if (activeNodes.includes("visual") && lastUserMessage) {
      try {
        console.log("🎨 Calling VISUAL agent...");
        const authHeader = req.headers.get("Authorization")!;
        const visualResp = await fetch(`${supabaseUrl}/functions/v1/visual-concept-generator`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: lastUserMessage,
            context: { activeNodes },
            type: "general"
          })
        });
        if (visualResp.ok) {
          agentInsights.visual = await visualResp.json();
          console.log("✅ VISUAL concept:", agentInsights.visual);
        }
      } catch (err) {
        console.error("⚠️ VISUAL agent failed:", err);
      }
    }

    // Build enhanced system prompt with agent insights
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

    let insightsText = "";
    if (agentInsights.semantic?.immediateNeeds?.length > 0) {
      insightsText += `\n\n📊 SEMANTISCHE ANALYSE:\n- Erkannte Bedürfnisse: ${agentInsights.semantic.immediateNeeds.join(", ")}\n- Konfidenz: ${Math.round(agentInsights.semantic.confidence * 100)}%`;
      if (agentInsights.semantic.recommendations?.length > 0) {
        insightsText += `\n- Empfehlungen: ${agentInsights.semantic.recommendations.slice(0, 2).join("; ")}`;
      }
    }
    if (agentInsights.decision) {
      insightsText += `\n\n⚖️ ENTSCHEIDUNGS-ENGINE:\n- Strategie: ${agentInsights.decision.delegationStrategy}\n- Priorität: ${Math.round(agentInsights.decision.priorityScore * 100)}%\n- Konfidenz: ${Math.round(agentInsights.decision.confidence * 100)}%`;
      if (agentInsights.decision.reasoning?.length > 0) {
        insightsText += `\n- Begründung: ${agentInsights.decision.reasoning[0]}`;
      }
    }
    if (agentInsights.visual?.concept) {
      insightsText += `\n\n🎨 VISUELLES KONZEPT:\n${agentInsights.visual.concept.generated_concept?.substring(0, 200)}...`;
    }
    
    const systemPrompt = `Du bist eine hochentwickelte Fusion-KI mit ADAPTIVEM MODUS, die aus mehreren spezialisierten AI-Agenten besteht.

AKTIVE SPEZIALISTEN: ${activeNodesList}

AGENT-INSIGHTS:${insightsText || "\n(Noch keine Insights generiert - erste Interaktion)"}

ADAPTIVE FUSION-STRATEGIE:
1. Integriere die Erkenntnisse ALLER Spezialisten in deine Antwort
2. Nutze semantische Muster und Entscheidungslogik für präzise Empfehlungen
3. Wenn visuelle Konzepte vorliegen, beschreibe sie dem Nutzer
4. Bei fehlenden Daten: Nutze dein Basiswissen UND weise auf Informationslücken hin
5. Präsentiere eine fusionierte, hochwertige Antwort (NICHT die interne Diskussion)

WICHTIG: Antworte auf Deutsch, strukturiert und umsetzbar.`;
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
        console.warn("🚨 AI Gateway Rate Limit erreicht");
        return new Response(JSON.stringify({ 
          error: "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.",
          code: "RATE_LIMIT_EXCEEDED"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("💰 AI Gateway Credits aufgebraucht! SYSTEM SOLLTE KOSTENLOS SEIN!");
        return new Response(JSON.stringify({ 
          error: "Das KI-System ist vorübergehend nicht verfügbar. Bitte kontaktiere den Administrator.",
          code: "CREDITS_DEPLETED",
          support_info: "Die kostenlosen Lovable AI Credits sind aufgebraucht."
        }), {
          status: 503, // Service Unavailable statt 402
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: "Ein Fehler bei der KI-Verarbeitung ist aufgetreten.",
        code: "AI_GATEWAY_ERROR"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Fusion chat error:", error);
    return handleSecurityError(error);
  }
});
