import { AIServiceCache } from '../AIServiceCache';
import { AIServiceCacheKeyGenerator } from '../AIServiceCacheKeyGenerator';
import { AIServiceConfig, UnifiedAIAnalysis, GlobalAIContext, PerWorkoutOptions } from '../../types/AIServiceTypes';

// Mock performance monitor
const createMockPerformanceMonitor = () => ({
  recordCacheHit: jest.fn(),
  recordCacheMiss: jest.fn(),
  recordAnalysis: jest.fn(),
  recordError: jest.fn(),
  getMetrics: jest.fn().mockReturnValue({
    averageExecutionTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    memoryUsage: 0
  }),
  reset: jest.fn()
});

// Mock analysis data
const createMockAnalysis = (id: string = 'test-analysis'): UnifiedAIAnalysis => ({
  id,
  timestamp: new Date(),
  insights: {
    energy: [
      {
        id: 'energy-1',
        type: 'info',
        message: 'Energy level is moderate',
        recommendation: 'Consider moderate intensity workout',
        actionable: true,
        confidence: 0.8
      }
    ],
    soreness: [
      {
        id: 'soreness-1',
        type: 'warning',
        message: 'Leg soreness detected',
        recommendation: 'Focus on upper body or low-impact cardio',
        actionable: true,
        confidence: 0.9
      }
    ],
    focus: [],
    duration: [],
    equipment: []
  },
  crossComponentConflicts: [],
  recommendations: [
    {
      id: 'rec-1',
      priority: 'high',
      category: 'safety',
      targetComponent: 'soreness',
      title: 'Avoid Leg Exercises',
      description: 'Focus on upper body due to leg soreness',
      reasoning: 'Leg soreness detected, recommend upper body focus',
      confidence: 0.9,
      risk: 'low'
    }
  ],
  confidence: 0.85,
  reasoning: 'Analysis based on energy and soreness parameters',
  performanceMetrics: {
    totalExecutionTime: 150,
    cacheHitRate: 0.0,
    memoryPeakUsage: 2048
  }
});

