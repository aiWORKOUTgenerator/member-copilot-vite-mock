// Tests for AIServicePerformanceMonitor
import { AIServicePerformanceMonitor } from '../AIServicePerformanceMonitor';
import { AIServiceConfig } from '../../types/AIServiceTypes';

describe('AIServicePerformanceMonitor', () => {
  let performanceMonitor: AIServicePerformanceMonitor;
  let config: AIServiceConfig;

  beforeEach(() => {
    config = {
      enableValidation: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 1000,
      cacheTimeout: 5 * 60 * 1000,
      maxRetries: 3,
      fallbackToLegacy: true
    };

    performanceMonitor = new AIServicePerformanceMonitor(config);
  });

  describe('Performance Recording', () => {
    it('should record analysis performance correctly', () => {
      const executionTime = 1500;
      const memoryUsage = 65;

      performanceMonitor.recordAnalysis(executionTime, memoryUsage);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBe(1);
      expect(metrics.averageExecutionTime).toBe(executionTime);
      expect(metrics.averageMemoryUsage).toBe(memoryUsage);
      expect(metrics.peakMemoryUsage).toBe(memoryUsage);
      expect(metrics.executionTimes).toContain(executionTime);
      expect(metrics.memoryUsages).toContain(memoryUsage);
    });

    it('should record cache hits and misses correctly', () => {
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordCacheMiss();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.totalCacheHits).toBe(2);
      expect(metrics.totalCacheMisses).toBe(1);
      expect(metrics.cacheHitRate).toBe((2 / 3) * 100); // 66.67%
    });

    it('should record errors correctly', () => {
      performanceMonitor.recordError();
      performanceMonitor.recordError();
      performanceMonitor.recordAnalysis(1000, 50);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.totalErrors).toBe(2);
      expect(metrics.totalAnalyses).toBe(1);
      expect(metrics.errorRate).toBe((2 / 1) * 100); // 200% (2 errors for 1 analysis)
    });

    it('should calculate averages correctly', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordAnalysis(2000, 75);
      performanceMonitor.recordAnalysis(1500, 60);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.averageExecutionTime).toBe(1500); // (1000 + 2000 + 1500) / 3
      expect(metrics.averageMemoryUsage).toBeCloseTo(61.67, 1); // (50 + 75 + 60) / 3
    });

    it('should track peak memory usage', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordAnalysis(2000, 75);
      performanceMonitor.recordAnalysis(1500, 60);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.peakMemoryUsage).toBe(75);
    });
  });

  describe('Performance Metrics', () => {
    it('should get current performance metrics', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordError();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalAnalyses).toBe(1);
      expect(metrics.totalCacheHits).toBe(1);
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.averageExecutionTime).toBe(1000);
      expect(metrics.averageMemoryUsage).toBe(50);
      expect(metrics.peakMemoryUsage).toBe(50);
      expect(metrics.lastReset).toBeInstanceOf(Date);
      expect(metrics.executionTimes).toBeInstanceOf(Array);
      expect(metrics.memoryUsages).toBeInstanceOf(Array);
      expect(metrics.cacheHitRate).toBe(100);
      expect(metrics.errorRate).toBe(100);
      expect(metrics.performanceScore).toBeGreaterThan(0);
    });

    it('should reset performance metrics', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordError();

      performanceMonitor.reset();

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.totalAnalyses).toBe(0);
      expect(metrics.totalCacheHits).toBe(0);
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.averageExecutionTime).toBe(0);
      expect(metrics.averageMemoryUsage).toBe(0);
      expect(metrics.peakMemoryUsage).toBe(0);
      expect(metrics.executionTimes).toHaveLength(0);
      expect(metrics.memoryUsages).toHaveLength(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.performanceScore).toBe(100);
    });
  });

  describe('Performance Alerts', () => {
    it('should generate performance alerts for high execution time', () => {
      performanceMonitor.recordAnalysis(6000, 50); // Above 5 second threshold

      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      
      const executionTimeAlert = alerts.find(alert => alert.type === 'execution_time');
      expect(executionTimeAlert).toBeDefined();
      expect(executionTimeAlert?.severity).toBe('warning');
      expect(executionTimeAlert?.message).toContain('6000ms');
    });

    it('should generate critical alerts for very high execution time', () => {
      performanceMonitor.recordAnalysis(12000, 50); // Above 10 second threshold (2x)

      const alerts = performanceMonitor.getAlerts();
      const executionTimeAlert = alerts.find(alert => alert.type === 'execution_time');
      expect(executionTimeAlert?.severity).toBe('critical');
    });

    it('should generate performance alerts for high memory usage', () => {
      performanceMonitor.recordAnalysis(1000, 85); // Above 80% threshold

      const alerts = performanceMonitor.getAlerts();
      const memoryAlert = alerts.find(alert => alert.type === 'memory_usage');
      expect(memoryAlert).toBeDefined();
      expect(memoryAlert?.severity).toBe('warning');
      expect(memoryAlert?.message).toContain('85%');
    });

    it('should generate performance alerts for low cache hit rate', () => {
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordCacheHit(); // 33% hit rate, below 50% threshold

      const alerts = performanceMonitor.getAlerts();
      const cacheAlert = alerts.find(alert => alert.type === 'cache_performance');
      expect(cacheAlert).toBeDefined();
      expect(cacheAlert?.severity).toBe('warning');
    });

    it('should generate performance alerts for high error rate', () => {
      performanceMonitor.recordError();
      performanceMonitor.recordError();
      performanceMonitor.recordAnalysis(1000, 50); // 200% error rate, above 10% threshold

      const alerts = performanceMonitor.getAlerts();
      const errorAlert = alerts.find(alert => alert.type === 'error_rate');
      expect(errorAlert).toBeDefined();
      expect(errorAlert?.severity).toBe('critical'); // Above 20% threshold
    });

    it('should clear performance alerts', () => {
      performanceMonitor.recordAnalysis(6000, 50);
      expect(performanceMonitor.getAlerts().length).toBeGreaterThan(0);

      performanceMonitor.clearAlerts();
      expect(performanceMonitor.getAlerts().length).toBe(0);
    });
  });

  describe('Performance Summary', () => {
    it('should get performance summary with excellent status', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordCacheHit();

      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary.status).toBe('excellent');
      expect(summary.score).toBeGreaterThanOrEqual(90);
      expect(summary.recommendations).toBeInstanceOf(Array);
      expect(summary.alerts).toBeInstanceOf(Array);
    });

    it('should get performance summary with poor status', () => {
      performanceMonitor.recordAnalysis(6000, 85); // High execution time and memory usage
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordError();
      performanceMonitor.recordError();

      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary.status).toBe('poor');
      expect(summary.score).toBeLessThan(60);
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate appropriate recommendations', () => {
      performanceMonitor.recordAnalysis(6000, 85); // High execution time and memory usage
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordCacheMiss();
      performanceMonitor.recordError();

      const summary = performanceMonitor.getPerformanceSummary();
      expect(summary.recommendations).toContain('High execution times detected');
      expect(summary.recommendations).toContain('High memory usage detected');
      expect(summary.recommendations).toContain('Low cache hit rate detected');
      expect(summary.recommendations).toContain('High error rate detected');
    });
  });

  describe('Performance Trends', () => {
    it('should calculate performance trends correctly', () => {
      // Record improving performance
      performanceMonitor.recordAnalysis(2000, 70);
      performanceMonitor.recordAnalysis(1500, 65);
      performanceMonitor.recordAnalysis(1000, 60);

      const trends = performanceMonitor.getPerformanceTrends();
      expect(trends.executionTimeTrend).toBe('improving');
      expect(trends.memoryUsageTrend).toBe('improving');
    });

    it('should handle stable trends', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordAnalysis(1050, 52);
      performanceMonitor.recordAnalysis(950, 48);

      const trends = performanceMonitor.getPerformanceTrends();
      expect(trends.executionTimeTrend).toBe('stable');
      expect(trends.memoryUsageTrend).toBe('stable');
    });

    it('should handle degrading trends', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordAnalysis(1500, 60);
      performanceMonitor.recordAnalysis(2000, 70);

      const trends = performanceMonitor.getPerformanceTrends();
      expect(trends.executionTimeTrend).toBe('degrading');
      expect(trends.memoryUsageTrend).toBe('degrading');
    });
  });

  describe('Configuration', () => {
    it('should set performance thresholds', () => {
      const newThresholds = {
        maxExecutionTime: 3000,
        maxMemoryUsage: 70,
        maxCacheMissRate: 30,
        maxErrorRate: 5
      };

      performanceMonitor.setPerformanceThresholds(newThresholds);

      // Record performance that would trigger alerts with new thresholds
      performanceMonitor.recordAnalysis(4000, 75); // Above new thresholds

      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('Data Export', () => {
    it('should export performance data', () => {
      performanceMonitor.recordAnalysis(1000, 50);
      performanceMonitor.recordCacheHit();
      performanceMonitor.recordError();

      const exportData = performanceMonitor.exportPerformanceData();
      expect(exportData).toBeDefined();
      expect(exportData.metrics).toBeDefined();
      expect(exportData.alerts).toBeDefined();
      expect(exportData.summary).toBeDefined();
      expect(exportData.trends).toBeDefined();
      expect(exportData.thresholds).toBeDefined();
      expect(exportData.exportTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('Data Management', () => {
    it('should maintain data size to prevent memory bloat', () => {
      // Record more than 1000 data points
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.recordAnalysis(1000, 50);
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.executionTimes.length).toBeLessThanOrEqual(1000);
      expect(metrics.memoryUsages.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during performance recording gracefully', () => {
      // This would be tested with actual error scenarios in a real implementation
      expect(() => {
        performanceMonitor.recordAnalysis(1000, 50);
      }).not.toThrow();
    });
  });
}); 