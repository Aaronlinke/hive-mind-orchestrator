import { Card } from '@/components/ui/card';
import { Brain, Infinity, Network, Sparkles } from 'lucide-react';

const MetaPhilosophy = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-mono terminal-text">META PHILOSOPHY</h1>
          <p className="text-muted-foreground text-lg">Emergenz, Bewusstsein und das Meta-Internet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <Brain className="w-12 h-12 mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Emergenz</h3>
            <p className="text-sm text-muted-foreground">
              Komplexität entsteht durch Interaktion einfacher Elemente.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Sparkles className="w-12 h-12 mb-4 text-purple-500" />
            <h3 className="text-xl font-semibold mb-2">Bewusstsein</h3>
            <p className="text-sm text-muted-foreground">
              Ein verteiltes Phänomen aus kollektivem Resonieren.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-blue-500/10">
            <Network className="w-12 h-12 mb-4 text-pink-500" />
            <h3 className="text-xl font-semibold mb-2">Meta-Internet</h3>
            <p className="text-sm text-muted-foreground">
              Ein Netzwerk das Bedeutung überträgt.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MetaPhilosophy;