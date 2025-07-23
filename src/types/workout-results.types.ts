// Workout Results Types for Display and Generation
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions } from './core';
// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';
import { UserProfile } from './user';

// Base interface for common properties
interface BaseWorkoutRequest {
  profileData: ProfileData;
  waiverData?: LiabilityWaiverData;
  workoutFocusData: PerWorkoutOptions;
  userProfile: UserProfile;
}

// Quick workout request
interface QuickWorkoutRequest extends BaseWorkoutRequest {
  type: 'quick';
  // Quick workout specific properties can be added here
}

// Detailed workout request
interface DetailedWorkoutRequest extends BaseWorkoutRequest {
  type: 'detailed';
  // Detailed workout specific properties can be added here
}

// Union type for all workout requests
export type WorkoutGenerationRequest = QuickWorkoutRequest | DetailedWorkoutRequest;

// Workout Generation State
export interface WorkoutGenerationState {
  isGenerating: boolean;
  generatedWorkout: GeneratedWorkout | null;
  error: string | null;
  generationProgress: number;
  lastGenerated: Date | null;
}

// Workout Display Props
export interface WorkoutDisplayProps {
  workout: GeneratedWorkout;
  onRegenerate?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isRegenerating?: boolean;
}

// Exercise Display Props
export interface ExerciseDisplayProps {
  exercise: Exercise;
  showModifications?: boolean;
  showNotes?: boolean;
  compact?: boolean;
}

// Workout Phase Display Props
export interface WorkoutPhaseDisplayProps {
  phase: WorkoutPhase;
  title: string;
  isActive?: boolean;
  onExerciseClick?: (exercise: Exercise) => void;
}

// Exercise from external AI types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration?: number;
  sets?: number;
  reps?: number;
  restTime?: number;
  equipment?: string[];
  form?: string;
  modifications?: ExerciseModification[];
  commonMistakes?: string[];
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  movementType?: 'cardio' | 'strength' | 'flexibility' | 'balance';
  personalizedNotes?: string[];
  difficultyAdjustments?: DifficultyAdjustment[];
}

// Exercise Modification
export interface ExerciseModification {
  type: 'easier' | 'harder' | 'injury' | 'equipment';
  description: string;
  instructions: string;
}

// Difficulty Adjustment
export interface DifficultyAdjustment {
  level: 'new to exercise' | 'some experience' | 'advanced athlete';
  modification: string;
  reasoning: string;
}

// Workout Phase
export interface WorkoutPhase {
  name: string;
  duration: number;
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

// Workout Analytics Data
export interface WorkoutAnalytics {
  totalCalories: number;
  muscleGroups: string[];
  intensity: 'low' | 'moderate' | 'high';
  equipment: string[];
  estimatedDifficulty: number;
  completionTime: number;
}

// Workout Actions
export interface WorkoutActions {
  regenerate: () => Promise<void>;
  download: () => Promise<void>;
  share: (platform?: 'email' | 'social' | 'copy') => Promise<void>;
  save: () => Promise<void>;
  rate: (rating: number) => Promise<void>;
}

// Workout Generation Error
export interface WorkoutGenerationError {
  code: 'GENERATION_FAILED' | 'INVALID_DATA' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: any;
  retryable: boolean;
}

// Workout Generation Options
export interface WorkoutGenerationOptions {
  useCache?: boolean;
  timeout?: number;
  retryAttempts?: number;
  fallbackToRuleBased?: boolean;
}

export type WorkoutGenerationStatus = 
  | 'idle' 
  | 'validating' 
  | 'generating' 
  | 'enhancing' 
  | 'complete' 
  | 'error'; 