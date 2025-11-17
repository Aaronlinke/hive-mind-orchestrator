import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Brain, Zap, Activity, Pause, Play, Sparkles, Network } from 'lucide-react';

interface Neuron {
  id: string;
  x: number;
  y: number;
  potential: number;
  firing: boolean;
  connections: string[];
  type: 'excitatory' | 'inhibitory';
}

const BlackSultanOS = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [neurons, setNeurons] = useState<Map<string, Neuron>>(new Map());
  const [neuronCount, setNeuronCount] = useState(80);

  useEffect(() => {
    const newNeurons = new Map<string, Neuron>();
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < neuronCount; i++) {
      const angle = (i / neuronCount) * Math.PI * 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      newNeurons.set(`n_${i}`, {
        id: `n_${i}`,
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        potential: -0.07,
        firing: false,
        connections: [],
        type: Math.random() > 0.2 ? 'excitatory' : 'inhibitory'
      });
    }
    setNeurons(newNeurons);
  }, [neuronCount]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-mono terminal-text flex items-center gap-2">
            <Brain className="w-8 h-8" />
            BLACK SULTAN OS
          </h1>
          <Button onClick={() => setIsSimulating(!isSimulating)}>
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>

        <Card className="p-4">
          <canvas ref={canvasRef} width={800} height={600} className="w-full rounded border border-border bg-black" />
        </Card>

        <Card className="p-4">
          <label className="text-sm mb-2 block">Neuronen: {neuronCount}</label>
          <Slider value={[neuronCount]} onValueChange={(v) => setNeuronCount(v[0])} min={20} max={150} step={10} />
        </Card>
      </div>
    </div>
  );
};

export default BlackSultanOS;