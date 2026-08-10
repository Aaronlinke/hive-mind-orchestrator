// Shared Lovable AI Gateway caller with exponential backoff on 429.
export interface AICallOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
  retries?: number;
}

export class AIRateLimitError extends Error {
  constructor(msg = 'Rate-Limit') { super(msg); this.name = 'AIRateLimitError'; }
}
export class AICreditsError extends Error {
  constructor(msg = 'Credits aufgebraucht') { super(msg); this.name = 'AICreditsError'; }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callGateway(
  systemPrompt: string,
  userPrompt: string,
  opts: AICallOptions = {},
): Promise<string> {
  const key = Deno.env.get('LOVABLE_API_KEY');
  if (!key) throw new Error('LOVABLE_API_KEY nicht konfiguriert');

  const {
    model = 'google/gemini-2.5-flash',
    temperature = 0.8,
    max_tokens = 1200,
    jsonMode = false,
    retries = 4,
  } = opts;

  let lastErr: Error = new AIRateLimitError();

  for (let attempt = 0; attempt < retries; attempt++) {
    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens,
    };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (r.ok) {
      const d = await r.json();
      return d.choices?.[0]?.message?.content ?? '';
    }

    const text = await r.text();
    console.error(`AI gateway ${r.status} (attempt ${attempt + 1}):`, text.slice(0, 200));

    if (r.status === 402) throw new AICreditsError();
    if (r.status === 429 || r.status >= 500) {
      lastErr = r.status === 429 ? new AIRateLimitError() : new Error(`AI ${r.status}`);
      await sleep(800 * Math.pow(2, attempt)); // 0.8s, 1.6s, 3.2s, 6.4s
      continue;
    }
    throw new Error(`AI ${r.status}`);
  }
  throw lastErr;
}

export function parseJSON<T>(raw: string, fallback: T): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned) as T; } catch { return fallback; }
}
