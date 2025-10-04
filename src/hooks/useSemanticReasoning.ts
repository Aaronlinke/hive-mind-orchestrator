import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SemanticAnalysis {
  immediateNeeds: string[];
  matchedPatterns: any[];
  historicalInsights: any;
  confidence: number;
  recommendations: string[];
}

export const useSemanticReasoning = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SemanticAnalysis | null>(null);

  const analyzeRequest = async (request: string, context?: any, history?: any[]) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-reasoning', {
        body: { request, context, history }
      });

      if (error) throw error;
      setAnalysis(data);
      return data;
    } catch (error) {
      console.error('Semantic reasoning error:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeRequest, isAnalyzing, analysis };
};
