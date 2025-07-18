import React from 'react';
import { PerWorkoutOptions, CustomizationComponentProps, ValidationResult } from './core';
import { AIRecommendationContext } from './ai';

// Enhanced configuration system with validation and AI support
export interface CustomizationConfig {
  key: keyof PerWorkoutOptions;
  component: React.ComponentType<CustomizationComponentProps<any>>;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  required?: boolean;
  order?: number;
  comingSoon?: boolean;
  
  // Rich metadata for AI recommendations and validation
  metadata?: {
    difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
    timeRequired: number; // minutes to complete
    dependencies?: Array<keyof PerWorkoutOptions>; // other fields this depends on
    aiContext?: string; // context for AI recommendations
    tags?: string[]; // for filtering and search
    learningObjectives?: string[];
    userBenefits?: string[];
  };
  
  // Validation configuration
  validation?: {
    required?: boolean;
    custom?: (value: any, allOptions: PerWorkoutOptions) => ValidationResult;
    dependencies?: Array<keyof PerWorkoutOptions>;
    aiValidation?: (value: any, context: AIRecommendationContext) => ValidationResult;
    crossComponentRules?: {
      field: keyof PerWorkoutOptions;
      rule: (thisValue: any, otherValue: any) => boolean;
      message: string;
    }[];
  };
  
  // UI configuration for DRY components
  uiConfig?: {
    componentType?: 'option-grid' | 'rating-scale' | 'text-input' | 'progressive-disclosure' | 'custom';
    gridColumns?: { base: number; sm?: number; md?: number; lg?: number };
    size?: 'sm' | 'md' | 'lg';
    multiSelect?: boolean;
    progressiveEnhancement?: boolean;
    aiAssistance?: 'none' | 'suggestions' | 'full';
  };
  
  // Performance and analytics
  analytics?: {
    trackInteractions?: boolean;
    trackComplexityChanges?: boolean;
    trackAIRecommendationUsage?: boolean;
    customEvents?: string[];
  };
}

// Configuration category types
export interface ConfigCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  configs: CustomizationConfig[];
}

// Configuration step types
export interface ConfigStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  configs: CustomizationConfig[];
}

// Configuration validation types
export interface ConfigValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  recommendations: Record<string, string[]>;
}

// Configuration factory types
export interface ConfigFactory {
  createConfig: (overrides?: Partial<CustomizationConfig>) => CustomizationConfig;
  validateConfig: (config: CustomizationConfig) => ValidationResult;
  enhanceConfig: (config: CustomizationConfig, context: any) => CustomizationConfig;
} 