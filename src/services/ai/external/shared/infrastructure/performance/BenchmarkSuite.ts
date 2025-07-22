// Benchmark Suite - Comprehensive automated performance testing
// Part of Phase 4: Performance Optimization & Benchmarking

import { EventEmitter } from 'events';
import {
  WorkflowConfig,
  WorkflowResult,
  WorkflowStep
} from '../../types/workflow.types';
import {
  BenchmarkResult,
  BenchmarkComparison,
  PerformanceOptimizer,
  MemoryMetrics,
  CpuMetrics,
  NetworkMetrics,
  CacheMetrics
} from './PerformanceOptimizer';

export interface BenchmarkConfiguration {
  name: string;
  description: string;
  type: 'load' | 'stress' | 'endurance' | 'spike' | 'volume' | 'regression';
  duration: number; // milliseconds
  concurrency: number;
  iterations: number;
  warmupRounds: number;
  cooldownTime: number;
  thresholds: BenchmarkThresholds;
  scenarios: BenchmarkScenario[];
}

export interface BenchmarkScenario {
  name: string;
  weight: number; // Percentage of total load
  workflow: WorkflowConfig;
  parameters: Record<string, any>;
  expectedOutcome: 'success' | 'failure' | 'timeout';
}

export interface BenchmarkThresholds {
  maxAverageResponseTime: number;
  maxP95ResponseTime: number;
  maxP99ResponseTime: number;
  minThroughput: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
}

export interface BenchmarkReport {
  configuration: BenchmarkConfiguration;
  execution: BenchmarkExecution;
  results: BenchmarkResults;
  analysis: BenchmarkAnalysis;
  recommendations: BenchmarkRecommendation[];
  timestamp: Date;
  passed: boolean;
}

export interface BenchmarkExecution {
  startTime: Date;
  endTime: Date;
  actualDuration: number;
  actualIterations: number;
  interruptedReason?: string;
}

export interface BenchmarkResults {
  summary: ResultSummary;
  responseTime: ResponseTimeMetrics;
  throughput: ThroughputMetrics;
  resources: ResourceMetrics;
  errors: ErrorMetrics;
  scenarios: ScenarioResults[];
}

export interface ResultSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutRequests: number;
  averageResponseTime: number;
  totalDataTransferred: number;
}

export interface ResponseTimeMetrics {
  min: number;
  max: number;
  average: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
  standardDeviation: number;
  distribution: ResponseTimeDistribution[];
}

export interface ResponseTimeDistribution {
  bucket: string; // e.g., "0-100ms"
  count: number;
  percentage: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  requestsPerMinute: number;
  peakThroughput: number;
  averageThroughput: number;
  throughputOverTime: ThroughputDataPoint[];
}

export interface ThroughputDataPoint {
  timestamp: Date;
  requestsPerSecond: number;
  concurrentUsers: number;
}

export interface ResourceMetrics {
  cpu: CpuUtilization;
  memory: MemoryUtilization;
  network: NetworkUtilization;
  disk: DiskUtilization;
}

export interface CpuUtilization {
  average: number;
  peak: number;
  samples: CpuSample[];
}

export interface MemoryUtilization {
  average: number;
  peak: number;
  samples: MemorySample[];
}

export interface NetworkUtilization {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  averageBandwidth: number;
}

export interface DiskUtilization {
  reads: number;
  writes: number;
  bytesRead: number;
  bytesWritten: number;
  averageIOPS: number;
}

export interface CpuSample {
  timestamp: Date;
  usage: number;
}

export interface MemorySample {
  timestamp: Date;
  used: number;
  total: number;
}

export interface ScenarioResults {
  scenario: BenchmarkScenario;
  requests: number;
  successRate: number;
  averageResponseTime: number;
  throughput: number;
  errors: string[];
}

export interface BenchmarkAnalysis {
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  bottlenecks: BottleneckAnalysis[];
  scalabilityAssessment: ScalabilityAssessment;
  regressionAnalysis?: RegressionAnalysis;
  comparison?: BenchmarkComparison;
}

export interface BottleneckAnalysis {
  component: 'cpu' | 'memory' | 'network' | 'io' | 'application' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  suggestions: string[];
}

