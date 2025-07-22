// QuickWorkoutSetup Feature - Public API
// This file serves as the main entry point for the QuickWorkoutSetup feature

// Main feature orchestrator (to be created)
export { QuickWorkoutFeature } from './QuickWorkoutFeature';

// Workflow components (to be created)
export { DurationStrategy } from './workflow/DurationStrategy';
export { PromptSelector } from './workflow/PromptSelector';
export { ResponseProcessor } from './workflow/ResponseProcessor';

// Feature-specific types (to be created)
export type {
  QuickWorkoutParams,
  QuickWorkoutResult,
  DurationConfig,
  WorkflowContext
} from './types/quick-workout.types';

// Feature constants (to be created)
export { QUICK_WORKOUT_CONSTANTS } from './constants/quick-workout.constants';

// Feature helpers (to be created)
export { DurationCalculator } from './helpers/DurationCalculator';
export { ExerciseStructureBuilder } from './helpers/ExerciseStructureBuilder';

// Feature metadata
export const FEATURE_METADATA = {
  name: 'QuickWorkoutSetup',
  version: '1.0.0',
  description: 'AI-powered quick workout generation with duration-specific optimization',
  supportedDurations: [5, 10, 15, 20, 30, 45],
  capabilities: [
    'duration-specific-optimization',
    'context-aware-prompts',
    'workout-structure-normalization',
    'equipment-integration',
    'fitness-level-adaptation'
  ]
} as const; 