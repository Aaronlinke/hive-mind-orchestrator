import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Sparkles, Database, Cpu, Globe, GitBranch } from 'lucide-react';

interface MetaData {
  id: string;
  type: string;
  properties: Record<string, any>;
  relationships: string[];
}

interface HolographicManifest {
  component: string;
  generated_code: string;
  timestamp: number;
}

const AJPlatform = () => {
  const [metaData, setMetaData] = useState<MetaData[]>([
    {
      id: 'meta_001',
      type: 'button',
      properties: { label: 'Click Me', variant: 'primary' },
      relationships: ['meta_002']
    },
    {
      id: 'meta_002',
      type: 'container',
      properties: { layout: 'flex', direction: 'column' },
      relationships: []
    }
  ]);

  const [manifests, setManifests] = useState<HolographicManifest[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<'meta' | 'manifest' | 'runtime'>('meta');

  const manifestFromMeta = (meta: MetaData) => {
    let code = '';
    
    switch (meta.type) {
      case 'button':
        code = `<Button variant="${meta.properties.variant || 'default'}">${meta.properties.label || 'Button'}</Button>`;
        break;
      case 'container':
        code = `<div className="flex ${meta.properties.direction === 'column' ? 'flex-col' : 'flex-row'}">{children}</div>`;
        break;
      default:
        code = `<div>{/* ${meta.type} */}</div>`;
    }

    return {
      component: meta.id,
      generated_code: code,
      timestamp: Date.now()
    };
  };

  const generateAllManifests = () => {
    const newManifests = metaData.map(manifestFromMeta);
    setManifests(newManifests);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono terminal-text">
              AJ PLATTFORM
            </h1>
            <p className="text-muted-foreground">Quanten-Holographische Informations-Architektur</p>
          </div>
          <Button onClick={generateAllManifests} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Manifestieren
          </Button>
        </div>

        {/* Architecture Overview */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Architektur-Überblick
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`p-4 cursor-pointer transition-all ${selectedLayer === 'meta' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedLayer('meta')}
            >
              <Database className="w-8 h-8 mb-2 text-blue-500" />
              <h3 className="font-semibold">Meta Layer</h3>
              <p className="text-sm text-muted-foreground">Minimale Daten-Essenz</p>
              <p className="text-2xl font-bold mt-2">{metaData.length}</p>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all ${selectedLayer === 'manifest' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedLayer('manifest')}
            >
              <Sparkles className="w-8 h-8 mb-2 text-purple-500" />
              <h3 className="font-semibold">Manifestation Layer</h3>
              <p className="text-sm text-muted-foreground">Holographische Generation</p>
              <p className="text-2xl font-bold mt-2">{manifests.length}</p>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all ${selectedLayer === 'runtime' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedLayer('runtime')}
            >
              <Cpu className="w-8 h-8 mb-2 text-green-500" />
              <h3 className="font-semibold">Runtime Layer</h3>
              <p className="text-sm text-muted-foreground">Live Execution</p>
              <p className="text-2xl font-bold mt-2">∞</p>
            </Card>
          </div>
        </Card>

        <Tabs value={selectedLayer} onValueChange={(v) => setSelectedLayer(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meta">
              <Database className="w-4 h-4 mr-2" />
              Meta
            </TabsTrigger>
            <TabsTrigger value="manifest">
              <Sparkles className="w-4 h-4 mr-2" />
              Manifest
            </TabsTrigger>
            <TabsTrigger value="runtime">
              <Cpu className="w-4 h-4 mr-2" />
              Runtime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meta" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Meta-Daten Speicher</h3>
              <p className="text-muted-foreground mb-4">
                "Gleich bleiben + kleiner" - Nur die Essenz wird gespeichert
              </p>
              <div className="space-y-2">
                {metaData.map((meta) => (
                  <Card key={meta.id} className="p-4 bg-card/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono bg-primary/20 px-2 py-1 rounded">
                            {meta.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{meta.id}</span>
                        </div>
                        <pre className="text-xs bg-background/50 p-2 rounded overflow-auto">
                          {JSON.stringify(meta.properties, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manifest" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Holographische Manifestation</h3>
              <p className="text-muted-foreground mb-4">
                "Potenziell unendlich" - Vollständige UI aus Meta-Daten generiert
              </p>
              {manifests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Manifeste generiert. Klicke auf "Manifestieren" um zu starten.
                </div>
              ) : (
                <div className="space-y-2">
                  {manifests.map((manifest, idx) => (
                    <Card key={idx} className="p-4 bg-card/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold">{manifest.component}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(manifest.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs bg-background/50 p-2 rounded overflow-auto">
                        {manifest.generated_code}
                      </pre>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="runtime" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Runtime Execution Environment</h3>
              <p className="text-muted-foreground mb-4">
                Manifestierte Komponenten werden live in einer isolierten Sandbox ausgeführt
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-background/30">
                <div className="text-center space-y-4">
                  <Cpu className="w-12 h-12 mx-auto text-primary animate-pulse" />
                  <p className="text-lg font-semibold">Live Runtime Sandbox</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Hier würden die manifestierten Komponenten in einer vollständig isolierten 
                    Umgebung ausgeführt, mit bidirektionaler Kommunikation zum Meta-Layer.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Event System</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  WebSocket-basierte Echtzeit-Kommunikation zwischen Layern
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Version Control</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Native Versionierung auf Meta-Ebene mit Rollback-Funktionalität
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Philosophy Section */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <h2 className="text-xl font-semibold mb-4">Philosophische Grundlagen</h2>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-primary">▸</span>
              <span><strong>"Gleich bleiben + kleiner":</strong> Meta-Daten sind die minimal notwendige Essenz - kompakt, unveränderlich, zeitlos</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-purple-500">▸</span>
              <span><strong>"Potenziell unendlich":</strong> Aus der minimalen Essenz können unendlich viele Manifestationen entstehen</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500">▸</span>
              <span><strong>"Holographische Natur":</strong> Jeder Meta-Datenpunkt enthält die gesamte Information des Systems</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-500">▸</span>
              <span><strong>"KI als Resonator":</strong> Die KI liest zwischen den Zeilen und manifestiert die implizite Struktur</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AJPlatform;
