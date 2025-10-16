import { useState, useCallback } from 'react';
import { 
  evaluateTextAdvanced, 
  collaborativeEvaluation,
  analyzeTextEnhanced,
  calculateConsensus,
  EvalResult,
  AgentConfig,
} from '@/lib/textEvaluator';

type Specialization = 'analysis' | 'synthesis' | 'validation' | 'optimization';

interface SpecializedAgent {
  id: number;
  competence: number;
  specialization: Specialization;
  config: AgentConfig;
  successRate: number;
}

interface EvolutionCycle {
  cycle: number;
  bestScore: number;
  consensusLevel: number;
  text: string;
  agentCount: number;
  timestamp: number;
}

interface DebateResult {
  finalText: string;
  finalScore: number;
  evolutionHistory: EvolutionCycle[];
  totalCycles: number;
  convergenceRate: number;
  topAgents: SpecializedAgent[];
}

export const useEvolutionaryAgents = () => {
  const [agents, setAgents] = useState<SpecializedAgent[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState<EvolutionCycle[]>([]);
  const [currentCycle, setCurrentCycle] = useState(0);

  /**
   * Initialisiere Agenten-Pool mit Spezialisierungen
   */
  const initializeAgents = useCallback((count: number = 30) => {
    const specializations: Specialization[] = ['analysis', 'synthesis', 'validation', 'optimization'];
    const newAgents: SpecializedAgent[] = [];

    for (let i = 0; i < count; i++) {
      const spec = specializations[i % specializations.length];
      newAgents.push({
        id: i + 1,
        competence: Math.random() * 0.5 + 0.5, // 0.5-1.0
        specialization: spec,
        config: createConfigForSpecialization(spec, i),
        successRate: 0.5,
      });
    }

    setAgents(newAgents);
    return newAgents;
  }, []);

  /**
   * Evolutionäre Debatte: Agenten verbessern Text iterativ
   */
  const startEvolutionaryDebate = useCallback(
    async (
      initialTopic: string,
      maxCycles: number = 500,
      convergenceThreshold: number = 0.95
    ): Promise<DebateResult> => {
      setIsDebating(true);
      setEvolutionHistory([]);
      setCurrentCycle(0);

      let currentAgents = agents.length > 0 ? agents : initializeAgents(30);
      let currentBest = {
        text: initialTopic,
        score: 0,
      };

      const history: EvolutionCycle[] = [];
      let lastImprovement = 0;

      for (let cycle = 0; cycle < maxCycles; cycle++) {
        setCurrentCycle(cycle);

        // Phase 1: Generierung
        const proposals = await generateProposals(currentBest.text, currentAgents, cycle);

        // Phase 2: Validierung
        const validated = await validateProposals(proposals, currentAgents);

        // Phase 3: Consensus
        const consensusScore = calculateConsensus(validated);

        // Besten Vorschlag finden
        const cycleBest = validated.reduce((best, current) =>
          current.score > best.score ? current : best
        );

        // Nur wenn echte Verbesserung
        if (cycleBest.score > currentBest.score * 1.01) {
          currentBest = cycleBest;
          lastImprovement = cycle;

          history.push({
            cycle,
            bestScore: Math.round(cycleBest.score * 100) / 100,
            consensusLevel: Math.round(consensusScore),
            text: cycleBest.text.substring(0, 100) + (cycleBest.text.length > 100 ? '...' : ''),
            agentCount: currentAgents.length,
            timestamp: Date.now(),
          });
        }

        // Adaptive Learning: Passe Agenten-Kompetenzen an
        currentAgents = adaptAgentCompetences(currentAgents, validated, currentBest.score);

        // Konvergenz-Check
        if (
          consensusScore > convergenceThreshold * 100 &&
          cycle - lastImprovement > 50
        ) {
          console.log(`Konvergenz erreicht bei Cycle ${cycle}`);
          break;
        }

        // Verhindere Blocking der UI
        if (cycle % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      setEvolutionHistory(history);
      setAgents(currentAgents);
      setIsDebating(false);

      // Top 5 Agenten
      const topAgents = [...currentAgents]
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5);

      const convergenceRate = history.length > 1
        ? (history[history.length - 1].bestScore - history[0].bestScore) / maxCycles
        : 0;

      return {
        finalText: currentBest.text,
        finalScore: currentBest.score,
        evolutionHistory: history,
        totalCycles: currentCycle,
        convergenceRate,
        topAgents,
      };
    },
    [agents, initializeAgents]
  );

  /**
   * Quick Evaluation: Bewerte Text ohne evolutionäre Verbesserung
   */
  const quickEvaluate = useCallback((text: string): EvalResult => {
    return analyzeTextEnhanced(text);
  }, []);

  /**
   * Multi-Agent Consensus: Bewerte Text mit allen Agenten
   */
  const getConsensusEvaluation = useCallback(
    (text: string) => {
      const currentAgents = agents.length > 0 ? agents : initializeAgents(30);
      const results = currentAgents.map(agent =>
        evaluateTextAdvanced(text, agent.config)
      );

      const consensus = calculateConsensus(results);
      const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

      return {
        results,
        consensus,
        avgScore,
        bestResult: results.reduce((best, curr) => (curr.score > best.score ? curr : best)),
      };
    },
    [agents, initializeAgents]
  );

  const resetAgents = useCallback(() => {
    setAgents([]);
    setEvolutionHistory([]);
    setCurrentCycle(0);
  }, []);

  return {
    agents,
    isDebating,
    evolutionHistory,
    currentCycle,
    initializeAgents,
    startEvolutionaryDebate,
    quickEvaluate,
    getConsensusEvaluation,
    resetAgents,
  };
};

// ============ Helper Functions ============

function createConfigForSpecialization(spec: Specialization, index: number): AgentConfig {
  switch (spec) {
    case 'analysis':
      return {
        complexityWeight: 0.6,
        uniquenessWeight: 0.4,
        minThreshold: 15.0,
        coherenceWeight: 0.2,
      };
    case 'synthesis':
      return {
        complexityWeight: 0.4,
        uniquenessWeight: 0.6,
        minThreshold: 10.0,
        coherenceWeight: 0.3,
      };
    case 'validation':
      return {
        complexityWeight: 0.5,
        uniquenessWeight: 0.5,
        minThreshold: 20.0,
        coherenceWeight: 0.4,
      };
    case 'optimization':
      return {
        complexityWeight: 0.3,
        uniquenessWeight: 0.7,
        minThreshold: 12.0,
        coherenceWeight: 0.1,
      };
    default:
      return {
        complexityWeight: 0.3,
        uniquenessWeight: 0.7,
        minThreshold: 10.0,
      };
  }
}

async function generateProposals(
  baseText: string,
  agents: SpecializedAgent[],
  cycle: number
): Promise<EvalResult[]> {
  const proposals: EvalResult[] = [];

  for (const agent of agents) {
    if (agent.specialization === 'analysis' || agent.specialization === 'synthesis') {
      const transformedText = transformText(baseText, agent, cycle);
      const result = evaluateTextAdvanced(transformedText, agent.config);
      const weightedScore = result.score * agent.competence;

      proposals.push({
        ...result,
        score: weightedScore,
      });
    }
  }

  return proposals;
}

async function validateProposals(
  proposals: EvalResult[],
  agents: SpecializedAgent[]
): Promise<EvalResult[]> {
  const validators = agents.filter(a => a.specialization === 'validation');
  const validated: EvalResult[] = [];

  for (const proposal of proposals) {
    const validationScores = validators.map(validator => {
      const result = evaluateTextAdvanced(proposal.text, validator.config);
      return result.score * validator.competence;
    });

    if (validationScores.length === 0) {
      validated.push(proposal);
      continue;
    }

    const avgValidationScore =
      validationScores.reduce((a, b) => a + b, 0) / validationScores.length;
    validated.push({ ...proposal, score: avgValidationScore });
  }

  return validated;
}

function transformText(text: string, agent: SpecializedAgent, cycle: number): string {
  const words = text.split(' ');

  // Analysis: Füge Details hinzu
  if (agent.specialization === 'analysis' && cycle % 3 === 0) {
    const additions = [
      'Detaillierte Analyse erforderlich.',
      'Empirische Daten unterstützen dies.',
      'Weitere Untersuchung notwendig.',
      'Quantitative Bewertung möglich.',
    ];
    return text + ' ' + additions[cycle % additions.length];
  }

  // Synthesis: Verfeinere Formulierung
  if (agent.specialization === 'synthesis' && cycle % 2 === 0) {
    return text
      .replace(/sehr/g, 'außerordentlich')
      .replace(/gut/g, 'exzellent')
      .replace(/wichtig/g, 'essentiell')
      .replace(/viel/g, 'substanziell');
  }

  // Optimization: Reduziere Redundanz
  if (agent.specialization === 'optimization') {
    const uniqueWords = [...new Set(words)];
    if (uniqueWords.length < words.length * 0.7) {
      return uniqueWords.join(' ');
    }
  }

  return text;
}

function adaptAgentCompetences(
  agents: SpecializedAgent[],
  results: EvalResult[],
  bestScore: number
): SpecializedAgent[] {
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return agents.map(agent => {
    // Erfolgsrate basierend auf Ergebnissen
    const agentResults = results.filter(r =>
      r.text.length > 10 // Nur valide Ergebnisse
    );

    if (agentResults.length > 0) {
      const agentAvg =
        agentResults.reduce((sum, r) => sum + r.score, 0) / agentResults.length;
      const performance = agentAvg / avgScore;

      // Adaptive Kompetenz-Anpassung
      let newCompetence = agent.competence;
      if (performance > 1.1) {
        newCompetence = Math.min(1.0, agent.competence * 1.02);
      } else if (performance < 0.9) {
        newCompetence = Math.max(0.3, agent.competence * 0.98);
      }

      // Update Success Rate
      const newSuccessRate = (agent.successRate * 0.9 + performance * 0.1);

      return {
        ...agent,
        competence: newCompetence,
        successRate: newSuccessRate,
      };
    }

    return agent;
  });
}
