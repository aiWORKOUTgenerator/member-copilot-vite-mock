import React from 'react';
import { OptionGrid } from '../../shared/DRYComponents';

interface WarmupData {
  included: boolean;
  duration: number;
  type?: 'dynamic' | 'static' | 'cardio' | 'mixed';
}

interface WarmupSectionProps {
  warmUpData: WarmupData;
  totalDuration: number;
  coolDownDuration: number;
  onChange: (warmUpData: WarmupData) => void;
}

const WarmupSection: React.FC<WarmupSectionProps> = ({
  warmUpData,
  totalDuration,
  coolDownDuration,
  onChange
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Warm-up Phase</h4>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={warmUpData.included}
            onChange={(e) => onChange({
              ...warmUpData,
              included: e.target.checked
            })}
            className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
          />
          <span className="text-sm font-medium">Include warm-up</span>
        </label>
      </div>
      
      {warmUpData.included && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration: {warmUpData.duration} minutes</label>
            <input
              type="range"
              min="3"
              max="15"
              value={warmUpData.duration}
              onChange={(e) => onChange({
                ...warmUpData,
                duration: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Warm-up Type</label>
            <OptionGrid
              options={[
                { value: 'dynamic', label: 'Dynamic', description: 'Movement-based preparation' },
                { value: 'static', label: 'Static', description: 'Held stretches' },
                { value: 'cardio', label: 'Cardio', description: 'Light cardiovascular work' },
                { value: 'mixed', label: 'Mixed', description: 'Combination approach' }
              ]}
              selected={warmUpData.type || 'dynamic'}
              onSelect={(type) => onChange({
                ...warmUpData,
                type: type as 'dynamic' | 'static' | 'cardio' | 'mixed'
              })}
              columns={{ base: 2, md: 4 }}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarmupSection; 