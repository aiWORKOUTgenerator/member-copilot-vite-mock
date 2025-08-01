// Core exports
export { DataTransformerBase } from './core/DataTransformerBase';
export { TransformationContext } from './core/TransformationContext';

// Transformer exports
export { ProfileDataTransformer } from './transformers/ProfileDataTransformer';
export { WorkoutFocusTransformer } from './transformers/WorkoutFocusTransformer';
export { PromptVariableComposer } from './transformers/PromptVariableComposer';
export { UserProfileTransformer } from './transformers/UserProfileTransformer';

// Validator exports
export { validateProfileData } from './validators/ProfileDataValidator';
export { validateWorkoutData } from './validators/WorkoutDataValidator';
export { validatePromptVariables } from './validators/PromptVariableValidator';

// Array transformation utilities
export {
  validatePreferredActivities,
  validateAvailableLocations,
  validateInjuries,
  validateEquipment
} from './utils/ArrayTransformUtils';

// Constants exports
export { VALIDATION_RULES, CORE_REQUIRED_FIELDS, ALL_REQUIRED_FIELDS } from './constants/ValidationRules';
export { DEFAULT_VALUES, DERIVED_VALUE_MAPS } from './constants/DefaultValues';

// Types exports
export type { ProfileFields } from './types/profile.types';
export type { ValidationResult } from '../../../../types/core';
export type { TransformedProfileData } from './transformers/ProfileDataTransformer';
export type { WorkoutFocusData } from './transformers/WorkoutFocusTransformer';
export type { PromptVariables } from './transformers/PromptVariableComposer';

// UserProfile types exports
export type {
  UserProfile,
  UserPreferences,
  UserBasicLimitations,
  AIEnhancedLimitations,
  AIWorkoutHistory,
  AILearningProfile,
  FitnessLevel,
  TimePreference,
  IntensityLevel,
  AIAssistanceLevel
} from './types/user.types'; 