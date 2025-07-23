import { ValidationResult } from './core';

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