import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY ist nicht konfiguriert. Bitte füge deinen API-Key in den Supabase Secrets hinzu.')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const body = await req.json()
    console.log("📥 Received request:", body)

    // Status check für laufende Generation
    if (body.predictionId) {
      console.log("🔍 Checking status for prediction:", body.predictionId)
      const prediction = await replicate.predictions.get(body.predictionId)
      console.log("📊 Prediction status:", prediction.status)
      
      return new Response(JSON.stringify({
        status: prediction.status,
        output: prediction.output,
        error: prediction.error,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Neue Video-Generation
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ 
          error: "Prompt ist erforderlich" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("🎬 Starting video generation with prompt:", body.prompt)
    
    // Verwende Luma AI Dream Machine (schnell und hochqualitativ)
    const prediction = await replicate.predictions.create({
      version: "8888da8c178de7e9226cfee4838a7c8c6891cfb3c2e1c6b3d7b8e5f8d1234567", // Luma Dream Machine
      input: {
        prompt: body.prompt,
        aspect_ratio: "16:9",
        loop: false,
        num_frames: body.duration ? body.duration * 24 : 120, // 24 fps
      }
    })

    console.log("✅ Prediction created:", prediction.id)

    return new Response(JSON.stringify({ 
      predictionId: prediction.id,
      status: prediction.status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("❌ Error in generate-video function:", error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})