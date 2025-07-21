// External AI Service Types
import { PrioritizedRecommendation, GlobalAIContext } from '../../core/types/AIServiceTypes';
import { AIInsight } from '../../../../types/insights';
// PerWorkoutOptions and UserProfile are now imported from the unified types
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';

// OpenAI Configuration
export interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-3.5-turbo';
  maxTokens: number;
  temperature: number;
  organizationId?: string;
  baseURL?: string;
}

// AI Strategy Interface
export interface AIStrategy {
  generateRecommendations(context: GlobalAIContext): Promise<PrioritizedRecommendation[]>;
  generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout>;
  enhanceInsights(insights: AIInsight[], context: GlobalAIContext): Promise<AIInsight[]>;
  analyzeUserPreferences(context: GlobalAIContext): Promise<UserPreferenceAnalysis>;
}

// Workout Generation Types - MIGRATED TO workout-generation.types.ts
// Use the unified WorkoutGenerationRequest from '../../../types/workout-generation.types'

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

// Generated Workout Structure
export interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  estimatedCalories: number;
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  equipment: string[];
  
  // Workout Structure
  warmup: WorkoutPhase;
  mainWorkout: WorkoutPhase;
  cooldown: WorkoutPhase;
  
  // AI Insights
  reasoning: string;
  personalizedNotes: string[];
  progressionTips: string[];
  safetyReminders: string[];
  
  // Metadata
  generatedAt: Date;
  aiModel: string;
  confidence: number;
  tags: string[];
}

export interface WorkoutPhase {
  name: string;
  duration: number;
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration?: number; // for timed exercises
  repetitions?: number; // for rep-based exercises
  sets?: number;
  restTime?: number; // in seconds
  equipment?: string[];
  
  // Exercise guidance
  form: string;
  modifications: ExerciseModification[];
  commonMistakes: string[];
  
  // Targeting
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementType: 'cardio' | 'strength' | 'flexibility' | 'balance';
  
  // Media
  videoUrl?: string;
  imageUrl?: string;
  
  // AI enhancements
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

// Enhanced Recommendation Types
export interface EnhancedRecommendation extends PrioritizedRecommendation {
  aiGenerated: boolean;
  personalizedReasoning: string;
  scientificBasis?: string;
  userSpecificFactors: string[];
  alternativeOptions: AlternativeOption[];
  followUpQuestions?: string[];
}

export interface AlternativeOption {
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
}

// User Analysis Types
export interface UserPreferenceAnalysis {
  preferredWorkoutStyles: string[];
  optimalWorkoutTimes: string[];
  motivationFactors: string[];
  challengeAreas: string[];
  strengthAreas: string[];
  recommendedProgression: ProgressionPlan;
  personalityInsights: PersonalityInsights;
}

export interface ProgressionPlan {
  currentLevel: string;
  nextMilestones: Milestone[];
  timeframe: string;
  keyFocusAreas: string[];
  potentialChallenges: string[];
}

export interface Milestone {
  title: string;
  description: string;
  estimatedWeeks: number;
  successMetrics: string[];
}

export interface PersonalityInsights {
  workoutStyle: 'structured' | 'flexible' | 'varied';
  motivationType: 'intrinsic' | 'extrinsic' | 'mixed';
  preferredChallengeLevel: 'gradual' | 'moderate' | 'aggressive';
  socialPreference: 'solo' | 'group' | 'partner';
  feedbackStyle: 'encouraging' | 'direct' | 'analytical';
}

// OpenAI API Response Types
export interface OpenAIResponse {
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
  model: string;
  created: number;
}

export interface OpenAIChoice {
  message: OpenAIMessage;
  finish_reason: string;
  index: number;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Error Types
export interface ExternalAIError {
  type: 'api_error' | 'rate_limit' | 'invalid_request' | 'authentication' | 'network';
  message: string;
  code?: string;
  retryAfter?: number;
  details?: any;
}

// Performance Monitoring
export interface ExternalAIMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  costEstimate: number;
  cacheHitRate: number;
}

// Feature Flag Types
export interface ExternalAIFeatureFlags {
  openai_workout_generation: boolean;
  openai_enhanced_recommendations: boolean;
  openai_user_analysis: boolean;
  openai_real_time_coaching: boolean;
  openai_fallback_enabled: boolean;
}

// Configuration Types
export interface ExternalAIServiceConfig {
  openai: OpenAIConfig;
  features: ExternalAIFeatureFlags;
  performance: {
    maxRequestsPerMinute: number;
    timeoutMs: number;
    retryAttempts: number;
    cacheTimeoutMs: number;
  };
  fallback: {
    enabled: boolean;
    strategy: 'rule_based' | 'cached' | 'simplified';
  };
}

// Prompt Engineering Types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  examples: PromptExample[];
  version: string;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
}

export interface PromptExample {
  input: Record<string, any>;
  expectedOutput: any;
  description: string;
}

// Caching Types
export interface CacheKey {
  userId: string;
  requestType: string;
  parameters: string;
  timestamp: number;
}

export interface CacheEntry<T> {
  key: CacheKey;
  data: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

// Integration Types
export interface ExternalAIIntegration {
  service: AIStrategy;
  config: ExternalAIServiceConfig;
  metrics: ExternalAIMetrics;
  isHealthy: boolean;
  lastHealthCheck: Date;
}

// Webhook Types for real-time updates
export interface WorkoutProgressUpdate {
  userId: string;
  workoutId: string;
  progress: number;
  currentExercise: string;
  heartRate?: number;
  fatigue?: number;
  difficulty?: 'too_easy' | 'just_right' | 'too_hard';
  aiAdjustments?: Exercise[];
} 