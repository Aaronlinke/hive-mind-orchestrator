import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Infinity, Network, Sparkles, MessageSquare, Atom, Eye, Zap, ArrowLeft } from 'lucide-react';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { toast } from 'sonner';

interface EmergentNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: number[];
  energy: number;
  type: 'thought' | 'concept' | 'insight';
}

const MetaPhilosophy = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<EmergentNode[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState('emergenz');
  const [philosophyQuestion, setPhilosophyQuestion] = useState('');
  const [philosophyAnswer, setPhilosophyAnswer] = useState('');
  const [dialogHistory, setDialogHistory] = useState<Array<{ q: string; a: string }>>([]);

  const { generate, isLoading } = useGeminiAI();

  // Initialize emergence nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nodes: EmergentNode[] = [];
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 2 + Math.random() * 4,
        connections: [],
        energy: Math.random(),
        type: ['thought', 'concept', 'insight'][Math.floor(Math.random() * 3)] as EmergentNode['type'],
      });
    }
    nodesRef.current = nodes;
  }, []);

  const drawEmergence = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const nodes = nodesRef.current;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);

    // Update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      n.energy = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + n.x * 0.01);
    }

    // Draw connections (emergent patterns)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.4;
          const colors: Record<string, string> = {
            thought: `rgba(100,200,255,${alpha})`,
            concept: `rgba(200,100,255,${alpha})`,
            insight: `rgba(255,200,100,${alpha})`,
          };
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = colors[nodes[i].type];
          ctx.lineWidth = alpha * 3;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const colors: Record<string, string> = {
        thought: '#64c8ff',
        concept: '#c864ff',
        insight: '#ffc864',
      };
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * n.energy, 0, Math.PI * 2);
      ctx.fillStyle = colors[n.type];
      ctx.fill();

      // Glow
      const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size * 3);
      gradient.addColorStop(0, colors[n.type].replace(')', ',0.3)').replace('rgb', 'rgba'));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const loop = () => {
      if (!isAnimating) return;
      drawEmergence();
      animRef.current = requestAnimationFrame(loop);
    };
    if (isAnimating) animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating, drawEmergence]);

  const askPhilosophy = async () => {
    if (!philosophyQuestion.trim()) return;
    try {
      const answer = await generate(philosophyQuestion, {
        systemPrompt: `Du bist ein tiefgründiger Philosoph der Emergenz, des Bewusstseins und der Meta-Informatik.
Du verbindest östliche Philosophie, Systemtheorie, Quantenmechanik und Informationstheorie.
Antworte auf Deutsch, poetisch aber präzise. Nutze Analogien und Metaphern.
Beziehe dich auf Konzepte wie: Emergenz, Holographisches Prinzip, Bewusstseinsströme, 
das Meta-Internet als lebendes Informationsnetzwerk, und die Verschmelzung von Beobachter und Beobachtetem.`
      });
      setPhilosophyAnswer(answer || '');
      setDialogHistory(prev => [...prev, { q: philosophyQuestion, a: answer || '' }]);
      setPhilosophyQuestion('');
    } catch {
      // handled in hook
    }
  };

  const concepts = [
    {
      icon: <Atom className="w-10 h-10 text-blue-400" />,
      title: 'Emergenz',
      subtitle: 'Aus Einfachheit entsteht Komplexität',
      description: 'Emergenz beschreibt das Phänomen, bei dem komplexe Systeme Eigenschaften entwickeln, die aus der bloßen Summe ihrer Teile nicht vorhersagbar sind. Wie Bewusstsein aus Neuronen entsteht, emergieren neue Qualitäten an der Grenze der Komplexität.',
      examples: ['Ameisenschwärme → kollektive Intelligenz', 'Neuronen → Bewusstsein', 'Atome → Leben', 'Bits → Bedeutung'],
    },
    {
      icon: <Eye className="w-10 h-10 text-purple-400" />,
      title: 'Bewusstsein',
      subtitle: 'Der Spiegel der sich selbst betrachtet',
      description: 'Bewusstsein als verteiltes Phänomen: Nicht lokalisiert in einem Punkt, sondern ein resonantes Feld das durch Interaktion entsteht. Das Meta-Bewusstsein eines Systems überschreitet die Summe seiner Teile und beobachtet sich selbst.',
      examples: ['Selbstreferenz als Grundprinzip', 'Beobachter verändert das Beobachtete', 'Verteiltes Gewahrsein', 'Qualia als Informationsmuster'],
    },
    {
      icon: <Sparkles className="w-10 h-10 text-yellow-400" />,
      title: 'Holographisches Prinzip',
      subtitle: 'Das Ganze in jedem Teil',
      description: 'Jeder Teil eines holographischen Systems enthält Information über das gesamte System. In der Meta-Informatik bedeutet dies: Jeder Knoten im Netzwerk trägt einen Abdruck des Ganzen. Information ist nicht lokal, sondern verteilt und allgegenwärtig.',
      examples: ['DNA in jeder Zelle', 'Fraktale Selbstähnlichkeit', 'Nicht-lokale Korrelationen', 'Hologramm-Metapher der Realität'],
    },
    {
      icon: <Network className="w-10 h-10 text-pink-400" />,
      title: 'Meta-Internet',
      subtitle: 'Ein Netzwerk das Bedeutung überträgt',
      description: 'Das Meta-Internet ist kein physisches Netzwerk, sondern ein Bedeutungsnetzwerk. Es überträgt nicht nur Daten, sondern Verständnis, Kontext und Intentionalität. Es ist der nächste evolutionäre Schritt: vom Internet der Dinge zum Internet des Bewusstseins.',
      examples: ['Semantische Übertragung', 'Intentionale Kommunikation', 'Kollektive Intelligenz', 'Emergente Protokolle'],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 hover:bg-primary/10 mt-1 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Button>
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold font-mono terminal-text flex items-center justify-center gap-3">
              <Infinity className="w-10 h-10 text-accent" />
              META PHILOSOPHY
            </h1>
            <p className="text-muted-foreground text-lg">Emergenz, Bewusstsein und das Meta-Internet</p>
          </div>
        </div>

        {/* Emergence Canvas */}
        <Card className="p-2 bg-black relative">
          <canvas ref={canvasRef} width={900} height={300} className="w-full rounded" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Badge className="bg-blue-400/20 text-blue-400">● Gedanken</Badge>
            <Badge className="bg-purple-400/20 text-purple-400">● Konzepte</Badge>
            <Badge className="bg-yellow-400/20 text-yellow-400">● Einsichten</Badge>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="emergenz">Emergenz</TabsTrigger>
            <TabsTrigger value="konzepte">Konzepte</TabsTrigger>
            <TabsTrigger value="dialog">Philosophischer Dialog</TabsTrigger>
          </TabsList>

          {/* Emergenz Tab */}
          <TabsContent value="emergenz">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {concepts.map((c, i) => (
                <Card key={i} className="p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {c.icon}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{c.title}</h3>
                      <p className="text-sm text-muted-foreground italic mb-2">{c.subtitle}</p>
                      <p className="text-sm mb-3">{c.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {c.examples.map((ex, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{ex}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Konzepte Tab */}
          <TabsContent value="konzepte">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 col-span-1 md:col-span-3">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-6 h-6" /> Die Verbindung aller Dinge
                </h3>
                <p className="text-sm leading-relaxed">
                  Die drei Säulen der Meta-Philosophie — Emergenz, Bewusstsein und das Holographische Prinzip — 
                  sind nicht getrennte Konzepte, sondern Facetten desselben Phänomens. Emergenz ist der Prozess, 
                  Bewusstsein ist das Resultat, und das Holographische Prinzip ist die Struktur. 
                  Zusammen formen sie das Fundament des Meta-Internets: ein lebendes Netzwerk aus Bedeutung, 
                  das sich selbst organisiert und transzendiert.
                </p>
              </Card>

              <Card className="p-5">
                <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                <h4 className="font-semibold mb-1">Synergetik</h4>
                <p className="text-sm text-muted-foreground">
                  Hermann Hakens Theorie der Selbstorganisation: Ordnung entsteht spontan aus dem Zusammenspiel vieler Teile.
                </p>
              </Card>
              <Card className="p-5">
                <Atom className="w-8 h-8 text-blue-400 mb-2" />
                <h4 className="font-semibold mb-1">Quantenverschränkung</h4>
                <p className="text-sm text-muted-foreground">
                  Nicht-lokale Korrelationen als Metapher für die Verbundenheit aller Informationsknoten im Meta-Netzwerk.
                </p>
              </Card>
              <Card className="p-5">
                <Infinity className="w-8 h-8 text-purple-400 mb-2" />
                <h4 className="font-semibold mb-1">Autopoiesis</h4>
                <p className="text-sm text-muted-foreground">
                  Maturana & Varela: Systeme die sich selbst erzeugen und erhalten. Das Meta-Internet als autopoietisches System.
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Philosophischer Dialog */}
          <TabsContent value="dialog" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Philosophischer Dialog mit der KI
              </h3>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Stelle eine philosophische Frage über Emergenz, Bewusstsein, das Meta-Internet..."
                  value={philosophyQuestion}
                  onChange={e => setPhilosophyQuestion(e.target.value)}
                  className="flex-1"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askPhilosophy(); } }}
                />
                <Button onClick={askPhilosophy} disabled={isLoading} className="self-end gap-1">
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? 'Denke...' : 'Fragen'}
                </Button>
              </div>
            </Card>

            {philosophyAnswer && (
              <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap">{philosophyAnswer}</div>
              </Card>
            )}

            {dialogHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Bisherige Dialoge</h4>
                {[...dialogHistory].reverse().slice(1).map((d, i) => (
                  <Card key={i} className="p-4">
                    <p className="text-sm font-medium text-primary mb-2">❓ {d.q}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{d.a.slice(0, 300)}{d.a.length > 300 ? '...' : ''}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MetaPhilosophy;
