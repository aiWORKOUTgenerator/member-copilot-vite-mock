import { ValidationResult } from './core';

// Focus option definition
export interface FocusOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  equipment: string[];
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  muscleGroups: string[];
  benefits: string[];
}

// Focus category definition
export interface FocusCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: FocusOption[];
}

// Focus validation rules
export interface FocusValidationRules {
  requiredFields: string[];
  allowedCategories: string[];
  allowedIntensities: string[];
  allowedEquipment: string[];
  minDuration: number;
  maxDuration: number;
} 