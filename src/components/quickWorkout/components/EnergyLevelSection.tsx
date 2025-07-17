import React from 'react';
import { Battery } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';

const DEFAULT_ENERGY_LEVEL = 3; // Moderate energy level

export const EnergyLevelSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode
}) => {
  const handleEnergyChange = (value: number) => {
    onInputChange('energyLevel', value);
  };

  const renderHeader = () => (
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
          {viewMode === 'complex' && (
            <p className="text-sm text-gray-600 mt-1">
              How's your energy level right now?
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderRatingScale = () => (
    <RatingScaleWrapper
      value={typeof focusData.energyLevel === 'number' ? focusData.energyLevel : DEFAULT_ENERGY_LEVEL}
      onChange={handleEnergyChange}
      config={{
        min: 1,
        max: 5,
        labels: {
          low: 'Low Energy',
          high: 'High Energy',
          scale: viewMode === 'simple' ? [] : ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
        },
        size: viewMode === 'simple' ? 'sm' : 'md',
        showLabels: viewMode === 'complex',
        showValue: viewMode === 'complex'
      }}
      enableAI={viewMode === 'complex'}
    />
  );

  const renderComplexView = () => (
    <>
      {renderRatingScale()}
      
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
    </>
  );

  return (
    <div className="space-y-4">
      {renderHeader()}
      {viewMode === 'simple' ? renderRatingScale() : renderComplexView()}
    </div>
  );
}; 