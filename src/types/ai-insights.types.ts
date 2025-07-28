/**
 * AI Insights Types - Sprint 2 Type Safety
 * 
 * Type definitions for AI insights (energy, soreness, etc.) to replace 'any' types.
 * These types provide detailed structure for insights while maintaining backward compatibility.
 */

// ============================================================================
// CORE INSIGHT TYPES
// ============================================================================

/**
 * Base Insight Interface
 */
export interface BaseInsight {
  id: string;
  type: InsightType;
  message: string;
  confidence: number;
  actionable: boolean;
  category?: string;
  severity?: InsightSeverity;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Insight Types
 */
export type InsightType = 'warning' | 'info' | 'success' | 'error' | 'recommendation';

/**
 * Insight Severity Levels
 */
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Insight Categories
 */
export type InsightCategory = 
  | 'energy' 
  | 'soreness' 
  | 'duration' 
  | 'equipment' 
  | 'cross_component' 
  | 'general' 
  | 'recovery' 
  | 'performance';

// ============================================================================
// ENERGY INSIGHTS
// ============================================================================

/**
 * Energy Level Ranges
 */
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Energy Insight Specific Data
 */
export interface EnergyInsightData {
  energyLevel: EnergyLevel;
  recommendedDuration?: number;
  recommendedIntensity?: 'low' | 'medium' | 'high';
  recoveryNeeded?: boolean;
  caffeineRecommendation?: boolean;
  hydrationFocus?: boolean;
}

/**
 * Energy Insight
 */
export interface EnergyInsight extends BaseInsight {
  category: 'energy';
  data: EnergyInsightData;
}

/**
 * Energy Insight Templates
 */
export const ENERGY_INSIGHT_TEMPLATES = {
  LOW_ENERGY: {
    id: 'energy_low',
    type: 'warning' as const,
    message: 'Low energy detected - consider shorter workout or recovery focus',
    confidence: 0.8,
    actionable: true,
    category: 'energy' as const,
    severity: 'medium' as const,
    data: {
      energyLevel: 1,
      recommendedDuration: 20,
      recommendedIntensity: 'low' as const,
      recoveryNeeded: true,
      hydrationFocus: true
    }
  },
  MODERATE_ENERGY: {
    id: 'energy_moderate',
    type: 'info' as const,
    message: 'Moderate energy levels - standard workout intensity recommended',
    confidence: 0.7,
    actionable: true,
    category: 'energy' as const,
    severity: 'low' as const,
    data: {
      energyLevel: 3,
      recommendedDuration: 45,
      recommendedIntensity: 'medium' as const,
      recoveryNeeded: false
    }
  },
  HIGH_ENERGY: {
    id: 'energy_high',
    type: 'success' as const,
    message: 'High energy levels - great time for intense training',
    confidence: 0.9,
    actionable: true,
    category: 'energy' as const,
    severity: 'low' as const,
    data: {
      energyLevel: 5,
      recommendedDuration: 60,
      recommendedIntensity: 'high' as const,
      recoveryNeeded: false
    }
  }
} as const;

// ============================================================================
// SORENESS INSIGHTS
// ============================================================================

/**
 * Soreness Level Ranges
 */
export type SorenessLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Soreness Insight Specific Data
 */
export interface SorenessInsightData {
  sorenessLevel: SorenessLevel;
  affectedAreas?: string[];
  recommendedRecoveryTime?: number;
  gentleMovementRecommended?: boolean;
  stretchingFocus?: boolean;
  avoidStrenuousActivity?: boolean;
}

/**
 * Soreness Insight
 */
export interface SorenessInsight extends BaseInsight {
  category: 'soreness';
  data: SorenessInsightData;
}

/**
 * Soreness Insight Templates
 */
export const SORENESS_INSIGHT_TEMPLATES = {
  LOW_SORENESS: {
    id: 'soreness_low',
    type: 'info' as const,
    message: 'Minimal soreness - ready for regular training',
    confidence: 0.8,
    actionable: true,
    category: 'soreness' as const,
    severity: 'low' as const,
    data: {
      sorenessLevel: 1,
      recommendedRecoveryTime: 0,
      gentleMovementRecommended: false
    }
  },
  MODERATE_SORENESS: {
    id: 'soreness_moderate',
    type: 'warning' as const,
    message: 'Moderate soreness - consider lighter workout or active recovery',
    confidence: 0.7,
    actionable: true,
    category: 'soreness' as const,
    severity: 'medium' as const,
    data: {
      sorenessLevel: 3,
      recommendedRecoveryTime: 24,
      gentleMovementRecommended: true,
      stretchingFocus: true
    }
  },
  HIGH_SORENESS: {
    id: 'soreness_high',
    type: 'warning' as const,
    message: 'High soreness levels - focus on recovery and gentle movement',
    confidence: 0.9,
    actionable: true,
    category: 'soreness' as const,
    severity: 'high' as const,
    data: {
      sorenessLevel: 5,
      recommendedRecoveryTime: 48,
      gentleMovementRecommended: true,
      stretchingFocus: true,
      avoidStrenuousActivity: true
    }
  }
} as const;

// ============================================================================
// CROSS-COMPONENT INSIGHTS
// ============================================================================

/**
 * Cross-Component Conflict Types
 */
export type CrossComponentConflictType = 
  | 'energy_soreness' 
  | 'duration_energy' 
  | 'equipment_duration' 
  | 'energy_equipment' 
  | 'soreness_equipment';

/**
 * Cross-Component Insight
 */
export interface CrossComponentInsight extends BaseInsight {
  category: 'cross_component';
  conflictType: CrossComponentConflictType;
  affectedComponents: string[];
  resolution?: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// INSIGHT COLLECTIONS
// ============================================================================

/**
 * Insight Collection
 */
export interface InsightCollection {
  energy: EnergyInsight[];
  soreness: SorenessInsight[];
  crossComponent: CrossComponentInsight[];
  general: BaseInsight[];
}

/**
 * Insight Summary
 */
export interface InsightSummary {
  totalInsights: number;
  actionableInsights: number;
  warnings: number;
  criticalIssues: number;
  categories: Record<InsightCategory, number>;
  highestSeverity: InsightSeverity;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy Insight (for backward compatibility)
 */
export interface LegacyInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  confidence: number;
  actionable: boolean;
}

/**
 * Legacy Energy Insight (for backward compatibility)
 */
export interface LegacyEnergyInsight extends LegacyInsight {
  energyLevel?: number;
  recommendedDuration?: number;
}

/**
 * Legacy Soreness Insight (for backward compatibility)
 */
export interface LegacySorenessInsight extends LegacyInsight {
  sorenessLevel?: number;
  affectedAreas?: string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an object is a BaseInsight
 */
export function isBaseInsight(obj: unknown): obj is BaseInsight {
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
 * Type guard to check if an object is an EnergyInsight
 */
export function isEnergyInsight(obj: unknown): obj is EnergyInsight {
  return (
    isBaseInsight(obj) &&
    'category' in obj &&
    obj.category === 'energy' &&
    'data' in obj &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'energyLevel' in obj.data
  );
}

/**
 * Type guard to check if an object is a SorenessInsight
 */
export function isSorenessInsight(obj: unknown): obj is SorenessInsight {
  return (
    isBaseInsight(obj) &&
    'category' in obj &&
    obj.category === 'soreness' &&
    'data' in obj &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'sorenessLevel' in obj.data
  );
}

/**
 * Type guard to check if an object is a CrossComponentInsight
 */
export function isCrossComponentInsight(obj: unknown): obj is CrossComponentInsight {
  return (
    isBaseInsight(obj) &&
    'category' in obj &&
    obj.category === 'cross_component' &&
    'conflictType' in obj &&
    'affectedComponents' in obj
  );
}

/**
 * Type guard to check if an object is a LegacyInsight
 */
export function isLegacyInsight(obj: unknown): obj is LegacyInsight {
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
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create an energy insight from a template
 */
export function createEnergyInsight(
  energyLevel: EnergyLevel,
  template?: keyof typeof ENERGY_INSIGHT_TEMPLATES
): EnergyInsight {
  const baseTemplate = template ? ENERGY_INSIGHT_TEMPLATES[template] : ENERGY_INSIGHT_TEMPLATES.MODERATE_ENERGY;
  
  return {
    ...baseTemplate,
    id: `energy_${energyLevel}_${Date.now()}`,
    data: {
      ...baseTemplate.data,
      energyLevel
    },
    timestamp: new Date()
  };
}

/**
 * Create a soreness insight from a template
 */
export function createSorenessInsight(
  sorenessLevel: SorenessLevel,
  template?: keyof typeof SORENESS_INSIGHT_TEMPLATES
): SorenessInsight {
  const baseTemplate = template ? SORENESS_INSIGHT_TEMPLATES[template] : SORENESS_INSIGHT_TEMPLATES.MODERATE_SORENESS;
  
  return {
    ...baseTemplate,
    id: `soreness_${sorenessLevel}_${Date.now()}`,
    data: {
      ...baseTemplate.data,
      sorenessLevel
    },
    timestamp: new Date()
  };
}

/**
 * Convert legacy insight to new format
 */
export function convertLegacyInsight(legacy: LegacyInsight): BaseInsight {
  return {
    id: legacy.id,
    type: legacy.type,
    message: legacy.message,
    confidence: legacy.confidence,
    actionable: legacy.actionable,
    timestamp: new Date()
  };
} 