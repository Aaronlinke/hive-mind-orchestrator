import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const nodesContext = activeNodes?.length 
        ? `\nAktive KI-Knoten: ${activeNodes.join(', ')}` 
        : '';

      const historyContext = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'Nutzer' : 'Assistent'}: ${m.content}`
      ).join('\n\n');

      const { data, error } = await supabase.functions.invoke('gemini-free-ai', {
        body: {
          prompt: input,
          systemPrompt: `Du bist ein Multi-KI-Fusionssystem. Du kombinierst mehrere KI-Perspektiven zu einer kohärenten Antwort.${nodesContext}

${historyContext ? `\nBisheriger Kontext:\n${historyContext}` : ''}

Antworte auf Deutsch. Nutze Markdown für Struktur. Sei präzise und hilfreich.`,
          model: 'gemini-2.5-flash'
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.text || 'Keine Antwort erhalten.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Fusion chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return { messages, isLoading, sendMessage, clearChat };
};
