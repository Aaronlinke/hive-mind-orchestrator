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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-float opacity-60" 
          style={{ animationDelay: '0s' }} 
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl animate-float opacity-60" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl animate-float opacity-60" 
          style={{ animationDelay: '4s' }} 
        />
      </div>

      {/* Header */}
      <header className="glass-card border-b border-primary/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-10 w-10 hover:bg-primary/10 hover:scale-110 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary shadow-xl hover:shadow-2xl transition-shadow animate-pulse-glow">
                <Grid3x3 className="h-7 w-7 text-primary-foreground" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-background shadow-lg" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-1">
                  KI-Schachbrett
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                  <span className="hidden sm:inline">Autonomes Multi-Agenten Betriebssystem</span>
                  <span className="sm:hidden">Multi-Agent OS</span>
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
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
                className="h-10 w-10 hover-lift border-primary/20 hover:border-primary/40"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 relative z-10">
        <AIGridSystem />
      </main>
    </div>
  );
};

export default AIGrid;
