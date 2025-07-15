// User profile interface for personalization
export interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferences: {
    workoutStyle?: string[];
    timePreference?: 'morning' | 'afternoon' | 'evening';
    intensityPreference?: 'low' | 'moderate' | 'high' | 'variable';
    advancedFeatures?: boolean;
    aiAssistanceLevel?: 'minimal' | 'moderate' | 'comprehensive';
  };
  limitations?: {
    injuries?: string[];
    timeConstraints?: number; // max minutes
    equipmentConstraints?: string[];
    physicalLimitations?: string[];
  };
  history?: {
    completedWorkouts?: number;
    averageDuration?: number;
    preferredFocusAreas?: string[];
    progressiveEnhancementUsage?: Record<string, number>;
    aiRecommendationAcceptance?: number;
  };
  learningProfile?: {
    prefersSimplicity?: boolean;
    explorationTendency?: 'conservative' | 'moderate' | 'adventurous';
    feedbackPreference?: 'minimal' | 'detailed' | 'comprehensive';
  };
}

// User fitness levels
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

// User goals
export type UserGoal = 
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness'
  | 'recovery'
  | 'athletic_performance';

// User preferences
export interface UserPreferences {
  workoutStyle: string[];
  timePreference: 'morning' | 'afternoon' | 'evening';
  intensityPreference: 'low' | 'moderate' | 'high' | 'variable';
  advancedFeatures: boolean;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
}

// User limitations
export interface UserLimitations {
  injuries: string[];
  timeConstraints: number;
  equipmentConstraints: string[];
  physicalLimitations: string[];
}

// User history
export interface UserHistory {
  completedWorkouts: number;
  averageDuration: number;
  preferredFocusAreas: string[];
  progressiveEnhancementUsage: Record<string, number>;
  aiRecommendationAcceptance: number;
}

// User learning profile
export interface UserLearningProfile {
  prefersSimplicity: boolean;
  explorationTendency: 'conservative' | 'moderate' | 'adventurous';
  feedbackPreference: 'minimal' | 'detailed' | 'comprehensive';
} 