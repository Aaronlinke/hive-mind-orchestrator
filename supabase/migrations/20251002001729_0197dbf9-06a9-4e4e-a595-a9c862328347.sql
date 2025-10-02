-- Tabelle für KI-Lernhistorie und Selbstverbesserung
CREATE TABLE IF NOT EXISTS public.ai_learning_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_node_id TEXT NOT NULL,
  ai_node_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
  success_score FLOAT DEFAULT 0.0,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für generierte Code-Snippets
CREATE TABLE IF NOT EXISTS public.generated_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_node_id TEXT NOT NULL,
  code_language TEXT NOT NULL,
  code_content TEXT NOT NULL,
  description TEXT,
  execution_success BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für optimierte Prompts (selbstverbessernde Prompts)
CREATE TABLE IF NOT EXISTS public.optimized_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_node_type TEXT NOT NULL,
  prompt_version INTEGER DEFAULT 1,
  prompt_content TEXT NOT NULL,
  avg_success_score FLOAT DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies (öffentlich, da keine User-Auth)
ALTER TABLE public.ai_learning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimized_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on ai_learning_history" ON public.ai_learning_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ai_learning_history" ON public.ai_learning_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on generated_code" ON public.generated_code FOR SELECT USING (true);
CREATE POLICY "Allow public insert on generated_code" ON public.generated_code FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on generated_code" ON public.generated_code FOR UPDATE USING (true);

CREATE POLICY "Allow public read on optimized_prompts" ON public.optimized_prompts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on optimized_prompts" ON public.optimized_prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on optimized_prompts" ON public.optimized_prompts FOR UPDATE USING (true);

-- Index für schnellere Abfragen
CREATE INDEX idx_learning_history_node ON public.ai_learning_history(ai_node_id);
CREATE INDEX idx_learning_history_score ON public.ai_learning_history(success_score DESC);
CREATE INDEX idx_optimized_prompts_active ON public.optimized_prompts(ai_node_type, is_active);

-- Funktion zur automatischen Prompt-Optimierung
CREATE OR REPLACE FUNCTION update_prompt_success_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update den Erfolgs-Score für den verwendeten Prompt
  UPDATE public.optimized_prompts
  SET 
    avg_success_score = (
      SELECT AVG(success_score) 
      FROM public.ai_learning_history 
      WHERE ai_node_type = NEW.ai_node_type
    ),
    usage_count = usage_count + 1
  WHERE ai_node_type = NEW.ai_node_type AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER learning_feedback_trigger
AFTER INSERT ON public.ai_learning_history
FOR EACH ROW
EXECUTE FUNCTION update_prompt_success_score();