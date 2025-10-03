import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export const AdvancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>({
    nodeUsage: [],
    successRates: [],
    codeGeneration: [],
  });

  useEffect(() => {
    loadAnalytics();

    // Real-time updates
    const channel = supabase
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_learning_history",
        },
        () => loadAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnalytics = async () => {
    // Node Usage
    const { data: nodeData } = await supabase
      .from("ai_learning_history")
      .select("ai_node_type")
      .limit(1000);

    const nodeUsage = nodeData?.reduce((acc: any, item) => {
      acc[item.ai_node_type] = (acc[item.ai_node_type] || 0) + 1;
      return acc;
    }, {});

    // Success Rates
    const { data: successData } = await supabase
      .from("ai_learning_history")
      .select("ai_node_type, success_score")
      .not("success_score", "is", null);

    const successByType = successData?.reduce((acc: any, item) => {
      if (!acc[item.ai_node_type]) {
        acc[item.ai_node_type] = { total: 0, count: 0 };
      }
      acc[item.ai_node_type].total += item.success_score;
      acc[item.ai_node_type].count += 1;
      return acc;
    }, {});

    // Code Generation Stats
    const { data: codeData } = await supabase
      .from("generated_code")
      .select("created_at, execution_success")
      .order("created_at", { ascending: true })
      .limit(50);

    setAnalyticsData({
      nodeUsage: Object.entries(nodeUsage || {}).map(([name, value]) => ({
        name,
        value,
      })),
      successRates: Object.entries(successByType || {}).map(([name, data]: any) => ({
        name,
        rate: ((data.total / data.count) * 20).toFixed(1), // Convert to percentage
      })),
      codeGeneration: codeData || [],
    });
  };

  const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Analytics</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node Usage */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">AI Node Nutzung</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.nodeUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.nodeUsage.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Success Rates */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">Erfolgsraten nach Node-Typ</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.successRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="#8B5CF6" name="Erfolgsrate %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Code Generation Timeline */}
          <Card className="p-4 lg:col-span-2">
            <h4 className="font-medium mb-4">Code-Generierung Timeline</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.codeGeneration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="created_at"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="execution_success"
                  stroke="#10B981"
                  name="Erfolgreiche Ausführungen"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Card>
    </div>
  );
};
