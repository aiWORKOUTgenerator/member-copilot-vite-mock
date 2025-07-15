import React from 'react';
import { OptionGrid } from '../../shared/DRYComponents';
import { UserProfile, AIRecommendationContext, OptionDefinition } from '../../../types';

interface FocusOptionsGridProps<T> {
  options: OptionDefinition<T>[];
  selected: T | T[];
  onSelect: (value: T) => void;
  columns?: { base: number; sm?: number; md?: number; lg?: number };
  size?: 'sm' | 'md' | 'lg';
  userProfile?: UserProfile;
  aiRecommendations?: string[];
  onAIRecommendationApply?: (recommendation: string) => void;
}

export const FocusOptionsGrid = <T,>({
  options,
  selected,
  onSelect,
  columns = { base: 1, sm: 2, md: 3 },
  size = 'lg',
  userProfile,
  aiRecommendations,
  onAIRecommendationApply
}: FocusOptionsGridProps<T>) => {
  return (
    <OptionGrid
      options={options}
      selected={selected}
      onSelect={onSelect}
      columns={columns}
      size={size}
      userProfile={userProfile}
      aiRecommendations={aiRecommendations}
      onAIRecommendationApply={onAIRecommendationApply}
    />
  );
}; 