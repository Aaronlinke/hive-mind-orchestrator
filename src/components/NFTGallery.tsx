import { useEffect } from 'react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Award, Sparkles } from 'lucide-react';

export const NFTGallery = () => {
  const { nfts, loadNFTs, isLoading } = useBlockchain();

  useEffect(() => {
    loadNFTs();
  }, []);

  return (
    <Card className="p-6 bg-background/50 backdrop-blur border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Award className="w-5 h-5" />
          Evolution NFTs
        </h3>
        <div className="text-sm text-muted-foreground">
          {nfts.length} Milestones
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading NFTs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden bg-background/30 border-primary/10 hover:border-primary/30 transition-all group">
              <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20">
                {nft.image_url && (
                  <img 
                    src={nft.image_url} 
                    alt={nft.milestone_type}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-foreground mb-1">
                  {nft.milestone_type.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <div className="text-sm text-muted-foreground mb-2">
                  Generation {nft.generation}
                </div>
                <div className="text-xs text-muted-foreground mb-3 truncate">
                  Token: {nft.token_id}
                </div>

                {nft.opensea_url && (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(nft.opensea_url!, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on OpenSea
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};