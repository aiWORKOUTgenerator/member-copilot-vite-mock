// QuickWorkoutSetup Feature - Type Definitions
// Feature-specific types for quick workout generation workflow

import { GeneratedWorkout } from '../../../types/external-ai.types';
import { UserProfile } from '../../../../types';
import { DurationConfig } from '../constants/quick-workout.constants';

/**
 * Input parameters for quick workout generation
 */
export interface QuickWorkoutParams {
  // Core workout parameters
  duration: number;                    // Workout duration in minutes
  fitnessLevel: 'new to exercise' | 'some experience' | 'advanced athlete';
  focus: string;                       // Workout focus area
  
  // User state
  energyLevel: number;                 // Current energy level (1-10)
  sorenessAreas: string[];            // Areas of muscle soreness
  
  // Equipment and environment
  equipment: string[];                 // Available equipment
  location?: 'home' | 'gym' | 'outdoor';
  
  // Optional preferences
  intensity?: 'low' | 'moderate' | 'high';
  music?: boolean;
  voiceGuidance?: boolean;
  
  // Context information
  timeOfDay?: string;
  spaceLimitations?: string[];
  noiseLevel?: 'quiet' | 'moderate' | 'loud';
}

/**
 * Result from quick workout generation
 */
export interface QuickWorkoutResult {
  // Generated workout
  workout: GeneratedWorkout;
  
  // Generation metadata
  metadata: QuickWorkoutMetadata;
  
  // AI confidence and reasoning
  confidence: number;
  reasoning: string;
  
  // Feature-specific insights
  durationOptimization: DurationOptimization;
  personalizedNotes: string[];
  safetyReminders: string[];
}

/**
 * Metadata about the workout generation process
 */
export interface QuickWorkoutMetadata {
  // Generation details
  generatedAt: Date;
  generationTime: number;              // Time taken to generate (ms)
  aiModel: string;
  
  // Configuration used
  durationConfig: DurationConfig;
  promptTemplate: string;
  
  // Input processing
  originalDuration: number;
  adjustedDuration: number;
  durationAdjustmentReason?: string;
  
  // Feature flags
  featuresUsed: string[];
  fallbacksUsed: string[];
}

/**
 * Duration optimization information
 */
export interface DurationOptimization {
  // Duration analysis
  requestedDuration: number;
  actualDuration: number;
  isOptimal: boolean;
  
  // Time allocation
  phaseAllocation: {
    warmup: number;                    // Time in seconds
    main: number;                      // Time in seconds
    cooldown: number;                  // Time in seconds
  };
  
  // Optimization recommendations
  recommendations: string[];
  alternativeDurations: number[];
}

/**
 * Workflow context for the quick workout generation process
 */
export interface WorkflowContext {
  // Input parameters
  params: QuickWorkoutParams;
  userProfile: UserProfile;
  
  // Processing state
  selectedDuration: number;
  durationConfig: DurationConfig;
  
  // Prompt building
  promptVariables: Record<string, unknown>;
  selectedPromptId: string;
  
  // Generation state
  generationStartTime: number;
  retryCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * Duration strategy result
 */
export interface DurationStrategyResult {
  // Selected configuration
  config: DurationConfig;
  adjustedDuration: number;
  
  // Analysis
  isExactMatch: boolean;
  adjustmentReason?: string;
  
  // Recommendations
  recommendations: string[];
  alternativeOptions: DurationConfig[];
}

/**
 * Prompt selection result
 */
export interface PromptSelectionResult {
  // Selected prompt
  promptId: string;
  promptTemplate: string;
  
  // Variables
  variables: Record<string, unknown>;
  
  // Context
  selectionReasoning: string;
  contextFactors: string[];
}

/**
 * Response processing result
 */
export interface ResponseProcessingResult {
  // Processed workout
  workout: GeneratedWorkout;
  
  // Processing details
  processingTime: number;
  totalGenerationTime: number;
  validationPassed: boolean;
  normalizationApplied: boolean;
  
  // Issues found and fixed
  issuesFound: string[];
  fixesApplied: string[];
  
  // Quality metrics
  structureScore: number;
  completenessScore: number;
  consistencyScore: number;
  
  // Confidence calculation
  confidence: number;
  confidenceFactors?: {
    profileMatch: number;
    safetyAlignment: number;
    equipmentFit: number;
    goalAlignment: number;
    structureQuality: number;
  };
}

/**
 * Feature validation result
 */
export interface FeatureValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}

/**
 * Feature performance metrics
 */
export interface FeatureMetrics {
  // Generation metrics
  averageGenerationTime: number;
  successRate: number;
  errorRate: number;
  
  // Duration distribution
  durationUsage: Record<string, number>;
  mostPopularDuration: number;
  
  // Quality metrics
  averageConfidence: number;
  averageStructureScore: number;
  
  // User satisfaction (if available)
  userRatings?: number[];
  feedbackCount?: number;
}

/**
 * Feature capabilities
 */
export interface FeatureCapabilities {
  supportedDurations: number[];
  supportedFitnessLevels: string[];
  supportedFocusAreas: string[];
  supportedEquipment: string[];
  
  // Advanced features
  contextAwareness: boolean;
  durationOptimization: boolean;
  equipmentAdaptation: boolean;
  fitnessLevelScaling: boolean;
  
  // Integration capabilities
  cacheSupport: boolean;
  fallbackSupport: boolean;
  metricsTracking: boolean;
}

/**
 * Type guards for runtime type checking
 */
export const isQuickWorkoutParams = (obj: unknown): obj is QuickWorkoutParams => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'duration' in obj &&
    'fitnessLevel' in obj &&
    'focus' in obj &&
    'energyLevel' in obj &&
    'sorenessAreas' in obj &&
    'equipment' in obj
  );
};

export const isQuickWorkoutResult = (obj: unknown): obj is QuickWorkoutResult => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'workout' in obj &&
    'metadata' in obj &&
    'confidence' in obj
  );
};

/**
 * Default values for feature types
 */
export const DEFAULT_QUICK_WORKOUT_PARAMS: Partial<QuickWorkoutParams> = {
  duration: 30,
  fitnessLevel: 'some experience',
  energyLevel: 5,
  sorenessAreas: [],
  equipment: [],
  location: 'home',
  intensity: 'moderate',
  music: false,
  voiceGuidance: false
};

/**
 * Feature constants for type validation
 */
export const FEATURE_TYPE_CONSTANTS = {
  MIN_ENERGY_LEVEL: 1,
  MAX_ENERGY_LEVEL: 10,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  SUPPORTED_FITNESS_LEVELS: ['new to exercise', 'some experience', 'advanced athlete'] as const,
  SUPPORTED_INTENSITIES: ['low', 'moderate', 'high'] as const,
  SUPPORTED_LOCATIONS: ['home', 'gym', 'outdoor'] as const,
  SUPPORTED_NOISE_LEVELS: ['quiet', 'moderate', 'loud'] as const
} as const; 