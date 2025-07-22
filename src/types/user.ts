// User Profile Type System

export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';
export type TimePreference = 'morning' | 'afternoon' | 'evening';
export type IntensityLevel = 'low' | 'moderate' | 'high';
export type AIAssistanceLevel = 'minimal' | 'moderate' | 'comprehensive';
export type RecoveryStatus = 'minimal' | 'partial' | 'full';
export type ExplorationTendency = 'low' | 'moderate' | 'high';
export type FeedbackPreference = 'simple' | 'detailed';

export type PreferredActivity = 
  | 'strength_training'
  | 'cardio'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'bodyweight'
  | 'crossfit'
  | 'running'
  | 'cycling'
  | 'swimming';

// User-provided preferences
export interface UserPreferences {
  workoutStyle: string[];
  timePreference: TimePreference;
  intensityPreference: IntensityLevel;
  advancedFeatures: boolean;
  aiAssistanceLevel: AIAssistanceLevel;
}

// User-provided basic limitations
export interface UserBasicLimitations {
  injuries: string[];
  availableEquipment: string[];
  availableLocations: string[];
}

// AI-generated enhanced limitations
export interface AIEnhancedLimitations {
  timeConstraints: number; // calculated from duration + commitment
  equipmentConstraints: string[]; // filtered and prioritized
  locationConstraints: string[]; // filtered and prioritized locations
  recoveryNeeds: {
    restDays: number;
    sleepHours: number;
    hydrationLevel: 'low' | 'moderate' | 'high';
  };
  mobilityLimitations: string[]; // inferred from age, injuries, activity
  progressionRate: 'conservative' | 'moderate' | 'aggressive';
}

// AI-generated workout history
export interface AIWorkoutHistory {
  estimatedCompletedWorkouts: number;
  averageDuration: number;
  preferredFocusAreas: string[]; // inferred from goals and preferences
  progressiveEnhancementUsage: Record<string, number>;
  aiRecommendationAcceptance: number; // 0-1 scale
  consistencyScore: number; // 0-1 scale based on activity level
  plateauRisk: 'low' | 'moderate' | 'high';
}

// AI-generated learning profile
export interface AILearningProfile {
  prefersSimplicity: boolean; // based on experience level
  explorationTendency: ExplorationTendency; // based on activity level and goals
  feedbackPreference: FeedbackPreference; // based on experience level
  learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';
  motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement';
  adaptationSpeed: 'slow' | 'moderate' | 'fast';
}

// Complete user profile with clear separation
export interface UserProfile {
  // User-provided core data
  fitnessLevel: FitnessLevel;
  goals: string[];
  preferences: UserPreferences;
  basicLimitations: UserBasicLimitations;
  
  // Optional personal metrics (from ProfileData)
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // AI-generated enhanced data
  enhancedLimitations: AIEnhancedLimitations;
  workoutHistory: AIWorkoutHistory;
  learningProfile: AILearningProfile;
}

// Workout Environment Types
export interface EnvironmentalFactors {
  timeOfDay: TimePreference;
  location: 'home' | 'gym' | 'outdoor';
  availableTime: number;
}

export interface RecentActivity {
  lastWorkoutDate: Date;
  lastWorkoutType: string;
  recoveryStatus: RecoveryStatus;
} 