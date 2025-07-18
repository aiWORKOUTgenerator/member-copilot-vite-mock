// Enhanced exercise data structures with metadata
export interface IncludeExercisesData {
  customExercises: string;
  libraryExercises: string[];
  
  // Enhanced metadata
  metadata?: {
    primaryMuscleGroups?: string[];
    equipmentUsed?: string[];
    difficultyLevel?: 'new to exercise' | 'some experience' | 'advanced athlete';
    estimatedTime?: number; // minutes
  };
}

export interface ExcludeExercisesData {
  customExercises: string;
  libraryExercises: string[];
  
  // Enhanced metadata for AI understanding
  metadata?: {
    exclusionReasons?: ('injury' | 'equipment' | 'preference' | 'space' | 'other')[];
    alternativeSuggestions?: string[];
    temporaryExclusion?: boolean; // vs permanent
  };
}

// Exercise library types
export interface ExerciseDefinition {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscleGroups: {
    primary: string[];
    secondary: string[];
  };
  equipment: string[];
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  category: string;
  tags: string[];
  variations?: string[];
  contraindications?: string[];
  progressions?: string[];
  regressions?: string[];
}

// Exercise parsing types
export interface ParsedExercise {
  original: string;
  normalized: string;
  confidence: number;
  suggestions: string[];
  matchType: 'exact' | 'partial' | 'fuzzy' | 'none';
}

// Exercise validation types
export interface ExerciseValidation {
  recognized: ParsedExercise[];
  unrecognized: string[];
  conflicts: string[];
  recommendations: string[];
  alternatives: Record<string, string[]>;
}

// Exercise selection analysis
export interface ExerciseSelectionAnalysis {
  totalExercises: number;
  muscleGroupCoverage: Record<string, number>;
  equipmentRequired: string[];
  difficultyDistribution: Record<string, number>;
  estimatedTime: number;
  balance: 'balanced' | 'imbalanced';
  recommendations: string[];
} 