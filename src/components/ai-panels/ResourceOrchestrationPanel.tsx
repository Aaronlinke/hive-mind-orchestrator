import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useResourceOrchestration } from "@/hooks/useResourceOrchestration";
import { Network, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ResourceOrchestrationPanel = () => {
  const [resourceType, setResourceType] = useState<string>("API");
  const [endpoint, setEndpoint] = useState("");
  const { executeResource, isExecuting, result } = useResourceOrchestration();
  const { toast } = useToast();

  const handleExecute = async () => {
    if (!endpoint.trim()) {
      toast({ title: "Bitte gib einen Endpoint ein", variant: "destructive" });
      return;
    }

    try {
      await executeResource({
        resourceType: resourceType as any,
        endpoint,
        costBudget: 1.0,
        latencyTolerance: 5000
      });
      toast({ title: "✅ Ressource erfolgreich orchestriert" });
    } catch (error) {
      toast({ title: "Fehler bei der Orchestrierung", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Network className="h-5 w-5" />
        <p className="text-sm">
          Autonome Ressourcen-Orchestrierung für externe Dienste
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Ressource-Typ</Label>
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="WebScraping">Web Scraping</SelectItem>
              <SelectItem value="CloudService">Cloud Service</SelectItem>
              <SelectItem value="DatabaseQuery">Database Query</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Endpoint/URL</Label>
          <Input
            placeholder="https://api.example.com/endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>

        <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
          <Zap className="h-4 w-4 mr-2" />
          {isExecuting ? "Führe aus..." : "Ressource ausführen"}
        </Button>
      </div>

      {result && (
        <Card className="p-4 mt-4">
          <h3 className="font-semibold mb-2">Ergebnis:</h3>
          <div className="text-sm space-y-1">
            <p>Latenz: {result.metrics?.latency}ms</p>
            <p>Kosten: ${result.metrics?.cost?.toFixed(4)}</p>
            <p>Status: {result.metrics?.status}</p>
          </div>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(result.result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
