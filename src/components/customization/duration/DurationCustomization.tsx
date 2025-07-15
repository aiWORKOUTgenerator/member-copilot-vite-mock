import React from 'react';
import { Clock } from 'lucide-react';
import { OptionGrid } from '../../shared/DRYComponents';
import { CustomizationComponentProps } from '../../../types/config';
import { DurationConfigurationData } from '../../../types/duration';
import SimpleDurationSelection from './SimpleDurationSelection';
import WarmupSection from './WarmupSection';
import CooldownSection from './CooldownSection';
import WorkingTimeDisplay from './WorkingTimeDisplay';

const DurationCustomization: React.FC<CustomizationComponentProps<number | DurationConfigurationData>> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  const isComplex = typeof value === 'object';
  
  if (isComplex) {
    const durationData = value as DurationConfigurationData;
    
    return (
      <div className="space-y-6">
        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Total Duration</label>
          <OptionGrid
            options={[
              { value: 15, label: '15 min', sublabel: 'Quick session', description: 'Perfect for busy schedules' },
              { value: 30, label: '30 min', sublabel: 'Standard workout', description: 'Most popular duration' },
              { value: 45, label: '45 min', sublabel: 'Extended session', description: 'Comprehensive training' },
              { value: 60, label: '60 min', sublabel: 'Full training', description: 'Maximum results' },
              { value: 90, label: '90 min', sublabel: 'Elite session', description: 'Advanced athletes only' }
            ]}
            selected={durationData.totalDuration}
            onSelect={(duration) => onChange({
              ...durationData,
              totalDuration: duration,
              workingTime: duration - 
                (durationData.warmUp.included ? durationData.warmUp.duration : 0) - 
                (durationData.coolDown.included ? durationData.coolDown.duration : 0)
            })}
            columns={{ base: 2, md: 3, lg: 5 }}
            userProfile={userProfile}
            aiRecommendations={aiContext?.recommendations || []}
            onAIRecommendationApply={onAIRecommendationApply}
          />
        </div>
        
        {/* Warm-up Configuration */}
        <WarmupSection
          warmUpData={durationData.warmUp}
          totalDuration={durationData.totalDuration}
          coolDownDuration={durationData.coolDown.included ? durationData.coolDown.duration : 0}
          onChange={(warmUpData) => onChange({
            ...durationData,
            warmUp: warmUpData,
            workingTime: durationData.totalDuration - 
              (warmUpData.included ? warmUpData.duration : 0) - 
              (durationData.coolDown.included ? durationData.coolDown.duration : 0)
          })}
        />
        
        {/* Cool-down Configuration */}
        <CooldownSection
          coolDownData={durationData.coolDown}
          totalDuration={durationData.totalDuration}
          warmUpDuration={durationData.warmUp.included ? durationData.warmUp.duration : 0}
          onChange={(coolDownData) => onChange({
            ...durationData,
            coolDown: coolDownData,
            workingTime: durationData.totalDuration - 
              (durationData.warmUp.included ? durationData.warmUp.duration : 0) - 
              (coolDownData.included ? coolDownData.duration : 0)
          })}
        />
        
        {/* Working Time Display */}
        <WorkingTimeDisplay workingTime={durationData.workingTime} />
      </div>
    );
  }
  
  // Simple duration selection
  return (
    <SimpleDurationSelection
      value={value as number}
      onChange={onChange}
      userProfile={userProfile}
      aiContext={aiContext}
      onAIRecommendationApply={onAIRecommendationApply}
    />
  );
};

export default DurationCustomization; 