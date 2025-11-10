import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useMasterOrchestrator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input: string) => {
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
      console.log("🎯 Master Orchestrator: Sending message");
      
      // Get authenticated session
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        await supabase.auth.signOut();
        throw new Error("Sitzung abgelaufen. Bitte neu anmelden.");
      }
      
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-orchestrator`;
      
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
        }),
      });

      console.log("📥 Master Orchestrator response status:", response.status);
      
      if (!response.ok || !response.body) {
        const errorText = await response.text().catch(() => "No details");
        console.error("❌ Master Orchestrator error:", response.status, errorText);
        
        // Handle 401 - Session expired
        if (response.status === 401) {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.auth.signOut();
          throw new Error("Sitzung abgelaufen. Bitte neu anmelden.");
        }
        
        if (response.status === 402) {
          throw new Error('💳 Lovable AI Credits aufgebraucht!\n\nBitte gehe zu Settings → Workspace → Usage um Credits hinzuzufügen.');
        }
        
        if (response.status === 429) {
          throw new Error('⏱️ Rate Limit erreicht! Bitte warte einen Moment und versuche es erneut.');
        }
        
        throw new Error(`Failed to start stream: ${response.status} - ${errorText}`);
      }
      
      console.log("✅ Master Orchestrator stream started");

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
      console.error('❌ Master orchestrator error:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ **Master Orchestrator Fehler:**\n\n${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte versuche es erneut.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log("🏁 Master Orchestrator request completed");
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return { messages, isLoading, sendMessage, clearChat };
};
