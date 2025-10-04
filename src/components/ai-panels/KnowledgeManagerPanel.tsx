import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useKnowledgeManager } from "@/hooks/useKnowledgeManager";
import { Database, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const KnowledgeManagerPanel = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const { searchKnowledge, isLoading } = useKnowledgeManager();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({ title: "Bitte gib einen Suchbegriff ein", variant: "destructive" });
      return;
    }

    try {
      const data = await searchKnowledge(query);
      setResults(data);
      toast({ title: `🔍 ${(data.entries?.length || 0) + (data.nodes?.length || 0)} Ergebnisse gefunden` });
    } catch (error) {
      toast({ title: "Fehler bei der Suche", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Database className="h-5 w-5" />
        <p className="text-sm">
          Persistentes Wissensmanagement mit Knowledge Graph
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Wissensbasis durchsuchen..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {results && (
        <div className="space-y-2">
          {results.entries && results.entries.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Wissenseinträge:</h3>
              {results.entries.map((entry: any) => (
                <Card key={entry.id} className="p-3 mb-2">
                  <h4 className="font-medium">{entry.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.content}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {entry.tags?.slice(0, 3).map((tag: string, idx: number) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {results.nodes && results.nodes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Knowledge Graph Nodes:</h3>
              {results.nodes.map((node: any) => (
                <Card key={node.id} className="p-3 mb-2">
                  <h4 className="font-medium">{node.node_label}</h4>
                  <p className="text-xs text-muted-foreground">{node.node_type}</p>
                </Card>
              ))}
            </div>
          )}

          {(!results.entries || results.entries.length === 0) &&
           (!results.nodes || results.nodes.length === 0) && (
            <Card className="p-4 text-center text-muted-foreground">
              Keine Ergebnisse gefunden
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
