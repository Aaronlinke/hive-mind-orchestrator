import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useFusionChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input: string, activeNodes?: string[]) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("🚀 Fusion Chat: Sending message with", activeNodes?.length || 0, "active nodes");
      
      // Get authenticated session
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Du musst angemeldet sein, um die KI zu nutzen.");
      }
      
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fusion-chat`;
      console.log("📡 Fusion Chat URL:", CHAT_URL);
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          activeNodes: activeNodes || [],
        }),
      });

      console.log("📥 Fusion Chat response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
        console.error("❌ Fusion Chat error:", response.status, errorData);
        
        let errorMessage = "Ein Fehler ist aufgetreten.";
        
        if (response.status === 429) {
          errorMessage = "⏱️ **Zu viele Anfragen**\n\nBitte warte einen Moment und versuche es dann erneut.";
        } else if (response.status === 402 || response.status === 503) {
          errorMessage = "💰 **KI-System vorübergehend nicht verfügbar**\n\nDie kostenlosen Lovable AI Credits sind aufgebraucht. Bitte kontaktiere den Administrator.";
        } else if (errorData.error) {
          errorMessage = `❌ **Fehler:** ${errorData.error}`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!response.body) {
        throw new Error("Kein Stream verfügbar");
      }
      
      console.log("✅ Fusion Chat stream started");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let streamDone = false;

      const assistantId = crypto.randomUUID();

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map(m =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  {
                    id: assistantId,
                    role: 'assistant' as const,
                    content: assistantContent,
                    timestamp: new Date(),
                  },
                ];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('❌ Fusion chat error:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error instanceof Error ? error.message : '❌ Ein unbekannter Fehler ist aufgetreten.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log("🏁 Fusion Chat request completed");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return { messages, isLoading, sendMessage, clearChat };
};
