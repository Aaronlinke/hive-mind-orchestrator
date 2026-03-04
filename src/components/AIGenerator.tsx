import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Image, FileText, Code, Loader2, Copy, Check, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TEXT_STYLES = [
  { value: 'kreativ', label: 'Kreativ' },
  { value: 'professionell', label: 'Professionell' },
  { value: 'analytisch', label: 'Analytisch' },
  { value: 'poetisch', label: 'Poetisch' },
  { value: 'technisch', label: 'Technisch' },
  { value: 'storytelling', label: 'Storytelling' },
];

const CODE_LANGS = [
  { value: 'TypeScript', label: '📘 TypeScript' },
  { value: 'Python', label: '🐍 Python' },
  { value: 'React', label: '⚛️ React' },
  { value: 'JavaScript', label: '📙 JavaScript' },
  { value: 'SQL', label: '🗄️ SQL' },
  { value: 'Rust', label: '🦀 Rust' },
];

export const AIGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: string; content: string } | null>(null);
  const [textStyle, setTextStyle] = useState("kreativ");
  const [codeLang, setCodeLang] = useState("TypeScript");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generate = async (type: 'text' | 'image' | 'code') => {
    if (!prompt.trim()) {
      toast({ title: "Fehler", description: "Bitte gib einen Prompt ein", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      if (type === 'image') {
        // Nutze generate-image edge function
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: { prompt }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (data?.imageUrl) {
          setResult({ type: 'image', content: data.imageUrl });
          toast({ title: "🖼️ Bild generiert!", description: "Bild erfolgreich erstellt" });
        } else {
          throw new Error("Kein Bild erhalten");
        }
        return;
      }

      const systemPrompts: Record<string, string> = {
        text: `Du bist ein brillanter Textgenerator im Stil: ${textStyle}. Erstelle hochwertigen, strukturierten Text auf Deutsch. Nutze Markdown.`,
        code: `Du bist ein Expert-Entwickler für ${codeLang}. Generiere sauberen, kommentierten, produktionsreifen Code. Gib NUR den Code zurück mit kurzen Inline-Kommentaren.`,
      };

      const promptText = type === 'code'
        ? `Generiere ${codeLang} Code für: ${prompt}`
        : `Erstelle ${textStyle}en Text über: ${prompt}`;

      const { data, error } = await supabase.functions.invoke('gemini-free-ai', {
        body: {
          prompt: promptText,
          systemPrompt: systemPrompts[type],
          model: type === 'code' ? 'gemini-2.5-flash' : 'gemini-2.5-pro',
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({ type, content: data?.text || '' });
      toast({ title: type === 'code' ? "💻 Code generiert!" : "✨ Text generiert!", description: "Inhalt erfolgreich erstellt" });
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message || "Generierung fehlgeschlagen", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Kopiert!" });
  };

  const downloadResult = () => {
    if (!result) return;
    const ext = result.type === 'code' ? codeLang.toLowerCase().replace('react', 'tsx').replace('typescript', 'ts').replace('python', 'py').replace('javascript', 'js').replace('sql', 'sql').replace('rust', 'rs') : 'md';
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">KI-Generator</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <div className="w-2 h-2 bg-success rounded-full" />
          Gemini Pro
        </Badge>
      </div>

      <Textarea
        placeholder="Was soll generiert werden? Beschreibe deine Idee..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isGenerating}
        rows={3}
        className="resize-none"
      />

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" disabled={isGenerating}>
            <FileText className="h-4 w-4 mr-2" />Text
          </TabsTrigger>
          <TabsTrigger value="image" disabled={isGenerating}>
            <Image className="h-4 w-4 mr-2" />Bild
          </TabsTrigger>
          <TabsTrigger value="code" disabled={isGenerating}>
            <Code className="h-4 w-4 mr-2" />Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-3 space-y-3">
          <Select value={textStyle} onValueChange={setTextStyle} disabled={isGenerating}>
            <SelectTrigger><SelectValue placeholder="Stil wählen..." /></SelectTrigger>
            <SelectContent>
              {TEXT_STYLES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => generate('text')} disabled={isGenerating} className="w-full">
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generiere...</> : <><Sparkles className="h-4 w-4 mr-2" />Text generieren</>}
          </Button>
        </TabsContent>

        <TabsContent value="image" className="mt-3">
          <Button onClick={() => generate('image')} disabled={isGenerating} className="w-full">
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generiere...</> : <><Image className="h-4 w-4 mr-2" />Bild generieren</>}
          </Button>
        </TabsContent>

        <TabsContent value="code" className="mt-3 space-y-3">
          <Select value={codeLang} onValueChange={setCodeLang} disabled={isGenerating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CODE_LANGS.map(l => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => generate('code')} disabled={isGenerating} className="w-full">
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generiere...</> : <><Code className="h-4 w-4 mr-2" />Code generieren</>}
          </Button>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Ergebnis</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={copyResult}>
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              {result.type !== 'image' && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={downloadResult}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden">
            {result.type === 'image' ? (
              <img src={result.content} alt="Generiert" className="w-full rounded-lg" />
            ) : (
              <pre className="text-sm overflow-auto max-h-80 p-4 bg-muted/50 whitespace-pre-wrap break-words">
                <code>{result.content}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
