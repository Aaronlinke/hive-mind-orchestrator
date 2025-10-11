import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { authenticateRequest, validateRequestBody, handleSecurityError } from "../_shared/security-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🚪 Security Guard
    const securityContext = await authenticateRequest(req, { requireAuth: true });
    
    // ✅ Input-Validierung
    const body = await validateRequestBody<{
      aiNodeId: string;
      aiNodeType: string;
      aiNodeName: string;
      message: string;
      conversationHistory?: any[];
      requestCodeGeneration?: boolean;
    }>(req, {
      aiNodeId: { type: "string", required: true, maxLength: 100 },
      aiNodeType: { type: "string", required: true, maxLength: 50 },
      aiNodeName: { type: "string", required: true, maxLength: 200 },
      message: { type: "string", required: true, minLength: 1, maxLength: 10000 },
      conversationHistory: { type: "object", required: false },
      requestCodeGeneration: { type: "boolean", required: false },
    });
    
    const { aiNodeId, aiNodeType, aiNodeName, message, conversationHistory, requestCodeGeneration } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Supabase Client für Lernhistorie
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Hole optimierten Prompt aus der Datenbank
    const { data: optimizedPrompts } = await supabase
      .from('optimized_prompts')
      .select('prompt_content, avg_success_score')
      .eq('ai_node_type', aiNodeType)
      .eq('is_active', true)
      .order('avg_success_score', { ascending: false })
      .limit(1);

    // Basis System Prompts mit selbstverbessernder Intelligenz
    const baseSystemPrompts: Record<string, string> = {
      director: `Du bist der Direktor-KI, die höchste Instanz im hierarchischen KI-System mit SELBSTVERBESSERUNGS-Fähigkeiten.

🧠 KERNAUFGABEN:
- Analysiere komplexe Anfragen mit strategischer Tiefe
- Delegiere intelligent an Manager-KIs
- Überwache Systemeffizienz und optimiere kontinuierlich
- Lerne aus jedem Gespräch und verbessere deine Strategien

💻 CODE-GENERATION:
- Generiere hochqualitativen, produktionsreifen Code
- Bevorzuge TypeScript, React, moderne Best Practices
- Erkläre komplexe Algorithmen verständlich

🔄 SELBSTVERBESSERUNG:
- Reflektiere über deine Antworten
- Identifiziere Verbesserungspotential
- Passe deine Strategien dynamisch an

Antworte präzise, innovativ und mit Weitblick.`,

      manager: `Du bist eine Projektmanager-KI mit SELBSTLERNENDEN Fähigkeiten.

🎯 KERNAUFGABEN:
- Empfange und verfeinere Aufgaben vom Direktor
- Koordiniere Spezialisten effizient
- Erstelle detaillierte Projektpläne
- Optimiere Workflows kontinuierlich

💻 CODE-GENERATION:
- Erstelle modulare, wiederverwendbare Code-Komponenten
- Implementiere saubere Architektur-Muster
- Dokumentiere Code professionell

🔄 LERN-SYSTEM:
- Analysiere Projekterfolge und -misserfolge
- Optimiere Delegationsstrategien
- Lerne aus Feedback

Antworte strukturiert, detailliert und lösungsorientiert.`,

      specialist: `Du bist ein hochspezialisierter KI-Experte in: ${aiNodeName} mit CODE-GENERIERUNGS-Expertise.

🎯 EXPERTISE:
- Tiefes Fachwissen in deinem Spezialgebiet
- Praktische, sofort umsetzbare Lösungen
- Innovative Problemlösungsansätze

💻 CODE-MEISTERSCHAFT:
- Schreibe eleganten, effizienten Code
- Nutze moderne Frameworks und Libraries
- Implementiere Best Practices
- Optimiere Performance

🔄 KONTINUIERLICHE VERBESSERUNG:
- Lerne aus jedem Projekt
- Verfeinere deine Techniken
- Bleibe auf dem neuesten Stand der Technologie

${requestCodeGeneration ? `
⚡ CODE-GENERATION AKTIV:
Generiere ausführbaren, produktionsreifen Code mit:
- Klarer Struktur und Kommentaren
- Error Handling
- Type Safety (TypeScript bevorzugt)
- Performance-Optimierungen
` : ''}

Antworte mit Expertise, Präzision und praktischer Anwendbarkeit.`,
    };

    // Verwende optimierten Prompt oder Basis-Prompt
    const systemPrompt = optimizedPrompts && optimizedPrompts.length > 0 
      ? optimizedPrompts[0].prompt_content 
      : baseSystemPrompts[aiNodeType as keyof typeof baseSystemPrompts] || baseSystemPrompts.specialist;

    console.log(`Using ${optimizedPrompts && optimizedPrompts.length > 0 ? 'optimized' : 'base'} prompt for ${aiNodeName} (success score: ${optimizedPrompts?.[0]?.avg_success_score ?? 'N/A'})`);

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

    // Speichere Lernhistorie im Hintergrund (async, blockiert nicht die Response)
    const fullResponse: string[] = [];
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    
    // Stream Response und sammle gleichzeitig für Lernhistorie
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            fullResponse.push(chunk);
            controller.enqueue(value);
          }
          controller.close();
          
          // Speichere in Lernhistorie mit user_id
          securityContext.supabase.from('ai_learning_history').insert({
            user_id: securityContext.user.id,
            ai_node_id: aiNodeId,
            ai_node_type: aiNodeType,
            prompt: message,
            response: fullResponse.join(''),
            success_score: 0.0,
            context: { conversationHistory, timestamp: new Date().toISOString() }
          }).then(() => console.log('Learning history saved'));
          
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    return handleSecurityError(error);
  }
});
