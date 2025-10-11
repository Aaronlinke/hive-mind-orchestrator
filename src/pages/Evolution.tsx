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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🧬 PROJECT GENESIS
          </h1>
          <p className="text-muted-foreground mt-2">
            Das erste selbst-evolvierende Multi-Agent-KI-System
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={isLoading} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Analysieren
          </Button>
          <Button onClick={handleReflect} disabled={isLoading} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Reflektieren
          </Button>
          <Button onClick={handleEvolve} disabled={isLoading}>
            <Sparkles className="w-4 h-4 mr-2" />
            Evolution starten
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktuelle Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{maxGeneration}</div>
            <Progress value={(maxGeneration / 100) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktive Agenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Ø Fitness: {(avgFitness * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mutationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Evolution-Events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System-Stimmung</CardTitle>
          </CardHeader>
          <CardContent>
            {consciousness ? (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getMoodColor(consciousness.mood)}`} />
                <span className="text-lg font-semibold capitalize">{consciousness.mood}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Keine Daten</span>
            )}
            {consciousness && (
              <p className="text-xs text-muted-foreground mt-2">
                Konfidenz: {(consciousness.confidence_level * 100).toFixed(0)}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="consciousness" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consciousness">
            <Brain className="w-4 h-4 mr-2" />
            Bewusstsein
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Zap className="w-4 h-4 mr-2" />
            Agenten-DNA
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Evolution-Historie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consciousness" className="space-y-4">
          {consciousness ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  System-Bewusstsein
                  <Badge variant="outline" className="ml-auto">
                    Generation {consciousness.current_generation}
                  </Badge>
                </CardTitle>
                <CardDescription>
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
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Noch keine Selbstreflexion vorhanden. Starte eine Reflexion, um das System-Bewusstsein zu aktivieren.
                </p>
                <Button onClick={handleReflect} className="mt-4" disabled={isLoading}>
                  Erste Reflexion starten
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
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

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Evolution-Timeline</CardTitle>
              <CardDescription>
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
  );
}
