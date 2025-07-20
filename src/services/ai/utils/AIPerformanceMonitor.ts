// AI Performance Monitor - Tracks service health and performance metrics
import { AIInteraction } from '../core/AIService';

export interface PerformanceMetrics {
  averageExecutionTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  throughput: number;
  responseTimeP95: number;
  responseTimeP99: number;
}

export interface PerformanceAlert {
  type: 'performance_degradation' | 'high_error_rate' | 'memory_leak' | 'cache_miss_spike';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: any;
}

export class AIPerformanceMonitor {
  private executionTimes: number[] = [];
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private errorCount: number = 0;
  private totalRequests: number = 0;
  private memoryUsages: number[] = [];
  private requestTimestamps: Date[] = [];
  private alerts: PerformanceAlert[] = [];
  
  // Performance thresholds
  private readonly THRESHOLDS = {
    MAX_EXECUTION_TIME: 200, // ms
    MIN_CACHE_HIT_RATE: 0.7, // 70%
    MAX_ERROR_RATE: 0.05, // 5%
    MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB
    MIN_THROUGHPUT: 10, // requests per second
    P95_THRESHOLD: 150, // ms
    P99_THRESHOLD: 300  // ms
  };
  
  private readonly WINDOW_SIZE = 1000; // Keep last 1000 measurements
  
