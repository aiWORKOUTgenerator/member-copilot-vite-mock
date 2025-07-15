import React from 'react';
import { OptionGrid } from '../../shared/DRYComponents';
import { CustomizationComponentProps } from '../../../types/config';

interface SimpleDurationSelectionProps extends CustomizationComponentProps<number> {
  // Additional props specific to simple duration selection
}

const SimpleDurationSelection: React.FC<SimpleDurationSelectionProps> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Workout Duration</label>
      <OptionGrid
        options={[
          { value: 15, label: '15 min', sublabel: 'Quick', description: 'Perfect for busy days' },
          { value: 30, label: '30 min', sublabel: 'Standard', description: 'Most popular choice' },
          { value: 45, label: '45 min', sublabel: 'Extended', description: 'Comprehensive workout' },
          { value: 60, label: '60 min', sublabel: 'Full', description: 'Maximum results' }
        ]}
        selected={value}
        onSelect={onChange}
        columns={{ base: 2, md: 4 }}
        userProfile={userProfile}
        aiRecommendations={aiContext?.recommendations || []}
        onAIRecommendationApply={onAIRecommendationApply}
      />
    </div>
  );
};

export default SimpleDurationSelection; 