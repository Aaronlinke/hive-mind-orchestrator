// Simple in-memory cache for AI requests to reduce redundant calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize = 100;

  set<T>(key: string, data: T, expiresIn: number = 300000) { // 5min default
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

export const requestCache = new RequestCache();
