// AI Confidence Score System Types
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout } from '../../../../../types/workout-generation.types';

/**
 * Individual confidence factors that contribute to the overall confidence score
 */
export interface ConfidenceFactors {
  profileMatch: number;      // 0-1 score: How well workout matches user's fitness profile
  safetyAlignment: number;   // 0-1 score: Safety considerations and accommodations
  equipmentFit: number;      // 0-1 score: Equipment availability and fit
  goalAlignment: number;     // 0-1 score: Alignment with user's fitness goals
  structureQuality: number;  // 0-1 score: Technical quality of workout structure
}

/**
 * Confidence level classification
 */
export type ConfidenceLevel = 'excellent' | 'good' | 'needs-review';

/**
 * Complete confidence calculation result
 */
export interface ConfidenceResult {
  overallScore: number;           // 0-1 weighted average of all factors
  factors: ConfidenceFactors;     // Individual factor scores
  level: ConfidenceLevel;         // Classified confidence level
  recommendations: string[];      // Improvement suggestions
  metadata: ConfidenceMetadata;   // Calculation metadata
}

/**
 * Metadata about the confidence calculation
 */
export interface ConfidenceMetadata {
  calculationTime: number;        // Time taken to calculate in milliseconds
  factorWeights: Record<string, number>; // Weights used for each factor
  dataQuality: number;            // 0-1 score of input data quality
  version: string;                // Confidence calculation version
  timestamp: Date;                // When calculation was performed
}

/**
 * Context information for confidence calculations
 */
export interface ConfidenceContext {
  workoutType: 'quick' | 'detailed';
  generationSource: 'external' | 'internal' | 'fallback';
  userPreferences?: Record<string, any>;
  environmentalFactors?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    weather?: string;
    location?: 'indoor' | 'outdoor';
    temperature?: number;
  };
  additionalData?: Record<string, any>;
}

/**
 * Factor calculation breakdown for detailed analysis
 */
export interface FactorBreakdown {
  factorName: string;
  score: number;
  weight: number;
  weightedScore: number;
  description: string;
  subFactors?: {
    name: string;
    score: number;
    description: string;
  }[];
}

/**
 * Interface for individual factor calculators
 */
export interface FactorCalculator {
  /**
   * Calculate the confidence score for this specific factor
   */
  calculate(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<number>;
  
  /**
   * Get the human-readable name of this factor
   */
  getFactorName(): string;
  
  /**
   * Get the weight of this factor in the overall calculation
   */
  getWeight(): number;
  
  /**
   * Get a description of what this factor measures
   */
  getDescription(): string;
  
  /**
   * Get detailed breakdown of sub-factors (optional)
   */
  getSubFactors?(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<{
    name: string;
    score: number;
    description: string;
  }[]>;
}

/**
 * Configuration for confidence calculation
 */
export interface ConfidenceConfig {
  weights: {
    profileMatch: number;
    safetyAlignment: number;
    equipmentFit: number;
    goalAlignment: number;
    structureQuality: number;
  };
  thresholds: {
    excellent: number;    // Minimum score for 'excellent' level
    good: number;         // Minimum score for 'good' level
  };
  enableCaching: boolean;
  cacheTimeout: number;   // milliseconds
  enableDetailedLogging: boolean;
}

/**
 * Default confidence configuration
 */
export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  weights: {
    profileMatch: 0.25,      // 25%
    safetyAlignment: 0.20,   // 20%
    equipmentFit: 0.15,      // 15%
    goalAlignment: 0.20,     // 20%
    structureQuality: 0.20   // 20%
  },
  thresholds: {
    excellent: 0.8,  // 80% and above
    good: 0.6        // 60% and above
  },
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  enableDetailedLogging: false
};

/**
 * Error types for confidence calculation
 */
export type ConfidenceErrorType = 
  | 'INVALID_USER_PROFILE'
  | 'INVALID_WORKOUT_DATA'
  | 'CALCULATION_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT_ERROR'
  | 'DATA_QUALITY_ERROR';

/**
 * Confidence calculation error
 */
export interface ConfidenceError {
  type: ConfidenceErrorType;
  message: string;
  factor?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Cache entry for confidence calculations
 */
export interface ConfidenceCacheEntry {
  key: string;
  result: ConfidenceResult;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Performance metrics for confidence calculations
 */
export interface ConfidenceMetrics {
  totalCalculations: number;
  averageCalculationTime: number;
  cacheHitRate: number;
  errorRate: number;
  factorPerformance: Record<string, {
    averageScore: number;
    calculationTime: number;
    errorCount: number;
  }>;
}

/**
 * Validation result for confidence calculation inputs
 */
export interface ConfidenceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: number; // 0-1 score
}

/**
 * Sub-factor calculation result
 */
export interface SubFactorResult {
  name: string;
  score: number;
  description: string;
  weight?: number;
  details?: Record<string, any>;
}

/**
 * Detailed factor calculation result
 */
export interface DetailedFactorResult {
  factorName: string;
  overallScore: number;
  weight: number;
  weightedScore: number;
  description: string;
  subFactors: SubFactorResult[];
  calculationTime: number;
  metadata?: Record<string, any>;
} 