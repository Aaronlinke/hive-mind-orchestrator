import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Image, Video, Code, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AIGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: string; content: string } | null>(null);
  const { toast } = useToast();

  const generateContent = async (type: 'image' | 'video' | 'code') => {
    if (!prompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Prompt ein",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let data, error;
      
      switch(type) {
        case 'image':
          ({ data, error } = await supabase.functions.invoke("generate-image", {
            body: { prompt, aiNodeId: "ai-generator" },
          }));
          if (data) setResult({ type: 'image', content: data.imageUrl });
          break;
          
        case 'video':
          ({ data, error } = await supabase.functions.invoke("generate-video", {
            body: { prompt, duration: 5 },
          }));
          if (data?.predictionId) {
            toast({
              title: "Video wird generiert...",
              description: "Dies dauert 1-3 Minuten",
            });
            // Polling würde hier stattfinden
          }
          break;
          
        case 'code':
          ({ data, error } = await supabase.functions.invoke("super-fusion-ai", {
            body: { 
              message: `Generiere sauberen, gut dokumentierten Code für: ${prompt}` 
            },
          }));
          if (data) setResult({ type: 'code', content: data.message || data.response });
          break;
      }

      if (error) throw error;

      toast({
        title: "Erfolgreich generiert!",
        description: `${type.toUpperCase()} wurde erstellt`,
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Generierung fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 glass-card space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">KI-Generator</h3>
      </div>

      <Textarea
        placeholder="Was möchtest du generieren? (Bild, Video oder Code)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isGenerating}
        rows={4}
        className="resize-none"
      />

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" disabled={isGenerating}>
            <Image className="h-4 w-4 mr-2" />
            Bild
          </TabsTrigger>
          <TabsTrigger value="video" disabled={isGenerating}>
            <Video className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="code" disabled={isGenerating}>
            <Code className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="image" className="mt-4">
          <Button 
            onClick={() => generateContent('image')} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Bild generieren
          </Button>
        </TabsContent>
        
        <TabsContent value="video" className="mt-4">
          <Button 
            onClick={() => generateContent('video')} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Video generieren
          </Button>
        </TabsContent>
        
        <TabsContent value="code" className="mt-4">
          <Button 
            onClick={() => generateContent('code')} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Code generieren
          </Button>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="mt-4 p-4 rounded-lg border bg-card">
          {result.type === 'image' && (
            <img src={result.content} alt="Generated" className="w-full rounded-lg" />
          )}
          {result.type === 'code' && (
            <pre className="text-sm overflow-auto max-h-96 p-4 bg-muted rounded">
              <code>{result.content}</code>
            </pre>
          )}
        </div>
      )}
    </Card>
  );
};
