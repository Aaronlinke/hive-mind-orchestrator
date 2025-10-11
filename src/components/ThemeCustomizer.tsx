import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ThemePreset {
  name: string;
  primary: string;
  accent: string;
  secondary: string;
}

const themePresets: ThemePreset[] = [
  {
    name: "Default",
    primary: "hsl(222, 47%, 55%)",
    accent: "hsl(280, 65%, 60%)",
    secondary: "hsl(340, 75%, 55%)",
  },
  {
    name: "Ocean",
    primary: "hsl(195, 80%, 50%)",
    accent: "hsl(170, 60%, 50%)",
    secondary: "hsl(210, 70%, 55%)",
  },
  {
    name: "Sunset",
    primary: "hsl(25, 95%, 53%)",
    accent: "hsl(340, 80%, 55%)",
    secondary: "hsl(10, 90%, 60%)",
  },
  {
    name: "Forest",
    primary: "hsl(140, 50%, 45%)",
    accent: "hsl(90, 55%, 50%)",
    secondary: "hsl(160, 45%, 50%)",
  },
  {
    name: "Purple Dream",
    primary: "hsl(270, 60%, 55%)",
    accent: "hsl(290, 70%, 60%)",
    secondary: "hsl(250, 65%, 55%)",
  },
];

export const ThemeCustomizer = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("Default");

  const applyTheme = async (theme: ThemePreset) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--secondary", theme.secondary);

    setSelectedTheme(theme.name);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          theme: { name: theme.name, ...theme },
        });

      if (error) throw error;
      toast.success(`Theme "${theme.name}" aktiviert!`);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (data?.theme) {
          const savedTheme = data.theme as any;
          const theme = themePresets.find((t) => t.name === savedTheme.name);
          if (theme) applyTheme(theme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    loadTheme();
  }, []);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Theme-Anpassung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Wähle ein Farbschema:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {themePresets.map((theme) => (
              <button
                key={theme.name}
                onClick={() => applyTheme(theme)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedTheme === theme.name
                    ? "border-primary shadow-glow"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{theme.name}</span>
                  {selectedTheme === theme.name && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <div
                    className="h-8 w-full rounded"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
