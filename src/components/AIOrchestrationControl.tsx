import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIOrchestrationControl = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [parallelism, setParallelism] = useState([8]);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [resourcePooling, setResourcePooling] = useState(true);

  const handleStart = () => {
    setIsRunning(true);
    toast({
      title: "Orchestrierung gestartet",
      description: `System läuft mit ${parallelism[0]} parallelen Agenten`,
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    toast({
      title: "Orchestrierung gestoppt",
      description: "Alle Agenten wurden sicher heruntergefahren",
    });
  };

  const handleReset = () => {
    setParallelism([8]);
    setAdaptiveLearning(true);
    setAutoOptimize(true);
    setResourcePooling(true);
    toast({
      title: "Einstellungen zurückgesetzt",
      description: "Alle Parameter auf Standardwerte gesetzt",
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Orchestrierungs-Kontrolle
          <Badge variant={isRunning ? "default" : "secondary"} className="ml-auto">
            {isRunning ? "Aktiv" : "Bereit"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            className="flex-1"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Starten
          </Button>
          <Button
            onClick={handleStop}
            disabled={!isRunning}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Pause className="mr-2 h-4 w-4" />
            Stoppen
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Parallelism Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Parallele Agenten</Label>
            <span className="text-sm font-bold text-primary">{parallelism[0]}</span>
          </div>
          <Slider
            value={parallelism}
            onValueChange={setParallelism}
            min={1}
            max={16}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Anzahl der gleichzeitig aktiven KI-Agenten
          </p>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="adaptive-learning" className="flex flex-col space-y-1">
              <span>Adaptives Lernen</span>
              <span className="font-normal text-xs text-muted-foreground">
                Kontinuierliche Optimierung basierend auf Feedback
              </span>
            </Label>
            <Switch
              id="adaptive-learning"
              checked={adaptiveLearning}
              onCheckedChange={setAdaptiveLearning}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-optimize" className="flex flex-col space-y-1">
              <span>Auto-Optimierung</span>
              <span className="font-normal text-xs text-muted-foreground">
                Automatische Anpassung der System-Parameter
              </span>
            </Label>
            <Switch
              id="auto-optimize"
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="resource-pooling" className="flex flex-col space-y-1">
              <span>Ressourcen-Pooling</span>
              <span className="font-normal text-xs text-muted-foreground">
                Intelligente Verteilung der Computing-Ressourcen
              </span>
            </Label>
            <Switch
              id="resource-pooling"
              checked={resourcePooling}
              onCheckedChange={setResourcePooling}
            />
          </div>
        </div>

        {/* System Info */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-bold">24h 13m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Durchsatz</p>
              <p className="font-bold">847 req/min</p>
            </div>
            <div>
              <p className="text-muted-foreground">Erfolgsrate</p>
              <p className="font-bold text-primary">99.3%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Latenz</p>
              <p className="font-bold">127ms</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
