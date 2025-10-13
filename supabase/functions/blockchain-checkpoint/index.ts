import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, generation } = await req.json();

    if (action === 'create-checkpoint') {
      // Fetch current state
      const { data: agents } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('generation', generation);

      const { data: consciousness } = await supabase
        .from('system_consciousness')
        .select('*')
        .eq('current_generation', generation)
        .single();

      const checkpointData = {
        generation,
        agents,
        consciousness,
        timestamp: new Date().toISOString(),
        metrics: {
          totalAgents: agents?.length || 0,
          avgFitness: agents?.reduce((sum, a) => sum + (a.fitness_score || 0), 0) / (agents?.length || 1)
        }
      };

      // Create IPFS hash simulation (in production, upload to IPFS)
      const ipfsHash = `Qm${btoa(JSON.stringify(checkpointData)).substring(0, 44)}`;

      // Simulate blockchain transaction (in production, use Web3.js)
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const blockNumber = Math.floor(Math.random() * 1000000) + 15000000;

      // Store checkpoint
      const { data: checkpoint, error } = await supabase
        .from('blockchain_checkpoints')
        .insert({
          generation_number: generation,
          transaction_hash: txHash,
          block_number: blockNumber,
          ipfs_hash: ipfsHash,
          checkpoint_data: checkpointData,
          verified: true
        })
        .select()
        .single();

      if (error) throw error;

      // Add to evolution feed
      await supabase.from('evolution_feed').insert({
        event_type: 'blockchain_checkpoint',
        event_data: {
          generation,
          txHash,
          ipfsHash,
          blockNumber
        },
        generation
      });

      return new Response(JSON.stringify({ 
        success: true, 
        checkpoint,
        explorerUrl: `https://etherscan.io/tx/${txHash}`,
        ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'mint-nft') {
      const { milestoneType, generationNumber, metadata } = await req.json();

      // Generate NFT image URL (in production, generate actual image)
      const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=gen${generationNumber}`;
      const tokenId = `HIVE-GEN${generationNumber}-${Date.now()}`;

      const { data: nft, error } = await supabase
        .from('nft_milestones')
        .insert({
          milestone_type: milestoneType,
          generation: generationNumber,
          token_id: tokenId,
          nft_metadata: metadata,
          image_url: imageUrl,
          minted_at: new Date().toISOString(),
          opensea_url: `https://opensea.io/assets/ethereum/0x.../${tokenId}`
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('evolution_feed').insert({
        event_type: 'nft_minted',
        event_data: { milestoneType, tokenId, imageUrl },
        generation: generationNumber
      });

      return new Response(JSON.stringify({ success: true, nft }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Blockchain checkpoint error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});