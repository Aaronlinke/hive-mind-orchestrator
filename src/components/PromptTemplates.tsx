import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, TrendingUp } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_content: string;
  ai_node_type: string;
  usage_count: number;
}

interface PromptTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

export const PromptTemplates = ({ onSelectTemplate }: PromptTemplatesProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("*")
      .eq("is_public", true)
      .order("usage_count", { ascending: false });

    if (error) {
      console.error("Error loading templates:", error);
      return;
    }

    setTemplates(data || []);
  };

  const useTemplate = async (template: Template) => {
    onSelectTemplate(template.template_content);

    // Increment usage count
    await supabase
      .from("prompt_templates")
      .update({ usage_count: template.usage_count + 1 })
      .eq("id", template.id);

    toast({
      title: "Template verwendet",
      description: `"${template.name}" wurde geladen`,
    });

    loadTemplates();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Director: "bg-primary",
      Manager: "bg-secondary",
      Specialist: "bg-accent",
    };
    return colors[category] || "bg-muted";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Prompt Templates</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => useTemplate(template)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>{template.usage_count}x verwendet</span>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
