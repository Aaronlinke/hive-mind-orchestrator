import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlockchainCheckpoint {
  id: string;
  generation_number: number;
  transaction_hash: string | null;
  block_number: number | null;
  ipfs_hash: string | null;
  checkpoint_data: any;
  created_at: string;
  verified: boolean;
}

export interface NFTMilestone {
  id: string;
  milestone_type: string;
  generation: number;
  token_id: string | null;
  nft_metadata: any;
  image_url: string | null;
  minted_at: string | null;
  owner_address: string | null;
  opensea_url: string | null;
  created_at: string;
}

export const useBlockchain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<BlockchainCheckpoint[]>([]);
  const [nfts, setNFTs] = useState<NFTMilestone[]>([]);

  const loadCheckpoints = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blockchain_checkpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCheckpoints(data || []);
    } catch (error) {
      console.error('Load checkpoints error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNFTs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nft_milestones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNFTs(data || []);
    } catch (error) {
      console.error('Load NFTs error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckpoint = async (generation: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-checkpoint', {
        body: { action: 'create-checkpoint', generation }
      });

      if (error) throw error;
      await loadCheckpoints();
      return data;
    } catch (error) {
      console.error('Create checkpoint error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mintNFT = async (milestoneType: string, generation: number, metadata: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-checkpoint', {
        body: { action: 'mint-nft', milestoneType, generationNumber: generation, metadata }
      });

      if (error) throw error;
      await loadNFTs();
      return data;
    } catch (error) {
      console.error('Mint NFT error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkpoints,
    nfts,
    isLoading,
    loadCheckpoints,
    loadNFTs,
    createCheckpoint,
    mintNFT
  };
};