  /**
   * Record analysis performance
   */
  recordAnalysis(metrics: {
    totalExecutionTime: number;
    cacheHitRate: number;
    memoryPeakUsage: number;
  }): void {
    this.executionTimes.push(metrics.totalExecutionTime);
    this.memoryUsages.push(metrics.memoryPeakUsage);
    this.requestTimestamps.push(new Date());
    this.totalRequests++;
    
    // Maintain window size
    if (this.executionTimes.length > this.WINDOW_SIZE) {
      this.executionTimes.shift();
      this.memoryUsages.shift();
      this.requestTimestamps.shift();
    }
    
    // Check for performance issues
    this.checkPerformanceThresholds(metrics);
  }
  
  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }
  
  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }
  
  /**
   * Record error
   */
  recordError(error: Error, context?: any): void {
    this.errorCount++;
    
    // Check error rate threshold
    const errorRate = this.getErrorRate();
    if (errorRate > this.THRESHOLDS.MAX_ERROR_RATE) {
      this.addAlert({
        type: 'high_error_rate',
        severity: 'critical',
        message: `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${(this.THRESHOLDS.MAX_ERROR_RATE * 100).toFixed(1)}%`,
        timestamp: new Date(),
        metrics: { errorRate, totalErrors: this.errorCount, totalRequests: this.totalRequests }
      });
    }
  }
  
  /**
   * Record user interaction
   */
  recordInteraction(interaction: AIInteraction): void {
    if (interaction.performanceMetrics) {
      this.recordAnalysis({
        totalExecutionTime: interaction.performanceMetrics.executionTime,
        cacheHitRate: interaction.performanceMetrics.cacheHit ? 1 : 0,
        memoryPeakUsage: interaction.performanceMetrics.memoryUsage
      });
    }
    
    if (interaction.action === 'error_occurred') {
      this.recordError(new Error(interaction.errorDetails?.message || 'Unknown error'));
    }
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const cacheHitRate = this.getCacheHitRate();
    const errorRate = this.getErrorRate();
    const avgExecutionTime = this.getAverageExecutionTime();
    const throughput = this.getThroughput();
    
    return {
      averageExecutionTime: avgExecutionTime,
      cacheHitRate,
      errorRate,
      memoryUsage: this.getAverageMemoryUsage(),
      throughput,
      responseTimeP95: this.getPercentile(95),
      responseTimeP99: this.getPercentile(99)
    };
  }
  
  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? this.cacheHits / total : 0;
  }
  
  /**
   * Get error rate
   */
  getErrorRate(): number {
    return this.totalRequests > 0 ? this.errorCount / this.totalRequests : 0;
  }
  
  /**
   * Get average execution time
   */
  getAverageExecutionTime(): number {
    if (this.executionTimes.length === 0) return 0;
    return this.executionTimes.reduce((sum, time) => sum + time, 0) / this.executionTimes.length;
  }
  
  /**
   * Get average memory usage
   */
  getAverageMemoryUsage(): number {
    if (this.memoryUsages.length === 0) return 0;
    return this.memoryUsages.reduce((sum, usage) => sum + usage, 0) / this.memoryUsages.length;
  }
  
  /**
   * Get throughput (requests per second)
   */
  getThroughput(): number {
    if (this.requestTimestamps.length < 2) return 0;
    
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1000);
    
    const recentRequests = this.requestTimestamps.filter(timestamp => timestamp > oneSecondAgo);
    return recentRequests.length;
  }
  
  /**
   * Get percentile response time
   */
  getPercentile(percentile: number): number {
    if (this.executionTimes.length === 0) return 0;
    
    const sorted = [...this.executionTimes].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  
  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get cache eviction rate
   */
  getCacheEvictionRate(): number {
    // For now, return a simple calculation based on cache misses
    // In a real implementation, this would track actual evictions
    const totalCacheOperations = this.cacheHits + this.cacheMisses;
    if (totalCacheOperations === 0) return 0;
    
    // Estimate eviction rate as a percentage of cache misses
    // This is a simplified approach - in practice, you'd track actual evictions
    return this.cacheMisses / totalCacheOperations * 0.1; // Assume 10% of misses are due to evictions
  }
  
  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThan: Date): void {
    this.alerts = this.alerts.filter(alert => alert.timestamp > olderThan);
  }
  
  /**
   * Reset metrics
   */
  reset(): void {
    this.executionTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.errorCount = 0;
    this.totalRequests = 0;
    this.memoryUsages = [];
    this.requestTimestamps = [];
    this.alerts = [];
  }
  
  /**
   * Get health status
   */
  getHealthStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const metrics = this.getMetrics();
    
    // Check critical thresholds
    if (metrics.errorRate > this.THRESHOLDS.MAX_ERROR_RATE * 2 ||
        metrics.averageExecutionTime > this.THRESHOLDS.MAX_EXECUTION_TIME * 2 ||
        metrics.cacheHitRate < this.THRESHOLDS.MIN_CACHE_HIT_RATE * 0.5) {
      return 'unhealthy';
    }
    
    // Check warning thresholds
    if (metrics.errorRate > this.THRESHOLDS.MAX_ERROR_RATE ||
        metrics.averageExecutionTime > this.THRESHOLDS.MAX_EXECUTION_TIME ||
        metrics.cacheHitRate < this.THRESHOLDS.MIN_CACHE_HIT_RATE) {
      return 'degraded';
    }
    
    return 'healthy';
  }
  
  /**
   * Get performance report
   */
  getReport(): {
    summary: PerformanceMetrics;
    health: 'healthy' | 'degraded' | 'unhealthy';
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const health = this.getHealthStatus();
    const alerts = this.getAlerts();
    const recommendations = this.generateRecommendations(metrics);
    
    return {
      summary: metrics,
      health,
      alerts,
      recommendations
    };
  }
  
  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageExecutionTime > this.THRESHOLDS.MAX_EXECUTION_TIME) {
      recommendations.push('Consider optimizing AI analysis algorithms or increasing cache size');
    }
    
    if (metrics.cacheHitRate < this.THRESHOLDS.MIN_CACHE_HIT_RATE) {
      recommendations.push('Increase cache timeout or optimize cache key generation');
    }
    
    if (metrics.errorRate > this.THRESHOLDS.MAX_ERROR_RATE) {
      recommendations.push('Review error logs and implement better error handling');
    }
    
    if (metrics.memoryUsage > this.THRESHOLDS.MAX_MEMORY_USAGE) {
      recommendations.push('Implement memory cleanup or reduce cache size');
    }
    
    if (metrics.throughput < this.THRESHOLDS.MIN_THROUGHPUT) {
      recommendations.push('Consider implementing request batching or async processing');
    }
    
    if (metrics.responseTimeP95 > this.THRESHOLDS.P95_THRESHOLD) {
      recommendations.push('Optimize slow requests or implement request prioritization');
    }
    
    return recommendations;
  }
  
  /**
   * Check performance thresholds and generate alerts
   */
  private checkPerformanceThresholds(metrics: {
    totalExecutionTime: number;
    cacheHitRate: number;
    memoryPeakUsage: number;
  }): void {
    // Check execution time
    if (metrics.totalExecutionTime > this.THRESHOLDS.MAX_EXECUTION_TIME) {
      this.addAlert({
        type: 'performance_degradation',
        severity: 'warning',
        message: `Execution time ${metrics.totalExecutionTime.toFixed(1)}ms exceeds threshold ${this.THRESHOLDS.MAX_EXECUTION_TIME}ms`,
        timestamp: new Date(),
        metrics: { executionTime: metrics.totalExecutionTime }
      });
    }
    
    // Check memory usage
    if (metrics.memoryPeakUsage > this.THRESHOLDS.MAX_MEMORY_USAGE) {
      this.addAlert({
        type: 'memory_leak',
        severity: 'critical',
        message: `Memory usage ${(metrics.memoryPeakUsage / 1024 / 1024).toFixed(1)}MB exceeds threshold ${(this.THRESHOLDS.MAX_MEMORY_USAGE / 1024 / 1024).toFixed(1)}MB`,
        timestamp: new Date(),
        metrics: { memoryUsage: metrics.memoryPeakUsage }
      });
    }
    
    // Check cache hit rate
    const cacheHitRate = this.getCacheHitRate();
    if (cacheHitRate < this.THRESHOLDS.MIN_CACHE_HIT_RATE) {
      this.addAlert({
        type: 'cache_miss_spike',
        severity: 'warning',
        message: `Cache hit rate ${(cacheHitRate * 100).toFixed(1)}% below threshold ${(this.THRESHOLDS.MIN_CACHE_HIT_RATE * 100).toFixed(1)}%`,
        timestamp: new Date(),
        metrics: { cacheHitRate }
      });
    }
  }
  
  /**
   * Add alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Limit alerts to prevent memory issues
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error('AI Performance Alert:', alert);
    } else {
      console.warn('AI Performance Alert:', alert);
    }
  }
} 