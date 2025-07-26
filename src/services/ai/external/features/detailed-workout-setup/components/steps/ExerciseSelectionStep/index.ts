// Main exports
export { default as ExerciseCard } from './components/ExerciseCard';
export { default as FilterControls } from './components/FilterControls';
export { default as ExerciseGrid } from './components/ExerciseGrid';

// Hook exports
export { useExerciseFiltering, useExerciseSelection } from './hooks';

// Type exports
export type {
  Exercise,
  ExerciseCardProps,
  ExerciseGridProps,
  FilterControlsProps,
  TabSelectorProps,
  SelectionSummaryProps,
  EmptyStateProps
} from './types';

// Constant exports
export { 
  EXERCISE_DATABASE, 
  CATEGORIES, 
  DIFFICULTIES, 
  EQUIPMENT_TYPES,
  filterExercisesByEquipment,
  filterExercisesBySearch,
  filterExercisesByCategory,
  filterExercisesByDifficulty
} from './constants';