export interface ScalabilityAssessment {
  currentCapacity: number;
  projectedMaxCapacity: number;
  scalabilityFactor: number;
  limitingFactor: string;
  recommendations: string[];
}

export interface RegressionAnalysis {
  baselineBenchmark: string;
  performanceChange: number; // Percentage change
  regressionDetected: boolean;
  significantChanges: string[];
}

export interface BenchmarkRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'scalability' | 'reliability' | 'optimization';
  title: string;
  description: string;
  implementation: string;
  estimatedImpact: string;
}

export interface LoadTestProfile {
  name: string;
  rampUpTime: number;
  steadyStateTime: number;
  rampDownTime: number;
  maxConcurrency: number;
  loadPattern: 'linear' | 'exponential' | 'step' | 'spike' | 'sawtooth';
}

/**
 * BenchmarkSuite - Comprehensive automated performance testing
 */
export class BenchmarkSuite extends EventEmitter {
  private results = new Map<string, BenchmarkReport[]>();
  private isRunning = false;
  private currentBenchmark?: BenchmarkConfiguration;
  private performanceOptimizer: PerformanceOptimizer;

  constructor(performanceOptimizer?: PerformanceOptimizer) {
    super();
    this.performanceOptimizer = performanceOptimizer || new PerformanceOptimizer();
  }

  // ===== BENCHMARK EXECUTION =====

  /**
   * Run a comprehensive benchmark suite
   */
  async runBenchmark(config: BenchmarkConfiguration): Promise<BenchmarkReport> {
    if (this.isRunning) {
      throw new Error('Another benchmark is already running');
    }

    console.log(`🏁 Starting ${config.type} benchmark: ${config.name}`);
    this.isRunning = true;
    this.currentBenchmark = config;

    const execution: BenchmarkExecution = {
      startTime: new Date(),
      endTime: new Date(),
      actualDuration: 0,
      actualIterations: 0
    };

    try {
      // Warmup phase
      if (config.warmupRounds > 0) {
        await this.runWarmup(config);
      }

      // Main benchmark execution
      const results = await this.executeBenchmark(config, execution);

      // Cooldown phase
      if (config.cooldownTime > 0) {
        await this.cooldown(config.cooldownTime);
      }

      // Analysis phase
      const analysis = this.analyzeBenchmarkResults(config, results);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(config, results, analysis);

      const report: BenchmarkReport = {
        configuration: config,
        execution,
        results,
        analysis,
        recommendations,
        timestamp: new Date(),
        passed: this.evaluateBenchmarkSuccess(config, results)
      };

      this.storeBenchmarkResult(config.name, report);
      
      console.log(`✅ Benchmark completed: ${report.passed ? 'PASSED' : 'FAILED'}`);
      this.emit('benchmark-completed', report);

      return report;

    } catch (error) {
      execution.interruptedReason = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Benchmark failed:', error);
      this.emit('benchmark-error', error);
      throw error;

    } finally {
      this.isRunning = false;
      this.currentBenchmark = undefined;
    }
  }

  /**
   * Run load testing with different load profiles
   */
  async runLoadTest(
    workflow: WorkflowConfig,
    profile: LoadTestProfile,
    scenarios?: BenchmarkScenario[]
  ): Promise<BenchmarkReport> {
    const config: BenchmarkConfiguration = {
      name: `Load Test - ${profile.name}`,
      description: `Load testing with ${profile.loadPattern} pattern`,
      type: 'load',
      duration: profile.rampUpTime + profile.steadyStateTime + profile.rampDownTime,
      concurrency: profile.maxConcurrency,
      iterations: 0, // Will be calculated based on duration
      warmupRounds: 10,
      cooldownTime: 30000,
      thresholds: this.getDefaultThresholds(),
      scenarios: scenarios || [this.createDefaultScenario(workflow)]
    };

    return await this.runBenchmark(config);
  }

