import { PerWorkoutOptions } from './core';
import { UserProfile } from './user';
import { AIInsight } from './insights';

// AI recommendation context
export interface AIRecommendationContext {
  generateInsights?: (value: number) => AIInsight[];
  generateRatingInsights?: (value: number) => string[];
  generateFocusInsights?: () => {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  };
  generateAreaInsights?: () => {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  };
  generateEquipmentInsights?: () => {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  };
  generateDurationInsights?: () => {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  };
  generateTextInsights?: () => {
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  };
  currentSelections: Partial<PerWorkoutOptions>;
  userProfile: UserProfile;
  environmentalFactors?: {
    timeOfDay?: string;
    weather?: string;
    location?: string;
    availableTime?: number;
  };
  recentActivity?: {
    lastWorkoutDate?: Date;
    lastWorkoutType?: string;
    recoveryStatus?: 'full' | 'partial' | 'minimal';
    performanceMetrics?: Record<string, number>;
  };
  crossComponentAnalysis?: {
    conflicts?: string[];
    optimizations?: string[];
    missingComplements?: string[];
  };
}

// AI recommendation types
export interface AIRecommendation {
  id: string;
  type: 'immediate' | 'contextual' | 'learning' | 'optimization';
  content: string;
  confidence: number;
  reasoning: string;
  metadata?: {
    field?: string;
    priority?: 'low' | 'medium' | 'high';
    source?: 'user_profile' | 'cross_component' | 'historical' | 'algorithmic';
  };
}

// AI analysis types
export interface AIAnalysis {
  conflicts: string[];
  optimizations: string[];
  missingComplements: string[];
  insights: string[];
  recommendations: AIRecommendation[];
}

// AI validation types
export interface AIValidation {
  isValid: boolean;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  warnings: string[];
}

// AI learning types
export interface AILearning {
  userInteraction: 'accepted' | 'rejected' | 'modified';
  recommendationId: string;
  context: Record<string, any>;
  timestamp: Date;
  feedback?: string;
}

// Migration utility interfaces


// AI integration interfaces - Legacy AIRecommendationEngine interface removed
// Use the new AIService architecture instead 