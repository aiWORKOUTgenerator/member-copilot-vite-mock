// Cache key generation for AI analysis results
import { AIServiceComponent } from '../utils/AIServiceBase';
import { GlobalAIContext } from '../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../types';

/**
 * Generates consistent cache keys for AI analysis results
 * Ensures cache hits for identical workout configurations
 */
export class AIServiceCacheKeyGenerator extends AIServiceComponent {
  private readonly CACHE_WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    super('AIServiceCacheKeyGenerator');
  }

  /**
   * Generate cache key from complete workout selections
   */
  generateKey(selections: PerWorkoutOptions, fitnessLevel?: string): string {
    try {
      const normalizedSelections = this.normalizeSelections(selections);
      const cacheWindow = Math.floor(Date.now() / this.CACHE_WINDOW_SIZE);
      
      const keyData = {
        selections: normalizedSelections,
        fitnessLevel: fitnessLevel || 'unknown',
        cacheWindow,
        // Add a hash of the selections to ensure uniqueness
        selectionsHash: this.hashObject(normalizedSelections)
      };
      
      const key = this.hashObject(keyData);
      
      this.log('debug', 'Cache key generated', {
        key: key.substring(0, 16) + '...',
        fitnessLevel,
        cacheWindow
      });
      
      return key;
    } catch (error) {
      this.handleError(error as Error, 'Cache key generation failed');
      // Fallback to simple key
      return this.generateFallbackKey(selections, fitnessLevel);
    }
  }

  /**
   * Generate cache key from global context
   */
  generateKeyFromContext(context: GlobalAIContext): string {
    try {
      const normalizedSelections = this.normalizeSelections(context.currentSelections);
      const fitnessLevel = context.userProfile?.fitnessLevel || 'unknown';
      const cacheWindow = Math.floor(Date.now() / this.CACHE_WINDOW_SIZE);
      
      const keyData = {
        selections: normalizedSelections,
        fitnessLevel,
        cacheWindow,
        // Include relevant context factors that affect analysis
        environmentalFactors: context.environmentalFactors ? {
          timeOfDay: context.environmentalFactors.timeOfDay,
          location: context.environmentalFactors.location
        } : undefined,
        preferences: {
          aiAssistanceLevel: context.preferences?.aiAssistanceLevel || 'standard'
        }
      };
      
      const key = this.hashObject(keyData);
      
      this.log('debug', 'Cache key generated from context', {
        key: key.substring(0, 16) + '...',
        fitnessLevel,
        hasEnvironmentalFactors: !!context.environmentalFactors
      });
      
      return key;
    } catch (error) {
      this.handleError(error as Error, 'Context-based cache key generation failed');
      return this.generateFallbackKey(context.currentSelections, context.userProfile?.fitnessLevel);
    }
  }

  /**
   * Generate cache key from partial selections
   * Useful for incremental analysis updates
   */
  generateKeyFromPartialSelections(partialSelections: Partial<PerWorkoutOptions>): string {
    try {
      const normalizedPartial = this.normalizePartialSelections(partialSelections);
      const cacheWindow = Math.floor(Date.now() / this.CACHE_WINDOW_SIZE);
      
      // Create a more unique key by hashing the partial selections separately
      const partialHash = this.simpleHash(JSON.stringify(normalizedPartial));
      
      const keyData = {
        partialHash,
        cacheWindow
      };
      
      const key = this.hashObject(keyData);
      
      this.log('debug', 'Partial cache key generated', {
        key: key.substring(0, 16) + '...',
        partialFields: Object.keys(partialSelections)
      });
      
      return key;
    } catch (error) {
      this.handleError(error as Error, 'Partial cache key generation failed');
      return this.generateFallbackKey(partialSelections as PerWorkoutOptions);
    }
  }

  /**
   * Generate cache key for specific domain analysis
   */
  generateDomainKey(domain: string, selections: PerWorkoutOptions, fitnessLevel?: string): string {
    try {
      const baseKey = this.generateKey(selections, fitnessLevel);
      const domainKey = `${domain}:${baseKey}`;
      
      this.log('debug', 'Domain cache key generated', {
        domain,
        key: domainKey.substring(0, 20) + '...'
      });
      
      return domainKey;
    } catch (error) {
      this.handleError(error as Error, 'Domain cache key generation failed');
      return `${domain}:${this.generateFallbackKey(selections, fitnessLevel)}`;
    }
  }

  /**
   * Normalize selections to ensure consistent key generation
   */
  private normalizeSelections(selections: PerWorkoutOptions): any {
    try {
      // Create a normalized copy, sorting arrays and removing undefined values
      const normalized: any = {};
      
      for (const [key, value] of Object.entries(selections)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            normalized[key] = [...value].sort();
          } else {
            normalized[key] = value;
          }
        }
      }
      
      return normalized;
    } catch (error) {
      this.handleError(error as Error, 'Selection normalization failed');
      return selections;
    }
  }

  /**
   * Normalize partial selections
   */
  private normalizePartialSelections(partialSelections: Partial<PerWorkoutOptions>): any {
    try {
      const normalized: any = {};
      
      for (const [key, value] of Object.entries(partialSelections)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            normalized[key] = [...value].sort();
          } else {
            normalized[key] = value;
          }
        }
      }
      
      return normalized;
    } catch (error) {
      this.handleError(error as Error, 'Partial selection normalization failed');
      return partialSelections;
    }
  }

  /**
   * Create a hash of an object for consistent key generation
   */
  private hashObject(obj: any): string {
    try {
      // Use JSON.stringify with sorted keys for consistency
      const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
      
      // More robust hash function that's sensitive to small differences
      let hash = 0;
      const prime = 31;
      
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash * prime + char) >>> 0; // Use unsigned 32-bit arithmetic
      }
      
      // Add additional entropy based on string length and content
      const lengthHash = jsonString.length * 17;
      const contentHash = jsonString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Add position-sensitive hashing for better differentiation
      let positionHash = 0;
      for (let i = 0; i < jsonString.length; i++) {
        positionHash = (positionHash + (jsonString.charCodeAt(i) * (i + 1))) >>> 0;
      }
      
      const finalHash = (hash + lengthHash + contentHash + positionHash) >>> 0;
      
      // Convert to base36 and ensure minimum length
      const hashStr = finalHash.toString(36);
      return hashStr.padStart(6, '0');
    } catch (error) {
      this.handleError(error as Error, 'Object hashing failed');
      // Fallback to simple string hash
      return this.simpleHash(JSON.stringify(obj));
    }
  }

  /**
   * Simple hash function as fallback
   */
  private simpleHash(str: string): string {
    let hash = 0;
    const prime = 31;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash * prime + char) >>> 0; // Use unsigned 32-bit arithmetic
    }
    
    // Convert to base36 and ensure minimum length
    const hashStr = hash.toString(36);
    return hashStr.padStart(6, '0');
  }

  /**
   * Generate fallback key when normal generation fails
   */
  private generateFallbackKey(selections: PerWorkoutOptions, fitnessLevel?: string): string {
    try {
      const timestamp = Math.floor(Date.now() / this.CACHE_WINDOW_SIZE);
      const fallbackData = {
        timestamp,
        fitnessLevel: fitnessLevel || 'unknown',
        // Include only essential fields for fallback
        energy: (selections as any).energy || (selections as any).customization_energy,
        soreness: (selections as any).soreness || (selections as any).customization_soreness,
        focus: (selections as any).focus || (selections as any).customization_focus
      };
      
      return this.simpleHash(JSON.stringify(fallbackData));
    } catch (error) {
      this.handleError(error as Error, 'Fallback key generation failed');
      // Ultimate fallback
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Validate cache key format
   */
  validateKey(key: string): boolean {
    try {
      // Basic validation - key should be a non-empty string
      return typeof key === 'string' && key.length > 0 && key.length < 1000;
    } catch (error) {
      this.handleError(error as Error, 'Cache key validation failed');
      return false;
    }
  }

  /**
   * Extract information from cache key (for debugging)
   */
  parseKey(key: string): { isValid: boolean; info?: any } {
    try {
      if (!this.validateKey(key)) {
        return { isValid: false };
      }
      
      // This is a simplified parser - in a real implementation,
      // you might want to store metadata with the key
      return {
        isValid: true,
        info: {
          keyLength: key.length,
          keyPrefix: key.substring(0, 8),
          estimatedTimestamp: this.estimateTimestampFromKey(key)
        }
      };
    } catch (error) {
      this.handleError(error as Error, 'Cache key parsing failed');
      return { isValid: false };
    }
  }

  /**
   * Estimate timestamp from cache key (approximate)
   */
  private estimateTimestampFromKey(key: string): number {
    try {
      // This is a rough estimation based on the cache window
      const currentWindow = Math.floor(Date.now() / this.CACHE_WINDOW_SIZE);
      return currentWindow * this.CACHE_WINDOW_SIZE;
    } catch (error) {
      return Date.now();
    }
  }
} 