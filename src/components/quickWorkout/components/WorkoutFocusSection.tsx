import React from 'react';
import { Zap, AlignCenter, Smile, Flame, Heart, Dumbbell, Target } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { OptionGrid } from '../../shared/DRYComponents';
import { OptionDefinition } from '../../../types/enhanced-workout-types';

const focusOptions: OptionDefinition<string>[] = [
  {
    value: 'Energizing Boost',
    label: 'Energizing Boost',
    description: 'Get an energy boost to power through your day',
    metadata: {
      icon: Zap,
      difficulty: 'beginner',
      category: 'energy',
      badge: 'Quick'
    }
  },
  {
    value: 'Improve Posture',
    label: 'Improve Posture',
    description: 'Relieve desk-related tension and improve alignment',
    metadata: {
      icon: AlignCenter,
      difficulty: 'beginner',
      category: 'posture',
      badge: 'Office'
    }
  },
  {
    value: 'Stress Reduction',
    label: 'Stress Reduction',
    description: 'Calm your mind and release tension',
    metadata: {
      icon: Smile,
      difficulty: 'beginner',
      category: 'wellness',
      badge: 'Wellness'
    }
  },
  {
    value: 'Quick Sweat',
    label: 'Quick Sweat',
    description: 'High-intensity calorie-burning workout',
    metadata: {
      icon: Flame,
      difficulty: 'intermediate',
      category: 'cardio',
      badge: 'Intense'
    }
  },
  {
    value: 'Gentle Recovery & Mobility',
    label: 'Gentle Recovery & Mobility',
    description: 'Improve flexibility and aid recovery',
    metadata: {
      icon: Heart,
      difficulty: 'beginner',
      category: 'recovery',
      badge: 'Gentle'
    }
  },
  {
    value: 'Core & Abs Focus',
    label: 'Core & Abs Focus',
    description: 'Strengthen your core and sculpt your abs',
    metadata: {
      icon: Dumbbell,
      difficulty: 'intermediate',
      category: 'strength',
      badge: 'Targeted'
    }
  }
];

export const WorkoutFocusSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange
}) => {
  const handleSelect = (value: string) => {
    onInputChange('workoutFocus', value);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
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
            </div>
            <p className="text-sm text-gray-600 mt-1">
              What's your main goal for today's workout?
            </p>
          </div>
        </div>
      </div>
      
      <OptionGrid
        options={focusOptions}
        selected={focusData.workoutFocus}
        onSelect={handleSelect}
        columns={{ base: 1, sm: 2, md: 3 }}
        size="lg"
      />

      {/* Metadata Footer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Difficulty: <span className="font-medium">Beginner</span>
            </span>
            <span>
              Time: <span className="font-medium">1 min</span>
            </span>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">goals</span>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">focus</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 