import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Network, Database, Eye, Zap, Target, Lightbulb, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Capability {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'coming';
  route?: string;
}

export const AICapabilitiesGrid = () => {
  const navigate = useNavigate();

  const capabilities: Capability[] = [
    {
      id: 'swarm',
      title: 'Schwarm-Intelligenz',
      description: 'Kollaborative Multi-Agent-Analysen mit emergenten Lösungsansätzen',
      icon: <Brain className="h-6 w-6" />,
      status: 'active',
      route: '/swarm-intelligence'
    },
    {
      id: 'semantic',
      title: 'Semantisches Reasoning',
      description: 'Kontextuelle Bedeutungsanalyse und Muster-Erkennung',
      icon: <Network className="h-6 w-6" />,
      status: 'active'
    },
    {
      id: 'decision',
      title: 'Entscheidungs-Engine',
      description: 'Adaptive Entscheidungsfindung mit Risiko-Bewertung',
      icon: <Target className="h-6 w-6" />,
      status: 'active'
    },
    {
      id: 'knowledge',
      title: 'Wissensmanagement',
      description: 'Dynamische Knowledge-Graph-Integration und Retrieval',
      icon: <Database className="h-6 w-6" />,
      status: 'active'
    },
    {
      id: 'visual',
      title: 'Visuelle Konzepte',
      description: 'Automatische Generierung von Diagrammen und Visualisierungen',
      icon: <Eye className="h-6 w-6" />,
      status: 'active'
    },
    {
      id: 'fusion',
      title: 'FUSION-Chat',
      description: 'Multi-modale Konversation mit adaptiver Agent-Integration',
      icon: <Zap className="h-6 w-6" />,
      status: 'active'
    },
    {
      id: 'creative',
      title: 'Kreativ-Synthese',
      description: 'Generative Ideenfindung durch laterales Denken',
      icon: <Lightbulb className="h-6 w-6" />,
      status: 'beta'
    },
    {
      id: 'web',
      title: 'Web-Integration',
      description: 'Echtzeit-Datenextraktion und API-Orchestrierung',
      icon: <Globe className="h-6 w-6" />,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'beta': return 'bg-warning/20 text-warning';
      case 'coming': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {capabilities.map((capability) => (
        <Card 
          key={capability.id}
          className={`backdrop-blur-sm bg-card/50 hover:bg-card/70 transition-all hover:-translate-y-1 ${
            capability.route ? 'cursor-pointer' : ''
          }`}
          onClick={() => capability.route && navigate(capability.route)}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {capability.icon}
              </div>
              <Badge className={getStatusColor(capability.status)}>
                {capability.status}
              </Badge>
            </div>
            <CardTitle className="text-lg">{capability.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {capability.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
