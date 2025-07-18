import React from 'react';
import { Battery } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';
import { RATING_THRESHOLDS } from '../../../types/rating';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';

const DEFAULT_ENERGY_LEVEL = 5;

const generateEnergyInsights = (value: number): AIInsight[] => {
  const { ENERGY } = RATING_THRESHOLDS;
  
  if (value >= ENERGY.HIGH) {
    return [{
      type: 'opportunity',
      message: 'High energy level detected',
      recommendation: 'Great opportunity for an intense, challenging workout'
    }];
  }
  
  if (value >= ENERGY.MODERATE) {
    return [{
      type: 'opportunity',
      message: 'Good energy level',
      recommendation: 'Ready for a moderate to high-intensity workout'
    }];
  }
  
  if (value > ENERGY.CRITICAL_LOW) {
    return [{
      type: 'warning',
      message: 'Moderate energy level',
      recommendation: 'Consider a balanced, moderate-intensity workout'
    }];
  }
  
  // Critical low energy
  return [{
    type: 'critical_warning',
    message: 'Very low energy level detected',
    recommendation: 'Consider resting or limiting to light mobility work today'
  }];
};

export const EnergyLevelSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode,
  _aiContext, // Prefix with _ to indicate intentionally unused
  userProfile
}) => {
  const handleEnergyChange = (value: number) => {
    onInputChange('energyLevel', value);
  };

  const handleAIInsight = (insight: AIInsight) => {
    logger.debug('Energy AI Insight:', insight);
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

  const currentEnergyLevel = typeof focusData.energyLevel === 'number' 
    ? focusData.energyLevel 
    : DEFAULT_ENERGY_LEVEL;

  const renderRatingScale = () => (
    <RatingScaleWrapper
      value={currentEnergyLevel}
      onChange={handleEnergyChange}
      onAIInsight={handleAIInsight}
      config={{
        min: 1,
        max: 10,
        labels: {
          low: 'Low Energy',
          high: 'High Energy',
          scale: viewMode === 'simple' ? [] : [
            'Exhausted',
            'Very Low',
            'Low',
            'Below Average',
            'Moderate',
            'Above Average',
            'Good',
            'Very Good',
            'Excellent',
            'Peak Energy'
          ]
        },
        size: viewMode === 'simple' ? 'sm' : 'md',
        showLabels: viewMode === 'complex',
        showValue: viewMode === 'complex'
      }}
      enableAI={viewMode === 'complex'}
      userProfile={userProfile}
      aiContext={{
        currentSelections: {
          customization_energy: currentEnergyLevel
        },
        userProfile: userProfile ?? {
          fitnessLevel: 'intermediate',
          goals: ['general_fitness'],
          preferences: {
            workoutStyle: ['balanced'],
            intensityPreference: 'moderate'
          }
        },
        generateInsights: generateEnergyInsights
      }}
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