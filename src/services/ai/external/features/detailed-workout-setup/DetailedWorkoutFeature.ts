import { DetailedWorkoutParams, DetailedWorkoutResult } from './types/detailed-workout.types';
import { DetailedWorkoutStrategy } from './workflow/DetailedWorkoutStrategy';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { DURATION_CONFIGS, SupportedDuration } from './prompts/duration-configs';
import { OpenAIService } from '../../OpenAIService';

export interface DetailedWorkoutFeatureDependencies {
  openAIService?: OpenAIService;
  logger?: Console;
}

export class DetailedWorkoutFeature {
  private readonly strategy: DetailedWorkoutStrategy;
  private readonly openAIService?: OpenAIService;
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

      // Check if OpenAI service is available
      if (!this.openAIService) {
        return this.generateFallbackWorkout(params, strategyResult.workoutType);
      }

      // Generate workout using OpenAI
      const response = await this.openAIService.generateFromTemplate(
        promptTemplate.template,
        {
          fitnessLevel: params.fitnessLevel,
          goals: params.trainingGoals,
          duration: params.duration,
          equipment: params.equipment,
          location: 'home', // TODO: Make dynamic
          energyLevel: params.energyLevel,
          sorenessAreas: params.sorenessAreas,
          focus: params.focus
        },
        {
          maxTokens: params.duration >= 30 ? 8000 : 4000,
          timeout: params.duration >= 30 ? 120000 : 60000
        }
      );

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

  private generateFallbackWorkout(params: DetailedWorkoutParams, workoutType: string): DetailedWorkoutResult {
    this.logger.warn('Using fallback workout generation - OpenAI service not available');
    
    return {
      workout: {
        id: `fallback_${Date.now()}`,
        title: `${params.duration}-Minute ${params.focus} Workout`,
        description: 'Basic workout generated without AI assistance',
        totalDuration: params.duration * 60,
        estimatedCalories: this.calculateEstimatedCalories(params),
        difficulty: params.fitnessLevel,
        equipment: params.equipment,
        warmup: this.createBasicPhase('Warm-up', Math.round(params.duration * 0.15)),
        mainWorkout: this.createBasicPhase('Main Workout', Math.round(params.duration * 0.7)),
        cooldown: this.createBasicPhase('Cool-down', Math.round(params.duration * 0.15)),
        reasoning: 'Basic workout structure based on duration and focus',
        personalizedNotes: [],
        progressionTips: [],
        safetyReminders: ['Focus on proper form', 'Stay hydrated', 'Stop if you feel pain'],
        generatedAt: new Date(),
        aiModel: 'fallback',
        confidence: 0.5,
        tags: ['fallback', params.focus.toLowerCase()]
      },
      metadata: {
        complexity: 'beginner',
        estimatedCalories: this.calculateEstimatedCalories(params),
        targetMuscleGroups: this.determineTargetMuscleGroups(params),
        recommendedFrequency: this.getRecommendedFrequency(workoutType),
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
  }

  private createBasicPhase(name: string, duration: number) {
    return {
      name,
      duration: duration * 60, // Convert to seconds
      exercises: [
        {
          id: `${name.toLowerCase()}_1`,
          name: `Basic ${name} Exercise`,
          description: `Perform ${name.toLowerCase()} exercises`,
          duration: duration * 60,
          form: `Perform ${name.toLowerCase()} exercises with proper form`,
          modifications: [],
          commonMistakes: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          movementType: 'strength',
          personalizedNotes: [],
          difficultyAdjustments: []
        }
      ],
      instructions: `Complete ${name.toLowerCase()} phase`,
      tips: []
    };
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