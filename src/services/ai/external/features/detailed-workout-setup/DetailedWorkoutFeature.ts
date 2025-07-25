import { OpenAIService } from '../../OpenAIService';
import { WorkoutGenerationRequest, GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { PerWorkoutOptions, ValidationResult } from '../../../../../types/core';
import { DetailedWorkoutParams, DetailedWorkoutResult } from './types/detailed-workout.types';
import { DETAILED_WORKOUT_PROMPT_TEMPLATE } from './prompts/detailed-workout-generation.prompts';
import { DetailedWorkoutStrategy } from './workflow/DetailedWorkoutStrategy';
import { selectDetailedWorkoutPrompt } from './prompts/detailed-workout-generation.prompts';
import { DURATION_CONFIGS, SupportedDuration } from './prompts/duration-configs';

export interface DetailedWorkoutFeatureDependencies {
  openAIService?: OpenAIService; // ✅ Fixed: Use OpenAIService directly, but optional
  logger?: Console;
}

export class DetailedWorkoutFeature {
  private readonly strategy: DetailedWorkoutStrategy;
  private readonly openAIService?: OpenAIService;
  private readonly logger: Console;

  constructor({ openAIService, logger = console }: DetailedWorkoutFeatureDependencies) {
    this.strategy = new DetailedWorkoutStrategy();
    this.openAIService = openAIService;
    this.logger = logger;
  }

  /**
   * Generate detailed workout using unified AI service
   */
  async generateWorkout(params: DetailedWorkoutParams): Promise<DetailedWorkoutResult> {
    try {
      // Get strategy for this workout
      const strategyResult = this.strategy.selectStrategy(params);

      // Get prompt template based on duration
      const promptTemplate = this.selectPromptTemplate(params);

      // Generate workout using the OpenAIService directly
      if (!this.openAIService) {
        throw new Error('OpenAIService not available for detailed workout generation');
      }
      
      const result = await this.openAIService.generateFromTemplate(promptTemplate, {
        duration: params.duration,
        fitnessLevel: params.fitnessLevel,
        focus: params.focus,
        energyLevel: params.energyLevel,
        sorenessAreas: params.sorenessAreas,
        equipment: params.equipment,
        trainingGoals: params.trainingGoals,
        experienceLevel: params.experienceLevel,
        timeAvailable: params.timeAvailable,
        intensityPreference: params.intensityPreference,
        workoutStructure: params.workoutStructure
      });

      // Parse and validate the result
      const workout = this.parseWorkoutResult(result);
      
      return {
        workout,
        metadata: {
          complexity: strategyResult.complexity,
          estimatedCalories: this.calculateEstimatedCalories(params),
          targetMuscleGroups: this.determineTargetMuscleGroups(params),
          recommendedFrequency: this.getRecommendedFrequency(strategyResult.workoutType),
          progressionLevel: this.calculateProgressionLevel(params)
        },
        recommendations: await this.generateRecommendations(params, workout),
        progressionPlan: {
          currentLevel: this.calculateProgressionLevel(params),
          nextLevel: Math.min(this.calculateProgressionLevel(params) + 1, 5),
          requirements: ['Complete 3 workouts at current level'],
          estimatedTimeToProgress: '2 weeks',
          adaptations: ['Increase weight by 5%', 'Add 1 set to each exercise']
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate detailed workout:', error);
      return this.generateFallbackWorkout(params, 'general');
    }
  }

  /**
   * ✅ Added: Missing validation method for training details
   */
  async validateTrainingDetails(details: any): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!details.goals || details.goals.length === 0) {
      errors.push('At least one training goal is required');
    }

    if (!details.experienceLevel) {
      errors.push('Experience level is required');
    }

    if (!details.intensityPreference) {
      errors.push('Intensity preference is required');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'Training details are valid',
      details: { errors }
    };
  }

  /**
   * ✅ Added: Missing validation method for exercise selections
   */
  async validateExerciseSelections(selections: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const conflicts: any[] = [];

    // Check for conflicting include/exclude selections
    if (selections.include && selections.exclude) {
      const conflictingExercises = selections.include.filter(
        (exercise: string) => selections.exclude.includes(exercise)
      );
      
      if (conflictingExercises.length > 0) {
        conflicts.push({
          message: `Cannot both include and exclude: ${conflictingExercises.join(', ')}`,
          severity: 'high',
          fields: ['customization_include', 'customization_exclude'],
          suggestion: {
            label: 'Remove from exclude list',
            action: () => {} // Will be implemented by calling component
          }
        });
      }
    }

    // Check equipment compatibility
    if (selections.include && selections.equipment) {
      const incompatibleExercises = this.checkEquipmentCompatibility(
        selections.include,
        selections.equipment
      );
      
      if (incompatibleExercises.length > 0) {
        conflicts.push({
          message: `Selected exercises require equipment not available: ${incompatibleExercises.join(', ')}`,
          severity: 'medium',
          fields: ['customization_include', 'customization_equipment']
        });
      }
    }

    return {
      isValid: errors.length === 0 && conflicts.length === 0,
      message: conflicts.length > 0 
        ? 'Exercise selection conflicts detected'
        : 'Exercise selections are valid',
      details: { errors, conflicts }
    };
  }

  /**
   * ✅ Added: Missing validation method for workout configuration
   */
  async validateWorkoutConfiguration(options: PerWorkoutOptions): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate duration
    if (!options.customization_duration) {
      errors.push('Workout duration is required');
    }

    // Validate focus
    if (!options.customization_focus) {
      errors.push('Workout focus is required');
    }

    // Validate equipment
    if (!options.customization_equipment || options.customization_equipment.length === 0) {
      errors.push('At least one equipment option is required (or select "No equipment")');
    }

    // Validate energy level
    if (options.customization_energy === undefined || options.customization_energy < 1 || options.customization_energy > 10) {
      errors.push('Energy level must be between 1 and 10');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'Configuration is valid',
      details: { errors }
    };
  }

  /**
   * ✅ Added: Missing validation method for physical state
   */
  async validatePhysicalState(state: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate energy level
    if (state.energyLevel === undefined || state.energyLevel < 1 || state.energyLevel > 10) {
      errors.push('Energy level must be between 1 and 10');
    }

    // Validate soreness areas (optional but if provided should be valid)
    if (state.sorenessAreas && !Array.isArray(state.sorenessAreas)) {
      errors.push('Soreness areas must be an array');
    }

    // Validate training load data (optional but if provided should be valid)
    if (state.trainingLoad) {
      if (typeof state.trainingLoad !== 'object' || state.trainingLoad === null) {
        errors.push('Training load must be an object');
      } else {
        // Validate recentActivities array
        if (!Array.isArray(state.trainingLoad.recentActivities)) {
          errors.push('Training load recentActivities must be an array');
        } else {
          // Validate each activity
          state.trainingLoad.recentActivities.forEach((activity: any, index: number) => {
            if (typeof activity !== 'object' || activity === null) {
              errors.push(`Training activity ${index + 1} must be an object`);
            } else {
              if (typeof activity.type !== 'string') {
                errors.push(`Training activity ${index + 1} type must be a string`);
              }
              if (!['light', 'moderate', 'intense'].includes(activity.intensity)) {
                errors.push(`Training activity ${index + 1} intensity must be light, moderate, or intense`);
              }
              if (typeof activity.duration !== 'number' || activity.duration <= 0) {
                errors.push(`Training activity ${index + 1} duration must be a positive number`);
              }
              if (typeof activity.date !== 'string') {
                errors.push(`Training activity ${index + 1} date must be a string`);
              }
            }
          });
        }

        // Validate weeklyVolume
        if (typeof state.trainingLoad.weeklyVolume !== 'number' || state.trainingLoad.weeklyVolume < 0) {
          errors.push('Training load weeklyVolume must be a non-negative number');
        }

        // Validate averageIntensity
        if (!['light', 'moderate', 'intense'].includes(state.trainingLoad.averageIntensity)) {
          errors.push('Training load averageIntensity must be light, moderate, or intense');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'Physical state is valid',
      details: { errors }
    };
  }

  /**
   * ✅ Added: Missing validation method for workout structure
   */
  async validateWorkoutStructure(structure: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate duration
    if (!structure.duration || structure.duration < 10 || structure.duration > 180) {
      errors.push('Duration must be between 10 and 180 minutes');
    }

    // Validate focus
    if (!structure.focus) {
      errors.push('Workout focus is required');
    }

    // Validate equipment
    if (!structure.equipment || structure.equipment.length === 0) {
      errors.push('At least one equipment option is required');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'Workout structure is valid',
      details: { errors }
    };
  }

  private generateFallbackWorkout(params: DetailedWorkoutParams, workoutType: string): DetailedWorkoutResult {
    this.logger.warn('Using fallback workout generation - AI service not available');
    
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

  // Private helper methods
  private parseWorkoutResult(result: unknown): GeneratedWorkout {
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch {
        throw new Error('Invalid workout result format');
      }
    }
    return result as GeneratedWorkout;
  }

  private calculateEstimatedCalories(params: DetailedWorkoutParams): number {
    const baseCalories = params.duration * 8; // ~8 calories per minute baseline
    const intensityMultiplier = {
      low: 0.8,
      moderate: 1.0,
      high: 1.3
    }[params.intensityPreference] || 1.0;
    
    return Math.round(baseCalories * intensityMultiplier);
  }

  private determineTargetMuscleGroups(params: DetailedWorkoutParams): string[] {
    // Enhanced implementation - based on focus
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
    const frequencyMap: Record<string, string> = {
      strength: '2-3 times per week',
      cardio: '3-5 times per week',
      recovery: 'as needed',
      hybrid: '3-4 times per week',
      'sport-specific': 'based on sport schedule'
    };
    
    return frequencyMap[workoutType] || '3-4 times per week';
  }

  private calculateProgressionLevel(params: DetailedWorkoutParams): number {
    let level = 1;
    
    if (params.fitnessLevel.includes('some')) level = 2;
    if (params.fitnessLevel.includes('advanced')) level = 3;
    if (params.intensityPreference === 'high') level += 1;
    if (params.equipment.length > 3) level += 1;
    
    return Math.min(level, 5);
  }

  private async generateRecommendations(params: DetailedWorkoutParams, workout: GeneratedWorkout): Promise<any[]> {
    const recommendations = [];

    // Add intensity recommendations
    if (params.energyLevel < 5 && params.intensityPreference === 'high') {
      recommendations.push({
        type: 'modification',
        description: 'Consider reducing intensity due to low energy level',
        priority: 'high',
        context: { energyLevel: params.energyLevel }
      });
    }

    // Add progression recommendations
    if (params.fitnessLevel.includes('new')) {
      recommendations.push({
        type: 'progression',
        description: 'Focus on form over intensity for first 2-4 weeks',
        priority: 'high',
        context: { fitnessLevel: params.fitnessLevel }
      });
    }

    return recommendations;
  }

  private checkEquipmentCompatibility(exercises: string[], availableEquipment: string[]): string[] {
    // This would need a proper exercise database to implement fully
    // For now, return empty array (no conflicts)
    return [];
  }
} 