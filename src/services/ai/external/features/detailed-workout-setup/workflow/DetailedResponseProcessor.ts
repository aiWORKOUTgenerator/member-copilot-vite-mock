import { DetailedWorkoutParams, DetailedWorkoutResult, DetailedWorkoutMetadata, EnhancedRecommendation } from '../types/detailed-workout.types';
import { DETAILED_WORKOUT_CONSTANTS } from '../constants/detailed-workout.constants';

export class DetailedResponseProcessor {
  /**
   * Processes raw AI response into a structured DetailedWorkoutResult
   */
  processResponse(response: any, params: DetailedWorkoutParams): DetailedWorkoutResult {
    // Validate and enhance the core workout
    const workout = this.validateWorkoutStructure(response);

    // Generate metadata
    const metadata = this.generateWorkoutMetadata(workout, params);

    // Generate recommendations
    const recommendations = this.generateRecommendations(workout, params);

    // Generate progression plan if appropriate
    const progressionPlan = this.shouldIncludeProgressionPlan(params) 
      ? this.generateProgressionPlan(workout, params)
      : undefined;

    return {
      workout,
      metadata,
      recommendations,
      progressionPlan
    };
  }

  /**
   * Validates and enhances the workout structure
   */
  private validateWorkoutStructure(response: any): any {
    // Ensure required sections exist
    if (!response.exercises || !Array.isArray(response.exercises)) {
      throw new Error('Invalid workout structure: missing exercises array');
    }

    // Enhance exercise data
    const enhancedExercises = response.exercises.map((exercise: any) => ({
      ...exercise,
      // Add any missing required fields
      intensity: exercise.intensity || 'moderate',
      restPeriod: exercise.restPeriod || '60s',
      formCues: exercise.formCues || [],
      modifications: exercise.modifications || {
        easier: null,
        harder: null
      }
    }));

    return {
      ...response,
      exercises: enhancedExercises,
      // Ensure metadata exists
      metadata: {
        ...response.metadata,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  /**
   * Generates enhanced metadata for the workout
   */
  private generateWorkoutMetadata(workout: any, params: DetailedWorkoutParams): DetailedWorkoutMetadata {
    const exerciseCount = workout.exercises.length;
    const totalSets = workout.exercises.reduce((acc: number, ex: any) => acc + (ex.sets || 1), 0);
    
    return {
      complexity: this.determineWorkoutComplexity(workout, params),
      estimatedCalories: this.calculateEstimatedCalories(workout, params),
      targetMuscleGroups: this.extractTargetMuscleGroups(workout),
      recommendedFrequency: this.determineRecommendedFrequency(params),
      progressionLevel: this.calculateProgressionLevel(workout, params)
    };
  }

  /**
   * Generates workout-specific recommendations
   */
  private generateRecommendations(workout: any, params: DetailedWorkoutParams): EnhancedRecommendation[] {
    const recommendations: EnhancedRecommendation[] = [];

    // Form-related recommendations
    const complexExercises = workout.exercises.filter((ex: any) => 
      ex.complexity === 'advanced' || ex.type === 'compound'
    );
    
    if (complexExercises.length > 0) {
      recommendations.push({
        type: 'form',
        description: 'Focus on proper form for complex movements',
        priority: 'high',
        context: {
          exercises: complexExercises.map((ex: any) => ex.name)
        }
      });
    }

    // Progression recommendations
    if (this.shouldIncludeProgressionPlan(params)) {
      recommendations.push({
        type: 'progression',
        description: 'Ready for exercise progression on key movements',
        priority: 'medium',
        context: {
          currentLevel: this.calculateProgressionLevel(workout, params)
        }
      });
    }

    // Modification recommendations based on energy/soreness
    if (params.energyLevel <= 3 || params.sorenessAreas.length > 0) {
      recommendations.push({
        type: 'modification',
        description: 'Consider exercise modifications for recovery',
        priority: 'high',
        context: {
          energyLevel: params.energyLevel,
          sorenessAreas: params.sorenessAreas
        }
      });
    }

    return recommendations;
  }

  /**
   * Determines if progression plan should be included
   */
  private shouldIncludeProgressionPlan(params: DetailedWorkoutParams): boolean {
    return params.experienceLevel !== 'beginner' && 
           params.duration >= 45 &&
           params.intensityPreference !== 'low';
  }

  /**
   * Generates a progression plan if appropriate
   */
  private generateProgressionPlan(workout: any, params: DetailedWorkoutParams): any {
    const currentLevel = this.calculateProgressionLevel(workout, params);
    
    return {
      currentLevel,
      nextLevel: currentLevel + 1,
      requirements: [
        'Complete 3 workouts at current level',
        'Maintain proper form throughout',
        'Energy level 7+ during workouts'
      ],
      estimatedTimeToProgress: '2 weeks',
      adaptations: [
        'Increase weight by 5-10%',
        'Add 1 set to primary exercises',
        'Reduce rest periods by 15-30s'
      ]
    };
  }

  /**
   * Determines workout complexity based on exercises and parameters
   */
  private determineWorkoutComplexity(workout: any, params: DetailedWorkoutParams): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const { experienceLevel, duration, intensityPreference } = params;
    const hasComplexExercises = workout.exercises.some((ex: any) => ex.complexity === 'advanced');
    
    if (experienceLevel === 'advanced' && hasComplexExercises && duration >= 60) {
      return 'expert';
    }
    
    if (hasComplexExercises || (duration >= 45 && intensityPreference === 'high')) {
      return 'advanced';
    }
    
    if (experienceLevel === 'beginner' || duration <= 30) {
      return 'beginner';
    }
    
    return 'intermediate';
  }

  /**
   * Calculates estimated calories based on workout intensity and duration
   */
  private calculateEstimatedCalories(workout: any, params: DetailedWorkoutParams): number {
    const baseRate = {
      low: 5,
      moderate: 7,
      high: 10
    }[params.intensityPreference];

    const totalMinutes = params.duration;
    return Math.round(baseRate * totalMinutes);
  }

  /**
   * Extracts target muscle groups from workout
   */
  private extractTargetMuscleGroups(workout: any): string[] {
    const muscleGroups = new Set<string>();
    
    workout.exercises.forEach((exercise: any) => {
      if (exercise.targetMuscles) {
        exercise.targetMuscles.forEach((muscle: string) => muscleGroups.add(muscle));
      }
    });

    return Array.from(muscleGroups);
  }

  /**
   * Determines recommended workout frequency
   */
  private determineRecommendedFrequency(params: DetailedWorkoutParams): string {
    const workoutType = params.trainingGoals[0] || 'strength';
    if (workoutType in DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS) {
      return DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS[workoutType as keyof typeof DETAILED_WORKOUT_CONSTANTS.DETAILED_CONFIGS].recommendedFrequency;
    }
    return '3-4 times per week';
  }

  /**
   * Calculates current progression level
   */
  private calculateProgressionLevel(workout: any, params: DetailedWorkoutParams): number {
    const baseLevel = {
      beginner: 1,
      intermediate: 2,
      advanced: 3
    }[params.experienceLevel] || 1;

    const complexityBonus = workout.exercises.filter((ex: any) => 
      ex.complexity === 'advanced'
    ).length;

    return Math.min(baseLevel + Math.floor(complexityBonus / 2), 5);
  }
} 