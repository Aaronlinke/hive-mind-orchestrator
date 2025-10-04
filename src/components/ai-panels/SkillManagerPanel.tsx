import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSkillManager } from "@/hooks/useSkillManager";
import { Lightbulb, Loader2 } from "lucide-react";

export const SkillManagerPanel = () => {
  const { skills, isLoading, loadSkills } = useSkillManager();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Lightbulb className="h-5 w-5" />
        <p className="text-sm">
          Dynamische Skill-Integration für spezialisierte Module
        </p>
      </div>

      <Button onClick={loadSkills} disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Skills neu laden
      </Button>

      <div className="space-y-2">
        {skills.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            Keine Skills geladen
          </Card>
        ) : (
          skills.map((skill) => (
            <Card key={skill.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{skill.skill_id}</h4>
                  <p className="text-sm text-muted-foreground">{skill.skill_path}</p>
                </div>
                <Badge variant={skill.is_active ? "default" : "secondary"}>
                  {skill.is_active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              {skill.performance_metrics && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Ausführungen: {skill.performance_metrics.totalExecutions || 0}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
