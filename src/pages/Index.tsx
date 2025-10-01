import { useState } from "react";
import AIHierarchyDashboard from "@/components/AIHierarchyDashboard";
import ChatInterface from "@/components/ChatInterface";
import StatsPanel from "@/components/StatsPanel";

const Index = () => {
  const [activeAI, setActiveAI] = useState<string | null>(null);

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
            <StatsPanel />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <AIHierarchyDashboard onSelectAI={setActiveAI} activeAI={activeAI} />
          <ChatInterface activeAI={activeAI} />
        </div>
      </main>
    </div>
  );
};

export default Index;
