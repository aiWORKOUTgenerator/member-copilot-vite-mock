// Performance Monitor - Real-time performance tracking and alerting
// Part of Phase 4: Performance Optimization & Benchmarking

import { EventEmitter } from 'events';
import {
  BenchmarkResult,
  MemoryMetrics,
  CpuMetrics,
  NetworkMetrics,
  CacheMetrics,
  PerformanceTargets
} from './PerformanceOptimizer';
import { WorkflowConfig, WorkflowResult } from '../../types/workflow.types';

export interface PerformanceAlert {
  id: string;
  type: 'threshold' | 'anomaly' | 'degradation' | 'failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
  workflowId?: string;
  stepId?: string;
  recommendations: string[];
}

export interface PerformanceMetricsSnapshot {
  timestamp: Date;
  workflowId: string;
  metrics: {
    execution: ExecutionMetrics;
    memory: MemoryMetrics;
    cpu: CpuMetrics;
    network: NetworkMetrics;
    cache: CacheMetrics;
    errors: ErrorMetrics;
  };
  health: HealthStatus;
}

export interface ExecutionMetrics {
  totalDuration: number;
  stepDurations: Map<string, number>;
  queueTime: number;
  processingTime: number;
  overhead: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorsByType: Map<string, number>;
  retryCount: number;
  recoveryTime: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'down';
  components: Map<string, ComponentHealth>;
  score: number; // 0-100
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'down';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

export interface PerformanceTrend {
  metric: string;
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  changePercent: number;
  projectedImpact: string;
}

export interface PerformanceDashboard {
  timestamp: Date;
  overview: {
    totalWorkflows: number;
    activeWorkflows: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    uptime: number;
  };
  alerts: PerformanceAlert[];
  trends: PerformanceTrend[];
  topBottlenecks: BottleneckInfo[];
  recommendations: DashboardRecommendation[];
}

export interface BottleneckInfo {
  component: string;
  metric: string;
  impact: 'low' | 'medium' | 'high';
  frequency: number;
  averageDelay: number;
  suggestion: string;
}

export interface DashboardRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'reliability' | 'cost' | 'security';
  title: string;
  description: string;
  estimatedImpact: string;
  actionItems: string[];
}

/**
 * PerformanceMonitor - Comprehensive real-time performance monitoring
 */
export class PerformanceMonitor extends EventEmitter {
  private metricsHistory = new Map<string, PerformanceMetricsSnapshot[]>();
  private alerts = new Map<string, PerformanceAlert>();
  private thresholds: PerformanceTargets;
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private alertBuffer = new Map<string, number>(); // For alert rate limiting

  constructor(thresholds?: PerformanceTargets) {
    super();
    this.thresholds = thresholds || this.getDefaultThresholds();
  }

  // ===== MONITORING CONTROL =====

  /**
   * Start continuous performance monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring is already active');
      return;
    }

    console.log('🔍 Starting performance monitoring...');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
        this.cleanupOldData();
      } catch (error) {
        console.error('Error during performance monitoring:', error);
        this.emit('monitoring-error', error);
      }
    }, intervalMs);

    this.emit('monitoring-started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('⏹️ Stopping performance monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.emit('monitoring-stopped');
  }

  /**
   * Record workflow execution metrics
   */
  async recordWorkflowExecution(
    workflowId: string,
    config: WorkflowConfig,
    result: WorkflowResult,
    executionMetrics: ExecutionMetrics
  ): Promise<void> {
    const snapshot = await this.createMetricsSnapshot(workflowId, executionMetrics);
    this.storeMetrics(workflowId, snapshot);

    // Check for immediate alerts
    const alerts = this.analyzeMetricsForAlerts(snapshot);
    alerts.forEach(alert => this.raiseAlert(alert));

    this.emit('workflow-recorded', { workflowId, snapshot });
  }

  // ===== METRICS COLLECTION =====

  private async collectMetrics(): Promise<void> {
    // Collect system-wide metrics
    const systemMetrics = await this.collectSystemMetrics();
    const timestamp = new Date();

    // Store system metrics
    const snapshot: PerformanceMetricsSnapshot = {
      timestamp,
      workflowId: 'system',
      metrics: {
        execution: {
          totalDuration: 0,
          stepDurations: new Map(),
          queueTime: 0,
          processingTime: 0,
          overhead: 0
        },
        memory: systemMetrics.memory,
        cpu: systemMetrics.cpu,
        network: systemMetrics.network,
        cache: systemMetrics.cache,
        errors: systemMetrics.errors
      },
      health: await this.assessSystemHealth()
    };

    this.storeMetrics('system', snapshot);
    this.emit('metrics-collected', snapshot);
  }

