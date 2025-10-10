import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
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
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6 glass-card p-2 h-auto">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Chat & AI
            </TabsTrigger>
            <TabsTrigger 
              value="fusion" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Fusion Chat
            </TabsTrigger>
            <TabsTrigger 
              value="grid" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              KI-Grid
            </TabsTrigger>
            <TabsTrigger 
              value="enhanced" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Enhanced AI
            </TabsTrigger>
            <Button
              variant="ghost"
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift h-auto py-2"
              onClick={() => window.location.href = '/swarm-intelligence'}
            >
              Schwarm-KI
            </Button>
            <TabsTrigger 
              value="image" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Bilder
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="voice" 
              className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300 hover-lift"
            >
              Voice Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <AIHierarchyDashboard 
                onSelectAI={handleSelectAI} 
                activeAIs={activeAIs}
                onToggleMultiSelect={handleToggleMultiSelect}
                multiSelectMode={multiSelectMode}
              />
              <ChatInterface activeAIs={activeAIs} multiSelectMode={multiSelectMode} />
            </div>
          </TabsContent>

          <TabsContent value="fusion" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <FusionChat />
          </TabsContent>

          <TabsContent value="grid" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <AIGridSystem />
          </TabsContent>

          <TabsContent value="enhanced" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <EnhancedAIPanel />
          </TabsContent>

          <TabsContent value="image">
            <ImageGenerator />
          </TabsContent>

          <TabsContent value="video">
            <VideoGenerator />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAgent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;