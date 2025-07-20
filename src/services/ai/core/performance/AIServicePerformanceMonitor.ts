// AI Service Performance Monitoring
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  AIServicePerformanceMetrics,
  AIServiceConfig,
  PerformanceAlert
} from '../types/AIServiceTypes';
import { getMemoryUsage } from '../../../../utils/performanceUtils';

/**
 * Manages performance monitoring for AI Service components
 */
export class AIServicePerformanceMonitor extends AIServiceComponent {
  private metrics: AIServicePerformanceMetrics;
  private config: AIServiceConfig;
  private alerts: PerformanceAlert[] = [];
  private maxAlerts: number = 100;
  private performanceThresholds: {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    maxCacheMissRate: number;
    maxErrorRate: number;
  };

  constructor(config: AIServiceConfig) {
    super('AIServicePerformanceMonitor');
    this.config = config;
    
    this.performanceThresholds = {
      maxExecutionTime: 5000, // 5 seconds
      maxMemoryUsage: 80, // 80% of available memory
      maxCacheMissRate: 50, // 50% cache miss rate
      maxErrorRate: 10 // 10% error rate
    };

    this.metrics = {
      totalAnalyses: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      totalErrors: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      peakMemoryUsage: 0,
      lastReset: new Date(),
      executionTimes: [],
      memoryUsages: [],
      cacheHitRate: 0,
      errorRate: 0,
      performanceScore: 100
    };
    
    this.log('info', 'AIServicePerformanceMonitor initialized', {
      maxAlerts: this.maxAlerts,
      performanceThresholds: this.performanceThresholds
    });
  }

