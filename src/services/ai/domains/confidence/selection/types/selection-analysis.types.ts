import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';

/**
 * Analysis of a specific factor during selection
 */
export interface FactorAnalysis {
  score: number;                    // 0-1 score
  status: 'excellent' | 'good' | 'warning' | 'poor';
  reasoning: string;                // Why this score was given
  impact: string;                   // How this affects the final workout
  details: string[];                // Specific points about the selection
  suggestions?: string[];           // Optional improvement suggestions
}

/**
 * Educational content for user learning
 */
export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: 'selection' | 'fitness' | 'safety' | 'equipment' | 'goals';
  priority: number;
  learnMoreUrl?: string;
}

/**
 * Actionable improvement suggestion
 */
export interface ImprovementSuggestion {
  id: string;
  action: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedScoreIncrease: number;
  quickFix: boolean;
  category: 'goals' | 'intensity' | 'duration' | 'recovery' | 'equipment';
  timeRequired: 'immediate' | '5min' | '15min' | '30min';
  priority: number;
}

/**
 * Insight about the user's selections
 */
export interface AnalysisInsight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion' | 'educational';
  title: string;
  message: string;
  factor: string;
  priority: number;
  actionable: boolean;
}

/**
 * Complete selection analysis result
 */
export interface SelectionAnalysis {
  overallScore: number;
  factors: {
    goalAlignment: FactorAnalysis;
    intensityMatch: FactorAnalysis;
    durationFit: FactorAnalysis;
    recoveryRespect: FactorAnalysis;
    equipmentOptimization: FactorAnalysis;
  };
  insights: AnalysisInsight[];
  suggestions: ImprovementSuggestion[];
  educationalContent: EducationalContent[];
  metadata: SelectionAnalysisMetadata;
}

/**
 * Metadata about the analysis
 */
export interface SelectionAnalysisMetadata {
  analysisTime: number;             // Time taken to analyze in milliseconds
  factorWeights: Record<string, number>; // Weights used for each factor
  dataQuality: number;              // 0-1 score of input data quality
  version: string;                  // Analysis version
  timestamp: Date;                  // When analysis was performed
}

/**
 * Context for selection analysis
 */
export interface SelectionAnalysisContext {
  generationType: 'quick' | 'detailed';
  userExperience: 'first-time' | 'beginner' | 'intermediate' | 'advanced';
  previousWorkouts?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  environmentalFactors?: {
    weather?: string;
    location?: 'indoor' | 'outdoor';
    temperature?: number;
  };
}

/**
 * Configuration for selection analysis
 */
export interface SelectionAnalysisConfig {
  weights: {
    goalAlignment: number;
    intensityMatch: number;
    durationFit: number;
    recoveryRespect: number;
    equipmentOptimization: number;
  };
  thresholds: {
    excellent: number;    // Minimum score for 'excellent' status
    good: number;         // Minimum score for 'good' status
    warning: number;      // Minimum score for 'warning' status
  };
  enableCaching: boolean;
  cacheTimeout: number;   // milliseconds
  enableDetailedLogging: boolean;
}

/**
 * Default configuration for selection analysis
 */
export const DEFAULT_SELECTION_ANALYSIS_CONFIG: SelectionAnalysisConfig = {
  weights: {
    goalAlignment: 0.25,
    intensityMatch: 0.25,
    durationFit: 0.2,
    recoveryRespect: 0.15,
    equipmentOptimization: 0.15
  },
  thresholds: {
    excellent: 0.85,
    good: 0.7,
    warning: 0.5
  },
  enableCaching: true,
  cacheTimeout: 300000, // 5 minutes
  enableDetailedLogging: false
};

/**
 * Interface for individual selection analyzers
 */
export interface SelectionAnalyzer {
  /**
   * Analyze a specific aspect of the user's selections
   */
  analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<FactorAnalysis>;
  
  /**
   * Get the human-readable name of this analyzer
   */
  getAnalyzerName(): string;
  
  /**
   * Get the weight of this analyzer in the overall calculation
   */
  getWeight(): number;
  
  /**
   * Get a description of what this analyzer measures
   */
  getDescription(): string;
}

/**
 * Error types for selection analysis
 */
export type SelectionAnalysisErrorType = 
  | 'INVALID_USER_PROFILE'
  | 'INVALID_WORKOUT_OPTIONS'
  | 'ANALYSIS_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT_ERROR'
  | 'DATA_QUALITY_ERROR';

/**
 * Error structure for selection analysis
 */
export interface SelectionAnalysisError {
  type: SelectionAnalysisErrorType;
  message: string;
  analyzer?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Cache entry for selection analysis
 */
export interface SelectionAnalysisCacheEntry {
  key: string;
  result: SelectionAnalysis;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Validation result for selection analysis inputs
 */
export interface SelectionAnalysisValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: number; // 0-1 score
} 