import { UserProfile } from '../../types';

export const mockUserProfile: UserProfile = {
  id: 'test-user-1',
  fitnessLevel: 'intermediate',
  goals: ['strength', 'endurance'],
  preferences: {
    workoutDuration: 45,
    preferredEquipment: ['dumbbells', 'bodyweight'],
    focusAreas: ['upper_body', 'core']
  },
  restrictions: {
    injuries: [],
    limitedMovements: []
  },
  experience: {
    workoutsPerWeek: 3,
    yearsTraining: 2
  }
}; 