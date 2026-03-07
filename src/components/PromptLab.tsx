import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Sparkles, Zap, Brain, Crown, Copy, TrendingUp, RefreshCw } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_content: string;
  ai_node_type: string;
  usage_count: number;
}

const AI_TARGETS = [
  { value: "master", label: "Master Orchestrator", icon: <Crown className="h-3.5 w-3.5" /> },
  { value: "gemini-flash", label: "Gemini Flash", icon: <Zap className="h-3.5 w-3.5" /> },
  { value: "gemini-pro", label: "Gemini Pro", icon: <Brain className="h-3.5 w-3.5" /> },
  { value: "gemini-fusion", label: "SuperFusion", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

const FALLBACK_TEMPLATES: Template[] = [
  {
    id: "f1", name: "System-Analyse", description: "Analyse des gesamten KI-Systems",
    category: "Director", template_content: "Analysiere den aktuellen Systemzustand und identifiziere alle Optimierungspotentiale.",
    ai_node_type: "director", usage_count: 0,
  },
  {
    id: "f2", name: "Kreative Ideenfindung", description: "Brainstorming mit 5 Ideen",
    category: "Specialist", template_content: "Generiere 5 kreative, innovative Ideen für folgendes Thema und beschreibe jede kurz:",
    ai_node_type: "specialist", usage_count: 0,
  },
  {
    id: "f3", name: "Strategischer Plan", description: "3-Stufen-Aktionsplan erstellen",
    category: "Manager", template_content: "Erstelle einen strategischen 3-Stufen-Aktionsplan für folgendes Ziel:",
    ai_node_type: "manager", usage_count: 0,
  },
  {
    id: "f4", name: "Technische Analyse", description: "Deep-Dive technische Bewertung",
    category: "Specialist", template_content: "Führe eine tiefgehende technische Analyse durch und erkläre Vor- und Nachteile von:",
    ai_node_type: "specialist", usage_count: 0,
  },
];

export const PromptLab = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [promptText, setPromptText] = useState("");
  const [aiTarget, setAiTarget] = useState("gemini-flash");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
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

    if (error || !data || data.length === 0) {
      setTemplates(FALLBACK_TEMPLATES);
    } else {
      setTemplates(data);
    }
  };

  const applyTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setPromptText(template.template_content);
    toast({ title: `Template geladen`, description: template.name });
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      toast({ title: "Leerer Prompt", description: "Bitte gib einen Prompt ein.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setResult("");

    try {
      let modelMap: Record<string, string> = {
        "gemini-flash": "gemini-2.5-flash",
        "gemini-pro": "gemini-2.5-pro",
        "gemini-fusion": "gemini-2.5-flash",
        "master": "gemini-2.5-flash",
      };

      const systemPrompt = aiTarget === "master"
        ? `Du bist der MASTER ORCHESTRATOR - orchestriere alle 7 KI-Spezialisten (Semantik, Decision, Resource, Knowledge, Web, Visual, Skill) und synthetisiere ihre Erkenntnisse.`
        : aiTarget === "gemini-fusion"
        ? `Du bist SUPER FUSION AI - fusioniere alle verfügbaren KI-Perspektiven und gib eine holistische, tiefe Antwort.`
        : undefined;

      const { data, error } = await supabase.functions.invoke("gemini-free-ai", {
        body: {
          prompt: promptText,
          systemPrompt,
          model: modelMap[aiTarget] || "gemini-2.5-flash",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data?.text || "Keine Antwort");

      // Increment usage if real template
      if (selectedTemplate && !selectedTemplate.id.startsWith("f")) {
        await supabase.from("prompt_templates")
          .update({ usage_count: selectedTemplate.usage_count + 1 })
          .eq("id", selectedTemplate.id);
        loadTemplates();
      }

    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast({ title: "Kopiert!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Director: "default", Manager: "secondary", Specialist: "outline",
    };
    return (colors[category] || "outline") as "default" | "secondary" | "outline";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Prompt Lab</h2>
          <p className="text-xs text-muted-foreground">Templates + direktes Senden an jedes KI-System</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Templates Panel */}
        <Card className="p-4 glass-card border-border/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Templates
            </h3>
            <Button variant="ghost" size="sm" onClick={loadTemplates} className="h-7 w-7 p-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-primary/5 hover:border-primary/30 ${
                  selectedTemplate?.id === template.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">{template.name}</p>
                  <Badge variant={getCategoryColor(template.category)} className="text-[10px] h-4 flex-shrink-0">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {template.usage_count}x verwendet
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Editor & Output */}
        <div className="space-y-3">
          <Card className="p-4 glass-card border-border/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-semibold">Prompt bearbeiten</label>
                <Select value={aiTarget} onValueChange={setAiTarget}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TARGETS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2 text-xs">
                          {t.icon}
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Wähle ein Template links oder schreibe deinen eigenen Prompt..."
                className="min-h-[120px] resize-none text-sm"
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !promptText.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin mr-2" />
                    Generiere...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    An {AI_TARGETS.find(t => t.value === aiTarget)?.label} senden
                  </>
                )}
              </Button>
            </div>
          </Card>

          {result && (
            <Card className="p-4 glass-card border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  KI-Antwort
                </h4>
                <Button variant="ghost" size="sm" onClick={copyResult} className="h-7 px-2 text-xs">
                  <Copy className={`h-3.5 w-3.5 mr-1 ${copied ? "text-primary" : ""}`} />
                  {copied ? "Kopiert" : "Kopieren"}
                </Button>
              </div>
              <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto text-foreground/90 leading-relaxed">
                {result}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
