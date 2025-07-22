// Workout Generation Cache Management
import { GeneratedWorkout } from '../types/external-ai.types';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { WORKOUT_GENERATION_CONSTANTS } from '../constants/workout-generation-constants';
import { validateCacheKey } from './workout-validation';

// Cache entry interface
export interface WorkoutCacheEntry {
  workout: GeneratedWorkout;
  timestamp: number;
  requestHash: string;
}

// Cache statistics interface
export interface CacheStats {
  size: number;
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  lastCleanup: number;
}

/**
 * Manages workout generation cache with automatic cleanup and statistics
 */
export class WorkoutCacheManager {
  private cache = new Map<string, WorkoutCacheEntry>();
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    lastCleanup: Date.now()
  };

  constructor() {
    this.startCacheCleanup();
  }

  /**
   * Generates a cache key from workout generation request
   */
  generateCacheKey(request: WorkoutGenerationRequest): string {
    if (!validateCacheKey(request)) {
      throw new Error('Invalid request for cache key generation');
    }

    const { workoutType, userProfile, workoutFocusData } = request;
    
    // Create a hash of the request parameters
    const requestHash = JSON.stringify({
      workoutType,
      fitnessLevel: userProfile.fitnessLevel,
      duration: workoutFocusData.customization_duration,
      energy: workoutFocusData.customization_energy,
      focus: workoutFocusData.customization_focus,
      equipment: workoutFocusData.customization_equipment,
      soreness: workoutFocusData.customization_soreness
    });

    return `workout_${workoutType}_${userProfile.fitnessLevel}_${requestHash}`;
  }

  /**
   * Retrieves a cached workout if available and not expired
   */
  getCachedWorkout(cacheKey: string): GeneratedWorkout | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      this.updateStats(false);
      return null;
    }

    // Check if cache entry is expired
    const now = Date.now();
    if (now - entry.timestamp > WORKOUT_GENERATION_CONSTANTS.CACHE_ENTRY_TTL_MS) {
      this.cache.delete(cacheKey);
      this.updateStats(false);
      return null;
    }

    this.updateStats(true);
    return entry.workout;
  }

  /**
   * Stores a workout in the cache
   */
  cacheWorkout(cacheKey: string, workout: GeneratedWorkout): void {
    try {
      // Check cache size limit
      if (this.cache.size >= WORKOUT_GENERATION_CONSTANTS.MAX_CACHE_SIZE) {
        this.evictOldestEntries();
      }

      const entry: WorkoutCacheEntry = {
        workout,
        timestamp: Date.now(),
        requestHash: cacheKey
      };

      this.cache.set(cacheKey, entry);
      this.stats.size = this.cache.size;
    } catch (error) {
      // Log cache error but don't fail the request
      console.warn('Failed to cache workout:', error);
    }
  }

  /**
   * Updates cache statistics
   */
  private updateStats(isCacheHit: boolean): void {
    this.stats.totalRequests++;
    
    if (isCacheHit) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }

    // Calculate hit rate
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? this.stats.cacheHits / this.stats.totalRequests 
      : 0;
  }

  /**
   * Evicts oldest cache entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    this.stats.size = this.cache.size;
  }

  /**
   * Starts automatic cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, WORKOUT_GENERATION_CONSTANTS.CACHE_CLEANUP_INTERVAL_MS);
  }

  /**
   * Removes expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > WORKOUT_GENERATION_CONSTANTS.CACHE_ENTRY_TTL_MS) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.stats.size = this.cache.size;
      this.stats.lastCleanup = now;
    }
  }

  /**
   * Gets cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clears all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.lastCleanup = Date.now();
  }

  /**
   * Gets cache size and hit rate
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.stats.size,
      hitRate: this.stats.hitRate
    };
  }

  /**
   * Checks if cache is healthy
   */
  isHealthy(): boolean {
    const now = Date.now();
    const timeSinceLastCleanup = now - this.stats.lastCleanup;
    
    // Cache is healthy if:
    // 1. Size is within limits
    // 2. Hit rate is reasonable
    // 3. Cleanup is running regularly
    return this.stats.size <= WORKOUT_GENERATION_CONSTANTS.MAX_CACHE_SIZE &&
           this.stats.hitRate >= 0 &&
           timeSinceLastCleanup <= WORKOUT_GENERATION_CONSTANTS.CACHE_CLEANUP_INTERVAL_MS * 2;
  }
} 