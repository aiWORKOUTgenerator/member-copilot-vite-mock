import React from 'react';
import { Settings, CheckCircle } from 'lucide-react';
import { OptionGrid } from '../../shared/DRYComponents';
import { UserProfile } from '../../../types/user';

interface EquipmentSelectionProps {
  selectedEquipment: string[];
  onEquipmentSelect: (equipment: string) => void;
  onBack: () => void;
  onAdvancedSettings: () => void;
  onDone: () => void;
  location: string;
  contexts: string[];
  userProfile?: UserProfile;
  currentOptions?: any;
}

const EquipmentSelection: React.FC<EquipmentSelectionProps> = ({
  selectedEquipment,
  onEquipmentSelect,
  onBack,
  onAdvancedSettings,
  onDone,
  location,
  contexts,
  userProfile,
  currentOptions
}) => {
  const getEquipmentOptions = (location: string, contexts: string[]) => {
    const baseOptions = [
      { value: 'Dumbbells', label: 'Dumbbells', sublabel: 'Versatile weight training' },
      { value: 'Resistance Bands', label: 'Resistance Bands', sublabel: 'Portable resistance' },
      { value: 'Body Weight', label: 'Body Weight', sublabel: 'No equipment needed' }
    ];
    
    if (location === 'gym') {
      baseOptions.push(
        { value: 'Barbells & Weight Plates', label: 'Barbells & Weight Plates', sublabel: 'Heavy compound movements' },
        { value: 'Strength Machines', label: 'Strength Machines', sublabel: 'Guided movements' },
        { value: 'Cardio Machines (Treadmill, Elliptical, Bike)', label: 'Cardio Machines', sublabel: 'Cardiovascular training' }
      );
    }
    
    if (contexts.includes('cardio')) {
      baseOptions.push(
        { value: 'Cardio Machine (Treadmill, Bike)', label: 'Cardio Machine', sublabel: 'Running/walking or cycling' }
      );
    }
    
    return baseOptions;
  };

  const needsAdvancedSettings = (equipment: string[]) => {
    return equipment.some(eq => ['Dumbbells', 'Barbells & Weight Plates', 'Kettlebells'].includes(eq));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back
        </button>
        <h3 className="text-lg font-medium text-gray-900">Select your equipment</h3>
      </div>
      <OptionGrid
        options={getEquipmentOptions(location, contexts)}
        selected={selectedEquipment}
        onSelect={onEquipmentSelect}
        multi
        columns={{ base: 2, md: 3 }}
        userProfile={userProfile}
        currentOptions={currentOptions}
      />
      
      <div className="mt-6 flex gap-3">
        <button
          onClick={onAdvancedSettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </button>
        <button
          onClick={onDone}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Done
        </button>
      </div>
    </div>
  );
};

export default EquipmentSelection; 