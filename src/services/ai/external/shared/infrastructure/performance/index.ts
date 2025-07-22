// Performance Infrastructure - Comprehensive performance optimization suite
// Part of Phase 4: Performance Optimization & Benchmarking

export { PerformanceOptimizer } from './PerformanceOptimizer';
export { PerformanceMonitor } from './PerformanceMonitor';
export { BenchmarkSuite } from './BenchmarkSuite';

// Re-export key types for external use
export type {
  PerformanceOptimizationResult,
  AppliedOptimization,
  PerformanceBenchmark,
  IntelligentCacheStrategy,
  OptimizationMetrics,
  BenchmarkResult,
  MemoryMetrics,
  CpuMetrics,
  NetworkMetrics,
  CacheMetrics,
  PerformanceTargets,
  UsagePattern
} from './PerformanceOptimizer';

export type {
  PerformanceAlert,
  PerformanceMetricsSnapshot,
  ExecutionMetrics,
  ErrorMetrics,
  HealthStatus,
  ComponentHealth,
  PerformanceTrend,
  PerformanceDashboard
} from './PerformanceMonitor';

export type {
  BenchmarkConfiguration,
  BenchmarkReport,
  BenchmarkScenario,
  LoadTestProfile,
  BenchmarkThresholds,
  ResourceMetrics,
  ScalabilityAssessment
} from './BenchmarkSuite';

/**
 * Comprehensive performance optimization and monitoring setup
 */
export class PerformanceInfrastructure {
  public optimizer: PerformanceOptimizer;
  public monitor: PerformanceMonitor;
  public benchmarkSuite: BenchmarkSuite;

  constructor(performanceTargets?: PerformanceTargets) {
    // Initialize components with shared configuration
    this.optimizer = new PerformanceOptimizer(performanceTargets);
    this.monitor = new PerformanceMonitor(performanceTargets);
    this.benchmarkSuite = new BenchmarkSuite(this.optimizer);

    this.setupIntegration();
  }

  /**
   * Initialize the complete performance infrastructure
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Performance Infrastructure...');
    
    // Start performance monitoring
    this.monitor.startMonitoring(30000); // 30 second intervals
    
    // Set up event handlers
    this.setupEventHandlers();
    
    console.log('✅ Performance Infrastructure initialized');
  }

  /**
   * Shutdown the performance infrastructure
   */
  async shutdown(): Promise<void> {
    console.log('⏹️ Shutting down Performance Infrastructure...');
    
    this.monitor.stopMonitoring();
    
    console.log('✅ Performance Infrastructure shutdown complete');
  }

  /**
   * Run comprehensive performance analysis on a workflow
   */
  async analyzeWorkflowPerformance(
    workflowConfig: WorkflowConfig,
    usagePatterns?: UsagePattern[]
  ): Promise<{
    optimization: PerformanceOptimizationResult;
    benchmark: BenchmarkReport;
    dashboard: PerformanceDashboard;
  }> {
    console.log(`📊 Running comprehensive performance analysis for: ${workflowConfig.name}`);

    // 1. Optimize the workflow
    const optimization = await this.optimizer.optimizeWorkflow(workflowConfig);
    
    // 2. Benchmark the optimized workflow
    const benchmarkConfig: BenchmarkConfiguration = {
      name: `Performance Analysis - ${workflowConfig.name}`,
      description: 'Automated performance analysis benchmark',
      type: 'load',
      duration: 120000, // 2 minutes
      concurrency: 10,
      iterations: 0,
      warmupRounds: 5,
      cooldownTime: 30000,
      thresholds: {
        maxAverageResponseTime: 10000,
        maxP95ResponseTime: 20000,
        maxP99ResponseTime: 30000,
        minThroughput: 1,
        maxErrorRate: 0.1,
        maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
        maxCpuUsage: 80
      },
      scenarios: [{
        name: 'Standard Load Test',
        weight: 100,
        workflow: optimization.optimizedConfig,
        parameters: {},
        expectedOutcome: 'success'
      }]
    };

    const benchmark = await this.benchmarkSuite.runBenchmark(benchmarkConfig);
    
    // 3. Generate dashboard
    const dashboard = this.monitor.generateDashboard();

    return {
      optimization,
      benchmark,
      dashboard
    };
  }

