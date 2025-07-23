import { DetailedWorkoutParams, DetailedWorkoutResult, DetailedWorkoutDependencies } from './types/detailed-workout.types';
import { DetailedWorkoutStrategy } from './workflow/DetailedWorkoutStrategy';
import { LegacyPromptBridge } from './prompts/legacy-bridge';

export class DetailedWorkoutFeature {
  private strategy: DetailedWorkoutStrategy;
  private openAIService: any; // TODO: Replace with proper type
  private logger: any; // TODO: Replace with proper type

  constructor(dependencies: DetailedWorkoutDependencies) {
    this.strategy = new DetailedWorkoutStrategy();
    this.openAIService = dependencies.openAIService;
    this.logger = dependencies.logger;
  }

  async generateWorkout(params: DetailedWorkoutParams): Promise<DetailedWorkoutResult> {
    try {
      // Get strategy for this workout
      const strategyResult = this.strategy.selectStrategy(params);

      // Get prompt from legacy system
      const promptTemplate = LegacyPromptBridge.getPromptTemplate(params);

      // Generate workout using OpenAI
      const response = await this.openAIService.generateFromTemplate(promptTemplate, {
        fitnessLevel: params.fitnessLevel,
        goals: params.trainingGoals,
        duration: params.duration,
        equipment: params.equipment,
        location: 'home', // TODO: Make dynamic
        energyLevel: params.energyLevel,
        sorenessAreas: params.sorenessAreas,
        focus: params.focus
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