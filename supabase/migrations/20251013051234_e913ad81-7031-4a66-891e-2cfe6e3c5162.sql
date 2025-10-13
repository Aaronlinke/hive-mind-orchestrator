-- Phase 2-5: Complete Evolution System Enhancement

-- Blockchain Checkpoints für Evolution Milestones
CREATE TABLE IF NOT EXISTS public.blockchain_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_number INTEGER NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  contract_address TEXT,
  ipfs_hash TEXT,
  checkpoint_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false
);

-- Evolution Feed für Public Live Updates
CREATE TABLE IF NOT EXISTS public.evolution_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  generation INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  visibility TEXT DEFAULT 'public',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- NFT Milestones
CREATE TABLE IF NOT EXISTS public.nft_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_type TEXT NOT NULL,
  generation INTEGER NOT NULL,
  token_id TEXT,
  nft_metadata JSONB NOT NULL,
  image_url TEXT,
  minted_at TIMESTAMPTZ,
  owner_address TEXT,
  opensea_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Temporal Snapshots für Time Travel Debugging
CREATE TABLE IF NOT EXISTS public.temporal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  generation INTEGER NOT NULL,
  system_state JSONB NOT NULL,
  agent_states JSONB NOT NULL,
  consciousness_state JSONB,
  created_by TEXT DEFAULT 'system'
);

-- Agent Collaboration Network
CREATE TABLE IF NOT EXISTS public.agent_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a TEXT NOT NULL,
  agent_b TEXT NOT NULL,
  collaboration_type TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  synergy_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_collaboration TIMESTAMPTZ DEFAULT now()
);

-- Emergent Pattern Recognition
CREATE TABLE IF NOT EXISTS public.emergent_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  pattern_signature TEXT NOT NULL,
  occurrence_count INTEGER DEFAULT 1,
  confidence_score NUMERIC DEFAULT 0,
  contributing_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  discovered_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  pattern_data JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.blockchain_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporal_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergent_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public Read, System Write
CREATE POLICY "Public can view blockchain checkpoints" ON public.blockchain_checkpoints FOR SELECT USING (true);
CREATE POLICY "System can insert blockchain checkpoints" ON public.blockchain_checkpoints FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view evolution feed" ON public.evolution_feed FOR SELECT USING (visibility = 'public');
CREATE POLICY "System can insert evolution feed" ON public.evolution_feed FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can vote on feed" ON public.evolution_feed FOR UPDATE USING (true);

CREATE POLICY "Public can view NFT milestones" ON public.nft_milestones FOR SELECT USING (true);
CREATE POLICY "System can manage NFT milestones" ON public.nft_milestones FOR ALL USING (true);

CREATE POLICY "Public can view temporal snapshots" ON public.temporal_snapshots FOR SELECT USING (true);
CREATE POLICY "System can insert temporal snapshots" ON public.temporal_snapshots FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view agent collaborations" ON public.agent_collaborations FOR SELECT USING (true);
CREATE POLICY "System can manage agent collaborations" ON public.agent_collaborations FOR ALL USING (true);

CREATE POLICY "Public can view emergent patterns" ON public.emergent_patterns FOR SELECT USING (true);
CREATE POLICY "System can manage emergent patterns" ON public.emergent_patterns FOR ALL USING (true);

-- Indexes für Performance
CREATE INDEX idx_blockchain_generation ON public.blockchain_checkpoints(generation_number);
CREATE INDEX idx_evolution_feed_timestamp ON public.evolution_feed(timestamp DESC);
CREATE INDEX idx_nft_generation ON public.nft_milestones(generation);
CREATE INDEX idx_temporal_snapshots_time ON public.temporal_snapshots(snapshot_time DESC);
CREATE INDEX idx_agent_collab_agents ON public.agent_collaborations(agent_a, agent_b);
CREATE INDEX idx_emergent_patterns_name ON public.emergent_patterns(pattern_name);