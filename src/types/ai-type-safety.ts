/**
 * AI Type Safety Utilities - Sprint 2 Task 3
 * 
 * Comprehensive type safety utilities for runtime validation and graceful degradation.
 * These utilities ensure type safety while maintaining backward compatibility.
 */

import {
  AIAnalysisResult,
  AIInsight,
  AIRecommendation,
  GeneratedWorkout,
  WorkoutGenerationRequest,
  LegacyAnalysisResult,
  LegacyEnergyInsight,
  LegacySorenessInsight
} from './ai-context.types';

import {
  EnergyInsight,
  SorenessInsight,
  BaseInsight,
  InsightType,
  InsightSeverity,
  isEnergyInsight,
  isSorenessInsight,
  isBaseInsight
} from './ai-insights.types';

import {
  BaseRecommendation,
  PrioritizedRecommendation,
  isBaseRecommendation,
  isEnergyRecommendation,
  isSorenessRecommendation
} from './ai-recommendations.types';

import { UserProfile, PerWorkoutOptions } from './workout.types';

// ============================================================================
// CORE TYPE VALIDATION
// ============================================================================

/**
 * Comprehensive type validation result
 */
export interface TypeValidationResult<T> {
  isValid: boolean;
  value: T | null;
  errors: string[];
  warnings: string[];
  fallbackUsed: boolean;
}

/**
 * Type validation options
 */
export interface TypeValidationOptions {
  allowPartial?: boolean;
  useFallback?: boolean;
  logErrors?: boolean;
  strictMode?: boolean;
}

// ============================================================================
// ANALYSIS RESULT TYPE SAFETY
// ============================================================================

/**
 * Validate and safely convert UnifiedAIAnalysis to AIAnalysisResult
 */
export function validateAndConvertAnalysis(
  analysis: unknown,
  options: TypeValidationOptions = {}
): TypeValidationResult<AIAnalysisResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fallbackUsed = false;

  // Check if it's a valid analysis object
  if (!analysis || typeof analysis !== 'object') {
    errors.push('Analysis is null or not an object');
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed
    };
  }

  const analysisObj = analysis as any;

  // Validate required fields
  const requiredFields = ['insights', 'crossComponentConflicts', 'recommendations', 'confidence', 'reasoning'];
  for (const field of requiredFields) {
    if (!(field in analysisObj)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed
    };
  }

  // Validate insights structure
  const insights = analysisObj.insights;
  if (!insights || typeof insights !== 'object') {
    errors.push('Invalid insights structure');
  } else {
    // Validate energy insights
    if (insights.energy && Array.isArray(insights.energy)) {
      const energyValidation = validateInsightArray(insights.energy, 'energy');
      errors.push(...energyValidation.errors);
      warnings.push(...energyValidation.warnings);
    } else {
      warnings.push('Missing or invalid energy insights');
    }

    // Validate soreness insights
    if (insights.soreness && Array.isArray(insights.soreness)) {
      const sorenessValidation = validateInsightArray(insights.soreness, 'soreness');
      errors.push(...sorenessValidation.errors);
      warnings.push(...sorenessValidation.warnings);
    } else {
      warnings.push('Missing or invalid soreness insights');
    }
  }

  // Validate recommendations
  const recommendations = analysisObj.recommendations;
  if (recommendations && Array.isArray(recommendations)) {
    const recValidation = validateRecommendationArray(recommendations);
    errors.push(...recValidation.errors);
    warnings.push(...recValidation.warnings);
  } else {
    warnings.push('Missing or invalid recommendations');
  }

  // Validate confidence
  const confidence = analysisObj.confidence;
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    errors.push('Invalid confidence value (must be number between 0 and 1)');
  }

  // If we have critical errors, return failure
  if (errors.length > 0) {
    if (options.logErrors) {
      console.error('Analysis validation failed:', errors);
    }
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed
    };
  }

  // Convert to AIAnalysisResult format
  try {
    const convertedAnalysis: AIAnalysisResult = {
      insights: {
        energy: convertInsightsToLegacy(insights.energy || []),
        soreness: convertInsightsToLegacy(insights.soreness || [])
      },
      crossComponentConflicts: analysisObj.crossComponentConflicts || [],
      recommendations: convertRecommendationsToLegacy(analysisObj.recommendations || []),
      confidence: analysisObj.confidence || 0,
      reasoning: analysisObj.reasoning || '',
      timestamp: analysisObj.timestamp || new Date()
    };

    return {
      isValid: true,
      value: convertedAnalysis,
      errors: [],
      warnings,
      fallbackUsed
    };
  } catch (conversionError) {
    errors.push(`Conversion failed: ${conversionError instanceof Error ? conversionError.message : 'Unknown error'}`);
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: true
    };
  }
}

// ============================================================================
// INSIGHT TYPE SAFETY
// ============================================================================

/**
 * Validate an array of insights
 */
