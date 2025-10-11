import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Zap, Database, Network, Cpu } from "lucide-react";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Progress } from "@/components/ui/progress";

export const SystemDashboard = () => {
  const metrics = useSystemMetrics([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* System Health */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">98.5%</div>
          <Progress value={98.5} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            All systems operational
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
          <div className="text-2xl font-bold text-accent">12/12</div>
          <Progress value={100} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Full orchestration capacity
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
          <div className="text-2xl font-bold text-secondary">8.2 TFlops</div>
          <Progress value={82} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            82% capacity utilization
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
          <div className="text-2xl font-bold">1,247</div>
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
          <div className="text-2xl font-bold">15.8 Gb/s</div>
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
          <div className="text-2xl font-bold">127ms</div>
          <p className="text-xs text-muted-foreground mt-2">
            Multi-agent processing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
