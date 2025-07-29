import { 
  InternalPromptEngine,
  ProfilePromptBuilder,
  WorkoutPromptBuilder 
} from '../prompts';
import { 
  InternalPromptConfig,
  InternalPromptResult,
  InternalRecommendation,
  RecommendationStrategy 
} from '../types/internal-prompt.types';
import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/core';
import { aiLogger } from '../../logging/AILogger';

/**
 * Default recommendation strategy that uses domain services
 */
class DefaultRecommendationStrategy implements RecommendationStrategy {
  async analyze(context: any, config?: InternalPromptConfig): Promise<InternalRecommendation[]> {
    // TODO: Implement domain service analysis
    return [];
  }

  validate(recommendations: InternalRecommendation[]): boolean {
    return true;
  }

  prioritize(recommendations: InternalRecommendation[]): InternalRecommendation[] {
    return recommendations.sort((a, b) => {
      // Sort by priority first
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    });
  }
}

/**
 * Internal workflow for generating workouts using the prompt system
 */
export class InternalWorkoutGeneration {
  private engine: InternalPromptEngine;
  private config: InternalPromptConfig;

  constructor(config?: Partial<InternalPromptConfig>) {
    // Initialize builders and strategy
    const profileBuilder = new ProfilePromptBuilder();
    const workoutBuilder = new WorkoutPromptBuilder();
    const recommendationStrategy = new DefaultRecommendationStrategy();

    // Create prompt engine
    this.engine = new InternalPromptEngine(
      profileBuilder,
      workoutBuilder,
      recommendationStrategy,
      config
    );

    // Set default configuration
    this.config = {
      enableDetailedAnalysis: true,
      prioritizeUserPreferences: true,
      safetyChecks: true,
      maxRecommendations: 10,
      confidenceThreshold: 0.7,
      analysisTimeout: 30000,
      ...config
    };
  }

  /**
   * Generate workout recommendations using internal prompt system
   */
  public async generateWorkout(
    profileData: ProfileData,
    workoutData: PerWorkoutOptions,
    options?: Partial<InternalPromptConfig>
  ): Promise<InternalPromptResult> {
    try {
      // Update config with options
      if (options) {
        this.engine.updateConfig({
          ...this.config,
          ...options
        });
      }

      // Initialize engine with data
      const initialized = await this.engine.initialize(profileData, workoutData);
      if (!initialized) {
        throw new Error('Failed to initialize internal prompt engine');
      }

      // Generate recommendations
      const result = await this.engine.generateRecommendations();

      aiLogger.debug('InternalWorkoutGeneration - Generated recommendations', {
        recommendationCount: result.recommendations.length,
        confidence: result.analysis.confidenceLevel,
        processingTime: result.analysis.processingTime
      });

      return result;

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'internal workout generation',
        component: 'InternalWorkoutGeneration',
        severity: 'high',
        userImpact: true
      });
      throw error;
    }
  }

  /**
   * Get current status of the generation process
   */
  public getStatus(): string {
    return this.engine.getStatus();
  }

  /**
   * Get any errors that occurred during generation
   */
  public getErrors(): any[] {
    return this.engine.getErrors();
  }

  /**
   * Reset the workflow state
   */
  public reset(): void {
    this.engine.reset();
  }

  /**
   * Update workflow configuration
   */
  public updateConfig(config: Partial<InternalPromptConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    this.engine.updateConfig(this.config);
  }
}