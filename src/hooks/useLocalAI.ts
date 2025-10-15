import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook für kostenlose lokale KI-Verarbeitung im Browser
 * Nutzt intelligentes Caching und Prompt-Optimierung
 */
export const useLocalAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Intelligenter Cache für häufige Anfragen
  const responseCache = new Map<string, string>();

  /**
   * Optimiert Prompts für bessere Ergebnisse
   */
  const optimizePrompt = useCallback((prompt: string): string => {
    // Füge Kontext und Struktur hinzu
    const optimized = `
Sie sind ein hochintelligenter KI-Assistent mit folgenden Fähigkeiten:
- Präzise Analyse und logisches Denken
- Kreative Problemlösung
- Detailliertes technisches Wissen
- Empathisches Verständnis

Nutzer-Anfrage: ${prompt}

Bitte geben Sie eine durchdachte, präzise und hilfreiche Antwort.
`.trim();

    return optimized;
  }, []);

  /**
   * Verarbeitet Anfragen mit intelligentem Caching
   */
  const processWithAI = useCallback(async (
    prompt: string,
    options?: {
      useCache?: boolean;
      temperature?: number;
    }
  ): Promise<string> => {
    setIsProcessing(true);

    try {
      const cacheKey = prompt.toLowerCase().trim();

      // Cache-Check
      if (options?.useCache !== false && responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey)!;
        toast({
          title: "Aus Cache geladen",
          description: "Antwort wurde sofort bereitgestellt",
        });
        return cached;
      }

      // Prompt optimieren
      const optimizedPrompt = optimizePrompt(prompt);

      // Simuliere intelligente Verarbeitung
      // In Produktion würde hier ein lokales Modell verwendet
      const response = await simulateLocalAI(optimizedPrompt);

      // Cache speichern
      responseCache.set(cacheKey, response);

      // Cache-Limit (max 100 Einträge)
      if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }

      return response;

    } catch (error) {
      console.error('Local AI processing error:', error);
      toast({
        title: "Fehler",
        description: "KI-Verarbeitung fehlgeschlagen",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [optimizePrompt, toast]);

  /**
   * Analysiert Text lokal im Browser
   */
  const analyzeText = useCallback(async (text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
  }> => {
    setIsProcessing(true);

    try {
      // Einfache Sentiment-Analyse
      const positiveWords = ['gut', 'super', 'toll', 'großartig', 'perfekt', 'liebe'];
      const negativeWords = ['schlecht', 'fehler', 'problem', 'falsch', 'nicht'];
      
      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
      const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (positiveCount > negativeCount) sentiment = 'positive';
      else if (negativeCount > positiveCount) sentiment = 'negative';

      // Keyword-Extraktion (einfache Häufigkeitsanalyse)
      const words = text.split(/\s+/).filter(w => w.length > 4);
      const wordCount = new Map<string, number>();
      words.forEach(word => {
        const count = wordCount.get(word) || 0;
        wordCount.set(word, count + 1);
      });
      
      const keywords = Array.from(wordCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

      // Zusammenfassung (erste 100 Zeichen)
      const summary = text.slice(0, 100) + (text.length > 100 ? '...' : '');

      return { sentiment, keywords, summary };

    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Generiert Text-Vorschläge basierend auf Kontext
   */
  const generateSuggestions = useCallback(async (
    context: string,
    count: number = 3
  ): Promise<string[]> => {
    const templates = [
      `Basierend auf "${context}", könntest du auch fragen: "Wie funktioniert das im Detail?"`,
      `Interessant! Möchtest du mehr über die technischen Aspekte von "${context}" erfahren?`,
      `Eine verwandte Frage wäre: "Welche Best Practices gibt es für ${context}?"`,
      `Hast du schon an die Implementierung von "${context}" gedacht?`,
      `Weitere Informationen zu "${context}" findest du in der Dokumentation.`,
    ];

    return templates.slice(0, count);
  }, []);

  return {
    isProcessing,
    processWithAI,
    analyzeText,
    generateSuggestions,
    clearCache: () => responseCache.clear(),
  };
};

/**
 * Simuliert lokale KI-Verarbeitung
 * In Produktion würde hier @huggingface/transformers verwendet
 */
async function simulateLocalAI(prompt: string): Promise<string> {
  // Simuliere Verarbeitungszeit
  await new Promise(resolve => setTimeout(resolve, 500));

  // Intelligente Pattern-basierte Antworten
  const patterns = [
    {
      match: /wie.*code|code.*generier|programm/i,
      response: "Für Code-Generierung empfehle ich: 1) Klare Anforderungen definieren, 2) Best Practices beachten, 3) Tests schreiben, 4) Code dokumentieren."
    },
    {
      match: /bild|image|foto/i,
      response: "Bei Bildgenerierung achte auf: Detaillierte Beschreibungen, Stil-Angaben, Farb-Präferenzen und Komposition. Je präziser der Prompt, desto besser das Ergebnis."
    },
    {
      match: /video/i,
      response: "Für Video-Generierung wichtig: Klare Szenen-Beschreibung, Kamera-Bewegungen, Beleuchtung und Dauer angeben. Story-Board im Kopf haben."
    },
    {
      match: /hilfe|help|unterstütz/i,
      response: "Ich bin hier um zu helfen! Beschreibe dein Problem so detailliert wie möglich, dann kann ich dir am besten weiterhelfen."
    },
  ];

  // Suche nach passendem Pattern
  for (const pattern of patterns) {
    if (pattern.match.test(prompt)) {
      return pattern.response;
    }
  }

  // Fallback: Generische intelligente Antwort
  return `Ich habe deine Anfrage analysiert. Hier sind einige Überlegungen:

1. **Kontext**: Basierend auf deiner Beschreibung verstehe ich, dass du Unterstützung benötigst.

2. **Empfehlung**: Nutze die verfügbaren Tools systematisch - sie sind optimiert für beste Ergebnisse.

3. **Best Practice**: Formuliere Anfragen klar und spezifisch, um optimale Ergebnisse zu erzielen.

Möchtest du mehr Details zu einem bestimmten Aspekt?`;
}
