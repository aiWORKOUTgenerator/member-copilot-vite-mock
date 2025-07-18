import React from 'react';
import { Activity } from 'lucide-react';
import { SectionProps } from '../types/quick-workout.types';
import { RatingScaleWrapper } from '../../customization/rating';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';
import { useAI } from '../../../contexts/AIContext';

const DEFAULT_SORENESS_LEVEL = 1;

export const MuscleSorenessSection: React.FC<SectionProps> = ({
  focusData,
  onInputChange,
  viewMode,
  _aiContext, // Prefix with _ to indicate intentionally unused
  userProfile
}) => {
  const { aiService, serviceStatus } = useAI();

  const handleSorenessChange = (value: number) => {
    onInputChange('sorenessLevel', value);
  };

  const handleAIInsight = (insight: AIInsight) => {
    logger.debug('Soreness AI Insight:', insight);
  };

  // Generate AI insights using the new service
  const generateSorenessInsights = (value: number): AIInsight[] => {
    if (serviceStatus !== 'ready') {
      // Fallback to basic insights if service isn't ready
      return [{
        type: 'optimization',
        title: 'Soreness Level',
        content: `Current soreness level: ${value}/10`,
        priority: 'low',
        category: 'recovery',
        metadata: {
          recommendation: 'Service initializing - please wait'
        }
      }];
    }

    try {
      // Use the new AI service
      // Note: The service expects an array of sore areas, but we're working with a numeric rating
      // For now, we'll convert the numeric rating to a simple array format
      const sorenessAreas = value > 3 ? ['General'] : [];
      const insights = aiService.getSorenessInsights(sorenessAreas);
      return insights;
    } catch (error) {
      logger.error('Failed to generate soreness insights:', error);
      return [{
        type: 'warning',
        title: 'Service Error',
        content: 'Unable to generate soreness insights at this time',
        priority: 'medium',
        category: 'recovery',
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
          <Activity className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Muscle Soreness</h3>
            {typeof focusData.sorenessLevel === 'number' && focusData.sorenessLevel > 0 && (
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
    : 0; // Show 0 initially, not DEFAULT_SORENESS_LEVEL

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
                severity: currentSorenessLevel >= 8 ? 'severe' : 
                         currentSorenessLevel >= 6 ? 'moderate' :
                         'mild',
                affectedActivities: ['strength_training', 'cardio', 'flexibility']
              }
            }
          }
        },
        userProfile: userProfile ?? {
          fitnessLevel: 'some experience',
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
        generateInsights: generateSorenessInsights
      }}
    />
  );

  const renderComplexView = () => (
    <>
      {renderRatingScale()}
      
      {/* Warning Message Box */}
      {currentSorenessLevel >= 8 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800">High muscle soreness detected</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Consider a recovery day or very light mobility work
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