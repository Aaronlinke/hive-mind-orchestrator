import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, TrendingUp, Zap, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SelfImprovementPanelProps {
  lastMessageId: string | null;
  lastAIResponse: string;
  aiNodeId: string | null;
  aiNodeType: string | null;
}

const SelfImprovementPanel = ({ 
  lastMessageId, 
  lastAIResponse, 
  aiNodeId,
  aiNodeType 
}: SelfImprovementPanelProps) => {
  const [learningStats, setLearningStats] = useState({
    totalInteractions: 0,
    avgSuccessScore: 0,
    codeGenerated: 0,
  });
  const [userRating, setUserRating] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    loadLearningStats();
  }, []);

  const loadLearningStats = async () => {
    const { data: history } = await supabase
      .from('ai_learning_history')
      .select('success_score');
    
    const { data: code } = await supabase
      .from('generated_code')
      .select('id');

    if (history) {
      const avgScore = history.reduce((sum, h) => sum + (h.success_score || 0), 0) / (history.length || 1);
      setLearningStats({
        totalInteractions: history.length,
        avgSuccessScore: avgScore,
        codeGenerated: code?.length || 0,
      });
    }
  };

  const submitFeedback = async (rating: number) => {
    if (!aiNodeId || !aiNodeType) return;

    setUserRating(rating);
    
    // Update das letzte Learning History Entry
    const { data: lastEntry } = await supabase
      .from('ai_learning_history')
      .select('id')
      .eq('ai_node_id', aiNodeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastEntry) {
      await supabase
        .from('ai_learning_history')
        .update({ 
          success_score: rating,
          user_feedback: rating 
        })
        .eq('id', lastEntry.id);

      toast({
        title: "Feedback gespeichert! 🎯",
        description: `Die KI lernt aus deiner Bewertung (${rating}/5) und verbessert sich kontinuierlich.`,
      });

      loadLearningStats();
    }
  };

  const generateCodeSnippet = async () => {
    if (!lastAIResponse || !aiNodeId) return;

    // Extrahiere Code aus der Antwort
    const codeBlocks = lastAIResponse.match(/```[\s\S]*?```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      const code = codeBlocks[0].replace(/```(\w+)?\n?/g, '').replace(/```$/, '');
      const language = codeBlocks[0].match(/```(\w+)/)?.[1] || 'javascript';

      await supabase.from('generated_code').insert({
        ai_node_id: aiNodeId,
        code_language: language,
        code_content: code,
        description: "Generiert aus Chat-Antwort",
      });

      toast({
        title: "Code gespeichert! 💻",
        description: "Der generierte Code wurde in der Datenbank gespeichert.",
      });

      loadLearningStats();
    } else {
      toast({
        title: "Kein Code gefunden",
        description: "Die letzte Antwort enthält keinen Code-Block.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary animate-pulse-glow" />
        <h3 className="font-bold text-lg gradient-text">Selbstverbesserungs-System</h3>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Interaktionen</p>
          <p className="text-lg font-bold text-primary">{learningStats.totalInteractions}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Star className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Ø Score</p>
          <p className="text-lg font-bold text-accent">{learningStats.avgSuccessScore.toFixed(1)}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Code className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Code</p>
          <p className="text-lg font-bold text-success">{learningStats.codeGenerated}</p>
        </div>
      </div>

      {/* Feedback Section */}
      {lastMessageId && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Bewerte die letzte Antwort:</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                size="sm"
                variant={userRating === rating ? "default" : "outline"}
                onClick={() => submitFeedback(rating)}
                className={userRating === rating ? "gradient-primary" : ""}
              >
                {rating} ⭐
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Code Generation */}
      <Button
        onClick={generateCodeSnippet}
        disabled={!lastAIResponse}
        className="w-full gradient-accent"
        size="sm"
      >
        <Code className="w-4 h-4 mr-2" />
        Code extrahieren & speichern
      </Button>

      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-4 h-4 text-primary" />
          <span>System lernt aus jedem Gespräch automatisch</span>
        </div>
      </div>
    </Card>
  );
};

export default SelfImprovementPanel;
