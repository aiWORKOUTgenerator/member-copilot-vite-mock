// Enhanced Core Type System with Configuration-Driven Architecture
// Updated to support DRY principles, validation, and AI integration

export interface PerWorkoutOptions {
  // Simple value patterns with progressive enhancement
  customization_duration?: number | DurationConfigurationData;
  customization_focus?: string | WorkoutFocusConfigurationData;
  customization_include?: string | IncludeExercisesData;
  customization_exclude?: string | ExcludeExercisesData;
  
  // Array selection patterns with rich data support
  customization_equipment?: string[] | EquipmentSelectionData;
  customization_areas?: string[] | HierarchicalSelectionData;
  
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

// Pattern 2: Progressive Equipment Selection
export interface EquipmentSelectionData {
  location?: string;                    // Gym, Home, Outdoor
  contexts: string[];                   // Weight Training, Cardio, etc.
  specificEquipment: string[];          // Dumbbells, Barbell, etc.
  weights?: { [equipmentType: string]: number[] }; // Available weights
  lastUpdated?: Date;                   // For smart recommendations
  
  // Enhanced metadata for AI recommendations
  metadata?: {
    totalValue?: number;                // Equipment investment level
    spaceRequired?: 'minimal' | 'moderate' | 'large';
    maintenanceLevel?: 'low' | 'medium' | 'high';
    userExperience?: 'beginner' | 'intermediate' | 'advanced';
    aiRecommendations?: string[];
  };
  
  // Progressive disclosure state
  disclosureLevel?: 1 | 2 | 3 | 4;
  userPreferences?: {
    preferredBrands?: string[];
    budgetRange?: 'low' | 'medium' | 'high';
    spaceConstraints?: string[];
  };
}

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
      difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
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
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    workoutDensity?: number; // exercises per minute
    userPreferences?: Record<string, any>;
  };
}

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

// Enhanced exercise data structures with metadata
export interface IncludeExercisesData {
  customExercises: string;
  libraryExercises: string[];
  
  // Enhanced metadata
  metadata?: {
    primaryMuscleGroups?: string[];
    equipmentUsed?: string[];
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
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

// User profile interface for personalization
export interface UserProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferences: {
    workoutStyle?: string[];
    timePreference?: 'morning' | 'afternoon' | 'evening';
    intensityPreference?: 'low' | 'moderate' | 'high' | 'variable';
    advancedFeatures?: boolean;
    aiAssistanceLevel?: 'minimal' | 'moderate' | 'comprehensive';
  };
  limitations?: {
    injuries?: string[];
    timeConstraints?: number; // max minutes
    equipmentConstraints?: string[];
    physicalLimitations?: string[];
  };
  history?: {
    completedWorkouts?: number;
    averageDuration?: number;
    preferredFocusAreas?: string[];
    progressiveEnhancementUsage?: Record<string, number>;
    aiRecommendationAcceptance?: number;
  };
  learningProfile?: {
    prefersSimplicity?: boolean;
    explorationTendency?: 'conservative' | 'moderate' | 'adventurous';
    feedbackPreference?: 'minimal' | 'detailed' | 'comprehensive';
  };
}

// AI recommendation context
export interface AIRecommendationContext {
  currentSelections: Partial<PerWorkoutOptions>;
  userProfile: UserProfile;
  environmentalFactors?: {
    timeOfDay?: string;
    weather?: string;
    location?: string;
    availableTime?: number;
  };
  recentActivity?: {
    lastWorkoutDate?: Date;
    lastWorkoutType?: string;
    recoveryStatus?: 'full' | 'partial' | 'minimal';
    performanceMetrics?: Record<string, number>;
  };
  crossComponentAnalysis?: {
    conflicts?: string[];
    optimizations?: string[];
    missingComplements?: string[];
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
  showIf?: (userProfile: UserProfile, currentOptions: Partial<PerWorkoutOptions>) => boolean;
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
  config?: CustomizationConfig;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  
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
    difficulty: 'beginner' | 'intermediate' | 'advanced';
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

// Migration utility interfaces
export interface MigrationUtils {
  migrateToComplexStructure: (configKey: string, currentValue: any) => any;
  migrateToSimpleStructure: (configKey: string, currentValue: any) => any;
  isComplexObject: (value: any) => boolean;
  shouldEnhanceComponent: (
    configKey: string,
    userProfile: UserProfile,
    currentValue: any,
    usageHistory: Record<string, number>
  ) => {
    shouldEnhance: boolean;
    confidence: number;
    reasons: string[];
    benefits: string[];
  };
}

// AI integration interfaces
export interface AIRecommendationEngine {
  generateRecommendations: (
    options: PerWorkoutOptions,
    userProfile: UserProfile
  ) => {
    immediate: string[];
    contextual: string[];
    learning: string[];
    optimization: string[];
  };
  
  parseAIRecommendation: (
    configKey: string,
    recommendation: string,
    options: PerWorkoutOptions,
    userProfile: UserProfile
  ) => any;
  
  analyzeCrossComponentConflicts: (
    options: PerWorkoutOptions,
    userProfile: UserProfile
  ) => {
    conflicts: string[];
    optimizations: string[];
    missingComplements: string[];
  };
} 