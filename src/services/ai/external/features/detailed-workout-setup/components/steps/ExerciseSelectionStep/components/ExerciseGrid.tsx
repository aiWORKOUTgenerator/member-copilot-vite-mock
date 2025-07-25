import React from 'react';
import { Target } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import type { Exercise } from '../types';

interface ExerciseGridProps {
  exercises: Exercise[];
  selectedInclude: string[];
  selectedExclude: string[];
  activeTab: 'include' | 'exclude';
  onExerciseToggle: (exerciseId: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises,
  selectedInclude,
  selectedExclude,
  activeTab,
  onExerciseToggle,
  disabled = false,
  loading = false
}) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Loading exercises...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'include' ? 'Include' : 'Exclude'} Exercises
          </h3>
          <span className="text-sm text-gray-500">0 exercises</span>
        </div>
        
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find more exercises.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeTab === 'include' ? 'Include' : 'Exclude'} Exercises
        </h3>
        <span className="text-sm text-gray-500">
          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exercises.map(exercise => {
          const isIncluded = selectedInclude.includes(exercise.id);
          const isExcluded = selectedExclude.includes(exercise.id);
          const isSelected = activeTab === 'include' ? isIncluded : isExcluded;
          
          return (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise}
              isSelected={isSelected}
              selectionType={activeTab}
              onToggle={(exerciseId) => onExerciseToggle(exerciseId)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseGrid; 