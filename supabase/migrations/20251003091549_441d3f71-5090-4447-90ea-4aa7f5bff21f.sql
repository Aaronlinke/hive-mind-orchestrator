-- Tabelle für Prompt-Templates
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_content TEXT NOT NULL,
  ai_node_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Export-Tracking
CREATE TABLE IF NOT EXISTS public.user_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  export_type TEXT NOT NULL, -- 'code', 'chat', 'analytics'
  export_format TEXT NOT NULL, -- 'json', 'pdf', 'zip'
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für Voice Recordings
CREATE TABLE IF NOT EXISTS public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_url TEXT,
  transcription TEXT,
  duration_seconds NUMERIC,
  ai_node_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabelle für generierte Bilder
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  ai_node_id TEXT NOT NULL,
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies für prompt_templates
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on prompt_templates"
ON public.prompt_templates FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on prompt_templates"
ON public.prompt_templates FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on prompt_templates"
ON public.prompt_templates FOR UPDATE
USING (true);

-- RLS Policies für user_exports
ALTER TABLE public.user_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on user_exports"
ON public.user_exports FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read on user_exports"
ON public.user_exports FOR SELECT
USING (true);

-- RLS Policies für voice_recordings
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on voice_recordings"
ON public.voice_recordings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read on voice_recordings"
ON public.voice_recordings FOR SELECT
USING (true);

-- RLS Policies für generated_images
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on generated_images"
ON public.generated_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read on generated_images"
ON public.generated_images FOR SELECT
USING (true);

-- Realtime für alle relevanten Tabellen aktivieren
ALTER TABLE public.ai_learning_history REPLICA IDENTITY FULL;
ALTER TABLE public.generated_code REPLICA IDENTITY FULL;
ALTER TABLE public.generated_images REPLICA IDENTITY FULL;
ALTER TABLE public.voice_recordings REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_learning_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_code;
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_recordings;

-- Initial Prompt Templates einfügen
INSERT INTO public.prompt_templates (name, description, category, template_content, ai_node_type) VALUES
('Code Optimization', 'Optimiere bestehenden Code für bessere Performance', 'Specialist', 'Analysiere den folgenden Code und schlage Performance-Optimierungen vor: {code}', 'specialist'),
('Bug Fix', 'Finde und behebe Bugs im Code', 'Specialist', 'Untersuche diesen Code auf Fehler und schlage Lösungen vor: {code}', 'specialist'),
('Feature Development', 'Entwickle neue Features basierend auf Anforderungen', 'Manager', 'Entwickle ein Feature mit folgenden Anforderungen: {requirements}', 'manager'),
('Code Review', 'Führe ein umfassendes Code-Review durch', 'Manager', 'Führe ein Code-Review durch und gib detailliertes Feedback: {code}', 'manager'),
('Architecture Design', 'Entwerfe die Architektur für ein neues System', 'Director', 'Entwerfe eine Systemarchitektur für: {description}', 'director'),
('Project Planning', 'Erstelle einen detaillierten Projektplan', 'Director', 'Erstelle einen Projektplan für: {project}', 'director');