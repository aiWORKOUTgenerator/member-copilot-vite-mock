// OpenAI Cache Manager - Handles response caching
import { CacheEntry, CacheKey } from '../../../types/external-ai.types';
import { OPENAI_SERVICE_CONSTANTS } from '../../../constants/openai-service-constants';

export class OpenAICacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();

  getCachedResponse<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    return entry.data as T;
  }

  cacheResponse<T>(
    cacheKey: string,
    data: T,
    expiresAt?: number
  ): void {
    const entry: CacheEntry<T> = {
      key: this.createCacheKey(cacheKey),
      data,
      expiresAt: expiresAt ?? (Date.now() + OPENAI_SERVICE_CONSTANTS.DEFAULT_CACHE_TIMEOUT_MS),
      accessCount: 1,
      lastAccessed: Date.now()
    };
    
    this.cache.set(cacheKey, entry);
    this.cleanupExpiredEntries();
  }

  generateCacheKey(templateId: string, variables: Record<string, unknown>): string {
    return `${templateId}${OPENAI_SERVICE_CONSTANTS.CACHE_KEY_SEPARATOR}${JSON.stringify(variables)}`;
  }

  cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; accessCount: number; lastAccessed: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  private createCacheKey(parameters: string): CacheKey {
    return {
      userId: OPENAI_SERVICE_CONSTANTS.DEFAULT_USER_ID,
      requestType: 'openai',
      parameters,
      timestamp: Date.now()
    };
  }
} 