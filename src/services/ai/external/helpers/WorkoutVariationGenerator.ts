// Workout Variation Generator - Handles creation of workout variations and progressive workouts
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { WORKOUT_GENERATOR_CONSTANTS } from '../constants/workout-generator-constants';

export class WorkoutVariationGenerator {
  /**
   * Create a variation of the original request
   */
  static createVariation(
    originalRequest: WorkoutGenerationRequest,
    variationIndex: number
  ): WorkoutGenerationRequest {
    const variations = ['circuit', 'intervals', 'strength_focus', 'cardio_focus'];
    const variationType = variations[variationIndex % variations.length];
    
    return {
      ...originalRequest,
      preferences: {
        ...originalRequest.preferences,
        focus: `${originalRequest.preferences.focus} - ${variationType}`
      }
    };
  }

  /**
   * Create a progressive request for week-based progression
   */
  static createProgressiveRequest(
    baseRequest: WorkoutGenerationRequest,
    week: number
  ): WorkoutGenerationRequest {
    // Gradually increase intensity and complexity
    const intensityProgression = ['low', 'moderate', 'moderate', 'high'];
    const durationProgression = WORKOUT_GENERATOR_CONSTANTS.PROGRESSION_MULTIPLIERS;
    
    return {
      ...baseRequest,
      preferences: {
        ...baseRequest.preferences,
        intensity: intensityProgression[Math.min(week - 1, 3)] as 'low' | 'moderate' | 'high',
        duration: Math.round(baseRequest.preferences.duration * durationProgression[Math.min(week - 1, 3)])
      }
    };
  }

  /**
   * Create an adapted request with specific modifications
   */
  static createAdaptedRequest(
    baseRequest: WorkoutGenerationRequest,
    adaptations: {
      newDuration?: number;
      newEquipment?: string[];
      newIntensity?: 'low' | 'moderate' | 'high';
      newFocus?: string;
    }
  ): WorkoutGenerationRequest {
    return {
      ...baseRequest,
      preferences: {
        ...baseRequest.preferences,
        duration: adaptations.newDuration ?? baseRequest.preferences.duration,
        equipment: adaptations.newEquipment ?? baseRequest.preferences.equipment,
        intensity: adaptations.newIntensity ?? baseRequest.preferences.intensity,
        focus: adaptations.newFocus ?? baseRequest.preferences.focus
      }
    };
  }
} 