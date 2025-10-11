import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Brain, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string;
  progress: number;
  target: number;
}

export const AchievementSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string | null) => {
    const iconClass = "h-8 w-8";
    switch (iconName) {
      case "trophy":
        return <Trophy className={iconClass} />;
      case "star":
        return <Star className={iconClass} />;
      case "zap":
        return <Zap className={iconClass} />;
      case "brain":
        return <Brain className={iconClass} />;
      default:
        return <Target className={iconClass} />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.progress >= a.target).length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Erfolge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Lade Erfolge...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Erfolge
          </span>
          <Badge variant="secondary">
            {unlockedCount} / {totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Erfolge freigeschaltet. Nutze den KI-Orchestrator, um Erfolge zu sammeln!
            </p>
          ) : (
            achievements.map((achievement) => {
              const isUnlocked = achievement.progress >= achievement.target;
              const progressPercent = (achievement.progress / achievement.target) * 100;

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isUnlocked
                      ? "bg-primary/10 border-primary/30 shadow-glow"
                      : "bg-muted/30 border-muted"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isUnlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        {isUnlocked && (
                          <Badge variant="default" className="ml-2">
                            Freigeschaltet
                          </Badge>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                      )}
                      <div className="space-y-1">
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress} / {achievement.target}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
