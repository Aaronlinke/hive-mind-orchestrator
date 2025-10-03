import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Loader2 } from "lucide-react";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Prompt ein",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, aiNodeId: "image-generator" },
      });

      if (error) throw error;

      setImageUrl(data.imageUrl);
      toast({
        title: "Bild generiert!",
        description: `Generierungszeit: ${data.generationTime}ms`,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Fehler",
        description: "Bildgenerierung fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Image className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Bildgenerierung</h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Beschreibe das Bild, das du generieren möchtest..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateImage()}
          disabled={isGenerating}
        />
        <Button onClick={generateImage} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generiere...
            </>
          ) : (
            "Generieren"
          )}
        </Button>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Generiertes Bild"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </Card>
  );
};
