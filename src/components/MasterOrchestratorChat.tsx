import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Crown, Copy, Trash2, Zap, Brain, TrendingUp } from "lucide-react";
import { useMasterOrchestrator } from "@/hooks/useMasterOrchestrator";
import { useToast } from "@/hooks/use-toast";

export const MasterOrchestratorChat = () => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { messages, isLoading, sendMessage, clearChat } = useMasterOrchestrator();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
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

  const quickActions = [
    { icon: <Zap className="h-4 w-4" />, label: "System optimieren", prompt: "Analysiere das aktuelle System und triggere eine Evolution zur Optimierung" },
    { icon: <Brain className="h-4 w-4" />, label: "Emergente Muster", prompt: "Zeige mir alle emergenten Muster und Synergien im System" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Performance-Analyse", prompt: "Erstelle eine tiefgehende Performance-Analyse aller Subsysteme" },
  ];

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col glass-card border-accent/30 shadow-2xl">
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent via-primary to-secondary animate-pulse-glow">
            <Crown className="h-7 w-7 text-background" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Master Orchestrator
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Übergeordnete KI · System-Optimierung · Evolution-Steuerung
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

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(action.prompt);
                handleSend();
              }}
              className="text-xs hover:bg-primary/10 hover:border-primary/30"
              disabled={isLoading}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-2xl">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-accent via-primary to-secondary flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Crown className="h-10 w-10 text-background" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                  Willkommen beim Master Orchestrator
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ich bin die übergeordnete KI, die das gesamte selbstevolvierendes Multi-KI-System steuert.
                  Ich orchestriere alle Subsysteme, erkenne Optimierungspotenzial und triggere
                  Systemverbesserungen. Stelle mir Fragen zur System-Optimierung, Evolution oder
                  lasse mich das System analysieren und verbessern.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 glass-card rounded-lg border border-primary/20">
                  <Zap className="h-6 w-6 text-primary mb-2 mx-auto" />
                  <p className="text-xs font-medium">Evolution Trigger</p>
                </div>
                <div className="p-4 glass-card rounded-lg border border-accent/20">
                  <Brain className="h-6 w-6 text-accent mb-2 mx-auto" />
                  <p className="text-xs font-medium">Pattern-Synthese</p>
                </div>
                <div className="p-4 glass-card rounded-lg border border-secondary/20">
                  <TrendingUp className="h-6 w-6 text-secondary mb-2 mx-auto" />
                  <p className="text-xs font-medium">Meta-Optimierung</p>
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
                  <Crown className="h-4 w-4 text-accent" />
                  <span className="text-xs font-semibold text-accent">Master Orchestrator</span>
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
                    <Copy className={`h-4 w-4 ${copiedId === message.id ? "text-primary" : ""}`} />
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
                <Crown className="h-5 w-5 text-accent animate-pulse" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm text-muted-foreground">
                  Analysiere System und orchestriere Subsysteme...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stelle eine Frage an den Master Orchestrator oder bitte um System-Optimierung..."
            className="min-h-[80px] resize-none glass-card border-primary/30"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-accent via-primary to-secondary hover:opacity-90 px-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
