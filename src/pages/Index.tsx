import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SuperFusionChat } from "@/components/SuperFusionChat";
import { SystemDashboard } from "@/components/SystemDashboard";
import { AIGenerator } from "@/components/AIGenerator";
import { AIGridSystem } from "@/components/AIGridSystem";
import { DebateCircle } from "@/components/DebateCircle";
import { CodeGenerator } from "@/components/CodeGenerator";
import { EvolutionaryDebatePanel } from "@/components/EvolutionaryDebatePanel";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AgentControlPanel } from "@/components/AgentControlPanel";
import { MasterOrchestratorChat } from "@/components/MasterOrchestratorChat";
import { AgentMetricsPanel } from "@/components/AgentMetricsPanel";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { LiveEvolutionFeed } from "@/components/LiveEvolutionFeed";
import StatsPanel from "@/components/StatsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiAgentOrchestrator } from "@/hooks/useMultiAgentOrchestrator";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Sparkles, Dna, Brain, Zap, BarChart3, Activity, Users, Crown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [agentCount, setAgentCount] = useState(7);
  const [activeTab, setActiveTab] = useState("main");
  
  const { agentResults } = useMultiAgentOrchestrator();
  const systemMetrics = useSystemMetrics(agentResults);

  const handleAgentConfigChange = (agents: string[], count: number) => {
    setActiveAgents(agents);
    setAgentCount(count);
    console.log('🤖 Agent Config Updated:', { agents, count, total: agents.length * count });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      <CommandPalette />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '0s' }} 
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute top-1/2 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '4s' }} 
        />
      </div>

      <header className="glass-card border-b border-border/50 sticky top-0 z-20">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-lg">
                <Dna className="h-7 w-7 text-background animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Super Fusion AI
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Sparkles className="w-3 h-3" />
                    10 AI-Systeme
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Dna className="w-3 h-3" />
                    SSF Genesis
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Aktiv
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/evolution")}
                className="h-9 px-3 hover-lift hidden md:flex"
              >
                <span>🧬</span>
                <span className="ml-2">Evolution</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/swarm")}
                className="h-9 px-3 hover-lift hidden md:flex"
              >
                <span>🐝</span>
                <span className="ml-2">Swarm</span>
              </Button>
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={signOut} 
                title="Abmelden" 
                className="h-9 w-9 hover-lift"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 glass-card border-primary/20 hover-lift shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Dna className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">SSF Status</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  Genesis Aktiv
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 glass-card border-accent/20 hover-lift shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/10">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Aktive Agenten</p>
                <p className="text-xl font-bold">{activeAgents.length} · {agentCount}x</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 glass-card border-secondary/20 hover-lift shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/10">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Power</p>
                <p className="text-xl font-bold">{activeAgents.length * agentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 glass-card border-primary/20 hover-lift shadow-lg">
            <div className="flex items-center justify-center">
              <StatsPanel />
            </div>
          </Card>
        </div>

        {/* Agent Control Panel */}
        <AgentControlPanel 
          onConfigChange={handleAgentConfigChange}
          showAdvanced={true}
          maxAgents={30}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 glass-card p-1">
            <TabsTrigger value="main" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Haupt</span>
            </TabsTrigger>
            <TabsTrigger value="orchestrator" className="gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Master</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="evolution" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Evolution</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Agenten</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Tab */}
          <TabsContent value="main" className="space-y-6 mt-6">
            <SuperFusionChat />
            
            <AIGridSystem />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIGenerator />
              <DebateCircle />
            </div>
            
            <CodeGenerator />
            
            <div className="glass-card p-6 border-primary/20 rounded-xl shadow-lg">
              <SystemDashboard />
            </div>
          </TabsContent>

          {/* Master Orchestrator Tab */}
          <TabsContent value="orchestrator" className="space-y-6 mt-6">
            <MasterOrchestratorChat />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <AgentMetricsPanel metrics={systemMetrics} />
            <AdvancedAnalytics />
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="space-y-6 mt-6">
            <EvolutionaryDebatePanel />
            <LiveEvolutionFeed />
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DebateCircle />
              <AIGenerator />
            </div>
            <AgentMetricsPanel metrics={systemMetrics} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;