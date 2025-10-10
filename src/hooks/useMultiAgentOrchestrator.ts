import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CollectiveInsights {
  immediateNeeds: string[];
  recommendations: string[];
  knowledgeBase: any[];
  visualConcepts: any[];
  requiredSkills: any[];
  resourceAllocation: any;
  externalSources: any[];
  decisionPath: any[];
  hierarchicalStructure: any;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  confidence: number;
  result?: any;
  processingTime?: number;
  hasData?: boolean;
}

export interface CollectiveResult {
  success: boolean;
  collectiveMetrics: {
    consensusLevel: number;
    totalConfidence: number;
    activeAgents: number;
    totalAgents: number;
    convergenceRate: number;
  };
  agentResults: AgentResult[];
  collectiveInsights: CollectiveInsights;
  metaAnalysis: string;
  timestamp: string;
}

export const useMultiAgentOrchestrator = () => {
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [collectiveResult, setCollectiveResult] = useState<CollectiveResult | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const orchestrateAnalysis = async (request: string, brainCount: number = 8, context?: any) => {
    setIsOrchestrating(true);
    
    // Initialize all 8 agent types
    const allAgents = [
      { id: 'semantic', name: 'Semantisches Reasoning' },
      { id: 'decision', name: 'Entscheidungs-Engine' },
      { id: 'knowledge', name: 'Wissensmanagement' },
      { id: 'visual', name: 'Visuelle Konzepte' },
      { id: 'skill', name: 'Skill-Manager' },
      { id: 'resource', name: 'Ressourcen-Orchestrierung' },
      { id: 'web', name: 'Web-Interaktion' },
      { id: 'hierarchical', name: 'Hierarchische KI' },
    ];

    // Set initial processing states
    setAgentResults(allAgents.map(a => ({
      agentId: a.id,
      agentName: a.name,
      status: 'processing',
      confidence: 0,
    })));

    try {
      const startTime = Date.now();
      
      // Call collective intelligence edge function
      const { data, error } = await supabase.functions.invoke('collective-intelligence', {
        body: { 
          request, 
          context: context || {},
          brainCount 
        }
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;
      
      // Transform API response to agent results
      const transformedResults: AgentResult[] = data.agentResults.map((agent: any) => ({
        agentId: agent.name.toLowerCase().replace(/[^a-z]/g, ''),
        agentName: agent.name,
        status: agent.hasData ? 'completed' : 'error',
        confidence: agent.confidence,
        hasData: agent.hasData,
        processingTime: processingTime / allAgents.length,
      }));

      setAgentResults(transformedResults);
      setCollectiveResult(data);
      setIsOrchestrating(false);

      return transformedResults;
    } catch (error) {
      console.error('Collective orchestration error:', error);
      
      // Set all agents to error state
      const errorResults = allAgents.map(a => ({
        agentId: a.id,
        agentName: a.name,
        status: 'error' as const,
        confidence: 0,
        processingTime: 0,
      }));
      
      setAgentResults(errorResults);
      setIsOrchestrating(false);
      throw error;
    }
  };

  const resetOrchestration = () => {
    setAgentResults([]);
    setCollectiveResult(null);
    setIsOrchestrating(false);
  };

  return {
    agentResults,
    collectiveResult,
    isOrchestrating,
    orchestrateAnalysis,
    resetOrchestration,
  };
};
