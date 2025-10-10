import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Brain, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIWorker {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  progress: number;
  currentTask: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AI_WORKERS: Omit<AIWorker, 'status' | 'progress' | 'currentTask'>[] = [
  { id: 'semantic-1', name: 'Semantic Alpha', type: 'semantic' },
  { id: 'semantic-2', name: 'Semantic Beta', type: 'semantic' },
  { id: 'decision-1', name: 'Decision Alpha', type: 'decision' },
  { id: 'decision-2', name: 'Decision Beta', type: 'decision' },
  { id: 'resource-1', name: 'Resource Alpha', type: 'resource' },
  { id: 'resource-2', name: 'Resource Beta', type: 'resource' },
  { id: 'knowledge-1', name: 'Knowledge Alpha', type: 'knowledge' },
  { id: 'knowledge-2', name: 'Knowledge Beta', type: 'knowledge' },
  { id: 'web-1', name: 'Web Alpha', type: 'web' },
  { id: 'web-2', name: 'Web Beta', type: 'web' },
  { id: 'visual-1', name: 'Visual Alpha', type: 'visual' },
  { id: 'visual-2', name: 'Visual Beta', type: 'visual' },
  { id: 'skill-1', name: 'Skill Alpha', type: 'skill' },
  { id: 'skill-2', name: 'Skill Beta', type: 'skill' },
  { id: 'fusion-1', name: 'Fusion Coordinator', type: 'fusion' },
  { id: 'meta-1', name: 'Meta Supervisor', type: 'meta' },
];

export const AIGridSystem = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [workers, setWorkers] = useState<AIWorker[]>(
    AI_WORKERS.map(w => ({ ...w, status: 'idle', progress: 0, currentTask: 'Warten...' }))
  );
  const [totalProgress, setTotalProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      semantic: 'bg-blue-500',
      decision: 'bg-purple-500',
      resource: 'bg-green-500',
      knowledge: 'bg-yellow-500',
      web: 'bg-orange-500',
      visual: 'bg-pink-500',
      skill: 'bg-red-500',
      fusion: 'bg-indigo-500',
      meta: 'bg-cyan-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusIcon = (status: AIWorker['status']) => {
    switch (status) {
      case 'working':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const simulateWork = () => {
    setWorkers(prev => prev.map(worker => {
      if (worker.status === 'completed') return worker;
      
      const newProgress = Math.min(100, worker.progress + Math.random() * 8);
      const tasks = [
        'Analysiere Daten...',
        'Verarbeite Kontext...',
        'Generiere Insights...',
        'Optimiere Strategie...',
        'Synthetisiere Ergebnisse...',
        'Validiere Output...',
      ];
      
      return {
        ...worker,
        status: newProgress >= 100 ? 'completed' : 'working',
        progress: newProgress,
        currentTask: newProgress < 100 ? tasks[Math.floor(Math.random() * tasks.length)] : 'Abgeschlossen!',
      };
    }));
  };

  const calculateTotalProgress = () => {
    const total = workers.reduce((sum, w) => sum + w.progress, 0);
    const percentage = (total / (workers.length * 100)) * 100;
    setTotalProgress(Math.round(percentage));
  };

  useEffect(() => {
    calculateTotalProgress();
  }, [workers]);

  const startWork = () => {
    setIsRunning(true);
    setWorkers(prev => prev.map(w => ({ 
      ...w, 
      status: 'working', 
      progress: 0,
      currentTask: 'Initialisiere...'
    })));
    
    intervalRef.current = window.setInterval(simulateWork, 200);
    
    toast({
      title: "KI-Grid gestartet! 🚀",
      description: `${workers.length} KI-Arbeiter beginnen ihre Aufgaben`,
    });
  };

  const stopWork = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const completedCount = workers.filter(w => w.status === 'completed').length;
    toast({
      title: "KI-Grid gestoppt",
      description: `${completedCount} von ${workers.length} Aufgaben abgeschlossen (${totalProgress}%)`,
    });
  };

  const resetWork = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setWorkers(prev => prev.map(w => ({ 
      ...w, 
      status: 'idle', 
      progress: 0,
      currentTask: 'Warten...'
    })));
    setTotalProgress(0);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fusion-chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          activeNodes: workers.filter(w => w.status === 'completed').map(w => w.type),
          context: {
            totalProgress,
            completedWorkers: workers.filter(w => w.status === 'completed').length,
            activeWorkers: workers.filter(w => w.status === 'working').length,
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const completedWorkers = workers.filter(w => w.status === 'completed').length;
  const workingWorkers = workers.filter(w => w.status === 'working').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Left: AI Grid */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6 glass-card border-primary/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Brain className="h-6 w-6 text-background" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">KI-Schachbrett</h2>
                <p className="text-sm text-muted-foreground">
                  {workers.length} autonome KI-Arbeiter
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={startWork}
                disabled={isRunning}
                className="gradient-primary"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                onClick={stopWork}
                disabled={!isRunning}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </Button>
              <Button
                onClick={resetWork}
                variant="ghost"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Gesamtfortschritt</span>
              <span className="font-bold text-primary">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Aktiv: {workingWorkers}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Fertig: {completedWorkers}
              </span>
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Bereit: {workers.length - workingWorkers - completedWorkers}
              </span>
            </div>
          </div>

          {/* AI Grid */}
          <div className="grid grid-cols-4 gap-3 max-h-[calc(100vh-26rem)] overflow-y-auto">
            {workers.map((worker) => (
              <Card
                key={worker.id}
                className={`p-3 transition-all duration-300 border-2 ${
                  worker.status === 'working' 
                    ? 'border-primary animate-pulse-glow' 
                    : worker.status === 'completed'
                    ? 'border-success'
                    : 'border-border/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getTypeColor(worker.type)} text-xs`}>
                      {worker.type}
                    </Badge>
                    {getStatusIcon(worker.status)}
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold truncate">{worker.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {worker.currentTask}
                    </p>
                  </div>
                  
                  <Progress value={worker.progress} className="h-1" />
                  <p className="text-xs text-right font-mono">{Math.round(worker.progress)}%</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Right: Chat */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col glass-card border-primary/20">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
            <h3 className="font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Grid-Chat
            </h3>
            <p className="text-xs text-muted-foreground">
              Kommuniziere mit dem KI-Grid
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Stelle Fragen an das KI-Grid...
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'glass-card border-primary/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString('de-DE')}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card border-primary/20 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nachricht..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};