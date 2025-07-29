// Confidence Service Factory - Provides easy integration and configuration
import { ConfidenceAIService } from './ConfidenceAIService';
import { ConfidenceConfig, ConfidenceContext } from './types/confidence.types';
import { UserProfile } from '../../../../types/user';
import { GeneratedWorkout } from '../../../../types/workout-generation.types';
import { aiLogger } from '../../logging/AILogger';
import { FeatureFlagService } from '../../featureFlags/FeatureFlagService';

/**
 * Factory for creating and configuring confidence services
 * Provides easy integration with workout generation pipeline
 */
export class ConfidenceServiceFactory {
  private static instance: ConfidenceAIService | null = null;
  private static featureFlagService: FeatureFlagService | null = null;

  /**
   * Get singleton instance of confidence service
   */
  static getInstance(config?: Partial<ConfidenceConfig>): ConfidenceAIService {
    if (!this.instance) {
      this.instance = new ConfidenceAIService(config);
      aiLogger.debug('ConfidenceServiceFactory: Created new confidence service instance', {
        config: config ?? 'default'
      });
    }
    return this.instance;
  }

  /**
   * Get feature flag service instance
   */
  private static getFeatureFlagService(): FeatureFlagService {
    if (!this.featureFlagService) {
      this.featureFlagService = new FeatureFlagService();
    }
    return this.featureFlagService;
  }

  /**
   * Check if confidence calculation is enabled via feature flag
   */
  static isConfidenceEnabled(userProfile?: UserProfile): boolean {
    if (!userProfile) {
      return false; // Require user profile for feature flag evaluation
    }
    
    try {
      const flagService = this.getFeatureFlagService();
      return flagService.isEnabled('ai_confidence_system', userProfile);
    } catch (error) {
      aiLogger.warn('ConfidenceServiceFactory: Feature flag check failed, defaulting to disabled', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false; // Default to disabled on error
    }
  }

  /**
   * Calculate confidence for a workout-user combination
   * Returns null if confidence calculation is disabled
   */
  static async calculateConfidence(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<{
    confidence: number;
    confidenceFactors?: {
      profileMatch: number;
      safetyAlignment: number;
      equipmentFit: number;
      goalAlignment: number;
      structureQuality: number;
    };
  } | null> {
    if (!this.isConfidenceEnabled(userProfile)) {
      aiLogger.debug('ConfidenceServiceFactory: Confidence calculation disabled via feature flag, skipping');
      return null;
    }

    try {
      const service = this.getInstance();
      const result = await service.calculateConfidence(userProfile, workoutData, context);

      return {
        confidence: result.overallScore,
        confidenceFactors: {
          profileMatch: result.factors.profileMatch,
          safetyAlignment: result.factors.safetyAlignment,
          equipmentFit: result.factors.equipmentFit,
          goalAlignment: result.factors.goalAlignment,
          structureQuality: result.factors.structureQuality
        }
      };
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'confidence calculation',
        component: 'ConfidenceServiceFactory',
        severity: 'medium',
        userImpact: false
      });

      // Return null on error to maintain backward compatibility
      return null;
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    aiLogger.debug('ConfidenceServiceFactory: Reset singleton instance');
  }

  /**
   * Get current configuration
   */
  static getConfig(): ConfidenceConfig {
    const service = this.getInstance();
    return service.getConfig();
  }

  /**
   * Update configuration
   */
  static updateConfig(config: Partial<ConfidenceConfig>): void {
    const service = this.getInstance();
    service.updateConfig(config);
    aiLogger.debug('ConfidenceServiceFactory: Updated configuration', { config });
  }
} 