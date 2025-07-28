/**
 * AI Recommendations Types - Sprint 2 Type Safety
 * 
 * Type definitions for AI recommendations to replace 'any' types.
 * These types provide detailed structure for recommendations while maintaining backward compatibility.
 */

import { UserProfile, PerWorkoutOptions } from './workout.types';

// ============================================================================
// CORE RECOMMENDATION TYPES
// ============================================================================

/**
 * Base Recommendation Interface
 */
export interface BaseRecommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  actionable: boolean;
  confidence: number;
  reasoning?: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Recommendation Categories
 */
export type RecommendationCategory = 
  | 'energy' 
  | 'soreness' 
  | 'duration' 
  | 'equipment' 
  | 'cross_component' 
  | 'general' 
  | 'recovery' 
  | 'performance' 
  | 'safety' 
  | 'progression';

/**
 * Recommendation Priority Levels
 */
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Recommendation Action Types
 */
export type RecommendationActionType = 
  | 'adjust_duration' 
  | 'change_intensity' 
  | 'modify_equipment' 
  | 'add_recovery' 
  | 'skip_workout' 
  | 'consult_professional' 
  | 'modify_exercises' 
  | 'adjust_frequency';

// ============================================================================
// SPECIFIC RECOMMENDATION TYPES
// ============================================================================

/**
 * Energy-Based Recommendation
 */
export interface EnergyRecommendation extends BaseRecommendation {
  category: 'energy';
  energyLevel: number;
  recommendedDuration?: number;
  recommendedIntensity?: 'low' | 'medium' | 'high';
  caffeineRecommendation?: boolean;
  hydrationFocus?: boolean;
  recoveryNeeded?: boolean;
}

/**
 * Soreness-Based Recommendation
 */
export interface SorenessRecommendation extends BaseRecommendation {
  category: 'soreness';
  sorenessLevel: number;
  affectedAreas?: string[];
  recommendedRecoveryTime?: number;
  gentleMovementRecommended?: boolean;
  stretchingFocus?: boolean;
  avoidStrenuousActivity?: boolean;
}

/**
 * Duration-Based Recommendation
 */
export interface DurationRecommendation extends BaseRecommendation {
  category: 'duration';
  currentDuration?: number;
  recommendedDuration: number;
  reasoning: string;
  intensityAdjustment?: 'increase' | 'decrease' | 'maintain';
}

/**
 * Equipment-Based Recommendation
 */
