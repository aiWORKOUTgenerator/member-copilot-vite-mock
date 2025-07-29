import { PerWorkoutOptions, CategoryRatingData } from '../../types/core';

export const mockWorkoutOptions: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 30,
  customization_energy: {
    rating: 7,
    categories: ['feeling_energetic', 'ready_to_train']
  } as CategoryRatingData,
  customization_intensity: 'moderate',
  customization_equipment: ['dumbbells', 'body weight'],
  customization_areas: ['upper body', 'core'],
  customization_soreness: {
    rating: 3,
    categories: ['mild_soreness', 'shoulders']
  } as CategoryRatingData
}; 