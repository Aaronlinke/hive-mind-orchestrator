import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Sparkles } from "lucide-react";

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
}

const AINodeCard = ({ node, isActive, onClick }: AINodeCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "processing":
        return "bg-secondary text-secondary-foreground";
      case "idle":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case "director":
        return <Brain className="w-5 h-5" />;
      case "manager":
        return <Activity className="w-5 h-5" />;
      case "specialist":
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isActive
          ? "border-primary shadow-glow bg-card"
          : "border-border bg-card/50 hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-sm">{node.name}</h3>
        </div>
        <Badge variant="secondary" className={getStatusColor(node.status)}>
          {node.status}
        </Badge>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Tasks:</span>
          <span className="text-foreground font-mono">{node.stats.tasksCompleted}</span>
        </div>
        <div className="flex justify-between">
          <span>Genauigkeit:</span>
          <span className="text-foreground font-mono">{node.stats.accuracy.toFixed(1)}%</span>
        </div>
      </div>

      {node.status === "processing" && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse w-2/3" />
        </div>
      )}
    </Card>
  );
};

export default AINodeCard;
