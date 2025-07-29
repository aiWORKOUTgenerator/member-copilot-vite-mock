import { 
  WorkoutGenerationRequest
} from '../types/workout.types';
import { InternalPromptContext } from '../services/ai/internal/types/internal-prompt.types';
import { FitnessLevel, WorkoutFocus, WorkoutIntensity } from '../types/core';

/**
 * Transform workout generation request to internal prompt context
 */
export const transformToInternalContext = (request: WorkoutGenerationRequest): InternalPromptContext => {
  const { profileData, workoutFocusData, preferences } = request;

  // Default preferences
  const defaultPreferences = {
    workoutStyle: [],
    timePreference: 'anytime',
    intensityPreference: 'moderate',
    advancedFeatures: false,
    aiAssistanceLevel: 'moderate' as const
  };

  // Transform profile data
  const profile = {
    fitnessLevel: profileData.calculatedFitnessLevel || 'intermediate' as FitnessLevel,
    experienceLevel: profileData.experienceLevel,
    primaryGoal: profileData.primaryGoal,
    injuries: profileData.injuries.filter(injury => injury !== 'No Injuries'),
    preferredActivities: profileData.preferredActivities,
    availableEquipment: profileData.availableEquipment,
    availableLocations: profileData.availableLocations,
    calculatedWorkoutIntensity: profileData.calculatedWorkoutIntensity as WorkoutIntensity
  };

  // Transform workout data
  const workout = {
    focus: workoutFocusData.customization_focus as WorkoutFocus,
    duration: Number(workoutFocusData.customization_duration || 30),
    energyLevel: Number(workoutFocusData.customization_energy || 7),
    intensity: workoutFocusData.customization_intensity as WorkoutIntensity,
    equipment: workoutFocusData.customization_equipment || [],
    areas: workoutFocusData.customization_areas,
    soreness: workoutFocusData.customization_soreness ? {
      rating: typeof workoutFocusData.customization_soreness === 'number' ? 
        workoutFocusData.customization_soreness : 
        workoutFocusData.customization_soreness.rating,
      areas: Array.isArray(workoutFocusData.customization_soreness) ? 
        workoutFocusData.customization_soreness : 
        workoutFocusData.customization_soreness.areas
    } : undefined
  };

  return {
    profile,
    workout,
    preferences: preferences || defaultPreferences
  };
};