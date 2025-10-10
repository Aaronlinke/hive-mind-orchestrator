-- Create storage bucket for agent files
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-files', 'agent-files', true);

-- Create RLS policies for agent files bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public read access for agent files"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-files');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for chat analysis results
CREATE TABLE IF NOT EXISTS public.chat_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  analysis_result JSONB,
  insights TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_analysis
CREATE POLICY "Users can view their own chat analysis"
ON public.chat_analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat analysis"
ON public.chat_analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat analysis"
ON public.chat_analysis FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_chat_analysis_user_id ON public.chat_analysis(user_id);
CREATE INDEX idx_chat_analysis_created_at ON public.chat_analysis(created_at DESC);
