import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, Zap, Activity, Download, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMultiAgentOrchestrator } from "@/hooks/useMultiAgentOrchestrator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Brain {
  id: number;
  name: string;
  type: string;
  specialization: string;
  activityLevel: number;
}

interface LogEntry {
  time: string;
  message: string;
}

export default function SwarmIntelligence() {
  const navigate = useNavigate();
  const [brainCount, setBrainCount] = useState(8);
  const [creativityLevel, setCreativityLevel] = useState(7);
  const [analysisDepth, setAnalysisDepth] = useState(3);
  const [speedSetting, setSpeedSetting] = useState(4);
  const [problemInput, setProblemInput] = useState("Wie können wir nachhaltige Energiequellen in urbanen Gebieten effizienter nutzen?");
  const [brains, setBrains] = useState<Brain[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [consensusLevel, setConsensusLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { agentResults, isOrchestrating, orchestrateAnalysis, resetOrchestration } = useMultiAgentOrchestrator();

  const brainTypes = ['Technologie', 'Wissenschaft', 'Wirtschaft', 'Philosophie', 'Kreativ', 'Logik', 'Quantenphysik'];
  const specializations = ['Energie', 'Nachhaltigkeit', 'Urbanistik', 'Innovation', 'Ökonomie', 'Soziologie', 'Kybernetik'];

  useEffect(() => {
    updateBrains();
  }, [brainCount]);

  const updateBrains = () => {
    const newBrains: Brain[] = [];
    for (let i = 0; i < brainCount; i++) {
      newBrains.push({
        id: i + 1,
        name: `Gehirn-${i + 1}`,
        type: brainTypes[i % brainTypes.length],
        specialization: specializations[i % specializations.length],
        activityLevel: Math.floor(Math.random() * 80) + 20
      });
    }
    setBrains(newBrains);
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('de-DE');
    setLogs(prev => [...prev, { time, message }]);
  };

  const handleActivate = () => {
    setIsActive(true);
    addLog(`Schwarm aktiviert. ${brainCount} Gehirne initialisiert.`);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsAnalyzing(false);
    setConsensusLevel(0);
    setLogs([]);
    setProblemInput("");
    resetOrchestration();
  };

  const handleAnalyze = async () => {
    if (!problemInput.trim()) return;
    
    setIsAnalyzing(true);
    addLog(`Analyse gestartet: "${problemInput}"`);
    addLog("🧠 Multi-Agent-System aktiviert - Alle Spezialisten arbeiten parallel...");

    try {
      // Start real multi-agent analysis
      const results = await orchestrateAnalysis(problemInput);
      
      // Log each agent's completion
      results.forEach(result => {
        if (result.status === 'completed') {
          addLog(`✅ ${result.agentName} abgeschlossen (${result.processingTime}ms) - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        } else if (result.status === 'error') {
          addLog(`❌ ${result.agentName} fehlgeschlagen`);
        }
      });

      // Calculate consensus from agent results
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      setConsensusLevel(avgConfidence * 100);
      
      addLog(`🎯 Konsens erreicht: ${(avgConfidence * 100).toFixed(1)}% - Fusion abgeschlossen`);
    } catch (error) {
      addLog(`⚠️ Fehler bei der Analyse: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SchwarmIntelligenz
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">{brainCount} Gehirne aktiv</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-sm">Konsens: {Math.round(consensusLevel)}%</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-sm">Energie: 92%</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Control Panel */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Schwarmsteuerung
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleActivate}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                >
                  {isActive ? "Aktiv" : "Aktivieren"}
                </Button>
                <Button onClick={handleReset} variant="ghost" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Beschreiben Sie Ihr Geschäftsproblem oder Forschungsfrage..."
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                className="min-h-[120px] bg-background/50"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Anzahl der Gehirne</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[brainCount]}
                      onValueChange={(v) => setBrainCount(v[0])}
                      min={1}
                      max={12}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-semibold w-8 text-center">{brainCount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Kreativitäts-Level</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[creativityLevel]}
                      onValueChange={(v) => setCreativityLevel(v[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-semibold w-8 text-center">{creativityLevel}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Analyse-Tiefe</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[analysisDepth]}
                      onValueChange={(v) => setAnalysisDepth(v[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-semibold w-8 text-center">{analysisDepth}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Geschwindigkeit</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[speedSetting]}
                      onValueChange={(v) => setSpeedSetting(v[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="font-semibold w-8 text-center">{speedSetting}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                className="w-full"
                disabled={!isActive || isAnalyzing}
              >
                {isAnalyzing ? "Analysiere..." : "Analyse starten"}
              </Button>

              {/* Brain Visualization */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                {brains.map((brain) => (
                  <Card key={brain.id} className="bg-background/80 hover:border-primary transition-all hover:-translate-y-1">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{brain.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                          {brain.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{brain.specialization}</p>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${brain.activityLevel}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">Aktivität: {brain.activityLevel}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Solutions Panel */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Lösungsraum & Konsens
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="solutions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="solutions">Lösungen</TabsTrigger>
                  <TabsTrigger value="consensus">Konsens</TabsTrigger>
                  <TabsTrigger value="divergence">Divergenz</TabsTrigger>
                </TabsList>

                <TabsContent value="solutions" className="space-y-3 mt-4">
                  <Card className="bg-background/50 border-l-4 border-l-primary">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-primary font-medium">Gehirn-4 (Technologie)</p>
                      <p className="text-sm">Implementierung von Solar-Dachziegeln und vertikalen Windturbinen an Hochhäusern zur dezentralen Energiegewinnung.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50 border-l-4 border-l-accent">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-accent font-medium">Gehirn-7 (Wissenschaft)</p>
                      <p className="text-sm">Entwicklung von piezoelektrischen Gehwegplatten, die kinetische Energie in elektrische Energie umwandeln.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50 border-l-4 border-l-secondary">
                    <CardContent className="p-4 space-y-1">
                      <p className="text-xs text-secondary font-medium">Gehirn-2 (Wirtschaft)</p>
                      <p className="text-sm">Einrichtung eines kommunalen Energie-Sharing-Programms mit blockchain-basierten Mikrotransaktionen.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="consensus" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Konsensbildung</h3>
                    <p className="text-sm text-muted-foreground mb-3">Der Schwarm nähert sich einer einheitlichen Lösung...</p>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                        style={{ width: `${consensusLevel}%` }}
                      />
                    </div>
                    <p className="text-sm mt-3">Aktuelle Konsenslösung: <strong>Kombination von Solar- und kinetischer Energiegewinnung mit smartem Grid-Management</strong></p>
                  </div>
                </TabsContent>

                <TabsContent value="divergence" className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Lösungsdivergenz</h3>
                    <p className="text-sm text-muted-foreground mb-2">Die Gehirne zeigen unterschiedliche Schwerpunkte, aber keine fundamentalen Widersprüche.</p>
                    <p className="text-sm">Hauptdivergenzpunkt: <strong>Priorität von dezentraler vs. zentraler Lösungsansätze</strong></p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <Card className="bg-background/50 text-center p-4">
                  <p className="text-2xl font-bold text-primary">14</p>
                  <p className="text-xs text-muted-foreground">Lösungsvorschläge</p>
                </Card>
                <Card className="bg-background/50 text-center p-4">
                  <p className="text-2xl font-bold text-accent">{Math.round(consensusLevel)}%</p>
                  <p className="text-xs text-muted-foreground">Konsens-Level</p>
                </Card>
                <Card className="bg-background/50 text-center p-4">
                  <p className="text-2xl font-bold text-secondary">3.4s</p>
                  <p className="text-xs text-muted-foreground">Durchschnittszeit</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Multi-Agent Status Panel */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                KI-Spezialisten Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agentResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine aktive Analyse. Starten Sie eine Analyse, um alle Spezialisten zu aktivieren.
                </p>
              ) : (
                agentResults.map((agent) => (
                  <div key={agent.agentId} className="p-4 rounded-lg bg-background/50 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {agent.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        {agent.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {agent.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                        <span className="font-semibold text-sm">{agent.agentName}</span>
                      </div>
                      <Badge variant={agent.status === 'completed' ? 'default' : 'secondary'}>
                        {agent.status === 'processing' && 'Arbeitet...'}
                        {agent.status === 'completed' && 'Fertig'}
                        {agent.status === 'error' && 'Fehler'}
                        {agent.status === 'idle' && 'Bereit'}
                      </Badge>
                    </div>
                    {agent.status === 'completed' && (
                      <>
                        <Progress value={agent.confidence * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Confidence: {(agent.confidence * 100).toFixed(1)}%</span>
                          {agent.processingTime && <span>{agent.processingTime}ms</span>}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Communication Log */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Schwarmkommunikation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto space-y-2 font-mono text-sm bg-background/50 rounded-lg p-4">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Keine Aktivität...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="border-b border-border/50 pb-2">
                      <span className="text-primary mr-2">{log.time}</span>
                      <span className="text-foreground">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Recommendations */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Aktionsempfehlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="shortterm">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="shortterm">Kurzfristig</TabsTrigger>
                  <TabsTrigger value="midterm">Mittelfristig</TabsTrigger>
                  <TabsTrigger value="longterm">Langfristig</TabsTrigger>
                </TabsList>

                <TabsContent value="shortterm" className="mt-4">
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Pilotprojekt mit piezoelektrischen Gehwegen in ausgewählten Stadtteilen</li>
                    <li>Analyse der Dachflächen für Solarnutzung</li>
                    <li>Bürgerbefragung zu Akzeptanz von Energie-Sharing</li>
                  </ul>
                </TabsContent>

                <TabsContent value="midterm" className="mt-4">
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Umsetzung von Solar-Dachziegel-Installationen</li>
                    <li>Implementierung dezentraler Energiespeicherlösungen</li>
                    <li>Entwicklung der Blockchain-basierten Handelsplattform</li>
                  </ul>
                </TabsContent>

                <TabsContent value="longterm" className="mt-4">
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Vollständige Integration in Stadtplanung</li>
                    <li>Ausweitung auf benachbarte Gemeinden</li>
                    <li>Automatisierte Optimierung des Energienetzes durch KI</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
