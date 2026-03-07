import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useMasterOrchestrator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const { user } = useAuth();
  const currentSessionRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    currentSessionRef.current = currentSessionId;
  }, [currentSessionId]);

  // Load sessions on mount when user is available
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setSessionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .ilike('title', 'Master Orchestrator%')
        .order('updated_at', { ascending: false })
        .limit(10);
      if (!error && data) setSessions(data);
    } catch (e) {
      console.error('Load sessions error:', e);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) { console.error('Load messages error:', error); return; }

    const loaded: Message[] = (data || []).map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.created_at),
    }));
    setMessages(loaded);
    setCurrentSessionId(sessionId);
  };

  const getOrCreateSession = async (): Promise<string | null> => {
    if (!user) return null;
    const existing = currentSessionRef.current;
    if (existing) return existing;

    // Create a new session
    const title = `Master Orchestrator ${new Date().toLocaleDateString('de-DE')}`;
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();

    if (error) { console.error('Create session error:', error); return null; }
    const newId = data.id;
    setCurrentSessionId(newId);
    loadSessions();
    return newId;
  };

  const saveMessage = async (sessionId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role,
      content,
    });
  };

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
      // Ensure session exists
      const sessionId = await getOrCreateSession();
      if (sessionId) await saveMessage(sessionId, 'user', input);

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

      const responseText = data?.text || 'Keine Antwort erhalten.';

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      if (sessionId) await saveMessage(sessionId, 'assistant', responseText);

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
    setCurrentSessionId(null);
  };

  const startNewSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    sessions,
    sessionsLoading,
    currentSessionId,
    loadSession,
    startNewSession,
  };
};
