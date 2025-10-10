import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatHistory, analysisType } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare analysis prompt based on type
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'sentiment':
        systemPrompt = 'Du bist ein Experte für Sentiment-Analyse. Analysiere die Stimmung in Konversationen.';
        userPrompt = `Analysiere die Stimmung in folgenden Chat-Nachrichten:\n\n${JSON.stringify(chatHistory, null, 2)}\n\nGib zurück: Gesamtstimmung, wichtige Themen, emotionale Entwicklung.`;
        break;
      
      case 'topics':
        systemPrompt = 'Du bist ein Experte für Themen-Extraktion. Finde die Hauptthemen in Konversationen.';
        userPrompt = `Extrahiere die Hauptthemen aus folgenden Chat-Nachrichten:\n\n${JSON.stringify(chatHistory, null, 2)}\n\nGib zurück: Top 5 Themen, Häufigkeit, Relevanz.`;
        break;
      
      case 'summary':
        systemPrompt = 'Du bist ein Experte für Zusammenfassungen. Erstelle prägnante Zusammenfassungen von Konversationen.';
        userPrompt = `Fasse folgende Chat-Konversation zusammen:\n\n${JSON.stringify(chatHistory, null, 2)}\n\nGib zurück: Kurzzusammenfassung, Kernaussagen, nächste Schritte.`;
        break;
      
      case 'insights':
        systemPrompt = 'Du bist ein KI-Analyst. Finde tiefe Einblicke und Muster in Konversationen.';
        userPrompt = `Analysiere folgende Chat-Konversation und finde Einblicke:\n\n${JSON.stringify(chatHistory, null, 2)}\n\nGib zurück: Muster, Zusammenhänge, Handlungsempfehlungen, versteckte Bedürfnisse.`;
        break;
      
      default:
        systemPrompt = 'Du bist ein umfassender Chat-Analyst.';
        userPrompt = `Analysiere folgende Chat-Konversation:\n\n${JSON.stringify(chatHistory, null, 2)}`;
    }

    console.log('Calling Lovable AI for chat analysis...');

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || 'Keine Analyse verfügbar';

    console.log('Analysis completed successfully');

    // Parse analysis result
    let analysisResult: any = {};
    let insights: string[] = [];

    try {
      // Try to extract structured data
      const lines = analysisText.split('\n').filter((l: string) => l.trim());
      insights = lines.slice(0, 5).map((l: string) => l.trim());
      
      analysisResult = {
        rawAnalysis: analysisText,
        type: analysisType,
        processedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error('Error parsing analysis:', e);
      analysisResult = { rawAnalysis: analysisText };
      insights = [analysisText.substring(0, 200)];
    }

    // Save analysis to database
    const { error: insertError } = await supabaseClient
      .from('chat_analysis')
      .insert({
        user_id: user.id,
        analysis_type: analysisType,
        input_data: { chatHistory },
        analysis_result: analysisResult,
        insights,
      });

    if (insertError) {
      console.error('Error saving analysis:', insertError);
    }

    return new Response(
      JSON.stringify({
        analysis: analysisText,
        result: analysisResult,
        insights,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Chat analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Chat analysis failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
