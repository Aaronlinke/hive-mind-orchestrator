import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, MessageCircle, Brain, Zap, Target, Database, Globe, Cpu, Layers, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AGENTS = [
  { id: 'semantic', name: 'Semantik', icon: Brain, color: 'text-primary', perspective: 'semantische Tiefenanalyse und Bedeutungsebenen' },
  { id: 'decision', name: 'Entscheidung', icon: Target, color: 'text-accent', perspective: 'strategische Optionsbewertung und Entscheidungslogik' },
  { id: 'knowledge', name: 'Wissen', icon: Database, color: 'text-secondary', perspective: 'Fachwissen, Kontext und historische Daten' },
  { id: 'visual', name: 'Visuell', icon: Layers, color: 'text-primary', perspective: 'visuelle Konzepte, Strukturen und Diagramme' },
  { id: 'skill', name: 'Skill', icon: Cpu, color: 'text-accent', perspective: 'technische Umsetzung und Best Practices' },
  { id: 'resource', name: 'Ressource', icon: Globe, color: 'text-secondary', perspective: 'Ressourcenplanung, Aufwand und Optimierung' },
];

interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  loading: boolean;
}

export const DebateCircle = () => {
  const [topic, setTopic] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef(false);

  const askAgent = async (agentId: string, agentName: string, perspective: string, topic: string) => {
    const { data, error } = await supabase.functions.invoke('gemini-free-ai', {
      body: {
        prompt: `Analysiere dieses Thema aus der Perspektive von ${perspective}:\n\n"${topic}"\n\nGib eine präzise, strukturierte Antwort in 3-5 Sätzen. Fokussiere auf deinen Spezialbereich.`,
        systemPrompt: `Du bist ein KI-Spezialist für ${perspective}. Antworte präzise und fachkundig auf Deutsch. Nutze kurze, klare Sätze.`,
        model: 'gemini-2.5-flash',
      }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data?.text || '';
  };

  const runDebate = useCallback(async () => {
    if (!topic.trim()) {
      toast({ title: "Fehler", description: "Bitte gib ein Thema ein", variant: "destructive" });
      return;
    }

    setIsDebating(true);
    setSynthesis(null);
    abortRef.current = false;

    // Initialisiere alle Agenten als "loading"
    setAgentResponses(AGENTS.map(a => ({ agentId: a.id, agentName: a.name, content: '', loading: true })));

    toast({ title: "🧠 Debatte gestartet", description: "6 KI-Agenten analysieren parallel..." });

    try {
      // Alle Agenten parallel befragen
      await Promise.all(
        AGENTS.map(async (agent) => {
          try {
            const content = await askAgent(agent.id, agent.name, agent.perspective, topic);
            if (!abortRef.current) {
              setAgentResponses(prev =>
                prev.map(r => r.agentId === agent.id ? { ...r, content, loading: false } : r)
              );
            }
          } catch (err) {
            if (!abortRef.current) {
              setAgentResponses(prev =>
                prev.map(r => r.agentId === agent.id ? { ...r, content: '❌ Fehler bei Analyse', loading: false } : r)
              );
            }
          }
        })
      );

      if (abortRef.current) return;

      // Synthese aus allen Perspektiven
      toast({ title: "🔬 Synthese läuft...", description: "Master-KI konsolidiert alle Perspektiven" });

      const perspectivesSummary = AGENTS.map(a => a.perspective).join(', ');
      const { data: synthData, error: synthError } = await supabase.functions.invoke('gemini-free-ai', {
        body: {
          prompt: `Synthesiere eine Gesamtlösung für:\n\n"${topic}"\n\nBerücksichtige alle 6 Perspektiven: ${perspectivesSummary}.\n\nStrukturiere die Antwort mit:\n## 🎯 Kernlösung\n## 🗺️ Roadmap (3-5 Schritte)\n## 💡 Wichtigste Erkenntnis`,
          systemPrompt: `Du bist ein Master-Orchestrator der alle Expertenmeinungen zu einer kohärenten, umsetzbaren Lösung synthetisiert. Antworte auf Deutsch mit klarer Struktur.`,
          model: 'gemini-2.5-pro',
        }
      });

      if (!synthError && synthData?.text) {
        setSynthesis(synthData.text);
        toast({ title: "✅ Debatte abgeschlossen", description: "Synthese erfolgreich erstellt" });
      }
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setIsDebating(false);
    }
  }, [topic, toast]);

  const resetDebate = () => {
    abortRef.current = true;
    setIsDebating(false);
    setAgentResponses([]);
    setSynthesis(null);
    setTopic("");
  };

  const copySynthesis = async () => {
    if (!synthesis) return;
    await navigator.clipboard.writeText(synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KI Multi-Agent Debatte</h3>
        </div>
        <Badge variant={isDebating ? "default" : "outline"} className={isDebating ? "animate-pulse" : ""}>
          {isDebating ? "LÄUFT" : agentResponses.length > 0 ? "FERTIG" : "BEREIT"}
        </Badge>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Thema oder Frage für die Debatte eingeben..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isDebating}
          rows={3}
          className="resize-none"
        />
        <div className="flex gap-2">
          <Button
            onClick={runDebate}
            disabled={isDebating || !topic.trim()}
            className="flex-1 gap-2"
          >
            {isDebating ? (
              <><Zap className="h-4 w-4 animate-pulse" />Analysiere...</>
            ) : (
              <><Play className="h-4 w-4" />Debatte starten</>
            )}
          </Button>
          <Button onClick={resetDebate} size="icon" variant="outline" disabled={isDebating && agentResponses.length === 0}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agent Response Grid */}
      {agentResponses.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {agentResponses.map((resp) => {
            const agent = AGENTS.find(a => a.id === resp.agentId)!;
            const Icon = agent.icon;
            return (
              <div key={resp.agentId} className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${agent.color}`} />
                  <span className="text-xs font-semibold">{resp.agentName}</span>
                  {resp.loading && <div className="w-2 h-2 rounded-full animate-pulse ml-auto bg-primary" />}
                </div>
                {resp.loading ? (
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded animate-pulse w-full" />
                    <div className="h-2 bg-muted rounded animate-pulse w-4/5" />
                    <div className="h-2 bg-muted rounded animate-pulse w-3/5" />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{resp.content}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Synthesis */}
      {synthesis && (
        <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Master-Synthese
            </h4>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={copySynthesis}>
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{synthesis}</p>
        </div>
      )}

      {agentResponses.length === 0 && !isDebating && (
        <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/30">
          <div className="flex justify-center gap-2 mb-3">
            {AGENTS.map((a) => {
              const Icon = a.icon;
              return <Icon key={a.id} className={`h-5 w-5 ${a.color} opacity-60`} />;
            })}
          </div>
          <p className="text-sm">Gib ein Thema ein — 6 spezialisierte KIs debattieren und synthetisieren eine Lösung</p>
        </div>
      )}
    </Card>
  );
};
