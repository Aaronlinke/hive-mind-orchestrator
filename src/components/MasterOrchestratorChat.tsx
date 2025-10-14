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
    <Card className="h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] flex flex-col glass-card border-accent/30 shadow-2xl">
      <div className="p-3 md:p-6 border-b border-border/50 bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-accent via-primary to-secondary animate-pulse-glow flex-shrink-0">
            <Crown className="h-5 w-5 md:h-7 md:w-7 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent truncate">
              Master Orchestrator
            </h2>
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">
              7 KI-Spezialisten · Collective Intelligence
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="hover:bg-destructive/10 h-8 md:h-9 px-2 md:px-3 flex-shrink-0"
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Löschen</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-2 md:mt-4 flex flex-wrap gap-1 md:gap-2">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => {
                setInput(action.prompt);
                handleSend();
              }}
              className="text-[10px] md:text-xs hover:bg-primary/10 hover:border-primary/30 h-7 md:h-8 px-2 md:px-3"
              disabled={isLoading}
            >
              <span className="hidden sm:inline mr-1 md:mr-2">{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full px-3">
            <div className="text-center space-y-4 md:space-y-6 max-w-2xl">
              <div className="mx-auto w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-accent via-primary to-secondary flex items-center justify-center animate-pulse-glow shadow-2xl">
                <Crown className="h-7 w-7 md:h-10 md:w-10 text-background" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                  Willkommen
                </h3>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                  Ich orchestriere ALLE 7 KI-Spezialisten:
                  <br/>
                  <strong className="text-[10px] md:text-xs">Semantik · Decision · Resource · Knowledge · Web · Visual · Skill</strong>
                  <br/><br/>
                  <span className="hidden md:inline">
                  Ich konsultiere alle Spezialisten parallel,
                  lasse sie "debattieren" und synthetisiere ihre Erkenntnisse zu einer
                  vollständigen Komplettlösung mit evolutionärem System im Hintergrund.
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-4 pt-2 md:pt-4">
                <div className="p-2 md:p-4 glass-card rounded-lg border border-primary/20">
                  <Zap className="h-4 w-4 md:h-6 md:w-6 text-primary mb-1 md:mb-2 mx-auto" />
                  <p className="text-[10px] md:text-xs font-medium">Evolution</p>
                </div>
                <div className="p-2 md:p-4 glass-card rounded-lg border border-accent/20">
                  <Brain className="h-4 w-4 md:h-6 md:w-6 text-accent mb-1 md:mb-2 mx-auto" />
                  <p className="text-[10px] md:text-xs font-medium">Pattern</p>
                </div>
                <div className="p-2 md:p-4 glass-card rounded-lg border border-secondary/20">
                  <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-secondary mb-1 md:mb-2 mx-auto" />
                  <p className="text-[10px] md:text-xs font-medium">Meta-AI</p>
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
              className={`max-w-[90%] md:max-w-[80%] rounded-xl p-3 md:p-4 space-y-2 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ml-0 md:ml-12"
                  : "glass-card border-primary/30 mr-0 md:mr-12"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                  <Crown className="h-3 w-3 md:h-4 md:w-4 text-accent" />
                  <span className="text-[10px] md:text-xs font-semibold text-accent">Master AI</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs md:text-sm whitespace-pre-wrap break-words flex-1">
                  {message.content}
                </p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-primary/10 flex-shrink-0"
                  >
                    <Copy className={`h-3 w-3 md:h-4 md:w-4 ${copiedId === message.id ? "text-primary" : ""}`} />
                  </Button>
                )}
              </div>
              <p className="text-[10px] md:text-xs opacity-60">
                {message.timestamp.toLocaleTimeString("de-DE")}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] md:max-w-[80%] glass-card border-primary/30 rounded-xl p-3 md:p-4 mr-0 md:mr-12">
              <div className="flex items-center gap-2 md:gap-3">
                <Crown className="h-4 w-4 md:h-5 md:w-5 text-accent animate-pulse" />
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground">
                  Analysiere...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-6 border-t border-border/50 bg-background/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Frage stellen..."
            className="min-h-[60px] md:min-h-[80px] resize-none glass-card border-primary/30 text-xs md:text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-accent via-primary to-secondary hover:opacity-90 px-3 md:px-8 h-[60px] md:h-auto"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