export interface EquipmentRecommendation extends BaseRecommendation {
  category: 'equipment';
  currentEquipment?: string[];
  recommendedEquipment: string[];
  alternatives?: string[];
  safetyConsiderations?: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Cross-Component Recommendation
 */
export interface CrossComponentRecommendation extends BaseRecommendation {
  category: 'cross_component';
  conflictType: CrossComponentConflictType;
  affectedComponents: string[];
  resolution: string;
  tradeoffs?: string[];
  alternativeApproaches?: string[];
}

/**
 * Recovery Recommendation
 */
export interface RecoveryRecommendation extends BaseRecommendation {
  category: 'recovery';
  recoveryType: 'active' | 'passive' | 'mixed';
  duration: number;
  activities?: string[];
  nutrition?: string[];
  sleepRecommendations?: string[];
}

/**
 * Performance Recommendation
 */
export interface PerformanceRecommendation extends BaseRecommendation {
  category: 'performance';
  performanceGoal: string;
  currentLevel?: string;
  targetLevel?: string;
  progressionSteps?: string[];
  timeline?: number;
}

/**
 * Safety Recommendation
 */
export interface SafetyRecommendation extends BaseRecommendation {
  category: 'safety';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationStrategies: string[];
  warningSigns?: string[];
  emergencyActions?: string[];
}

// ============================================================================
// CROSS-COMPONENT CONFLICT TYPES
// ============================================================================

/**
 * Cross-Component Conflict Types
 */
export type CrossComponentConflictType = 
  | 'energy_soreness' 
  | 'duration_energy' 
  | 'equipment_duration' 
  | 'energy_equipment' 
  | 'soreness_equipment' 
  | 'duration_soreness' 
  | 'equipment_skill_level' 
  | 'intensity_recovery';

/**
 * Cross-Component Conflict
 */
export interface CrossComponentConflict {
  id: string;
  type: CrossComponentConflictType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSelections: string[];
  resolution?: string;
  priority: RecommendationPriority;
}

// ============================================================================
// RECOMMENDATION TEMPLATES
// ============================================================================

/**
 * Energy Recommendation Templates
 */
export const ENERGY_RECOMMENDATION_TEMPLATES = {
  LOW_ENERGY: {
    id: 'energy_low_recommendation',
    title: 'Low Energy Workout Adjustment',
    description: 'Consider a shorter, lower-intensity workout due to low energy levels',
    category: 'energy' as const,
    priority: 'medium' as const,
    actionable: true,
    confidence: 0.8,
    reasoning: 'Low energy levels may lead to poor form and increased injury risk',
    energyLevel: 1,
    recommendedDuration: 20,
    recommendedIntensity: 'low' as const,
    recoveryNeeded: true,
    hydrationFocus: true
  },
  HIGH_ENERGY: {
    id: 'energy_high_recommendation',
    title: 'High Energy Performance Opportunity',
    description: 'Great time for intense training - energy levels are optimal',
    category: 'energy' as const,
    priority: 'low' as const,
    actionable: true,
    confidence: 0.9,
    reasoning: 'High energy levels provide optimal conditions for challenging workouts',
    energyLevel: 5,
    recommendedDuration: 60,
    recommendedIntensity: 'high' as const,
    recoveryNeeded: false
  }
} as const;

/**
 * Soreness Recommendation Templates
 */
export const SORENESS_RECOMMENDATION_TEMPLATES = {
  HIGH_SORENESS: {
    id: 'soreness_high_recommendation',
    title: 'High Soreness Recovery Focus',
    description: 'Focus on recovery and gentle movement due to high soreness levels',
    category: 'soreness' as const,
    priority: 'high' as const,
    actionable: true,
    confidence: 0.9,
    reasoning: 'High soreness indicates muscle damage that needs recovery time',
    sorenessLevel: 5,
    recommendedRecoveryTime: 48,
    gentleMovementRecommended: true,
    stretchingFocus: true,
    avoidStrenuousActivity: true
  },
  MODERATE_SORENESS: {
    id: 'soreness_moderate_recommendation',
    title: 'Moderate Soreness Active Recovery',
    description: 'Consider lighter workout or active recovery due to moderate soreness',
    category: 'soreness' as const,
    priority: 'medium' as const,
    actionable: true,
    confidence: 0.7,
    reasoning: 'Moderate soreness can be managed with appropriate intensity adjustments',
    sorenessLevel: 3,
    recommendedRecoveryTime: 24,
    gentleMovementRecommended: true,
    stretchingFocus: true
  }
} as const;

// ============================================================================
// RECOMMENDATION COLLECTIONS
// ============================================================================

/**
 * Recommendation Collection
 */
export interface RecommendationCollection {
  energy: EnergyRecommendation[];
  soreness: SorenessRecommendation[];
  duration: DurationRecommendation[];
  equipment: EquipmentRecommendation[];
  crossComponent: CrossComponentRecommendation[];
  recovery: RecoveryRecommendation[];
  performance: PerformanceRecommendation[];
  safety: SafetyRecommendation[];
  general: BaseRecommendation[];
}

/**
 * Recommendation Summary
 */
export interface RecommendationSummary {
  totalRecommendations: number;
  actionableRecommendations: number;
  highPriorityRecommendations: number;
  criticalRecommendations: number;
  categories: Record<RecommendationCategory, number>;
  highestPriority: RecommendationPriority;
  averageConfidence: number;
}

/**
 * Recommendation Context
 */
export interface RecommendationContext {
  userProfile: UserProfile;
  currentSelections: PerWorkoutOptions;
  previousRecommendations: BaseRecommendation[];
  userPreferences: Record<string, unknown>;
  environmentalFactors: Record<string, unknown>;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy Recommendation (for backward compatibility)
 */
export interface LegacyRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  actionable: boolean;
  confidence: number;
  reasoning?: string;
}

/**
 * Legacy Recommendation Collection (for backward compatibility)
 */
export interface LegacyRecommendationCollection {
  recommendations: LegacyRecommendation[];
  conflicts: CrossComponentConflict[];
  summary: {
    total: number;
    actionable: number;
    highPriority: number;
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an object is a BaseRecommendation
 */
export function isBaseRecommendation(obj: unknown): obj is BaseRecommendation {
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
 * Type guard to check if an object is an EnergyRecommendation
 */
export function isEnergyRecommendation(obj: unknown): obj is EnergyRecommendation {
  return (
    isBaseRecommendation(obj) &&
    obj.category === 'energy' &&
    'energyLevel' in obj
  );
}

/**
 * Type guard to check if an object is a SorenessRecommendation
 */
export function isSorenessRecommendation(obj: unknown): obj is SorenessRecommendation {
  return (
    isBaseRecommendation(obj) &&
    obj.category === 'soreness' &&
    'sorenessLevel' in obj
  );
}

/**
 * Type guard to check if an object is a DurationRecommendation
 */
export function isDurationRecommendation(obj: unknown): obj is DurationRecommendation {
  return (
    isBaseRecommendation(obj) &&
    obj.category === 'duration' &&
    'recommendedDuration' in obj
  );
}

/**
 * Type guard to check if an object is an EquipmentRecommendation
 */
export function isEquipmentRecommendation(obj: unknown): obj is EquipmentRecommendation {
  return (
    isBaseRecommendation(obj) &&
    obj.category === 'equipment' &&
    'recommendedEquipment' in obj
  );
}

/**
 * Type guard to check if an object is a CrossComponentRecommendation
 */
export function isCrossComponentRecommendation(obj: unknown): obj is CrossComponentRecommendation {
  return (
    isBaseRecommendation(obj) &&
    obj.category === 'cross_component' &&
    'conflictType' in obj &&
    'affectedComponents' in obj
  );
}

/**
 * Type guard to check if an object is a LegacyRecommendation
 */
export function isLegacyRecommendation(obj: unknown): obj is LegacyRecommendation {
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create an energy recommendation from a template
 */
export function createEnergyRecommendation(
  energyLevel: number,
  template?: keyof typeof ENERGY_RECOMMENDATION_TEMPLATES
): EnergyRecommendation {
  const baseTemplate = template ? ENERGY_RECOMMENDATION_TEMPLATES[template] : ENERGY_RECOMMENDATION_TEMPLATES.LOW_ENERGY;
  
  return {
    ...baseTemplate,
    id: `energy_recommendation_${energyLevel}_${Date.now()}`,
    energyLevel,
    timestamp: new Date()
  };
}

/**
 * Create a soreness recommendation from a template
 */
export function createSorenessRecommendation(
  sorenessLevel: number,
  template?: keyof typeof SORENESS_RECOMMENDATION_TEMPLATES
): SorenessRecommendation {
  const baseTemplate = template ? SORENESS_RECOMMENDATION_TEMPLATES[template] : SORENESS_RECOMMENDATION_TEMPLATES.MODERATE_SORENESS;
  
  return {
    ...baseTemplate,
    id: `soreness_recommendation_${sorenessLevel}_${Date.now()}`,
    sorenessLevel,
    timestamp: new Date()
  };
}

/**
 * Convert legacy recommendation to new format
 */
export function convertLegacyRecommendation(legacy: LegacyRecommendation): BaseRecommendation {
  return {
    id: legacy.id,
    title: legacy.title,
    description: legacy.description,
    category: legacy.category as RecommendationCategory,
    priority: legacy.priority as RecommendationPriority,
    actionable: legacy.actionable,
    confidence: legacy.confidence,
    reasoning: legacy.reasoning,
    timestamp: new Date()
  };
}

/**
 * Filter recommendations by category
 */
export function filterRecommendationsByCategory<T extends BaseRecommendation>(
  recommendations: T[],
  category: RecommendationCategory
): T[] {
  return recommendations.filter(rec => rec.category === category);
}

/**
 * Filter recommendations by priority
 */
export function filterRecommendationsByPriority<T extends BaseRecommendation>(
  recommendations: T[],
  priority: RecommendationPriority
): T[] {
  return recommendations.filter(rec => rec.priority === priority);
}

/**
 * Get actionable recommendations
 */
export function getActionableRecommendations<T extends BaseRecommendation>(
  recommendations: T[]
): T[] {
  return recommendations.filter(rec => rec.actionable);
}

/**
 * Sort recommendations by priority and confidence
 */
export function sortRecommendationsByPriority<T extends BaseRecommendation>(
  recommendations: T[]
): T[] {
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  
  return recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });
} 