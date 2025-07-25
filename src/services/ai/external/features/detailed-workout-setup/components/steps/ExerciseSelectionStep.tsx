import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, X, Filter, Target, Zap, Clock } from 'lucide-react';
import { PerWorkoutOptions, ValidationResult } from '../../../../../../../types/core';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

interface ExerciseSelectionStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

// Comprehensive exercise database
const EXERCISE_DATABASE: Exercise[] = [
  // Upper Body Exercises
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Chest', 'Shoulders', 'Triceps'],
    difficulty: 'beginner',
    description: 'Classic bodyweight exercise targeting chest and arms'
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'Upper Body',
    equipment: ['Pull-up Bar'],
    primaryMuscles: ['Back', 'Biceps'],
    difficulty: 'intermediate',
    description: 'Upper body pulling exercise for back strength'
  },
  {
    id: 'diamond-push-ups',
    name: 'Diamond Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Chest', 'Triceps'],
    difficulty: 'intermediate',
    description: 'Advanced push-up variation targeting triceps'
  },
  {
    id: 'pike-push-ups',
    name: 'Pike Push-ups',
    category: 'Upper Body',
    equipment: [],
    primaryMuscles: ['Shoulders', 'Triceps'],
    difficulty: 'intermediate',
    description: 'Shoulder-focused push-up variation'
  },

  // Lower Body Exercises
  {
    id: 'squats',
    name: 'Squats',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    difficulty: 'beginner',
    description: 'Fundamental lower body movement'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    difficulty: 'beginner',
    description: 'Unilateral leg exercise for balance and strength'
  },
  {
    id: 'jump-squats',
    name: 'Jump Squats',
    category: 'Lower Body',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    difficulty: 'intermediate',
    description: 'Explosive squat variation for power development'
  },

  // Core & Abs Exercises
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Abs'],
    difficulty: 'beginner',
    description: 'Basic abdominal exercise'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Abs', 'Obliques'],
    difficulty: 'intermediate',
    description: 'Dynamic core exercise targeting abs and obliques'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Obliques'],
    difficulty: 'intermediate',
    description: 'Rotational core exercise'
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Lower Abs'],
    difficulty: 'intermediate',
    description: 'Lower abdominal isolation exercise'
  },
  {
    id: 'planks',
    name: 'Planks',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Core'],
    difficulty: 'beginner',
    description: 'Static core stability exercise'
  },
  {
    id: 'side-planks',
    name: 'Side Planks',
    category: 'Core & Abs',
    equipment: [],
    primaryMuscles: ['Obliques', 'Core'],
    difficulty: 'intermediate',
    description: 'Unilateral core stability exercise'
  },

  // Cardio Exercises
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Classic cardio exercise'
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Quadriceps', 'Core'],
    difficulty: 'beginner',
    description: 'Running in place with high knee lift'
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Hamstrings'],
    difficulty: 'beginner',
    description: 'Running in place with heel to glute contact'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Core', 'Shoulders'],
    difficulty: 'intermediate',
    description: 'Dynamic plank variation with running motion'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'Cardio',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'intermediate',
    description: 'High-intensity full body exercise'
  },

  // Flexibility & Mobility
  {
    id: 'cat-cow-stretches',
    name: 'Cat-Cow Stretches',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Back', 'Core'],
    difficulty: 'beginner',
    description: 'Gentle spinal mobility exercise'
  },
  {
    id: 'childs-pose',
    name: 'Child\'s Pose',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Back', 'Hips'],
    difficulty: 'beginner',
    description: 'Restorative stretching pose'
  },
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    category: 'Flexibility & Mobility',
    equipment: [],
    primaryMuscles: ['Shoulders', 'Hamstrings', 'Calves'],
    difficulty: 'beginner',
    description: 'Yoga pose for shoulder and hamstring flexibility'
  },

  // Recovery Exercises
  {
    id: 'light-walking',
    name: 'Light Walking',
    category: 'Recovery',
    equipment: [],
    primaryMuscles: ['Legs'],
    difficulty: 'beginner',
    description: 'Gentle movement for active recovery'
  },
  {
    id: 'gentle-stretching',
    name: 'Gentle Stretching',
    category: 'Recovery',
    equipment: [],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Low-intensity stretching for recovery'
  },
  {
    id: 'foam-rolling',
    name: 'Foam Rolling',
    category: 'Recovery',
    equipment: ['Foam Roller'],
    primaryMuscles: ['Full Body'],
    difficulty: 'beginner',
    description: 'Self-myofascial release technique'
  }
];

const CATEGORIES = ['All', 'Upper Body', 'Lower Body', 'Core & Abs', 'Cardio', 'Flexibility & Mobility', 'Recovery'];

