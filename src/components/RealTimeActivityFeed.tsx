import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  agent: string;
  timestamp: Date;
}

export const RealTimeActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Simulate real-time activity
    const interval = setInterval(() => {
      const agents = ['Director', 'Manager-1', 'Manager-2', 'Specialist-1', 'Specialist-2'];
      const messages = [
        'Anfrage erfolgreich verarbeitet',
        'Entscheidung getroffen',
        'Ressourcen zugewiesen',
        'Analyse abgeschlossen',
        'Optimierung durchgeführt',
        'Daten synchronisiert',
        'Wissensmodell aktualisiert'
      ];
      const types: ('success' | 'warning' | 'info' | 'error')[] = ['success', 'success', 'success', 'info', 'warning'];

      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        agent: agents[Math.floor(Math.random() * agents.length)],
        timestamp: new Date()
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          Echtzeit-Aktivitätsfeed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all",
                  "hover:bg-accent/10 border border-border/50",
                  "animate-in slide-in-from-top-2 fade-in duration-500"
                )}
              >
                <div className="mt-0.5">{getIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {activity.agent}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString('de-DE')}
                    </span>
                  </div>
                  <p className="text-sm">{activity.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
