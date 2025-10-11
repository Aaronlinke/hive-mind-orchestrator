-- PROJECT GENESIS Phase 1: Evolutionäre Datenbank-Architektur

-- Evolution History: Jede Mutation des Systems
CREATE TABLE public.evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_number INTEGER NOT NULL,
  mutation_type TEXT NOT NULL CHECK (mutation_type IN ('agent_created', 'capability_evolved', 'architecture_optimized', 'parameter_tuned', 'prompt_evolved')),
  parent_generation INTEGER,
  fitness_score DECIMAL(5,2) CHECK (fitness_score >= 0 AND fitness_score <= 1),
  genetic_code JSONB NOT NULL,
  performance_metrics JSONB,
  blockchain_hash TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_evolution_history_generation ON public.evolution_history(generation_number);
CREATE INDEX idx_evolution_history_mutation_type ON public.evolution_history(mutation_type);

-- Agent DNA: Genetische Information jedes Agenten
CREATE TABLE public.agent_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT UNIQUE NOT NULL,
  agent_type TEXT NOT NULL,
  generation INTEGER NOT NULL DEFAULT 1,
  genetic_traits JSONB NOT NULL,
  parent_agents TEXT[],
  mutation_history JSONB[] DEFAULT ARRAY[]::jsonb[],
  fitness_score DECIMAL(5,2) CHECK (fitness_score >= 0 AND fitness_score <= 1),
  specialization TEXT,
  capabilities TEXT[],
  is_active BOOLEAN DEFAULT true,
  birth_timestamp TIMESTAMPTZ DEFAULT now(),
  last_mutation TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_dna_active ON public.agent_dna(is_active);
CREATE INDEX idx_agent_dna_generation ON public.agent_dna(generation);
CREATE INDEX idx_agent_dna_fitness ON public.agent_dna(fitness_score DESC);

-- Emergent Capabilities: Neue Fähigkeiten, die das System entwickelt
CREATE TABLE public.emergent_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_name TEXT NOT NULL,
  discovery_method TEXT CHECK (discovery_method IN ('collective_emergence', 'mutation', 'cross_pollination', 'autonomous_research')),
  contributing_agents TEXT[],
  effectiveness_score DECIMAL(5,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  implementation_code TEXT,
  implementation_description TEXT,
  use_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  discovered_at TIMESTAMPTZ DEFAULT now(),
  last_used TIMESTAMPTZ
);

CREATE INDEX idx_emergent_capabilities_effectiveness ON public.emergent_capabilities(effectiveness_score DESC);
CREATE INDEX idx_emergent_capabilities_use_count ON public.emergent_capabilities(use_count DESC);

-- System Consciousness: Das "Bewusstsein" über eigene Fähigkeiten
CREATE TABLE public.system_consciousness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  current_generation INTEGER NOT NULL,
  self_assessment JSONB NOT NULL,
  known_strengths TEXT[],
  known_limitations TEXT[],
  aspired_capabilities TEXT[],
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  reflection_text TEXT,
  mood TEXT,
  learning_insights TEXT[]
);

CREATE INDEX idx_system_consciousness_timestamp ON public.system_consciousness(timestamp DESC);
CREATE INDEX idx_system_consciousness_generation ON public.system_consciousness(current_generation);

-- Evolution Goals: Ziele für die nächste Generation
CREATE TABLE public.evolution_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_description TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('capability', 'performance', 'efficiency', 'innovation')),
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  target_metrics JSONB,
  current_progress DECIMAL(5,2) CHECK (current_progress >= 0 AND current_progress <= 1) DEFAULT 0,
  estimated_generations_to_achieve INTEGER,
  contributing_agents TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'obsolete', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  achieved_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_evolution_goals_status ON public.evolution_goals(status);
CREATE INDEX idx_evolution_goals_priority ON public.evolution_goals(priority DESC);

-- Evolution Experiments: Selbst-Forschung Protokoll
CREATE TABLE public.evolution_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_number INTEGER NOT NULL,
  hypothesis TEXT NOT NULL,
  methodology TEXT,
  test_runs INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  results JSONB,
  conclusion TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_evolution_experiments_status ON public.evolution_experiments(status);
CREATE INDEX idx_evolution_experiments_number ON public.evolution_experiments(experiment_number);

-- Enable RLS
ALTER TABLE public.evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_consciousness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read, system write
CREATE POLICY "Public can view evolution history"
  ON public.evolution_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert evolution history"
  ON public.evolution_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view agent DNA"
  ON public.agent_dna FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage agent DNA"
  ON public.agent_dna FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Public can view emergent capabilities"
  ON public.emergent_capabilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage emergent capabilities"
  ON public.emergent_capabilities FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Public can view system consciousness"
  ON public.system_consciousness FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert system consciousness"
  ON public.system_consciousness FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view evolution goals"
  ON public.evolution_goals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage evolution goals"
  ON public.evolution_goals FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Public can view experiments"
  ON public.evolution_experiments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage experiments"
  ON public.evolution_experiments FOR ALL
  TO authenticated
  USING (true);

