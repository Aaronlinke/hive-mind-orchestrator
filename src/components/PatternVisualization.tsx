import { useEffect } from 'react';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Brain, TrendingUp } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

export const PatternVisualization = () => {
  const { patterns, loadPatterns, detectPatterns, isDetecting } = usePatternRecognition();

  useEffect(() => {
    loadPatterns();
  }, []);

  const handleDetect = async () => {
    try {
      const result = await detectPatterns();
      toast.success(`${result.patternsDetected} neue Muster erkannt!`);
    } catch (error) {
      toast.error('Pattern detection failed');
    }
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Emergent Patterns
        </h3>
        <Button onClick={handleDetect} disabled={isDetecting}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Detect Patterns
        </Button>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern) => (
          <Card key={pattern.id} className="p-4 bg-background/30 border-primary/10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {pattern.pattern_name.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <div className="text-sm text-muted-foreground">
                  Detected {pattern.occurrence_count}x
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {(pattern.confidence_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>

            <Progress value={pattern.confidence_score * 100} className="mb-3" />

            <div className="flex flex-wrap gap-2 mb-2">
              {pattern.contributing_agents.map((agent, idx) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  {agent}
                </span>
              ))}
            </div>

            {pattern.pattern_data?.improvement && (
              <div className="text-sm text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{pattern.pattern_data.improvement}% Improvement
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};