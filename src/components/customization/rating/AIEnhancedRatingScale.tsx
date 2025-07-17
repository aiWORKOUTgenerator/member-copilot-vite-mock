import React from 'react';
import { RatingScale } from '../../shared/DRYComponents';
import { UserProfile } from '../../../types/user';
import { AIRecommendationContext } from '../../../types/ai';
import { RatingConfig } from '../../../types/rating';
import { AIInsight } from '../../../types/insights';

interface AIEnhancedRatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  config: RatingConfig;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  onAIInsight?: (insight: AIInsight) => void;
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
    if (!aiContext?.generateInsights) {
      return [];
    }
    return aiContext.generateInsights(currentValue);
  };

  const handleChange = (newValue: number) => {
    onChange(newValue);
    
    if (onAIInsight) {
      const insights = generateAIInsights(newValue);
      insights.forEach(insight => onAIInsight(insight));
    }
  };

  const insights = generateAIInsights(value);

  const getInsightStyles = (type: AIInsight['type']) => {
    switch (type) {
      case 'critical_warning':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'opportunity':
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      <RatingScale
        value={value}
        onChange={handleChange}
        config={config}
        userProfile={userProfile}
        aiContext={aiContext}
      />
      
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getInsightStyles(insight.type)}`}
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