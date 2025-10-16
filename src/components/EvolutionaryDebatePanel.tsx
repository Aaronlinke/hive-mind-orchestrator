import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEvolutionaryAgents } from '@/hooks/useEvolutionaryAgents';
import { Play, Pause, RotateCcw, Zap, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

export const EvolutionaryDebatePanel = () => {
  const [topic, setTopic] = useState('');
  const [maxCycles, setMaxCycles] = useState(500);
  const [result, setResult] = useState<any>(null);

  const {
    agents,
    isDebating,
    evolutionHistory,
    currentCycle,
    initializeAgents,
    startEvolutionaryDebate,
    quickEvaluate,
    resetAgents,
  } = useEvolutionaryAgents();

  const handleStart = async () => {
    if (!topic.trim()) {
      toast.error('Bitte geben Sie ein Thema ein');
      return;
    }

    try {
      if (agents.length === 0) {
        initializeAgents(30);
      }

      toast.info('Starte evolutionäre Debatte mit 30 Agenten...');
      const debateResult = await startEvolutionaryDebate(topic, maxCycles, 0.95);
      
      setResult(debateResult);
      toast.success(
        `Debatte beendet! Score: ${Math.round(debateResult.finalScore)} nach ${debateResult.totalCycles} Zyklen`
      );
    } catch (error) {
      console.error('Debate error:', error);
      toast.error('Fehler bei der Debatte');
    }
  };

  const handleQuickEval = () => {
    if (!topic.trim()) {
      toast.error('Bitte geben Sie Text ein');
      return;
    }

    const evaluation = quickEvaluate(topic);
    toast.success(
      `Quick Evaluation: Score ${Math.round(evaluation.score)}, ${evaluation.tokenCount} Tokens, ${Math.round(evaluation.uniquenessRatio * 100)}% Einzigartigkeit`
    );
  };

  const handleReset = () => {
    setTopic('');
    setResult(null);
    resetAgents();
    toast.info('System zurückgesetzt');
  };

  const progress = maxCycles > 0 ? (currentCycle / maxCycles) * 100 : 0;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Evolutionäre Text-Optimierung
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Lokales Multi-Agenten-System ohne externe APIs
            </p>
          </div>
          {agents.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {agents.length} Agenten aktiv
            </Badge>
          )}
        </div>

        {/* Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Thema oder Text für Optimierung
          </label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z.B. 'Optimierung Energieverbrauch Industrieanlage' oder beliebiger Text zur Analyse..."
            className="min-h-[100px] bg-background border-border text-foreground"
            disabled={isDebating}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3 items-center flex-wrap">
          <Button
            onClick={handleStart}
            disabled={isDebating || !topic.trim()}
            className="flex items-center gap-2"
          >
            {isDebating ? (
              <>
                <Pause className="w-4 h-4" />
                Läuft... ({currentCycle}/{maxCycles})
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Starte Evolution
              </>
            )}
          </Button>

          <Button
            onClick={handleQuickEval}
            variant="outline"
            disabled={!topic.trim() || isDebating}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Quick Eval
          </Button>

          <Button
            onClick={handleReset}
            variant="ghost"
            disabled={isDebating}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-muted-foreground">Max Zyklen:</label>
            <input
              type="number"
              value={maxCycles}
              onChange={(e) => setMaxCycles(Math.max(50, parseInt(e.target.value) || 500))}
              className="w-20 px-2 py-1 border rounded bg-background border-border text-foreground text-sm"
              disabled={isDebating}
              min={50}
              max={2000}
            />
          </div>
        </div>

        {/* Progress */}
        {isDebating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Evolutionsfortschritt</span>
              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Optimierungsergebnis
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">Finaler Score</div>
                <div className="text-xl font-bold text-primary">
                  {Math.round(result.finalScore)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-xs text-muted-foreground mb-1">Zyklen</div>
                <div className="text-xl font-bold text-accent-foreground">
                  {result.totalCycles}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="text-xs text-muted-foreground mb-1">Verbesserungen</div>
                <div className="text-xl font-bold text-success">
                  {result.evolutionHistory.length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="text-xs text-muted-foreground mb-1">Konvergenzrate</div>
                <div className="text-xl font-bold text-warning">
                  {(result.convergenceRate * 1000).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Final Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Optimierter Text:</label>
              <div className="p-4 rounded-lg bg-muted border border-border text-foreground">
                {result.finalText}
              </div>
            </div>

            {/* Top Agents */}
            {result.topAgents && result.topAgents.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Top 5 Agenten:</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {result.topAgents.map((agent: any) => (
                    <div
                      key={agent.id}
                      className="p-2 rounded bg-background border border-border text-center"
                    >
                      <div className="text-xs text-muted-foreground">
                        Agent #{agent.id}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {agent.specialization}
                      </Badge>
                      <div className="text-sm font-semibold text-foreground mt-1">
                        {Math.round(agent.successRate * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evolution History */}
            {result.evolutionHistory.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Evolutionsverlauf ({result.evolutionHistory.length} Verbesserungen):
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 p-3 rounded-lg bg-muted border border-border">
                  {result.evolutionHistory.map((entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs text-muted-foreground flex justify-between items-center"
                    >
                      <span>
                        Cycle {entry.cycle}: Score {entry.bestScore} (Consensus {entry.consensusLevel}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>Funktionsweise:</strong> 30 spezialisierte Agenten (Analysis, Synthesis,
          Validation, Optimization) arbeiten zusammen, um den Text iterativ zu verbessern. Jeder
          Agent hat eigene Bewertungskriterien und passt sich adaptiv an erfolgreiche Strategien
          an. Komplett lokal, keine API-Calls.
        </div>
      </div>
    </Card>
  );
};
