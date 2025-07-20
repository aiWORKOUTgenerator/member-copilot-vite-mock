import React from 'react';
import { Battery } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';
import { useAI } from '../../../contexts/AIContext';

// Removed unused constant

export const EnergyLevelSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode,
  _aiContext, // Prefix with _ to indicate intentionally unused
  userProfile
}) => {
  const { getEnergyInsights, serviceStatus } = useAI();

  const handleEnergyChange = (value: number) => {
    onInputChange('energyLevel', value);
  };

  const handleAIInsight = (insight: AIInsight) => {
    logger.debug('Energy AI Insight:', insight);
  };

  // Generate AI insights using the new service
  const generateEnergyInsights = (value: number): AIInsight[] => {
    if (serviceStatus !== 'ready') {
      // Fallback to basic insights if service isn't ready
      return [{
        id: `energy_fallback_${Date.now()}`,
        type: 'optimization',
        title: 'Energy Level',
        content: `Current energy level: ${value}/10`,
        priority: 'low',
        category: 'performance',
        metadata: {
          recommendation: 'Service initializing - please wait'
        }
      }];
    }

    try {
      // Use the AIContext method instead of calling aiService directly
      const insights = getEnergyInsights(value);
      return insights;
    } catch (error) {
      logger.error('Failed to generate energy insights:', error);
      return [{
        id: `energy_error_${Date.now()}`,
        type: 'warning',
        title: 'Service Error',
        content: 'Unable to generate energy insights at this time',
        priority: 'medium',
        category: 'performance',
        metadata: {
          recommendation: 'Try refreshing the page or contact support'
        }
      }];
    }
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
            {typeof focusData.energyLevel === 'number' && focusData.energyLevel > 0 && (
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
    : 0; // Show 0 initially, not DEFAULT_ENERGY_LEVEL

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
          fitnessLevel: 'intermediate' as const,
          goals: ['general_fitness'],
          preferences: {
            workoutStyle: ['balanced'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'moderate'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['Body Weight'],
            availableLocations: ['Home']
          },
          enhancedLimitations: {
            timeConstraints: 0,
            equipmentConstraints: [],
            locationConstraints: [],
            recoveryNeeds: {
              restDays: 2,
              sleepHours: 7,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'moderate'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 0,
            averageDuration: 45,
            preferredFocusAreas: [],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.7,
            consistencyScore: 0.5,
            plateauRisk: 'low'
          },
          learningProfile: {
            prefersSimplicity: true,
            explorationTendency: 'moderate',
            feedbackPreference: 'simple',
            learningStyle: 'visual',
            motivationType: 'intrinsic',
            adaptationSpeed: 'moderate'
          }
        },
        generateInsights: generateEnergyInsights
      }}
    />
  );

  const renderComplexView = () => (
    <>
      {renderRatingScale()}
      
      {/* Warning Message Box */}
      {currentEnergyLevel <= 3 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800">Low energy level detected</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Consider a lighter workout or focus on mobility and recovery
          </p>
        </div>
      )}
      
      {/* Metadata Footer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Difficulty: <span className="font-medium">New to Exercise</span>
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