describe('Caching System Integration', () => {
  let cache: AIServiceCache;
  let keyGenerator: AIServiceCacheKeyGenerator;
  let config: AIServiceConfig;
  let performanceMonitor: any;

  beforeEach(() => {
    config = {
      enableValidation: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 10,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      fallbackToLegacy: true
    };
    
    performanceMonitor = createMockPerformanceMonitor();
    cache = new AIServiceCache(config, performanceMonitor);
    keyGenerator = new AIServiceCacheKeyGenerator();
  });

  describe('Cache and Key Generator Integration', () => {
    it('should work together for complete workflow', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 45,
        equipment: ['dumbbells', 'bench']
      };

      const analysis = createMockAnalysis('workflow-test');

      // Generate key
      const key = keyGenerator.generateKey(selections, 'intermediate');
      expect(keyGenerator.validateKey(key)).toBe(true);

      // Store in cache
      cache.set(key, analysis);

      // Retrieve from cache
      const retrieved = cache.get(key);
      expect(retrieved).toEqual(analysis);

      // Verify performance monitoring
      expect(performanceMonitor.recordCacheHit).toHaveBeenCalled();
    });

    it('should handle context-based caching', () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          experience: 'some experience',
          goals: ['strength', 'endurance'],
          preferences: {
            workoutDuration: 45,
            intensity: 'moderate',
            equipment: ['dumbbells', 'bench']
          }
        },
        currentSelections: {
          energy: 7,
          soreness: ['arms'],
          focus: 'cardio',
          duration: 30,
          equipment: ['treadmill']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          location: 'gym',
          weather: 'sunny',
          availableTime: 60
        },
        preferences: {
          aiAssistanceLevel: 'standard',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      const analysis = createMockAnalysis('context-test');

      // Generate key from context
      const key = keyGenerator.generateKeyFromContext(context);
      expect(keyGenerator.validateKey(key)).toBe(true);

      // Store and retrieve
      cache.set(key, analysis);
      const retrieved = cache.get(key);
      expect(retrieved).toEqual(analysis);
    });

    it('should handle partial selections caching', () => {
      const partialSelections: Partial<PerWorkoutOptions> = {
        energy: 5,
        focus: 'strength'
      };

      const analysis = createMockAnalysis('partial-test');

      // Generate key from partial selections
      const key = keyGenerator.generateKeyFromPartialSelections(partialSelections);
      expect(keyGenerator.validateKey(key)).toBe(true);

      // Store and retrieve
      cache.set(key, analysis);
      const retrieved = cache.get(key);
      expect(retrieved).toEqual(analysis);
    });
  });

  describe('Cache Performance Integration', () => {
    it('should track performance metrics correctly', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const analysis = createMockAnalysis('performance-test');
      const key = keyGenerator.generateKey(selections, 'intermediate');

      // Initial miss
      cache.get(key);
      expect(performanceMonitor.recordCacheMiss).toHaveBeenCalledTimes(1);

      // Store analysis
      cache.set(key, analysis);

      // Hit
      cache.get(key);
      expect(performanceMonitor.recordCacheHit).toHaveBeenCalledTimes(1);

      // Check stats
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should maintain cache size limits', () => {
      config.cacheSize = 3;

      // Add more entries than cache size with different selections
      for (let i = 0; i < 5; i++) {
        const selections: PerWorkoutOptions = {
          energy: i,
          soreness: ['legs'],
          focus: 'strength',
          duration: 30 + i, // Different duration to ensure unique keys
          equipment: ['dumbbells']
        };

        const key = keyGenerator.generateKey(selections, 'intermediate');
        const analysis = createMockAnalysis(`analysis-${i}`);
        cache.set(key, analysis);
      }

      // Should maintain size limit
      expect(cache.getSize()).toBe(3);

      // Check stats for evictions
      const stats = cache.getStats();
      expect(stats.evictionCount).toBe(2);
    });
  });

  describe('Cache Health Integration', () => {
    it('should provide health status based on performance', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const analysis = createMockAnalysis('health-test');
      const key = keyGenerator.generateKey(selections, 'intermediate');

      // Add some data
      cache.set(key, analysis);

      // Multiple hits for good health
      cache.get(key);
      cache.get(key);
      cache.get(key);

      const health = cache.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.hitRate).toBe(1);
      expect(health.size).toBe(1);
    });

    it('should detect degraded performance', () => {
      // Mostly misses
      for (let i = 0; i < 10; i++) {
        const key = `non-existent-${i}`;
        cache.get(key);
      }

      const health = cache.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.hitRate).toBe(0);
    });
  });

  describe('Cache Cleanup Integration', () => {
    it('should clean expired entries automatically', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key = keyGenerator.generateKey(selections, 'intermediate');
      const analysis = createMockAnalysis('cleanup-test');

      cache.set(key, analysis);

      // Manually create expired entry
      const expiredAnalysis = {
        ...analysis,
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000))
      };

      (cache as any).cache.set(key, {
        analysis: expiredAnalysis,
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000)),
        accessCount: 1,
        lastAccessed: new Date()
      });

      // Cleanup should remove expired entry
      const cleanedCount = cache.cleanExpired();
      expect(cleanedCount).toBe(1);
      expect(cache.getSize()).toBe(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle key generation errors gracefully', () => {
      // Test with invalid data that might cause key generation to fail
      const invalidSelections = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells'],
        circular: {} as any
      };
      
      // Create circular reference
      invalidSelections.circular = invalidSelections;

      // Should not throw, should generate fallback key
      expect(() => {
        const key = keyGenerator.generateKey(invalidSelections as any, 'intermediate');
        expect(key).toBeTruthy();
        
        // Should still work with cache
        const analysis = createMockAnalysis('error-test');
        cache.set(key, analysis);
        const retrieved = cache.get(key);
        expect(retrieved).toEqual(analysis);
      }).not.toThrow();
    });

    it('should handle cache errors gracefully', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key = keyGenerator.generateKey(selections, 'intermediate');
      const analysis = createMockAnalysis('error-test');

      // Mock cache to throw error
      const mockCache = new Map();
      mockCache.set = jest.fn().mockImplementation(() => {
        throw new Error('Cache storage error');
      });

      (cache as any).cache = mockCache;

      // Should not throw
      expect(() => {
        cache.set(key, analysis);
      }).not.toThrow();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle rapid successive requests', () => {
      const selections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key = keyGenerator.generateKey(selections, 'intermediate');
      const analysis = createMockAnalysis('rapid-test');

      // Store analysis
      cache.set(key, analysis);

      // Rapid successive requests
      for (let i = 0; i < 10; i++) {
        const retrieved = cache.get(key);
        expect(retrieved).toEqual(analysis);
      }

      // Should have high hit rate
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(10);
      expect(stats.hitRate).toBe(1);
    });

    it('should handle mixed workload', () => {
      // Simulate mixed workload with hits and misses
      const commonSelections: PerWorkoutOptions = {
        energy: 6,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const commonKey = keyGenerator.generateKey(commonSelections, 'intermediate');
      const commonAnalysis = createMockAnalysis('common-test');
      cache.set(commonKey, commonAnalysis);

      // Multiple requests for common analysis (hits)
      for (let i = 0; i < 5; i++) {
        cache.get(commonKey);
      }

      // Multiple requests for unique analyses (misses)
      for (let i = 0; i < 5; i++) {
        const uniqueSelections: PerWorkoutOptions = {
          energy: i,
          soreness: ['arms'],
          focus: 'cardio',
          duration: 45 + i, // Different duration to ensure unique keys
          equipment: ['treadmill']
        };
        const uniqueKey = keyGenerator.generateKey(uniqueSelections, 'intermediate');
        cache.get(uniqueKey);
      }

      // Should have mixed hit rate
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(5);
      expect(stats.missCount).toBe(5);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should handle cache warming', () => {
      // Simulate cache warming scenario
      const analyses = [];
      const keys = [];

      // Pre-populate cache with common analyses
      for (let i = 0; i < 5; i++) {
        const selections: PerWorkoutOptions = {
          energy: 5 + i,
          soreness: ['legs'],
          focus: 'strength',
          duration: 30 + (i * 5),
          equipment: ['dumbbells']
        };

        const key = keyGenerator.generateKey(selections, 'intermediate');
        const analysis = createMockAnalysis(`warm-${i}`);
        
        cache.set(key, analysis);
        analyses.push(analysis);
        keys.push(key);
      }

      // Verify all are cached
      expect(cache.getSize()).toBe(5);

      // Access all cached items
      for (let i = 0; i < keys.length; i++) {
        const retrieved = cache.get(keys[i]);
        expect(retrieved).toEqual(analyses[i]);
      }

      // Should have perfect hit rate
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(5);
      expect(stats.missCount).toBe(0);
      expect(stats.hitRate).toBe(1);
    });
  });
}); 