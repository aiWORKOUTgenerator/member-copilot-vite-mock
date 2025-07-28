import React from 'react';
import { Zap, AlignCenter, Smile, Flame, Heart, Dumbbell, Target, Lightbulb } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { OptionGrid } from '../../shared/DRYComponents';
import { OptionDefinition } from '../../../types/core';
import { useAIService } from '../../../contexts/composition/AIServiceProvider';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';
import { WORKOUT_FOCUS_MUSCLE_GROUPS, WorkoutFocusOption } from '../../../types/workout-focus.types';

const focusOptions: WorkoutFocusOption[] = [
  {
    value: 'Energizing Boost',
    label: 'Energizing Boost',
    description: 'Get an energy boost to power through your day',
    icon: 'Zap',
    category: 'energy',
    difficulty: 'new to exercise',
    equipment: ['Body Weight'],
    duration: 15,
    intensity: 'moderate',
    muscleGroups: ['Full Body'],
    benefits: ['Energy boost', 'Mood improvement', 'Quick workout']
  },
  {
    value: 'Improve Posture',
    label: 'Improve Posture',
    description: 'Relieve desk-related tension and improve alignment',
    icon: 'AlignCenter',
    category: 'posture',
    difficulty: 'new to exercise',
    equipment: ['Yoga Mat'],
    duration: 20,
    intensity: 'low',
    muscleGroups: ['Core', 'Upper Body'],
    benefits: ['Better posture', 'Reduced back pain', 'Improved alignment']
  },
  {
    value: 'Stress Reduction',
    label: 'Stress Reduction',
    description: 'Calm your mind and release tension',
    icon: 'Smile',
    category: 'wellness',
    difficulty: 'new to exercise',
    equipment: ['Yoga Mat'],
    duration: 20,
    intensity: 'low',
    muscleGroups: ['Full Body'],
    benefits: ['Stress relief', 'Mental clarity', 'Relaxation']
  },
  {
    value: 'Quick Sweat',
    label: 'Quick Sweat',
    description: 'High-intensity calorie-burning workout',
    icon: 'Flame',
    category: 'cardio',
    difficulty: 'some experience',
    equipment: ['Body Weight'],
    duration: 15,
    intensity: 'high',
    muscleGroups: ['Full Body'],
    benefits: ['Calorie burn', 'Cardiovascular fitness', 'Quick results']
  },
  {
    value: 'Gentle Recovery & Mobility',
    label: 'Gentle Recovery & Mobility',
    description: 'Gentle stretching and mobility work for recovery',
    icon: 'Heart',
    category: 'recovery',
    difficulty: 'new to exercise',
    equipment: ['Yoga Mat'],
    duration: 15,
    intensity: 'low',
    muscleGroups: ['Full Body'],
    benefits: ['Recovery', 'Flexibility', 'Mobility improvement']
  },
  {
    value: 'Core & Abs Focus',
    label: 'Core & Abs Focus',
    description: 'Target your core muscles for strength and stability',
    icon: 'Dumbbell',
    category: 'strength',
    difficulty: 'some experience',
    equipment: ['Body Weight', 'Dumbbells'],
    duration: 20,
    intensity: 'moderate',
    muscleGroups: ['Core'],
    benefits: ['Core strength', 'Stability', 'Better posture']
  }
];

export const WorkoutFocusSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode,
  _aiContext, // Prefix with _ to indicate intentionally unused
  userProfile
}) => {
  const { serviceStatus } = useAIService();

  // Early return if focusData is null or undefined
  if (!focusData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading focus data...
      </div>
    );
  }

  // Generate AI insights for focus selection
  const generateFocusInsights = (selectedFocus?: string): AIInsight[] => {
    if (serviceStatus !== 'ready' || !userProfile) {
      return [];
    }

    try {
      const insights: AIInsight[] = [];
      const energyLevel = focusData.energyLevel || 5;
      const sorenessLevel = focusData.sorenessLevel || 1;
      const duration = focusData.workoutDuration || 20;

      // Add muscle group insights if a focus is selected
      if (selectedFocus && WORKOUT_FOCUS_MUSCLE_GROUPS[selectedFocus]) {
        const muscleGroups = WORKOUT_FOCUS_MUSCLE_GROUPS[selectedFocus];
        insights.push({
          id: `muscle_focus_${Date.now()}`,
          type: 'muscle_focus',
          title: 'Target Muscle Groups',
          content: muscleGroups.primaryMuscleGroups.map(group => group.name).join(', '),
          priority: 'high',
          category: 'workout_focus'
        });

        insights.push({
          id: `training_emphasis_${Date.now()}`,
          type: 'training_emphasis',
          title: 'Training Emphasis',
          content: muscleGroups.emphasis,
          priority: 'medium',
          category: 'workout_focus'
        });
      }

      return insights;
    } catch (error) {
      logger.error('Error generating focus insights:', error);
      return [];
    }
  };

  const handleSelect = (value: string) => {
    onInputChange('workoutFocus', value);
    
    // Generate insights for the selected focus if AI is enabled
    if (serviceStatus === 'ready' && userProfile) {
      const insights = generateFocusInsights(value);
      insights.forEach(insight => {
        logger.debug('Focus AI Insight:', insight);
      });
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
          <Target className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Workout Goal</h3>
            {focusData.workoutFocus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {focusData.workoutFocus}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Required
            </span>
            {serviceStatus === 'ready' && userProfile && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Lightbulb className="w-3 h-3 mr-1" />
                AI Enhanced
              </span>
            )}
          </div>
          {viewMode === 'complex' && (
            <p className="text-sm text-gray-600 mt-1">
              What's your main goal for today's workout?
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSimpleView = () => (
    <OptionGrid
      options={focusOptions.map(option => ({
        value: option.value,
        label: option.label,
        description: option.description
      }))}
      selected={focusData.workoutFocus}
      onSelect={handleSelect}
      columns={{ base: 2, sm: 3, md: 3 }}
      size="sm"
    />
  );

  const renderComplexView = () => {
    const selectedFocus = focusData.workoutFocus;
    const muscleGroups = selectedFocus ? WORKOUT_FOCUS_MUSCLE_GROUPS[selectedFocus] : null;

    return (
      <>
        <OptionGrid
          options={focusOptions}
          selected={focusData.workoutFocus}
          onSelect={handleSelect}
          columns={{ base: 1, sm: 2, md: 3 }}
          size="lg"
        />

        {/* Muscle Group Details */}
        {selectedFocus && muscleGroups && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Target Muscle Groups</h4>
              <div className="space-y-3">
                {muscleGroups.primaryMuscleGroups.map((group, index) => (
                  <div key={index} className="space-y-1">
                    <h5 className="font-medium text-gray-800">{group.name}</h5>
                    {group.description && (
                      <p className="text-sm text-gray-600">{group.description}</p>
                    )}
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-1">Training Emphasis</h5>
                  <p className="text-sm text-gray-600">{muscleGroups.emphasis}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Panel */}
        {serviceStatus === 'ready' && userProfile && selectedFocus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Difficulty: <span className="font-medium">{focusOptions.find(opt => opt.value === selectedFocus)?.difficulty}</span>
                </span>
                <span>
                  Category: <span className="font-medium">{focusOptions.find(opt => opt.value === selectedFocus)?.category}</span>
                </span>
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">goals</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">focus</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded text-xs">ai-enhanced</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {renderHeader()}
      {viewMode === 'simple' ? renderSimpleView() : renderComplexView()}
    </div>
  );
}; 