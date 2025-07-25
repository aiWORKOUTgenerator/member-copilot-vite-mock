// Exercise Selection Step Types
export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions?: string[];
  tips?: string[];
}

export interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  selectionType: 'include' | 'exclude';
  onToggle: (exerciseId: string) => void;
  disabled?: boolean;
}

export interface ExerciseGridProps {
  exercises: Exercise[];
  selectedExercises: string[];
  selectionType: 'include' | 'exclude';
  onExerciseToggle: (exerciseId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface FilterControlsProps {
  searchTerm: string;
  selectedCategory: string;
  showFilters: boolean;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onToggleFilters: () => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export interface TabSelectorProps {
  activeTab: 'include' | 'exclude';
  onTabChange: (tab: 'include' | 'exclude') => void;
  includeCount: number;
  excludeCount: number;
  disabled?: boolean;
}

export interface SelectionSummaryProps {
  selectedInclude: string[];
  selectedExclude: string[];
  totalAvailable: number;
}

export interface EmptyStateProps {
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}
