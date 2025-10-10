import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Video, Loader2, Download, Play } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [duration, setDuration] = useState("5");
  const { toast } = useToast();

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Video-Prompt ein",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    console.log("🎬 Starting video generation with prompt:", prompt);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { 
          prompt,
          duration: parseInt(duration),
        },
      });

      if (error) {
        console.error("❌ Video generation error:", error);
        throw error;
      }

      console.log("📥 Video generation response:", data);

      if (data.predictionId) {
        setPredictionId(data.predictionId);
        toast({
          title: "Video wird generiert...",
          description: "Dies kann 1-3 Minuten dauern. Bitte warten...",
        });
        
        // Poll for completion
        pollVideoStatus(data.predictionId);
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        toast({
          title: "Video generiert!",
          description: "Dein Video ist bereit zum Ansehen.",
        });
      }
    } catch (error) {
      console.error("❌ Video generation error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Videogenerierung fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (predId: string) => {
    const maxAttempts = 60; // 5 Minuten bei 5 Sekunden Intervall
    let attempts = 0;

    const checkStatus = async () => {
      try {
        console.log(`🔄 Checking video status (attempt ${attempts + 1}/${maxAttempts})`);
        
        const { data, error } = await supabase.functions.invoke("generate-video", {
          body: { predictionId: predId },
        });

        if (error) throw error;

        console.log("📊 Status check response:", data);

        if (data.status === "succeeded" && data.output) {
          setVideoUrl(data.output);
          setIsGenerating(false);
          toast({
            title: "Video fertig! 🎉",
            description: "Dein Video wurde erfolgreich generiert.",
          });
          return true;
        } else if (data.status === "failed") {
          throw new Error("Video generation failed");
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          throw new Error("Video generation timeout");
        }
      } catch (error) {
        console.error("❌ Status check error:", error);
        setIsGenerating(false);
        toast({
          title: "Fehler",
          description: "Video-Status konnte nicht abgerufen werden",
          variant: "destructive",
        });
      }
    };

    checkStatus();
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${Date.now()}.mp4`;
    link.click();
    
    toast({
      title: "Download gestartet",
      description: "Das Video wird heruntergeladen...",
    });
  };

  return (
    <Card className="p-6 space-y-4 glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KI-Videogenerierung</h3>
        </div>
        {videoUrl && (
          <Button variant="outline" size="sm" onClick={downloadVideo}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video-prompt">Video-Beschreibung</Label>
          <Textarea
            id="video-prompt"
            placeholder="Beschreibe das Video, das generiert werden soll... z.B. 'Ein Sonnenuntergang über dem Meer mit Wellen'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Dauer (Sekunden)</Label>
          <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Sekunden</SelectItem>
              <SelectItem value="5">5 Sekunden</SelectItem>
              <SelectItem value="10">10 Sekunden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={generateVideo} 
          disabled={isGenerating}
          className="w-full gradient-primary hover-lift"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generiere Video...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Video generieren
            </>
          )}
        </Button>
      </div>

      {videoUrl && (
        <div className="mt-6 space-y-2">
          <Label>Generiertes Video</Label>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg shadow-lg"
            autoPlay
            loop
          />
        </div>
      )}

      {isGenerating && !videoUrl && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Video wird generiert... Dies kann 1-3 Minuten dauern.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};