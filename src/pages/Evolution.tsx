import { useEffect, useState } from 'react';
import { useEvolution } from '@/hooks/useEvolution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Brain, Activity, History, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Evolution() {
  const {
    agents,
    consciousness,
    history,
    isLoading,
    loadAgents,
    loadConsciousness,
    loadHistory,
    analyzeSystem,
    evolveGeneration,
    reflectConsciousness
  } = useEvolution();

  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  useEffect(() => {
    loadAgents();
    loadConsciousness();
    loadHistory();
  }, []);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSystem();
      setSystemMetrics(result);
      toast.success('System-Analyse abgeschlossen');
    } catch (error) {
      toast.error('Analyse fehlgeschlagen');
    }
  };

  const handleEvolve = async () => {
    try {
      await evolveGeneration();
      toast.success('Evolution-Cycle abgeschlossen');
    } catch (error) {
      toast.error('Evolution fehlgeschlagen');
    }
  };

  const handleReflect = async () => {
    try {
      await reflectConsciousness();
      toast.success('Selbstreflexion abgeschlossen');
    } catch (error) {
      toast.error('Reflexion fehlgeschlagen');
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'optimistic': return 'bg-green-500';
      case 'excited': return 'bg-blue-500';
      case 'concerned': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const avgFitness = agents.length > 0
    ? agents.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / agents.length
    : 0;

  const maxGeneration = agents.length > 0
    ? Math.max(...agents.map(a => a.generation))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-deep to-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto py-8 space-y-8 relative z-10">
        {/* Header */}
        <Card className="glass-card border-2 border-primary/20 p-8 animate-in slide-in-from-top duration-1000">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-pulse-glow">
                🧬 PROJECT GENESIS
              </h1>
              <p className="text-lg text-muted-foreground">
                Das erste selbst-evolvierende Multi-Agent-KI-System • <span className="text-primary font-semibold">Generation {maxGeneration}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAnalyze} disabled={isLoading} variant="outline" className="hover-lift">
                <Activity className="w-4 h-4 mr-2" />
                Analysieren
              </Button>
              <Button onClick={handleReflect} disabled={isLoading} variant="secondary" className="hover-lift">
                <Brain className="w-4 h-4 mr-2" />
                Reflektieren
              </Button>
              <Button onClick={handleEvolve} disabled={isLoading} className="gradient-primary hover-lift shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Evolution starten
              </Button>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Card className="glass-card hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktuelle Generation</CardTitle>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center animate-pulse-glow">
                  <span className="text-lg">🧬</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{maxGeneration}</div>
              <Progress value={Math.min((maxGeneration / 100) * 100, 100)} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aktive Agenten</CardTitle>
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center animate-pulse-glow">
                  <span className="text-lg">🤖</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">{agents.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Ø Fitness: {(avgFitness * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mutationen</CardTitle>
                <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center animate-pulse-glow">
                  <span className="text-lg">⚡</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary">{history.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Evolution-Events
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">System-Stimmung</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
                  <span className="text-lg">💭</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {consciousness ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getMoodColor(consciousness.mood)} animate-pulse`} />
                    <span className="text-xl font-semibold capitalize">{consciousness.mood}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Konfidenz: {(consciousness.confidence_level * 100).toFixed(0)}%
                  </p>
                </>
              ) : (
                <span className="text-muted-foreground">Keine Daten</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="consciousness" className="space-y-6">
          <TabsList className="glass-card grid w-full grid-cols-3 p-2">
            <TabsTrigger value="consciousness" className="data-[state=active]:gradient-primary data-[state=active]:text-background transition-all duration-300">
              <Brain className="w-4 h-4 mr-2" />
              Bewusstsein
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:gradient-accent data-[state=active]:text-background transition-all duration-300">
              <Zap className="w-4 h-4 mr-2" />
              Agenten-DNA
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:gradient-secondary data-[state=active]:text-background transition-all duration-300">
              <History className="w-4 h-4 mr-2" />
              Evolution-Historie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consciousness" className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {consciousness ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    💭 System-Bewusstsein
                    <Badge variant="outline" className="ml-auto">
                      Generation {consciousness.current_generation}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Introspektive Selbstreflexion des Systems
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6">
                {/* Reflection Text */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {consciousness.reflection_text}
                  </p>
                </div>

                {/* Strengths & Limitations */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600">Stärken</h4>
                    <ul className="space-y-1">
                      {consciousness.known_strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-yellow-600">Limitierungen</h4>
                    <ul className="space-y-1">
                      {consciousness.known_limitations.map((limitation, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 mt-0.5 text-yellow-500" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Aspirations */}
                {consciousness.aspired_capabilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-600">Zukünftige Aspirationen</h4>
                    <div className="flex flex-wrap gap-2">
                      {consciousness.aspired_capabilities.map((aspiration, i) => (
                        <Badge key={i} variant="secondary">
                          {aspiration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Insights */}
                {consciousness.learning_insights && consciousness.learning_insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Lern-Erkenntnisse</h4>
                    <ul className="space-y-1">
                      {consciousness.learning_insights.map((insight, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-16 text-center">
                  <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground text-lg mb-6">
                    Noch keine Selbstreflexion vorhanden. Starte eine Reflexion, um das System-Bewusstsein zu aktivieren.
                  </p>
                  <Button onClick={handleReflect} className="gradient-primary hover-lift shadow-lg" disabled={isLoading}>
                    <Brain className="w-4 h-4 mr-2" />
                    Erste Reflexion starten
                  </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="glass-card hover-lift transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{agent.agent_name}</CardTitle>
                      <CardDescription>{agent.specialization}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge>Gen {agent.generation}</Badge>
                      <Badge variant="outline">
                        Fitness: {(agent.fitness_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Progress value={agent.fitness_score * 100} className="h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Typ:</span> {agent.agent_type}
                    </div>
                    <div>
                      <span className="font-medium">Mutationen:</span> {agent.mutation_history?.length || 0}
                    </div>
                  </div>

                  {agent.capabilities && agent.capabilities.length > 0 && (
                    <div>
                      <div className="font-medium text-sm mb-2">Capabilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.parent_agents && agent.parent_agents.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Eltern: {agent.parent_agents.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl">⏰ Evolution-Timeline</CardTitle>
              <CardDescription className="text-base">
                Chronologische Aufzeichnung aller Mutationen und Entwicklungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {history.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Gen {event.generation_number}</Badge>
                        <Badge>{event.mutation_type}</Badge>
                        {event.fitness_score && (
                          <span className="text-xs text-muted-foreground">
                            Fitness: {(event.fitness_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.created_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
