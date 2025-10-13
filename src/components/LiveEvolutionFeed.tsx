import { useEvolutionFeed } from '@/hooks/useEvolutionFeed';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Clock, Zap, Brain, Coins, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const LiveEvolutionFeed = () => {
  const { events, vote } = useEvolutionFeed();

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

  return (
    <Card className="p-6 bg-background/50 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Activity className="w-5 h-5 animate-pulse" />
          Live Evolution Feed
        </h3>
        <div className="text-sm text-muted-foreground">
          {events.length} Events
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {events.map((event) => (
          <Card key={event.id} className="p-4 bg-background/30 border-primary/10 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={getEventColor(event.event_type)}>
                    {getEventIcon(event.event_type)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {event.event_type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Gen {event.generation}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {event.event_type === 'blockchain_checkpoint' && (
                    <div className="space-y-1">
                      <div>TX: {event.event_data?.txHash?.substring(0, 16)}...</div>
                      <div>Block: #{event.event_data?.blockNumber}</div>
                      <div>IPFS: {event.event_data?.ipfsHash?.substring(0, 20)}...</div>
                    </div>
                  )}
                  {event.event_type === 'nft_minted' && (
                    <div>
                      {event.event_data?.milestoneType} - Token: {event.event_data?.tokenId}
                    </div>
                  )}
                  {event.event_type === 'patterns_detected' && (
                    <div>
                      {event.event_data?.patternCount} neue Muster erkannt
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => vote(event.id, true)}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {event.upvotes}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => vote(event.id, false)}
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