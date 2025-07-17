import React from 'react';
import { Battery } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';

export const EnergyLevelSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange
}) => {
  const handleEnergyChange = (value: number) => {
    onInputChange('energyLevel', value);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
            <Battery className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-gray-900">Energy Level</h3>
              {typeof focusData.energyLevel === 'number' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Level {focusData.energyLevel}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Required
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              How's your energy level right now?
            </p>
          </div>
        </div>
      </div>
      
      <RatingScaleWrapper
        value={typeof focusData.energyLevel === 'number' ? focusData.energyLevel : 3}
        onChange={handleEnergyChange}
        config={{
          min: 1,
          max: 5,
          labels: {
            low: 'Low Energy',
            high: 'High Energy',
            scale: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
          },
          size: 'md',
          showLabels: true,
          showValue: true
        }}
        enableAI={true}
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
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">energy</span>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">readiness</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 