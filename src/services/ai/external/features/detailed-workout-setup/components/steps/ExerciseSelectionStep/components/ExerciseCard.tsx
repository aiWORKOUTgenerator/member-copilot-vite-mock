import React from 'react';
import { Plus, X, Target, Zap } from 'lucide-react';
import { ExerciseCardProps } from '../types';

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isSelected,
  selectionType,
  onToggle,
  disabled = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSelectionStyle = () => {
    if (!isSelected) return 'border-gray-200 hover:border-gray-300 bg-white';
    
    return selectionType === 'include' 
      ? 'border-green-500 bg-green-50' 
      : 'border-red-500 bg-red-50';
  };

  const getSelectionIcon = () => {
    if (!isSelected) return null;
    
    const iconClass = `w-4 h-4 text-white`;
    const bgClass = selectionType === 'include' ? 'bg-green-500' : 'bg-red-500';
    
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgClass}`}>
        {selectionType === 'include' ? 
          <Plus className={iconClass} /> : 
          <X className={iconClass} />
        }
      </div>
    );
  };

  return (
    <div
      className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200 group
        ${getSelectionStyle()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={() => !disabled && onToggle(exercise.id)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyPress={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onToggle(exercise.id);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${exercise.name} for ${selectionType}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Exercise Header */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900 truncate">{exercise.name}</h4>
            <span className={`
              px-2 py-1 text-xs rounded-full font-medium flex-shrink-0
              ${getDifficultyColor(exercise.difficulty)}
            `}>
              {exercise.difficulty}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {exercise.description}
          </p>

          {/* Exercise Details */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {/* Category */}
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{exercise.category}</span>
            </div>

            {/* Primary Muscles */}
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {exercise.primaryMuscles.slice(0, 2).join(', ')}
                {exercise.primaryMuscles.length > 2 && '...'}
              </span>
            </div>

            {/* Equipment */}
            {exercise.equipment.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs">🏋️</span>
                <span className="truncate">
                  {exercise.equipment.slice(0, 1).join(', ')}
                  {exercise.equipment.length > 1 && '...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="ml-3 flex-shrink-0">
          {getSelectionIcon()}
        </div>
      </div>

      {/* Expanded Details on Hover/Focus */}
      {(exercise.primaryMuscles.length > 2 || exercise.equipment.length > 1) && (
        <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          {exercise.primaryMuscles.length > 2 && (
            <div className="text-xs text-gray-500 mb-1">
              <span className="font-medium">All muscles:</span> {exercise.primaryMuscles.join(', ')}
            </div>
          )}
          {exercise.equipment.length > 1 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Equipment:</span> {exercise.equipment.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCard; 