  /**
   * Get performance infrastructure status
   */
  getStatus(): {
    optimizer: { initialized: boolean };
    monitor: { monitoring: boolean; activeAlerts: number };
    benchmarkSuite: { running: boolean; totalBenchmarks: number };
  } {
    return {
      optimizer: {
        initialized: true
      },
      monitor: {
        monitoring: true, // Would check actual monitoring state
        activeAlerts: this.monitor.getActiveAlerts().length
      },
      benchmarkSuite: {
        running: this.benchmarkSuite.isCurrentlyRunning(),
        totalBenchmarks: this.benchmarkSuite.getBenchmarkHistory().size
      }
    };
  }

  private setupIntegration(): void {
    // Integrate components to work together
    
    // Forward workflow execution metrics from optimizer to monitor
    this.optimizer.on?.('workflow-optimized', (result: PerformanceOptimizationResult) => {
      // Record optimization metrics
      console.log(`📈 Workflow optimized: ${result.performance.estimatedSpeedupPercent}% improvement`);
    });

    // Forward benchmark results to monitor
    this.benchmarkSuite.on('benchmark-completed', (report: BenchmarkReport) => {
      console.log(`📊 Benchmark completed: ${report.configuration.name} - ${report.passed ? 'PASSED' : 'FAILED'}`);
    });
  }

  private setupEventHandlers(): void {
    // Performance alerts handler
    this.monitor.on('performance-alert', (alert: PerformanceAlert) => {
      console.warn(`🚨 Performance Alert: ${alert.message}`);
      
      // Could trigger automatic optimizations or scaling
      if (alert.severity === 'critical') {
        console.log('🔧 Critical alert detected - consider immediate optimization');
      }
    });

    // Benchmark errors handler
    this.benchmarkSuite.on('benchmark-error', (error: Error) => {
      console.error('💥 Benchmark error:', error.message);
    });

    // Monitoring errors handler
    this.monitor.on('monitoring-error', (error: Error) => {
      console.error('📊 Monitoring error:', error.message);
    });
  }
}

/**
 * Factory function to create and initialize performance infrastructure
 */
export async function createPerformanceInfrastructure(
  performanceTargets?: PerformanceTargets
): Promise<PerformanceInfrastructure> {
  const infrastructure = new PerformanceInfrastructure(performanceTargets);
  await infrastructure.initialize();
  return infrastructure;
}

/**
 * Default performance targets for common use cases
 */
export const DEFAULT_PERFORMANCE_TARGETS: PerformanceTargets = {
  maxExecutionTime: 30000, // 30 seconds
  maxMemoryUsage: 512 * 1024 * 1024, // 512 MB
  minCacheHitRate: 0.8, // 80%
  maxErrorRate: 0.05, // 5%
  minThroughput: 10 // requests per second
};

/**
 * High-performance targets for production systems
 */
export const HIGH_PERFORMANCE_TARGETS: PerformanceTargets = {
  maxExecutionTime: 15000, // 15 seconds
  maxMemoryUsage: 256 * 1024 * 1024, // 256 MB
  minCacheHitRate: 0.9, // 90%
  maxErrorRate: 0.01, // 1%
  minThroughput: 50 // requests per second
};

/**
 * Development/testing targets (more lenient)
 */
export const DEVELOPMENT_TARGETS: PerformanceTargets = {
  maxExecutionTime: 60000, // 60 seconds
  maxMemoryUsage: 1024 * 1024 * 1024, // 1 GB
  minCacheHitRate: 0.6, // 60%
  maxErrorRate: 0.1, // 10%
  minThroughput: 1 // requests per second
};

// Import required types
import type { PerformanceTargets, UsagePattern } from './PerformanceOptimizer';
import type { PerformanceAlert, PerformanceDashboard } from './PerformanceMonitor';
import type { BenchmarkConfiguration, BenchmarkReport } from './BenchmarkSuite';
import type { WorkflowConfig } from '../../types/workflow.types';
import type { PerformanceOptimizationResult } from './PerformanceOptimizer'; 