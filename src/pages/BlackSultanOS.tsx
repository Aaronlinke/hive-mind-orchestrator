import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Activity, Pause, Play, Sparkles, Network, RotateCcw, MessageSquare, ArrowLeft } from 'lucide-react';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { toast } from 'sonner';

interface Neuron {
  id: number;
  x: number;
  y: number;
  potential: number;
  threshold: number;
  firing: boolean;
  refractory: number;
  type: 'excitatory' | 'inhibitory';
  cluster: number;
  activity: number;
}

interface Synapse {
  from: number;
  to: number;
  weight: number;
  lastActive: number;
}

interface ClusterInfo {
  id: number;
  neurons: number[];
  avgActivity: number;
  color: string;
}

const CLUSTER_COLORS = [
  '#00ff88', '#ff0088', '#0088ff', '#ffaa00', '#aa00ff',
  '#00ffff', '#ff4444', '#44ff44', '#ff44ff', '#44ffff'
];

const BlackSultanOS = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const neuronsRef = useRef<Neuron[]>([]);
  const synapsesRef = useRef<Synapse[]>([]);
  const tickRef = useRef(0);

  const [isSimulating, setIsSimulating] = useState(false);
  const [neuronCount, setNeuronCount] = useState(80);
  const [connectionDensity, setConnectionDensity] = useState(30);
  const [stimulusStrength, setStimulusStrength] = useState(50);
  const [metrics, setMetrics] = useState({ firingRate: 0, avgPotential: 0, clusters: 0, synapticStrength: 0 });
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [activeTab, setActiveTab] = useState('simulation');

  const { generate, isLoading: aiLoading } = useGeminiAI();

  const initNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const neurons: Neuron[] = [];
    const synapses: Synapse[] = [];

    for (let i = 0; i < neuronCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * Math.min(w, h) * 0.4;
      neurons.push({
        id: i,
        x: w / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: h / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        potential: -70 + Math.random() * 10,
        threshold: -55 + Math.random() * 5,
        firing: false,
        refractory: 0,
        type: Math.random() > 0.2 ? 'excitatory' : 'inhibitory',
        cluster: Math.floor(Math.random() * 5),
        activity: 0,
      });
    }

    // Create synapses based on distance and density
    for (let i = 0; i < neurons.length; i++) {
      for (let j = 0; j < neurons.length; j++) {
        if (i === j) continue;
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const prob = (connectionDensity / 100) * Math.exp(-dist / 150);
        if (Math.random() < prob) {
          synapses.push({
            from: i,
            to: j,
            weight: (Math.random() * 0.5 + 0.3) * (neurons[i].type === 'excitatory' ? 1 : -0.8),
            lastActive: 0,
          });
        }
      }
    }

    neuronsRef.current = neurons;
    synapsesRef.current = synapses;
    tickRef.current = 0;
    detectClusters();
  }, [neuronCount, connectionDensity]);

  const detectClusters = () => {
    const neurons = neuronsRef.current;
    const k = 5;
    const clusterMap: ClusterInfo[] = [];
    for (let c = 0; c < k; c++) {
      const members = neurons.filter(n => n.cluster === c).map(n => n.id);
      if (members.length > 0) {
        clusterMap.push({
          id: c,
          neurons: members,
          avgActivity: members.reduce((s, id) => s + neurons[id].activity, 0) / members.length,
          color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
        });
      }
    }
    setClusters(clusterMap);
  };

  const simulate = useCallback(() => {
    const neurons = neuronsRef.current;
    const synapses = synapsesRef.current;
    tickRef.current++;

    // Random background stimulus
    if (Math.random() < stimulusStrength / 500) {
      const idx = Math.floor(Math.random() * neurons.length);
      neurons[idx].potential += 30;
    }

    // Leaky Integrate-and-Fire step
    let firingCount = 0;
    for (const n of neurons) {
      if (n.refractory > 0) {
        n.refractory--;
        n.potential = -70;
        n.firing = false;
        continue;
      }

      // Leak towards resting potential
      n.potential += (-70 - n.potential) * 0.05;

      // Noise
      n.potential += (Math.random() - 0.5) * 2;

      // Check threshold
      if (n.potential >= n.threshold) {
        n.firing = true;
        n.refractory = 5;
        n.activity = Math.min(1, n.activity + 0.3);
        firingCount++;

        // Propagate spikes through synapses (STDP-like)
        for (const s of synapses) {
          if (s.from === n.id) {
            neurons[s.to].potential += s.weight * (stimulusStrength / 50) * 15;
            s.lastActive = tickRef.current;
            // STDP: strengthen active synapses
            s.weight += 0.01 * (s.weight > 0 ? 1 : -1);
            s.weight = Math.max(-2, Math.min(2, s.weight));
          }
        }
      } else {
        n.firing = false;
      }

      // Activity decay
      n.activity *= 0.995;
    }

    // Re-cluster every 100 ticks using simple k-means-like approach
    if (tickRef.current % 100 === 0) {
      for (const n of neurons) {
        // Find nearest high-activity neuron's cluster
        let bestDist = Infinity;
        let bestCluster = n.cluster;
        for (const other of neurons) {
          if (other.id === n.id) continue;
          if (other.activity > 0.3) {
            const dx = n.x - other.x;
            const dy = n.y - other.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < bestDist) {
              bestDist = d;
              bestCluster = other.cluster;
            }
          }
        }
        if (bestDist < 100) n.cluster = bestCluster;
      }
      detectClusters();
    }

    // Update metrics
    const avgPot = neurons.reduce((s, n) => s + n.potential, 0) / neurons.length;
    const avgWeight = synapses.length > 0 ? synapses.reduce((s, syn) => s + Math.abs(syn.weight), 0) / synapses.length : 0;
    setMetrics({
      firingRate: firingCount / neurons.length,
      avgPotential: avgPot,
      clusters: new Set(neurons.map(n => n.cluster)).size,
      synapticStrength: avgWeight,
    });
  }, [stimulusStrength]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const neurons = neuronsRef.current;
    const synapses = synapsesRef.current;

    // Draw synapses
    for (const s of synapses) {
      const from = neurons[s.from];
      const to = neurons[s.to];
      if (!from || !to) continue;
      const recentlyActive = tickRef.current - s.lastActive < 10;
      const alpha = recentlyActive ? 0.6 : 0.05;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = s.weight > 0
        ? `rgba(0, 255, 136, ${alpha})`
        : `rgba(255, 0, 136, ${alpha})`;
      ctx.lineWidth = recentlyActive ? Math.abs(s.weight) * 2 : 0.3;
      ctx.stroke();
    }

    // Draw neurons
    for (const n of neurons) {
      const clusterColor = CLUSTER_COLORS[n.cluster % CLUSTER_COLORS.length];

      // Glow for firing neurons
      if (n.firing) {
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 25);
        gradient.addColorStop(0, n.type === 'excitatory' ? 'rgba(0,255,136,0.8)' : 'rgba(255,0,136,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neuron body
      const radius = 3 + n.activity * 5;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = n.firing ? '#ffffff' : clusterColor;
      ctx.fill();

      // Potential bar
      const potNorm = (n.potential + 70) / 50;
      ctx.fillStyle = `rgba(255,255,255,0.3)`;
      ctx.fillRect(n.x - 5, n.y + radius + 2, 10, 2);
      ctx.fillStyle = potNorm > 0.6 ? '#ff4444' : '#00ff88';
      ctx.fillRect(n.x - 5, n.y + radius + 2, potNorm * 10, 2);
    }

    // HUD overlay
    ctx.fillStyle = 'rgba(0,255,136,0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(`TICK: ${tickRef.current}`, 10, 20);
    ctx.fillText(`NEURONS: ${neurons.length}`, 10, 36);
    ctx.fillText(`SYNAPSES: ${synapses.length}`, 10, 52);
    ctx.fillText(`FIRING: ${(metrics.firingRate * 100).toFixed(1)}%`, 10, 68);
  }, [metrics.firingRate]);

  const loop = useCallback(() => {
    if (!isSimulating) return;
    simulate();
    draw();
    animRef.current = requestAnimationFrame(loop);
  }, [isSimulating, simulate, draw]);

  useEffect(() => {
    initNetwork();
  }, [initNetwork]);

  useEffect(() => {
    if (isSimulating) {
      animRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animRef.current);
      draw(); // Draw static state
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isSimulating, loop, draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Stimulate nearby neurons
    for (const n of neuronsRef.current) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        n.potential = 0; // Force fire
      }
    }
    if (!isSimulating) draw();
  };

  const analyzeWithAI = async () => {
    try {
      const insight = await generate(
        `Analysiere dieses neuronale Netzwerk: ${neuronsRef.current.length} Neuronen, ${synapsesRef.current.length} Synapsen, Feuerrate ${(metrics.firingRate * 100).toFixed(1)}%, ${metrics.clusters} Cluster, durchschnittliches Potential ${metrics.avgPotential.toFixed(1)}mV, synaptische Stärke ${metrics.synapticStrength.toFixed(3)}. Beschreibe emergente Muster und gib Empfehlungen für die Simulation. Antworte auf Deutsch, kurz und technisch.`,
        { systemPrompt: 'Du bist ein Computational Neuroscience Experte. Analysiere neuronale Netzwerk-Simulationen.' }
      );
      setAiInsight(insight);
    } catch {
      // error handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold font-mono terminal-text flex items-center gap-2">
            <Brain className="w-8 h-8 text-green-400" />
            BLACK SULTAN OS
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { initNetwork(); toast.success('Netzwerk zurückgesetzt'); }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setIsSimulating(!isSimulating)} className="gap-1">
              {isSimulating ? <><Pause className="w-4 h-4" /> Stopp</> : <><Play className="w-4 h-4" /> Start</>}
            </Button>
            <Button size="sm" variant="secondary" onClick={analyzeWithAI} disabled={aiLoading} className="gap-1">
              <MessageSquare className="w-4 h-4" /> {aiLoading ? 'Analysiere...' : 'KI-Analyse'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="metrics">Metriken</TabsTrigger>
            <TabsTrigger value="clusters">Cluster</TabsTrigger>
            <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="space-y-4">
            {/* Canvas */}
            <Card className="p-2 bg-black">
              <canvas
                ref={canvasRef}
                width={900}
                height={550}
                className="w-full rounded cursor-crosshair"
                onClick={handleCanvasClick}
              />
            </Card>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <label className="text-sm font-medium mb-2 block">Neuronen: {neuronCount}</label>
                <Slider value={[neuronCount]} onValueChange={v => setNeuronCount(v[0])} min={20} max={200} step={10} />
              </Card>
              <Card className="p-4">
                <label className="text-sm font-medium mb-2 block">Verbindungsdichte: {connectionDensity}%</label>
                <Slider value={[connectionDensity]} onValueChange={v => setConnectionDensity(v[0])} min={5} max={80} step={5} />
              </Card>
              <Card className="p-4">
                <label className="text-sm font-medium mb-2 block">Stimulus: {stimulusStrength}%</label>
                <Slider value={[stimulusStrength]} onValueChange={v => setStimulusStrength(v[0])} min={0} max={100} step={5} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm text-muted-foreground">Feuerrate</p>
                <p className="text-2xl font-bold font-mono">{(metrics.firingRate * 100).toFixed(1)}%</p>
              </Card>
              <Card className="p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm text-muted-foreground">Ø Potential</p>
                <p className="text-2xl font-bold font-mono">{metrics.avgPotential.toFixed(1)} mV</p>
              </Card>
              <Card className="p-4 text-center">
                <Network className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-muted-foreground">Cluster</p>
                <p className="text-2xl font-bold font-mono">{metrics.clusters}</p>
              </Card>
              <Card className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-muted-foreground">Syn. Stärke</p>
                <p className="text-2xl font-bold font-mono">{metrics.synapticStrength.toFixed(3)}</p>
              </Card>
            </div>
            <Card className="p-4 mt-4">
              <h3 className="font-semibold mb-2">Netzwerk-Zusammenfassung</h3>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                <div>Neuronen: {neuronsRef.current.length}</div>
                <div>Synapsen: {synapsesRef.current.length}</div>
                <div>Exzitatorisch: {neuronsRef.current.filter(n => n.type === 'excitatory').length}</div>
                <div>Inhibitorisch: {neuronsRef.current.filter(n => n.type === 'inhibitory').length}</div>
                <div>Tick: {tickRef.current}</div>
                <div>Status: {isSimulating ? '🟢 Aktiv' : '🔴 Pausiert'}</div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="clusters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                    <h3 className="font-semibold">Cluster {c.id}</h3>
                    <Badge variant="secondary">{c.neurons.length} Neuronen</Badge>
                  </div>
                  <div className="w-full bg-muted rounded h-2">
                    <div
                      className="h-2 rounded transition-all"
                      style={{ width: `${Math.min(100, c.avgActivity * 100)}%`, backgroundColor: c.color }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Aktivität: {(c.avgActivity * 100).toFixed(1)}%</p>
                </Card>
              ))}
              {clusters.length === 0 && (
                <Card className="p-8 text-center col-span-2 text-muted-foreground">
                  Starte die Simulation, um Cluster zu erkennen.
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-lg">KI-Analyse des Netzwerks</h3>
              </div>
              {aiInsight ? (
                <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">{aiInsight}</div>
              ) : (
                <p className="text-muted-foreground">Klicke "KI-Analyse" um das aktuelle Netzwerk von der KI analysieren zu lassen.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlackSultanOS;
