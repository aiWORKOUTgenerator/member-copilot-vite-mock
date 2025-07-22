// Error Handler - Centralized error handling for OpenAI operations
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { PrioritizedRecommendation, GlobalAIContext } from '../../core/AIService';
import { logger } from '../../../../utils/logger';

export class ErrorHandler {
  /**
   * Create user-friendly error message from various error types
   */
  static getUserFriendlyErrorMessage(error: Error | unknown): string {
    if (error && typeof error === 'object' && 'type' in error) {
      const errorType = (error as { type: string }).type;
      
      switch (errorType) {
        case 'rate_limit':
          return 'AI service is temporarily busy. Please try again in a moment.';
        case 'authentication':
          return 'AI service configuration issue. Please contact support.';
        case 'network':
          return 'Network connection issue. Please check your internet connection.';
        default:
          return 'AI service temporarily unavailable. Please try again later.';
      }
    }
    
    return 'AI service temporarily unavailable. Please try again later.';
  }

  /**
   * Create workout generation error with context
   */
  static createWorkoutError(error: Error | unknown, _request: WorkoutGenerationRequest): Error {
    const userFriendlyMessage = this.getUserFriendlyErrorMessage(error);
    return new Error(`Workout generation failed: ${userFriendlyMessage}`);
  }

  /**
   * Handle recommendation generation errors
   */
  static async handleRecommendationError(
    error: Error | unknown,
    context: GlobalAIContext,
    fallbackStrategy?: { generateRecommendations: (context: GlobalAIContext) => Promise<PrioritizedRecommendation[]> }
  ): Promise<PrioritizedRecommendation[]> {
    logger.error('OpenAI recommendation error:', error);

    // Try fallback strategy if available
    if (fallbackStrategy) {
      try {
        return await fallbackStrategy.generateRecommendations(context);
      } catch (fallbackError) {
        logger.error('Fallback strategy also failed:', fallbackError);
      }
    }

    // Return basic safety recommendations
    return this.generateEmergencyRecommendations(context);
  }

  /**
   * Generate emergency recommendations when AI fails
   */
  static generateEmergencyRecommendations(context: GlobalAIContext): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];
    
    const energyLevel = context.currentSelections?.customization_energy ?? 5;
    const duration = typeof context.currentSelections?.customization_duration === 'number' 
      ? context.currentSelections.customization_duration 
      : 30;
    
    if (energyLevel <= 3 && duration > 30) {
      recommendations.push({
        id: 'emergency_energy_warning',
        priority: 'high',
        category: 'safety',
        targetComponent: 'duration',
        title: 'Consider shorter workout with low energy',
        description: 'Low energy levels may lead to poor performance and increased injury risk',
        reasoning: 'AI service unavailable - basic safety recommendation',
        confidence: 0.8,
        risk: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Log error with context for debugging
   */
  static logError(error: Error | unknown, context: string, additionalData?: Record<string, unknown>): void {
    logger.error(`Error in ${context}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      additionalData
    });
  }
} 