// Shared types and interfaces for AI Service components
import { PerWorkoutOptions, UserProfile, AIAssistanceLevel } from '../../../../types';
import { AIInsight } from '../../../../types/insights';

// Core AI Service interfaces
export interface GlobalAIContext {
  userProfile: UserProfile;
  currentSelections: PerWorkoutOptions;
  sessionHistory: AIInteraction[];
  environmentalFactors?: {
    timeOfDay: string;
    location: string;
    weather?: string;
    availableTime?: number;
  };
  preferences: {
    aiAssistanceLevel: AIAssistanceLevel;
    showLearningInsights: boolean;
    autoApplyLowRiskRecommendations: boolean;
  };
  validationMode?: boolean; // Enable validation during migration
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  component: string;
  action: 'recommendation_shown' | 'recommendation_applied' | 'recommendation_dismissed' | 'error_occurred';
  recommendationId?: string;
  userFeedback?: 'helpful' | 'not_helpful' | 'partially_helpful';
  errorDetails?: {
    message: string;
    stack?: string;
    context?: any;
  };
  performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
    cacheHit: boolean;
  };
}

export interface UnifiedAIAnalysis {
  id: string;
  timestamp: Date;
  insights: {
    energy: AIInsight[];
    soreness: AIInsight[];
    focus: AIInsight[];
    duration: AIInsight[];
    equipment: AIInsight[];
  };
  crossComponentConflicts: CrossComponentConflict[];
  recommendations: PrioritizedRecommendation[];
  confidence: number;
  reasoning: string;
  validationResults?: ValidationResult;
  performanceMetrics: {
    totalExecutionTime: number;
    cacheHitRate: number;
    memoryPeakUsage: number;
  };
}

export interface CrossComponentConflict {
  id: string;
  components: string[];
  type: 'safety' | 'efficiency' | 'goal_alignment' | 'user_experience';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestedResolution: string;
  confidence: number;
  impact: 'performance' | 'safety' | 'effectiveness';
}

export interface PrioritizedRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'safety' | 'optimization' | 'education' | 'efficiency';
  targetComponent: string;
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  action?: {
    type: 'update_field' | 'suggest_alternative' | 'show_education';
    field?: string;
    value?: any;
    alternatives?: any[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  consistencyScore: number;
  discrepancies: Array<{
    component: string;
    expected: any;
    actual: any;
    severity: 'low' | 'medium' | 'high';
  }>;
  performanceComparison: {
    oldTime: number;
    newTime: number;
    memoryDifference: number;
  };
}

export interface AIServiceConfig {
  enableValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  cacheSize: number;
  cacheTimeout: number;
  maxRetries: number;
  fallbackToLegacy: boolean;
}

// New interfaces for better separation of concerns

export interface AIServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    cacheSize: number;
    errorRate: number;
    averageResponseTime: number;
    validationEnabled: boolean;
    domainServices: {
      energy: 'healthy' | 'degraded' | 'unhealthy';
      soreness: 'healthy' | 'degraded' | 'unhealthy';
      focus: 'healthy' | 'degraded' | 'unhealthy';
      duration: 'healthy' | 'degraded' | 'unhealthy';
      equipment: 'healthy' | 'degraded' | 'unhealthy';
      crossComponent: 'healthy' | 'degraded' | 'unhealthy';
    };
    contextStatus: 'set' | 'not_set' | 'invalid';
    externalStrategy: 'configured' | 'not_configured' | 'error';
    memoryUsage: number;
    uptime: number;
    lastError?: {
      message: string;
      timestamp: Date;
      component: string;
    };
  };
}

export interface AIServicePerformanceMetrics {
  averageExecutionTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
}

export interface AIServicePerformanceMonitor {
  recordCacheHit(): void;
  recordCacheMiss(): void;
  recordAnalysis(executionTime: number, memoryUsage: number): void;
  recordError(): void;
  getMetrics(): AIServicePerformanceMetrics;
  reset(): void;
}