export function validateInsightArray(
  insights: unknown[],
  category: string
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(insights)) {
    errors.push(`${category} insights must be an array`);
    return { errors, warnings };
  }

  insights.forEach((insight, index) => {
    if (!isValidInsight(insight)) {
      errors.push(`${category} insight at index ${index} is invalid`);
    } else {
      // Additional validation for specific insight types
      if (category === 'energy' && !isEnergyInsight(insight)) {
        warnings.push(`${category} insight at index ${index} is not a valid energy insight`);
      } else if (category === 'soreness' && !isSorenessInsight(insight)) {
        warnings.push(`${category} insight at index ${index} is not a valid soreness insight`);
      }
    }
  });

  return { errors, warnings };
}

/**
 * Check if an object is a valid insight
 */
export function isValidInsight(obj: unknown): obj is BaseInsight {
  return isBaseInsight(obj);
}

/**
 * Convert modern insights to legacy format
 */
export function convertInsightsToLegacy(insights: BaseInsight[]): AIInsight[] {
  return insights.map(insight => ({
    id: insight.id,
    type: convertInsightType(insight.type),
    message: insight.message,
    confidence: insight.confidence,
    actionable: insight.actionable,
    category: insight.category,
    severity: insight.severity
  }));
}

/**
 * Convert insight type to legacy format
 */
export function convertInsightType(type: InsightType): 'warning' | 'info' | 'success' | 'error' {
  switch (type) {
    case 'warning':
    case 'info':
    case 'success':
    case 'error':
      return type;
    case 'recommendation':
      return 'info'; // Map recommendation to info for legacy compatibility
    default:
      return 'info'; // Default fallback
  }
}

// ============================================================================
// RECOMMENDATION TYPE SAFETY
// ============================================================================

/**
 * Validate an array of recommendations
 */
export function validateRecommendationArray(
  recommendations: unknown[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(recommendations)) {
    errors.push('Recommendations must be an array');
    return { errors, warnings };
  }

  recommendations.forEach((rec, index) => {
    if (!isValidRecommendation(rec)) {
      errors.push(`Recommendation at index ${index} is invalid`);
    }
  });

  return { errors, warnings };
}

/**
 * Check if an object is a valid recommendation
 */
export function isValidRecommendation(obj: unknown): obj is BaseRecommendation | PrioritizedRecommendation {
  return isBaseRecommendation(obj) || isPrioritizedRecommendation(obj);
}

/**
 * Type guard for PrioritizedRecommendation
 */
export function isPrioritizedRecommendation(obj: unknown): obj is PrioritizedRecommendation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'priority' in obj &&
    'category' in obj &&
    'targetComponent' in obj &&
    'title' in obj &&
    'description' in obj &&
    'reasoning' in obj &&
    'confidence' in obj &&
    'risk' in obj
  );
}

/**
 * Convert modern recommendations to legacy format
 */
export function convertRecommendationsToLegacy(
  recommendations: (BaseRecommendation | PrioritizedRecommendation)[]
): AIRecommendation[] {
  return recommendations.map(rec => {
    if (isPrioritizedRecommendation(rec)) {
      return convertPrioritizedToLegacy(rec);
    } else {
      return convertBaseToLegacy(rec);
    }
  });
}

/**
 * Convert PrioritizedRecommendation to legacy format
 */
export function convertPrioritizedToLegacy(rec: PrioritizedRecommendation): AIRecommendation {
  return {
    id: rec.id,
    title: rec.title,
    description: rec.description,
    category: convertCategory(rec.category),
    priority: convertPriority(rec.priority),
    actionable: true, // PrioritizedRecommendation doesn't have actionable, assume true
    confidence: rec.confidence,
    reasoning: rec.reasoning
  };
}

/**
 * Convert BaseRecommendation to legacy format
 */
export function convertBaseToLegacy(rec: BaseRecommendation): AIRecommendation {
  return {
    id: rec.id,
    title: rec.title,
    description: rec.description,
    category: convertCategory(rec.category),
    priority: convertPriority(rec.priority),
    actionable: rec.actionable,
    confidence: rec.confidence,
    reasoning: rec.reasoning
  };
}

/**
 * Convert category to legacy format
 */
export function convertCategory(category: string): 'energy' | 'soreness' | 'duration' | 'equipment' | 'cross_component' | 'general' {
  switch (category) {
    case 'energy':
    case 'soreness':
    case 'duration':
    case 'equipment':
    case 'cross_component':
    case 'general':
      return category;
    default:
      return 'general'; // Default fallback
  }
}

/**
 * Convert priority to legacy format
 */
export function convertPriority(priority: string): 'low' | 'medium' | 'high' {
  switch (priority) {
    case 'low':
    case 'medium':
    case 'high':
      return priority;
    case 'critical':
      return 'high'; // Map critical to high for legacy compatibility
    default:
      return 'medium'; // Default fallback
  }
}

// ============================================================================
// WORKOUT GENERATION TYPE SAFETY
// ============================================================================

/**
 * Validate WorkoutGenerationRequest
 */
