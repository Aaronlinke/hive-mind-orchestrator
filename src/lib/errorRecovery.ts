/**
 * Robustes Error-Handling und Recovery für AI-Generatoren
 * Implementiert Retry-Logik, Circuit-Breaker und Fallback-Strategien
 */

export interface RetryOptions {
  maxRetries?: number;
  backoffMs?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Exponential Backoff Retry mit Circuit-Breaker
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    backoffMs = 1000,
    backoffMultiplier = 2,
    timeout = 30000,
  } = options;

  const startTime = Date.now();
  let lastError: Error | undefined;
  let attempts = 0;

  for (let i = 0; i < maxRetries; i++) {
    attempts++;
    
    try {
      // Timeout-Wrapper
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        ),
      ]);

      return {
        success: true,
        data: result,
        attempts,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Wenn letzter Versuch, gib Fehler zurück
      if (i === maxRetries - 1) break;

      // Prüfe ob Fehler wiederholbar ist
      if (!isRetriableError(lastError)) break;

      // Exponential Backoff
      const delay = backoffMs * Math.pow(backoffMultiplier, i);
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Circuit Breaker Pattern für AI-Services
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 Minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Prüfe ob Reset-Timeout abgelaufen ist
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      
      // Bei Erfolg: Reset
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

/**
 * Fallback-Chain: Versuche primäre Funktion, bei Fehler Fallback
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: { timeout?: number } = {}
): Promise<{ result: T; usedFallback: boolean }> {
  try {
    const result = await retryWithBackoff(primary, { maxRetries: 2, timeout: options.timeout });
    
    if (result.success && result.data) {
      return { result: result.data, usedFallback: false };
    }
  } catch (error) {
    console.warn('Primary function failed, trying fallback:', error);
  }

  // Fallback
  const fallbackResult = await fallback();
  return { result: fallbackResult, usedFallback: true };
}

/**
 * Batch-Retry: Verarbeite mehrere Operationen mit individuellem Retry
 */
export async function batchWithRetry<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  options: RetryOptions = {}
): Promise<{
  successful: T[];
  failed: { item: T; error: Error }[];
}> {
  const successful: T[] = [];
  const failed: { item: T; error: Error }[] = [];

  for (const item of items) {
    const result = await retryWithBackoff(() => processor(item), options);
    
    if (result.success) {
      successful.push(item);
    } else {
      failed.push({ item, error: result.error! });
    }
  }

  return { successful, failed };
}

// ============ Helper Functions ============

function isRetriableError(error: Error): boolean {
  const retriablePatterns = [
    /timeout/i,
    /network/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /429/, // Rate limit
    /503/, // Service unavailable
    /502/, // Bad gateway
  ];

  return retriablePatterns.some(pattern => 
    pattern.test(error.message) || pattern.test(error.name)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate Limiter: Verhindert zu viele Requests
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 Minute
  ) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    
    // Entferne alte Timestamps
    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        await sleep(waitTime);
        return this.acquire(); // Recursive retry
      }
    }

    this.timestamps.push(now);
  }

  getRemaining(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }
}
