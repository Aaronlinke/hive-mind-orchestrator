import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseChatProps {
  activeAI: string | null;
}

export const useChat = ({ activeAI }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hallo! Ich bin der KI-Orchestrator. Wähle eine KI aus der Hierarchie aus, um mit ihr zu interagieren.",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hallo! Ich bin der KI-Orchestrator. Wähle eine KI aus der Hierarchie aus, um mit ihr zu interagieren.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      if (!activeAI) {
        toast({
          title: "Keine KI ausgewählt",
          description: "Bitte wähle eine KI aus der Hierarchie aus.",
          variant: "destructive",
        });
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const nodeMap: Record<string, { type: string; name: string }> = {
          "director-1": { type: "director", name: "Direktor KI" },
          "manager-1": { type: "manager", name: "Projektmanager KI-A" },
          "manager-2": { type: "manager", name: "Projektmanager KI-B" },
          "specialist-1": { type: "specialist", name: "Spezialist: Storytelling" },
          "specialist-2": { type: "specialist", name: "Spezialist: Game Design" },
          "specialist-3": { type: "specialist", name: "Spezialist: Grafik" },
          "specialist-4": { type: "specialist", name: "Spezialist: Weltenbau" },
        };

        const nodeInfo = nodeMap[activeAI] || { type: "specialist", name: activeAI };

        const conversationHistory = messages
          .filter((m) => m.role !== "assistant" || !m.content.startsWith("Verbunden mit"))
          .map((m) => ({ role: m.role, content: m.content }));

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hierarchical-ai`;

        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            aiNodeId: activeAI,
            aiNodeType: nodeInfo.type,
            aiNodeName: nodeInfo.name,
            message: input,
            conversationHistory,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Fehler bei der AI-Anfrage");
        }

        if (!response.body) {
          throw new Error("Keine Antwort vom Server");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let assistantContent = "";

        const assistantId = (Date.now() + 1).toString();

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.id === assistantId) {
                    return prev.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: assistantId,
                      role: "assistant" as const,
                      content: assistantContent,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  )
                );
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (error) {
        console.error("AI Error:", error);
        toast({
          title: "Fehler",
          description: error instanceof Error ? error.message : "Konnte keine Antwort generieren.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeAI, messages, toast]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    setMessages,
  };
};
