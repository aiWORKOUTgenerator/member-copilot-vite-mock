import { ProfileData } from '../Profile/types/profile.types';
import { LiabilityWaiverData } from '../LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions } from '../../types/core';
import { UseWorkoutGenerationReturn } from '../../hooks/useWorkoutGeneration';
import { GeneratedWorkout } from '../../services/ai/external/types/external-ai.types';
import { LucideIcon } from 'lucide-react';

export interface ReviewPageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  profileData: ProfileData | null;
  waiverData: LiabilityWaiverData | null;
  workoutFocusData: PerWorkoutOptions | null;
  workoutType: 'quick' | 'detailed';
  workoutGeneration: UseWorkoutGenerationReturn;
  onWorkoutGenerated: (workout: GeneratedWorkout) => void;
}

export interface ProfileSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  gradient: string;
}

export interface DataRowProps {
  label: string;
  value: string | string[] | React.ReactNode;
  icon?: LucideIcon;
  status?: 'success' | 'warning' | 'error' | 'info';
  statusIcon?: LucideIcon;
}

export interface DisplayWorkoutFocus {
  workoutFocus: string;
  workoutIntensity: string;
  workoutType: string;
  duration: string;
  focusAreas: string[];
  equipment: string[];
  energyLevel: string;
  currentSoreness: Array<{ area: string; level: number }>;
  includeExercises: string[];
  excludeExercises: string[];
} 