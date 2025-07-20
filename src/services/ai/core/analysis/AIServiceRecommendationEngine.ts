import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  PrioritizedRecommendation, 
  CrossComponentConflict,
  UnifiedAIAnalysis 
} from '../types/AIServiceTypes';
import { AIInsight } from '../../../../types/insights';

/**
 * Handles recommendation generation and prioritization
 * Extracted from AIService.ts to provide focused recommendation logic
 */
export class AIServiceRecommendationEngine extends AIServiceComponent {
  constructor() {
    super('AIServiceRecommendationEngine');
  }

  /**
   * Generate prioritized recommendations from insights and conflicts
   */
  async generatePrioritizedRecommendations(
    insights: UnifiedAIAnalysis['insights'],
    conflicts: CrossComponentConflict[]
  ): Promise<PrioritizedRecommendation[]> {
    this.log('info', 'Generating prioritized recommendations', {
      insightCount: Object.values(insights).flat().length,
      conflictCount: conflicts.length
    });

    const recommendations: PrioritizedRecommendation[] = [];

    // Convert conflicts to high-priority recommendations
    const conflictRecommendations = this.convertConflictsToRecommendations(conflicts);
    recommendations.push(...conflictRecommendations);

    // Convert domain insights to recommendations
    const insightRecommendations = this.convertInsightsToRecommendations(insights);
    recommendations.push(...insightRecommendations);

    // Sort by priority and confidence
    const sortedRecommendations = this.sortRecommendations(recommendations);

    this.log('info', 'Generated recommendations', {
      total: sortedRecommendations.length,
      critical: sortedRecommendations.filter(r => r.priority === 'critical').length,
      high: sortedRecommendations.filter(r => r.priority === 'high').length,
      medium: sortedRecommendations.filter(r => r.priority === 'medium').length,
      low: sortedRecommendations.filter(r => r.priority === 'low').length
    });

    return sortedRecommendations;
  }

  /**
   * Convert conflicts to high-priority recommendations
   */
  private convertConflictsToRecommendations(
    conflicts: CrossComponentConflict[]
  ): PrioritizedRecommendation[] {
    return conflicts.map(conflict => ({
      id: conflict.id,
      priority: conflict.severity === 'critical' ? 'critical' : 'high',
      category: conflict.type === 'safety' ? 'safety' : 'optimization',
      targetComponent: conflict.components[0],
      title: `${conflict.type.replace('_', ' ').toUpperCase()} Issue Detected`,
      description: conflict.description,
      reasoning: conflict.suggestedResolution,
      confidence: conflict.confidence,
      risk: conflict.severity === 'critical' ? 'high' : 'medium',
      action: {
        type: 'suggest_alternative',
        alternatives: [conflict.suggestedResolution]
      }
    }));
  }

  /**
   * Convert domain insights to recommendations
   */
  private convertInsightsToRecommendations(
    insights: UnifiedAIAnalysis['insights']
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];

    Object.entries(insights).forEach(([domain, domainInsights]) => {
      domainInsights.forEach(insight => {
        if (insight.actionable) {
          // Ensure we have required fields with fallbacks
          const title = insight.message || insight.recommendation || `Insight from ${domain} analysis`;
          const description = insight.message || insight.recommendation || `Recommendation based on ${domain} analysis`;
          const confidence = insight.confidence || 0.5; // Default confidence if not provided
          
          recommendations.push({
            id: insight.id,
            priority: insight.type === 'warning' ? 'high' : 'medium',
            category: insight.type === 'warning' ? 'safety' : 'optimization',
            targetComponent: domain,
            title,
            description,
            reasoning: `Based on ${domain} analysis`,
            confidence,
            risk: insight.type === 'warning' ? 'medium' : 'low'
          });
        }
      });
    });

