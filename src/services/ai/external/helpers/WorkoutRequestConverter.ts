// Workout Request Converter - Handles conversion of Quick Workout data to WorkoutGenerationRequest
import { WorkoutGenerationRequest, WorkoutPreferences, WorkoutConstraints } from '../../../../types/workout-generation.types';
import { PerWorkoutOptions, UserProfile } from '../../../../types';
import { dataTransformers } from '../../../../utils/dataTransformers';

export class WorkoutRequestConverter {
  /**
   * Convert Quick Workout data to WorkoutGenerationRequest
   */
  static convertQuickWorkoutToRequest(
    quickWorkoutData: PerWorkoutOptions,
    userProfile: UserProfile
  ): WorkoutGenerationRequest {
    // Extract preferences from Quick Workout data
    const preferences: WorkoutPreferences = {
      duration: dataTransformers.extractDurationValue(quickWorkoutData.customization_duration) ?? 30,
      focus: dataTransformers.extractFocusValue(quickWorkoutData.customization_focus) ?? 'General Fitness',
      intensity: WorkoutRequestConverter.mapEnergyToIntensity(quickWorkoutData.customization_energy ?? 5),
      equipment: dataTransformers.extractEquipmentList(quickWorkoutData.customization_equipment),
      location: 'home', // Default for Quick Workout
      music: true,
      voiceGuidance: false
    };

    // Extract constraints
    const constraints: WorkoutConstraints = {
      timeOfDay: 'morning', // Default
      energyLevel: quickWorkoutData.customization_energy ?? 5,
      sorenessAreas: dataTransformers.extractSorenessAreas(quickWorkoutData.customization_soreness),
      spaceLimitations: ['small_space'], // Common for Quick Workout
      noiselevel: 'moderate'
    };

    return {
      userProfile,
      workoutOptions: quickWorkoutData,
      preferences,
      constraints,
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    };
  }

  /**
   * Map energy level to workout intensity
   */
  static mapEnergyToIntensity(energyLevel: number): 'low' | 'moderate' | 'high' {
    if (energyLevel <= 3) return 'low';
    if (energyLevel <= 7) return 'moderate';
    return 'high';
  }

  /**
   * Prepare variables for prompt generation
   */
  static preparePromptVariables(request: WorkoutGenerationRequest): Record<string, string | number | string[] | boolean> {
    return {
      // User profile
      fitnessLevel: request.userProfile.fitnessLevel,
      goals: request.userProfile.goals ?? [],
      preferredIntensity: request.preferences.intensity,

      // Current state
      energyLevel: request.constraints?.energyLevel ?? 5,
      sorenessAreas: request.constraints?.sorenessAreas ?? [],
      duration: request.preferences.duration,
      focus: request.preferences.focus,

      // Preferences & constraints
      equipment: request.preferences.equipment,
      location: request.preferences.location,
      timeOfDay: request.constraints?.timeOfDay ?? 'morning',
      noiseLevel: request.constraints?.noiselevel ?? 'moderate',
      spaceLimitations: request.constraints?.spaceLimitations ?? [],

      // Environmental factors
      weather: request.environmentalFactors?.weather ?? 'indoor',
      temperature: request.environmentalFactors?.temperature ?? 'comfortable',

      // Special considerations
      injuries: request.constraints?.injuries ?? [],
      previousWorkout: 'None provided'
    };
  }
} 