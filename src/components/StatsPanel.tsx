import { useState, useEffect } from "react";

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
    <div className="flex gap-8 text-sm">
      <div className="text-center group">
        <p className="text-muted-foreground text-xs mb-1 font-medium">Aktive KIs</p>
        <p className="text-3xl font-bold text-primary tabular-nums group-hover:scale-110 transition-transform">
          {stats.activeAIs}
        </p>
      </div>
      <div className="w-px bg-border/50" />
      <div className="text-center group">
        <p className="text-muted-foreground text-xs mb-1 font-medium">Tasks</p>
        <p className="text-3xl font-bold text-accent tabular-nums group-hover:scale-110 transition-transform">
          {stats.totalTasks}
        </p>
      </div>
      <div className="w-px bg-border/50" />
      <div className="text-center group">
        <p className="text-muted-foreground text-xs mb-1 font-medium">Effizienz</p>
        <p className="text-3xl font-bold text-secondary tabular-nums group-hover:scale-110 transition-transform">
          {stats.efficiency.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default StatsPanel;