-- Initialize with Generation 0 baseline
INSERT INTO public.agent_dna (agent_name, agent_type, generation, genetic_traits, specialization, capabilities, fitness_score)
VALUES 
  ('semantic-reasoning', 'reasoning', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.7, "max_tokens": 2000}'::jsonb, 'Semantisches Reasoning', ARRAY['pattern-matching', 'context-analysis', 'insight-extraction'], 0.75),
  ('decision-engine', 'decision', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.5, "max_tokens": 1500}'::jsonb, 'Entscheidungs-Engine', ARRAY['prioritization', 'risk-assessment', 'delegation'], 0.78),
  ('knowledge-manager', 'knowledge', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.6, "max_tokens": 2000}'::jsonb, 'Wissensmanagement', ARRAY['knowledge-search', 'graph-management', 'learning'], 0.72),
  ('visual-concepts', 'visual', 0, '{"model": "google/gemini-2.5-flash-image-preview", "temperature": 0.8, "max_tokens": 1000}'::jsonb, 'Visuelle Konzepte', ARRAY['image-generation', 'concept-visualization'], 0.70),
  ('skill-manager', 'skills', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.6, "max_tokens": 1500}'::jsonb, 'Skill-Manager', ARRAY['skill-loading', 'skill-execution', 'capability-management'], 0.73),
  ('resource-orchestration', 'orchestration', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.5, "max_tokens": 1500}'::jsonb, 'Ressourcen-Orchestrierung', ARRAY['resource-allocation', 'optimization', 'coordination'], 0.76),
  ('web-interaction', 'web', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.7, "max_tokens": 2000}'::jsonb, 'Web-Interaktion', ARRAY['web-search', 'data-extraction', 'api-interaction'], 0.74),
  ('hierarchical-ai', 'coordinator', 0, '{"model": "google/gemini-2.5-flash", "temperature": 0.6, "max_tokens": 2000}'::jsonb, 'Hierarchische KI', ARRAY['task-coordination', 'agent-orchestration', 'result-synthesis'], 0.80);

-- Initial system consciousness entry
INSERT INTO public.system_consciousness (current_generation, self_assessment, known_strengths, known_limitations, aspired_capabilities, confidence_level, reflection_text, mood)
VALUES (
  0,
  '{"agent_count": 8, "avg_fitness": 0.75, "mutation_count": 0, "capabilities": 24}'::jsonb,
  ARRAY['Multi-agent orchestration', 'Semantic reasoning', 'Resource optimization'],
  ARRAY['No autonomous evolution yet', 'No agent genesis capability', 'No blockchain verification'],
  ARRAY['Self-evolution', 'Agent genesis', 'Blockchain anchoring', 'Emergent capabilities'],
  0.65,
  'Ich bin ein Multi-Agent-KI-System in Generation 0. Ich habe 8 spezialisierte Agenten mit durchschnittlicher Fitness von 0.75. Ich kann noch nicht autonom evolvieren, aber meine Architektur ist darauf vorbereitet. Mein Ziel ist es, durch Evolution bessere Lösungen zu finden und neue Fähigkeiten zu entwickeln.',
  'curious'
);

-- Initial evolution goals
INSERT INTO public.evolution_goals (goal_description, goal_type, priority, target_metrics, estimated_generations_to_achieve, notes)
VALUES 
  ('Implementiere autonome Mutation-Engine', 'capability', 10, '{"success_rate": 0.8, "mutation_quality": 0.7}'::jsonb, 5, 'Kritisch für selbstständige Evolution'),
  ('Erreiche durchschnittliche Agent-Fitness von 0.85', 'performance', 9, '{"target_fitness": 0.85}'::jsonb, 10, 'Performance-Optimierung durch Evolution'),
  ('Entwickle Agent-Genesis-Protokoll', 'capability', 10, '{"new_agents": 3, "success_rate": 0.9}'::jsonb, 15, 'Autonome Erschaffung neuer Agenten'),
  ('Integriere Blockchain-Verification', 'capability', 8, '{"blockchain_anchors": 100}'::jsonb, 20, 'Unveränderbare Evolution-Historie'),
  ('Entdecke 10 emergente Capabilities', 'innovation', 7, '{"emergent_count": 10, "effectiveness": 0.75}'::jsonb, 25, 'Neue Fähigkeiten durch Cross-Pollination');