  private async collectSystemMetrics(): Promise<{
    memory: MemoryMetrics;
    cpu: CpuMetrics;
    network: NetworkMetrics;
    cache: CacheMetrics;
    errors: ErrorMetrics;
  }> {
    // In a real implementation, these would collect actual system metrics
    // For now, we'll simulate realistic metrics
    
    const memoryUsage = process.memoryUsage();
    
    return {
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        peak: memoryUsage.heapUsed * 1.2,
        average: memoryUsage.heapUsed * 0.9,
        gcCount: Math.floor(Date.now() / 60000) % 10,
        gcTime: 50
      },
      cpu: {
        averageUsage: 30 + Math.random() * 40, // 30-70%
        peakUsage: 60 + Math.random() * 35, // 60-95%
        userTime: 1000 + Math.random() * 2000,
        systemTime: 500 + Math.random() * 1000,
        idleTime: 8000 + Math.random() * 2000
      },
      network: {
        requestCount: Math.floor(Math.random() * 100),
        totalBytes: Math.floor(Math.random() * 1024 * 1024),
        averageLatency: 100 + Math.random() * 200,
        errorCount: Math.floor(Math.random() * 5),
        retryCount: Math.floor(Math.random() * 3),
        bandwidthUtilization: 0.2 + Math.random() * 0.6
      },
      cache: {
        hitCount: Math.floor(Math.random() * 200),
        missCount: Math.floor(Math.random() * 50),
        hitRate: 0.7 + Math.random() * 0.25,
        averageGetTime: 5 + Math.random() * 10,
        averageSetTime: 10 + Math.random() * 20,
        memoryUsage: Math.floor(Math.random() * 100 * 1024 * 1024),
        evictionCount: Math.floor(Math.random() * 10)
      },
      errors: {
        totalErrors: Math.floor(Math.random() * 10),
        errorRate: Math.random() * 0.1, // 0-10%
        errorsByType: new Map([
          ['timeout', Math.floor(Math.random() * 3)],
          ['network', Math.floor(Math.random() * 2)],
          ['validation', Math.floor(Math.random() * 4)]
        ]),
        retryCount: Math.floor(Math.random() * 5),
        recoveryTime: Math.random() * 5000
      }
    };
  }

  private async createMetricsSnapshot(
    workflowId: string,
    executionMetrics: ExecutionMetrics
  ): Promise<PerformanceMetricsSnapshot> {
    const systemMetrics = await this.collectSystemMetrics();
    
    return {
      timestamp: new Date(),
      workflowId,
      metrics: {
        execution: executionMetrics,
        memory: systemMetrics.memory,
        cpu: systemMetrics.cpu,
        network: systemMetrics.network,
        cache: systemMetrics.cache,
        errors: systemMetrics.errors
      },
      health: await this.assessWorkflowHealth(workflowId, executionMetrics)
    };
  }

  private async assessSystemHealth(): Promise<HealthStatus> {
    const components = new Map<string, ComponentHealth>();
    
    // Assess key components
    components.set('ai-service', {
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: 150 + Math.random() * 100,
      errorRate: Math.random() * 0.05,
      uptime: 0.995 + Math.random() * 0.004
    });
    
    components.set('cache', {
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: 10 + Math.random() * 20,
      errorRate: Math.random() * 0.01,
      uptime: 0.999 + Math.random() * 0.001
    });
    
    components.set('database', {
      status: 'healthy',
      lastCheck: new Date(),
      responseTime: 50 + Math.random() * 100,
      errorRate: Math.random() * 0.02,
      uptime: 0.998 + Math.random() * 0.002
    });

    // Calculate overall health score
    let totalScore = 0;
    components.forEach(component => {
      let componentScore = 100;
      componentScore -= component.errorRate * 1000; // Error rate impact
      componentScore -= Math.max(0, component.responseTime - 100) * 0.1; // Response time impact
      componentScore -= (1 - component.uptime) * 5000; // Uptime impact
      totalScore += Math.max(0, Math.min(100, componentScore));
    });
    
    const averageScore = totalScore / components.size;
    
    return {
      overall: averageScore > 90 ? 'healthy' : averageScore > 70 ? 'degraded' : 'critical',
      components,
      score: averageScore
    };
  }

  private async assessWorkflowHealth(
    workflowId: string,
    metrics: ExecutionMetrics
  ): Promise<HealthStatus> {
    const components = new Map<string, ComponentHealth>();
    
    // Assess workflow-specific health
    components.set('execution', {
      status: metrics.totalDuration < this.thresholds.maxExecutionTime ? 'healthy' : 'degraded',
      lastCheck: new Date(),
      responseTime: metrics.totalDuration,
      errorRate: 0, // Would be calculated from actual execution
      uptime: 1.0
    });

    const score = metrics.totalDuration < this.thresholds.maxExecutionTime ? 90 : 60;
    
    return {
      overall: score > 80 ? 'healthy' : score > 60 ? 'degraded' : 'critical',
      components,
      score
    };
  }

  // ===== ALERTING SYSTEM =====

  private async checkAlerts(): Promise<void> {
    const latestMetrics = this.getLatestSystemMetrics();
    if (!latestMetrics) return;

    const alerts = this.analyzeMetricsForAlerts(latestMetrics);
    alerts.forEach(alert => this.raiseAlert(alert));
  }

  private analyzeMetricsForAlerts(snapshot: PerformanceMetricsSnapshot): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const timestamp = new Date();

    // Memory alerts
    if (snapshot.metrics.memory.heapUsed > this.thresholds.maxMemoryUsage) {
      alerts.push({
        id: `memory-${timestamp.getTime()}`,
        type: 'threshold',
        severity: 'high',
        metric: 'memory.heapUsed',
        value: snapshot.metrics.memory.heapUsed,
        threshold: this.thresholds.maxMemoryUsage,
        message: `Memory usage exceeded threshold: ${Math.round(snapshot.metrics.memory.heapUsed / 1024 / 1024)}MB`,
        timestamp,
        workflowId: snapshot.workflowId,
        recommendations: [
          'Review memory-intensive operations',
          'Implement memory pooling',
          'Consider scaling horizontally'
        ]
      });
    }

    // Execution time alerts
    if (snapshot.metrics.execution.totalDuration > this.thresholds.maxExecutionTime) {
      alerts.push({
        id: `execution-${timestamp.getTime()}`,
        type: 'threshold',
        severity: 'medium',
        metric: 'execution.totalDuration',
        value: snapshot.metrics.execution.totalDuration,
        threshold: this.thresholds.maxExecutionTime,
        message: `Execution time exceeded threshold: ${Math.round(snapshot.metrics.execution.totalDuration / 1000)}s`,
        timestamp,
        workflowId: snapshot.workflowId,
        recommendations: [
          'Optimize slow operations',
          'Implement parallel processing',
          'Add caching where appropriate'
        ]
      });
    }

    // Error rate alerts
    if (snapshot.metrics.errors.errorRate > this.thresholds.maxErrorRate) {
      alerts.push({
        id: `errors-${timestamp.getTime()}`,
        type: 'threshold',
        severity: 'critical',
        metric: 'errors.errorRate',
        value: snapshot.metrics.errors.errorRate,
        threshold: this.thresholds.maxErrorRate,
        message: `Error rate exceeded threshold: ${Math.round(snapshot.metrics.errors.errorRate * 100)}%`,
        timestamp,
        workflowId: snapshot.workflowId,
        recommendations: [
          'Investigate error patterns',
          'Improve error handling',
          'Add circuit breakers'
        ]
      });
    }

    // Cache performance alerts
    if (snapshot.metrics.cache.hitRate < this.thresholds.minCacheHitRate) {
      alerts.push({
        id: `cache-${timestamp.getTime()}`,
        type: 'threshold',
        severity: 'medium',
        metric: 'cache.hitRate',
        value: snapshot.metrics.cache.hitRate,
        threshold: this.thresholds.minCacheHitRate,
        message: `Cache hit rate below threshold: ${Math.round(snapshot.metrics.cache.hitRate * 100)}%`,
        timestamp,
        workflowId: snapshot.workflowId,
        recommendations: [
          'Review cache key strategy',
          'Optimize cache TTL settings',
          'Implement cache warming'
        ]
      });
    }

    return alerts;
  }

  private raiseAlert(alert: PerformanceAlert): void {
    // Rate limiting to prevent alert spam
    const alertKey = `${alert.metric}-${alert.workflowId}`;
    const lastAlertTime = this.alertBuffer.get(alertKey) || 0;
    const now = Date.now();
    
    if (now - lastAlertTime < 300000) { // 5 minutes cooldown
      return;
    }

    this.alertBuffer.set(alertKey, now);
    this.alerts.set(alert.id, alert);

    console.warn(`🚨 Performance Alert: ${alert.message}`);
    this.emit('performance-alert', alert);

    // Auto-resolve alerts after some time
    setTimeout(() => {
      this.resolveAlert(alert.id);
    }, 3600000); // 1 hour
  }

  private resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      this.alerts.delete(alertId);
      this.emit('alert-resolved', alert);
    }
  }

  // ===== TREND ANALYSIS =====

  /**
   * Analyze performance trends over time
   */
  analyzeTrends(timeframe: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];
    const cutoffTime = this.getTimeframeCutoff(timeframe);

    // Analyze trends for key metrics
    const metrics = ['execution.totalDuration', 'memory.heapUsed', 'errors.errorRate', 'cache.hitRate'];
    
    metrics.forEach(metric => {
      const trend = this.analyzeSingleMetricTrend(metric, cutoffTime, timeframe);
      if (trend) {
        trends.push(trend);
      }
    });

    return trends;
  }

  private analyzeSingleMetricTrend(
    metric: string,
    cutoffTime: Date,
    timeframe: '1h' | '6h' | '24h' | '7d' | '30d'
  ): PerformanceTrend | null {
    const allMetrics = Array.from(this.metricsHistory.values())
      .flat()
      .filter(snapshot => snapshot.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (allMetrics.length < 2) return null;

    const values = allMetrics.map(snapshot => this.extractMetricValue(snapshot, metric));
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    let trend: 'improving' | 'stable' | 'degrading' | 'critical';
    if (Math.abs(changePercent) < 5) {
      trend = 'stable';
    } else if (this.isImprovingMetric(metric)) {
      trend = changePercent > 0 ? 'improving' : changePercent > -20 ? 'degrading' : 'critical';
    } else {
      trend = changePercent < 0 ? 'improving' : changePercent < 20 ? 'degrading' : 'critical';
    }

    return {
      metric,
      timeframe,
      trend,
      changePercent: Math.round(changePercent),
      projectedImpact: this.generateTrendProjection(metric, changePercent, trend)
    };
  }

  private extractMetricValue(snapshot: PerformanceMetricsSnapshot, metric: string): number {
    const parts = metric.split('.');
    let value: any = snapshot.metrics;
    
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private isImprovingMetric(metric: string): boolean {
    // Some metrics are better when they increase (cache.hitRate)
    // Others are better when they decrease (errors.errorRate, execution.totalDuration)
    const improvingWhenIncreasing = ['cache.hitRate', 'throughput'];
    return improvingWhenIncreasing.some(pattern => metric.includes(pattern));
  }

  private generateTrendProjection(metric: string, changePercent: number, trend: string): string {
    if (trend === 'stable') {
      return 'Performance remains stable';
    }
    
    const direction = changePercent > 0 ? 'increasing' : 'decreasing';
    const magnitude = Math.abs(changePercent);
    
    if (magnitude > 20) {
      return `Significant ${direction} trend may impact system performance`;
    } else if (magnitude > 10) {
      return `Moderate ${direction} trend requires monitoring`;
    } else {
      return `Minor ${direction} trend within acceptable range`;
    }
  }

  // ===== DASHBOARD & REPORTING =====

  /**
   * Generate performance dashboard data
   */
  generateDashboard(): PerformanceDashboard {
    const latestMetrics = this.getLatestSystemMetrics();
    const activeAlerts = Array.from(this.alerts.values());
    const trends = this.analyzeTrends('24h');
    
    return {
      timestamp: new Date(),
      overview: this.generateOverview(latestMetrics),
      alerts: activeAlerts,
      trends,
      topBottlenecks: this.identifyTopBottlenecks(),
      recommendations: this.generateDashboardRecommendations(activeAlerts, trends)
    };
  }

  private generateOverview(latestMetrics: PerformanceMetricsSnapshot | null): any {
    if (!latestMetrics) {
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        uptime: 0
      };
    }

    return {
      totalWorkflows: this.metricsHistory.size,
      activeWorkflows: this.countActiveWorkflows(),
      averageResponseTime: latestMetrics.metrics.execution.totalDuration,
      errorRate: latestMetrics.metrics.errors.errorRate,
      throughput: this.calculateCurrentThroughput(),
      uptime: latestMetrics.health.score / 100
    };
  }

  private identifyTopBottlenecks(): BottleneckInfo[] {
    // Analyze historical data to identify common bottlenecks
    const bottlenecks: BottleneckInfo[] = [
      {
        component: 'AI Service',
        metric: 'Response Time',
        impact: 'high',
        frequency: 15,
        averageDelay: 5000,
        suggestion: 'Implement request batching and caching'
      },
      {
        component: 'Database Queries',
        metric: 'Query Time',
        impact: 'medium',
        frequency: 8,
        averageDelay: 2000,
        suggestion: 'Add database indexes and query optimization'
      }
    ];

    return bottlenecks.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      return impactWeight[b.impact] * b.frequency - impactWeight[a.impact] * a.frequency;
    });
  }

  private generateDashboardRecommendations(
    alerts: PerformanceAlert[],
    trends: PerformanceTrend[]
  ): DashboardRecommendation[] {
    const recommendations: DashboardRecommendation[] = [];

    // Recommendations based on alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'performance',
        title: 'Address Critical Performance Issues',
        description: `${criticalAlerts.length} critical alerts require immediate attention`,
        estimatedImpact: 'Potential service degradation or outages',
        actionItems: criticalAlerts.slice(0, 3).map(a => a.message)
      });
    }

    // Recommendations based on trends
    const degradingTrends = trends.filter(t => t.trend === 'degrading' || t.trend === 'critical');
    if (degradingTrends.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Performance Degradation Detected',
        description: `${degradingTrends.length} metrics showing degrading trends`,
        estimatedImpact: 'Gradual performance degradation over time',
        actionItems: degradingTrends.map(t => `Monitor and optimize ${t.metric}`)
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // ===== UTILITY METHODS =====

  private storeMetrics(workflowId: string, snapshot: PerformanceMetricsSnapshot): void {
    if (!this.metricsHistory.has(workflowId)) {
      this.metricsHistory.set(workflowId, []);
    }

    const history = this.metricsHistory.get(workflowId)!;
    history.push(snapshot);

    // Keep only recent metrics (last 1000 entries)
    if (history.length > 1000) {
      history.shift();
    }
  }

  private getLatestSystemMetrics(): PerformanceMetricsSnapshot | null {
    const systemHistory = this.metricsHistory.get('system');
    return systemHistory && systemHistory.length > 0 
      ? systemHistory[systemHistory.length - 1] 
      : null;
  }

  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    this.metricsHistory.forEach((history, workflowId) => {
      const filteredHistory = history.filter(snapshot => snapshot.timestamp >= cutoffTime);
      this.metricsHistory.set(workflowId, filteredHistory);
    });
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = Date.now();
    const cutoffs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    return new Date(now - cutoffs[timeframe]);
  }

  private countActiveWorkflows(): number {
    // Count workflows that have recorded metrics recently (last 5 minutes)
    const recentTime = new Date(Date.now() - 5 * 60 * 1000);
    let activeCount = 0;

    this.metricsHistory.forEach((history, workflowId) => {
      if (workflowId !== 'system' && history.length > 0) {
        const latest = history[history.length - 1];
        if (latest.timestamp >= recentTime) {
          activeCount++;
        }
      }
    });

    return activeCount;
  }

  private calculateCurrentThroughput(): number {
    // Calculate throughput based on recent workflow completions
    const recentTime = new Date(Date.now() - 60 * 1000); // Last minute
    let completions = 0;

    this.metricsHistory.forEach((history, workflowId) => {
      if (workflowId !== 'system') {
        const recentCompletions = history.filter(snapshot => snapshot.timestamp >= recentTime);
        completions += recentCompletions.length;
      }
    });

    return completions; // Workflows per minute
  }

  private getDefaultThresholds(): PerformanceTargets {
    return {
      maxExecutionTime: 30000, // 30 seconds
      maxMemoryUsage: 512 * 1024 * 1024, // 512 MB
      minCacheHitRate: 0.8, // 80%
      maxErrorRate: 0.05, // 5%
      minThroughput: 10 // requests per second
    };
  }

  // ===== PUBLIC API =====

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<HealthStatus> {
    return await this.assessSystemHealth();
  }

  /**
   * Get active performance alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get performance metrics for a specific workflow
   */
  getWorkflowMetrics(workflowId: string): PerformanceMetricsSnapshot[] {
    return this.metricsHistory.get(workflowId) || [];
  }

  /**
   * Get performance summary statistics
   */
  getPerformanceSummary(): {
    totalWorkflows: number;
    totalMetrics: number;
    activeAlerts: number;
    averageHealth: number;
  } {
    let totalMetrics = 0;
    this.metricsHistory.forEach(history => {
      totalMetrics += history.length;
    });

    const latestHealth = this.getLatestSystemMetrics()?.health?.score || 0;

    return {
      totalWorkflows: this.metricsHistory.size,
      totalMetrics,
      activeAlerts: this.alerts.size,
      averageHealth: latestHealth
    };
  }
}

export { PerformanceMonitor }; 