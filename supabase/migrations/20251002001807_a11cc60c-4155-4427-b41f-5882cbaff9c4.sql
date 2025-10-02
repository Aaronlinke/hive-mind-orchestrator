-- Fix security warning: Set search_path for function
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;