-- Erstelle fehlende Tabellen für alle Systeme

-- Tabelle für Web-Interaktionen
CREATE TABLE IF NOT EXISTS public.web_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_type text NOT NULL,
  url text,
  selector text,
  status text NOT NULL DEFAULT 'pending',
  execution_time_ms integer,
  result_summary text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.web_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view web interactions"
  ON public.web_interactions FOR SELECT
  USING (true);

CREATE POLICY "System can manage web interactions"
  ON public.web_interactions FOR ALL
  USING (true);

-- Tabelle für Decision Contexts
CREATE TABLE IF NOT EXISTS public.decision_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_summary text NOT NULL,
  system_state jsonb,
  decision_strategy text NOT NULL,
  priority_score numeric,
  risk_score numeric,
  confidence numeric,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.decision_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view decision contexts"
  ON public.decision_contexts FOR SELECT
  USING (true);

CREATE POLICY "System can manage decision contexts"
  ON public.decision_contexts FOR ALL
  USING (true);

-- Tabelle für Skill-Entwicklung
CREATE TABLE IF NOT EXISTS public.skill_development (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_name text NOT NULL,
  skill_category text NOT NULL,
  proficiency_level numeric DEFAULT 0,
  usage_count integer DEFAULT 0,
  last_used timestamp with time zone,
  learning_resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.skill_development ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view skill development"
  ON public.skill_development FOR SELECT
  USING (true);

CREATE POLICY "System can manage skill development"
  ON public.skill_development FOR ALL
  USING (true);

-- Tabelle für Semantic Analysis
CREATE TABLE IF NOT EXISTS public.semantic_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query text NOT NULL,
  semantic_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_score numeric DEFAULT 0,
  context_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.semantic_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view semantic analysis"
  ON public.semantic_analysis FOR SELECT
  USING (true);

CREATE POLICY "System can manage semantic analysis"
  ON public.semantic_analysis FOR ALL
  USING (true);

-- Tabelle für Resource Allocation
CREATE TABLE IF NOT EXISTS public.resource_allocation (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_type text NOT NULL,
  allocated_to text NOT NULL,
  allocation_amount numeric NOT NULL,
  priority text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

ALTER TABLE public.resource_allocation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view resource allocation"
  ON public.resource_allocation FOR SELECT
  USING (true);

CREATE POLICY "System can manage resource allocation"
  ON public.resource_allocation FOR ALL
  USING (true);

-- Tabelle für Knowledge Entries
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  relevance_score numeric DEFAULT 0,
  access_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view knowledge entries"
  ON public.knowledge_entries FOR SELECT
  USING (true);

CREATE POLICY "System can manage knowledge entries"
  ON public.knowledge_entries FOR ALL
  USING (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_knowledge_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_entries_updated_at_trigger
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_entries_updated_at();