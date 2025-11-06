import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { requestCache } from '@/lib/requestCache';

interface SemanticAnalysis {
  immediateNeeds: string[];
  matchedPatterns: any[];
  historicalInsights: any;
  confidence: number;
  recommendations: string[];
}

export const useOptimizedSemanticReasoning = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SemanticAnalysis | null>(null);

  const analyzeRequest = useCallback(async (request: string, context?: any, history?: any[]) => {
    const cacheKey = requestCache.generateKey('semantic', { request, context, history });
    
    // Check cache first
    const cached = requestCache.get<SemanticAnalysis>(cacheKey);
    if (cached) {
      console.log('✅ Using cached semantic analysis');
      setAnalysis(cached);
      return cached;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('semantic-reasoning', {
        body: { request, context, history }
      });

      if (error) throw error;
      
      setAnalysis(data);
      requestCache.set(cacheKey, data, 180000); // Cache for 3 minutes
      return data;
    } catch (error) {
      console.error('Semantic reasoning error:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyzeRequest, isAnalyzing, analysis };
};
