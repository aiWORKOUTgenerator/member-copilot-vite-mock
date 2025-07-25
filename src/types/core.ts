import React from 'react';

// Core type definitions for workout generation
export interface DurationConfigurationData {
  duration: number;
  warmupDuration: number;
  mainDuration: number;
  cooldownDuration: number;
  selected?: boolean;
  label?: string;
  metadata?: {
    intensity?: 'low' | 'moderate' | 'high';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
  }
}

export interface WorkoutFocusConfigurationData {
  focus: string;
  label: string;
  selected?: boolean;
  metadata: {
    intensity: 'low' | 'moderate' | 'high';
    equipment: 'minimal' | 'moderate' | 'full-gym';
    experience: 'new to exercise' | 'some experience' | 'advanced athlete';
    duration_compatibility: number[];
  }
}

export interface CategoryRatingData {
  rating: number;
  categories: string[];
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface PerWorkoutOptions {
  customization_duration?: number | DurationConfigurationData;
  customization_focus?: string | WorkoutFocusConfigurationData;
  customization_equipment?: string[];
  customization_location?: string;
  customization_intensity?: string;
  customization_energy?: number;
  customization_soreness?: string[];
  customization_stress?: CategoryRatingData;
  customization_areas?: string[];
  customization_include?: string[];
  customization_exclude?: string[];
  customization_sleep?: number;
}

// Enhanced option interface for DRY components
export interface OptionDefinition<T = any> {
  value: T;
  label: string;
  sublabel?: string;
  description?: string;
  disabled?: boolean;
  metadata?: {
    difficulty?: 'new to exercise' | 'some experience' | 'advanced athlete';
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
    category?: string;
    tags?: string[];
  }
}

export interface CustomizationComponentProps<T> {
  value: T;
  onChange: (value: T) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
  options?: OptionDefinition<T>[];
} 

/**
 * Represents the view mode for components that support simple/complex views
 */
export type ViewMode = 'simple' | 'complex'; 