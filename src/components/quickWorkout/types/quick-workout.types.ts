import { WorkoutFocusData } from '../../../schemas/workoutFocusSchema';
import { ViewMode } from '../../../types/core';
import { AIRecommendationContext, UserProfile } from '../../../types';

export interface QuickWorkoutFormProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  onBack: () => void;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
}

export interface SectionProps {
  focusData: WorkoutFocusData | null;
  onInputChange: (field: string, value: number | string | boolean) => void;
  viewMode: 'simple' | 'complex';
  userProfile?: UserProfile;
  _aiContext?: AIRecommendationContext; // Optional and marked as unused
} 