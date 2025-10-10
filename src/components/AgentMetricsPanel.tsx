import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, Zap, Target } from "lucide-react";

interface AgentMetrics {
  totalAnalyses: number;
  avgProcessingTime: number;
  avgConfidence: number;
  successRate: number;
}

export const AgentMetricsPanel = ({ metrics }: { metrics?: AgentMetrics }) => {
  const defaultMetrics: AgentMetrics = {
    totalAnalyses: 0,
    avgProcessingTime: 0,
    avgConfidence: 0,
    successRate: 0
  };

  const data = metrics || defaultMetrics;

  return (
    <Card className="backdrop-blur-sm bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Systemmetriken
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-xs">Durchschnittliche Konfidenz</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {(data.avgConfidence * 100).toFixed(1)}%
                </p>
                <Progress value={data.avgConfidence * 100} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Ø Verarbeitungszeit</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {data.avgProcessingTime.toFixed(0)}ms
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span className="text-xs">Erfolgsrate</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {(data.successRate * 100).toFixed(1)}%
                </p>
                <Progress value={data.successRate * 100} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Total Analysen</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  {data.totalAnalyses}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
