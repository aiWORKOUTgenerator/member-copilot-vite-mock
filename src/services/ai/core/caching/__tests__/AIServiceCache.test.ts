import { AIServiceCache } from '../AIServiceCache';
import { AIServiceConfig, UnifiedAIAnalysis, AIServicePerformanceMonitor } from '../../types/AIServiceTypes';

// Mock performance monitor
const createMockPerformanceMonitor = (): AIServicePerformanceMonitor => ({
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
    energy: [],
    soreness: [],
    focus: [],
    duration: [],
    equipment: []
  },
  crossComponentConflicts: [],
  recommendations: [],
  confidence: 0.8,
  reasoning: 'Test analysis',
  performanceMetrics: {
    totalExecutionTime: 100,
    cacheHitRate: 0.5,
    memoryPeakUsage: 1024
  }
});

describe('AIServiceCache', () => {
  let cache: AIServiceCache;
  let config: AIServiceConfig;
  let performanceMonitor: AIServicePerformanceMonitor;

  beforeEach(() => {
    config = {
      enableValidation: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 100,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      fallbackToLegacy: true
    };
    
    performanceMonitor = createMockPerformanceMonitor();
    cache = new AIServiceCache(config, performanceMonitor);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(cache.getSize()).toBe(0);
    });

    it('should work without performance monitor', () => {
      const cacheWithoutMonitor = new AIServiceCache(config);
      expect(cacheWithoutMonitor.getSize()).toBe(0);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve analysis', () => {
      const key = 'test-key';
      const analysis = createMockAnalysis();

      cache.set(key, analysis);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(analysis);
      expect(performanceMonitor.recordCacheHit).toHaveBeenCalled();
    });

    it('should return null for non-existent key', () => {
      const retrieved = cache.get('non-existent');
      
      expect(retrieved).toBeNull();
      expect(performanceMonitor.recordCacheMiss).toHaveBeenCalled();
    });

    it('should handle multiple entries', () => {
      const analysis1 = createMockAnalysis('analysis-1');
      const analysis2 = createMockAnalysis('analysis-2');

      cache.set('key1', analysis1);
      cache.set('key2', analysis2);

      expect(cache.get('key1')).toEqual(analysis1);
      expect(cache.get('key2')).toEqual(analysis2);
      expect(cache.getSize()).toBe(2);
    });

    it('should update access count and last accessed time', () => {
      const key = 'test-key';
      const analysis = createMockAnalysis();

      cache.set(key, analysis);
      
      // First access
      const firstAccess = cache.get(key);
      expect(firstAccess).toEqual(analysis);

      // Second access
      const secondAccess = cache.get(key);
      expect(secondAccess).toEqual(analysis);

      // Check stats
      const stats = cache.getStats();
      expect(stats.hitCount).toBe(2);
    });
  });

  describe('expiration', () => {
    it('should expire entries after timeout', () => {
      const key = 'test-key';
      const analysis = createMockAnalysis();

      cache.set(key, analysis);

      // Mock expired timestamp
      const expiredAnalysis = {
        ...analysis,
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000))
      };

      // Manually set expired entry
      (cache as any).cache.set(key, {
        analysis: expiredAnalysis,
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000)),
        accessCount: 1,
        lastAccessed: new Date()
      });

      const retrieved = cache.get(key);
      expect(retrieved).toBeNull();
      expect(performanceMonitor.recordCacheMiss).toHaveBeenCalled();
    });

    it('should not expire entries within timeout', () => {
      const key = 'test-key';
      const analysis = createMockAnalysis();

      cache.set(key, analysis);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(analysis);
    });
  });

  describe('size management', () => {
    it('should maintain cache size limit', () => {
      config.cacheSize = 2;

      // Add 3 entries
      cache.set('key1', createMockAnalysis('analysis-1'));
      cache.set('key2', createMockAnalysis('analysis-2'));
      cache.set('key3', createMockAnalysis('analysis-3'));

      expect(cache.getSize()).toBe(2);
    });

    it('should implement LRU eviction', () => {
      config.cacheSize = 2;

      // Add entries
      cache.set('key1', createMockAnalysis('analysis-1'));
      cache.set('key2', createMockAnalysis('analysis-2'));

      // Access key1 to make it more recently used
      cache.get('key1');

      // Add third entry - should evict key2 (least recently used)
      cache.set('key3', createMockAnalysis('analysis-3'));

      expect(cache.get('key1')).toBeTruthy(); // Should still exist
      expect(cache.get('key2')).toBeNull(); // Should be evicted
      expect(cache.get('key3')).toBeTruthy(); // Should exist
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', createMockAnalysis('analysis-1'));
      cache.set('key2', createMockAnalysis('analysis-2'));

      expect(cache.getSize()).toBe(2);

      cache.clear();

      expect(cache.getSize()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('statistics', () => {
    it('should track hit and miss statistics', () => {
      const analysis = createMockAnalysis();

      // Set and get (hit)
      cache.set('key1', analysis);
      cache.get('key1');

      // Miss
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track eviction statistics', () => {
      config.cacheSize = 1;

      cache.set('key1', createMockAnalysis('analysis-1'));
      cache.set('key2', createMockAnalysis('analysis-2')); // Should evict key1

      const stats = cache.getStats();
      expect(stats.evictionCount).toBe(1);
    });

    it('should calculate average access time', () => {
      const analysis = createMockAnalysis();
      cache.set('key1', analysis);

      // Access multiple times
      cache.get('key1');
      cache.get('key1');

      const stats = cache.getStats();
      expect(stats.averageAccessTime).toBeGreaterThan(0);
    });

    it('should estimate memory usage', () => {
      cache.set('key1', createMockAnalysis('analysis-1'));
      cache.set('key2', createMockAnalysis('analysis-2'));

      const stats = cache.getStats();
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('health status', () => {
    it('should return healthy status for good hit rate', () => {
      const analysis = createMockAnalysis();
      cache.set('key1', analysis);

      // Multiple hits
      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      const health = cache.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.hitRate).toBe(1);
    });

    it('should return degraded status for moderate hit rate', () => {
      const analysis = createMockAnalysis();
      cache.set('key1', analysis);

      // Mix of hits and misses
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const health = cache.getHealthStatus();
      expect(health.status).toBe('degraded');
      expect(health.hitRate).toBe(0.5);
    });

    it('should return unhealthy status for poor hit rate', () => {
      // Mostly misses
      cache.get('non-existent');
      cache.get('non-existent');
      cache.get('non-existent');

      const health = cache.getHealthStatus();
      expect(health.status).toBe('unhealthy');
      expect(health.hitRate).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should clean expired entries', () => {
      const key = 'test-key';
      const expiredAnalysis = {
        ...createMockAnalysis(),
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000))
      };

      // Manually set expired entry
      (cache as any).cache.set(key, {
        analysis: expiredAnalysis,
        timestamp: new Date(Date.now() - (config.cacheTimeout + 1000)),
        accessCount: 1,
        lastAccessed: new Date()
      });

      const cleanedCount = cache.cleanExpired();
      expect(cleanedCount).toBe(1);
      expect(cache.getSize()).toBe(0);
    });

    it('should not clean valid entries', () => {
      const analysis = createMockAnalysis();
      cache.set('key1', analysis);

      const cleanedCount = cache.cleanExpired();
      expect(cleanedCount).toBe(0);
      expect(cache.getSize()).toBe(1);
    });
  });

  describe('reset statistics', () => {
    it('should reset all statistics', () => {
      const analysis = createMockAnalysis();
      cache.set('key1', analysis);
      cache.get('key1');
      cache.get('non-existent');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(0);
      expect(stats.missCount).toBe(0);
      expect(stats.evictionCount).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully in get operation', () => {
      // Mock cache to throw error
      const mockCache = new Map();
      mockCache.get = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      (cache as any).cache = mockCache;

      const result = cache.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully in set operation', () => {
      // Mock cache to throw error
      const mockCache = new Map();
      mockCache.set = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      (cache as any).cache = mockCache;

      // Should not throw
      expect(() => {
        cache.set('test-key', createMockAnalysis());
      }).not.toThrow();
    });

    it('should handle errors gracefully in clear operation', () => {
      // Mock cache to throw error
      const mockCache = new Map();
      mockCache.clear = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      (cache as any).cache = mockCache;

      // Should not throw
      expect(() => {
        cache.clear();
      }).not.toThrow();
    });
  });
}); 