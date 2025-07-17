import React from 'react';
import { Activity } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';
import { RATING_THRESHOLDS } from '../../../types/rating';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';

const DEFAULT_SORENESS_LEVEL = 1;

const generateSorenessInsights = (value: number): AIInsight[] => {
  const { SORENESS } = RATING_THRESHOLDS;
  
  if (value >= SORENESS.CRITICAL_HIGH) {
    return [{
      type: 'critical_warning',
      message: 'High muscle soreness detected',
      recommendation: 'Consider a recovery day or very light mobility work'
    }];
  }
  
  if (value >= SORENESS.HIGH) {
    return [{
      type: 'warning',
      message: 'Moderate-high muscle soreness',
      recommendation: 'Focus on light exercises and avoid working sore muscle groups'
    }];
  }
  
  if (value >= SORENESS.MODERATE) {
    return [{
      type: 'warning',
      message: 'Moderate muscle soreness',
      recommendation: 'Light to moderate intensity workout recommended'
    }];
  }
  
  // Low soreness (value <= SORENESS.LOW)
  return [{
    type: 'opportunity',
    message: 'Low muscle soreness - muscles are fresh',
    recommendation: 'Great opportunity for a challenging workout'
  }];
};

export const MuscleSorenessSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode,
  _aiContext, // Prefix with _ to indicate intentionally unused
  userProfile
}) => {
  const handleSorenessChange = (value: number) => {
    onInputChange('sorenessLevel', value);
  };

  const handleAIInsight = (insight: AIInsight) => {
    logger.debug('Soreness AI Insight:', insight);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
          <Activity className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Muscle Soreness</h3>
            {typeof focusData.sorenessLevel === 'number' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Level {focusData.sorenessLevel}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Required
            </span>
          </div>
          {viewMode === 'complex' && (
            <p className="text-sm text-gray-600 mt-1">
              How sore or fatigued are your muscles today?
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const currentSorenessLevel = typeof focusData.sorenessLevel === 'number' 
    ? focusData.sorenessLevel 
    : DEFAULT_SORENESS_LEVEL;

  const renderRatingScale = () => (
    <RatingScaleWrapper
      value={currentSorenessLevel}
      onChange={handleSorenessChange}
      onAIInsight={handleAIInsight}
      config={{
        min: 1,
        max: 10,
        labels: {
          low: 'No Soreness',
          high: 'Very Sore',
          scale: viewMode === 'simple' ? [] : [
            'None',
            'Very Mild',
            'Mild',
            'Mild-Moderate',
            'Moderate',
            'Moderate-High',
            'High',
            'Very High',
            'Severe',
            'Extreme'
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
          customization_soreness: {
            general: {
              selected: true,
              rating: currentSorenessLevel,
              label: 'General Muscle Soreness',
              description: 'Overall body muscle soreness level',
              metadata: {
                severity: currentSorenessLevel >= RATING_THRESHOLDS.SORENESS.CRITICAL_HIGH ? 'severe' : 
                         currentSorenessLevel >= RATING_THRESHOLDS.SORENESS.HIGH ? 'moderate' :
                         'mild',
                affectedActivities: ['strength_training', 'cardio', 'flexibility']
              }
            }
          }
        },
        userProfile: userProfile ?? {
          fitnessLevel: 'intermediate',
          goals: ['general_fitness'],
          preferences: {
            workoutStyle: ['balanced'],
            intensityPreference: 'moderate'
          }
        },
        generateInsights: generateSorenessInsights
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
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">recovery</span>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">fatigue</span>
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