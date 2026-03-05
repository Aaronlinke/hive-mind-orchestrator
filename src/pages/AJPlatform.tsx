import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Sparkles, Database, Cpu, Code, Eye, Wand2, Plus, Trash2, Copy, Play, ArrowLeft } from 'lucide-react';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { toast } from 'sonner';

interface MetaLayer {
  id: string;
  name: string;
  type: 'data' | 'logic' | 'ui' | 'meta';
  content: string;
  connections: string[];
}

interface GeneratedComponent {
  id: string;
  name: string;
  code: string;
  language: string;
  timestamp: number;
}

const AJPlatform = () => {
  const navigate = useNavigate();
  const [layers, setLayers] = useState<MetaLayer[]>([
    { id: 'l1', name: 'Benutzer-Daten', type: 'data', content: '{ "users": [], "sessions": [] }', connections: ['l2'] },
    { id: 'l2', name: 'Auth-Logik', type: 'logic', content: 'validateToken(token) → bool', connections: ['l3'] },
    { id: 'l3', name: 'Dashboard-UI', type: 'ui', content: '<Dashboard data={users} />', connections: [] },
    { id: 'l4', name: 'Meta-Controller', type: 'meta', content: 'orchestrate(layers) → hologram', connections: ['l1', 'l2', 'l3'] },
  ]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateType, setGenerateType] = useState('react');
  const [runtimeOutput, setRuntimeOutput] = useState('');
  const [activeTab, setActiveTab] = useState('layers');

  const { generate, isLoading } = useGeminiAI();

  const addLayer = () => {
    const id = `l${Date.now()}`;
    setLayers(prev => [...prev, {
      id,
      name: 'Neuer Layer',
      type: 'data',
      content: '{}',
      connections: [],
    }]);
    setSelectedLayer(id);
    toast.success('Layer hinzugefügt');
  };

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id).map(l => ({
      ...l,
      connections: l.connections.filter(c => c !== id),
    })));
    if (selectedLayer === id) setSelectedLayer(null);
    toast.success('Layer entfernt');
  };

  const updateLayer = (id: string, updates: Partial<MetaLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const generateCode = async () => {
    if (!generatePrompt.trim()) {
      toast.error('Bitte gib eine Beschreibung ein');
      return;
    }

    const systemPrompt = `Du bist ein Code-Generator. Generiere sauberen, funktionalen ${generateType} Code. 
Gib NUR den Code zurück, keine Erklärungen. Der Code soll production-ready sein.
Kontext: Die AJ Platform nutzt Meta-Layer mit ${layers.length} aktiven Schichten.`;

    try {
      const code = await generate(
        `Generiere ${generateType} Code für: ${generatePrompt}\n\nAktive Layer: ${layers.map(l => `${l.name} (${l.type})`).join(', ')}`,
        { systemPrompt }
      );

      const comp: GeneratedComponent = {
        id: `gc_${Date.now()}`,
        name: generatePrompt.slice(0, 40),
        code: code || '',
        language: generateType,
        timestamp: Date.now(),
      };
      setGeneratedComponents(prev => [comp, ...prev]);
      toast.success('Code generiert!');
    } catch {
      // handled in hook
    }
  };

  const runInSandbox = async () => {
    const allCode = generatedComponents.map(c => c.code).join('\n\n');
    if (!allCode.trim()) {
      toast.error('Kein Code zum Ausführen');
      return;
    }

    try {
      const result = await generate(
        `Simuliere die Ausführung dieses Codes und beschreibe das Ergebnis:\n\n${allCode.slice(0, 3000)}`,
        { systemPrompt: 'Du bist eine Code-Sandbox. Analysiere und simuliere Code-Ausführung. Antworte auf Deutsch.' }
      );
      setRuntimeOutput(result || 'Keine Ausgabe');
    } catch {
      // handled in hook
    }
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);
  const typeColors: Record<string, string> = {
    data: 'text-blue-400 bg-blue-400/10',
    logic: 'text-yellow-400 bg-yellow-400/10',
    ui: 'text-green-400 bg-green-400/10',
    meta: 'text-purple-400 bg-purple-400/10',
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-mono terminal-text flex items-center gap-2">
                <Layers className="w-8 h-8 text-accent" />
                AJ PLATTFORM
              </h1>
              <p className="text-muted-foreground">Quanten-Holographische Informations-Architektur</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{layers.length} Layer</Badge>
            <Badge variant="outline">{generatedComponents.length} Komponenten</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="layers">Meta-Layer</TabsTrigger>
            <TabsTrigger value="generate">Code-Generation</TabsTrigger>
            <TabsTrigger value="runtime">Runtime-Sandbox</TabsTrigger>
          </TabsList>

          {/* Meta-Layer Editor */}
          <TabsContent value="layers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Layer List */}
              <Card className="p-4 col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Layer-Hierarchie</h3>
                  <Button size="sm" variant="ghost" onClick={addLayer}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {layers.map(layer => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedLayer === layer.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {layer.type === 'data' && <Database className="w-4 h-4 text-blue-400" />}
                          {layer.type === 'logic' && <Cpu className="w-4 h-4 text-yellow-400" />}
                          {layer.type === 'ui' && <Eye className="w-4 h-4 text-green-400" />}
                          {layer.type === 'meta' && <Sparkles className="w-4 h-4 text-purple-400" />}
                          <span className="text-sm font-medium">{layer.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge className={`mt-1 text-xs ${typeColors[layer.type]}`}>{layer.type}</Badge>
                      {layer.connections.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">→ {layer.connections.length} Verbindungen</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Layer Editor */}
              <Card className="p-4 col-span-2">
                {selectedLayerData ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <Input
                          value={selectedLayerData.name}
                          onChange={e => updateLayer(selectedLayerData.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="w-40">
                        <label className="text-sm font-medium mb-1 block">Typ</label>
                        <Select
                          value={selectedLayerData.type}
                          onValueChange={v => updateLayer(selectedLayerData.id, { type: v as MetaLayer['type'] })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="logic">Logic</SelectItem>
                            <SelectItem value="ui">UI</SelectItem>
                            <SelectItem value="meta">Meta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Inhalt / Schema</label>
                      <Textarea
                        value={selectedLayerData.content}
                        onChange={e => updateLayer(selectedLayerData.id, { content: e.target.value })}
                        className="font-mono text-sm min-h-[200px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Verbindungen</label>
                      <div className="flex flex-wrap gap-2">
                        {layers.filter(l => l.id !== selectedLayerData.id).map(l => (
                          <Badge
                            key={l.id}
                            variant={selectedLayerData.connections.includes(l.id) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const conns = selectedLayerData.connections.includes(l.id)
                                ? selectedLayerData.connections.filter(c => c !== l.id)
                                : [...selectedLayerData.connections, l.id];
                              updateLayer(selectedLayerData.id, { connections: conns });
                            }}
                          >
                            {l.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Wähle einen Layer zum Bearbeiten
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Code Generation */}
          <TabsContent value="generate" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Holographische Code-Generation
              </h3>
              <div className="flex gap-3 mb-3">
                <Textarea
                  placeholder="Beschreibe was du generieren möchtest..."
                  value={generatePrompt}
                  onChange={e => setGeneratePrompt(e.target.value)}
                  className="flex-1"
                />
                <div className="flex flex-col gap-2 w-40">
                  <Select value={generateType} onValueChange={setGenerateType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="html">HTML/CSS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={generateCode} disabled={isLoading} className="gap-1">
                    <Sparkles className="w-4 h-4" />
                    {isLoading ? 'Generiere...' : 'Generieren'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Generated Components */}
            <div className="space-y-3">
              {generatedComponents.map(comp => (
                <Card key={comp.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-sm">{comp.name}</span>
                      <Badge variant="secondary" className="text-xs">{comp.language}</Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(comp.code); toast.success('Kopiert!'); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs font-mono bg-black/50 p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap">
                    {comp.code}
                  </pre>
                </Card>
              ))}
              {generatedComponents.length === 0 && (
                <Card className="p-8 text-center text-muted-foreground">
                  Noch keine Komponenten generiert. Beschreibe was du brauchst!
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Runtime Sandbox */}
          <TabsContent value="runtime" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-400" />
                  Runtime-Sandbox
                </h3>
                <Button onClick={runInSandbox} disabled={isLoading} size="sm" className="gap-1">
                  <Cpu className="w-4 h-4" />
                  {isLoading ? 'Ausführen...' : 'Ausführen'}
                </Button>
              </div>
              <div className="bg-black/50 rounded p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap">
                {runtimeOutput || <span className="text-muted-foreground">Generiere Code und klicke "Ausführen" um die Sandbox zu starten.</span>}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AJPlatform;
