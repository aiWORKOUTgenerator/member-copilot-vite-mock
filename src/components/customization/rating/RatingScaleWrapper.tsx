import React from 'react';
import { RatingScale } from '../../shared/DRYComponents';
import { CustomizationComponentProps } from '../../../types/core';
import AIEnhancedRatingScale from './AIEnhancedRatingScale';

export interface RatingScaleConfig {
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

export interface AIInsight {
  type: 'warning' | 'opportunity';
  message: string;
  recommendation: string;
}

export interface RatingScaleWrapperProps extends CustomizationComponentProps<number> {
  config: RatingScaleConfig;
  enableAI?: boolean;
  onAIInsight?: (insight: AIInsight) => void;
}

const RatingScaleWrapper: React.FC<RatingScaleWrapperProps> = ({
  value,
  onChange,
  config,
  userProfile,
  aiContext,
  enableAI = false,
  onAIInsight
}) => {
  if (enableAI) {
    return (
      <AIEnhancedRatingScale
        value={value}
        onChange={onChange}
        config={config}
        userProfile={userProfile}
        aiContext={aiContext}
        onAIInsight={onAIInsight}
      />
    );
  }

  return (
    <RatingScale
      value={value}
      onChange={onChange}
      config={config}
      userProfile={userProfile}
      aiContext={aiContext}
    />
  );
};

export default RatingScaleWrapper; 