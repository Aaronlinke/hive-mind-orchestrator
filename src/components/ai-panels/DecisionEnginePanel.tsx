import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDecisionEngine } from "@/hooks/useDecisionEngine";
import { Brain, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DecisionEnginePanel = () => {
  const [request, setRequest] = useState("");
  const { makeDecision, isDeciding, decision } = useDecisionEngine();
  const { toast } = useToast();

  const handleDecide = async () => {
    if (!request.trim()) {
      toast({ title: "Bitte gib eine Anfrage ein", variant: "destructive" });
      return;
    }

    try {
      await makeDecision(request, {}, "user", []);
      toast({ title: "🎯 Entscheidung getroffen" });
    } catch (error) {
      toast({ title: "Fehler bei der Entscheidungsfindung", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Brain className="h-5 w-5" />
        <p className="text-sm">
          Context-Aware Decision Making für optimale Strategien
        </p>
      </div>

      <Textarea
        placeholder="Beschreibe die Situation für eine Entscheidung..."
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        className="min-h-[100px]"
      />

      <Button onClick={handleDecide} disabled={isDeciding} className="w-full">
        <Target className="h-4 w-4 mr-2" />
        {isDeciding ? "Entscheide..." : "Entscheidung treffen"}
      </Button>

      {decision && (
        <Card className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Entscheidung:</h3>
            <Badge>{decision.delegationStrategy}</Badge>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Konfidenz</span>
                <span>{(decision.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={decision.confidence * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Priorität</span>
                <span>{(decision.priorityScore * 100).toFixed(0)}%</span>
              </div>
              <Progress value={decision.priorityScore * 100} />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risiko</span>
                <span>{(decision.riskScore * 100).toFixed(0)}%</span>
              </div>
              <Progress value={decision.riskScore * 100} className="[&>div]:bg-destructive" />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Empfohlener Node:</h4>
            <Badge variant="outline">{decision.recommendedNode}</Badge>
          </div>

          {decision.reasoning.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Begründung:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {decision.reasoning.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
