import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Crown, Copy, Trash2, Zap, Brain, TrendingUp, History, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useMasterOrchestrator } from "@/hooks/useMasterOrchestrator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const MasterOrchestratorChat = () => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    messages, isLoading, sendMessage, clearChat,
    sessions, sessionsLoading, currentSessionId, loadSession, startNewSession
  } = useMasterOrchestrator();
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
      toast({ title: "Kopiert!", description: "Nachricht wurde in die Zwischenablage kopiert." });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Fehler", description: "Konnte nicht kopieren.", variant: "destructive" });
    }
  };

  const quickActions = [
    { icon: <Zap className="h-4 w-4" />, label: "System optimieren", prompt: "Analysiere das aktuelle System und triggere eine Evolution zur Optimierung" },
    { icon: <Brain className="h-4 w-4" />, label: "Emergente Muster", prompt: "Zeige mir alle emergenten Muster und Synergien im System" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Performance-Analyse", prompt: "Erstelle eine tiefgehende Performance-Analyse aller Subsysteme" },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] gap-3">
      {/* Session Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "w-60 min-w-[240px]" : "w-0 min-w-0 overflow-hidden"}`}>
        <Card className="h-full flex flex-col glass-card border-border/30 shadow-lg">
          <div className="p-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Verlauf</span>
            </div>
            <Button variant="ghost" size="sm" onClick={startNewSession} className="h-7 px-2 hover:bg-primary/10" title="Neues Gespräch">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessionsLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Lade...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Noch keine Sessions</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors hover:bg-primary/10 border ${
                      currentSessionId === session.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">
                      {new Date(session.updated_at).toLocaleDateString("de-DE")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Chat */}
      <Card className="flex-1 h-full flex flex-col glass-card border-accent/30 shadow-2xl min-w-0">
        {/* Header */}
        <div className="p-3 md:p-5 border-b border-border/50 bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(p => !p)}
              className="h-8 w-8 p-0 hover:bg-primary/10 flex-shrink-0"
              title="Verlauf"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-accent via-primary to-secondary animate-pulse-glow flex-shrink-0">
              <Crown className="h-5 w-5 md:h-6 md:w-6 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-2xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent truncate">
                Master Orchestrator
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground font-medium truncate">
                7 KI-Spezialisten · Collective Intelligence
                {currentSessionId && <Badge variant="outline" className="ml-2 text-[9px] h-4">Gespeichert</Badge>}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearChat(); }}
              className="hover:bg-destructive/10 h-8 px-2 flex-shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline text-xs">Löschen</span>
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-2 md:mt-3 flex flex-wrap gap-1 md:gap-2">
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => { if (!isLoading) sendMessage(action.prompt); }}
                className="text-[10px] md:text-xs hover:bg-primary/10 hover:border-primary/30 h-7 px-2 md:px-3"
                disabled={isLoading}
              >
                <span className="hidden sm:inline mr-1">{action.icon}</span>
                <span className="truncate">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full px-3">
              <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-accent via-primary to-secondary flex items-center justify-center animate-pulse-glow shadow-2xl">
                  <Crown className="h-7 w-7 text-background" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                    Willkommen
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                    Ich orchestriere ALLE 7 KI-Spezialisten:
                    <br />
                    <strong className="text-[10px] md:text-xs">Semantik · Decision · Resource · Knowledge · Web · Visual · Skill</strong>
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2 glass-card rounded-lg border border-primary/20">
                    <Zap className="h-4 w-4 text-primary mb-1 mx-auto" />
                    <p className="text-[10px] font-medium">Evolution</p>
                  </div>
                  <div className="p-2 glass-card rounded-lg border border-accent/20">
                    <Brain className="h-4 w-4 text-accent mb-1 mx-auto" />
                    <p className="text-[10px] font-medium">Pattern</p>
                  </div>
                  <div className="p-2 glass-card rounded-lg border border-secondary/20">
                    <TrendingUp className="h-4 w-4 text-secondary mb-1 mx-auto" />
                    <p className="text-[10px] font-medium">Meta-AI</p>
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
                    <Crown className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] font-semibold text-accent">Master AI</span>
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
                      className="h-6 w-6 p-0 hover:bg-primary/10 flex-shrink-0"
                    >
                      <Copy className={`h-3 w-3 ${copiedId === message.id ? "text-primary" : ""}`} />
                    </Button>
                  )}
                </div>
                <p className="text-[10px] opacity-60">
                  {message.timestamp.toLocaleTimeString("de-DE")}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card border-primary/30 rounded-xl p-3 md:p-4 mr-0 md:mr-12">
                <div className="flex items-center gap-2 md:gap-3">
                  <Crown className="h-4 w-4 text-accent animate-pulse" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Analysiere...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-5 border-t border-border/50 bg-background/50">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Frage stellen..."
              className="min-h-[56px] md:min-h-[72px] resize-none glass-card border-primary/30 text-xs md:text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-accent via-primary to-secondary hover:opacity-90 px-3 md:px-6 h-[56px] md:h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
