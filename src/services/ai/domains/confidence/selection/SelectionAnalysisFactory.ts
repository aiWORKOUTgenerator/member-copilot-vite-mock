// Selection Analysis Factory - Provides easy integration and configuration
import { SelectionAnalyzer } from './SelectionAnalyzer';
import { SelectionAnalysisConfig, SelectionAnalysisContext } from './types/selection-analysis.types';
import { UserProfile } from '../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../types/core';
import { aiLogger } from '../../../logging/AILogger';
import { FeatureFlagService } from '../../../featureFlags/FeatureFlagService';

/**
 * Factory for creating and configuring selection analysis services
 * Provides easy integration with workout generation pipeline
 */
export class SelectionAnalysisFactory {
  private static instance: SelectionAnalyzer | null = null;
  private static featureFlagService: FeatureFlagService | null = null;

  /**
   * Get singleton instance of selection analysis service
   */
  static getInstance(config?: Partial<SelectionAnalysisConfig>): SelectionAnalyzer {
    if (!this.instance) {
      this.instance = new SelectionAnalyzer(config);
      aiLogger.debug('SelectionAnalysisFactory: Created new selection analysis service instance', {
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
   * Check if selection analysis is enabled via feature flag
   */
  static isSelectionAnalysisEnabled(userProfile?: UserProfile): boolean {
    if (!userProfile) {
      return false; // Require user profile for feature flag evaluation
    }
    
    try {
      const flagService = this.getFeatureFlagService();
      return flagService.isEnabled('ai_selection_analysis', userProfile);
    } catch (error) {
      aiLogger.warn('SelectionAnalysisFactory: Feature flag check failed, defaulting to disabled', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false; // Default to disabled on error
    }
  }

  /**
   * Analyze user's workout selections
   * Returns null if selection analysis is disabled
   */
  static async analyzeSelections(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<{
    overallScore: number;
    factors: {
      goalAlignment: { score: number; status: string; reasoning: string };
      intensityMatch: { score: number; status: string; reasoning: string };
      durationFit: { score: number; status: string; reasoning: string };
      recoveryRespect: { score: number; status: string; reasoning: string };
      equipmentOptimization: { score: number; status: string; reasoning: string };
    };
    insights: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      factor: string;
      priority: number;
      actionable: boolean;
    }>;
    suggestions: Array<{
      id: string;
      action: string;
      description: string;
      impact: string;
      estimatedScoreIncrease: number;
      quickFix: boolean;
      category: string;
      timeRequired: string;
      priority: number;
    }>;
    educationalContent: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      priority: number;
      learnMoreUrl?: string;
    }>;
  } | null> {
    const analysisStartTime = Date.now();
    
    if (!this.isSelectionAnalysisEnabled(userProfile)) {
      aiLogger.debug('SelectionAnalysisFactory: Selection analysis disabled via feature flag, skipping', {
        context: 'selection analysis',
        component: 'SelectionAnalysisFactory',
        userProfile: {
          fitnessLevel: userProfile.fitnessLevel,
          goalsCount: userProfile.goals?.length || 0
        },
        analysisContext: {
          generationType: context.generationType,
          userExperience: context.userExperience,
          timeOfDay: context.timeOfDay
        }
      });
      return null;
    }

    try {
      aiLogger.debug('SelectionAnalysisFactory: Starting analysis', {
        context: 'selection analysis',
        component: 'SelectionAnalysisFactory',
        userProfile: {
          fitnessLevel: userProfile.fitnessLevel,
          goalsCount: userProfile.goals?.length || 0,
          basicLimitations: {
            injuriesCount: userProfile.basicLimitations?.injuries?.length || 0,
            availableEquipmentCount: userProfile.basicLimitations?.availableEquipment?.length || 0
          }
        },
        workoutOptions: {
          focus: workoutOptions.customization_focus,
          energy: workoutOptions.customization_energy,
          duration: workoutOptions.customization_duration,
          equipmentCount: workoutOptions.customization_equipment?.length || 0
        },
        analysisContext: context
      });

      const service = this.getInstance();
      const result = await service.analyzeSelections(userProfile, workoutOptions, context);

      const analysisTime = Date.now() - analysisStartTime;

      aiLogger.info('SelectionAnalysisFactory: Analysis completed successfully', {
        context: 'selection analysis',
        component: 'SelectionAnalysisFactory',
        analysisTime,
        overallScore: result.overallScore,
        factors: Object.keys(result.factors).map(factor => ({
          factor,
          score: result.factors[factor as keyof typeof result.factors]?.score || 0,
          status: result.factors[factor as keyof typeof result.factors]?.status || 'unknown'
        })),
        insightsCount: result.insights?.length || 0,
        suggestionsCount: result.suggestions?.length || 0,
        educationalContentCount: result.educationalContent?.length || 0
      });

      return {
        overallScore: result.overallScore,
        factors: {
          goalAlignment: {
            score: result.factors.goalAlignment.score,
            status: result.factors.goalAlignment.status,
            reasoning: result.factors.goalAlignment.reasoning
          },
          intensityMatch: {
            score: result.factors.intensityMatch.score,
            status: result.factors.intensityMatch.status,
            reasoning: result.factors.intensityMatch.reasoning
          },
          durationFit: {
            score: result.factors.durationFit.score,
            status: result.factors.durationFit.status,
            reasoning: result.factors.durationFit.reasoning
          },
          recoveryRespect: {
            score: result.factors.recoveryRespect.score,
            status: result.factors.recoveryRespect.status,
            reasoning: result.factors.recoveryRespect.reasoning
          },
          equipmentOptimization: {
            score: result.factors.equipmentOptimization.score,
            status: result.factors.equipmentOptimization.status,
            reasoning: result.factors.equipmentOptimization.reasoning
          }
        },
        insights: result.insights,
        suggestions: result.suggestions,
        educationalContent: result.educationalContent
      };
    } catch (error) {
      const analysisTime = Date.now() - analysisStartTime;
      
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'selection analysis',
        component: 'SelectionAnalysisFactory',
        severity: 'medium',
        userImpact: false,
        metadata: {
          analysisTime,
          userProfile: {
            fitnessLevel: userProfile.fitnessLevel,
            goalsCount: userProfile.goals?.length || 0
          },
          workoutOptions: {
            focus: workoutOptions.customization_focus,
            energy: workoutOptions.customization_energy,
            duration: workoutOptions.customization_duration
          },
          analysisContext: context
        }
      });

      // Return null on error to maintain backward compatibility
      return null;
    }
  }

  /**
   * Create a simplified context for selection analysis
   */
  static createContext(
    generationType: 'quick' | 'detailed' = 'detailed',
    userExperience?: 'first-time' | 'beginner' | 'intermediate' | 'advanced',
    previousWorkouts?: number,
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
  ): SelectionAnalysisContext {
    return {
      generationType,
      userExperience: userExperience || 'beginner',
      previousWorkouts,
      timeOfDay,
      environmentalFactors: {
        location: 'indoor' // Default assumption
      }
    };
  }

  /**
   * Get a quick analysis summary for UI display
   */
  static async getQuickAnalysis(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<{
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'poor';
    message: string;
    topSuggestion?: string;
  } | null> {
    const analysis = await this.analyzeSelections(userProfile, workoutOptions, context);
    
    if (!analysis) {
      return null;
    }

    const score = analysis.overallScore;
    let status: 'excellent' | 'good' | 'warning' | 'poor';
    let message: string;

    if (score >= 0.85) {
      status = 'excellent';
      message = 'Excellent selections! Your workout will be highly personalized.';
    } else if (score >= 0.7) {
      status = 'good';
      message = 'Good selections. Your workout will be well-suited to your needs.';
    } else if (score >= 0.5) {
      status = 'warning';
      message = 'Moderate selections. Consider the suggestions for better results.';
    } else {
      status = 'poor';
      message = 'Your selections may need adjustment for optimal results.';
    }

    const topSuggestion = analysis.suggestions.length > 0 ? analysis.suggestions[0].action : undefined;

    return {
      score,
      status,
      message,
      topSuggestion
    };
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Get service configuration
   */
  static getConfig(): SelectionAnalysisConfig {
    return this.getInstance().getConfig();
  }

  /**
   * Update service configuration
   */
  static updateConfig(config: Partial<SelectionAnalysisConfig>): void {
    this.getInstance().updateConfig(config);
  }

  /**
   * Clear analysis cache
   */
  static clearCache(): void {
    this.getInstance().clearCache();
  }
} 