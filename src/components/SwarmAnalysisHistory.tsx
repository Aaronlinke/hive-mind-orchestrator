import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Download, Eye } from "lucide-react";
import { useState } from "react";

interface AnalysisEntry {
  id: string;
  timestamp: Date;
  query: string;
  consensusLevel: number;
  agentsUsed: number;
  avgConfidence: number;
}

export const SwarmAnalysisHistory = () => {
  const [history] = useState<AnalysisEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000),
      query: 'Nachhaltige Energiequellen in urbanen Gebieten',
      consensusLevel: 87,
      agentsUsed: 4,
      avgConfidence: 0.82
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000),
      query: 'KI-gestützte Verkehrsoptimierung',
      consensusLevel: 92,
      agentsUsed: 4,
      avgConfidence: 0.89
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000),
      query: 'Blockchain in Supply Chain Management',
      consensusLevel: 78,
      agentsUsed: 4,
      avgConfidence: 0.75
    }
  ]);

  const formatTime = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
    if (hours < 1) return 'Vor wenigen Minuten';
    if (hours === 1) return 'Vor 1 Stunde';
    return `Vor ${hours} Stunden`;
  };

  return (
    <Card className="backdrop-blur-sm bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Analyse-Historie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">
            Keine bisherigen Analysen
          </p>
        ) : (
          history.map((entry) => (
            <Card key={entry.id} className="bg-background/50 hover:bg-background/70 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{entry.query}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(entry.timestamp)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Konsens: {entry.consensusLevel}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Agenten:</span>
                    <span className="font-semibold">{entry.agentsUsed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Avg. Konfidenz:</span>
                    <span className="font-semibold">{(entry.avgConfidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Ansehen
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
