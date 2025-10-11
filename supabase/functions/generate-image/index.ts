import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest, validateRequestBody, checkRateLimit, handleSecurityError } from "../_shared/security-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🚪 Security Guard: Authentifizierung & Autorisierung
    const securityContext = await authenticateRequest(req, { requireAuth: true });
    
    // ✅ Input-Validierung
    const body = await validateRequestBody<{ prompt: string; aiNodeId?: string }>(req, {
      prompt: { type: "string", required: true, minLength: 1, maxLength: 5000 },
      aiNodeId: { type: "string", required: false, maxLength: 100 },
    });
    
    const { prompt, aiNodeId } = body;
    
    // ⏱️ Rate Limiting
    await checkRateLimit(securityContext.supabase, securityContext.user.id, "generate-image", 50, 60000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const startTime = Date.now();
    console.log('🎨 Generating image for user:', securityContext.user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("🎨 AI Response received");
    
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("❌ No image in response");
      throw new Error("Die KI hat kein Bild generiert. Bitte versuche es mit einem anderen Prompt.");
    }
    
    console.log("✅ Image generated successfully");

    const generationTime = Date.now() - startTime;

    // 💾 Speichere mit user_id (verwendet bereits den authenticated client)
    const { error: dbError } = await securityContext.supabase.from("generated_images").insert({
      user_id: securityContext.user.id,
      prompt,
      image_url: imageUrl,
      ai_node_id: aiNodeId || "image-generator",
      generation_time_ms: generationTime
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Fehler beim Speichern des Bildes");
    }

    return new Response(
      JSON.stringify({ imageUrl, generationTime }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleSecurityError(error);
  }
});
