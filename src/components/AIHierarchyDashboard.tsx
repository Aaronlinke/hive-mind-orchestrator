import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AINodeCard from "./AINodeCard";

interface AINode {
  id: string;
  name: string;
  type: "director" | "manager" | "specialist";
  status: "active" | "idle" | "processing";
  children?: string[];
  stats: {
    tasksCompleted: number;
    accuracy: number;
  };
}

interface AIHierarchyDashboardProps {
  onSelectAI: (id: string) => void;
  activeAIs: string[];
  onToggleMultiSelect: () => void;
  multiSelectMode: boolean;
}

const AIHierarchyDashboard = ({ onSelectAI, activeAIs, onToggleMultiSelect, multiSelectMode }: AIHierarchyDashboardProps) => {
  const [nodes, setNodes] = useState<AINode[]>([
    {
      id: "director-1",
      name: "Direktor KI",
      type: "director",
      status: "active",
      children: ["manager-1", "manager-2"],
      stats: { tasksCompleted: 1247, accuracy: 98.5 },
    },
    {
      id: "manager-1",
      name: "Projektmanager KI-A",
      type: "manager",
      status: "processing",
      children: ["specialist-1", "specialist-2"],
      stats: { tasksCompleted: 892, accuracy: 96.3 },
    },
    {
      id: "manager-2",
      name: "Projektmanager KI-B",
      type: "manager",
      status: "active",
      children: ["specialist-3", "specialist-4"],
      stats: { tasksCompleted: 756, accuracy: 97.1 },
    },
    {
      id: "specialist-1",
      name: "Spezialist: Storytelling",
      type: "specialist",
      status: "idle",
      stats: { tasksCompleted: 342, accuracy: 94.8 },
    },
    {
      id: "specialist-2",
      name: "Spezialist: Game Design",
      type: "specialist",
      status: "processing",
      stats: { tasksCompleted: 428, accuracy: 95.6 },
    },
    {
      id: "specialist-3",
      name: "Spezialist: Grafik",
      type: "specialist",
      status: "active",
      stats: { tasksCompleted: 381, accuracy: 96.2 },
    },
    {
      id: "specialist-4",
      name: "Spezialist: Weltenbau",
      type: "specialist",
      status: "idle",
      stats: { tasksCompleted: 294, accuracy: 93.9 },
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => {
          const shouldUpdate = Math.random() > 0.7;
          if (!shouldUpdate) return node;

          const statuses: ("active" | "idle" | "processing")[] = ["active", "idle", "processing"];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

          return {
            ...node,
            status: newStatus,
            stats: {
              tasksCompleted: node.stats.tasksCompleted + (newStatus === "processing" ? 1 : 0),
              accuracy: Math.min(99.9, node.stats.accuracy + (Math.random() - 0.5) * 0.1),
            },
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const directorNode = nodes.find((n) => n.type === "director");
  const managerNodes = nodes.filter((n) => n.type === "manager");
  const specialistNodes = nodes.filter((n) => n.type === "specialist");

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow" />
              KI-Hierarchie
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {multiSelectMode ? "🔗 Mehrere KIs gleichzeitig befragen" : "Einzelne KI auswählen"}
            </p>
          </div>
          <Button
            onClick={onToggleMultiSelect}
            variant={multiSelectMode ? "default" : "outline"}
            className={multiSelectMode ? "gradient-primary shadow-lg glow-primary" : ""}
            size="sm"
          >
            {multiSelectMode ? "🔗 Multi" : "📋 Einzel"}
          </Button>
        </div>

        {/* Director Level */}
        {directorNode && (
          <div className="mb-8 flex justify-center">
            <AINodeCard
              node={directorNode}
              isActive={activeAIs.includes(directorNode.id)}
              onClick={() => onSelectAI(directorNode.id)}
              multiSelectMode={multiSelectMode}
            />
          </div>
        )}

        {/* Connection Lines */}
        <div className="flex justify-center mb-4">
          <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
        </div>

        {/* Manager Level */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {managerNodes.map((manager) => (
            <div key={manager.id} className="flex flex-col items-center">
              <AINodeCard
                node={manager}
                isActive={activeAIs.includes(manager.id)}
                onClick={() => onSelectAI(manager.id)}
                multiSelectMode={multiSelectMode}
              />
            </div>
          ))}
        </div>

        {/* Connection Lines */}
        <div className="flex justify-around mb-4">
          {managerNodes.map((_, idx) => (
            <div key={idx} className="w-px h-8 bg-gradient-to-b from-secondary to-transparent" />
          ))}
        </div>

        {/* Specialist Level */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specialistNodes.map((specialist) => (
            <AINodeCard
              key={specialist.id}
              node={specialist}
              isActive={activeAIs.includes(specialist.id)}
              onClick={() => onSelectAI(specialist.id)}
              multiSelectMode={multiSelectMode}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AIHierarchyDashboard;
