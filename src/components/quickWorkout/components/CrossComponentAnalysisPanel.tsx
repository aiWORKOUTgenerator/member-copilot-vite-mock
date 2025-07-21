import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useAI } from '../../../contexts/AIContext';
import { UserProfile } from '../../../types';
import { logger } from '../../../utils/logger';

interface CrossComponentAnalysisPanelProps {
  focusData: any;
  userProfile: UserProfile;
  viewMode: 'simple' | 'complex';
}

interface CrossComponentInsight {
  id: string;
  type: 'conflict' | 'optimization' | 'alignment' | 'suggestion';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  components: string[];
  recommendation?: string;
  confidence: number;
}

export const CrossComponentAnalysisPanel: React.FC<CrossComponentAnalysisPanelProps> = ({
  focusData,
  userProfile,
  viewMode
}) => {
  const { isFeatureEnabled, serviceStatus } = useAI();
  const [insights, setInsights] = useState<CrossComponentInsight[]>([]);

  // Early return if focusData is null or undefined
  if (!focusData) {
    return null;
  }

  // Generate cross-component insights
  const generateCrossComponentInsights = (): CrossComponentInsight[] => {
    if (serviceStatus !== 'ready') return [];

    const insights: CrossComponentInsight[] = [];
    const energyLevel = focusData?.energyLevel || 5;
    const sorenessLevel = focusData?.sorenessLevel || 1;
    const duration = focusData?.workoutDuration || 20;
    const focus = focusData?.workoutFocus;

    try {
      // Energy vs Duration vs Focus conflicts
      if (energyLevel <= 3 && duration > 20 && (focus === 'Quick Sweat' || focus === 'Core & Abs Focus')) {
        insights.push({
          id: 'energy_duration_focus_conflict',
          type: 'conflict',
          severity: 'high',
          title: 'Multiple Factor Conflict',
          message: 'Low energy, long duration, and high-intensity focus may lead to poor performance',
          components: ['energyLevel', 'workoutDuration', 'workoutFocus'],
          recommendation: 'Consider shorter duration (10-15 min) or switch to recovery focus',
          confidence: 0.9
        });
      }

      // Soreness vs Focus alignment
      if (sorenessLevel >= 6 && focus === 'Gentle Recovery & Mobility') {
        insights.push({
          id: 'soreness_focus_perfect_alignment',
          type: 'alignment',
          severity: 'low',
          title: 'Perfect Recovery Alignment',
          message: 'Your high soreness level perfectly matches the recovery focus - excellent choice!',
          components: ['sorenessLevel', 'workoutFocus'],
          confidence: 0.95
        });
      }

      // Optimal combinations
      if (energyLevel >= 7 && duration >= 20 && focus === 'Quick Sweat') {
        insights.push({
          id: 'high_energy_optimal_combo',
          type: 'alignment',
          severity: 'low',
          title: 'High-Energy Optimal Combination',
          message: 'Your high energy, adequate duration, and intense focus create an ideal workout setup',
          components: ['energyLevel', 'workoutDuration', 'workoutFocus'],
          confidence: 0.85
        });
      }

              // Beginner optimization suggestions
        if (userProfile?.fitnessLevel === 'beginner' && duration <= 15 && focus === 'Energizing Boost') {
        insights.push({
          id: 'beginner_optimal_setup',
          type: 'optimization',
          severity: 'low',
          title: 'Beginner-Friendly Setup',
          message: 'This combination is perfect for building fitness habits as a beginner',
          components: ['workoutDuration', 'workoutFocus'],
          confidence: 0.8
        });
      }

      // Duration optimization based on focus
      if (focus === 'Core & Abs Focus' && duration >= 30) {
        insights.push({
          id: 'core_duration_optimization',
          type: 'suggestion',
          severity: 'medium',
          title: 'Duration Optimization Available',
          message: 'Core workouts are highly effective in 15-20 minutes',
          components: ['workoutDuration', 'workoutFocus'],
          recommendation: 'Consider reducing to 15-20 minutes for optimal core training',
          confidence: 0.7
        });
      }

      // Energy conservation strategy
      if (energyLevel <= 4 && sorenessLevel >= 4 && duration > 15) {
        insights.push({
          id: 'energy_conservation_strategy',
          type: 'suggestion',
          severity: 'medium',
          title: 'Energy Conservation Recommended',
          message: 'Both low energy and soreness suggest focusing on gentle movement',
          components: ['energyLevel', 'sorenessLevel', 'workoutDuration'],
          recommendation: 'Try 10-15 minutes of gentle recovery or stress reduction',
          confidence: 0.85
        });
      }

      // Time-efficient high-energy suggestion
      if (energyLevel >= 8 && duration <= 10) {
        insights.push({
          id: 'high_energy_time_efficient',
          type: 'optimization',
          severity: 'low',
          title: 'High-Intensity Opportunity',
          message: 'Your high energy can support intense short workouts for maximum efficiency',
          components: ['energyLevel', 'workoutDuration'],
          recommendation: 'Consider Quick Sweat or Core focus for time-efficient intensity',
          confidence: 0.75
        });
      }

      return insights;
    } catch (error) {
      logger.error('Failed to generate cross-component insights:', error);
      return [];
    }
  };

  // Update insights when selections change
  useEffect(() => {
    if (isFeatureEnabled('ai_cross_component_analysis') && viewMode === 'complex') {
      const newInsights = generateCrossComponentInsights();
      setInsights(newInsights);
    } else {
      setInsights([]);
    }
  }, [focusData, isFeatureEnabled, viewMode, serviceStatus]);

  // Don't render if no insights or feature not enabled
  if (!isFeatureEnabled('ai_cross_component_analysis') || viewMode !== 'complex' || insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: CrossComponentInsight['type']) => {
    switch (type) {
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'alignment':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'optimization':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: CrossComponentInsight['type'], severity: CrossComponentInsight['severity']) => {
    if (type === 'conflict' && severity === 'high') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (type === 'conflict') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    if (type === 'alignment') {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    if (type === 'optimization') {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    return 'bg-purple-50 border-purple-200 text-purple-800';
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">AI Cross-Component Analysis</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map(insight => (
          <div
            key={insight.id}
            className={`p-3 rounded-lg border ${getInsightColor(insight.type, insight.severity)}`}
          >
            <div className="flex items-start gap-2">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <span className="text-xs opacity-70">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm opacity-90">{insight.message}</p>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
                <div className="mt-2 flex gap-1">
                  {insight.components.map(component => (
                    <span
                      key={component}
                      className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded"
                    >
                      {component.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-indigo-200 text-xs text-indigo-600">
        <div className="flex items-center justify-between">
          <span>AI analyzes your selections for optimal workout combinations</span>
          <span className="bg-indigo-100 px-2 py-1 rounded">Enhanced AI</span>
        </div>
      </div>
    </div>
  );
}; 