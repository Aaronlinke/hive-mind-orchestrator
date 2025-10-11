import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgentDNA {
  id: string;
  agent_name: string;
  agent_type: string;
  generation: number;
  genetic_traits: any;
  parent_agents: string[];
  mutation_history: any[];
  fitness_score: number;
  specialization: string;
  capabilities: string[];
  is_active: boolean;
  birth_timestamp: string;
  last_mutation: string;
}

export interface SystemConsciousness {
  id: string;
  timestamp: string;
  current_generation: number;
  self_assessment: any;
  known_strengths: string[];
  known_limitations: string[];
  aspired_capabilities: string[];
  confidence_level: number;
  reflection_text: string;
  mood: string;
  learning_insights: string[];
}

export interface EvolutionHistory {
  id: string;
  generation_number: number;
  mutation_type: string;
  parent_generation: number;
  fitness_score: number;
  genetic_code: any;
  performance_metrics: any;
  blockchain_hash: string;
  description: string;
  created_at: string;
}

export const useEvolution = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<AgentDNA[]>([]);
  const [consciousness, setConsciousness] = useState<SystemConsciousness | null>(null);
  const [history, setHistory] = useState<EvolutionHistory[]>([]);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_dna')
        .select('*')
        .eq('is_active', true)
        .order('generation', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Load agents error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsciousness = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_consciousness')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConsciousness(data);
    } catch (error) {
      console.error('Load consciousness error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (limit: number = 20) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('evolution_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSystem = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-engine', {
        body: { action: 'analyze' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Analyze system error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mutateAgent = async (agentName: string, mutationType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-engine', {
        body: { action: 'mutate', agentName, mutationType }
      });

      if (error) throw error;
      await loadAgents();
      await loadHistory();
      return data;
    } catch (error) {
      console.error('Mutate agent error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const evolveGeneration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evolution-engine', {
        body: { action: 'evolve-generation' }
      });

      if (error) throw error;
      await loadAgents();
      await loadHistory();
      return data;
    } catch (error) {
      console.error('Evolve generation error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reflectConsciousness = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consciousness-reflection', {
        body: {}
      });

      if (error) throw error;
      await loadConsciousness();
      return data;
    } catch (error) {
      console.error('Reflect consciousness error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (specialization: string, requiredCapabilities: string[], parentAgents: string[]) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-genesis', {
        body: { specialization, requiredCapabilities, parentAgents }
      });

      if (error) throw error;
      await loadAgents();
      await loadHistory();
      return data;
    } catch (error) {
      console.error('Create agent error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    agents,
    consciousness,
    history,
    isLoading,
    loadAgents,
    loadConsciousness,
    loadHistory,
    analyzeSystem,
    mutateAgent,
    evolveGeneration,
    reflectConsciousness,
    createAgent
  };
};
