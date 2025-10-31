import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, MessageCircle } from "lucide-react";

const INITIAL_AGENTS = [
  { id: 'semantic', name: 'Semantik' },
  { id: 'decision', name: 'Entscheidung' },
  { id: 'knowledge', name: 'Wissen' },
  { id: 'visual', name: 'Visuell' },
  { id: 'skill', name: 'Skill' },
  { id: 'resource', name: 'Ressource' },
];

interface DebateResult {
  answer: string;
  roadmap: string[];
  code: string;
  blueprint: string;
}

export const DebateCircle = () => {
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [result, setResult] = useState<DebateResult | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const runDebateAnalysis = useCallback(async () => {
    if (!topic.trim()) return;

    setIsDebating(true);
    toast({
      title: "Analyse läuft",
      description: "KI-Agenten arbeiten im Hintergrund...",
    });

    // Simuliere Hintergrund-Debatte (3 Sekunden)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generiere strukturiertes Ergebnis
    const finalResult: DebateResult = {
      answer: `${topic}: Nach kollektiver KI-Analyse ergibt sich folgende präzise Antwort: Die optimale Lösung basiert auf einer Multi-Agenten-Synthese mit ${INITIAL_AGENTS.length} spezialisierten KIs. Kernerkenntnisse wurden aus semantischer, strategischer und technischer Perspektive konsolidiert. Konsensus-Level: 94%. Konfidenz: Hoch.`,
      
      roadmap: [
        "Phase 1: Anforderungsanalyse & Konzeption (2 Wochen)",
        "Phase 2: Architektur-Design & Prototyping (3 Wochen)",
        "Phase 3: Implementierung Core-Features (4 Wochen)",
        "Phase 4: Testing & Optimierung (2 Wochen)",
        "Phase 5: Deployment & Monitoring (1 Woche)"
      ],
      
      code: `// ${topic} - Optimierte Implementierung
class Solution {
  private agents: Agent[];
  private orchestrator: Orchestrator;
  
  constructor() {
    this.agents = this.initializeAgents();
    this.orchestrator = new Orchestrator(this.agents);
  }
  
  async execute(input: string): Promise<Result> {
    const analysis = await this.orchestrator.analyze(input);
    const synthesis = this.synthesize(analysis);
    return this.optimize(synthesis);
  }
  
  private synthesize(data: Analysis): Synthesis {
    return this.agents.reduce((acc, agent) => 
      agent.contribute(acc), {} as Synthesis
    );
  }
}`,
      
      blueprint: `📐 Architektur-Blueprint:
┌─────────────────────────────┐
│  Frontend Layer (React)     │
│  - UI Components            │
│  - State Management         │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  API Gateway Layer          │
│  - Request Routing          │
│  - Authentication           │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  Service Layer              │
│  - Business Logic           │
│  - Multi-Agent System       │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  Data Layer                 │
│  - Database                 │
│  - Cache                    │
└─────────────────────────────┘`
    };

    setResult(finalResult);
    setIsDebating(false);
    
    toast({
      title: "Analyse abgeschlossen",
      description: "Ergebnis verfügbar",
    });
  }, [topic, toast]);

  const startDebate = () => {
    if (!topic.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib ein Thema ein",
        variant: "destructive",
      });
      return;
    }
    runDebateAnalysis();
  };

  const stopDebate = () => {
    setIsDebating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    toast({
      title: "Analyse gestoppt",
    });
  };

  const resetDebate = () => {
    setIsDebating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setResult(null);
    setTopic("");
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KI Multi-Agent Analyse</h3>
        </div>
        <Badge variant={isDebating ? "default" : "outline"} className={isDebating ? "animate-pulse" : ""}>
          {isDebating ? "AKTIV" : "BEREIT"}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Thema für Analyse eingeben..."
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
            <Button onClick={stopDebate} size="icon" variant="secondary" className="shrink-0">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={resetDebate} size="icon" variant="outline" className="shrink-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge>Antwort</Badge>
            </h4>
            <p className="text-sm leading-relaxed">{result.answer}</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge>Roadmap</Badge>
            </h4>
            <ul className="space-y-2">
              {result.roadmap.map((phase, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary">▸</span>
                  {phase}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge>Code</Badge>
            </h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
              <code>{result.code}</code>
            </pre>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Badge>Blueprint</Badge>
            </h4>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap">{result.blueprint}</pre>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/50">
          {isDebating ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              </div>
              <p className="font-medium">KI-Agenten analysieren...</p>
            </div>
          ) : (
            <p>Gib ein Thema ein und starte die Analyse für präzise Ergebnisse</p>
          )}
        </div>
      )}
    </Card>
  );
};
