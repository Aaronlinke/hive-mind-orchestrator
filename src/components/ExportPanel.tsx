import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileJson, FileCode, Copy } from "lucide-react";
import { copyToClipboard, formatJSON } from "@/lib/utils";

interface ExportPanelProps {
  messages: any[];
  codeSnippets: any[];
}

export const ExportPanel = ({ messages, codeSnippets }: ExportPanelProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportChat = async (format: "json" | "txt") => {
    setIsExporting(true);
    try {
      const content = {
        messages,
        exportedAt: new Date().toISOString(),
      };

      await supabase.from("user_exports").insert({
        export_type: "chat",
        export_format: format,
        content,
      });

      const blob = new Blob(
        [format === "json" ? JSON.stringify(content, null, 2) : messages.map(m => `${m.role}: ${m.content}`).join("\n\n")],
        { type: format === "json" ? "application/json" : "text/plain" }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: `Chat als ${format.toUpperCase()} exportiert`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCode = async () => {
    setIsExporting(true);
    try {
      const content = {
        codeSnippets,
        exportedAt: new Date().toISOString(),
      };

      await supabase.from("user_exports").insert({
        export_type: "code",
        export_format: "json",
        content,
      });

      const blob = new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Code exportiert",
        description: "Alle Code-Snippets wurden exportiert",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    const content = { messages, codeSnippets, exportedAt: new Date().toISOString() };
    await copyToClipboard(
      formatJSON(content),
      () => toast({ title: "In Zwischenablage kopiert" }),
      () => toast({ title: "Kopieren fehlgeschlagen", variant: "destructive" })
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Export</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          disabled={messages.length === 0}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => exportChat("json")}
          disabled={isExporting || messages.length === 0}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Chat als JSON
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => exportChat("txt")}
          disabled={isExporting || messages.length === 0}
        >
          <FileCode className="h-4 w-4 mr-2" />
          Chat als TXT
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={exportCode}
          disabled={isExporting || codeSnippets.length === 0}
        >
          <FileCode className="h-4 w-4 mr-2" />
          Code exportieren
        </Button>
      </div>
    </Card>
  );
};
