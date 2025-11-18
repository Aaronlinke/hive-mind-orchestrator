import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeminiOptions {
  systemPrompt?: string;
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, options: GeminiOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('gemini-free-ai', {
        body: {
          prompt,
          systemPrompt: options.systemPrompt,
          model: options.model || 'gemini-2.5-flash'
        }
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);

      return data.text;
    } catch (err: any) {
      const errorMessage = err.message || 'KI-Anfrage fehlgeschlagen';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error };
};
