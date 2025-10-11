import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Clock, Target, Cpu } from "lucide-react";

const performanceData = [
  { time: '00:00', latency: 120, throughput: 850, accuracy: 98 },
  { time: '04:00', latency: 115, throughput: 920, accuracy: 97 },
  { time: '08:00', latency: 125, throughput: 1100, accuracy: 99 },
  { time: '12:00', latency: 130, throughput: 1250, accuracy: 98 },
  { time: '16:00', latency: 127, throughput: 1180, accuracy: 99 },
  { time: '20:00', latency: 122, throughput: 1050, accuracy: 98 },
  { time: '24:00', latency: 118, throughput: 900, accuracy: 98 },
];

const agentData = [
  { name: 'Director', requests: 245, avgTime: 95 },
  { name: 'Manager-1', requests: 412, avgTime: 112 },
  { name: 'Manager-2', requests: 389, avgTime: 108 },
  { name: 'Specialist-1', requests: 567, avgTime: 145 },
  { name: 'Specialist-2', requests: 534, avgTime: 138 },
];

export const AIPerformanceMetrics = () => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance-Metriken
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="latency" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="latency" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Latenz
            </TabsTrigger>
            <TabsTrigger value="throughput" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Durchsatz
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Genauigkeit
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Agenten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="latency" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="latency" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Durchschnitt</p>
                <p className="text-2xl font-bold text-primary">123ms</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Minimum</p>
                <p className="text-2xl font-bold text-green-500">95ms</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Maximum</p>
                <p className="text-2xl font-bold text-yellow-500">145ms</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="throughput">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="throughput" stroke="hsl(var(--accent))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="accuracy">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[95, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="agents">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgTime" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
