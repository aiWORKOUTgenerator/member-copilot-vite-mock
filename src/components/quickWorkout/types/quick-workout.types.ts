import { WorkoutFocusData } from '../../../schemas/workoutFocusSchema';
import { ViewMode } from '../../../types/core';
import { AIRecommendationContext, UserProfile } from '../../../types';

export interface QuickWorkoutFormProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
  onBack: () => void;
}

export interface SectionProps {
  focusData: any; // TODO: Type this properly based on your data structure
  onInputChange: (field: string, value: any) => void;
  viewMode: 'simple' | 'complex';
  userProfile?: UserProfile;
  _aiContext?: AIRecommendationContext; // Optional and marked as unused
} 