export interface AIServiceCacheEntry {
  analysis: UnifiedAIAnalysis;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface AIServiceExternalStrategyConfig {
  strategyType: string;
  isConfigured: boolean;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  lastError?: Error;
}

export interface AIServiceWorkoutRequest {
  userProfile: UserProfile;
  workoutOptions: PerWorkoutOptions;
  preferences: {
    duration: number;
    focus: string;
    intensity: 'low' | 'moderate' | 'high';
    equipment: string[];
    location: string;
  };
  constraints: {
    timeOfDay: string;
    energyLevel: number;
    sorenessAreas: string[];
  };
}

export interface AIServiceRecoveryResult {
  success: boolean;
  recoveredServices: string[];
  failedServices: string[];
  errors: string[];
}

export interface AIServiceComprehensiveHealthResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  details: AIServiceHealthStatus['details'];
  recoveryAttempts: string[];
  recommendations: string[];
}

export interface InteractionStats {
  totalInteractions: number;
  recommendationsShown: number;
  recommendationsApplied: number;
  recommendationsDismissed: number;
  errorsOccurred: number;
  averageUserFeedback: number;
}

export interface LearningMetrics {
  totalLearningEvents: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  recommendationImprovementRate: number;
  lastLearningUpdate: Date;
}

export interface DomainServiceHealth {
  energy: 'healthy' | 'degraded' | 'unhealthy';
  soreness: 'healthy' | 'degraded' | 'unhealthy';
  focus: 'healthy' | 'degraded' | 'unhealthy';
  duration: 'healthy' | 'degraded' | 'unhealthy';
  equipment: 'healthy' | 'degraded' | 'unhealthy';
  crossComponent: 'healthy' | 'degraded' | 'unhealthy';
}

export interface DetailedPerformanceMetrics {
  overall: AIServicePerformanceMetrics;
  domainServices: {
    energy: { executionTime: number; errorRate: number; };
    soreness: { executionTime: number; errorRate: number; };
    focus: { executionTime: number; errorRate: number; };
    duration: { executionTime: number; errorRate: number; };
    equipment: { executionTime: number; errorRate: number; };
    crossComponent: { executionTime: number; errorRate: number; };
  };
  cache: {
    size: number;
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };
}

// Error handling related types
export interface AIServiceError {
  id: string;
  timestamp: Date;
  type: 'analysis_failure' | 'validation_error' | 'context_error' | 'performance_error' | 'recovery_error' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context?: any;
  component?: string;
  userId?: string;
  resolution?: 'retry' | 'fallback' | 'skip' | 'manual';
  retryCount?: number;
  maxRetries?: number;
}

export interface AIServiceErrorConfig {
  enableReporting: boolean;
  fallbackToLegacy: boolean;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

export interface AIServiceErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByComponent: Record<string, number>;
  recentErrors: AIServiceError[];
  errorRate: number;
  circuitBreakerStatus: 'closed' | 'open' | 'half_open';
}

export interface AIServiceRecoveryAttempt {
  serviceName: string;
  timestamp: Date;
  method: 'initialize' | 'reset' | 'recreate';
  success: boolean;
  error?: string;
  duration: number;
}

export interface AIServiceRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Type guards for better type safety
export const isHealthy = (status: 'healthy' | 'degraded' | 'unhealthy'): status is 'healthy' => {
  return status === 'healthy';
};

export const isDegraded = (status: 'healthy' | 'degraded' | 'unhealthy'): status is 'degraded' => {
  return status === 'degraded';
};

export const isUnhealthy = (status: 'healthy' | 'degraded' | 'unhealthy'): status is 'unhealthy' => {
  return status === 'unhealthy';
};

export const isValidContext = (context: GlobalAIContext | null): context is GlobalAIContext => {
  return context !== null && 
         context.userProfile !== undefined && 
         context.currentSelections !== undefined;
};

export const isValidAnalysis = (analysis: UnifiedAIAnalysis): boolean => {
  return analysis.id !== undefined && 
         analysis.timestamp !== undefined && 
         analysis.insights !== undefined;
}; 