import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  UnifiedAIAnalysis, 
  GlobalAIContext,
  AIServiceConfig 
} from '../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../types';
import { AIServiceAnalysisGenerator } from './AIServiceAnalysisGenerator';
import { AIServiceRecommendationEngine } from './AIServiceRecommendationEngine';

/**
 * Main analysis orchestrator that coordinates between generator and recommendation engine
 * Extracted from AIService.ts to provide focused analysis orchestration
 */
export class AIServiceAnalyzer extends AIServiceComponent {
  private generator: AIServiceAnalysisGenerator;
  private recommendationEngine: AIServiceRecommendationEngine;
  private domainServices: Map<string, any>;
  private config: AIServiceConfig;

  constructor(domainServices: Map<string, any>, config: AIServiceConfig) {
    super('AIServiceAnalyzer');
    this.domainServices = domainServices;
    this.config = config;
    this.generator = new AIServiceAnalysisGenerator(domainServices);
    this.recommendationEngine = new AIServiceRecommendationEngine();
  }

  /**
   * Main analysis method with validation and error handling
   */
  async analyze(
    partialSelections: Partial<PerWorkoutOptions>,
    context: GlobalAIContext
  ): Promise<UnifiedAIAnalysis> {
    this.log('info', 'Starting analysis', {
      hasPartialSelections: !!partialSelections,
      contextAvailable: !!context,
      domainServices: Array.from(this.domainServices.keys())
    });

    if (!context) {
      throw new Error('AI Service requires global context to be set');
    }

    const currentSelections = { ...context.currentSelections, ...partialSelections };

    try {
      // Generate analysis with retry logic
      const analysis = await this.executeWithRetry(
        () => this.generateAnalysis(currentSelections, context),
        this.config.maxRetries
      );

      // Generate recommendations
      const recommendations = await this.recommendationEngine.generatePrioritizedRecommendations(
        analysis.insights,
        analysis.crossComponentConflicts
      );

      // Calculate overall confidence
      const confidence = this.recommendationEngine.calculateOverallConfidence(
        analysis.insights,
        recommendations
      );

      // Generate reasoning
      const reasoning = this.recommendationEngine.generateReasoning(
        analysis.insights,
        analysis.crossComponentConflicts,
        recommendations
      );

      // Update analysis with recommendations
      const finalAnalysis: UnifiedAIAnalysis = {
        ...analysis,
        recommendations,
        confidence,
        reasoning
      };

      // Validate final analysis
      if (!this.generator.validateAnalysis(finalAnalysis)) {
        throw new Error('Generated analysis failed validation');
      }

      this.log('info', 'Analysis completed successfully', {
        analysisId: finalAnalysis.id,
        insightCount: Object.values(finalAnalysis.insights).flat().length,
        recommendationCount: finalAnalysis.recommendations.length,
        confidence: finalAnalysis.confidence.toFixed(3)
      });

      return finalAnalysis;

    } catch (error) {
      this.handleError(error as Error, 'analyze', { partialSelections, context });
      throw error;
    }
  }

  /**
   * Generate analysis using domain services
   */
  private async generateAnalysis(
    currentSelections: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<UnifiedAIAnalysis> {
    this.log('debug', 'Generating analysis', {
      selections: Object.keys(currentSelections)
    });

    return await this.generator.generateAnalysis(currentSelections, context);
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.log('info', `Retrying analysis (attempt ${attempt + 1}/${maxRetries + 1})`);
        }
        
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          this.log('error', `Analysis failed after ${maxRetries + 1} attempts`, {
            lastError: lastError.message
          });
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100;
        this.log('info', `Waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Get analysis summary for debugging
   */
  getAnalysisSummary(analysis: UnifiedAIAnalysis): {
    id: string;
    timestamp: Date;
    insightCount: number;
    conflictCount: number;
    recommendationCount: number;
    confidence: number;
    domains: string[];
    criticalRecommendations: number;
    highPriorityRecommendations: number;
  } {
    const summary = this.generator.getAnalysisSummary(analysis);
    const criticalRecs = analysis.recommendations.filter(r => r.priority === 'critical').length;
    const highRecs = analysis.recommendations.filter(r => r.priority === 'high').length;

    return {
      ...summary,
      criticalRecommendations: criticalRecs,
      highPriorityRecommendations: highRecs
    };
  }

  /**
   * Validate analysis structure and content
   */
  validateAnalysis(analysis: UnifiedAIAnalysis): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!this.generator.validateAnalysis(analysis)) {
      errors.push('Analysis structure validation failed');
    }

    // Recommendation validation
    const { valid: validRecs, invalid: invalidRecs } = this.recommendationEngine.validateRecommendations(analysis.recommendations);
    if (invalidRecs.length > 0) {
      warnings.push(`${invalidRecs.length} invalid recommendations found`);
    }

    // Confidence validation
    if (analysis.confidence < 0 || analysis.confidence > 1) {
      errors.push('Confidence must be between 0 and 1');
    }

    // Insight validation
    const insightCount = Object.values(analysis.insights).flat().length;
    if (insightCount === 0) {
      warnings.push('No insights generated');
    }

    // Conflict validation
    if (analysis.crossComponentConflicts.length > 0) {
      const criticalConflicts = analysis.crossComponentConflicts.filter(c => c.severity === 'critical').length;
      if (criticalConflicts > 0) {
        warnings.push(`${criticalConflicts} critical conflicts detected`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get domain service health status
   */
  getDomainServiceHealth(): Record<string, 'healthy' | 'degraded' | 'unhealthy'> {
    return this.generator.getDomainServiceHealth();
  }

  /**
   * Check if all required domain services are available
   */
  areDomainServicesHealthy(): boolean {
    const health = this.getDomainServiceHealth();
    return Object.values(health).every(status => status === 'healthy');
  }

  /**
   * Get performance metrics for analysis components
   */
  getPerformanceMetrics(): {
    generatorHealth: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    availableDomains: string[];
    totalDomainServices: number;
    healthyServices: number;
  } {
    const health = this.getDomainServiceHealth();
    const healthyServices = Object.values(health).filter(status => status === 'healthy').length;

    return {
      generatorHealth: health,
      availableDomains: this.generator.getAvailableDomains(),
      totalDomainServices: this.domainServices.size,
      healthyServices
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('info', 'Configuration updated', { newConfig });
  }

  /**
   * Get current configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Update domain services (useful for testing or dynamic updates)
   */
  updateDomainServices(newServices: Map<string, any>): void {
    this.domainServices = newServices;
    this.generator.updateDomainServices(newServices);
    this.log('info', 'Domain services updated', {
      newServiceCount: newServices.size,
      services: Array.from(newServices.keys())
    });
  }

  /**
   * Get list of available domain services
   */
  getAvailableDomains(): string[] {
    return this.generator.getAvailableDomains();
  }

  /**
   * Check if a specific domain service is available
   */
  hasDomainService(domainName: string): boolean {
    return this.generator.hasDomainService(domainName);
  }

  /**
   * Get recommendation engine instance (for advanced usage)
   */
  getRecommendationEngine(): AIServiceRecommendationEngine {
    return this.recommendationEngine;
  }

  /**
   * Get analysis generator instance (for advanced usage)
   */
  getAnalysisGenerator(): AIServiceAnalysisGenerator {
    return this.generator;
  }
} 