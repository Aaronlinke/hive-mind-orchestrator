import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSemanticReasoning } from "@/hooks/useSemanticReasoning";
import { Brain, Sparkles, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SemanticReasoningPanel = () => {
  const [request, setRequest] = useState("");
  const [copied, setCopied] = useState(false);
  const { analyzeRequest, isAnalyzing, analysis } = useSemanticReasoning();
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (analysis) {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      setCopied(true);
      toast({ title: "In Zwischenablage kopiert!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAnalyze = async () => {
    if (!request.trim()) {
      toast({ title: "Bitte gib eine Anfrage ein", variant: "destructive" });
      return;
    }

    try {
      await analyzeRequest(request);
      toast({ title: "✨ Semantische Analyse abgeschlossen" });
    } catch (error) {
      toast({ title: "Fehler bei der Analyse", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Brain className="h-5 w-5" />
        <p className="text-sm">
          Erweiterte semantische Reasoning-Engine zur prognostischen Analyse
        </p>
      </div>

      <Textarea
        placeholder="Gib deine Anfrage ein..."
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        className="min-h-[100px]"
      />

      <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
        {isAnalyzing ? "Analysiere..." : "Anfrage analysieren"}
      </Button>

      {analysis && (
        <Card className="p-4 space-y-4 mt-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="absolute top-2 right-2"
          >
            <Copy className={`h-4 w-4 ${copied ? "text-primary" : ""}`} />
          </Button>
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              Analyse-Ergebnis
            </h3>
            <Badge variant="secondary">
              Konfidenz: {(analysis.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          {analysis.immediateNeeds.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Identifizierte Bedürfnisse:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.immediateNeeds.map((need, idx) => (
                  <Badge key={idx} variant="outline">{need}</Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Empfehlungen:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
