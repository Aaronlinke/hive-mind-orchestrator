import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Copy, Trash2, Zap, Brain, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    activeSystems?: number;
    totalSystems?: number;
    swarmMemories?: number;
    collectiveConsensus?: number;
  };
}

export const SuperFusionChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("super-fusion-ai", {
        body: { message: input },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Keine Antwort erhalten.",
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      toast({
        title: "Super Fusion AI",
        description: `${data.metadata?.activeSystems}/${data.metadata?.totalSystems} Systeme aktiv · ${data.metadata?.swarmMemories} Erinnerungen · ${data.metadata?.collectiveConsensus?.toFixed(1)}% Konsens`,
      });
    } catch (error) {
      console.error("Super Fusion AI error:", error);
      toast({
        title: "Fehler",
        description: "Super Fusion AI konnte nicht antworten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({
        title: "Kopiert!",
        description: "Nachricht wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Konnte nicht kopieren.",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat gelöscht",
      description: "Alle Nachrichten wurden entfernt.",
    });
  };

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col glass-card border-primary/30 shadow-2xl">
      <div className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary animate-pulse-glow flex-shrink-0">
            <Sparkles className="h-7 w-7 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Super Fusion AI
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              8 KI-Systeme fusioniert · Schwarm-Gedächtnis · Alles vereint
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Sparkles className="h-10 w-10 text-background" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Super Fusion AI
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Ich bin die Fusion ALLER 8 KI-Systeme mit kollektivem Schwarm-Gedächtnis:
                  <br />
                  <strong className="text-xs">
                    Semantik · Decision · Resource · Knowledge · Web · Visual · Skill · Master
                  </strong>
                  <br />
                  <br />
                  Ich habe Zugriff auf das gesamte Schwarm-Wissen, alle Muster und
                  emergenten Fähigkeiten. Ich kann WIRKLICH ALLES.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4">
                <div className="p-4 glass-card rounded-lg border border-primary/20">
                  <Brain className="h-6 w-6 text-primary mb-2 mx-auto" />
                  <p className="text-xs font-medium">8 Systeme</p>
                </div>
                <div className="p-4 glass-card rounded-lg border border-accent/20">
                  <Database className="h-6 w-6 text-accent mb-2 mx-auto" />
                  <p className="text-xs font-medium">Gedächtnis</p>
                </div>
                <div className="p-4 glass-card rounded-lg border border-secondary/20">
                  <Zap className="h-6 w-6 text-secondary mb-2 mx-auto" />
                  <p className="text-xs font-medium">Fusion</p>
                </div>
                <div className="p-4 glass-card rounded-lg border border-primary/20">
                  <Sparkles className="h-6 w-6 text-primary mb-2 mx-auto" />
                  <p className="text-xs font-medium">Alles</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 space-y-2 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ml-12"
                  : "glass-card border-primary/30 mr-12"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Super Fusion AI</span>
                  {message.metadata && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {message.metadata.activeSystems}/{message.metadata.totalSystems} Systeme · 
                      {message.metadata.swarmMemories} Mem · 
                      {message.metadata.collectiveConsensus?.toFixed(0)}% Konsens
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm whitespace-pre-wrap break-words flex-1">
                  {message.content}
                </p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 flex-shrink-0"
                  >
                    <Copy
                      className={`h-4 w-4 ${copiedId === message.id ? "text-primary" : ""}`}
                    />
                  </Button>
                )}
              </div>
              <p className="text-xs opacity-60">
                {message.timestamp.toLocaleTimeString("de-DE")}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] glass-card border-primary/30 rounded-xl p-4 mr-12">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  Fusioniere alle Systeme...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frage die Super Fusion AI..."
            className="min-h-[80px] resize-none glass-card border-primary/30"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 px-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
