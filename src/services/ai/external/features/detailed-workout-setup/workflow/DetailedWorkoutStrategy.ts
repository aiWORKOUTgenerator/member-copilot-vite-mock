import { DetailedWorkoutParams, DetailedWorkoutStrategyResult } from '../types/detailed-workout.types';
import { DETAILED_WORKOUT_CONSTANTS, DetailedWorkoutType, ComplexityLevel } from '../constants/detailed-workout.constants';
import { PromptTemplate } from '../../../types/external-ai.types';

export class DetailedWorkoutStrategy {
  selectStrategy(params: DetailedWorkoutParams): DetailedWorkoutStrategyResult {
    return {
      workoutType: this.determineWorkoutType(params),
      promptTemplate: this.selectPromptTemplate(params),
      complexity: this.determineComplexity(params)
    };
  }

  private determineWorkoutType(params: DetailedWorkoutParams): DetailedWorkoutType {
    // Minimal implementation - just basic type determination
    if (params.sorenessAreas.length > 0) {
      return 'recovery';
    }

    if (params.duration >= 45 && params.intensityPreference === 'high') {
      return 'sport-specific';
    }

    if (params.trainingGoals.includes('cardio') || params.trainingGoals.includes('endurance')) {
      return 'cardio';
    }

    if (params.trainingGoals.includes('strength') || params.trainingGoals.includes('muscle')) {
      return 'strength';
    }

    return 'hybrid';
  }

  private selectPromptTemplate(params: DetailedWorkoutParams): PromptTemplate {
    // Minimal implementation - delegate to legacy system
    // This will be replaced with proper prompt selection in future
    return {
      id: 'detailed_workout_v1',
      name: 'Detailed Workout Generation',
      description: 'Generates comprehensive, personalized workout plans',
      version: '1.0',
      template: '', // Will be populated by legacy bridge
      variables: []
    };
  }

  private determineComplexity(params: DetailedWorkoutParams): ComplexityLevel {
    // Minimal implementation - basic complexity determination
    if (params.experienceLevel === 'new to exercise') {
      return 'beginner';
    }

    if (params.duration >= 60 && params.intensityPreference === 'high') {
      return 'expert';
    }

    if (params.duration >= 45 || params.intensityPreference === 'high') {
      return 'advanced';
    }

    return 'intermediate';
  }
} 