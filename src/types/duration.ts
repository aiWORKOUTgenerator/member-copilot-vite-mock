import { ValidationResult } from './core';

// Pattern 4: Enhanced Duration with Structure and Validation
export interface DurationConfigurationData {
  selected: boolean;
  totalDuration: number;
  label: string;
  value: number;          // Backend compatibility
  description?: string;
  
  // Nested structure for advanced users
  warmUp: {
    included: boolean;
    duration: number;
    percentage?: number;
    type?: 'dynamic' | 'static' | 'cardio' | 'mixed';
  };
  
  coolDown: {
    included: boolean;
    duration: number;
    percentage?: number;
    type?: 'static_stretch' | 'walking' | 'breathing' | 'mixed';
  };
  
  workingTime: number;    // Auto-calculated
  configuration: 'duration-only' | 'with-warmup' | 'with-cooldown' | 'full-structure';
  
  // Enhanced validation with AI context
  validation?: ValidationResult;
  
  // AI-powered optimization suggestions
  aiOptimizations?: {
    efficiency: number;
    recommendations: string[];
    physiologicalGuidance: string[];
  };
  
  // Metadata for AI recommendations
  metadata?: {
    intensityLevel?: 'low' | 'moderate' | 'high' | 'variable';
    fitnessLevel?: 'new to exercise' | 'some experience' | 'advanced athlete';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    workoutDensity?: number; // exercises per minute
    userPreferences?: Record<string, any>;
  };
}

// Duration validation specific types
export interface DurationValidationRules {
  minDuration: number;
  maxDuration: number;
  minWarmup: number;
  maxWarmup: number;
  minCooldown: number;
  maxCooldown: number;
  minWorkingTime: number;
}

// Duration option definition
export interface DurationOption {
  value: number;
  label: string;
  sublabel: string;
  description: string;
  metadata?: {
    recommended?: boolean;
    popular?: boolean;
    intensity?: 'low' | 'moderate' | 'high';
  };
} 