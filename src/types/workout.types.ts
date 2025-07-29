import { ProfileData } from '../components/Profile/types/profile.types';
import { PerWorkoutOptions } from './core';
import { FitnessLevel, WorkoutFocus, WorkoutIntensity } from './core';

/**
 * Workout generation request
 */
export interface WorkoutGenerationRequest {
  profileData: ProfileData;
  workoutFocusData: PerWorkoutOptions;
  preferences?: {
    workoutStyle: string[];
    timePreference: string;
    intensityPreference: string;
    advancedFeatures: boolean;
    aiAssistanceLevel: 'low' | 'moderate' | 'high';
  };
}

/**
 * Workout generation options
 */
export interface WorkoutGenerationOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  useExternalAI?: boolean;
  fallbackToInternal?: boolean;
  recommendations?: any[];
  enhancedPrompt?: string;
}

/**
 * Generated workout
 */
export interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  estimatedCalories: number;
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  equipment: string[];
  warmup: WorkoutPhase;
  mainWorkout: WorkoutPhase;
  cooldown: WorkoutPhase;
  reasoning: string;
  personalizedNotes: string[];
  progressionTips: string[];
  safetyReminders: string[];
  generatedAt: Date;
  aiModel: string;
  confidence: number;
  tags: string[];
}

/**
 * Workout phase
 */
export interface WorkoutPhase {
  name: string;
  duration: number;
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

/**
 * Exercise in generated workout
 */
export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration?: number;
  repetitions?: number;
  sets?: number;
  restTime?: number;
  equipment?: string[];
  form: string;
  modifications: ExerciseModification[];
  commonMistakes: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementType: 'strength' | 'cardio' | 'flexibility' | 'balance';
  videoUrl?: string;
  imageUrl?: string;
  personalizedNotes?: string[];
  difficultyAdjustments?: DifficultyAdjustment[];
}

/**
 * Exercise modification
 */
export interface ExerciseModification {
  type: 'easier' | 'harder' | 'injury' | 'equipment';
  description: string;
  instructions: string;
}

/**
 * Difficulty adjustment
 */
export interface DifficultyAdjustment {
  level: 'new to exercise' | 'some experience' | 'advanced athlete';
  modification: string;
  reasoning: string;
}

/**
 * Workout generation state
 */
export interface WorkoutGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error' | 'cancelled';
  generationProgress: number;
  error: string | null;
}

/**
 * Internal prompt context
 */
export interface InternalContext {
  profile: {
    fitnessLevel: FitnessLevel;
    experienceLevel: string;
    primaryGoal: string;
    injuries: string[];
    preferredActivities: string[];
    availableEquipment: string[];
    availableLocations: string[];
    calculatedWorkoutIntensity?: WorkoutIntensity;
  };
  workout: {
    focus: WorkoutFocus;
    duration: number;
    energyLevel: number;
    intensity?: WorkoutIntensity;
    equipment: string[];
    areas?: string[];
    soreness?: {
      rating: number;
      areas?: string[];
    };
  };
  preferences: {
    workoutStyle: string[];
    timePreference: string;
    intensityPreference: string;
    advancedFeatures: boolean;
    aiAssistanceLevel: 'low' | 'moderate' | 'high';
  };
}