import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Loader2, Brain, Lightbulb, Target, Database } from "lucide-react";
import { AgentResult } from "@/hooks/useMultiAgentOrchestrator";

interface AgentResultCardProps {
  agent: AgentResult;
}

export const AgentResultCard = ({ agent }: AgentResultCardProps) => {
  const getAgentIcon = () => {
    switch (agent.agentId) {
      case 'semantic': return <Brain className="h-4 w-4" />;
      case 'decision': return <Target className="h-4 w-4" />;
      case 'visual': return <Lightbulb className="h-4 w-4" />;
      case 'knowledge': return <Database className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-background/50 border-border hover:border-primary/50 transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAgentIcon()}
            <span className="font-semibold text-sm">{agent.agentName}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={agent.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
              {agent.status === 'processing' && 'Arbeitet'}
              {agent.status === 'completed' && 'Fertig'}
              {agent.status === 'error' && 'Fehler'}
              {agent.status === 'idle' && 'Bereit'}
            </Badge>
          </div>
        </div>

        {agent.status === 'completed' && (
          <>
            <div className="space-y-1">
              <Progress value={agent.confidence * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Konfidenz: {(agent.confidence * 100).toFixed(1)}%</span>
                {agent.processingTime && <span>{agent.processingTime}ms</span>}
              </div>
            </div>

            {agent.result && (
              <div className="mt-2 p-3 bg-background/70 rounded border border-border/50 text-xs space-y-2">
                {agent.agentId === 'semantic' && agent.result.recommendations && (
                  <div>
                    <p className="font-semibold mb-1">Empfehlungen:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {agent.result.recommendations.slice(0, 3).map((rec: string, i: number) => (
                        <li key={i} className="text-muted-foreground">{rec}</li>
                      ))}
                    </ul>
                    {agent.result.immediateNeeds?.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold mb-1">Identifizierte Bedürfnisse:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.result.immediateNeeds.slice(0, 3).map((need: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{need}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {agent.agentId === 'decision' && agent.result.reasoning && (
                  <div>
                    <p className="font-semibold mb-1">Entscheidung:</p>
                    <p className="text-muted-foreground">{agent.result.recommendedNode}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-muted-foreground">Priorität:</p>
                        <p className="font-semibold">{(agent.result.priorityScore * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risiko:</p>
                        <p className="font-semibold">{(agent.result.riskScore * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {agent.agentId === 'visual' && agent.result.concept && (
                  <div>
                    <p className="font-semibold mb-1">Visuelles Konzept:</p>
                    <p className="text-muted-foreground">
                      {agent.result.concept.description || 'Konzept erfolgreich generiert'}
                    </p>
                  </div>
                )}
                
                {agent.agentId === 'knowledge' && agent.result.results && (
                  <div>
                    <p className="font-semibold mb-1">Wissensbasis:</p>
                    <p className="text-muted-foreground">
                      {agent.result.results.length} relevante Einträge gefunden
                    </p>
                    {agent.result.results.length > 0 && (
                      <div className="mt-1 text-muted-foreground">
                        Top-Treffer: {agent.result.results[0]?.title || 'N/A'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
