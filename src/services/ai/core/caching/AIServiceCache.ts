// Main caching logic for storing and retrieving AI analysis results
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  UnifiedAIAnalysis, 
  AIServiceConfig, 
  AIServiceCacheEntry,
  AIServicePerformanceMonitor 
} from '../types/AIServiceTypes';

export interface CacheStats {
  size: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  averageAccessTime: number;
  memoryUsage: number;
}

export interface CacheHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  size: number;
  hitRate: number;
  memoryUsage: number;
  lastError?: Error;
}

/**
 * Main caching system for AI analysis results
 * Implements LRU eviction, TTL, and performance monitoring
 */
export class AIServiceCache extends AIServiceComponent {
  private cache = new Map<string, AIServiceCacheEntry>();
  private config: AIServiceConfig;
  private performanceMonitor?: AIServicePerformanceMonitor;
  private stats: {
    hitCount: number;
    missCount: number;
    evictionCount: number;
    totalAccessTime: number;
    accessCount: number;
  };

  constructor(config: AIServiceConfig, performanceMonitor?: AIServicePerformanceMonitor) {
    super('AIServiceCache');
    this.config = config;
    this.performanceMonitor = performanceMonitor;
    this.stats = {
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
      totalAccessTime: 0,
      accessCount: 0
    };
  }

  /**
   * Get analysis from cache
   */
  get(key: string): UnifiedAIAnalysis | null {
    const startTime = performance.now();
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.recordMiss();
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = new Date();
      
      // Move to end of map (LRU behavior)
      this.cache.delete(key);
      this.cache.set(key, entry);
      
      this.recordHit(startTime);
      return entry.analysis;
    } catch (error) {
      this.handleError(error as Error, 'Cache get operation failed');
      this.recordMiss();
      return null;
    }
  }

  /**
   * Store analysis in cache
   */
  set(key: string, analysis: UnifiedAIAnalysis): void {
    try {
      const entry: AIServiceCacheEntry = {
        analysis,
        timestamp: new Date(),
        accessCount: 1,
        lastAccessed: new Date()
      };
      
      this.cache.set(key, entry);
      
      // Maintain cache size after adding new entry
      this.maintainSize();
      
      this.log('debug', 'Analysis cached successfully', {
        key: key.substring(0, 50) + '...',
        cacheSize: this.cache.size,
        analysisId: analysis.id
      });
    } catch (error) {
      this.handleError(error as Error, 'Cache set operation failed');
    }
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(entry: AIServiceCacheEntry): boolean {
    const age = Date.now() - entry.timestamp.getTime();
    return age > this.config.cacheTimeout;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const size = this.cache.size;
      this.cache.clear();
      
      this.log('info', 'Cache cleared', {
        previousSize: size,
        component: this.componentName
      });
    } catch (error) {
      this.handleError(error as Error, 'Cache clear operation failed');
    }
  }

  /**
   * Maintain cache size by removing oldest entries (LRU)
   */
  maintainSize(): void {
    try {
      if (this.cache.size <= this.config.cacheSize) {
        return;
      }

      const entries = Array.from(this.cache.entries());
      
      // Sort by last accessed time (LRU)
      entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
      
      // Calculate how many entries to remove
      const entriesToRemove = this.cache.size - this.config.cacheSize;
      const entriesToDelete = entries.slice(0, entriesToRemove);
      
      // Remove oldest entries
      entriesToDelete.forEach(([key]) => {
        this.cache.delete(key);
        this.stats.evictionCount++;
      });
      
      this.log('info', 'Cache size maintained', {
        removedEntries: entriesToRemove,
        newSize: this.cache.size,
        maxSize: this.config.cacheSize
      });
    } catch (error) {
      this.handleError(error as Error, 'Cache size maintenance failed');
    }
  }

  /**
   * Get current cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    const hitRate = totalRequests > 0 ? this.stats.hitCount / totalRequests : 0;
    const averageAccessTime = this.stats.accessCount > 0 
      ? this.stats.totalAccessTime / this.stats.accessCount 
      : 0;

    return {
      size: this.cache.size,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate,
      evictionCount: this.stats.evictionCount,
      averageAccessTime,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): CacheHealthStatus {
    const stats = this.getStats();
    const hitRate = stats.hitRate;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (hitRate < 0.5) {
      status = 'unhealthy';
    } else if (hitRate < 0.8) {
      status = 'degraded';
    }
    
    return {
      status,
      size: stats.size,
      hitRate,
      memoryUsage: stats.memoryUsage
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let cleanedCount = 0;
    
    try {
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        this.log('info', 'Expired entries cleaned', {
          cleanedCount,
          remainingSize: this.cache.size
        });
      }
    } catch (error) {
      this.handleError(error as Error, 'Cache cleanup failed');
    }
    
    return cleanedCount;
  }

  /**
   * Get memory usage of cache
   */
  getMemoryUsage(): number {
    try {
      // Estimate memory usage based on cache size and average entry size
      const averageEntrySize = 1024; // Rough estimate in bytes
      return this.cache.size * averageEntrySize;
    } catch (error) {
      this.handleError(error as Error, 'Memory usage calculation failed');
      return 0;
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
      totalAccessTime: 0,
      accessCount: 0
    };
    
    this.log('info', 'Cache statistics reset');
  }

  /**
   * Record cache hit
   */
  private recordHit(startTime: number): void {
    const accessTime = performance.now() - startTime;
    this.stats.hitCount++;
    this.stats.totalAccessTime += accessTime;
    this.stats.accessCount++;
    
    if (this.performanceMonitor) {
      this.performanceMonitor.recordCacheHit();
    }
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    this.stats.missCount++;
    this.stats.accessCount++;
    
    if (this.performanceMonitor) {
      this.performanceMonitor.recordCacheMiss();
    }
  }
} 