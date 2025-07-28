/**
 * AI Context Types - Sprint 2 Type Safety
 * 
 * Type definitions for AIContext to replace 'any' types with proper TypeScript types.
 * These types maintain backward compatibility while providing type safety.
 */

import { UserProfile, PerWorkoutOptions } from './index';

// ============================================================================
// CORE AI CONTEXT TYPES
// ============================================================================

/**
 * AI Service Status
 */
export type AIServiceStatus = 'initializing' | 'ready' | 'error';

/**
 * Environment Status for AI Context
 */
export interface AIEnvironmentStatus {
  isConfigured: boolean;
  hasApiKey: boolean;
  isDevelopment: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * AI Interaction Event Types
 */
export type AIInteractionType = 
  // Insight interactions
  | 'insight_shown' 
  | 'insight_applied' 
  | 'recommendation_accepted' 
  | 'recommendation_rejected'
  // Workout interactions
  | 'workout_request'
  | 'workout_success'
  | 'workout_error'
  // Analysis interactions
  | 'analysis_request'
  | 'analysis_success'
  | 'analysis_error';

/**
 * AI Interaction Event Data
 */
export interface AIInteractionData {
  value?: number;
  service?: 'unified' | 'legacy';
  flagEnabled?: boolean;
  crossComponentEnabled?: boolean;
  selectionsProvided?: boolean;
  recommendationId?: string;
  insightsCount?: number;
  [key: string]: unknown; // Allow additional properties for extensibility
}

/**
 * AI Interaction Event
 */
export interface AIInteractionEvent {
  type: AIInteractionType;
  component: string;
  data: AIInteractionData;
  timestamp?: Date;
}

/**
 * A/B Test Results
 */
export interface ABTestResults {
  variant: string;
  conversionRate: number;
  sampleSize: number;
  confidence: number;
  isSignificant: boolean;
}

/**
 * Feature Flag Configuration
 */
export interface FeatureFlag {
  id: string;
  enabled: boolean;
  rolloutPercentage: number;
  description?: string;
}

// ============================================================================
// AI ANALYSIS TYPES
// ============================================================================

/**
 * AI Analysis Result
 */
export interface AIAnalysisResult {
  insights: {
    energy: AIInsight[];
    soreness: AIInsight[];
  };
  crossComponentConflicts: AIConflict[];
  recommendations: AIRecommendation[];
  confidence: number;
  reasoning: string;
  timestamp?: Date;
}

/**
 * AI Insight
 */
export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  confidence: number;
  actionable: boolean;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * AI Recommendation
 */
export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'energy' | 'soreness' | 'duration' | 'equipment' | 'cross_component' | 'general';
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  confidence: number;
  reasoning?: string;
}

/**
 * AI Conflict
 */
export interface AIConflict {
  id: string;
  type: 'energy_soreness' | 'duration_energy' | 'equipment_duration' | 'cross_component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSelections: string[];
  resolution?: string;
}

// ============================================================================
// AI WORKOUT TYPES
// ============================================================================

/**
 * Workout Generation Request
 */
export interface WorkoutGenerationRequest {
  userProfile: UserProfile;
  selections: PerWorkoutOptions;
  preferences?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
}

/**
 * Generated Workout
 */
export interface GeneratedWorkout {
  id: string;
  exercises: WorkoutExercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  equipment: string[];
  instructions: string[];
  modifications?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * Workout Exercise
 */
export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restTime: number;
  equipment?: string[];
  muscleGroups: string[];
  instructions: string[];
  modifications?: string[];
}

// ============================================================================
// AI SERVICE TYPES
// ============================================================================

/**
 * AI Service Context
 */
export interface AIServiceContext {
  userProfile: UserProfile;
  currentSelections: PerWorkoutOptions;
  previousAnalyses: AIAnalysisResult[];
  interactionHistory: AIInteractionEvent[];
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

/**
 * AI Service Health Status
 */
export interface AIServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastError?: string;
  details: Record<string, unknown>;
}

/**
 * AI Service Performance Metrics
 */
export interface AIServicePerformanceMetrics {
  averageResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

// ============================================================================
// LEGACY COMPATIBILITY TYPES
// ============================================================================

/**
 * Legacy Energy Insights (for backward compatibility)
 */
export interface LegacyEnergyInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  confidence: number;
  actionable: boolean;
}

/**
 * Legacy Soreness Insights (for backward compatibility)
 */
export interface LegacySorenessInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  confidence: number;
  actionable: boolean;
}

/**
 * Legacy Analysis Result (for backward compatibility)
 */
export interface LegacyAnalysisResult {
  insights: {
    energy: LegacyEnergyInsight[];
    soreness: LegacySorenessInsight[];
  };
  crossComponentConflicts: AIConflict[];
  recommendations: AIRecommendation[];
  confidence: number;
  reasoning: string;
}

// ============================================================================
// DEVELOPMENT TOOLS TYPES
// ============================================================================

/**
 * Development Tools Interface
 */
export interface AIDevelopmentTools {
  overrideFlag: (flagId: string, enabled: boolean) => void;
  increaseRollout: (flagId: string, percentage: number) => void;
  getAnalytics: (flagId: string) => ABTestResults | null;
  exportFlags: () => Record<string, FeatureFlag>;
  checkEnvironment: () => void;
  validateState: () => AIServiceHealthStatus;
  getInitializationInfo: () => {
    attempts: number;
    lastError: string | null;
    startTime: Date | null;
    endTime: Date | null;
    duration: number | null;
  };
  // Refactoring-specific tools
  getRefactoringFlags: () => Record<string, boolean>;
  setRefactoringFlag: (flag: string, value: boolean) => void;
  getRefactoringStatus: () => {
    isEnabled: boolean;
    isSafe: boolean;
    safetyScore: number;
  };
  triggerRefactoringRollback: (reason: string) => void;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an object is an AIInsight
 */
export function isAIInsight(obj: unknown): obj is AIInsight {
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
 * Type guard to check if an object is an AIRecommendation
 */
export function isAIRecommendation(obj: unknown): obj is AIRecommendation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'category' in obj &&
    'priority' in obj &&
    'actionable' in obj &&
    'confidence' in obj
  );
}

/**
 * Type guard to check if an object is an AIAnalysisResult
 */
export function isAIAnalysisResult(obj: unknown): obj is AIAnalysisResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'insights' in obj &&
    'crossComponentConflicts' in obj &&
    'recommendations' in obj &&
    'confidence' in obj &&
    'reasoning' in obj
  );
}

/**
 * Type guard to check if an object is a GeneratedWorkout
 */
export function isGeneratedWorkout(obj: unknown): obj is GeneratedWorkout {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'exercises' in obj &&
    'duration' in obj &&
    'difficulty' in obj &&
    'focusAreas' in obj &&
    'equipment' in obj &&
    'instructions' in obj
  );
} 