    return recommendations;
  }

  /**
   * Sort recommendations by priority and confidence
   */
  private sortRecommendations(recommendations: PrioritizedRecommendation[]): PrioritizedRecommendation[] {
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Calculate overall confidence from insights and recommendations
   */
  calculateOverallConfidence(
    insights: UnifiedAIAnalysis['insights'],
    recommendations: PrioritizedRecommendation[]
  ): number {
    // Extract confidence values, filtering out undefined values and providing defaults
    const insightConfidences = Object.values(insights)
      .flat()
      .map(i => i.confidence ?? 0.5); // Default to 0.5 for undefined confidence
    
    const recommendationConfidences = recommendations.map(r => r.confidence);
    
    const allConfidences = [...insightConfidences, ...recommendationConfidences];
    
    // Calculate average confidence
    const averageConfidence = allConfidences.length > 0 
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length
      : 0.5;

    this.log('debug', 'Calculated overall confidence', {
      insightCount: insightConfidences.length,
      recommendationCount: recommendationConfidences.length,
      averageConfidence: averageConfidence.toFixed(3)
    });

    return averageConfidence;
  }

  /**
   * Generate reasoning from insights, conflicts, and recommendations
   */
  generateReasoning(
    insights: UnifiedAIAnalysis['insights'],
    conflicts: CrossComponentConflict[],
    recommendations: PrioritizedRecommendation[]
  ): string {
    const reasoningParts: string[] = [];
    
    if (conflicts.length > 0) {
      reasoningParts.push(`Detected ${conflicts.length} cross-component issue(s) requiring attention.`);
    }
    
    const criticalRecs = recommendations.filter(r => r.priority === 'critical').length;
    if (criticalRecs > 0) {
      reasoningParts.push(`${criticalRecs} critical recommendation(s) for immediate action.`);
    }
    
    const domains = Object.keys(insights).filter(domain => insights[domain as keyof typeof insights].length > 0);
    if (domains.length > 0) {
      reasoningParts.push(`Analysis based on ${domains.join(', ')} parameters.`);
    }
    
    const reasoning = reasoningParts.join(' ') || 'Comprehensive analysis completed successfully.';
    
    this.log('debug', 'Generated reasoning', {
      reasoning,
      conflictCount: conflicts.length,
      criticalRecommendationCount: criticalRecs,
      activeDomains: domains
    });

    return reasoning;
  }

  /**
   * Filter recommendations by priority level
   */
  filterByPriority(
    recommendations: PrioritizedRecommendation[],
    priority: PrioritizedRecommendation['priority']
  ): PrioritizedRecommendation[] {
    return recommendations.filter(r => r.priority === priority);
  }

  /**
   * Filter recommendations by category
   */
  filterByCategory(
    recommendations: PrioritizedRecommendation[],
    category: PrioritizedRecommendation['category']
  ): PrioritizedRecommendation[] {
    return recommendations.filter(r => r.category === category);
  }

  /**
   * Get recommendations for a specific target component
   */
  getRecommendationsForComponent(
    recommendations: PrioritizedRecommendation[],
    targetComponent: string
  ): PrioritizedRecommendation[] {
    return recommendations.filter(r => r.targetComponent === targetComponent);
  }

  /**
   * Validate recommendation structure
   */
  validateRecommendation(recommendation: PrioritizedRecommendation): boolean {
    const requiredFields = ['id', 'priority', 'category', 'targetComponent', 'title', 'description', 'reasoning', 'confidence', 'risk'];
    
    for (const field of requiredFields) {
      if (!(field in recommendation) || recommendation[field as keyof PrioritizedRecommendation] === undefined) {
        this.log('warn', `Invalid recommendation: missing required field '${field}'`, { recommendation });
        return false;
      }
    }

    // Validate confidence is between 0 and 1
    if (recommendation.confidence < 0 || recommendation.confidence > 1) {
      this.log('warn', 'Invalid recommendation: confidence must be between 0 and 1', { recommendation });
      return false;
    }

    return true;
  }

  /**
   * Validate all recommendations in a list
   */
  validateRecommendations(recommendations: PrioritizedRecommendation[]): {
    valid: PrioritizedRecommendation[];
    invalid: PrioritizedRecommendation[];
  } {
    const valid: PrioritizedRecommendation[] = [];
    const invalid: PrioritizedRecommendation[] = [];

    recommendations.forEach(recommendation => {
      if (this.validateRecommendation(recommendation)) {
        valid.push(recommendation);
      } else {
        invalid.push(recommendation);
      }
    });

    if (invalid.length > 0) {
      this.log('warn', `Found ${invalid.length} invalid recommendations`, {
        total: recommendations.length,
        valid: valid.length,
        invalid: invalid.length
      });
    }

    return { valid, invalid };
  }
} 