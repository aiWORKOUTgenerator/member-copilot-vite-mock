import { 
  InternalPromptContext, 
  InternalPromptConfig, 
  InternalPromptResult,
  InternalPromptError,
  InternalPromptStatus,
  InternalRecommendation,
  PromptBuilder,
  RecommendationStrategy
} from '../types/internal-prompt.types';
import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/core';
import { aiLogger } from '../../logging/AILogger';

export class InternalPromptEngine {
  private context: InternalPromptContext | null = null;
  private config: InternalPromptConfig;
  private status: InternalPromptStatus = 'idle';
  private errors: InternalPromptError[] = [];
  private startTime: number = 0;

  constructor(
    private profileBuilder: PromptBuilder,
    private workoutBuilder: PromptBuilder,
    private recommendationStrategy: RecommendationStrategy,
    config?: Partial<InternalPromptConfig>
  ) {
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
   * Initialize the prompt engine with profile and workout data
   */
  public async initialize(profileData: ProfileData, workoutData: PerWorkoutOptions): Promise<boolean> {
    try {
      this.startTime = Date.now();
      this.status = 'analyzing_profile';

      // Build profile context
      const profileContext = this.profileBuilder.buildContext(profileData);
      if (!this.profileBuilder.validate()) {
        throw this.createError('VALIDATION_ERROR', 'Invalid profile data', {
          errors: this.profileBuilder.getErrors()
        });
      }

      this.status = 'analyzing_workout';

      // Build workout context
      const workoutContext = this.workoutBuilder.buildContext(workoutData);
      if (!this.workoutBuilder.validate()) {
        throw this.createError('VALIDATION_ERROR', 'Invalid workout data', {
          errors: this.workoutBuilder.getErrors()
        });
      }

      // Combine contexts
      this.context = {
        ...profileContext as InternalPromptContext,
        ...workoutContext as InternalPromptContext
      };

      aiLogger.debug('InternalPromptEngine - Initialized with context', {
        hasProfileData: !!profileContext,
        hasWorkoutData: !!workoutContext,
        config: this.config
      });

      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * Generate recommendations using the internal prompt system
   */
  public async generateRecommendations(): Promise<InternalPromptResult> {
    if (!this.context) {
      throw this.createError('INVALID_CONTEXT', 'Context not initialized');
    }

    try {
      this.status = 'generating_recommendations';

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(this.createError('TIMEOUT', 'Analysis timeout exceeded'));
        }, this.config.analysisTimeout);
      });

      // Generate recommendations with timeout
      const recommendations = await Promise.race([
        this.recommendationStrategy.analyze(this.context, this.config),
        timeoutPromise
      ]);

      this.status = 'validating';

      // Validate recommendations
      if (!this.recommendationStrategy.validate(recommendations)) {
        throw this.createError('VALIDATION_ERROR', 'Invalid recommendations generated');
      }

      // Prioritize recommendations
      const prioritizedRecommendations = this.recommendationStrategy.prioritize(recommendations)
        .slice(0, this.config.maxRecommendations);

      // Filter by confidence threshold
      const finalRecommendations = prioritizedRecommendations.filter(
        rec => rec.confidence >= (this.config.confidenceThreshold || 0.7)
      );

      this.status = 'complete';

      // Calculate analysis metrics
      const processingTime = Date.now() - this.startTime;
      const confidenceLevel = this.calculateConfidenceLevel(finalRecommendations);
      const { profileScore, workoutScore, combinedScore } = this.calculateScores(finalRecommendations);

      return {
        recommendations: finalRecommendations,
        analysis: {
          profileScore,
          workoutScore,
          combinedScore,
          confidenceLevel,
          processingTime
        },
        context: this.context,
        variables: this.profileBuilder.buildVariables(this.context),
        config: this.config
      };

    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get current status of the prompt engine
   */
  public getStatus(): InternalPromptStatus {
    return this.status;
  }

  /**
   * Get any errors that occurred during processing
   */
  public getErrors(): InternalPromptError[] {
    return this.errors;
  }

  /**
   * Clear the current context and errors
   */
  public reset(): void {
    this.context = null;
    this.errors = [];
    this.status = 'idle';
    this.startTime = 0;
  }

  /**
   * Update the engine configuration
   */
  public updateConfig(config: Partial<InternalPromptConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }

  private calculateConfidenceLevel(recommendations: InternalRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    return recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
  }

  private calculateScores(recommendations: InternalRecommendation[]): {
    profileScore: number;
    workoutScore: number;
    combinedScore: number;
  } {
    const profileRecs = recommendations.filter(rec => rec.source === 'profile');
    const workoutRecs = recommendations.filter(rec => rec.source === 'workout');
    const combinedRecs = recommendations.filter(rec => rec.source === 'combined');

    return {
      profileScore: this.calculateScore(profileRecs),
      workoutScore: this.calculateScore(workoutRecs),
      combinedScore: this.calculateScore(combinedRecs)
    };
  }

  private calculateScore(recommendations: InternalRecommendation[]): number {
    if (recommendations.length === 0) return 0;

    const weightedSum = recommendations.reduce((sum, rec) => {
      const priorityWeight = rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 0.7 : 0.4;
      return sum + (rec.confidence * priorityWeight);
    }, 0);

    return weightedSum / recommendations.length;
  }

  private createError(type: InternalPromptError['type'], message: string, details?: any): InternalPromptError {
    return { type, message, details };
  }

  private handleError(error: any): void {
    const promptError = error as InternalPromptError;
    this.errors.push(promptError);
    this.status = 'error';

    aiLogger.error({
      error: error instanceof Error ? error : new Error(String(error)),
      context: 'internal prompt engine',
      component: 'InternalPromptEngine',
      severity: 'medium',
      userImpact: true,
      metadata: {
        status: this.status,
        errorType: promptError.type,
        details: promptError.details
      }
    });
  }
}