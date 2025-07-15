import React from 'react';
import { RatingScale } from '../../shared/DRYComponents';
import { CustomizationComponentProps } from '../../../types/config';
import AIEnhancedRatingScale from './AIEnhancedRatingScale';

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

interface RatingScaleWrapperProps extends CustomizationComponentProps<number> {
  config: RatingScaleConfig;
  enableAI?: boolean;
  onAIInsight?: (insight: any) => void;
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