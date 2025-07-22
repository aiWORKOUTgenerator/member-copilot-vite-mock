// Unified Workout Generation Types - Single Source of Truth
// This file consolidates the competing WorkoutGenerationRequest implementations
// from workout-results.types.ts and external-ai.types.ts

import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions, WorkoutType } from './enhanced-workout-types';
import { UserProfile } from './user';

// ============================================================================
// UNIFIED WORKOUT GENERATION REQUEST INTERFACE
// ============================================================================

/**
 * Unified WorkoutGenerationRequest interface that serves both app-level and AI service needs
 * This consolidates the competing implementations from:
 * - workout-results.types.ts (app-level)
 * - external-ai.types.ts (AI service-level)
 */
export interface WorkoutGenerationRequest {
  // Core App-Level Data (from workout-results.types.ts)
  workoutType: WorkoutType;           // 'quick' | 'detailed'
  profileData: ProfileData;           // User profile data from forms
  waiverData?: LiabilityWaiverData;   // Liability waiver data
  workoutFocusData: PerWorkoutOptions; // Workout customization data
  userProfile: UserProfile;           // Enhanced user profile with AI insights
  
  // AI Service-Level Enhancements (from external-ai.types.ts)
  preferences?: WorkoutPreferences;    // AI-generated preferences
  constraints?: WorkoutConstraints;    // AI-detected constraints
  environmentalFactors?: EnvironmentalFactors; // Environmental context
}

// ============================================================================
// AI SERVICE ENHANCEMENT TYPES
// ============================================================================

export interface WorkoutPreferences {
  duration: number; // in minutes
  focus: string;
  intensity: 'low' | 'moderate' | 'high';
  equipment: string[];
  location: 'home' | 'gym' | 'outdoor';
  music?: boolean;
  voiceGuidance?: boolean;
}

export interface WorkoutConstraints {
  timeOfDay: string;
  energyLevel: number;
  sorenessAreas: string[];
  injuries?: string[];
  spaceLimitations?: string[];
  noiselevel?: 'quiet' | 'moderate' | 'loud';
}

export interface EnvironmentalFactors {
  weather?: string;
  temperature?: number;
  humidity?: number;
  airQuality?: string;
}

// ============================================================================
// WORKOUT REQUEST ADAPTER UTILITY
// ============================================================================

/**
 * Utility class for transforming between different workout request formats
 * and enhancing basic requests with AI-generated insights
 */
export class WorkoutRequestAdapter {
  
  /**
   * Create a basic workout request from app-level data
   */
  static createBasicRequest(
    workoutType: WorkoutType,
    profileData: ProfileData,
    workoutFocusData: PerWorkoutOptions,
    userProfile: UserProfile,
    waiverData?: LiabilityWaiverData
  ): WorkoutGenerationRequest {
    return {
      workoutType,
      profileData,
      workoutFocusData,
      userProfile,
      waiverData
    };
  }

  /**
   * Enhance a basic request with AI-generated insights
   */
  static enhanceRequest(
    basicRequest: WorkoutGenerationRequest,
    aiEnhancements?: {
      preferences?: WorkoutPreferences;
      constraints?: WorkoutConstraints;
      environmentalFactors?: EnvironmentalFactors;
    }
  ): WorkoutGenerationRequest {
    return {
      ...basicRequest,
      preferences: aiEnhancements?.preferences,
      constraints: aiEnhancements?.constraints,
      environmentalFactors: aiEnhancements?.environmentalFactors
    };
  }

  /**
   * Extract AI service-specific data from unified request
   */
  static extractAIServiceData(request: WorkoutGenerationRequest): {
    userProfile: UserProfile;
    workoutOptions: PerWorkoutOptions;
    preferences: WorkoutPreferences | undefined;
    constraints: WorkoutConstraints | undefined;
    environmentalFactors: EnvironmentalFactors | undefined;
  } {
    return {
      userProfile: request.userProfile,
      workoutOptions: request.workoutFocusData,
      preferences: request.preferences,
      constraints: request.constraints,
      environmentalFactors: request.environmentalFactors
    };
  }

  /**
   * Create default AI enhancements based on user profile and workout data
   */
  static createDefaultEnhancements(
    _userProfile: UserProfile,
    workoutFocusData: PerWorkoutOptions
  ): {
    preferences: WorkoutPreferences;
    constraints: WorkoutConstraints;
    environmentalFactors: EnvironmentalFactors;
  } {
    return {
      preferences: {
        duration: workoutFocusData.customization_duration as number || 30,
        focus: workoutFocusData.customization_focus as string || 'general',
        intensity: 'moderate',
        equipment: Array.isArray(workoutFocusData.customization_equipment) 
          ? workoutFocusData.customization_equipment 
          : [],
        location: 'home',
        music: false,
        voiceGuidance: false
      },
      constraints: {
        timeOfDay: 'morning',
        energyLevel: workoutFocusData.customization_energy || 5,
        sorenessAreas: [],
        spaceLimitations: [],
        noiselevel: 'moderate'
      },
      environmentalFactors: {
        weather: 'indoor',
        temperature: 20,
        airQuality: 'good'
      }
    };
  }
}



// ============================================================================
// RE-EXPORT COMMON TYPES
// ============================================================================

// Re-export GeneratedWorkout for convenience
export type { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';

// Re-export workout display types from workout-results.types.ts
export interface WorkoutDisplayProps {
  workout: GeneratedWorkout;
  onRegenerate?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isRegenerating?: boolean;
}

export interface ExerciseDisplayProps {
  exercise: Exercise;
  showModifications?: boolean;
  showNotes?: boolean;
  compact?: boolean;
}

export interface WorkoutPhaseDisplayProps {
  phase: WorkoutPhase;
  title: string;
  isActive?: boolean;
  onExerciseClick?: (exercise: Exercise) => void;
}

// Re-export exercise types from external-ai.types.ts
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

export interface ExerciseModification {
  type: 'easier' | 'harder' | 'injury' | 'equipment';
  description: string;
  instructions: string;
}

export interface DifficultyAdjustment {
  level: 'new to exercise' | 'some experience' | 'advanced athlete';
  modification: string;
  reasoning: string;
}

export interface WorkoutPhase {
  name: string;
  duration: number;
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

// Re-export state and error types
export interface WorkoutGenerationState {
  isGenerating: boolean;
  generatedWorkout: GeneratedWorkout | null;
  error: string | null;
  generationProgress: number;
  lastGenerated: Date | null;
}

export interface WorkoutGenerationError {
  code: 'GENERATION_FAILED' | 'INVALID_DATA' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: any;
  retryable: boolean;
}

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