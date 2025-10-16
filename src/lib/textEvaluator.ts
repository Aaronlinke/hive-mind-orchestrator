/**
 * Text Evaluation Engine - Port der Rust-Logik nach TypeScript
 * Bewertet Text auf Basis von Komplexität, Einzigartigkeit und semantischer Kohärenz
 */

export interface EvalResult {
  text: string;
  score: number;
  tokenCount: number;
  uniquenessRatio: number;
  complexity: number;
  metadata?: {
    keywords?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    coherence?: number;
  };
}

export interface AgentConfig {
  complexityWeight: number;
  uniquenessWeight: number;
  minThreshold: number;
  coherenceWeight?: number;
}

export const DEFAULT_CONFIG: AgentConfig = {
  complexityWeight: 0.3,
  uniquenessWeight: 0.7,
  minThreshold: 10.0,
  coherenceWeight: 0.0,
};

/**
 * Erweiterte Textbewertung mit konfigurierbaren Gewichtungen
 */
export function evaluateTextAdvanced(
  input: string,
  config: AgentConfig = DEFAULT_CONFIG
): EvalResult {
  const tokens = input.split(/\s+/).filter(t => t.length > 0);
  const uniqueTokens = new Set(tokens);
  
  const tokenCount = tokens.length;
  const uniquenessRatio = tokenCount > 0 ? uniqueTokens.size / tokenCount : 0;
  const complexity = tokenCount > 0 ? Math.log(tokenCount) : 0;
  
  // Basis-Score
  let score = (
    uniquenessRatio * config.uniquenessWeight +
    complexity * config.complexityWeight
  ) * 100.0;
  
  // Optional: Kohärenz-Analyse
  if (config.coherenceWeight && config.coherenceWeight > 0) {
    const coherence = analyzeCoherence(tokens);
    score += coherence * config.coherenceWeight * 100.0;
  }
  
  // Mindest-Schwellenwert
  score = Math.max(score, config.minThreshold);
  
  return {
    text: input.trim(),
    score,
    tokenCount,
    uniquenessRatio,
    complexity,
  };
}

/**
 * Kollaborative Evaluation durch mehrere virtuelle Agenten
 */
export function collaborativeEvaluation(
  agentCount: number,
  input: string
): EvalResult[] {
  const results: EvalResult[] = [];
  
  for (let i = 0; i < agentCount; i++) {
    // Variiere Konfiguration pro Agent
    const config: AgentConfig = {
      complexityWeight: 0.3 + (i * 0.1) % 0.5,
      uniquenessWeight: 0.7 - (i * 0.1) % 0.4,
      minThreshold: 10.0 + (i % 3) * 5,
      coherenceWeight: (i % 2) * 0.2,
    };
    
    results.push(evaluateTextAdvanced(input, config));
  }
  
  return results;
}

/**
 * Analysiert semantische Kohärenz (vereinfachte Implementierung)
 */
function analyzeCoherence(tokens: string[]): number {
  if (tokens.length < 2) return 0;
  
  // Prüfe Wiederholungen benachbarter Wörter
  let transitions = 0;
  let validTransitions = 0;
  
  for (let i = 0; i < tokens.length - 1; i++) {
    transitions++;
    // Simple Heuristik: verschiedene Wörter = gute Transition
    if (tokens[i] !== tokens[i + 1]) {
      validTransitions++;
    }
  }
  
  return transitions > 0 ? validTransitions / transitions : 0;
}

/**
 * Erweiterte Textanalyse mit Keywords und Sentiment
 */
export function analyzeTextEnhanced(input: string): EvalResult {
  const baseEval = evaluateTextAdvanced(input);
  
  // Keyword-Extraktion (einfach: längste/häufigste Wörter)
  const words = input.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  
  words.forEach(word => {
    if (word.length > 4) { // Nur signifikante Wörter
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });
  
  const keywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Sentiment-Analyse (sehr vereinfacht)
  const positiveWords = ['gut', 'besser', 'optimal', 'effizient', 'verbessert', 'erfolg'];
  const negativeWords = ['schlecht', 'fehler', 'problem', 'mangel', 'kritisch'];
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  const posCount = words.filter(w => positiveWords.includes(w)).length;
  const negCount = words.filter(w => negativeWords.includes(w)).length;
  
  if (posCount > negCount) sentiment = 'positive';
  else if (negCount > posCount) sentiment = 'negative';
  
  return {
    ...baseEval,
    metadata: {
      keywords,
      sentiment,
      coherence: analyzeCoherence(words),
    },
  };
}

/**
 * Consensus-Score aus mehreren Evaluationen
 */
export function calculateConsensus(results: EvalResult[]): number {
  if (results.length === 0) return 0;
  
  const scores = results.map(r => r.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Standardabweichung
  const variance = scores.reduce((sum, score) => 
    sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Hoher Consensus = niedrige Standardabweichung
  const maxStdDev = 30; // Annahme: max erwartete Abweichung
  const consensusRatio = Math.max(0, 1 - (stdDev / maxStdDev));
  
  return consensusRatio * 100;
}
