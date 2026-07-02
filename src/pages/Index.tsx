import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SuperFusionChat } from "@/components/SuperFusionChat";
import { SystemDashboard } from "@/components/SystemDashboard";
import { AIGenerator } from "@/components/AIGenerator";
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
import { FusionChat } from "@/components/FusionChat";
import { PromptLab } from "@/components/PromptLab";
import { NexusMathExplorer } from "@/components/NexusMathExplorer";
import { TermuxBots } from "@/components/TermuxBots";
import { DualBrainDebate } from "@/components/DualBrainDebate";
import { CouncilDebate } from "@/components/CouncilDebate";
import StatsPanel from "@/components/StatsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiAgentOrchestrator } from "@/hooks/useMultiAgentOrchestrator";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Sparkles, Dna, Brain, Zap, BarChart3, Activity, Users, Crown, Grid3x3, Menu, FlaskConical, BookOpen, Terminal } from "lucide-react";

const NAV_LINKS = [
  { label: "Schachbrett", icon: <Grid3x3 className="w-4 h-4" />, path: "/ai-grid" },
  { label: "Evolution", icon: <span>🧬</span>, path: "/evolution" },
  { label: "Swarm", icon: <span>🐝</span>, path: "/swarm-intelligence" },
  { label: "Black Sultan", icon: <Brain className="w-4 h-4" />, path: "/black-sultan-os" },
  { label: "AJ Platform", icon: <Sparkles className="w-4 h-4" />, path: "/aj-platform" },
  { label: "Philosophy", icon: <Zap className="w-4 h-4" />, path: "/meta-philosophy" },
];

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [agentCount, setAgentCount] = useState(7);
  const [activeTab, setActiveTab] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { agentResults } = useMultiAgentOrchestrator();
  const systemMetrics = useSystemMetrics(agentResults);

  const handleAgentConfigChange = (agents: string[], count: number) => {
    setActiveAgents(agents);
    setAgentCount(count);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      <CommandPalette />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <header className="glass-card border-b border-border/50 sticky top-0 z-20">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-lg">
                <Dna className="h-7 w-7 text-background animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Super Fusion AI
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs gap-1">
                    <Sparkles className="w-3 h-3" /> 10 AI-Systeme
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Dna className="w-3 h-3" /> SSF Genesis
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" /> Aktiv
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-2">
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.path}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(link.path)}
                    className="h-9 px-3 hover-lift gap-2"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Button>
                ))}
              </div>

              {/* Mobile hamburger menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 glass-card">
                  <div className="flex flex-col gap-2 mt-6">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2 px-1">Navigation</p>
                    {NAV_LINKS.map((link) => (
                      <Button
                        key={link.path}
                        variant="ghost"
                        className="justify-start gap-3 h-10"
                        onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                      >
                        {link.icon}
                        {link.label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

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
          <Card className="p-4 md:p-5 glass-card border-primary/20 hover-lift shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 hover:scale-110 transition-transform">
                <Dna className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wide">SSF Status</p>
                <span className="text-lg md:text-xl font-bold flex items-center gap-2 mt-0.5">
                  Genesis
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-lg inline-block" />
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 glass-card border-accent/20 hover-lift shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 hover:scale-110 transition-transform">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wide">Aktive Agenten</p>
                <p className="text-lg md:text-xl font-bold mt-0.5">{activeAgents.length} · {agentCount}x</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 glass-card border-secondary/20 hover-lift shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total Power</p>
                <p className="text-lg md:text-xl font-bold mt-0.5">{activeAgents.length * agentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-5 glass-card border-primary/20 hover-lift shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-center h-full">
              <StatsPanel />
            </div>
          </Card>
        </div>

        {/* Agent Control Panel */}
        <AgentControlPanel onConfigChange={handleAgentConfigChange} showAdvanced={true} maxAgents={30} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 glass-card p-1.5 gap-1">
            <TabsTrigger value="main" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Haupt</span>
            </TabsTrigger>
            <TabsTrigger value="orchestrator" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Master</span>
            </TabsTrigger>
            <TabsTrigger value="nexus" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Nexus</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="evolution" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Evolution</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Agenten</span>
            </TabsTrigger>
            <TabsTrigger value="promptlab" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Lab</span>
            </TabsTrigger>
            <TabsTrigger value="termux" className="gap-1 data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all">
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Termux</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Tab */}
          <TabsContent value="main" className="space-y-6 mt-6">
            <SuperFusionChat />
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
            <DualBrainDebate />
            <CouncilDebate />
          </TabsContent>

          {/* Nexus Mathematics Tab */}
          <TabsContent value="nexus" className="space-y-6 mt-6">
            <NexusMathExplorer />
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

          {/* Agents Hub Tab — unique content */}
          <TabsContent value="agents" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { name: "Direktor KI", type: "director", color: "from-primary/20 to-primary/5", status: "Aktiv", tasks: 24 },
                { name: "Projektmanager A", type: "manager", color: "from-accent/20 to-accent/5", status: "Aktiv", tasks: 18 },
                { name: "Projektmanager B", type: "manager", color: "from-secondary/20 to-secondary/5", status: "Bereit", tasks: 12 },
                { name: "Spezialist: Storytelling", type: "specialist", color: "from-primary/15 to-accent/5", status: "Aktiv", tasks: 31 },
                { name: "Spezialist: Game Design", type: "specialist", color: "from-accent/15 to-secondary/5", status: "Aktiv", tasks: 28 },
                { name: "Spezialist: Grafik", type: "specialist", color: "from-secondary/15 to-primary/5", status: "Bereit", tasks: 9 },
                { name: "Spezialist: Weltenbau", type: "specialist", color: "from-primary/15 to-secondary/5", status: "Lernt", tasks: 15 },
              ].map((agent, i) => (
                <Card key={i} className={`p-4 glass-card bg-gradient-to-br ${agent.color} border-border/30 hover-lift`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        agent.status === "Aktiv" ? "border-success/50 text-success" :
                        agent.status === "Lernt" ? "border-accent/50 text-accent" :
                        "border-border/50 text-muted-foreground"
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        agent.status === "Aktiv" ? "bg-success animate-pulse" :
                        agent.status === "Lernt" ? "bg-accent animate-pulse" :
                        "bg-muted-foreground"
                      }`} />
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{agent.tasks} Tasks abgeschlossen</span>
                    <div className="h-1.5 w-20 bg-border/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ width: `${Math.min(100, (agent.tasks / 35) * 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <FusionChat />
          </TabsContent>

          {/* Prompt Lab Tab */}
          <TabsContent value="promptlab" className="space-y-6 mt-6">
            <PromptLab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
