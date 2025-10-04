import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Decision {
  delegationStrategy: string;
  priorityScore: number;
  riskScore: number;
  contextualBoost: number;
  recommendedNode: string;
  confidence: number;
  reasoning: string[];
}

export const useDecisionEngine = () => {
  const [isDeciding, setIsDeciding] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);

  const makeDecision = async (
    request: any,
    systemState: any,
    source: string,
    history?: any[]
  ) => {
    setIsDeciding(true);
    try {
      const { data, error } = await supabase.functions.invoke('decision-engine', {
        body: { request, systemState, source, history }
      });

      if (error) throw error;
      setDecision(data);
      return data;
    } catch (error) {
      console.error('Decision engine error:', error);
      throw error;
    } finally {
      setIsDeciding(false);
    }
  };

  return { makeDecision, isDeciding, decision };
};
