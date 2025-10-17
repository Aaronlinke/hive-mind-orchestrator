import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluateTextAdvanced, calculateConsensus, EvalResult } from "@/lib/textEvaluator";

interface DebateMessage {
  agent: string;
  message: string;
  timestamp: number;
  color: string;
  score: number;
  evaluation: EvalResult;
}

interface AgentState {
  id: string;
  name: string;
  color: string;
  competence: number;
  successRate: number;
}

const INITIAL_AGENTS: AgentState[] = [
  { id: 'semantic', name: 'Semantik', color: 'text-blue-500', competence: 0.8, successRate: 0 },
  { id: 'decision', name: 'Entscheidung', color: 'text-purple-500', competence: 0.75, successRate: 0 },
  { id: 'knowledge', name: 'Wissen', color: 'text-green-500', competence: 0.85, successRate: 0 },
  { id: 'visual', name: 'Visuell', color: 'text-pink-500', competence: 0.7, successRate: 0 },
  { id: 'skill', name: 'Skill', color: 'text-orange-500', competence: 0.78, successRate: 0 },
  { id: 'resource', name: 'Ressource', color: 'text-cyan-500', competence: 0.82, successRate: 0 },
];

export const DebateCircle = () => {
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [debateCycle, setDebateCycle] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getContextFromPreviousMessages = useCallback((count: number = 3): string => {
    if (messages.length === 0) return "";
    
    const recentMessages = messages.slice(-count);
    const bestMessage = recentMessages.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return bestMessage.message;
  }, [messages]);

  const generateEnhancedPerspective = useCallback((
    agent: AgentState, 
    baseTopic: string,
    context: string,
    cycle: number
  ): string => {
    const previousInsight = context ? ` Aufbauend auf der Erkenntnis: "${context.substring(0, 60)}..."` : "";
    
    const perspectives: Record<string, string> = {
      'semantic': `[Zyklus ${cycle}] Semantische Tiefenanalyse zu "${baseTopic}": ${previousInsight} Die konzeptionelle Struktur offenbart hierarchische Bedeutungsebenen mit kausalen Interdependenzen. Besonders relevant: Die emergenten Muster zeigen auf metakognitive Prozesse hin, die durch iterative Reflexion verstärkt werden können. Schlüsselelemente: begriffliche Kohärenz (${(agent.competence * 100).toFixed(0)}%), Strukturdichte, semantische Validität.`,
      
      'decision': `[Zyklus ${cycle}] Entscheidungsmatrix für "${baseTopic}": ${previousInsight} Multi-Kriterien-Analyse ergibt: Nutzen/Risiko-Verhältnis 1:${(1/agent.competence).toFixed(1)}, Unsicherheitsreduktion durch bayesianische Inferenz möglich. Handlungsempfehlung: Probabilistische Gewichtung mit Konfidenzintervall ${(agent.competence * 100).toFixed(0)}%. Optimierungspotential durch adaptive Strategieanpassung erkennbar.`,
      
      'knowledge': `[Zyklus ${cycle}] Wissensgraph-Integration "${baseTopic}": ${previousInsight} Datenbank zeigt ${Math.floor(agent.competence * 1000)} relevante Knotenpunkte. Querverweise zu historischen Erfolgsmustern: Korrelationskoeffizient r=${agent.competence.toFixed(2)}. Evidenzbasierte Empfehlung: Synthese aus bewährten Methodiken mit ${(agent.competence * 100).toFixed(0)}% Übereinstimmung in Validierungsstudien.`,
      
      'visual': `[Zyklus ${cycle}] Multidimensionale Visualisierung "${baseTopic}": ${previousInsight} Konzeptionelle Darstellung erfordert ${Math.floor(3 + agent.competence * 5)}D-Raum. Tensorvisualisierung zeigt Hauptachsen: Komplexität (Eigenwert ${agent.competence.toFixed(2)}), Kohärenz, Emergenz. Gestaltpsychologische Prinzipien ermöglichen intuitive Erfassung durch hierarchische Clusterbildung.`,
      
      'skill': `[Zyklus ${cycle}] Kompetenzprofil-Analyse "${baseTopic}": ${previousInsight} Erforderliche Skill-Matrix umfasst ${Math.floor(agent.competence * 15)} interdisziplinäre Kompetenzen. Proficiency-Level: Expert (${(agent.competence * 100).toFixed(0)}%). Lernkurve optimierbar durch gezielte Skill-Augmentation und Cross-Training. Synergie-Effekte durch Team-Diversität: Faktor ${(1 + agent.competence).toFixed(2)}x.`,
      
      'resource': `[Zyklus ${cycle}] Ressourcen-Orchestrierung "${baseTopic}": ${previousInsight} Optimale Allokation nach Simplex-Algorithmus: CPU ${(agent.competence * 100).toFixed(0)}%, RAM ${(agent.competence * 80).toFixed(0)}%, I/O ${(agent.competence * 60).toFixed(0)}%. Adaptive Load-Balancing mit Predictive Scaling. Effizienzgewinn durch Parallelisierung: ${(agent.competence * 200).toFixed(0)}% Throughput-Steigerung möglich.`
    };
    
    return perspectives[agent.id] || `[Zyklus ${cycle}] Analyse zu "${baseTopic}" mit Kompetenz ${(agent.competence * 100).toFixed(0)}%`;
  }, []);

  const generateDebateMessage = useCallback(() => {
    if (!topic.trim()) return;

    const agent = agents[currentAgentIndex];
    const context = getContextFromPreviousMessages(3);
    const messageText = generateEnhancedPerspective(agent, topic, context, debateCycle);
    
    // Evaluiere Text-Qualität
    const evaluation = evaluateTextAdvanced(messageText, {
      complexityWeight: 0.4,
      uniquenessWeight: 0.6,
      minThreshold: 15.0,
      coherenceWeight: 0.2
    });
    
    // Score mit Agent-Kompetenz gewichten
    const weightedScore = evaluation.score * agent.competence;
    
    const message: DebateMessage = {
      agent: agent.name,
      message: messageText,
      timestamp: Date.now(),
      color: agent.color,
      score: weightedScore,
      evaluation,
    };

    // Update best score
    if (weightedScore > bestScore) {
      setBestScore(weightedScore);
      toast({
        title: "Neuer Höchstwert!",
        description: `${agent.name}: ${weightedScore.toFixed(1)} Punkte`,
        duration: 2000,
      });
    }

    setMessages(prev => [...prev, message]);
    
    // Update agent competence based on performance
    setAgents(prevAgents => {
      const newAgents = [...prevAgents];
      const avgScore = messages.length > 0 
        ? messages.reduce((sum, m) => sum + m.score, 0) / messages.length 
        : 50;
      
      // Boost competence if above average
      if (weightedScore > avgScore) {
        newAgents[currentAgentIndex] = {
          ...agent,
          competence: Math.min(1.0, agent.competence * 1.02),
          successRate: agent.successRate + 1,
        };
      } else {
        // Slight decrease if below average
        newAgents[currentAgentIndex] = {
          ...agent,
          competence: Math.max(0.5, agent.competence * 0.99),
        };
      }
      
      return newAgents;
    });
    
    // Move to next agent
    setCurrentAgentIndex(prev => (prev + 1) % agents.length);
    
    // Increment cycle when all agents have spoken
    if ((currentAgentIndex + 1) % agents.length === 0) {
      setDebateCycle(prev => prev + 1);
    }
  }, [topic, agents, currentAgentIndex, debateCycle, messages, bestScore, generateEnhancedPerspective, getContextFromPreviousMessages, toast]);

  // Main debate loop
  useEffect(() => {
    if (isDebating && topic) {
      timerRef.current = setTimeout(() => {
        generateDebateMessage();
      }, 1500); // Schnellerer Zyklus für bessere UX
      
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isDebating, topic, currentAgentIndex, generateDebateMessage]);

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
    setDebateCycle(0);
    toast({
      title: "Debatte gestartet",
      description: `${agents.length} KI-Agenten diskutieren: "${topic}"`,
    });
  };

  const pauseDebate = () => {
    setIsDebating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    toast({
      title: "Debatte pausiert",
      description: `${messages.length} Beiträge, Cycle ${debateCycle}`,
    });
  };

  const resetDebate = () => {
    setIsDebating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages([]);
    setCurrentAgentIndex(0);
    setDebateCycle(0);
    setBestScore(0);
    setTopic("");
    setAgents(INITIAL_AGENTS);
    toast({
      title: "Debatte zurückgesetzt",
      description: "Bereit für ein neues Thema",
    });
  };

  const getConsensusLevel = (): number => {
    if (messages.length < 3) return 0;
    const recentEvals = messages.slice(-6).map(m => m.evaluation);
    return calculateConsensus(recentEvals);
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KI-Debattenkreis</h3>
          {debateCycle > 0 && (
            <Badge variant="secondary" className="text-xs">
              Cycle {debateCycle}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {bestScore > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {bestScore.toFixed(1)}
            </Badge>
          )}
          <Badge variant={isDebating ? "default" : "outline"} className={isDebating ? "animate-pulse" : ""}>
            {isDebating ? "AKTIV" : "BEREIT"}
          </Badge>
        </div>
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
        
        {agents.map((agent, index) => {
          const angle = (index / agents.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isActive = currentAgentIndex === index && isDebating;
          const competencePercent = Math.round(agent.competence * 100);
          
          return (
            <div
              key={agent.id}
              className={cn(
                "absolute w-12 h-12 rounded-full flex items-center justify-center",
                "border-2 bg-card transition-all duration-300 cursor-help",
                isActive
                  ? "scale-125 shadow-lg border-primary" 
                  : "border-border hover:border-primary/50"
              )}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.6 + agent.competence * 0.4,
              }}
              title={`${agent.name}: ${competencePercent}% Kompetenz, ${agent.successRate} Erfolge`}
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
            <div key={idx} className="p-3 rounded-lg bg-card border animate-fadeIn hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={msg.color}>
                    {msg.agent}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {msg.score.toFixed(1)}
                  </Badge>
                  {msg.score === bestScore && (
                    <Badge variant="default" className="text-xs">
                      BEST
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{msg.message}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>Tokens: {msg.evaluation.tokenCount}</span>
                <span>Uniqueness: {(msg.evaluation.uniquenessRatio * 100).toFixed(0)}%</span>
                <span>Complexity: {msg.evaluation.complexity.toFixed(1)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground pt-3 border-t">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{messages.length}</span>
          <span>Beiträge</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{agents.length}</span>
          <span>Agenten</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{debateCycle}</span>
          <span>Zyklen</span>
        </div>
        {messages.length >= 3 && (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{getConsensusLevel().toFixed(0)}%</span>
            <span>Konsensus</span>
          </div>
        )}
      </div>
    </Card>
  );
};
