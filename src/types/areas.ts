// Pattern 3: Hierarchical Focus Areas
export interface HierarchicalSelectionData {
  [categoryKey: string]: {
    selected: boolean;
    label: string;
    description?: string;
    level: 'primary' | 'secondary' | 'tertiary';
    parentKey?: string;     // Reference to parent
    children?: string[];    // Child categories
    
    // Enhanced metadata for intelligent recommendations
    metadata?: {
      anatomicalGroup?: string;
      difficultyLevel?: 'new to exercise' | 'some experience' | 'advanced athlete';
      recoveryTime?: number; // hours needed for recovery
      synergisticMuscles?: string[]; // related muscle groups
      contraindications?: string[];
      aiWeight?: number; // for recommendation ranking
    };
    
    // Intelligent selection context
    selectionContext?: {
      reason?: 'user_selected' | 'ai_recommended' | 'cascading_selection';
      confidence?: number;
      alternatives?: string[];
    };
  };
}

// Focus area types
export type FocusArea = 
  | 'Upper Body' 
  | 'Lower Body' 
  | 'Core' 
  | 'Full Body' 
  | 'Cardio' 
  | 'Functional';

// Anatomical group types
export type AnatomicalGroup = 
  | 'upper_body' 
  | 'lower_body' 
  | 'core' 
  | 'full_body' 
  | 'cardio' 
  | 'functional';

// Focus area option definition
export interface FocusAreaOption {
  value: FocusArea;
  label: string;
  description: string;
  metadata?: {
    anatomicalGroup: AnatomicalGroup;
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    difficulty?: 'new to exercise' | 'some experience' | 'advanced athlete';
    recoveryTime?: number;
  };
}

// Focus area validation rules
export interface FocusAreaValidationRules {
  maxSelections?: number;
  incompatibleCombinations?: string[][];
  recommendedCombinations?: string[][];
  balanceRequirements?: {
    requiresUpperLower?: boolean;
    requiresCore?: boolean;
    maxSingleArea?: number;
  };
}

// Focus area analysis
export interface FocusAreaAnalysis {
  balance: 'balanced' | 'upper_heavy' | 'lower_heavy' | 'core_heavy';
  totalMuscleGroups: number;
  recoveryRequirements: number; // hours
  recommendations: string[];
  warnings: string[];
} 