import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, Swords, Loader2, Sparkles } from "lucide-react";

interface DebateEntry {
  brain: string;
  message: string;
  round: number;
}

interface DebateResult {
  topic: string;
  rounds: number;
  debate: DebateEntry[];
  synthesis: string;
  brains: {
    alpha: { role: string; totalMessages: number };
    omega: { role: string; totalMessages: number };
  };
}

export const DualBrainDebate = () => {
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(3);
  const [result, setResult] = useState<DebateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const { toast } = useToast();

  const startDebate = async () => {
    if (!topic.trim()) {
      toast({ title: "Thema eingeben", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setCurrentStatus("🧠 Dual Brain Debate startet...");

    try {
      const { data, error } = await supabase.functions.invoke('dual-brain-debate', {
        body: { topic: topic.trim(), rounds }
      });

      if (error) throw error;
      setResult(data);
      setCurrentStatus("");
      toast({ title: `⚔️ Debatte abgeschlossen — ${data.debate.length} Beiträge` });
    } catch (err: any) {
      toast({ title: err.message || "Debatte fehlgeschlagen", variant: "destructive" });
      setCurrentStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-destructive/20 to-primary/20">
            <Swords className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 flex">
            <div className="w-3 h-3 rounded-full bg-destructive/80 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-primary/80 animate-pulse -ml-1" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-destructive via-primary to-accent bg-clip-text text-transparent">
            Dual Brain Debate
          </h2>
          <p className="text-xs text-muted-foreground">ALPHA (Skeptiker) vs OMEGA (Visionär) — Keine Mock-Daten, nur echtes Wissen</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Debattenthema eingeben..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isLoading && startDebate()}
          className="flex-1"
        />
        <Button onClick={startDebate} disabled={isLoading} className="gap-2 min-w-[120px]">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
          {isLoading ? "Debatte..." : "Start"}
        </Button>
      </div>

      {/* Rounds slider */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-16">Runden: {rounds}</span>
        <Slider
          value={[rounds]}
          onValueChange={v => setRounds(v[0])}
          min={2} max={5} step={1}
          className="flex-1"
        />
      </div>

      {/* Loading status */}
      {isLoading && currentStatus && (
        <Card className="p-3 border-primary/30 bg-primary/5 animate-pulse">
          <p className="text-sm text-center">{currentStatus}</p>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Brain stats */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3 border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-destructive" />
                <span className="text-sm font-bold">ALPHA</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{result.brains.alpha.role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{result.brains.alpha.totalMessages} Beiträge</p>
            </Card>
            <Card className="p-3 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">OMEGA</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{result.brains.omega.role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{result.brains.omega.totalMessages} Beiträge</p>
            </Card>
          </div>

          {/* Debate entries */}
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {result.debate.map((entry, i) => (
                <Card
                  key={i}
                  className={`p-3 border-l-4 ${
                    entry.brain === 'ALPHA'
                      ? 'border-l-destructive/60 bg-destructive/5'
                      : 'border-l-primary/60 bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {entry.brain === 'ALPHA' ? (
                      <Brain className="w-3 h-3 text-destructive" />
                    ) : (
                      <Zap className="w-3 h-3 text-primary" />
                    )}
                    <span className="text-xs font-bold">{entry.brain}</span>
                    <Badge variant="secondary" className="text-[10px]">R{entry.round}</Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{entry.message}</p>
                </Card>
              ))}

              {/* Synthesis */}
              <Card className="p-4 border-accent/50 bg-gradient-to-br from-accent/10 to-primary/5 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold">SYNTHESE</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{result.synthesis}</p>
              </Card>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
