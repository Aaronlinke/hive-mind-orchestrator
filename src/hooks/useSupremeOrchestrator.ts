import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export const useSupremeOrchestrator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const { toast } = useToast();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        toast({
          title: "Authentifizierung erforderlich",
          description: "Bitte melde dich an, um den Supreme Orchestrator zu nutzen.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/supreme-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "⏱️ Rate Limit erreicht",
            description: "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.",
            variant: "destructive"
          });
        } else if (response.status === 402 || response.status === 503) {
          toast({
            title: "💳 Lovable AI Credits aufgebraucht!",
            description: "Bitte gehe zu Settings → Workspace → Usage um Credits hinzuzufügen.",
            variant: "destructive",
            duration: 10000,
          });
        } else if (response.status === 401) {
          toast({
            title: "🔐 Authentifizierung fehlgeschlagen",
            description: "Bitte melde dich erneut an.",
            variant: "destructive"
          });
        } else {
          const errorText = await response.text().catch(() => "");
          toast({
            title: "❌ Fehler",
            description: errorText || `HTTP ${response.status}`,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    accumulatedContent += content;
                    setStreamingContent(accumulatedContent);
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: accumulatedContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');

    } catch (error) {
      console.error('Supreme Orchestrator error:', error);
      toast({
        title: "Fehler",
        description: "Supreme Orchestrator konnte nicht ausgeführt werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setStreamingContent('');
  };

  return {
    messages,
    isLoading,
    streamingContent,
    sendMessage,
    clearMessages
  };
};
