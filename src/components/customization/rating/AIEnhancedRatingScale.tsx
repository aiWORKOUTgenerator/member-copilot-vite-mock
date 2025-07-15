import React from 'react';
import { RatingScale } from '../../shared/DRYComponents';
import { UserProfile } from '../../../types/user';
import { AIRecommendationContext } from '../../../types/ai';

interface RatingScaleConfig {
  min: number;
  max: number;
  labels: {
    low: string;
    high: string;
    scale: string[];
  };
  size: 'sm' | 'md' | 'lg';
  showLabels: boolean;
  showValue: boolean;
}

interface AIEnhancedRatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  config: RatingScaleConfig;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  onAIInsight?: (insight: any) => void;
}

const AIEnhancedRatingScale: React.FC<AIEnhancedRatingScaleProps> = ({
  value,
  onChange,
  config,
  userProfile,
  aiContext,
  onAIInsight
}) => {
  const generateAIInsights = (currentValue: number) => {
    const insights = [];
    
    if (currentValue <= 2) {
      insights.push({
        type: 'warning',
        message: 'Low energy/sleep may affect workout performance',
        recommendation: 'Consider a shorter or less intense workout'
      });
    }
    
    if (currentValue >= 4 && userProfile?.goals?.includes('performance')) {
      insights.push({
        type: 'opportunity',
        message: 'High energy/sleep - great for challenging workouts',
        recommendation: 'Consider adding advanced exercises or longer duration'
      });
    }
    
    return insights;
  };

  const handleChange = (newValue: number) => {
    onChange(newValue);
    
    if (onAIInsight) {
      const insights = generateAIInsights(newValue);
      insights.forEach(insight => onAIInsight(insight));
    }
  };

  const insights = generateAIInsights(value);

  return (
    <div className="space-y-4">
      <RatingScale
        value={value}
        onChange={handleChange}
        config={config}
        userProfile={userProfile}
        aiContext={aiContext}
      />
      
      {/* AI Insights Display */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                insight.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="font-medium">{insight.message}</div>
              <div className="text-sm mt-1">{insight.recommendation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIEnhancedRatingScale; 