export const ExerciseSelectionStep: React.FC<ExerciseSelectionStepProps> = ({
  options,
  onChange,
  onValidation,
  workoutFeature,
  disabled = false
}) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'include' | 'exclude'>('include');

  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<Array<{
    id: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    affectedFields: string[];
    suggestedAction?: {
      label: string;
      action: () => void;
    };
  }>>([]);

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

  // Filter exercises based on available equipment
  const availableExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(exercise => {
      if (exercise.equipment.length === 0) return true;
      if (!availableEquipment || availableEquipment.length === 0) return true;
      return exercise.equipment.some(eq => availableEquipment.includes(eq));
    });
  }, [availableEquipment]);

  // Apply search and filter criteria
  const filteredExercises = useMemo(() => {
    return availableExercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableExercises, searchTerm, selectedCategory]);

  // Handle exercise selection
  const handleExerciseToggle = useCallback((exerciseId: string, listType: 'include' | 'exclude') => {
    if (disabled) return;

    if (listType === 'include') {
      const currentSelected = selectedInclude || [];
      const newSelected = currentSelected.includes(exerciseId)
        ? currentSelected.filter(id => id !== exerciseId)
        : [...currentSelected, exerciseId];
      
      onChange('customization_include', newSelected);
      
      // Remove from exclude list if adding to include
      if (!currentSelected.includes(exerciseId)) {
        const currentExcluded = selectedExclude || [];
        const newExcluded = currentExcluded.filter(id => id !== exerciseId);
        onChange('customization_exclude', newExcluded);
      }
    } else {
      const currentSelected = selectedExclude || [];
      const newSelected = currentSelected.includes(exerciseId)
        ? currentSelected.filter(id => id !== exerciseId)
        : [...currentSelected, exerciseId];
      
      onChange('customization_exclude', newSelected);
      
      // Remove from include list if adding to exclude
      if (!currentSelected.includes(exerciseId)) {
        const currentIncluded = selectedInclude || [];
        const newIncluded = currentIncluded.filter(id => id !== exerciseId);
        onChange('customization_include', newIncluded);
      }
    }

    // Trigger validation after change
    validateAndRecommend();
  }, [selectedInclude, selectedExclude, onChange, disabled]);

  // Clear all exercises in current tab
  const clearAll = useCallback((listType: 'include' | 'exclude') => {
    if (disabled) return;
    
    if (listType === 'include') {
      onChange('customization_include', []);
    } else {
      onChange('customization_exclude', []);
    }

    validateAndRecommend();
  }, [onChange, disabled]);

  // Validate and generate recommendations
  const validateAndRecommend = useCallback(async () => {
    try {
      // Validate exercise selections
      const validationResult = await workoutFeature.validateExerciseSelections({
        include: selectedInclude,
        exclude: selectedExclude,
        focus: options.customization_focus,
        equipment: availableEquipment,
        duration: options.customization_duration
      });

      // Update conflicts based on validation result
      if (!validationResult.isValid && validationResult.details?.conflicts) {
        setConflicts(validationResult.details.conflicts.map((conflict, index) => ({
          id: `exercise-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => {
              if (conflict.suggestion?.changes) {
                Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                  onChange(key as keyof PerWorkoutOptions, value);
                });
              }
            }
          } : undefined
        })));
      } else {
        setConflicts([]);
      }

      // Generate AI recommendations
      const aiRecommendations = [];
      
      // Check for exercise variety
      if (selectedInclude.length < 3) {
        aiRecommendations.push({
          type: 'form',
          description: 'Consider adding more exercises for better workout variety',
          priority: 'medium',
          context: { currentCount: selectedInclude.length }
        });
      }

      // Check for focus alignment
      if (options.customization_focus && selectedInclude.length > 0) {
        const focus = typeof options.customization_focus === 'string' 
          ? options.customization_focus 
          : options.customization_focus.focus;
        
        const focusExercises = EXERCISE_DATABASE.filter(ex => ex.category.toLowerCase().includes(focus.toLowerCase()));
        const selectedFocusExercises = selectedInclude.filter(
          exerciseId => focusExercises.some(ex => ex.id === exerciseId)
        );
        
        if (selectedFocusExercises.length === 0) {
          aiRecommendations.push({
            type: 'modification',
            description: `Consider adding ${focus} exercises to align with your focus`,
            priority: 'high',
            context: { focus, availableExercises: focusExercises.slice(0, 5).map(ex => ex.name) }
          });
        }
      }

      setRecommendations(aiRecommendations);

      // Update validation state
      const isValid = validationResult.isValid && aiRecommendations.length === 0;
      onValidation?.(isValid);

    } catch (error) {
      console.error('Error validating exercise selections:', error);
    }
  }, [workoutFeature, selectedInclude, selectedExclude, options, availableEquipment, onChange, onValidation]);

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
    setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
  }, []);

  // Exercise Card Component
  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const isIncluded = selectedInclude.includes(exercise.id);
    const isExcluded = selectedExclude.includes(exercise.id);
    const isSelected = activeTab === 'include' ? isIncluded : isExcluded;

    return (
      <div
        className={`
          p-4 border rounded-lg cursor-pointer transition-all duration-200
          ${isSelected 
            ? activeTab === 'include' 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => handleExerciseToggle(exercise.id, activeTab)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{exercise.name}</h4>
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : 
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'}
              `}>
                {exercise.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{exercise.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{exercise.primaryMuscles.join(', ')}</span>
              </div>
              {exercise.equipment.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>🏋️</span>
                  <span>{exercise.equipment.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="ml-2">
            {isSelected && (
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${activeTab === 'include' ? 'bg-green-500' : 'bg-red-500'}
              `}>
                {activeTab === 'include' ? 
                  <Plus className="w-4 h-4 text-white" /> : 
                  <X className="w-4 h-4 text-white" />
                }
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          Include Exercises ({selectedInclude.length})
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
          Exclude Exercises ({selectedExclude.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={disabled}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 transition-colors
            ${showFilters ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}
          `}
          disabled={disabled}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={() => clearAll(activeTab)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={disabled}
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            disabled={disabled}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {activeTab === 'include' ? 'Select exercises to include' : 'Select exercises to exclude'}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredExercises.length} exercises available
          </span>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No exercises found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>

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
};

export default ExerciseSelectionStep; 