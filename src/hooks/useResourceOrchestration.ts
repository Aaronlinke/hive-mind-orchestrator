import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResourceRequest {
  resourceType: 'API' | 'WebScraping' | 'CloudService' | 'DatabaseQuery';
  endpoint?: string;
  query?: string;
  payload?: any;
  costBudget?: number;
  latencyTolerance?: number;
}

export const useResourceOrchestration = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeResource = async (request: ResourceRequest) => {
    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('resource-orchestration', {
        body: request
      });

      if (error) throw error;
      setResult(data);
      return data;
    } catch (error) {
      console.error('Resource orchestration error:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  return { executeResource, isExecuting, result };
};
