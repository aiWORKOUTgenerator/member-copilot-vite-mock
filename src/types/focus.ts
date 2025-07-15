import { ValidationResult } from './core';

// Pattern 5: Enhanced Workout Focus with Rich Metadata
export interface WorkoutFocusConfigurationData {
  selected: boolean;
  focus: string;          // e.g., "strength_training"
  focusLabel: string;     // e.g., "Strength Training"
  format?: string;        // e.g., "straight_sets"
  formatLabel?: string;   // e.g., "Straight Sets"
  label: string;          // Combined display label
  value: string;          // Backend value
  description: string;
  configuration: 'focus-only' | 'focus-with-format';
  
  metadata: {
    intensity: 'low' | 'moderate' | 'high' | 'variable';
    equipment: 'minimal' | 'moderate' | 'full-gym';
    experience: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    duration_compatibility: number[];
    category: 'strength_power' | 'muscle_building' | 'conditioning_cardio' | 'functional_recovery';
    
    // Enhanced AI context
    primaryBenefit?: string;
    secondaryBenefits?: string[];
    contraindications?: string[];
    progressionPath?: string[];
    restRequirements?: {
      betweenSets?: number;
      betweenExercises?: number;
      postWorkout?: number; // hours
    };
  };
  
  validation?: ValidationResult;
}

// Focus types and categories
export type WorkoutFocus = 
  | 'strength' 
  | 'endurance' 
  | 'weight_loss' 
  | 'flexibility' 
  | 'power' 
  | 'recovery';

export type FocusCategory = 
  | 'strength_power' 
  | 'muscle_building' 
  | 'conditioning_cardio' 
  | 'functional_recovery';

export type TrainingFormat = 
  | 'straight_sets' 
  | 'super_sets' 
  | 'drop_sets' 
  | 'pyramid' 
  | 'circuit' 
  | 'interval';

// Focus option definition
export interface FocusOption {
  value: WorkoutFocus;
  label: string;
  sublabel: string;
  description: string;
  metadata: {
    icon: React.ComponentType<{ className?: string }>;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: FocusCategory;
    badge?: string;
    formats?: TrainingFormat[];
  };
}

// Focus validation rules
export interface FocusValidationRules {
  requiresEquipment?: string[];
  incompatibleWith?: string[];
  minimumDuration?: number;
  maximumDuration?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
} 