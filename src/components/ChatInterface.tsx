import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import SelfImprovementPanel from "./SelfImprovementPanel";

interface ChatInterfaceProps {
  activeAIs: string[];
  multiSelectMode: boolean;
}

const ChatInterface = ({ activeAIs, multiSelectMode }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { messages, isLoading, sendMessage, clearChat, setMessages } = useChat({ activeAIs, multiSelectMode });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeAIs.length > 0) {
      const aiNames = activeAIs.join(", ");
      const message = multiSelectMode && activeAIs.length > 1
        ? `Verbunden mit mehreren KIs: ${aiNames}. Alle werden deine Frage beantworten!`
        : `Verbunden mit ${aiNames}. Wie kann ich dir helfen?`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: message,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeAIs, multiSelectMode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Chat gelöscht",
      description: "Die Konversation wurde zurückgesetzt.",
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Kopiert!",
        description: "Nachricht in Zwischenablage kopiert.",
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-col h-[600px] glass-card">
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-6 h-6 text-primary animate-pulse-glow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Chat Interface</h2>
              {activeAIs.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  🟢 Aktiv: {activeAIs.length} KI{activeAIs.length > 1 ? "s" : ""} 
                  {multiSelectMode && activeAIs.length > 1 && " (Kombiniert)"}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            className="hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Chat löschen"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 group ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            {message.role === "assistant" && (
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg animate-float">
                <Bot className="w-5 h-5 text-background" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-4 backdrop-blur-sm relative ${
                message.role === "user"
                  ? "gradient-accent text-background shadow-lg"
                  : "glass-card text-foreground"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-between mt-2 gap-2">
                <p className="text-xs opacity-70 font-medium tabular-nums">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(message.content, message.id)}
                >
                  {copiedId === message.id ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            {message.role === "user" && (
              <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-5 h-5 text-background" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse-glow">
              <Bot className="w-5 h-5 text-background animate-pulse" />
            </div>
            <div className="glass-card rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/50 bg-background-elevated">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Nachricht eingeben..."
            disabled={isLoading}
            className="flex-1 glass-card border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="gradient-primary hover:scale-105 transition-transform shadow-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>

    <SelfImprovementPanel 
      lastMessageId={messages[messages.length - 1]?.id || null}
      lastAIResponse={messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1].content : ""}
      aiNodeId={activeAIs[0] || null}
      aiNodeType={activeAIs[0] ? (activeAIs[0].includes("director") ? "director" : activeAIs[0].includes("manager") ? "manager" : "specialist") : null}
    />
    </div>
  );
};

export default ChatInterface;
