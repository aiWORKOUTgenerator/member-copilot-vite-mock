import React, { useState, useCallback, useMemo } from 'react';
import { Plus, X, Zap, Clock } from 'lucide-react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';
import { ExerciseCard } from './ExerciseSelectionStep/components/ExerciseCard';
import { FilterControls } from './ExerciseSelectionStep/components/FilterControls';
import { ExerciseGrid } from './ExerciseSelectionStep/components/ExerciseGrid';
import { EXERCISE_DATABASE, CATEGORIES } from './ExerciseSelectionStep/constants';
import { useExerciseFiltering, useExerciseSelection, useValidationLogic } from './ExerciseSelectionStep/hooks';
import type { Exercise } from './ExerciseSelectionStep/types';

interface ExerciseSelectionStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export type { ExerciseSelectionStepProps };


export const ExerciseSelectionStep: React.FC<ExerciseSelectionStepProps> = ({
  options,
  onChange,
  onValidation,
  workoutFeature,
  disabled = false
}) => {
  // UI State
  const [activeTab, setActiveTab] = useState<'include' | 'exclude'>('include');

  // Validation state is now handled by the useValidationLogic hook

  // AI recommendations state
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'form' | 'progression' | 'modification' | 'alternative';
    description: string;
    priority: 'low' | 'medium' | 'high';
    context?: Record<string, any>;
  }>>([]);

  // Get current selections
  const selectedInclude = (options.customization_include as string[]) || [];
  const selectedExclude = (options.customization_exclude as string[]) || [];
  const availableEquipment = (options.customization_equipment as string[]) || [];

  // Use the extracted filtering hook
  const filtering = useExerciseFiltering(availableEquipment);

  // Use the extracted selection hook
  const exerciseSelection = useExerciseSelection({
    selectedInclude,
    selectedExclude,
    onChange: onChange as any,
    disabled
  });

  // Use the extracted validation hook
  const validation = useValidationLogic({
    selectedInclude,
    selectedExclude,
    options,
    workoutFeature,
    availableEquipment,
    onValidation
  });

  // Use filtered exercises from the hook
  const { filteredExercises, availableExercises } = filtering;

  // Use the hook's handleExerciseToggle function
  const handleExerciseToggle = useCallback((exerciseId: string, listType: 'include' | 'exclude') => {
    exerciseSelection.handleExerciseToggle(exerciseId, listType);
    
    // Trigger validation after change
    validation.validateSelections();
  }, [exerciseSelection, validation]);

  // Use the hook's clearAll function
  const clearAll = useCallback((listType: 'include' | 'exclude') => {
    exerciseSelection.clearAll(listType);
    validation.validateSelections();
  }, [exerciseSelection, validation]);

  // Validation and recommendations are now handled by the useValidationLogic hook

  // Handle recommendation application
  const handleRecommendationApply = useCallback((type: string, description: string) => {
    if (type === 'modification' && description.includes('adding')) {
      const focus = typeof options.customization_focus === 'string' 
        ? options.customization_focus 
        : options.customization_focus?.focus;
      
      if (focus) {
        const focusExercises = EXERCISE_DATABASE.filter(ex => 
          ex.category.toLowerCase().includes(focus.toLowerCase())
        );
        
        const newExercises = focusExercises
          .filter(exercise => !selectedInclude.includes(exercise.id))
          .slice(0, 2)
          .map(ex => ex.id);
        
        onChange('customization_include', [...selectedInclude, ...newExercises]);
      }
    }
  }, [options, selectedInclude, onChange]);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    validation.dismissConflict(conflictId);
  }, [validation]);



  return (
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
        onDifficultyChange={() => {}} // TODO: Add difficulty filtering to hook
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
        loading={false}
      />

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <AIRecommendationPanel
          recommendations={recommendations}
          onApply={handleRecommendationApply}
          className="mt-6"
        />
      )}

      {/* Cross-field Validation Warnings */}
      {validation.conflicts.length > 0 && (
        <ConflictWarning
          conflicts={validation.conflicts}
          onDismiss={handleConflictDismiss}
          className="mt-6"
        />
      )}

      {/* Validation Feedback */}
      {validation.validationResults.include && !validation.validationResults.include.isValid && (
        <ValidationFeedback
          validation={validation.validationResults.include}
          size="small"
        />
      )}
    </div>
  );
};

export default ExerciseSelectionStep; 