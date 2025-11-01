import { useNavigate } from "react-router-dom";
import { AIGridSystem } from "@/components/AIGridSystem";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, LogOut, Dna, Grid3x3 } from "lucide-react";

const AIGrid = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '0s' }} 
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: '2s' }} 
        />
      </div>

      <header className="glass-card border-b border-border/50 sticky top-0 z-20">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-lg">
                <Grid3x3 className="h-7 w-7 text-background" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  KI-Schachbrett
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Autonomes Multi-Agenten Betriebssystem
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

      <main className="container mx-auto p-4 md:p-6">
        <AIGridSystem />
      </main>
    </div>
  );
};

export default AIGrid;