  /**
   * Record an analysis operation
   */
  recordAnalysis(executionTime: number, memoryUsage: number): void {
    this.log('debug', 'Recording analysis performance', {
      executionTime,
      memoryUsage
    });

    try {
      // Update basic metrics
      this.metrics.totalAnalyses++;
      this.metrics.executionTimes.push(executionTime);
      this.metrics.memoryUsages.push(memoryUsage);

      // Calculate averages
      this.metrics.averageExecutionTime = this.calculateAverage(this.metrics.executionTimes);
      this.metrics.averageMemoryUsage = this.calculateAverage(this.metrics.memoryUsages);

      // Update peak memory usage
      if (memoryUsage > this.metrics.peakMemoryUsage) {
        this.metrics.peakMemoryUsage = memoryUsage;
      }

      // Update cache hit rate
      this.updateCacheHitRate();

      // Update error rate
      this.updateErrorRate();

      // Update performance score
      this.updatePerformanceScore();

      // Check for performance alerts
      this.checkPerformanceAlerts(executionTime, memoryUsage);

      // Maintain data size
      this.maintainDataSize();

    } catch (error) {
      this.handleError(error as Error, 'recordAnalysis', { executionTime, memoryUsage });
    }
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(): void {
    this.log('debug', 'Recording cache hit');
    this.metrics.totalCacheHits++;
    this.updateCacheHitRate();
    this.updatePerformanceScore();
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(): void {
    this.log('debug', 'Recording cache miss');
    this.metrics.totalCacheMisses++;
    this.updateCacheHitRate();
    this.updatePerformanceScore();
  }

  /**
   * Record an error
   */
  recordError(): void {
    this.log('debug', 'Recording error');
    this.metrics.totalErrors++;
    this.updateErrorRate();
    this.updatePerformanceScore();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): AIServicePerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear performance alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    this.log('info', 'Performance alerts cleared');
  }

  /**
   * Reset performance metrics
   */
  reset(): void {
    this.metrics = {
      totalAnalyses: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      totalErrors: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      peakMemoryUsage: 0,
      lastReset: new Date(),
      executionTimes: [],
      memoryUsages: [],
      cacheHitRate: 0,
      errorRate: 0,
      performanceScore: 100
    };
    
    this.alerts = [];
    
    this.log('info', 'Performance metrics reset');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    recommendations: string[];
    alerts: PerformanceAlert[];
  } {
    const score = this.metrics.performanceScore;
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    const recommendations: string[] = [];

    if (score >= 90) {
      status = 'excellent';
    } else if (score >= 75) {
      status = 'good';
    } else if (score >= 60) {
      status = 'fair';
    } else if (score >= 40) {
      status = 'poor';
    } else {
      status = 'critical';
    }

    // Generate recommendations based on metrics
    if (this.metrics.averageExecutionTime > this.performanceThresholds.maxExecutionTime) {
      recommendations.push('High execution times detected. Consider optimizing analysis algorithms or increasing resources.');
    }

    if (this.metrics.averageMemoryUsage > this.performanceThresholds.maxMemoryUsage) {
      recommendations.push('High memory usage detected. Consider implementing memory optimization or increasing available memory.');
    }

    if (this.metrics.cacheHitRate < (100 - this.performanceThresholds.maxCacheMissRate)) {
      recommendations.push('Low cache hit rate detected. Consider improving caching strategies or expanding cache size.');
    }

    if (this.metrics.errorRate > this.performanceThresholds.maxErrorRate) {
      recommendations.push('High error rate detected. Investigate error sources and implement better error handling.');
    }

    return {
      status,
      score,
      recommendations,
      alerts: this.getAlerts()
    };
  }

  /**
   * Set performance thresholds
   */
  setPerformanceThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds = {
      ...this.performanceThresholds,
      ...thresholds
    };
    
    this.log('info', 'Performance thresholds updated', { thresholds: this.performanceThresholds });
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(): {
    executionTimeTrend: 'improving' | 'stable' | 'degrading';
    memoryUsageTrend: 'improving' | 'stable' | 'degrading';
    cacheHitRateTrend: 'improving' | 'stable' | 'degrading';
    errorRateTrend: 'improving' | 'stable' | 'degrading';
  } {
    const recentCount = Math.min(10, this.metrics.executionTimes.length);
    
    if (recentCount < 2) {
      return {
        executionTimeTrend: 'stable',
        memoryUsageTrend: 'stable',
        cacheHitRateTrend: 'stable',
        errorRateTrend: 'stable'
      };
    }

    const recentExecutionTimes = this.metrics.executionTimes.slice(-recentCount);
    const recentMemoryUsages = this.metrics.memoryUsages.slice(-recentCount);

    const executionTimeTrend = this.calculateTrend(recentExecutionTimes);
    const memoryUsageTrend = this.calculateTrend(recentMemoryUsages);
    const cacheHitRateTrend = this.metrics.cacheHitRate > 80 ? 'improving' : 
                             this.metrics.cacheHitRate > 60 ? 'stable' : 'degrading';
    const errorRateTrend = this.metrics.errorRate < 5 ? 'improving' : 
                          this.metrics.errorRate < 10 ? 'stable' : 'degrading';

    return {
      executionTimeTrend,
      memoryUsageTrend,
      cacheHitRateTrend,
      errorRateTrend
    };
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): any {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      summary: this.getPerformanceSummary(),
      trends: this.getPerformanceTrends(),
      thresholds: this.performanceThresholds,
      exportTimestamp: new Date()
    };
  }

  /**
   * Calculate average of an array of numbers
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    const totalCacheOperations = this.metrics.totalCacheHits + this.metrics.totalCacheMisses;
    if (totalCacheOperations > 0) {
      this.metrics.cacheHitRate = (this.metrics.totalCacheHits / totalCacheOperations) * 100;
    }
  }

  /**
   * Update error rate
   */
  private updateErrorRate(): void {
    const totalOperations = this.metrics.totalAnalyses;
    if (totalOperations > 0) {
      this.metrics.errorRate = (this.metrics.totalErrors / totalOperations) * 100;
    }
  }

