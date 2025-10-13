import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmergentPattern {
  id: string;
  pattern_name: string;
  pattern_signature: string;
  occurrence_count: number;
  confidence_score: number;
  contributing_agents: string[];
  discovered_at: string;
  last_seen: string;
  pattern_data: any;
}

export const usePatternRecognition = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [patterns, setPatterns] = useState<EmergentPattern[]>([]);

  const loadPatterns = async () => {
    setIsDetecting(true);
    try {
      const { data, error } = await supabase
        .from('emergent_patterns')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error('Load patterns error:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const detectPatterns = async () => {
    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pattern-recognition', {
        body: { action: 'detect-patterns' }
      });

      if (error) throw error;
      await loadPatterns();
      return data;
    } catch (error) {
      console.error('Detect patterns error:', error);
      throw error;
    } finally {
      setIsDetecting(false);
    }
  };

  return {
    patterns,
    isDetecting,
    loadPatterns,
    detectPatterns
  };
};