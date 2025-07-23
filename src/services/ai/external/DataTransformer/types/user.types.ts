// UserProfile types bridge for DataTransformer system
// This keeps UserProfile types within the DataTransformer architecture

export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'night';
export type IntensityLevel = 'low' | 'moderate' | 'high'; // Matches WorkoutIntensity from profile.types.ts
export type AIAssistanceLevel = 'minimal' | 'moderate' | 'high';

export interface UserPreferences {
  workoutStyle: string[];
  timePreference: TimePreference;
  intensityPreference: IntensityLevel;
  advancedFeatures: boolean;
  aiAssistanceLevel: AIAssistanceLevel;
}

export interface UserBasicLimitations {
  injuries: string[];
  availableEquipment: string[];
  availableLocations: string[];
}

export interface RecoveryNeeds {
  restDays: number;
  sleepHours: number;
  hydrationLevel: 'low' | 'moderate' | 'high';
}

export interface AIEnhancedLimitations {
  timeConstraints: number;
  equipmentConstraints: string[];
  locationConstraints: string[];
  recoveryNeeds: RecoveryNeeds;
  mobilityLimitations: string[];
  progressionRate: 'conservative' | 'moderate' | 'aggressive';
}

export interface ProgressiveEnhancementUsage {
  [key: string]: {
    lastUsed: string;
    successRate: number;
    difficulty: number;
  };
}

export interface AIWorkoutHistory {
  estimatedCompletedWorkouts: number;
  averageDuration: number;
  preferredFocusAreas: string[];
  progressiveEnhancementUsage: ProgressiveEnhancementUsage;
  aiRecommendationAcceptance: number;
  consistencyScore: number;
  plateauRisk: 'low' | 'moderate' | 'high';
}

export interface AILearningProfile {
  prefersSimplicity: boolean;
  explorationTendency: 'low' | 'moderate' | 'high';
  feedbackPreference: 'simple' | 'detailed';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  motivationType: 'intrinsic' | 'extrinsic' | 'social';
  adaptationSpeed: 'slow' | 'moderate' | 'fast';
}

export interface UserProfile {
  fitnessLevel: FitnessLevel;
  goals: string[];
  preferences: UserPreferences;
  basicLimitations: UserBasicLimitations;
  enhancedLimitations: AIEnhancedLimitations;
  workoutHistory: AIWorkoutHistory;
  learningProfile: AILearningProfile;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
} 