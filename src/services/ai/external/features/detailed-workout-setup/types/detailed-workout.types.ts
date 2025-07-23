import { GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { PromptTemplate } from '../../../types/external-ai.types';

export interface DetailedWorkoutDependencies {
  openAIService: any; // TODO: Replace with proper OpenAI service type
  logger: any; // TODO: Replace with proper logger type
}

export interface DetailedWorkoutParams {
  // Enhanced parameters beyond QuickWorkout
  duration: number;
  fitnessLevel: string;
  focus: string;
  energyLevel: number;
  sorenessAreas: string[];
  equipment: string[];
  
  // Detailed-specific parameters
  trainingGoals: string[];
  experienceLevel: string;
  timeAvailable: number;
  intensityPreference: 'low' | 'moderate' | 'high';
  workoutStructure: 'traditional' | 'circuit' | 'interval';
}

export interface DetailedWorkoutMetadata {
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedCalories: number;
  targetMuscleGroups: string[];
  recommendedFrequency: string;
  progressionLevel: number;
}

export interface EnhancedRecommendation {
  type: 'form' | 'progression' | 'modification' | 'alternative';
  description: string;
  priority: 'low' | 'medium' | 'high';
  context?: Record<string, any>;
}

export interface ProgressionPlan {
  currentLevel: number;
  nextLevel: number;
  requirements: string[];
  estimatedTimeToProgress: string;
  adaptations: string[];
}

export interface DetailedWorkoutResult {
  workout: GeneratedWorkout;
  metadata: DetailedWorkoutMetadata;
  recommendations: EnhancedRecommendation[];
  progressionPlan?: ProgressionPlan;
}

export interface DetailedWorkoutStrategyResult {
  workoutType: string;
  promptTemplate: PromptTemplate;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
} 