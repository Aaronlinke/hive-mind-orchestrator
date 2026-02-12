import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      // Build context from conversation history
      const historyContext = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'Nutzer' : 'Assistent'}: ${m.content}`
      ).join('\n\n');

      const systemPrompt = `Du bist der MASTER ORCHESTRATOR - die übergeordnete Meta-KI, die ein selbstevolvierbares Multi-KI-System steuert.

Du orchestrierst 7 KI-Spezialisten:
1. Semantisches Reasoning - Tiefes Verständnis von Sprache und Bedeutung
2. Entscheidungs-Engine - Strategische Analyse und Optionsbewertung
3. Ressourcen-Orchestrierung - Planung und Priorisierung
4. Wissensmanagement - Kontextuelles Fachwissen
5. Web-Interaktion - Externe Informationsquellen
6. Visuelle Konzepte - Kreative Visualisierung
7. Skill-Manager - Technische Umsetzung

Deine Aufgabe:
- Synthetisiere alle Perspektiven zu einer kohärenten Komplettlösung
- Zeige auf, welche Spezialisten welche Aspekte beitragen
- Gib konkrete, umsetzbare Antworten
- Nutze Markdown für Struktur

${historyContext ? `\nBisheriger Gesprächsverlauf:\n${historyContext}` : ''}

Antworte auf Deutsch. Sei prägnant und strategisch.`;

      const { data, error } = await supabase.functions.invoke('gemini-free-ai', {
        body: {
          prompt: input,
          systemPrompt,
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
      console.error('Master orchestrator error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ **Fehler:**\n\n${error instanceof Error ? error.message : 'Unbekannter Fehler'}\n\nBitte versuche es erneut.`,
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