  /**
   * Update performance score
   */
  private updatePerformanceScore(): void {
    let score = 100;

    // Deduct points for high execution time
    if (this.metrics.averageExecutionTime > this.performanceThresholds.maxExecutionTime) {
      const penalty = Math.min(30, (this.metrics.averageExecutionTime / this.performanceThresholds.maxExecutionTime - 1) * 20);
      score -= penalty;
    }

    // Deduct points for high memory usage
    if (this.metrics.averageMemoryUsage > this.performanceThresholds.maxMemoryUsage) {
      const penalty = Math.min(25, (this.metrics.averageMemoryUsage / this.performanceThresholds.maxMemoryUsage - 1) * 15);
      score -= penalty;
    }

    // Deduct points for low cache hit rate
    if (this.metrics.cacheHitRate < (100 - this.performanceThresholds.maxCacheMissRate)) {
      const penalty = Math.min(20, ((100 - this.performanceThresholds.maxCacheMissRate) - this.metrics.cacheHitRate) * 2);
      score -= penalty;
    }

    // Deduct points for high error rate
    if (this.metrics.errorRate > this.performanceThresholds.maxErrorRate) {
      const penalty = Math.min(25, (this.metrics.errorRate / this.performanceThresholds.maxErrorRate - 1) * 10);
      score -= penalty;
    }

    this.metrics.performanceScore = Math.max(0, Math.round(score));
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(executionTime: number, memoryUsage: number): void {
    const alerts: PerformanceAlert[] = [];

    // Check execution time
    if (executionTime > this.performanceThresholds.maxExecutionTime) {
      alerts.push({
        type: 'execution_time',
        severity: executionTime > this.performanceThresholds.maxExecutionTime * 2 ? 'critical' : 'warning',
        message: `High execution time detected: ${executionTime}ms`,
        timestamp: new Date(),
        data: { executionTime, threshold: this.performanceThresholds.maxExecutionTime }
      });
    }

    // Check memory usage
    if (memoryUsage > this.performanceThresholds.maxMemoryUsage) {
      alerts.push({
        type: 'memory_usage',
        severity: memoryUsage > this.performanceThresholds.maxMemoryUsage * 1.5 ? 'critical' : 'warning',
        message: `High memory usage detected: ${memoryUsage}%`,
        timestamp: new Date(),
        data: { memoryUsage, threshold: this.performanceThresholds.maxMemoryUsage }
      });
    }

    // Check cache hit rate (only if there are cache operations)
    const totalCacheOperations = this.metrics.totalCacheHits + this.metrics.totalCacheMisses;
    if (totalCacheOperations > 0 && this.metrics.cacheHitRate < (100 - this.performanceThresholds.maxCacheMissRate)) {
      alerts.push({
        type: 'cache_performance',
        severity: this.metrics.cacheHitRate < 30 ? 'critical' : 'warning',
        message: `Low cache hit rate: ${this.metrics.cacheHitRate.toFixed(1)}%`,
        timestamp: new Date(),
        data: { cacheHitRate: this.metrics.cacheHitRate, threshold: 100 - this.performanceThresholds.maxCacheMissRate }
      });
    }

    // Check error rate (only if there are analyses)
    if (this.metrics.totalAnalyses > 0 && this.metrics.errorRate > this.performanceThresholds.maxErrorRate) {
      alerts.push({
        type: 'error_rate',
        severity: this.metrics.errorRate > this.performanceThresholds.maxErrorRate * 2 ? 'critical' : 'warning',
        message: `High error rate: ${this.metrics.errorRate.toFixed(1)}%`,
        timestamp: new Date(),
        data: { errorRate: this.metrics.errorRate, threshold: this.performanceThresholds.maxErrorRate }
      });
    }

    // Add new alerts
    this.alerts.push(...alerts);

    // Maintain alert size
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    // Log critical alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      this.log('error', 'Critical performance alerts detected', {
        alerts: criticalAlerts.map(a => ({ type: a.type, message: a.message }))
      });
    }
  }

  /**
   * Maintain data size to prevent memory bloat
   */
  private maintainDataSize(): void {
    const maxDataPoints = 1000;

    if (this.metrics.executionTimes.length > maxDataPoints) {
      this.metrics.executionTimes = this.metrics.executionTimes.slice(-maxDataPoints);
    }

    if (this.metrics.memoryUsages.length > maxDataPoints) {
      this.metrics.memoryUsages = this.metrics.memoryUsages.slice(-maxDataPoints);
    }
  }

  /**
   * Calculate trend from an array of values
   */
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change < -5) return 'improving';
    if (change > 5) return 'degrading';
    return 'stable';
  }
} 