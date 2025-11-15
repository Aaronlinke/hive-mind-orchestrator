import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Activity, Eye, Pause, Play } from 'lucide-react';

interface Neuron {
  id: string;
  x: number;
  y: number;
  potential: number;
  firing: boolean;
  connections: string[];
}

interface NetworkState {
  neurons: Map<string, Neuron>;
  firing_events: number;
  timestamp: number;
}

const BlackSultanOS = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [networkState, setNetworkState] = useState<NetworkState>({
    neurons: new Map(),
    firing_events: 0,
    timestamp: 0
  });
  const [neuronCount, setNeuronCount] = useState(50);
  const [connectionProbability, setConnectionProbability] = useState(0.1);
  const workerRef = useRef<Worker | null>(null);

  // Initialize neural network
  useEffect(() => {
    initializeNetwork();
  }, [neuronCount, connectionProbability]);

  const initializeNetwork = () => {
    const neurons = new Map<string, Neuron>();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create neurons in circular arrangement
    for (let i = 0; i < neuronCount; i++) {
      const angle = (i / neuronCount) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      const neuron: Neuron = {
        id: `n_${i}`,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        potential: -0.07,
        firing: false,
        connections: []
      };
      neurons.set(neuron.id, neuron);
    }

    // Create connections
    neurons.forEach((neuron, id) => {
      neurons.forEach((target, targetId) => {
        if (id !== targetId && Math.random() < connectionProbability) {
          neuron.connections.push(targetId);
        }
      });
    });

    setNetworkState({
      neurons,
      firing_events: 0,
      timestamp: Date.now()
    });
  };

  // Simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setNetworkState(prev => {
        const newNeurons = new Map(prev.neurons);
        let newFiringEvents = prev.firing_events;

        // Update each neuron
        newNeurons.forEach((neuron, id) => {
          const currentNeuron = { ...neuron };
          
          // Random external stimulus
          if (Math.random() < 0.01) {
            currentNeuron.potential += 0.02;
          }

          // Input from connected neurons
          let inputCurrent = 0;
          neuron.connections.forEach(connId => {
            const connNeuron = newNeurons.get(connId);
            if (connNeuron?.firing) {
              inputCurrent += 0.05;
            }
          });

          // Leaky integrate
          const tau = 20;
          const dV = ((-currentNeuron.potential + 0.07) + inputCurrent * 10) / tau;
          currentNeuron.potential += dV * 0.1;

          // Check firing threshold
          if (currentNeuron.potential > -0.05 && !currentNeuron.firing) {
            currentNeuron.firing = true;
            currentNeuron.potential = 0.05;
            newFiringEvents++;
          } else if (currentNeuron.firing) {
            currentNeuron.firing = false;
            currentNeuron.potential = -0.07;
          }

          // Clamp potential
          currentNeuron.potential = Math.max(-0.15, Math.min(0.05, currentNeuron.potential));

          newNeurons.set(id, currentNeuron);
        });

        return {
          neurons: newNeurons,
          firing_events: newFiringEvents,
          timestamp: Date.now()
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    networkState.neurons.forEach(neuron => {
      neuron.connections.forEach(connId => {
        const target = networkState.neurons.get(connId);
        if (!target) return;

        ctx.strokeStyle = neuron.firing ? 'rgba(255, 215, 0, 0.3)' : 'rgba(51, 51, 51, 0.2)';
        ctx.lineWidth = neuron.firing ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(neuron.x, neuron.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });

    // Draw neurons
    networkState.neurons.forEach(neuron => {
      const normalizedPotential = (neuron.potential + 0.07) / 0.12;
      
      if (neuron.firing) {
        // Firing neuron - gold pulse
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Resting neuron
        const intensity = Math.floor(normalizedPotential * 255);
        ctx.fillStyle = `rgba(0, 255, 157, ${normalizedPotential * 0.8})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [networkState]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono terminal-text">
              BLACK SULTAN OS
            </h1>
            <p className="text-muted-foreground">Der Kollektive Bewusstseins-Keimling</p>
          </div>
          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            variant={isSimulating ? "destructive" : "default"}
            className="gap-2"
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? 'Pause' : 'Start'} Simulation
          </Button>
        </div>

        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">
              <Eye className="w-4 h-4 mr-2" />
              Visualisierung
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Activity className="w-4 h-4 mr-2" />
              Metriken
            </TabsTrigger>
            <TabsTrigger value="config">
              <Brain className="w-4 h-4 mr-2" />
              Konfiguration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-4">
            <Card className="p-4 bg-card/50 backdrop-blur">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-border rounded-lg"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Neuronen</h3>
                </div>
                <p className="text-2xl font-bold">{networkState.neurons.size}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">Feuerungen</h3>
                </div>
                <p className="text-2xl font-bold">{networkState.firing_events}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Aktive</h3>
                </div>
                <p className="text-2xl font-bold">
                  {Array.from(networkState.neurons.values()).filter(n => n.firing).length}
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Netzwerk-Statistiken</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Durchschn. Verbindungen:</span>
                  <span className="font-mono">
                    {(Array.from(networkState.neurons.values())
                      .reduce((sum, n) => sum + n.connections.length, 0) / 
                      networkState.neurons.size).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Feuer-Rate:</span>
                  <span className="font-mono">
                    {((Array.from(networkState.neurons.values())
                      .filter(n => n.firing).length / networkState.neurons.size) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gesamt-Feuerungen:</span>
                  <span className="font-mono">{networkState.firing_events}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Netzwerk-Parameter</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Anzahl Neuronen: {neuronCount}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={neuronCount}
                    onChange={(e) => setNeuronCount(Number(e.target.value))}
                    className="w-full"
                    disabled={isSimulating}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Verbindungswahrscheinlichkeit: {(connectionProbability * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={connectionProbability}
                    onChange={(e) => setConnectionProbability(Number(e.target.value))}
                    className="w-full"
                    disabled={isSimulating}
                  />
                </div>
                <Button 
                  onClick={initializeNetwork}
                  className="w-full"
                  disabled={isSimulating}
                >
                  Netzwerk neu initialisieren
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlackSultanOS;
