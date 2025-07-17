import React from 'react';

// Core interface for all workout customization options
export interface PerWorkoutOptions {
  // Simple value patterns with progressive enhancement
  customization_duration?: number | import('./duration').DurationConfigurationData;
  customization_focus?: string | import('./focus').WorkoutFocusConfigurationData;
  customization_include?: string | import('./exercises').IncludeExercisesData;
  customization_exclude?: string | import('./exercises').ExcludeExercisesData;
  
  // Array selection patterns with rich data support
  customization_equipment?: string[] | import('./equipment').EquipmentSelectionData;
  customization_areas?: string[] | import('./areas').HierarchicalSelectionData;
  
  // Rating scale patterns
  customization_energy?: number;
  customization_sleep?: number;
  
  // Category-rating hybrid patterns
  customization_soreness?: CategoryRatingData;
  customization_stress?: CategoryRatingData;
}

// Enhanced validation system
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  recommendations?: string[];
  aiSuggestions?: string[];
  crossComponentInsights?: {
    relatedFields: string[];
    conflictAnalysis?: string[];
    optimizationSuggestions?: string[];
  };
}

// Pattern 1: Category-Rating Combinations
export interface CategoryRatingData {
  [categoryKey: string]: {
    selected: boolean;
    rating?: number;        // 1-5 scale
    label: string;          // Human-readable name
    description?: string;   // Contextual help
    metadata?: {
      severity?: 'mild' | 'moderate' | 'severe';
      affectedActivities?: string[];
    };
  };
}

// Enhanced option interface for DRY components
export interface OptionDefinition<T = any> {
  value: T;
  label: string;
  sublabel?: string;
  description?: string;
  disabled?: boolean;
  
  // Enhanced metadata for intelligent rendering
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
    category?: string;
    tags?: string[];
    aiWeight?: number; // for recommendation ranking
  };
  
  // Conditional rendering
  showIf?: (userProfile: import('./user').UserProfile, currentOptions: Partial<PerWorkoutOptions>) => boolean;
}

// Rating scale configuration
export interface RatingScaleConfig {
  min: number;
  max: number;
  labels: {
    low: string;
    high: string;
    scale?: string[]; // custom labels for each rating
  };
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showValue?: boolean;
}

// Generic component interface with enhanced props
export interface CustomizationComponentProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  error?: string;
  
  // Enhanced context
  config?: import('./config').CustomizationConfig;
  userProfile?: import('./user').UserProfile;
  aiContext?: import('./ai').AIRecommendationContext;
  
  // Progressive enhancement
  onEnhancementToggle?: (enhance: boolean) => void;
  complexityLevel?: 'simple' | 'medium' | 'complex';
  
  // Performance monitoring
  onInteraction?: (interaction: any) => void;
  onComplexityChange?: (from: string, to: string) => void;
  
  // AI integration
  onAIRecommendationApply?: (recommendation: string) => void;
  onAIFeedback?: (feedback: any) => void;
} 

/**
 * Represents the view mode for components that support simple/complex views
 */
export type ViewMode = 'simple' | 'complex'; 