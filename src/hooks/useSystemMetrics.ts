import { useState, useEffect } from 'react';
import { AgentResult } from './useMultiAgentOrchestrator';

export interface SystemMetrics {
  totalAnalyses: number;
  avgProcessingTime: number;
  avgConfidence: number;
  successRate: number;
  activeAgents: number;
  systemLoad: number;
}

export const useSystemMetrics = (agentResults: AgentResult[]) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalAnalyses: 0,
    avgProcessingTime: 0,
    avgConfidence: 0,
    successRate: 0,
    activeAgents: 0,
    systemLoad: 0
  });

  useEffect(() => {
    if (agentResults.length === 0) return;

    const completedAgents = agentResults.filter(a => a.status === 'completed');
    const processingAgents = agentResults.filter(a => a.status === 'processing');
    
    const totalProcessingTime = completedAgents.reduce(
      (sum, a) => sum + (a.processingTime || 0), 
      0
    );
    
    const totalConfidence = completedAgents.reduce(
      (sum, a) => sum + a.confidence, 
      0
    );

    setMetrics({
      totalAnalyses: completedAgents.length,
      avgProcessingTime: completedAgents.length > 0 
        ? totalProcessingTime / completedAgents.length 
        : 0,
      avgConfidence: completedAgents.length > 0 
        ? totalConfidence / completedAgents.length 
        : 0,
      successRate: agentResults.length > 0 
        ? completedAgents.length / agentResults.length 
        : 0,
      activeAgents: processingAgents.length,
      systemLoad: (processingAgents.length / agentResults.length) || 0
    });
  }, [agentResults]);

  return metrics;
};
