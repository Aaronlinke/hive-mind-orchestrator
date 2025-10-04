import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisualConcept = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateConcept = async (description: string, context?: any, type?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('visual-concept-generator', {
        body: { description, context, type }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Generate visual concept error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateConcept, isGenerating };
};
