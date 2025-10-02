import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Sparkles, Check } from "lucide-react";

interface AINode {
  id: string;
  name: string;
  type: "director" | "manager" | "specialist";
  status: "active" | "idle" | "processing";
  stats: {
    tasksCompleted: number;
    accuracy: number;
  };
}

interface AINodeCardProps {
  node: AINode;
  isActive: boolean;
  onClick: () => void;
  multiSelectMode?: boolean;
}

const AINodeCard = ({ node, isActive, onClick, multiSelectMode = false }: AINodeCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/20 text-success border-success/50";
      case "processing":
        return "bg-warning/20 text-warning border-warning/50";
      case "idle":
        return "bg-muted/30 text-muted-foreground border-muted";
      default:
        return "bg-muted/30 text-muted-foreground border-muted";
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 text-primary";
    switch (node.type) {
      case "director":
        return <Brain className={iconClass} />;
      case "manager":
        return <Activity className={iconClass} />;
      case "specialist":
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <Card
      className={`cursor-pointer glass-card glass-card-hover group relative overflow-hidden ${
        isActive
          ? "ring-2 ring-primary glow-primary scale-[1.02]"
          : ""
      }`}
      onClick={onClick}
    >
      {/* Checkmark for multi-select mode */}
      {multiSelectMode && isActive && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-background rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse-glow">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              {getIcon()}
              {node.status === "processing" && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{node.name}</h3>
          </div>
          <Badge
            variant="outline"
            className={`${getStatusColor(node.status)} text-xs font-medium border-2 shadow-sm`}
          >
            {node.status}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tasks:</span>
            <span className="font-bold text-primary tabular-nums">{node.stats.tasksCompleted}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Genauigkeit:</span>
            <span className="font-bold text-accent tabular-nums">{node.stats.accuracy.toFixed(1)}%</span>
          </div>
        </div>

        {node.status === "processing" && (
          <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary via-accent to-primary h-2 rounded-full animate-pulse-glow transition-all duration-300"
              style={{ width: `${node.stats.accuracy}%` }}
            />
          </div>
        )}

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Card>
  );
};

export default AINodeCard;
