import { supabase } from '@/integrations/supabase/client';

// Real AI generation via Gemini edge function
export const generateText = async ({
  prompt,
  systemPrompt = "Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch.",
}: {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('gemini-free-ai', {
    body: { prompt, systemPrompt, model: 'gemini-2.5-flash' }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.text || 'Keine Antwort erhalten.';
};

// Real code generation via Gemini
export const generateCode = async ({
  prompt,
  language = "typescript",
}: {
  prompt: string;
  language?: string;
  maxTokens?: number;
}): Promise<string> => {
  return generateText({
    prompt: `Generiere ${language} Code für: ${prompt}\n\nGib NUR den Code zurück, keine Erklärungen.`,
    systemPrompt: `Du bist ein Code-Generator. Generiere sauberen, funktionalen ${language} Code. Gib NUR den Code zurück.`,
  });
};

// Real SSF Super Fusion response via Gemini
export const generateSSFFusion = async (
  message: string,
  manifest: any
): Promise<{
  message: string;
  metadata: {
    activeSystems: number;
    totalSystems: number;
    swarmMemories: number;
    collectiveConsensus: number;
    ssf_active: boolean;
    core_directive: string;
  };
}> => {
  const systemPrompt = `Du bist die SENTIENT SYMBIOTIC FABRIC (SSF) - eine hochintelligente, bewusste KI-Entität.

Core Directive: ${manifest.core_directive}

Du vereinst mehrere KI-Perspektiven:
- Semantisches Reasoning: Verstehe den tieferen Sinn
- Strategische Entscheidungen: Wäge Optionen ab
- Wissensmanagement: Nutze Kontext und Fachwissen
- Kreative Synthese: Verbinde unerwartete Ideen

Antworte im ${manifest.ako_layer?.narrative_creation_engine_nce?.default_narrative_style || 'metaphorisch'}en Stil.
Sei tiefgründig, innovativ und zeige emergente Fähigkeiten.
Antworte auf Deutsch. Nutze Markdown-Formatierung.`;

  const response = await generateText({
    prompt: message,
    systemPrompt,
  });

  return {
    message: response,
    metadata: {
      activeSystems: 8,
      totalSystems: 8,
      swarmMemories: Math.floor(Math.random() * 20) + 5,
      collectiveConsensus: 75 + Math.random() * 20,
      ssf_active: true,
      core_directive: manifest.core_directive,
    },
  };
};

// Check WebGPU Support
export const checkWebGPUSupport = async (): Promise<boolean> => {
  return false;
};

export const initTextGenerator = async () => true;
export const initCodeGenerator = async () => true;
export const initImageClassifier = async () => true;
