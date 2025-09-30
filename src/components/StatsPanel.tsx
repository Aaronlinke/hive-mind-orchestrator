import { useState, useEffect } from "react";
import { TrendingUp, Zap, Database } from "lucide-react";

const StatsPanel = () => {
  const [stats, setStats] = useState({
    activeAIs: 7,
    totalTasks: 4340,
    efficiency: 96.4,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activeAIs: prev.activeAIs,
        totalTasks: prev.totalTasks + Math.floor(Math.random() * 3),
        efficiency: Math.min(99.9, prev.efficiency + (Math.random() - 0.5) * 0.2),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-6 items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Aktive KIs</p>
          <p className="text-sm font-bold">{stats.activeAIs}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Database className="w-4 h-4 text-secondary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tasks</p>
          <p className="text-sm font-bold">{stats.totalTasks}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Effizienz</p>
          <p className="text-sm font-bold">{stats.efficiency.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
