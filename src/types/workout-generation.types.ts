// Unified Workout Generation Types - Single Source of Truth
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions } from './core';
import { UserProfile } from './user';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error codes for workout generation
 */
export type WorkoutGenerationErrorCode = 
  | 'INVALID_DATA'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'GENERATION_FAILED'
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_DATA';

/**
 * Detailed error information for workout generation
 */
export interface WorkoutGenerationError {
  code: WorkoutGenerationErrorCode;
  message: string;
  retryable: boolean;
  retryAfter?: number;
  recoverySuggestion?: string;
  fallbackAvailable?: boolean;
  details?: any;
}

// ============================================================================
// WORKOUT PHASE INTERFACES
// ============================================================================

/**
 * Interface for a workout phase (warmup, main workout, cooldown)
 */
export interface WorkoutPhase {
  name: string;
  duration: number;  // Duration in seconds
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

/**
 * Interface for an exercise within a workout phase
 */
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number;  // Duration in seconds (for timed exercises)
  equipment: string[];
  instructions: string[];
  tips: string[];
  intensity: 'low' | 'moderate' | 'high';
  restBetweenSets: number;  // Rest duration in seconds
  substitutions?: Exercise[];
}

// ============================================================================
// GENERATED WORKOUT INTERFACE
// ============================================================================

/**
 * Complete generated workout structure returned by AI services
 */
export interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  totalDuration: number; // in seconds
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
  confidenceFactors?: {
    profileMatch: number;
    safetyAlignment: number;
    equipmentFit: number;
    goalAlignment: number;
    structureQuality: number;
  };
  tags: string[];
}

// ============================================================================
// WORKOUT GENERATION REQUEST TYPES
// ============================================================================

/**
 * Base interface for workout generation requests
 */
export interface BaseWorkoutRequest {
  profileData: ProfileData;
  waiverData?: LiabilityWaiverData;
  workoutFocusData: PerWorkoutOptions;
  userProfile: UserProfile;
}

/**
 * Quick workout generation request
 */
export interface QuickWorkoutRequest extends BaseWorkoutRequest {
  type: 'quick';
}

/**
 * Detailed workout generation request
 */
export interface DetailedWorkoutRequest extends BaseWorkoutRequest {
  type: 'detailed';
}

/**
 * Union type for all workout generation requests
 */
export type WorkoutGenerationRequest = QuickWorkoutRequest | DetailedWorkoutRequest;

// ============================================================================
// GENERATION OPTIONS AND STATE
// ============================================================================

/**
 * Options for workout generation
 */
export interface WorkoutGenerationOptions {
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  useFallback?: boolean;
  enableDetailedLogging?: boolean;
  useExternalAI?: boolean;
  fallbackToInternal?: boolean;
}

/**
 * State for workout generation
 */
export interface WorkoutGenerationState {
  status: WorkoutGenerationStatus;
  generationProgress: number;
  error: string | null;
  retryCount: number;
  lastError: WorkoutGenerationError | null;
  generatedWorkout?: GeneratedWorkout | null;
  lastGenerated?: Date | null;
}

/**
 * Status of workout generation
 */
export type WorkoutGenerationStatus = 
  | 'idle'
  | 'validating'
  | 'generating'
  | 'enhancing'
  | 'complete'
  | 'error'
  | 'cancelled';

// ============================================================================
// AI SERVICE ENHANCEMENT TYPES
// ============================================================================

export interface WorkoutPreferences {
  duration: number; // in minutes
  focus: string;
  intensity: 'low' | 'moderate' | 'high';
  equipment: string[];
  music?: boolean;
  voiceGuidance?: boolean;
}

export interface WorkoutConstraints {
  maxDuration?: number;
  minDuration?: number;
  excludedEquipment?: string[];
  excludedExercises?: string[];
  requiredRest?: number;
  intensityLimit?: 'low' | 'moderate' | 'high';
}

export interface EnvironmentalFactors {
  temperature?: number;
  humidity?: number;
  altitude?: number;
  location: 'indoor' | 'outdoor';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  weather?: string;
} 