  /**
   * Run stress testing to find breaking points
   */
  async runStressTest(
    workflow: WorkflowConfig,
    maxConcurrency: number = 100,
    duration: number = 300000 // 5 minutes
  ): Promise<BenchmarkReport> {
    const config: BenchmarkConfiguration = {
      name: 'Stress Test',
      description: 'Find system breaking point under extreme load',
      type: 'stress',
      duration,
      concurrency: maxConcurrency,
      iterations: 0,
      warmupRounds: 5,
      cooldownTime: 60000,
      thresholds: {
        maxAverageResponseTime: 60000, // More lenient for stress testing
        maxP95ResponseTime: 120000,
        maxP99ResponseTime: 180000,
        minThroughput: 1,
        maxErrorRate: 0.50, // Allow higher error rate in stress testing
        maxMemoryUsage: 2048 * 1024 * 1024, // 2GB
        maxCpuUsage: 95
      },
      scenarios: [this.createDefaultScenario(workflow)]
    };

    return await this.runBenchmark(config);
  }

  /**
   * Run regression testing against baseline
   */
  async runRegressionTest(
    workflow: WorkflowConfig,
    baselineBenchmarkName: string
  ): Promise<BenchmarkReport> {
    const baseline = this.getBaselineBenchmark(baselineBenchmarkName);
    if (!baseline) {
      throw new Error(`Baseline benchmark '${baselineBenchmarkName}' not found`);
    }

    const config: BenchmarkConfiguration = {
      name: `Regression Test vs ${baselineBenchmarkName}`,
      description: 'Compare performance against baseline benchmark',
      type: 'regression',
      duration: baseline.configuration.duration,
      concurrency: baseline.configuration.concurrency,
      iterations: baseline.configuration.iterations,
      warmupRounds: baseline.configuration.warmupRounds,
      cooldownTime: baseline.configuration.cooldownTime,
      thresholds: baseline.configuration.thresholds,
      scenarios: baseline.configuration.scenarios
    };

    const report = await this.runBenchmark(config);
    
    // Add regression analysis
    report.analysis.regressionAnalysis = this.performRegressionAnalysis(report, baseline);
    
    return report;
  }

  // ===== BENCHMARK IMPLEMENTATION =====

  private async runWarmup(config: BenchmarkConfiguration): Promise<void> {
    console.log(`🔥 Running warmup: ${config.warmupRounds} rounds`);
    
    for (let i = 0; i < config.warmupRounds; i++) {
      try {
        // Run a single scenario at low concurrency
        await this.executeScenario(config.scenarios[0], 1, 5000);
        this.emit('warmup-progress', { round: i + 1, total: config.warmupRounds });
      } catch (error) {
        console.warn(`Warmup round ${i + 1} failed:`, error);
      }
    }

    console.log('✅ Warmup completed');
  }

  private async executeBenchmark(
    config: BenchmarkConfiguration,
    execution: BenchmarkExecution
  ): Promise<BenchmarkResults> {
    console.log(`⚡ Executing main benchmark phase`);
    
    const results: BenchmarkResults = {
      summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutRequests: 0,
        averageResponseTime: 0,
        totalDataTransferred: 0
      },
      responseTime: this.initializeResponseTimeMetrics(),
      throughput: this.initializeThroughputMetrics(),
      resources: this.initializeResourceMetrics(),
      errors: { totalErrors: 0, errorRate: 0, errorsByType: new Map(), retryCount: 0, recoveryTime: 0 },
      scenarios: []
    };

    const responseTimes: number[] = [];
    const startTime = Date.now();
    const endTime = startTime + config.duration;
    
    // Resource monitoring
    const resourceMonitor = this.startResourceMonitoring();
    
    try {
      // Execute scenarios concurrently
      const scenarioPromises = config.scenarios.map(scenario => 
        this.executeScenarioLoad(scenario, config, startTime, endTime, responseTimes)
      );

      const scenarioResults = await Promise.all(scenarioPromises);
      results.scenarios = scenarioResults;

      // Calculate summary metrics
      results.summary = this.calculateSummaryMetrics(scenarioResults);
      results.responseTime = this.calculateResponseTimeMetrics(responseTimes);
      results.throughput = this.calculateThroughputMetrics(responseTimes, startTime, endTime);
      
    } finally {
      results.resources = await resourceMonitor.stop();
      execution.endTime = new Date();
      execution.actualDuration = Date.now() - startTime;
      execution.actualIterations = results.summary.totalRequests;
    }

