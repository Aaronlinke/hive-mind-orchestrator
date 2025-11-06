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

  const sendMessage = async (userMessage: string, retryCount = 0) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setStreamingContent('');

    const maxRetries = 3;
    const baseDelay = 1000;

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        toast({
          title: "🔐 Authentifizierung erforderlich",
          description: "Bitte melde dich an, um den Supreme Orchestrator zu nutzen.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2min timeout

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
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      // Retry on transient errors (429, 503)
      if ((response.status === 429 || response.status === 503) && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) * (response.status === 429 ? 2 : 1);
        toast({
          title: "⏱️ Wiederhole Anfrage...",
          description: `System überlastet. Versuch ${retryCount + 1}/${maxRetries}`,
          duration: 3000
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendMessage(userMessage, retryCount + 1);
      }

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "⏱️ Rate Limit erreicht",
            description: "Zu viele Anfragen. Bitte warte einen Moment.",
            variant: "destructive",
            duration: 5000
          });
        } else if (response.status === 402) {
          toast({
            title: "💳 Lovable AI Credits aufgebraucht!",
            description: "Bitte gehe zu Settings → Workspace → Usage um Credits hinzuzufügen.",
            variant: "destructive",
            duration: 10000,
          });
        } else if (response.status === 503 && retryCount >= maxRetries) {
          toast({
            title: "⚠️ Service nicht verfügbar",
            description: "System überlastet. Bitte versuche es später erneut.",
            variant: "destructive"
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

    } catch (error: any) {
      console.error('Supreme Orchestrator error:', error);
      
      // Retry on network errors
      if (error.name === 'AbortError' && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount);
        toast({
          title: "⏱️ Timeout - wiederhole...",
          description: `Versuch ${retryCount + 1}/${maxRetries}`,
          duration: 3000
        });
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendMessage(userMessage, retryCount + 1);
      }
      
      toast({
        title: "❌ Fehler",
        description: error.name === 'AbortError' 
          ? "Anfrage hat zu lange gedauert. Bitte versuche es erneut."
          : "Supreme Orchestrator konnte nicht ausgeführt werden.",
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
