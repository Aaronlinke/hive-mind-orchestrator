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
  const [pendingRequest, setPendingRequest] = useState<string>("");
  const [backgroundResults, setBackgroundResults] = useState<any[]>([]);
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
      const newProgress = Math.min(100, worker.progress + Math.random() * 8);
      const tasks = [
        'Analysiere Daten...',
        'Verarbeite Kontext...',
        'Generiere Insights...',
        'Optimiere Strategie...',
        'Synthetisiere Ergebnisse...',
        'Validiere Output...',
      ];
      
      // Bei 100% wieder von vorne beginnen für kontinuierlichen Betrieb
      if (newProgress >= 100) {
        return {
          ...worker,
          status: 'working',
          progress: 0,
          currentTask: 'Nächster Zyklus...',
        };
      }
      
      return {
        ...worker,
        status: 'working',
        progress: newProgress,
        currentTask: tasks[Math.floor(Math.random() * tasks.length)],
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

  const startWork = async () => {
    if (!input.trim()) {
      toast({
        title: "Keine Frage",
        description: "Bitte gib eine Frage ein",
        variant: "destructive",
      });
      return;
    }

    setPendingRequest(input);
    setInput("");
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
      description: `${workers.length} KI-Arbeiter verarbeiten deine Anfrage im Hintergrund`,
    });

    // Verarbeite im Hintergrund
    try {
      const messageText = input;
      const relevantTypes = new Set<string>(['semantic', 'decision', 'knowledge', 'web', 'resource', 'visual', 'skill', 'fusion']);
      
      const workerPromises = Array.from(relevantTypes).map(async (type) => {
        const functionName = getEdgeFunctionForType(type);
        if (!functionName) return null;

        try {
          if (functionName === 'fusion-chat') {
            const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fusion-chat`;
            const resp = await fetch(CHAT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                request: messageText,
                context: { conversationHistory: messages.slice(-5).map(m => ({ role: m.role, content: m.content })) },
                activeNodes: Array.from(relevantTypes).filter(t => t !== 'fusion'),
              }),
            });

            if (!resp.ok || !resp.body) return { type, error: 'Failed' };

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let assistant = '';
            let done = false;
            while (!done) {
              const { done: d, value } = await reader.read();
              if (d) break;
              buffer += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buffer.indexOf('\n')) !== -1) {
                let line = buffer.slice(0, idx);
                buffer = buffer.slice(idx + 1);
                if (line.endsWith('\r')) line = line.slice(0, -1);
                if (line.startsWith(':') || line.trim() === '') continue;
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') { done = true; break; }
                try {
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                  if (content) assistant += content;
                } catch {
                  buffer = line + '\n' + buffer;
                  break;
                }
              }
            }
            return { type, result: { response: assistant } };
          }

          const { data, error } = await supabase.functions.invoke(functionName, {
            body: { 
              request: messageText,
              context: { conversationHistory: messages.slice(-5).map(m => ({ role: m.role, content: m.content })) }
            }
          });

          if (error) return { type, error: error.message };
          return { type, result: data };
        } catch (err) {
          return { type, error: String(err) };
        }
      });

      const results = await Promise.all(workerPromises);
      setBackgroundResults(results.filter(r => r && !r.error));
    } catch (error) {
      console.error('Background processing error:', error);
    }
  };

  const stopWork = async () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Generiere finale Antwort
    if (pendingRequest && backgroundResults.length > 0) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: pendingRequest,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      let responseContent = `🎯 **Finale Systemantwort:**\n\n`;
      backgroundResults.forEach((result) => {
        const resultData = result.result;
        let content = '';
        
        if (resultData?.response) content = resultData.response;
        else if (resultData?.prognosis) content = JSON.stringify(resultData.prognosis, null, 2);
        else if (resultData?.decision) content = JSON.stringify(resultData.decision, null, 2);
        else if (resultData?.plan) content = JSON.stringify(resultData.plan, null, 2);
        else content = JSON.stringify(resultData, null, 2);

        responseContent += `**${result.type.toUpperCase()}:** ${content}\n\n`;
      });

      // System-Reflexion über gesamten Chatverlauf
      responseContent += `\n---\n\n🧠 **System-Reflexion:**\n\n`;
      
      try {
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fusion-chat`;
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            request: `Reflektiere den gesamten Chatverlauf und fasse die wichtigsten Erkenntnisse zusammen. Chatverlauf: ${JSON.stringify(messages.map(m => ({ role: m.role, content: m.content })))}`,
            context: {},
            activeNodes: ['semantic', 'decision', 'knowledge'],
          }),
        });

        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let reflection = '';
          let done = false;
          while (!done) {
            const { done: d, value } = await reader.read();
            if (d) break;
            buffer += decoder.decode(value, { stream: true });
            let idx: number;
            while ((idx = buffer.indexOf('\n')) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith('\r')) line = line.slice(0, -1);
              if (line.startsWith(':') || line.trim() === '') continue;
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') { done = true; break; }
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) reflection += content;
              } catch {
                buffer = line + '\n' + buffer;
                break;
              }
            }
          }
          responseContent += reflection;
        }
      } catch (error) {
        responseContent += 'Reflexion konnte nicht durchgeführt werden.';
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      setPendingRequest("");
      setBackgroundResults([]);
    }

    setWorkers(prev => prev.map(w => ({ 
      ...w, 
      status: 'completed' as const,
      progress: 100,
      currentTask: 'Abgeschlossen'
    })));
    
    toast({
      title: "Finale Antwort generiert! ✓",
      description: "System-Reflexion abgeschlossen",
    });
  };

  const resetWork = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setPendingRequest("");
    setBackgroundResults([]);
    setWorkers(prev => prev.map(w => ({ 
      ...w, 
      status: 'idle', 
      progress: 0,
      currentTask: 'Warten...'
    })));
    setTotalProgress(0);
  };

  const getEdgeFunctionForType = (type: string): string | null => {
    const mapping: Record<string, string> = {
      'semantic': 'semantic-reasoning',
      'decision': 'decision-engine',
      'resource': 'resource-orchestration',
      'knowledge': 'knowledge-manager',
      'web': 'web-interaction',
      'visual': 'visual-concept-generator',
      'skill': 'skill-manager',
      'fusion': 'fusion-chat',
      'meta': 'hierarchical-ai',
    };
    return mapping[type] || null;
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
                Ergebnisse erscheinen hier nach Stop
              </div>
            )}

            {!isRunning && messages.map((message) => (
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

            {isRunning && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">System arbeitet im Hintergrund...</p>
                  <p className="text-xs text-muted-foreground mt-1">Drücke Stop für finale Antwort</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stelle deine Frage an das Betriebssystem..."
                className="min-h-[80px] resize-none"
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground">
                {pendingRequest ? `⏳ Verarbeite: "${pendingRequest}"` : "Gib deine Frage ein und drücke Start"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};