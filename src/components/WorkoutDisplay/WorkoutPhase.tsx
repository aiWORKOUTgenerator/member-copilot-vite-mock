import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Play, Pause, RotateCcw, Lightbulb } from 'lucide-react';
import { WorkoutPhaseDisplayProps } from '../../types/workout-results.types';
import { ExerciseCard } from './ExerciseCard';

export const WorkoutPhase: React.FC<WorkoutPhaseDisplayProps> = ({ 
  phase, 
  title, 
  isActive = false, 
  onExerciseClick 
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const getDurationDisplay = () => {
    if (!phase?.duration) return '0s';
    const minutes = Math.floor(phase.duration / 60);
    const seconds = phase.duration % 60;
    // ✅ FIXED: Always show minutes if duration is 60+ seconds, otherwise show seconds
    if (phase.duration >= 60) {
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getPhaseColor = (title: string) => {
    switch (title.toLowerCase()) {
      case 'warm-up':
      case 'warmup':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      case 'main workout':
      case 'main':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'cool-down':
      case 'cooldown':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  const colors = getPhaseColor(title);

  const toggleExerciseCompletion = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const getCompletionPercentage = () => {
    if (!phase?.exercises?.length) return 0;
    return Math.round((completedExercises.size / phase.exercises.length) * 100);
  };

  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      {/* Phase Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${colors.icon}`} />
              <h3 className={`text-xl font-semibold ${colors.text}`}>{title}</h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                {getDurationDisplay()}
              </span>
              <span className={`px-3 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                {phase?.exercises?.length || 0} exercise{(phase?.exercises?.length || 0) !== 1 ? 's' : ''}
              </span>
              {completedExercises.size > 0 && (
                <span className="px-3 py-1 rounded-full font-medium bg-green-100 text-green-800">
                  {getCompletionPercentage()}% complete
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isActive && (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            )}
            <button className={`p-2 rounded-lg hover:bg-white/50 transition-colors ${colors.text}`}>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Phase Instructions */}
        {phase?.instructions && (
          <div className="mt-4">
            <p className={`text-sm ${colors.text} opacity-90`}>{phase.instructions}</p>
          </div>
        )}

        {/* Progress Bar */}
        {completedExercises.size > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-medium text-gray-600">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Phase Tips */}
          {phase?.tips && phase.tips.length > 0 && (
            <div className="mb-6 p-4 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="font-medium text-gray-900">Tips for this phase</h4>
              </div>
              <ul className="space-y-2">
                {phase.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-4">
            {phase?.exercises?.map((exercise, index) => (
              <div key={exercise.id} className="relative">
                {/* Exercise Number and Completion */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => toggleExerciseCompletion(exercise.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                        completedExercises.has(exercise.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : `border-gray-300 text-gray-600 hover:border-gray-400`
                      }`}
                    >
                      {completedExercises.has(exercise.id) ? '✓' : index + 1}
                    </button>
                    {index < (phase?.exercises?.length || 0) - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <ExerciseCard
                      exercise={exercise}
                      compact={false}
                      showModifications={true}
                      showNotes={true}
                    />
                  </div>
                </div>

                {/* Exercise Actions */}
                <div className="mt-2 ml-12 flex items-center gap-2">
                  <button
                    onClick={() => onExerciseClick?.(exercise)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </button>
                  {completedExercises.has(exercise.id) && (
                    <button
                      onClick={() => toggleExerciseCompletion(exercise.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Mark Incomplete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Phase Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Mark all exercises as complete
                  setCompletedExercises(new Set(phase?.exercises?.map(e => e.id) || []));
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Mark All Complete
              </button>
              <button
                onClick={() => {
                  // Clear all completed exercises
                  setCompletedExercises(new Set());
                }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Reset Progress
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              {completedExercises.size} of {phase?.exercises?.length || 0} exercises completed
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 