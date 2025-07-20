// Core types - foundation interfaces
export * from './core';

// Domain-specific types
export * from './duration';
export * from './equipment';
export * from './focus';
export * from './areas';
export * from './exercises';
export * from './user';
export * from './ai';
export * from './config';

// Re-export commonly used types for convenience
export type {
  PerWorkoutOptions,
  ValidationResult,
  CustomizationComponentProps,
  OptionDefinition,
  RatingScaleConfig
} from './core';

// Re-export type guards and utilities
export * from './guards';

export type {
  UserProfile,
  FitnessLevel,
  UserGoal
} from './user';

export type {
  AIRecommendationContext,
  AIRecommendation,
  AIAnalysis
} from './ai';

export type {
  CustomizationConfig,
  ConfigCategory,
  ConfigStep
} from './config';

export type {
  DurationConfigurationData,
  DurationOption
} from './duration';

export type {
  EquipmentSelectionData,
  EquipmentLocation,
  EquipmentContext
} from './equipment';

export type {
  WorkoutFocusConfigurationData,
  WorkoutFocus,
  FocusCategory
} from './focus';

export type {
  HierarchicalSelectionData,
  FocusArea,
  AnatomicalGroup
} from './areas';

export type {
  IncludeExercisesData,
  ExcludeExercisesData,
  ExerciseDefinition
} from './exercises'; 