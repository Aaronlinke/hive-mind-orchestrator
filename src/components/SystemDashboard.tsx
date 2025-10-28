import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Zap, Database, Network, Cpu, RefreshCw, Copy } from "lucide-react";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { copyToClipboard, formatJSON } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const SystemDashboard = () => {
  const { metrics, isLoading, refresh } = useRealTimeMetrics();
  const { toast } = useToast();

  const handleCopyMetrics = async () => {
    await copyToClipboard(
      formatJSON(metrics),
      () => toast({ title: "Metriken kopiert" }),
      () => toast({ title: "Kopieren fehlgeschlagen", variant: "destructive" })
    );
  };

  const healthColor = metrics.systemHealth >= 90 ? 'text-primary' : metrics.systemHealth >= 70 ? 'text-warning' : 'text-destructive';
  const nodesRatio = metrics.totalNodes > 0 ? (metrics.activeNodes / metrics.totalNodes) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Live System Metrics</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMetrics}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* System Health */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className={`h-4 w-4 ${healthColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthColor}`}>
              {isLoading ? '...' : `${Math.round(metrics.systemHealth)}%`}
            </div>
            <Progress value={metrics.systemHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.systemHealth >= 95 ? 'Optimal' : metrics.systemHealth >= 80 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        {/* Active AI Nodes */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AI Nodes</CardTitle>
            <Brain className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {isLoading ? '...' : `${metrics.activeNodes}/${metrics.totalNodes}`}
            </div>
            <Progress value={nodesRatio} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {nodesRatio >= 90 ? 'Full capacity' : nodesRatio >= 70 ? 'Partial capacity' : 'Limited capacity'}
            </p>
          </CardContent>
        </Card>

        {/* Processing Power */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Power</CardTitle>
            <Zap className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {isLoading ? '...' : `${metrics.processingPower.toFixed(1)} TFlops`}
            </div>
            <Progress value={metrics.processingPower * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(metrics.processingPower * 10)}% capacity utilization
            </p>
          </CardContent>
        </Card>

        {/* Database Operations */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Operations</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : metrics.dbOperations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Queries per minute
            </p>
          </CardContent>
        </Card>

        {/* Network Throughput */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Throughput</CardTitle>
            <Network className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${metrics.networkThroughput.toFixed(1)} Gb/s`}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Edge function communications
            </p>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Cpu className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : `${metrics.avgResponseTime}ms`}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Multi-agent processing
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
