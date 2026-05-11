import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Loader2, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Entry {
  persona: string;
  round: number;
  payload: {
    thesis?: string;
    critique?: string;
    builds_on?: string;
    keep?: string[];
    evidence?: string;
    next_step?: string;
  };
}

const PERSONA_COLORS: Record<string, string> = {
  Archon: "border-primary/40 bg-primary/5",
  "Schoolar++": "border-accent/40 bg-accent/5",
  Kritikon: "border-destructive/40 bg-destructive/5",
  Integron: "border-secondary/40 bg-secondary/5",
};

export function CouncilDebate() {
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(3);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<Entry[]>([]);
  const [synthesis, setSynthesis] = useState<any>(null);

  const start = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setTranscript([]);
    setSynthesis(null);
    try {
      const { data, error } = await supabase.functions.invoke("council-debate", {
        body: { topic, rounds },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTranscript(data.transcript || []);
      setSynthesis(data.synthesis);
      toast.success(`Debatte mit ${data.rounds} Runden abgeschlossen`);
    } catch (e: any) {
      toast.error(e.message || "Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card border-primary/30">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Council Debate · 4 Köpfe</h3>
        <Badge variant="outline" className="text-xs">Archon · Schoolar++ · Kritikon · Integron</Badge>
      </div>

      <div className="space-y-3 mb-4">
        <Input
          placeholder='Thema, z.B. "Bewusstsein als mathematische Invariante"'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Runden: {rounds}</span>
          <Slider value={[rounds]} onValueChange={(v) => setRounds(v[0])} min={1} max={5} step={1} disabled={loading} className="flex-1" />
          <Button onClick={start} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}
          </Button>
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {transcript.map((e, i) => (
            <Card key={i} className={`p-3 border ${PERSONA_COLORS[e.persona] || ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-bold">{e.persona}</Badge>
                <Badge variant="secondary" className="text-xs">Runde {e.round}</Badge>
              </div>
              <div className="text-sm space-y-1">
                {e.payload.thesis && <p><span className="font-semibold text-primary">These:</span> {e.payload.thesis}</p>}
                {e.payload.critique && <p><span className="font-semibold text-destructive">Kritik:</span> {e.payload.critique}</p>}
                {e.payload.evidence && <p><span className="font-semibold text-accent">Evidenz:</span> {e.payload.evidence}</p>}
                {e.payload.keep && e.payload.keep.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {e.payload.keep.map((k, j) => <Badge key={j} variant="outline" className="text-[10px]">{k}</Badge>)}
                  </div>
                )}
                {e.payload.next_step && <p className="text-xs text-muted-foreground mt-1"><span className="font-semibold">→ Next:</span> {e.payload.next_step}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {synthesis && (
        <Card className="mt-4 p-4 border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-bold">Synthese</h4>
          </div>
          <div className="text-sm space-y-2">
            {synthesis.final_thesis && <p><span className="font-semibold">These:</span> {synthesis.final_thesis}</p>}
            {synthesis.axiom && <p><span className="font-semibold text-primary">Axiom:</span> {synthesis.axiom}</p>}
            {synthesis.formula && <p className="font-mono text-xs bg-muted/50 p-2 rounded">{synthesis.formula}</p>}
            {Array.isArray(synthesis.action_steps) && (
              <ol className="list-decimal list-inside text-xs space-y-1 mt-2">
                {synthesis.action_steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ol>
            )}
          </div>
        </Card>
      )}
    </Card>
  );
}