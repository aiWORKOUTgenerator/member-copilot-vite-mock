import React from 'react';
import { Clock } from 'lucide-react';
import { OptionGrid } from '../../shared/DRYComponents';
import { SectionProps } from '../types/quick-workout.types';

const durationOptions = [
  { value: 5, label: '5 min', sublabel: 'Quick Break', description: 'Perfect for desk breaks' },
  { value: 10, label: '10 min', sublabel: 'Mini Session', description: 'Short but effective' },
  { value: 15, label: '15 min', sublabel: 'Express', description: 'Efficient workout' },
  { value: 20, label: '20 min', sublabel: 'Focused', description: 'Balanced duration' },
  { value: 30, label: '30 min', sublabel: 'Complete', description: 'Full workout experience' },
  { value: 45, label: '45 min', sublabel: 'Extended', description: 'Maximum benefit' }
];

export const WorkoutDurationSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode
}) => {
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
          <Clock className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Workout Duration</h3>
            {focusData.workoutDuration && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {focusData.workoutDuration} min
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Required
            </span>
          </div>
          {viewMode === 'complex' && (
            <p className="text-sm text-gray-600 mt-1">
              Choose how long you want to exercise for optimal results
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSimpleView = () => (
    <OptionGrid
      options={durationOptions.map(option => ({
        value: option.value,
        label: option.label
      }))}
      selected={focusData.workoutDuration}
      onSelect={(duration) => onInputChange('workoutDuration', duration)}
      columns={{ base: 2, sm: 3, md: 3 }}
      size="sm"
    />
  );

  const renderComplexView = () => (
    <>
      <OptionGrid
        options={durationOptions}
        selected={focusData.workoutDuration}
        onSelect={(duration) => onInputChange('workoutDuration', duration)}
        columns={{ base: 2, sm: 3, md: 3 }}
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
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">time-management</span>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">planning</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {renderHeader()}
      {viewMode === 'simple' ? renderSimpleView() : renderComplexView()}
    </div>
  );
}; 