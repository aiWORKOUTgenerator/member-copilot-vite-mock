import React, { useState, useCallback, useMemo } from 'react';
import { PerWorkoutOptions } from '../../../../../../../types/core';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';
import { FilterControls } from './ExerciseSelectionStep/components/FilterControls';
import { ExerciseGrid } from './ExerciseSelectionStep/components/ExerciseGrid';
import { useExerciseFiltering, useExerciseSelection } from './ExerciseSelectionStep/hooks';
import { useExerciseSelectionValidation } from '../hooks/useExerciseSelectionValidation';

interface ExerciseSelectionStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export type { ExerciseSelectionStepProps };

// eslint-disable-next-line max-lines-per-function
export const ExerciseSelectionStep: React.FC<ExerciseSelectionStepProps> = ({
  options,
  onChange,
  onValidation,
  workoutFeature,
  disabled = false
}) => {
  // UI State
  const [activeTab, setActiveTab] = useState<'include' | 'exclude'>('include');

  // Use the shared validation hook
  const {
    validationResults,
    conflicts,
    recommendations,
    isValidating,
    handleConflictDismiss,
    handleRecommendationApply
  } = useExerciseSelectionValidation({
    options,
    onChange,
    onValidation,
    workoutFeature
  });

  // Get current selections with useMemo to prevent unnecessary re-renders
  const selectedInclude = useMemo(() => (options.customization_include as string[]) || [], [options.customization_include]);
  const selectedExclude = useMemo(() => (options.customization_exclude as string[]) || [], [options.customization_exclude]);
  const availableEquipment = useMemo(() => (options.customization_equipment as string[]) || [], [options.customization_equipment]);

  // Use the extracted filtering hook
  const filtering = useExerciseFiltering(availableEquipment);

  // Use the extracted selection hook
  const exerciseSelection = useExerciseSelection({
    selectedInclude,
    selectedExclude,
    onChange: onChange as (key: string | number | symbol, value: unknown) => void,
    disabled
  });

  // Use filtered exercises from the hook
  const { filteredExercises } = filtering;

  // Handle exercise toggle with validation
  const handleExerciseToggle = useCallback((exerciseId: string, listType: 'include' | 'exclude') => {
    exerciseSelection.handleExerciseToggle(exerciseId, listType);
    
    // Trigger validation after change
    const newInclude = listType === 'include' 
      ? exerciseSelection.isExerciseSelected(exerciseId, 'include')
        ? selectedInclude.filter(id => id !== exerciseId)
        : [...selectedInclude, exerciseId]
      : selectedInclude;
    
    const newExclude = listType === 'exclude'
      ? exerciseSelection.isExerciseSelected(exerciseId, 'exclude')
        ? selectedExclude.filter(id => id !== exerciseId)
        : [...selectedExclude, exerciseId]
      : selectedExclude;

    // Update options and trigger validation
    onChange('customization_include', newInclude);
    onChange('customization_exclude', newExclude);
  }, [exerciseSelection, selectedInclude, selectedExclude, onChange]);

  // Clear all exercises from specified list
  const clearAll = useCallback((listType: 'include' | 'exclude') => {
    exerciseSelection.clearAll(listType);
  }, [exerciseSelection]);

  // Handle difficulty change (placeholder for future implementation)
  const handleDifficultyChange = useCallback(() => {
    // TODO: Add difficulty filtering to hook
  }, []);

  // Render the exercise selection interface
  const renderExerciseInterface = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Exercise Selection</h2>
        <p className="text-gray-600">Choose exercises to include or exclude from your workout</p>
      </div>

      {/* Tab Selection */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('include')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${activeTab === 'include' 
              ? 'bg-white text-green-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
          disabled={disabled}
        >
          Include Exercises ({exerciseSelection.includeCount})
        </button>
        <button
          onClick={() => setActiveTab('exclude')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${activeTab === 'exclude' 
              ? 'bg-white text-red-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
          disabled={disabled}
        >
          Exclude Exercises ({exerciseSelection.excludeCount})
        </button>
      </div>

      <FilterControls
        searchTerm={filtering.searchTerm}
        selectedCategory={filtering.selectedCategory}
        selectedDifficulty="All"
        showFilters={filtering.showFilters}
        onSearchChange={filtering.setSearchTerm}
        onCategoryChange={filtering.setSelectedCategory}
        onDifficultyChange={handleDifficultyChange}
        onToggleFilters={filtering.toggleFilters}
        onClearAll={() => clearAll(activeTab)}
        disabled={disabled}
        resultCount={filteredExercises.length}
      />

      {/* Exercise Grid */}
      <ExerciseGrid
        exercises={filteredExercises}
        selectedInclude={selectedInclude}
        selectedExclude={selectedExclude}
        activeTab={activeTab}
        onExerciseToggle={(exerciseId) => handleExerciseToggle(exerciseId, activeTab)}
        disabled={disabled}
        loading={isValidating}
      />

      {/* Loading Indicator */}
      {isValidating && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <AIRecommendationPanel
          recommendations={recommendations}
          onApply={handleRecommendationApply}
          className="mt-6"
        />
      )}

      {/* Cross-field Validation Warnings */}
      {conflicts.length > 0 && (
        <ConflictWarning
          conflicts={conflicts}
          onDismiss={handleConflictDismiss}
          className="mt-6"
        />
      )}

      {/* Validation Feedback */}
      {validationResults.include && !validationResults.include.isValid && (
        <ValidationFeedback
          validation={validationResults.include}
          size="small"
        />
      )}
    </div>
  );

  return renderExerciseInterface();
};

export default ExerciseSelectionStep; 