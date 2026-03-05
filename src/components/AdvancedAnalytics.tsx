import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Database } from "lucide-react";

const DEMO_NODE_USAGE = [
  { name: "director", value: 42 },
  { name: "specialist", value: 78 },
  { name: "manager", value: 35 },
  { name: "fusion", value: 61 },
];

const DEMO_SUCCESS_RATES = [
  { name: "director", rate: "91.2" },
  { name: "specialist", rate: "87.5" },
  { name: "manager", rate: "83.8" },
  { name: "fusion", rate: "94.1" },
];

const DEMO_CODE_TIMELINE = Array.from({ length: 14 }, (_, i) => ({
  created_at: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
  execution_success: Math.random() > 0.2 ? 1 : 0,
  count: Math.floor(Math.random() * 8) + 1,
}));

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))"];

export const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    nodeUsage: DEMO_NODE_USAGE,
    successRates: DEMO_SUCCESS_RATES,
    codeGeneration: DEMO_CODE_TIMELINE,
    isDemo: true,
  });

  useEffect(() => {
    loadAnalytics();

    const channel = supabase
      .channel("analytics-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_learning_history" }, () => loadAnalytics())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadAnalytics = async () => {
    const [nodeRes, successRes, codeRes] = await Promise.all([
      supabase.from("ai_learning_history").select("ai_node_type").limit(1000),
      supabase.from("ai_learning_history").select("ai_node_type, success_score").not("success_score", "is", null),
      supabase.from("generated_code").select("created_at, execution_success").order("created_at", { ascending: true }).limit(50),
    ]);

    const nodeData = nodeRes.data;
    const successData = successRes.data;
    const codeData = codeRes.data;

    // If no real data, keep demo data
    if (!nodeData?.length && !successData?.length && !codeData?.length) return;

    const nodeUsage = nodeData?.reduce((acc: any, item) => {
      acc[item.ai_node_type] = (acc[item.ai_node_type] || 0) + 1;
      return acc;
    }, {});

    const successByType = successData?.reduce((acc: any, item) => {
      if (!acc[item.ai_node_type]) acc[item.ai_node_type] = { total: 0, count: 0 };
      acc[item.ai_node_type].total += item.success_score;
      acc[item.ai_node_type].count += 1;
      return acc;
    }, {});

    setAnalyticsData({
      nodeUsage: Object.entries(nodeUsage || {}).length > 0
        ? Object.entries(nodeUsage || {}).map(([name, value]) => ({ name, value }))
        : DEMO_NODE_USAGE,
      successRates: Object.entries(successByType || {}).length > 0
        ? Object.entries(successByType || {}).map(([name, data]: any) => ({
            name,
            rate: ((data.total / data.count) * 20).toFixed(1),
          }))
        : DEMO_SUCCESS_RATES,
      codeGeneration: (codeData?.length ?? 0) > 0 ? codeData : DEMO_CODE_TIMELINE,
      isDemo: !nodeData?.length,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 glass-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Analytics</h3>
          {analyticsData.isDemo && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground border border-border/50 rounded px-2 py-0.5 ml-auto">
              <Database className="w-3 h-3" /> Demo-Daten
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node Usage */}
          <Card className="p-4 glass-card">
            <h4 className="font-medium mb-4 text-sm">AI Node Nutzung</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.nodeUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {analyticsData.nodeUsage.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Anfragen"]} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Success Rates */}
          <Card className="p-4 glass-card">
            <h4 className="font-medium mb-4 text-sm">Erfolgsraten nach Node-Typ</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.successRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Erfolgsrate"]} />
                <Bar dataKey="rate" fill="hsl(var(--primary))" name="Erfolgsrate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Code Generation Timeline */}
          <Card className="p-4 glass-card lg:col-span-2">
            <h4 className="font-medium mb-4 text-sm">Code-Generierung Timeline</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.codeGeneration}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="created_at"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString("de-DE")} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="execution_success"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  name="Ausführungserfolg"
                />
                {analyticsData.codeGeneration[0]?.count !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", r: 3 }}
                    name="Generierungen"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Card>
    </div>
  );
};
