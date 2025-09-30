import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  activeAI: string | null;
}

const ChatInterface = ({ activeAI }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hallo! Ich bin der KI-Orchestrator. Wähle eine KI aus der Hierarchie aus, um mit ihr zu interagieren.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeAI) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Verbunden mit ${activeAI}. Wie kann ich dir helfen?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeAI]);

  const handleSend = async () => {
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
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response (will be replaced with real Lovable AI call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[${activeAI}] Ich verarbeite deine Anfrage: "${input}". Das ist eine simulierte Antwort. Sobald Lovable Cloud aktiviert ist, werden hier echte KI-Antworten erscheinen.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Konnte keine Antwort generieren.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Chat Interface
        </h2>
        {activeAI && (
          <p className="text-xs text-muted-foreground mt-1">Aktiv: {activeAI}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Nachricht eingeben..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
