import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  UnifiedAIAnalysis, 
  GlobalAIContext,
  ValidationResult,
  PrioritizedRecommendation
} from '../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../types';
import { AIInsight } from '../../../../types/insights';

/**
 * Simplified validator that focuses on basic structure validation
 * No legacy complexity - just ensures data integrity
 */
export class AIServiceValidator extends AIServiceComponent {
  private validationEnabled: boolean = false;

  constructor() {
    super('AIServiceValidator');
  }

  /**
   * Basic validation of analysis structure
   */
  async validateAnalysis(
    analysis: UnifiedAIAnalysis,
    currentSelections: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<ValidationResult> {
    if (!this.validationEnabled) {
      return {
        isValid: true,
        consistencyScore: 1.0,
        discrepancies: [],
        performanceComparison: { oldTime: 0, newTime: 0, memoryDifference: 0 }
      };
    }

    this.log('info', 'Starting analysis validation', {
      analysisId: analysis?.id || 'null',
      validationEnabled: this.validationEnabled,
      hasContext: !!context
    });

    const startTime = performance.now();
    const discrepancies: ValidationResult['discrepancies'] = [];

    try {
      // Basic structure validation
      if (!analysis.id || !analysis.timestamp) {
        discrepancies.push({
          component: 'analysis_structure',
          expected: 'valid_analysis_id_and_timestamp',
          actual: 'missing_required_fields',
          severity: 'high'
        });
      }

      // Validate insights structure
      const insightValidation = this.validateInsights(analysis.insights);
      if (!insightValidation.isValid) {
        discrepancies.push(...insightValidation.discrepancies);
      }

      // Validate recommendations structure
      const recommendationValidation = this.validateRecommendations(analysis.recommendations);
      if (!recommendationValidation.isValid) {
        discrepancies.push(...recommendationValidation.discrepancies);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const consistencyScore = Math.max(0, 1.0 - (discrepancies.length * 0.1));

      this.log('debug', 'validation completed', {
        executionTime: `${executionTime.toFixed(2)}ms`,
        memoryUsage: '0 bytes',
        component: 'AIServiceValidator'
      });

      this.log('info', 'Validation completed', {
        isValid: discrepancies.length === 0,
        consistencyScore: consistencyScore.toFixed(3),
        discrepancyCount: discrepancies.length,
        executionTime: `${executionTime.toFixed(2)}ms`
      });

      return {
        isValid: discrepancies.length === 0,
        consistencyScore,
        discrepancies,
        performanceComparison: {
          oldTime: 0,
          newTime: executionTime,
          memoryDifference: 0
        }
      };

    } catch (error) {
      this.handleError(error as Error, 'validateAnalysis', { analysis, currentSelections });

      return {
        isValid: false,
        consistencyScore: 0,
        discrepancies: [{
          component: 'validation_error',
          expected: 'successful_validation',
          actual: 'validation_error',
          severity: 'high'
        }],
        performanceComparison: { oldTime: 0, newTime: 0, memoryDifference: 0 }
      };
    }
  }

  /**
   * Validate insights structure
   */
  private validateInsights(insights: UnifiedAIAnalysis['insights']): {
    isValid: boolean;
    discrepancies: ValidationResult['discrepancies'];
  } {
    const discrepancies: ValidationResult['discrepancies'] = [];
    const requiredDomains = ['energy', 'soreness', 'focus', 'duration', 'equipment'];

    // Check all required domains exist
    for (const domain of requiredDomains) {
      if (!insights[domain as keyof typeof insights]) {
        discrepancies.push({
          component: `insights.${domain}`,
          expected: 'array_of_insights',
          actual: 'missing_domain',
          severity: 'high'
        });
      }
    }

    // Validate individual insights
    Object.entries(insights).forEach(([domain, domainInsights]) => {
      if (!Array.isArray(domainInsights)) {
        discrepancies.push({
          component: `insights.${domain}`,
          expected: 'array_of_insights',
          actual: 'not_an_array',
          severity: 'high'
        });
        return;
      }

      domainInsights.forEach((insight, index) => {
        if (!insight.id || !insight.type || !insight.message) {
          discrepancies.push({
            component: `insights.${domain}[${index}]`,
            expected: 'valid_insight_with_id_type_message',
            actual: 'missing_required_fields',
            severity: 'medium'
          });
        }
      });
    });

    return {
      isValid: discrepancies.length === 0,
      discrepancies
    };
  }

  /**
   * Validate recommendations structure
   */
  private validateRecommendations(recommendations: PrioritizedRecommendation[]): {
    isValid: boolean;
    discrepancies: ValidationResult['discrepancies'];
  } {
    const discrepancies: ValidationResult['discrepancies'] = [];

    if (!Array.isArray(recommendations)) {
      discrepancies.push({
        component: 'recommendations',
        expected: 'array_of_recommendations',
        actual: 'not_an_array',
        severity: 'high'
      });
      return { isValid: false, discrepancies };
    }

    recommendations.forEach((recommendation, index) => {
      // Check required fields
      if (!recommendation.id || !recommendation.priority || !recommendation.title) {
        discrepancies.push({
          component: `recommendations[${index}]`,
          expected: 'valid_recommendation_with_id_priority_title',
          actual: 'missing_required_fields',
          severity: 'medium'
        });
      }

      // Validate priority values
      const validPriorities = ['critical', 'high', 'medium', 'low'];
      if (recommendation.priority && !validPriorities.includes(recommendation.priority)) {
        discrepancies.push({
          component: `recommendations[${index}].priority`,
          expected: `one_of_${validPriorities.join('|')}`,
          actual: recommendation.priority,
          severity: 'medium'
        });
      }

      // Validate confidence range
      if (recommendation.confidence !== undefined && 
          (recommendation.confidence < 0 || recommendation.confidence > 1)) {
        discrepancies.push({
          component: `recommendations[${index}].confidence`,
          expected: 'number_between_0_and_1',
          actual: recommendation.confidence,
          severity: 'low'
        });
      }
    });

    return {
      isValid: discrepancies.length === 0,
      discrepancies
    };
  }

  /**
   * Enable or disable validation
   */
  setValidationMode(enabled: boolean): void {
    this.validationEnabled = enabled;
    this.log('info', 'Validation mode changed', { enabled });
  }

  /**
   * Get validation mode status
   */
  isValidationEnabled(): boolean {
    return this.validationEnabled;
  }

  /**
   * Get validation summary
   */
  getValidationSummary(): {
    enabled: boolean;
    lastValidation?: {
      timestamp: Date;
      isValid: boolean;
      discrepancyCount: number;
    };
  } {
    return {
      enabled: this.validationEnabled
    };
  }
} 