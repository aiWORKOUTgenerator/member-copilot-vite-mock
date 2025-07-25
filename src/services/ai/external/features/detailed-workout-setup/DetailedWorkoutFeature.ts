import { DetailedWorkoutParams, DetailedWorkoutResult } from './types/detailed-workout.types';
import { DetailedWorkoutStrategy } from './workflow/DetailedWorkoutStrategy';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { DURATION_CONFIGS, SupportedDuration } from './prompts/duration-configs';
import { AIService } from '../../../core/AIService';

export interface DetailedWorkoutFeatureDependencies {
  openAIService: AIService;
  logger?: Console;
}

export class DetailedWorkoutFeature {
  private readonly strategy: DetailedWorkoutStrategy;
  private readonly openAIService: AIService;
  private readonly logger: Console;

  constructor(dependencies: DetailedWorkoutFeatureDependencies) {
    this.strategy = new DetailedWorkoutStrategy();
    this.openAIService = dependencies.openAIService;
    this.logger = dependencies.logger || console;
  }

  async generateWorkout(params: DetailedWorkoutParams): Promise<DetailedWorkoutResult> {
    try {
      // Get strategy for this workout
      const strategyResult = this.strategy.selectStrategy(params);

      // Get prompt template based on duration
      const promptTemplate = this.selectPromptTemplate(params);

      // Generate workout using OpenAI
      const response = await this.openAIService.generateWorkout({
        fitnessLevel: params.fitnessLevel,
        goals: params.trainingGoals,
        duration: params.duration,
        equipment: params.equipment,
        location: 'home', // TODO: Make dynamic
        energyLevel: params.energyLevel,
        sorenessAreas: params.sorenessAreas,
        focus: params.focus,
        maxTokens: params.duration >= 30 ? 8000 : 4000,
        timeout: params.duration >= 30 ? 120000 : 60000
      });

      // Minimal response transformation
      return {
        workout: response,
        metadata: {
          complexity: strategyResult.complexity,
          estimatedCalories: this.calculateEstimatedCalories(params),
          targetMuscleGroups: this.determineTargetMuscleGroups(params),
          recommendedFrequency: this.getRecommendedFrequency(strategyResult.workoutType),
          progressionLevel: 1
        },
        recommendations: [],
        progressionPlan: {
          currentLevel: 1,
          nextLevel: 2,
          requirements: ['Complete 3 workouts at current level'],
          estimatedTimeToProgress: '2 weeks',
          adaptations: ['Increase weight by 5%', 'Add 1 set to each exercise']
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate detailed workout:', error);
      throw error;
    }
  }

  private selectPromptTemplate(params: DetailedWorkoutParams) {
    // First try to use duration-specific template if available
    const duration = params.duration as SupportedDuration;
    if (duration in DURATION_CONFIGS) {
      return DURATION_CONFIGS[duration];
    }

    // Fall back to general template selection
    return selectDetailedWorkoutPrompt(
      params.fitnessLevel,
      params.duration,
      params.sorenessAreas,
      params.focus
    );
  }

  private calculateEstimatedCalories(params: DetailedWorkoutParams): number {
    // Minimal implementation - rough estimation
    const baseCalories = params.duration * 5;
    const intensityMultiplier = {
      low: 1,
      moderate: 1.5,
      high: 2
    }[params.intensityPreference];

    return Math.round(baseCalories * intensityMultiplier);
  }

  private determineTargetMuscleGroups(params: DetailedWorkoutParams): string[] {
    // Minimal implementation - based on focus
    if (params.focus.toLowerCase().includes('core')) {
      return ['abs', 'obliques', 'lower back'];
    }
    if (params.focus.toLowerCase().includes('upper')) {
      return ['chest', 'back', 'shoulders', 'arms'];
    }
    if (params.focus.toLowerCase().includes('lower')) {
      return ['quads', 'hamstrings', 'calves', 'glutes'];
    }
    return ['full body'];
  }

  private getRecommendedFrequency(workoutType: string): string {
    // Minimal implementation - basic recommendations
    switch (workoutType) {
      case 'strength':
        return '2-3 times per week';
      case 'cardio':
        return '3-5 times per week';
      case 'recovery':
        return 'as needed';
      default:
        return '3-4 times per week';
    }
  }
} 