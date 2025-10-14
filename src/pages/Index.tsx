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
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-primary animate-pulse-glow flex-shrink-0">
                <span className="text-xl md:text-3xl">◈</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-in slide-in-from-left duration-1000 truncate">
                  KI-Orchestrator
                </h1>
                <p className="text-[10px] md:text-sm text-muted-foreground font-medium hidden sm:block truncate">Hierarchisches Multi-KI-System</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/evolution")}
                className="hover-lift h-8 px-2 md:h-10 md:px-4"
              >
                <span className="hidden sm:inline">🧬</span>
                <span className="text-xs md:text-sm hidden md:inline ml-1">Evolution</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/swarm")}
                className="hover-lift h-8 px-2 md:h-10 md:px-4"
              >
                <span className="hidden sm:inline">🐝</span>
                <span className="text-xs md:text-sm hidden md:inline ml-1">Swarm</span>
              </Button>
              <ThemeToggle />
              <StatsPanel />
              <Button variant="outline" size="icon" onClick={signOut} title="Abmelden" className="h-8 w-8 md:h-10 md:w-10">
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 relative z-10">
        <Tabs defaultValue="master" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-4 md:mb-6 glass-card p-1 md:p-2 h-auto gap-1">
            <TabsTrigger 
              value="master" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:via-primary data-[state=active]:to-secondary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10"
            >
              <span className="md:hidden">👑</span>
              <span className="hidden md:inline">👑 Master</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="ai-chat" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="creation" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10 hidden md:flex"
            >
              Kreativ
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10 hidden md:flex"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="automation" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10 hidden md:flex"
            >
              <Workflow className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden lg:inline">Automation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift text-xs md:text-sm h-9 md:h-10 hidden md:flex"
            >
              <Palette className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden lg:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Master Orchestrator - Übergeordnete KI */}
          <TabsContent value="master" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-3 md:space-y-6">
              <div className="glass-card p-3 md:p-6 rounded-xl border-accent/30 shadow-2xl">
                <div className="mb-3 md:mb-6">
                  <h2 className="text-xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                    <Crown className="h-5 w-5 md:h-8 md:w-8 text-accent flex-shrink-0" />
                    <span>Master AI</span>
                  </h2>
                  <p className="text-xs md:text-base text-muted-foreground">
                    <span className="hidden md:inline">Orchestriert alle 7 KI-Spezialisten (Semantik, Decision, Resource, Knowledge, Web, Visual, Skill) 
                    + Collective Intelligence + Evolutionäres System für vollständige Komplettlösungen.</span>
                    <span className="md:hidden">7 KI-Spezialisten + Collective Intelligence</span>
                  </p>
                </div>
                <MasterOrchestratorChat />
              </div>
            </div>
          </TabsContent>

          {/* Dashboard - Hauptübersicht */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-3 md:space-y-6">
              <SystemDashboard />
              
              <div className="grid lg:grid-cols-2 gap-3 md:gap-6">
                <AIOrchestrationControl />
                <RealTimeActivityFeed />
              </div>

              <AIPerformanceMetrics />

              <div className="glass-card p-3 md:p-6 rounded-xl">
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  KI-Capabilities Übersicht
                </h2>
                <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-6">
                  Multi-Agent-System mit hierarchischer Orchestrierung
                </p>
                <AICapabilitiesGrid />
              </div>
            </div>
          </TabsContent>

          {/* AI Chat - Alle Chat-Features */}
          <TabsContent value="ai-chat" className="space-y-3 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Tabs defaultValue="standard" className="w-full">
              <TabsList className="glass-card mb-3 md:mb-4 grid grid-cols-3 md:grid-cols-5 text-xs md:text-sm h-auto p-1">
                <TabsTrigger value="standard" className="h-8 md:h-10">Standard</TabsTrigger>
                <TabsTrigger value="fusion" className="h-8 md:h-10">Fusion</TabsTrigger>
                <TabsTrigger value="grid" className="h-8 md:h-10 hidden md:flex">Grid</TabsTrigger>
                <TabsTrigger value="enhanced" className="h-8 md:h-10">Enhanced</TabsTrigger>
                <TabsTrigger value="voice" className="h-8 md:h-10 hidden md:flex">Voice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
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
            <div className="grid gap-3 md:gap-6">
              <div className="glass-card p-3 md:p-6 rounded-xl">
                <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  🎨 Kreativ-Tools
                </h2>
                <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-8">
                  Generiere Bilder und Videos mit KI
                </p>
                
                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-lg md:text-2xl">🖼️</span>
                      </div>
                      <h3 className="text-base md:text-xl font-semibold">Bildgenerierung</h3>
                    </div>
                    <ImageGenerator />
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-lg md:text-2xl">🎬</span>
                      </div>
                      <h3 className="text-base md:text-xl font-semibold">Videogenerierung</h3>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-3 md:space-y-6">
                <div className="glass-card p-3 md:p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 md:mb-6">
                    <Workflow className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                    <h2 className="text-lg md:text-2xl font-bold">Workflows</h2>
                  </div>
                  <WorkflowBuilder />
                </div>
              </div>
              
              <div className="space-y-3 md:space-y-6">
                <div className="glass-card p-3 md:p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 md:mb-6">
                    <Trophy className="h-4 w-4 md:h-6 md:w-6 text-accent" />
                    <h2 className="text-lg md:text-2xl font-bold">Erfolge</h2>
                  </div>
                  <AchievementSystem />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings - Theme */}
          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="glass-card p-3 md:p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-3 md:mb-6">
                <Palette className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                <h2 className="text-lg md:text-2xl font-bold">Theme Einstellungen</h2>
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