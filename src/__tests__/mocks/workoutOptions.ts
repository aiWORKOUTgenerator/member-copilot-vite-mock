import { PerWorkoutOptions, DurationConfigurationData, CategoryRatingData } from '../../types';

export const mockWorkoutOptions: PerWorkoutOptions = {
  customization_duration: {
    duration: 45,
    warmupDuration: 5,
    mainDuration: 35,
    cooldownDuration: 5,
    metadata: {
      intensity: 'moderate',
      timeOfDay: 'morning'
    }
  } as DurationConfigurationData,
  customization_focus: {
    focus: 'strength',
    label: 'Strength Training',
    metadata: {
      intensity: 'moderate',
      equipment: 'moderate',
      experience: 'some experience',
      duration_compatibility: [30, 45, 60]
    }
  },
  customization_equipment: ['dumbbells', 'bodyweight'],
  customization_areas: ['upper_body', 'core'],
  customization_energy: {
    rating: 7,
    categories: ['feeling_energetic', 'ready_to_train']
  } as CategoryRatingData,
  customization_intensity: 'moderate',
  customization_exercisePreference: 'compound',
  customization_progressionStyle: 'moderate',
  customization_restPeriods: 'moderate'
}; 