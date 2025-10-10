import { useState } from 'react';
import { useSemanticReasoning } from './useSemanticReasoning';
import { useDecisionEngine } from './useDecisionEngine';
import { useVisualConcept } from './useVisualConcept';
import { useKnowledgeManager } from './useKnowledgeManager';

export interface AgentResult {
  agentId: string;
  agentName: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  confidence: number;
  result?: any;
  processingTime?: number;
}

export const useMultiAgentOrchestrator = () => {
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  
  const semantic = useSemanticReasoning();
  const decision = useDecisionEngine();
  const visual = useVisualConcept();
  const knowledge = useKnowledgeManager();

  const orchestrateAnalysis = async (request: string) => {
    setIsOrchestrating(true);
    
    // Initialize agent tracking
    const agents = [
      { id: 'semantic', name: 'Semantisches Reasoning', hook: semantic },
      { id: 'decision', name: 'Entscheidungs-Engine', hook: decision },
      { id: 'visual', name: 'Visuelle Konzepte', hook: visual },
      { id: 'knowledge', name: 'Wissensmanagement', hook: knowledge },
    ];

    // Set initial states
    setAgentResults(agents.map(a => ({
      agentId: a.id,
      agentName: a.name,
      status: 'processing',
      confidence: 0,
    })));

    // Execute all agents in parallel
    const promises = agents.map(async (agent) => {
      const startTime = Date.now();
      try {
        let result;
        let confidence = 0;

        switch (agent.id) {
          case 'semantic':
            result = await semantic.analyzeRequest(request);
            confidence = result?.confidence || 0;
            break;
          case 'decision':
            result = await decision.makeDecision(
              { request },
              { activeAgents: agents.length },
              'orchestrator'
            );
            confidence = result?.confidence || 0;
            break;
          case 'visual':
            result = await visual.generateConcept(request);
            confidence = 0.75; // Visual concepts don't return confidence
            break;
          case 'knowledge':
            result = await knowledge.searchKnowledge(request);
            confidence = result?.results?.length > 0 ? 0.8 : 0.5;
            break;
        }

        const processingTime = Date.now() - startTime;

        return {
          agentId: agent.id,
          agentName: agent.name,
          status: 'completed' as const,
          confidence,
          result,
          processingTime,
        };
      } catch (error) {
        console.error(`Agent ${agent.id} error:`, error);
        return {
          agentId: agent.id,
          agentName: agent.name,
          status: 'error' as const,
          confidence: 0,
          processingTime: Date.now() - startTime,
        };
      }
    });

    // Update results as they complete
    const results = await Promise.all(promises);
    setAgentResults(results);
    setIsOrchestrating(false);

    return results;
  };

  const resetOrchestration = () => {
    setAgentResults([]);
    setIsOrchestrating(false);
  };

  return {
    agentResults,
    isOrchestrating,
    orchestrateAnalysis,
    resetOrchestration,
  };
};