    return results;
  }

  private async executeScenarioLoad(
    scenario: BenchmarkScenario,
    config: BenchmarkConfiguration,
    startTime: number,
    endTime: number,
    globalResponseTimes: number[]
  ): Promise<ScenarioResults> {
    const scenarioResults: ScenarioResults = {
      scenario,
      requests: 0,
      successRate: 0,
      averageResponseTime: 0,
      throughput: 0,
      errors: []
    };

    const responseTimes: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Calculate concurrency for this scenario based on weight
    const scenarioConcurrency = Math.max(1, Math.floor(config.concurrency * (scenario.weight / 100)));
    
    console.log(`📊 Running scenario "${scenario.name}" with ${scenarioConcurrency} concurrent users`);

    // Create concurrent workers for this scenario
    const workers = Array(scenarioConcurrency).fill(null).map(async (_, workerIndex) => {
      while (Date.now() < endTime) {
        const requestStart = Date.now();
        
        try {
          await this.executeScenario(scenario, 1, 30000); // 30s timeout per request
          const responseTime = Date.now() - requestStart;
          
          responseTimes.push(responseTime);
          globalResponseTimes.push(responseTime);
          successCount++;
          
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          errorCount++;
          scenarioResults.errors.push(error instanceof Error ? error.message : 'Unknown error');
          
          // Still record response time for failed requests
          responseTimes.push(responseTime);
          globalResponseTimes.push(responseTime);
        }

        scenarioResults.requests++;
        
        // Emit progress
        if (scenarioResults.requests % 10 === 0) {
          this.emit('scenario-progress', {
            scenario: scenario.name,
            requests: scenarioResults.requests,
            successRate: successCount / scenarioResults.requests
          });
        }

        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    await Promise.all(workers);

    // Calculate final metrics
    scenarioResults.successRate = successCount / scenarioResults.requests;
    scenarioResults.averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length;
    scenarioResults.throughput = scenarioResults.requests / ((endTime - startTime) / 1000);

    console.log(`✅ Scenario "${scenario.name}" completed: ${scenarioResults.requests} requests, ${Math.round(scenarioResults.successRate * 100)}% success rate`);

    return scenarioResults;
  }

  private async executeScenario(
    scenario: BenchmarkScenario,
    concurrency: number,
    timeout: number
  ): Promise<WorkflowResult> {
    // In a real implementation, this would execute the actual workflow
    // For now, we'll simulate execution with realistic timing
    
    const executionTime = this.simulateWorkflowExecution(scenario.workflow);
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // Simulate potential failures based on scenario expectations
    if (scenario.expectedOutcome === 'failure' && Math.random() < 0.1) {
      throw new Error(`Simulated failure for scenario: ${scenario.name}`);
    }

    if (scenario.expectedOutcome === 'timeout' && Math.random() < 0.05) {
      throw new Error(`Simulated timeout for scenario: ${scenario.name}`);
    }

    return {
      id: `result-${Date.now()}`,
      workflowId: scenario.workflow.id,
      success: true,
      result: { message: 'Benchmark execution completed' },
      error: null,
      metadata: {
        executionTime,
        timestamp: new Date().toISOString()
      }
    };
  }

  private simulateWorkflowExecution(workflow: WorkflowConfig): number {
    // Simulate realistic execution times based on workflow complexity
    let baseTime = 1000; // 1 second base
    
    // Add time based on number of steps
    baseTime += workflow.steps.length * 500;
    
    // Add some randomness to simulate real-world variability
    const variation = 0.3; // 30% variation
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
    
    return Math.floor(baseTime * randomFactor);
  }

  private startResourceMonitoring(): { stop: () => Promise<ResourceMetrics> } {
    const cpuSamples: CpuSample[] = [];
    const memorySamples: MemorySample[] = [];
    let networkBytesIn = 0;
    let networkBytesOut = 0;
    let diskReads = 0;
    let diskWrites = 0;

    const interval = setInterval(() => {
      // Simulate resource usage sampling
      cpuSamples.push({
        timestamp: new Date(),
        usage: 20 + Math.random() * 60 // 20-80% CPU usage
      });

      const memUsage = process.memoryUsage();
      memorySamples.push({
        timestamp: new Date(),
        used: memUsage.heapUsed,
        total: memUsage.heapTotal
      });

      networkBytesIn += Math.floor(Math.random() * 10000);
      networkBytesOut += Math.floor(Math.random() * 5000);
      diskReads += Math.floor(Math.random() * 100);
      diskWrites += Math.floor(Math.random() * 50);
    }, 1000);

    return {
      stop: async (): Promise<ResourceMetrics> => {
        clearInterval(interval);

        return {
          cpu: {
            average: cpuSamples.reduce((sum, s) => sum + s.usage, 0) / cpuSamples.length,
            peak: Math.max(...cpuSamples.map(s => s.usage)),
            samples: cpuSamples
          },
          memory: {
            average: memorySamples.reduce((sum, s) => sum + s.used, 0) / memorySamples.length,
            peak: Math.max(...memorySamples.map(s => s.used)),
            samples: memorySamples
          },
          network: {
            bytesIn: networkBytesIn,
            bytesOut: networkBytesOut,
            packetsIn: Math.floor(networkBytesIn / 1500), // Assume 1500 byte packets
            packetsOut: Math.floor(networkBytesOut / 1500),
            averageBandwidth: (networkBytesIn + networkBytesOut) / (memorySamples.length || 1)
          },
          disk: {
            reads: diskReads,
            writes: diskWrites,
            bytesRead: diskReads * 4096, // Assume 4KB per read
            bytesWritten: diskWrites * 4096, // Assume 4KB per write
            averageIOPS: (diskReads + diskWrites) / (memorySamples.length || 1)
          }
        };
      }
    };
  }

  private async cooldown(cooldownTime: number): Promise<void> {
    console.log(`❄️ Cooling down for ${cooldownTime / 1000}s`);
    await new Promise(resolve => setTimeout(resolve, cooldownTime));
  }

  // ===== ANALYSIS METHODS =====

  private analyzeBenchmarkResults(
    config: BenchmarkConfiguration,
    results: BenchmarkResults
  ): BenchmarkAnalysis {
    const performanceGrade = this.calculatePerformanceGrade(config, results);
    const bottlenecks = this.identifyBottlenecks(results);
    const scalabilityAssessment = this.assessScalability(config, results);

    return {
      performanceGrade,
      bottlenecks,
      scalabilityAssessment
    };
  }

  private calculatePerformanceGrade(
    config: BenchmarkConfiguration,
    results: BenchmarkResults
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    let score = 100;

    // Response time scoring
    const avgResponseTime = results.responseTime.average;
    if (avgResponseTime > config.thresholds.maxAverageResponseTime) {
      score -= 20;
    } else if (avgResponseTime > config.thresholds.maxAverageResponseTime * 0.8) {
      score -= 10;
    }

    // P95 response time scoring
    const p95ResponseTime = results.responseTime.p95;
    if (p95ResponseTime > config.thresholds.maxP95ResponseTime) {
      score -= 20;
    } else if (p95ResponseTime > config.thresholds.maxP95ResponseTime * 0.8) {
      score -= 10;
    }

    // Error rate scoring
    const errorRate = results.summary.failedRequests / results.summary.totalRequests;
    if (errorRate > config.thresholds.maxErrorRate) {
      score -= 25;
    } else if (errorRate > config.thresholds.maxErrorRate * 0.5) {
      score -= 10;
    }

    // Throughput scoring
    const throughput = results.throughput.averageThroughput;
    if (throughput < config.thresholds.minThroughput) {
      score -= 15;
    } else if (throughput < config.thresholds.minThroughput * 1.2) {
      score -= 5;
    }

    // Resource utilization scoring
    const cpuUsage = results.resources.cpu.average;
    if (cpuUsage > config.thresholds.maxCpuUsage) {
      score -= 10;
    }

    // Convert score to grade
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private identifyBottlenecks(results: BenchmarkResults): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = [];

    // CPU bottleneck analysis
    if (results.resources.cpu.average > 80) {
      bottlenecks.push({
        component: 'cpu',
        severity: results.resources.cpu.average > 90 ? 'critical' : 'high',
        description: `High CPU utilization: ${Math.round(results.resources.cpu.average)}%`,
        impact: 'Limits processing capacity and response times',
        suggestions: [
          'Optimize CPU-intensive algorithms',
          'Implement parallel processing',
          'Consider horizontal scaling'
        ]
      });
    }

    // Memory bottleneck analysis
    const memoryUsagePercent = (results.resources.memory.peak / results.resources.memory.average) * 100;
    if (memoryUsagePercent > 85) {
      bottlenecks.push({
        component: 'memory',
        severity: memoryUsagePercent > 95 ? 'critical' : 'high',
        description: `High memory utilization: ${Math.round(memoryUsagePercent)}%`,
        impact: 'Risk of out-of-memory errors and performance degradation',
        suggestions: [
          'Optimize memory usage patterns',
          'Implement memory pooling',
          'Add memory monitoring and alerts'
        ]
      });
    }

    // Response time bottleneck analysis
    if (results.responseTime.p99 > results.responseTime.average * 3) {
      bottlenecks.push({
        component: 'application',
        severity: 'medium',
        description: `High response time variance (P99: ${Math.round(results.responseTime.p99)}ms vs Avg: ${Math.round(results.responseTime.average)}ms)`,
        impact: 'Inconsistent user experience',
        suggestions: [
          'Identify and optimize slow operations',
          'Implement timeout controls',
          'Add performance monitoring'
        ]
      });
    }

    return bottlenecks;
  }

  private assessScalability(
    config: BenchmarkConfiguration,
    results: BenchmarkResults
  ): ScalabilityAssessment {
    const currentCapacity = results.throughput.averageThroughput;
    const resourceUtilization = Math.max(
      results.resources.cpu.average / 100,
      results.resources.memory.peak / (results.resources.memory.peak * 1.5) // Assume 50% headroom
    );

    const projectedMaxCapacity = currentCapacity / resourceUtilization;
    const scalabilityFactor = projectedMaxCapacity / currentCapacity;

    let limitingFactor = 'CPU';
    if (results.resources.memory.peak > results.resources.cpu.average * 10000000) { // Rough heuristic
      limitingFactor = 'Memory';
    }

    const recommendations = [];
    if (scalabilityFactor < 2) {
      recommendations.push('Limited scalability headroom - consider optimization before scaling');
    }
    if (resourceUtilization > 0.8) {
      recommendations.push('High resource utilization indicates bottleneck');
    }

    return {
      currentCapacity: Math.round(currentCapacity),
      projectedMaxCapacity: Math.round(projectedMaxCapacity),
      scalabilityFactor: Math.round(scalabilityFactor * 100) / 100,
      limitingFactor,
      recommendations
    };
  }

  private performRegressionAnalysis(
    currentReport: BenchmarkReport,
    baselineReport: BenchmarkReport
  ): RegressionAnalysis {
    const currentAvgResponseTime = currentReport.results.responseTime.average;
    const baselineAvgResponseTime = baselineReport.results.responseTime.average;
    
    const performanceChange = ((currentAvgResponseTime - baselineAvgResponseTime) / baselineAvgResponseTime) * 100;
    const regressionDetected = Math.abs(performanceChange) > 10; // 10% threshold

    const significantChanges = [];
    if (Math.abs(performanceChange) > 5) {
      significantChanges.push(`Response time changed by ${Math.round(performanceChange)}%`);
    }

    const currentThroughput = currentReport.results.throughput.averageThroughput;
    const baselineThroughput = baselineReport.results.throughput.averageThroughput;
    const throughputChange = ((currentThroughput - baselineThroughput) / baselineThroughput) * 100;
    
    if (Math.abs(throughputChange) > 5) {
      significantChanges.push(`Throughput changed by ${Math.round(throughputChange)}%`);
    }

    return {
      baselineBenchmark: baselineReport.configuration.name,
      performanceChange: Math.round(performanceChange),
      regressionDetected,
      significantChanges
    };
  }

  // ===== UTILITY METHODS =====

  private initializeResponseTimeMetrics(): ResponseTimeMetrics {
    return {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      p90: 0,
      p95: 0,
      p99: 0,
      standardDeviation: 0,
      distribution: []
    };
  }

  private initializeThroughputMetrics(): ThroughputMetrics {
    return {
      requestsPerSecond: 0,
      requestsPerMinute: 0,
      peakThroughput: 0,
      averageThroughput: 0,
      throughputOverTime: []
    };
  }

  private initializeResourceMetrics(): ResourceMetrics {
    return {
      cpu: { average: 0, peak: 0, samples: [] },
      memory: { average: 0, peak: 0, samples: [] },
      network: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0, averageBandwidth: 0 },
      disk: { reads: 0, writes: 0, bytesRead: 0, bytesWritten: 0, averageIOPS: 0 }
    };
  }

  private calculateSummaryMetrics(scenarioResults: ScenarioResults[]): ResultSummary {
    const totalRequests = scenarioResults.reduce((sum, sr) => sum + sr.requests, 0);
    const totalSuccessful = scenarioResults.reduce((sum, sr) => sum + Math.floor(sr.requests * sr.successRate), 0);
    const totalFailed = totalRequests - totalSuccessful;
    
    const weightedAvgResponseTime = scenarioResults.reduce((sum, sr) => 
      sum + (sr.averageResponseTime * sr.requests), 0) / totalRequests;

    return {
      totalRequests,
      successfulRequests: totalSuccessful,
      failedRequests: totalFailed,
      timeoutRequests: Math.floor(totalFailed * 0.1), // Assume 10% of failures are timeouts
      averageResponseTime: weightedAvgResponseTime,
      totalDataTransferred: totalRequests * 1024 // Assume 1KB per request
    };
  }

  private calculateResponseTimeMetrics(responseTimes: number[]): ResponseTimeMetrics {
    if (responseTimes.length === 0) {
      return this.initializeResponseTimeMetrics();
    }

    const sorted = [...responseTimes].sort((a, b) => a - b);
    const sum = responseTimes.reduce((s, rt) => s + rt, 0);
    const average = sum / responseTimes.length;
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average,
      median: this.percentile(sorted, 50),
      p90: this.percentile(sorted, 90),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      standardDeviation: this.calculateStandardDeviation(responseTimes, average),
      distribution: this.calculateDistribution(sorted)
    };
  }

  private calculateThroughputMetrics(
    responseTimes: number[],
    startTime: number,
    endTime: number
  ): ThroughputMetrics {
    const durationSeconds = (endTime - startTime) / 1000;
    const totalRequests = responseTimes.length;
    
    const requestsPerSecond = totalRequests / durationSeconds;
    const requestsPerMinute = requestsPerSecond * 60;

    return {
      requestsPerSecond,
      requestsPerMinute,
      peakThroughput: requestsPerSecond * 1.2, // Assume 20% peak variation
      averageThroughput: requestsPerSecond,
      throughputOverTime: [] // Would be populated with time-series data
    };
  }

  private percentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * (percentile / 100)) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateDistribution(sortedResponseTimes: number[]): ResponseTimeDistribution[] {
    const buckets = [
      { min: 0, max: 100, label: '0-100ms' },
      { min: 100, max: 500, label: '100-500ms' },
      { min: 500, max: 1000, label: '500-1000ms' },
      { min: 1000, max: 5000, label: '1-5s' },
      { min: 5000, max: 10000, label: '5-10s' },
      { min: 10000, max: Infinity, label: '10s+' }
    ];

    return buckets.map(bucket => {
      const count = sortedResponseTimes.filter(rt => rt >= bucket.min && rt < bucket.max).length;
      return {
        bucket: bucket.label,
        count,
        percentage: Math.round((count / sortedResponseTimes.length) * 100)
      };
    });
  }

  private generateRecommendations(
    config: BenchmarkConfiguration,
    results: BenchmarkResults,
    analysis: BenchmarkAnalysis
  ): BenchmarkRecommendation[] {
    const recommendations: BenchmarkRecommendation[] = [];

    // Performance grade based recommendations
    if (analysis.performanceGrade === 'F' || analysis.performanceGrade === 'D') {
      recommendations.push({
        priority: 'critical',
        category: 'performance',
        title: 'Critical Performance Issues Detected',
        description: `System performed below acceptable thresholds (Grade: ${analysis.performanceGrade})`,
        implementation: 'Immediate optimization and scaling required',
        estimatedImpact: 'Significant improvement in user experience and system stability'
      });
    }

    // Bottleneck based recommendations
    analysis.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'critical' || bottleneck.severity === 'high') {
        recommendations.push({
          priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
          category: 'optimization',
          title: `Address ${bottleneck.component.toUpperCase()} Bottleneck`,
          description: bottleneck.description,
          implementation: bottleneck.suggestions.join('; '),
          estimatedImpact: bottleneck.impact
        });
      }
    });

    // Scalability recommendations
    if (analysis.scalabilityAssessment.scalabilityFactor < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'scalability',
        title: 'Limited Scalability Headroom',
        description: `System can only scale ${analysis.scalabilityAssessment.scalabilityFactor}x before hitting limits`,
        implementation: analysis.scalabilityAssessment.recommendations.join('; '),
        estimatedImpact: 'Better handling of traffic growth and peak loads'
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private evaluateBenchmarkSuccess(config: BenchmarkConfiguration, results: BenchmarkResults): boolean {
    const thresholds = config.thresholds;
    
    // Check all threshold conditions
    const conditions = [
      results.responseTime.average <= thresholds.maxAverageResponseTime,
      results.responseTime.p95 <= thresholds.maxP95ResponseTime,
      results.responseTime.p99 <= thresholds.maxP99ResponseTime,
      results.throughput.averageThroughput >= thresholds.minThroughput,
      (results.summary.failedRequests / results.summary.totalRequests) <= thresholds.maxErrorRate,
      results.resources.memory.peak <= thresholds.maxMemoryUsage,
      results.resources.cpu.average <= thresholds.maxCpuUsage
    ];

    return conditions.every(condition => condition);
  }

  private createDefaultScenario(workflow: WorkflowConfig): BenchmarkScenario {
    return {
      name: 'Default Scenario',
      weight: 100,
      workflow,
      parameters: {},
      expectedOutcome: 'success'
    };
  }

  private getDefaultThresholds(): BenchmarkThresholds {
    return {
      maxAverageResponseTime: 5000, // 5 seconds
      maxP95ResponseTime: 10000, // 10 seconds
      maxP99ResponseTime: 20000, // 20 seconds
      minThroughput: 1, // 1 request per second minimum
      maxErrorRate: 0.05, // 5% error rate
      maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
      maxCpuUsage: 80 // 80% CPU usage
    };
  }

  private storeBenchmarkResult(benchmarkName: string, report: BenchmarkReport): void {
    if (!this.results.has(benchmarkName)) {
      this.results.set(benchmarkName, []);
    }

    const history = this.results.get(benchmarkName)!;
    history.push(report);

    // Keep only last 10 results
    if (history.length > 10) {
      history.shift();
    }
  }

  private getBaselineBenchmark(benchmarkName: string): BenchmarkReport | null {
    const history = this.results.get(benchmarkName);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  // ===== PUBLIC API =====

  /**
   * Get benchmark results history
   */
  getBenchmarkHistory(benchmarkName?: string): Map<string, BenchmarkReport[]> {
    if (benchmarkName) {
      const history = this.results.get(benchmarkName);
      return history ? new Map([[benchmarkName, history]]) : new Map();
    }
    
    return new Map(this.results);
  }

  /**
   * Get benchmark report by name and index
   */
  getBenchmarkReport(benchmarkName: string, index: number = -1): BenchmarkReport | null {
    const history = this.results.get(benchmarkName);
    if (!history || history.length === 0) return null;
    
    const actualIndex = index < 0 ? history.length + index : index;
    return history[actualIndex] || null;
  }

  /**
   * Check if benchmark is currently running
   */
  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current benchmark status
   */
  getCurrentBenchmark(): BenchmarkConfiguration | undefined {
    return this.currentBenchmark;
  }

  /**
   * Generate comparative report between two benchmarks
   */
  generateComparativeReport(
    report1: BenchmarkReport,
    report2: BenchmarkReport
  ): BenchmarkComparison {
    return {
      speedupFactor: report2.results.responseTime.average / report1.results.responseTime.average,
      memoryReduction: (report1.results.resources.memory.peak - report2.results.resources.memory.peak) / report1.results.resources.memory.peak,
      costSavings: 0, // Would calculate based on resource costs
      reliabilityGain: (report2.results.summary.successfulRequests / report2.results.summary.totalRequests) - 
                      (report1.results.summary.successfulRequests / report1.results.summary.totalRequests),
      efficiencyImprovement: (report2.results.throughput.averageThroughput - report1.results.throughput.averageThroughput) / 
                           report1.results.throughput.averageThroughput
    };
  }
}

export { BenchmarkSuite }; 