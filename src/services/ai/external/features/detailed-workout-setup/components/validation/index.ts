export { physicalStateSchema, PhysicalStateData } from './physicalStateSchema';
export { exerciseSelectionSchema, ExerciseSelectionData } from './exerciseSelectionSchema';
export { VALIDATION_RULES, REQUIRED_FIELDS, EXERCISE_SELECTION_REQUIRED_FIELDS } from './validationRules';
export { 
  validateAndRecommend, 
  handleValidation,
  type Conflict,
  type AIRecommendation,
  type ValidationHandlersConfig,
  type ValidationHandlersResult
} from './validationHandlers';
export {
  validateExerciseSelection,
  handleExerciseSelectionValidation,
  type ExerciseSelectionConflict,
  type ExerciseSelectionRecommendation,
  type ExerciseSelectionValidationConfig,
  type ExerciseSelectionValidationResult
} from './exerciseSelectionValidationHandlers'; 