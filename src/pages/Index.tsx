import { useNavigate } from "react-router-dom";
import { SuperFusionChat } from "@/components/SuperFusionChat";
import { SystemDashboard } from "@/components/SystemDashboard";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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

      <header className="glass-card border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary animate-pulse-glow">
              <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Super Fusion AI
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Alle 8 KI-Systeme vereint · Schwarm-Gedächtnis · Kollektive Intelligenz · Alles in Einem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/evolution")}
                className="h-8 px-2 md:h-10 md:px-4"
              >
                <span>🧬</span>
                <span className="hidden md:inline ml-1">Evolution</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/swarm")}
                className="h-8 px-2 md:h-10 md:px-4"
              >
                <span>🐝</span>
                <span className="hidden md:inline ml-1">Swarm</span>
              </Button>
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={signOut} title="Abmelden" className="h-8 w-8 md:h-10 md:w-10">
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-3 md:p-6">
        <SuperFusionChat />
        
        <div className="mt-6 glass-card p-4 border-primary/20 rounded-xl">
          <SystemDashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;