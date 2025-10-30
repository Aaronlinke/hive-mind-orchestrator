import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Copy, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateCode } from "@/lib/localAI";

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript', icon: '📘' },
  { value: 'javascript', label: 'JavaScript', icon: '📙' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'react', label: 'React', icon: '⚛️' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
];

export const CodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte beschreibe, welchen Code du generieren möchtest",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCode("");

    try {
      // ✅ KOSTENLOS: Nutze lokales Code-Modell
      const code = await generateCode({
        prompt,
        language: LANGUAGES.find(l => l.value === language)?.label || language,
        maxTokens: 1024,
      });

      setGeneratedCode(code || "// Keine Antwort vom Modell");
      
      toast({
        title: "Code generiert! 🆓",
        description: `${LANGUAGES.find(l => l.value === language)?.label} Code wurde lokal erstellt (kostenlos)`,
      });

    } catch (error: any) {
      console.error("Code generation error:", error);
      
      toast({
        title: "Fehler",
        description: error?.message || "Lokales KI-Modell konnte nicht laden. Bitte Seite neu laden.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({
        title: "Kopiert!",
        description: "Code wurde in die Zwischenablage kopiert",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    if (!generatedCode) return;

    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      react: 'tsx',
      html: 'html',
      css: 'css',
      sql: 'sql',
    };

    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code.${extensions[language] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download gestartet",
      description: "Code wird heruntergeladen...",
    });
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Code-Generator</h3>
        </div>
        <Badge variant="outline">KI-gestützt</Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Programmiersprache</label>
          <Select value={language} onValueChange={setLanguage} disabled={isGenerating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.icon}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Code-Beschreibung</label>
          <Textarea
            placeholder="Beschreibe, welchen Code du generieren möchtest... z.B. 'Eine React-Komponente für einen Image Slider mit Thumbnails'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleGenerateCode} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generiere Code...
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-2" />
              Code generieren
            </>
          )}
        </Button>
      </div>

      {generatedCode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Generierter Code</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyCode}
                className="h-8"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Kopieren
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadCode}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          <pre className="p-4 rounded-lg bg-muted border overflow-auto max-h-96 text-xs">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </Card>
  );
};
