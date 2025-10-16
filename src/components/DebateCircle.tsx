import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluateTextAdvanced, calculateConsensus } from "@/lib/textEvaluator";

interface DebateMessage {
  agent: string;
  message: string;
  timestamp: number;
  color: string;
}

const AGENTS = [
  { id: 'semantic', name: 'Semantik', color: 'text-blue-500' },
  { id: 'decision', name: 'Entscheidung', color: 'text-purple-500' },
  { id: 'knowledge', name: 'Wissen', color: 'text-green-500' },
  { id: 'visual', name: 'Visuell', color: 'text-pink-500' },
  { id: 'skill', name: 'Skill', color: 'text-orange-500' },
  { id: 'resource', name: 'Ressource', color: 'text-cyan-500' },
];

export const DebateCircle = () => {
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentAgent, setCurrentAgent] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDebating && topic) {
      const timer = setTimeout(() => {
        generateDebateMessage();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDebating, currentAgent, topic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateDebateMessage = () => {
    const agent = AGENTS[currentAgent];
    
    // Simuliere intelligente Debattenbeiträge basierend auf Agent-Typ
    const perspectives = {
      'semantic': `Aus semantischer Sicht zu "${topic}": Das zugrundeliegende Konzept zeigt interessante Muster in der begrifflichen Struktur und weist auf tiefere kausale Zusammenhänge hin...`,
      'decision': `Entscheidungslogisch betrachtet bei "${topic}": Wir müssen die Risiken gegen den erwarteten Nutzen abwägen, wobei Unsicherheitsfaktoren quantifiziert werden sollten...`,
      'knowledge': `Basierend auf dem Wissensgraphen zu "${topic}": Historische Daten zeigen signifikante Korrelationen mit ähnlichen Domänen, was auf erprobte Lösungsansätze hinweist...`,
      'visual': `Die visuelle Darstellung von "${topic}": Wir könnten dies durch mehrdimensionale Diagramme verdeutlichen, die komplexe Zusammenhänge intuitiv erfassbar machen...`,
      'skill': `Skill-technisch für "${topic}": Wir benötigen spezielle interdisziplinäre Fähigkeiten, um dies effektiv umzusetzen und zu optimieren...`,
      'resource': `Ressourcen-Analyse zu "${topic}": Die Allokation sollte algorithmisch optimiert werden durch adaptive Verteilungsstrategien und Echtzeitanpassung...`,
    };

    const messageText = perspectives[agent.id as keyof typeof perspectives];
    
    // Evaluiere Text-Qualität mit lokalem Evaluator
    const evaluation = evaluateTextAdvanced(messageText);
    
    const message: DebateMessage = {
      agent: agent.name,
      message: messageText,
      timestamp: Date.now(),
      color: agent.color,
    };

    setMessages(prev => [...prev, message]);
    setCurrentAgent((prev) => (prev + 1) % AGENTS.length);
  };

  const startDebate = () => {
    if (!topic.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib ein Debattenthema ein",
        variant: "destructive",
      });
      return;
    }

    setIsDebating(true);
    toast({
      title: "Debatte gestartet",
      description: `${AGENTS.length} KI-Agenten diskutieren: "${topic}"`,
    });
  };

  const pauseDebate = () => {
    setIsDebating(false);
    toast({
      title: "Debatte pausiert",
      description: "Die Diskussion wurde angehalten",
    });
  };

  const resetDebate = () => {
    setIsDebating(false);
    setMessages([]);
    setCurrentAgent(0);
    setTopic("");
    toast({
      title: "Debatte zurückgesetzt",
      description: "Bereit für ein neues Thema",
    });
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KI-Debattenkreis</h3>
        </div>
        <Badge variant={isDebating ? "default" : "outline"} className="animate-pulse">
          {isDebating ? "AKTIV" : "BEREIT"}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Debattenthema eingeben..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isDebating}
          onKeyDown={(e) => e.key === "Enter" && !isDebating && startDebate()}
        />
        <div className="flex gap-2">
          {!isDebating ? (
            <Button onClick={startDebate} size="icon" className="shrink-0">
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={pauseDebate} size="icon" variant="secondary" className="shrink-0">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={resetDebate} size="icon" variant="outline" className="shrink-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agent Circle Visualization */}
      <div className="relative h-48 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-32 h-32 rounded-full border-4 border-primary/20",
            isDebating && "animate-spin"
          )} style={{ animationDuration: '8s' }} />
        </div>
        
        {AGENTS.map((agent, index) => {
          const angle = (index / AGENTS.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={agent.id}
              className={cn(
                "absolute w-12 h-12 rounded-full flex items-center justify-center",
                "border-2 bg-card transition-all duration-300",
                currentAgent === index && isDebating 
                  ? "scale-125 shadow-lg border-primary" 
                  : "border-border"
              )}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className={cn("text-xs font-bold", agent.color)}>
                {agent.name.slice(0, 1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Debate Messages */}
      <div className="space-y-2 max-h-64 overflow-y-auto p-4 rounded-lg border bg-muted/50">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Debatte aktiv. Starte eine Diskussion!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-card border animate-fadeIn">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={msg.color}>
                  {msg.agent}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
        <span>{messages.length} Beiträge</span>
        <span>{AGENTS.length} aktive KI-Agenten</span>
        {messages.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            Konsensus: {Math.round(calculateConsensus(
              messages.slice(-3).map(m => evaluateTextAdvanced(m.message))
            ))}%
          </Badge>
        )}
      </div>
    </Card>
  );
};
