import React from 'react';
import { CheckCircle } from 'lucide-react';
import { EquipmentSelectionData } from '../../../types/equipment';

interface AdvancedSettingsProps {
  equipmentData: EquipmentSelectionData;
  onBack: () => void;
  onSave: (data: EquipmentSelectionData) => void;
  onDataChange: (data: EquipmentSelectionData) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  equipmentData,
  onBack,
  onSave,
  onDataChange
}) => {
  const handleWeightChange = (equipment: string, value: string) => {
    const newData = {
      ...equipmentData,
      weights: {
        ...equipmentData.weights,
        [equipment]: value.split('-').map(w => parseInt(w.trim())).filter(w => !isNaN(w))
      }
    };
    onDataChange(newData);
  };

  const handleConstraintChange = (field: string, value: string) => {
    const newData = {
      ...equipmentData,
      constraints: {
        ...equipmentData.constraints,
        [field]: value
      }
    };
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Equipment
        </button>
        <h3 className="text-lg font-medium text-gray-900">Advanced Equipment Settings</h3>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Weight Specifications</h4>
        <div className="space-y-4">
          {equipmentData.specificEquipment
            .filter(eq => ['Dumbbells', 'Barbell', 'Kettlebells'].includes(eq))
            .map(equipment => (
              <div key={equipment} className="flex items-center justify-between">
                <span className="text-sm font-medium">{equipment}</span>
                <input
                  type="text"
                  placeholder="e.g., 5-50 lbs"
                  className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
                  value={equipmentData.weights?.[equipment]?.join('-') || ''}
                  onChange={(e) => handleWeightChange(equipment, e.target.value)}
                />
              </div>
            ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Space & Budget Constraints</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Space Available</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              value={equipmentData.constraints?.space || ''}
              onChange={(e) => handleConstraintChange('space', e.target.value)}
            >
              <option value="">Select space</option>
              <option value="minimal">Minimal (corner of room)</option>
              <option value="moderate">Moderate (spare room)</option>
              <option value="large">Large (dedicated gym)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              value={equipmentData.constraints?.budget || ''}
              onChange={(e) => handleConstraintChange('budget', e.target.value)}
            >
              <option value="">Select budget</option>
              <option value="low">Low ($0-$500)</option>
              <option value="medium">Medium ($500-$2000)</option>
              <option value="high">High ($2000+)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => onSave(equipmentData)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Advanced Settings
        </button>
      </div>
    </div>
  );
};

export default AdvancedSettings; 