import React from 'react';
import { OptionGrid } from '../../shared/DRYComponents';
import { UserProfile } from '../../../types/user';

interface ContextSelectionProps {
  selectedContexts: string[];
  onContextSelect: (context: string) => void;
  onBack: () => void;
  userProfile?: UserProfile;
  currentOptions?: any;
}

const ContextSelection: React.FC<ContextSelectionProps> = ({
  selectedContexts,
  onContextSelect,
  onBack,
  userProfile,
  currentOptions
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back
        </button>
        <h3 className="text-lg font-medium text-gray-900">What type of training?</h3>
      </div>
      <OptionGrid
        options={[
          { 
            value: 'strength', 
            label: 'Strength Training', 
            sublabel: 'Build muscle and power' 
          },
          { 
            value: 'cardio', 
            label: 'Cardio Training', 
            sublabel: 'Improve endurance' 
          },
          { 
            value: 'flexibility', 
            label: 'Flexibility/Mobility', 
            sublabel: 'Enhance range of motion' 
          },
          { 
            value: 'functional', 
            label: 'Functional Training', 
            sublabel: 'Real-world movements' 
          }
        ]}
        selected={selectedContexts}
        onSelect={onContextSelect}
        multi
        columns={{ base: 1, md: 2 }}
        userProfile={userProfile}
        currentOptions={currentOptions}
      />
    </div>
  );
};

export default ContextSelection; 