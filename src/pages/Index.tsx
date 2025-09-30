import { useState } from "react";
import AIHierarchyDashboard from "@/components/AIHierarchyDashboard";
import ChatInterface from "@/components/ChatInterface";
import StatsPanel from "@/components/StatsPanel";

const Index = () => {
  const [activeAI, setActiveAI] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                <span className="text-xl font-bold">◈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  KI-Orchestrator
                </h1>
                <p className="text-xs text-muted-foreground">Hierarchisches Multi-KI-System</p>
              </div>
            </div>
            <StatsPanel />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Hierarchy Visualization */}
          <div className="lg:col-span-2">
            <AIHierarchyDashboard onSelectAI={setActiveAI} activeAI={activeAI} />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface activeAI={activeAI} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
