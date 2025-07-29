import React from 'react';
import { Clock, Lightbulb } from 'lucide-react';
import { OptionGrid } from '../../shared/DRYComponents';
import { SectionProps } from '../types/quick-workout.types';
import { useAIService } from '../../../contexts/composition/AIServiceProvider';
import { useAIFeatureFlags } from '../../../contexts/composition/AIFeatureFlagsProvider';
import { AIInsight } from '../../../types/insights';
import { logger } from '../../../utils/logger';
import { aiLogger } from '../../../services/ai/logging/AILogger';

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
  viewMode,
  userProfile
}) => {
  const { aiService, serviceStatus } = useAIService();
  const { isFeatureEnabled } = useAIFeatureFlags();

  // Early return if focusData is null or undefined
  if (!focusData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading duration data...
      </div>
    );
  }

  // Generate AI insights for duration selection
  const generateDurationInsights = (selectedDuration?: number): AIInsight[] => {
    if (serviceStatus !== 'ready' || !userProfile) {
      return [];
    }

    try {
      const insights: AIInsight[] = [];
      const energyLevel = focusData?.energyLevel || 5;
      const sorenessLevel = focusData?.sorenessLevel || 1;
      
      // Energy-based duration recommendations
      if (energyLevel <= 3 && selectedDuration && selectedDuration > 20) {
        insights.push({
          id: `energy_duration_warning_${Date.now()}`,
          type: 'warning',
          title: 'Energy Level Warning',
          content: 'Consider a shorter workout when energy is low',
          priority: 'high',
          category: 'performance',
          relatedFields: ['workoutDuration', 'energyLevel'],
          metadata: {
            recommendedDuration: energyLevel <= 2 ? 10 : 15,
            reasoning: 'Low energy levels may lead to poor form and increased fatigue'
          }
        });
      }

      // Soreness-based duration recommendations
      if (sorenessLevel >= 6 && selectedDuration && selectedDuration > 15) {
        insights.push({
          id: `soreness_duration_warning_${Date.now()}`,
          type: 'warning',
          title: 'Soreness Warning',
          content: 'Shorter, gentler workouts recommended with high soreness',
          priority: 'high',
          category: 'recovery',
          relatedFields: ['workoutDuration', 'sorenessLevel'],
          metadata: {
            recommendedDuration: 10,
            reasoning: 'High soreness indicates need for recovery and gentle movement'
          }
        });
      }

      // Positive reinforcement for good choices
      if (energyLevel >= 7 && selectedDuration && selectedDuration >= 20) {
        insights.push({
          id: `energy_duration_encouragement_${Date.now()}`,
          type: 'encouragement',
          title: 'Good Duration Choice',
          content: 'Great choice! Your high energy supports a longer workout',
          priority: 'medium',
          category: 'performance',
          relatedFields: ['workoutDuration', 'energyLevel'],
          metadata: {
            reasoning: 'High energy levels support sustained physical activity'
          }
        });
      }

      // Beginner-specific guidance
      if (userProfile.fitnessLevel === 'beginner' && selectedDuration && selectedDuration > 20) {
        insights.push({
          id: `beginner_duration_education_${Date.now()}`,
          type: 'education',
          title: 'New to Exercise Guidance',
          content: 'As a beginner, shorter workouts help build consistency',
          priority: 'medium',
          category: 'performance',
          relatedFields: ['workoutDuration'],
          metadata: {
            recommendedDuration: 15,
            reasoning: 'Building habit and avoiding burnout is crucial for beginners'
          }
        });
      }

      return insights;
    } catch (error) {
      logger.error('Failed to generate duration insights:', error);
      return [];
    }
  };

  const handleDurationSelect = (duration: number) => {
    onInputChange('workoutDuration', duration);
    
    // Generate insights for the selected duration if AI is enabled
    if (isFeatureEnabled('ai_service_unified') && viewMode === 'complex') {
      const insights = generateDurationInsights(duration);
      insights.forEach(insight => {
        aiLogger.debug('Duration AI Insight:', { insight });
      });
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
          <Clock className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Workout Duration</h3>
            {focusData.workoutDuration && focusData.workoutDuration > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {focusData.workoutDuration} min
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Required
            </span>
            {isFeatureEnabled('ai_service_unified') && viewMode === 'complex' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Lightbulb className="w-3 h-3 mr-1" />
                AI Enhanced
              </span>
            )}
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
      onSelect={handleDurationSelect}
      columns={{ base: 2, sm: 3, md: 3 }}
      size="sm"
    />
  );

  const renderComplexView = () => {
    const currentInsights = isFeatureEnabled('ai_service_unified') && focusData.workoutDuration 
      ? generateDurationInsights(focusData.workoutDuration)
      : [];

    return (
      <>
        <OptionGrid
          options={durationOptions}
          selected={focusData.workoutDuration}
          onSelect={handleDurationSelect}
          columns={{ base: 2, sm: 3, md: 3 }}
          size="lg"
        />

        {/* AI Insights Panel */}
        {currentInsights.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI Recommendations</span>
            </div>
            <div className="space-y-2">
              {currentInsights.map((insight, index) => (
                <div key={index} className={`text-sm p-2 rounded ${
                  insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  insight.type === 'encouragement' ? 'bg-green-100 text-green-800 border border-green-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <div className="font-medium">{insight.title}</div>
                  <div>{insight.content}</div>
                  {insight.metadata?.recommendedDuration && (
                    <div className="mt-1 text-xs opacity-75">
                      Recommended: {insight.metadata.recommendedDuration} minutes
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">time-management</span>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">planning</span>
              {isFeatureEnabled('ai_service_unified') && (
                <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded text-xs">ai-enhanced</span>
              )}
            </div>
          </div>
        </div>
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