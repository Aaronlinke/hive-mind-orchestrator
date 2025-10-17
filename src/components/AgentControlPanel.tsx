import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Plus, 
  Minus, 
  Settings2, 
  Zap,
  CheckCircle2,
  XCircle
} from "lucide-react";

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'specialist' | 'support';
  enabled: boolean;
}

const DEFAULT_AGENTS: AgentConfig[] = [
  { id: "semantic", name: "Semantisches Reasoning", description: "Analyse & Mustererkennung", category: 'core', enabled: true },
  { id: "decision", name: "Entscheidungs-Engine", description: "Strategische Planung", category: 'core', enabled: true },
  { id: "resource", name: "Ressourcen-Orchestrierung", description: "API & Cloud Services", category: 'core', enabled: true },
  { id: "knowledge", name: "Wissensmanagement", description: "Knowledge Graph", category: 'core', enabled: true },
  { id: "web", name: "Web-Interaktion", description: "Scraping & Browser", category: 'specialist', enabled: true },
  { id: "visual", name: "Visuelle Konzepte", description: "Bild-Generierung", category: 'specialist', enabled: true },
  { id: "skill", name: "Skill-Manager", description: "Code-Ausführung", category: 'specialist', enabled: true },
  { id: "temporal", name: "Temporal Engine", description: "Zeit & History", category: 'support', enabled: false },
  { id: "pattern", name: "Pattern Recognition", description: "Mustererkennung", category: 'support', enabled: false },
  { id: "evolution", name: "Evolution Engine", description: "Auto-Verbesserung", category: 'support', enabled: false },
];

interface AgentControlPanelProps {
  onConfigChange?: (activeAgents: string[], agentCount: number) => void;
  showAdvanced?: boolean;
  maxAgents?: number;
}

export const AgentControlPanel = ({ 
  onConfigChange, 
  showAdvanced = true,
  maxAgents = 30 
}: AgentControlPanelProps) => {
  const [agents, setAgents] = useState<AgentConfig[]>(DEFAULT_AGENTS);
  const [agentCount, setAgentCount] = useState(7);
  const [showSettings, setShowSettings] = useState(false);

  const activeAgents = agents.filter(a => a.enabled);
  const coreAgents = agents.filter(a => a.category === 'core');
  const specialistAgents = agents.filter(a => a.category === 'specialist');
  const supportAgents = agents.filter(a => a.category === 'support');

  const toggleAgent = (agentId: string) => {
    const newAgents = agents.map(a => 
      a.id === agentId ? { ...a, enabled: !a.enabled } : a
    );
    setAgents(newAgents);
    const activeIds = newAgents.filter(a => a.enabled).map(a => a.id);
    onConfigChange?.(activeIds, agentCount);
  };

  const enableAll = () => {
    const newAgents = agents.map(a => ({ ...a, enabled: true }));
    setAgents(newAgents);
    onConfigChange?.(newAgents.map(a => a.id), agentCount);
  };

  const disableAll = () => {
    const newAgents = agents.map(a => ({ ...a, enabled: false }));
    setAgents(newAgents);
    onConfigChange?.([], agentCount);
  };

  const enableCategory = (category: AgentConfig['category']) => {
    const newAgents = agents.map(a => 
      a.category === category ? { ...a, enabled: true } : a
    );
    setAgents(newAgents);
    const activeIds = newAgents.filter(a => a.enabled).map(a => a.id);
    onConfigChange?.(activeIds, agentCount);
  };

  const handleAgentCountChange = (value: number[]) => {
    setAgentCount(value[0]);
    const activeIds = agents.filter(a => a.enabled).map(a => a.id);
    onConfigChange?.(activeIds, value[0]);
  };

  const incrementCount = () => {
    if (agentCount < maxAgents) {
      const newCount = agentCount + 1;
      setAgentCount(newCount);
      const activeIds = agents.filter(a => a.enabled).map(a => a.id);
      onConfigChange?.(activeIds, newCount);
    }
  };

  const decrementCount = () => {
    if (agentCount > 1) {
      const newCount = agentCount - 1;
      setAgentCount(newCount);
      const activeIds = agents.filter(a => a.enabled).map(a => a.id);
      onConfigChange?.(activeIds, newCount);
    }
  };

  const getCategoryColor = (category: AgentConfig['category']) => {
    switch(category) {
      case 'core': return 'bg-primary/20 text-primary border-primary/30';
      case 'specialist': return 'bg-accent/20 text-accent border-accent/30';
      case 'support': return 'bg-secondary/20 text-secondary border-secondary/30';
    }
  };

  const renderAgentGroup = (title: string, agentList: AgentConfig[], color: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Brain className={`h-3 w-3 ${color.split(' ')[1]}`} />
          {title}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => enableCategory(agentList[0].category)}
          className="text-xs h-6 px-2"
        >
          Alle aktivieren
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {agentList.map((agent) => (
          <div
            key={agent.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              agent.enabled 
                ? `${color} bg-opacity-10` 
                : 'border-border/30 bg-background/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Switch
                id={agent.id}
                checked={agent.enabled}
                onCheckedChange={() => toggleAgent(agent.id)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={agent.id}
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  {agent.enabled ? (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  {agent.name}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`${color} text-[10px] ml-2`}>
              {agent.category}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-4 glass-card border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Agenten-Kontrolle
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAgents.length} von {agents.length} Agenten aktiv · {agentCount} parallele Instanzen
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-primary/10"
          >
            <Settings2 className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 glass-card border border-primary/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{activeAgents.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Aktive</div>
          </div>
          <div className="p-3 glass-card border border-accent/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-accent">{agentCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Instanzen</div>
          </div>
          <div className="p-3 glass-card border border-secondary/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-secondary">{activeAgents.length * agentCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
          </div>
        </div>

        {/* Agent Count Control */}
        <div className="space-y-3 p-4 glass-card border border-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Parallele Agenten-Instanzen</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementCount}
                disabled={agentCount <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Badge variant="outline" className="px-3 font-mono text-lg">
                {agentCount}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementCount}
                disabled={agentCount >= maxAgents}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[agentCount]}
            onValueChange={handleAgentCountChange}
            min={1}
            max={maxAgents}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground text-center">
            Pro aktivem Agenten laufen {agentCount} parallele Instanzen
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-4 pt-3 border-t border-border/30 animate-in slide-in-from-top-2">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enableAll}
                className="flex-1 text-xs hover:bg-success/10 hover:border-success/30"
              >
                <CheckCircle2 className="h-3 w-3 mr-2" />
                Alle aktivieren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAll}
                className="flex-1 text-xs hover:bg-destructive/10 hover:border-destructive/30"
              >
                <XCircle className="h-3 w-3 mr-2" />
                Alle deaktivieren
              </Button>
            </div>

            {/* Agent Groups */}
            <div className="space-y-4">
              {renderAgentGroup(
                "Kern-Agenten", 
                coreAgents, 
                getCategoryColor('core')
              )}
              {renderAgentGroup(
                "Spezialisten", 
                specialistAgents, 
                getCategoryColor('specialist')
              )}
              {showAdvanced && renderAgentGroup(
                "Support-Systeme", 
                supportAgents, 
                getCategoryColor('support')
              )}
            </div>

            {/* Info */}
            <div className="p-3 glass-card border border-accent/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <strong>Tipp:</strong> Kern-Agenten sind essentiell für grundlegende Operationen. 
                  Spezialisten erweitern die Fähigkeiten für spezifische Aufgaben.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