export function validateWorkoutGenerationRequest(
  request: unknown
): TypeValidationResult<WorkoutGenerationRequest> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request || typeof request !== 'object') {
    errors.push('Request is null or not an object');
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const req = request as any;

  // Validate required fields
  if (!req.userProfile) {
    errors.push('Missing userProfile');
  }
  if (!req.selections) {
    errors.push('Missing selections');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const validatedRequest: WorkoutGenerationRequest = {
    userProfile: req.userProfile,
    selections: req.selections,
    preferences: req.preferences,
    constraints: req.constraints
  };

  return {
    isValid: true,
    value: validatedRequest,
    errors: [],
    warnings,
    fallbackUsed: false
  };
}

/**
 * Validate GeneratedWorkout
 */
export function validateGeneratedWorkout(
  workout: unknown
): TypeValidationResult<GeneratedWorkout> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!workout || typeof workout !== 'object') {
    errors.push('Workout is null or not an object');
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const w = workout as any;

  // Validate required fields
  const requiredFields = ['id', 'exercises', 'duration', 'difficulty', 'focusAreas', 'equipment', 'instructions'];
  for (const field of requiredFields) {
    if (!(field in w)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  // Validate exercises array
  if (!Array.isArray(w.exercises)) {
    errors.push('Exercises must be an array');
  }

  // Validate difficulty
  if (!['beginner', 'intermediate', 'advanced'].includes(w.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const validatedWorkout: GeneratedWorkout = {
    id: w.id,
    exercises: w.exercises,
    duration: w.duration,
    difficulty: w.difficulty,
    focusAreas: w.focusAreas,
    equipment: w.equipment,
    instructions: w.instructions,
    modifications: w.modifications,
    metadata: w.metadata
  };

  return {
    isValid: true,
    value: validatedWorkout,
    errors: [],
    warnings,
    fallbackUsed: false
  };
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Validate LegacyAnalysisResult
 */
export function validateLegacyAnalysisResult(
  result: unknown
): TypeValidationResult<LegacyAnalysisResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!result || typeof result !== 'object') {
    errors.push('Result is null or not an object');
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const res = result as any;

  // Validate insights structure
  if (!res.insights || typeof res.insights !== 'object') {
    errors.push('Invalid insights structure');
  } else {
    // Validate energy insights
    if (res.insights.energy && Array.isArray(res.insights.energy)) {
      res.insights.energy.forEach((insight: unknown, index: number) => {
        if (!isValidLegacyEnergyInsight(insight)) {
          errors.push(`Invalid energy insight at index ${index}`);
        }
      });
    }

    // Validate soreness insights
    if (res.insights.soreness && Array.isArray(res.insights.soreness)) {
      res.insights.soreness.forEach((insight: unknown, index: number) => {
        if (!isValidLegacySorenessInsight(insight)) {
          errors.push(`Invalid soreness insight at index ${index}`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      value: null,
      errors,
      warnings,
      fallbackUsed: false
    };
  }

  const validatedResult: LegacyAnalysisResult = {
    insights: {
      energy: res.insights?.energy || [],
      soreness: res.insights?.soreness || []
    },
    crossComponentConflicts: res.crossComponentConflicts || [],
    recommendations: res.recommendations || [],
    confidence: res.confidence || 0,
    reasoning: res.reasoning || ''
  };

  return {
    isValid: true,
    value: validatedResult,
    errors: [],
    warnings,
    fallbackUsed: false
  };
}

/**
 * Validate LegacyEnergyInsight
 */
export function isValidLegacyEnergyInsight(obj: unknown): obj is LegacyEnergyInsight {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'message' in obj &&
    'confidence' in obj &&
    'actionable' in obj
  );
}

/**
 * Validate LegacySorenessInsight
 */
export function isValidLegacySorenessInsight(obj: unknown): obj is LegacySorenessInsight {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'message' in obj &&
    'confidence' in obj &&
    'actionable' in obj
  );
}

// ============================================================================
// SAFETY UTILITIES
// ============================================================================

/**
 * Safe type conversion with fallback
 */
export function safeConvert<T, U>(
  value: T,
  converter: (value: T) => U,
  fallback: U,
  errorHandler?: (error: Error) => void
): U {
  try {
    return converter(value);
  } catch (error) {
    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
    }
    return fallback;
  }
}

/**
 * Safe array validation
 */
export function safeValidateArray<T>(
  array: unknown,
  validator: (item: unknown) => item is T,
  fallback: T[] = []
): T[] {
  if (!Array.isArray(array)) {
    return fallback;
  }

  return array.filter(validator);
}

/**
 * Create a safe wrapper for async functions
 */
export function createSafeAsyncWrapper<T, R>(
  fn: (input: T) => Promise<R>,
  fallback: R,
  errorHandler?: (error: Error, input: T) => void
): (input: T) => Promise<R> {
  return async (input: T): Promise<R> => {
    try {
      return await fn(input);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error instanceof Error ? error : new Error(String(error)), input);
      }
      return fallback;
    }
  };
}

/**
 * Type-safe error logging
 */
export function logTypeError(
  context: string,
  error: unknown,
  data?: unknown
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Type Safety Error] ${context}:`, errorMessage, data);
}

/**
 * Type-safe warning logging
 */
export function logTypeWarning(
  context: string,
  warning: string,
  data?: unknown
): void {
  console.warn(`[Type Safety Warning] ${context}:`, warning, data);
} 