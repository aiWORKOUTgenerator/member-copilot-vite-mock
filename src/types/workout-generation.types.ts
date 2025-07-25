// Unified Workout Generation Types - Single Source of Truth
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { PerWorkoutOptions } from './core';
import { UserProfile } from './user';

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
  difficulty: string;
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

// ============================================================================
// UNIFIED WORKOUT GENERATION REQUEST INTERFACE
// ============================================================================

/**
 * Unified WorkoutGenerationRequest interface that serves both app-level and AI service needs
 */
export interface WorkoutGenerationRequest {
  workoutType: 'quick' | 'detailed';
  profileData: ProfileData;
  waiverData?: LiabilityWaiverData;
  workoutFocusData: PerWorkoutOptions;
  userProfile: UserProfile;
  
  // AI Service-Level Enhancements
  preferences?: WorkoutPreferences;
  constraints?: WorkoutConstraints;
  environmentalFactors?: EnvironmentalFactors;

  // Workout Phase Data
  warmup?: WorkoutPhase;
  mainWorkout?: WorkoutPhase;
  cooldown?: WorkoutPhase;
  totalDuration?: number;
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