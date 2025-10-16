/**
 * Hybrid Agent System - Verbindet lokale evolutionäre Agenten mit API-basierten Multi-Agenten
 * Ermöglicht nahtlose Zusammenarbeit zwischen beiden Systemen
 */

import { useState, useCallback } from 'react';
import { useEvolutionaryAgents } from './useEvolutionaryAgents';
import { useMultiAgentOrchestrator, CollectiveResult } from './useMultiAgentOrchestrator';
import { evaluateTextAdvanced, calculateConsensus, EvalResult } from '@/lib/textEvaluator';

export interface HybridAnalysisResult {
  localEvaluation: EvalResult;
  remoteResult?: CollectiveResult;
  consensusScore: number;
  hybridRecommendation: string;
  combinedConfidence: number;
  processingMode: 'local-only' | 'remote-only' | 'hybrid';
}

export const useHybridAgentSystem = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<HybridAnalysisResult | null>(null);
  
  const evolutionaryAgents = useEvolutionaryAgents();
  const multiAgent = useMultiAgentOrchestrator();

  /**
   * Hybrid-Analyse: Kombiniert lokale und Remote-Evaluation
   */
  const analyzeHybrid = useCallback(
    async (
      request: string,
      options: {
        useLocal?: boolean;
        useRemote?: boolean;
        localCycles?: number;
        remoteBrainCount?: number;
      } = {}
    ): Promise<HybridAnalysisResult> => {
      const {
        useLocal = true,
        useRemote = true,
        localCycles = 200,
        remoteBrainCount = 8,
      } = options;

      setIsProcessing(true);

      try {
        let localEval: EvalResult;
        let remoteResult: CollectiveResult | undefined;
        let processingMode: 'local-only' | 'remote-only' | 'hybrid' = 'hybrid';

        // Phase 1: Lokale Evaluation
        if (useLocal) {
          if (evolutionaryAgents.agents.length === 0) {
            evolutionaryAgents.initializeAgents(30);
          }

          const debateResult = await evolutionaryAgents.startEvolutionaryDebate(
            request,
            localCycles,
            0.9
          );

          localEval = {
            text: debateResult.finalText,
            score: debateResult.finalScore,
            tokenCount: debateResult.finalText.split(/\s+/).length,
            uniquenessRatio: 0,
            complexity: 0,
          };

          if (!useRemote) processingMode = 'local-only';
        } else {
          // Fallback: Quick local evaluation ohne Evolution
          localEval = evaluateTextAdvanced(request);
        }

        // Phase 2: Remote Multi-Agent Orchestration
        if (useRemote) {
          try {
            await multiAgent.orchestrateAnalysis(request, remoteBrainCount, {
              localEvaluation: localEval,
            });

            remoteResult = multiAgent.collectiveResult || undefined;

            if (!useLocal) processingMode = 'remote-only';
          } catch (error) {
            console.error('Remote orchestration failed, falling back to local-only:', error);
            processingMode = 'local-only';
          }
        }

        // Phase 3: Consensus-Berechnung
        const evaluations: EvalResult[] = [localEval];
        if (remoteResult) {
          // Füge Remote-Evaluierungen hinzu
          remoteResult.agentResults.forEach(agent => {
            if (agent.hasData && agent.result) {
              evaluations.push({
                text: agent.result.toString(),
                score: agent.confidence * 100,
                tokenCount: 0,
                uniquenessRatio: 0,
                complexity: 0,
              });
            }
          });
        }

        const consensusScore = calculateConsensus(evaluations);

        // Phase 4: Hybrid Recommendation
        let hybridRecommendation = '';
        let combinedConfidence = localEval!.score;

        if (remoteResult) {
          const remoteConfidence = remoteResult.collectiveMetrics.totalConfidence;
          combinedConfidence = (localEval!.score * 0.6 + remoteConfidence * 0.4);

          if (consensusScore > 80) {
            hybridRecommendation = `Starker Konsensus zwischen lokaler Evolution (Score: ${Math.round(localEval!.score)}) und Remote-Agenten (${remoteResult.collectiveMetrics.activeAgents}/${remoteResult.collectiveMetrics.totalAgents} aktiv, ${Math.round(remoteConfidence)}% Konfidenz). Empfehlung: Hohe Vertrauenswürdigkeit.`;
          } else if (consensusScore > 60) {
            hybridRecommendation = `Moderater Konsensus. Lokale Evolution und Remote-Agenten zeigen leichte Divergenzen. Weitere Iteration empfohlen.`;
          } else {
            hybridRecommendation = `Niedriger Konsensus (${Math.round(consensusScore)}%). Lokale und Remote-Evaluationen weichen stark ab. Tiefere Analyse erforderlich.`;
          }
        } else {
          hybridRecommendation = `Nur lokale Evaluation verfügbar. Score: ${Math.round(localEval!.score)}. Konsensus-Level: ${Math.round(consensusScore)}%`;
        }

        const result: HybridAnalysisResult = {
          localEvaluation: localEval!,
          remoteResult,
          consensusScore,
          hybridRecommendation,
          combinedConfidence,
          processingMode,
        };

        setLastResult(result);
        setIsProcessing(false);

        return result;
      } catch (error) {
        console.error('Hybrid analysis error:', error);
        setIsProcessing(false);
        throw error;
      }
    },
    [evolutionaryAgents, multiAgent]
  );

  /**
   * Quick Hybrid Evaluation ohne vollständige Evolution
   */
  const quickEvaluate = useCallback(
    async (text: string): Promise<HybridAnalysisResult> => {
      const localEval = evolutionaryAgents.quickEvaluate(text);

      return {
        localEvaluation: localEval,
        remoteResult: undefined,
        consensusScore: 100,
        hybridRecommendation: `Quick local evaluation: Score ${Math.round(localEval.score)}`,
        combinedConfidence: localEval.score,
        processingMode: 'local-only',
      };
    },
    [evolutionaryAgents]
  );

  /**
   * Reset both systems
   */
  const reset = useCallback(() => {
    evolutionaryAgents.resetAgents();
    multiAgent.resetOrchestration();
    setLastResult(null);
  }, [evolutionaryAgents, multiAgent]);

  return {
    analyzeHybrid,
    quickEvaluate,
    reset,
    isProcessing,
    lastResult,
    localAgents: evolutionaryAgents.agents,
    remoteAgents: multiAgent.agentResults,
    evolutionHistory: evolutionaryAgents.evolutionHistory,
    collectiveResult: multiAgent.collectiveResult,
  };
};
