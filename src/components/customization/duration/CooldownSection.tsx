import React from 'react';
import { OptionGrid } from '../../shared/DRYComponents';

interface CooldownData {
  included: boolean;
  duration: number;
  type?: 'static_stretch' | 'walking' | 'breathing' | 'mixed';
}

interface CooldownSectionProps {
  coolDownData: CooldownData;
  totalDuration: number;
  warmUpDuration: number;
  onChange: (coolDownData: CooldownData) => void;
}

const CooldownSection: React.FC<CooldownSectionProps> = ({
  coolDownData,
  totalDuration,
  warmUpDuration,
  onChange
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Cool-down Phase</h4>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={coolDownData.included}
            onChange={(e) => onChange({
              ...coolDownData,
              included: e.target.checked
            })}
            className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300"
          />
          <span className="text-sm font-medium">Include cool-down</span>
        </label>
      </div>
      
      {coolDownData.included && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration: {coolDownData.duration} minutes</label>
            <input
              type="range"
              min="3"
              max="15"
              value={coolDownData.duration}
              onChange={(e) => onChange({
                ...coolDownData,
                duration: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cool-down Type</label>
            <OptionGrid
              options={[
                { value: 'static_stretch', label: 'Static Stretch', description: 'Held stretches for flexibility' },
                { value: 'walking', label: 'Walking', description: 'Gentle movement' },
                { value: 'breathing', label: 'Breathing', description: 'Focused breathing exercises' },
                { value: 'mixed', label: 'Mixed', description: 'Combination approach' }
              ]}
              selected={coolDownData.type || 'static_stretch'}
              onSelect={(type) => onChange({
                ...coolDownData,
                type: type as 'static_stretch' | 'walking' | 'breathing' | 'mixed'
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

export default CooldownSection; 