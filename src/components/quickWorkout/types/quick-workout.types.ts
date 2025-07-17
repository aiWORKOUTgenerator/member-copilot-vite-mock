import { WorkoutFocusData } from '../../../schemas/workoutFocusSchema';
import { ViewMode } from '../../../types/core';

export interface QuickWorkoutFormProps {
  onNavigate: (page: 'profile' | 'focus' | 'review' | 'results') => void;
  onBack: () => void;
}

export interface SectionProps {
  focusData: WorkoutFocusData;
  onInputChange: (field: keyof WorkoutFocusData, value: string | number) => void;
  viewMode: ViewMode;
} 