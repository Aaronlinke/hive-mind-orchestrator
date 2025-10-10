import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Sparkles, Copy, Trash2, Brain, Settings } from "lucide-react";
import { useFusionChat } from "@/hooks/useFusionChat";
import { useToast } from "@/hooks/use-toast";

const AI_NODES = [
  { id: "semantic", name: "Semantisches Reasoning", description: "Analyse & Mustererkennung" },
  { id: "decision", name: "Entscheidungs-Engine", description: "Strategische Planung" },
  { id: "resource", name: "Ressourcen-Orchestrierung", description: "API & Cloud Services" },
  { id: "knowledge", name: "Wissensmanagement", description: "Knowledge Graph" },
  { id: "web", name: "Web-Interaktion", description: "Scraping & Browser" },
  { id: "visual", name: "Visuelle Konzepte", description: "Bild-Generierung" },
  { id: "skill", name: "Skill-Manager", description: "Code-Ausführung" },
];

export const FusionChat = () => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeNodes, setActiveNodes] = useState<string[]>(AI_NODES.map(n => n.id));
  const { messages, isLoading, sendMessage, clearChat } = useFusionChat();
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
      sendMessage(input, activeNodes);
      setInput("");
    }
  };

  const toggleNode = (nodeId: string) => {
    setActiveNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
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

  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col glass-card border-primary/20">
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary">
            <Sparkles className="h-6 w-6 text-background" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Fusion-KI Chat
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeNodes.length} von {AI_NODES.length} Spezialisten aktiv
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-primary/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            KI-Auswahl
          </Button>
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

        {showSettings && (
          <div className="mt-4 p-4 glass-card border-primary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Aktive KI-Knoten
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveNodes(AI_NODES.map(n => n.id))}
                  className="text-xs"
                >
                  Alle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveNodes([])}
                  className="text-xs"
                >
                  Keine
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AI_NODES.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <Switch
                    id={node.id}
                    checked={activeNodes.includes(node.id)}
                    onCheckedChange={() => toggleNode(node.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={node.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {node.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
                <Sparkles className="h-8 w-8 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Willkommen beim Fusion-Chat</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Hier arbeiten alle KI-Spezialisten im Hintergrund zusammen und liefern dir eine
                  vereinte, hochqualitative Antwort.
                </p>
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
              className={`max-w-[80%] rounded-lg p-4 space-y-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "glass-card border-primary/20 mr-12"
              }`}
            >
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
            <div className="max-w-[80%] glass-card border-primary/20 rounded-lg p-4 mr-12">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm text-muted-foreground">
                  Alle Spezialisten beraten sich...
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
            placeholder="Stelle eine Frage an die fusionierte KI..."
            className="min-h-[80px] resize-none glass-card border-primary/20"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="gradient-primary hover:opacity-90 px-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
