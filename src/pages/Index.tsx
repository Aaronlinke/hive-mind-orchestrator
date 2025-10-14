import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIHierarchyDashboard from "@/components/AIHierarchyDashboard";
import ChatInterface from "@/components/ChatInterface";
import StatsPanel from "@/components/StatsPanel";
import { ImageGenerator } from "@/components/ImageGenerator";
import { VideoGenerator } from "@/components/VideoGenerator";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { EnhancedAIPanel } from "@/components/EnhancedAIPanel";
import { FusionChat } from "@/components/FusionChat";
import { AIGridSystem } from "@/components/AIGridSystem";
import { VoiceAgent } from "@/components/VoiceAgent";
import { AICapabilitiesGrid } from "@/components/AICapabilitiesGrid";
import { SystemDashboard } from "@/components/SystemDashboard";
import { AIOrchestrationControl } from "@/components/AIOrchestrationControl";
import { RealTimeActivityFeed } from "@/components/RealTimeActivityFeed";
import { AIPerformanceMetrics } from "@/components/AIPerformanceMetrics";
import { CommandPalette } from "@/components/CommandPalette";
import { MasterOrchestratorChat } from "@/components/MasterOrchestratorChat";
import { QuickActions } from "@/components/QuickActions";
import { OnboardingTour } from "@/components/OnboardingTour";
import { AchievementSystem } from "@/components/AchievementSystem";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Workflow, Trophy, Palette, Crown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeAIs, setActiveAIs] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  const handleSelectAI = (aiId: string) => {
    if (multiSelectMode) {
      // Toggle-Logik für Mehrfachauswahl
      setActiveAIs((prev) =>
        prev.includes(aiId) ? prev.filter((id) => id !== aiId) : [...prev, aiId]
      );
    } else {
      // Einzelauswahl
      setActiveAIs([aiId]);
    }
  };

  const handleToggleMultiSelect = () => {
    setMultiSelectMode((prev) => !prev);
    if (!multiSelectMode) {
      // Beim Aktivieren alle KIs auswählen
      setActiveAIs([
        "director-1",
        "manager-1",
        "manager-2",
        "specialist-1",
        "specialist-2",
        "specialist-3",
        "specialist-4",
      ]);
    } else {
      // Beim Deaktivieren nur die erste behalten
      setActiveAIs((prev) => (prev.length > 0 ? [prev[0]] : []));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-deep to-background text-foreground relative">
      {/* Command Palette */}
      <CommandPalette />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
      
      {/* Animated background effect */}
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

      {/* Header */}
      <header className="border-b border-border/50 glass-card sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-primary animate-pulse-glow">
                <span className="text-3xl">◈</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-in slide-in-from-left duration-1000">
                  KI-Orchestrator
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Hierarchisches Multi-KI-System der Zukunft</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/evolution")}
                className="hover-lift"
              >
                🧬 Evolution
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/swarm")}
                className="hover-lift"
              >
                🐝 Swarm
              </Button>
              <ThemeToggle />
              <StatsPanel />
              <Button variant="outline" size="icon" onClick={signOut} title="Abmelden">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="master" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 glass-card p-2 h-auto gap-1">
            <TabsTrigger 
              value="master" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:via-primary data-[state=active]:to-secondary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              👑 Master AI
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="ai-chat" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              AI Chat
            </TabsTrigger>
            <TabsTrigger 
              value="creation" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Kreativ Tools
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="automation" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              <Workflow className="h-4 w-4 mr-1" />
              Automation
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              <Palette className="h-4 w-4 mr-1" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Master Orchestrator - Übergeordnete KI */}
          <TabsContent value="master" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-xl border-accent/30 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                    <Crown className="h-8 w-8 text-accent" />
                    Master Orchestrator
                  </h2>
                  <p className="text-muted-foreground">
                    Orchestriert alle 7 KI-Spezialisten (Semantik, Decision, Resource, Knowledge, Web, Visual, Skill) 
                    + Collective Intelligence + Evolutionäres System für vollständige Komplettlösungen.
                  </p>
                </div>
                <MasterOrchestratorChat />
              </div>
            </div>
          </TabsContent>

          {/* Dashboard - Hauptübersicht */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-6">
              <SystemDashboard />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <AIOrchestrationControl />
                <RealTimeActivityFeed />
              </div>

              <AIPerformanceMetrics />

              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  KI-Capabilities Übersicht
                </h2>
                <p className="text-muted-foreground mb-6">
                  Vollständiges Multi-Agent-System mit hierarchischer Orchestrierung
                </p>
                <AICapabilitiesGrid />
              </div>
            </div>
          </TabsContent>

          {/* AI Chat - Alle Chat-Features */}
          <TabsContent value="ai-chat" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Tabs defaultValue="standard" className="w-full">
              <TabsList className="glass-card mb-4">
                <TabsTrigger value="standard">Standard Chat</TabsTrigger>
                <TabsTrigger value="fusion">Fusion Chat</TabsTrigger>
                <TabsTrigger value="grid">KI-Grid</TabsTrigger>
                <TabsTrigger value="enhanced">Enhanced AI</TabsTrigger>
                <TabsTrigger value="voice">Voice Agent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIHierarchyDashboard 
                    onSelectAI={handleSelectAI} 
                    activeAIs={activeAIs}
                    onToggleMultiSelect={handleToggleMultiSelect}
                    multiSelectMode={multiSelectMode}
                  />
                  <ChatInterface activeAIs={activeAIs} multiSelectMode={multiSelectMode} />
                </div>
              </TabsContent>
              
              <TabsContent value="fusion">
                <FusionChat />
              </TabsContent>
              
              <TabsContent value="grid">
                <AIGridSystem />
              </TabsContent>
              
              <TabsContent value="enhanced">
                <EnhancedAIPanel />
              </TabsContent>
              
              <TabsContent value="voice">
                <VoiceAgent />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Creation - Bild & Video Generierung */}
          <TabsContent value="creation" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid gap-6">
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  🎨 Kreativ-Tools
                </h2>
                <p className="text-muted-foreground mb-8">
                  Generiere Bilder und Videos mit fortschrittlicher KI
                </p>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <h3 className="text-xl font-semibold">Bildgenerierung</h3>
                    </div>
                    <ImageGenerator />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                        <span className="text-2xl">🎬</span>
                      </div>
                      <h3 className="text-xl font-semibold">Videogenerierung</h3>
                    </div>
                    <VideoGenerator />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <AdvancedAnalytics />
          </TabsContent>

          {/* Automation - Workflows & Achievements */}
          <TabsContent value="automation" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Workflow className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Workflows</h2>
                  </div>
                  <WorkflowBuilder />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy className="h-6 w-6 text-accent" />
                    <h2 className="text-2xl font-bold">Erfolge</h2>
                  </div>
                  <AchievementSystem />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings - Theme */}
          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Theme Einstellungen</h2>
              </div>
              <ThemeCustomizer />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;