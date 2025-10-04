import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useWebInteraction } from "@/hooks/useWebInteraction";
import { Globe, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WebInteractionPanel = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const { fetchWebContent, extractContent, isInteracting } = useWebInteraction();
  const { toast } = useToast();

  const handleFetch = async () => {
    if (!url.trim()) {
      toast({ title: "Bitte gib eine URL ein", variant: "destructive" });
      return;
    }

    try {
      const data = await fetchWebContent(url);
      setResult(data.result);
      toast({ title: "🌐 Web-Inhalt erfolgreich abgerufen" });
    } catch (error) {
      toast({ title: "Fehler beim Abrufen", variant: "destructive" });
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      toast({ title: "Bitte gib eine URL ein", variant: "destructive" });
      return;
    }

    try {
      const data = await extractContent(url);
      setResult(data.result);
      toast({ title: "📄 Inhalt erfolgreich extrahiert" });
    } catch (error) {
      toast({ title: "Fehler bei der Extraktion", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Globe className="h-5 w-5" />
        <p className="text-sm">
          Web-Interaktions-Engine mit Intent Recognition
        </p>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="flex gap-2">
          <Button onClick={handleFetch} disabled={isInteracting} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {isInteracting ? "Lädt..." : "Fetch"}
          </Button>
          <Button onClick={handleExtract} disabled={isInteracting} variant="outline" className="flex-1">
            {isInteracting ? "Extrahiert..." : "Extract"}
          </Button>
        </div>
      </div>

      {result && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Ergebnis:</h3>
          {result.statusCode && (
            <p className="text-sm mb-2">Status: {result.statusCode}</p>
          )}
          {result.contentType && (
            <p className="text-sm mb-2">Content-Type: {result.contentType}</p>
          )}
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">
            {result.preview || result.extractedText || JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
