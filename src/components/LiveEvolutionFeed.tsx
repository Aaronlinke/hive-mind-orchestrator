import { useEvolutionFeed } from '@/hooks/useEvolutionFeed';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Clock, Zap, Brain, Coins, Activity, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DEMO_EVENTS = [
  {
    id: 'demo-1',
    event_type: 'agent_created',
    generation: 12,
    event_data: { agentName: 'Semantik-Omega', fitness: 0.94, capabilities: ['reasoning', 'synthesis'] },
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    upvotes: 7,
    downvotes: 0,
    visibility: 'public',
  },
  {
    id: 'demo-2',
    event_type: 'patterns_detected',
    generation: 12,
    event_data: { patternCount: 4, patternNames: ['Emergente Synergie', 'Rekursive Optimierung'] },
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    upvotes: 12,
    downvotes: 1,
    visibility: 'public',
  },
  {
    id: 'demo-3',
    event_type: 'blockchain_checkpoint',
    generation: 11,
    event_data: { txHash: '0x3a9f2b8c1d4e7f0a6b5c8d2e1f4a7b0c', blockNumber: 18420731, ipfsHash: 'QmXyZ123AbC456DeF789' },
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    upvotes: 5,
    downvotes: 0,
    visibility: 'public',
  },
  {
    id: 'demo-4',
    event_type: 'nft_minted',
    generation: 11,
    event_data: { milestoneType: 'Generation Threshold', tokenId: '0x0042' },
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    upvotes: 18,
    downvotes: 2,
    visibility: 'public',
  },
];

export const LiveEvolutionFeed = () => {
  const { events, vote } = useEvolutionFeed();
  const displayEvents = events.length > 0 ? events : DEMO_EVENTS as any[];
  const isDemo = events.length === 0;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'blockchain_checkpoint': return <Coins className="w-4 h-4" />;
      case 'nft_minted': return <Zap className="w-4 h-4" />;
      case 'patterns_detected': return <Brain className="w-4 h-4" />;
      case 'agent_created': return <Activity className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'blockchain_checkpoint': return 'text-yellow-500';
      case 'nft_minted': return 'text-purple-500';
      case 'patterns_detected': return 'text-blue-500';
      case 'agent_created': return 'text-green-500';
      default: return 'text-foreground';
    }
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      blockchain_checkpoint: 'Blockchain Checkpoint',
      nft_minted: 'NFT Geminted',
      patterns_detected: 'Muster Erkannt',
      agent_created: 'Agent Erstellt',
    };
    return labels[type] || type.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <Card className="p-6 glass-card border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 animate-pulse" />
          Live Evolution Feed
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isDemo && (
            <span className="flex items-center gap-1 text-xs border border-border/50 rounded px-2 py-0.5">
              <Sparkles className="w-3 h-3" /> Demo
            </span>
          )}
          <span>{displayEvents.length} Events</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {displayEvents.map((event) => (
          <Card key={event.id} className="p-4 glass-card border-primary/10 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={getEventColor(event.event_type)}>
                    {getEventIcon(event.event_type)}
                  </span>
                  <span className="font-semibold text-sm">
                    {getEventLabel(event.event_type)}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">
                    Gen {event.generation}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {event.event_type === 'blockchain_checkpoint' && (
                    <div className="space-y-0.5 font-mono text-xs">
                      <div>TX: {event.event_data?.txHash?.substring(0, 20)}...</div>
                      <div>Block: #{event.event_data?.blockNumber?.toLocaleString()}</div>
                      <div>IPFS: {event.event_data?.ipfsHash?.substring(0, 20)}...</div>
                    </div>
                  )}
                  {event.event_type === 'nft_minted' && (
                    <div className="text-xs">
                      <span className="font-medium">{event.event_data?.milestoneType}</span>
                      {event.event_data?.tokenId && <span className="ml-2 font-mono">Token: {event.event_data.tokenId}</span>}
                    </div>
                  )}
                  {event.event_type === 'patterns_detected' && (
                    <div className="text-xs">
                      <span className="font-medium">{event.event_data?.patternCount} neue Muster erkannt</span>
                      {event.event_data?.patternNames && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {event.event_data.patternNames.map((p: string, i: number) => (
                            <span key={i} className="bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {event.event_type === 'agent_created' && (
                    <div className="text-xs">
                      <span className="font-medium">{event.event_data?.agentName || 'Neuer Agent'}</span>
                      {event.event_data?.fitness && (
                        <span className="ml-2 text-green-400">Fitness: {(event.event_data.fitness * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs hover:text-primary"
                  onClick={() => !isDemo && vote(event.id, true)}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {event.upvotes}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs hover:text-destructive"
                  onClick={() => !isDemo && vote(event.id, false)}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  {event.downvotes}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
