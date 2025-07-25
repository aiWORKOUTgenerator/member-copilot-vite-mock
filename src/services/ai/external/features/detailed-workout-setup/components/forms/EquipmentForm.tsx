import React, { useState } from 'react';
import { Dumbbell, Search, Plus, Minus } from 'lucide-react';
import { ValidationResult } from '../../../../../../../types/core';
import { DETAILED_WORKOUT_CONSTANTS } from '../../../constants/detailed-workout.constants';

interface EquipmentFormProps {
  value: string[];
  onChange: (value: string[]) => void;
  onValidation?: (result: ValidationResult) => void;
  disabled?: boolean;
}

const EQUIPMENT_CATEGORIES = {
  'Strength Training': [
    'Dumbbells',
    'Barbell',
    'Kettlebell',
    'Resistance Bands',
    'Weight Plates',
    'Power Rack',
    'Bench'
  ],
  'Cardio Equipment': [
    'Treadmill',
    'Exercise Bike',
    'Rowing Machine',
    'Jump Rope',
    'Elliptical'
  ],
  'Bodyweight & Mobility': [
    'Yoga Mat',
    'Pull-up Bar',
    'Foam Roller',
    'Gymnastics Rings',
    'Mobility Bands'
  ],
  'Specialty Equipment': [
    'Medicine Ball',
    'Stability Ball',
    'Bosu Ball',
    'TRX/Suspension Trainer',
    'Plyo Box'
  ]
};

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  value,
  onChange,
  onValidation,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Strength Training': true
  });

  const toggleEquipment = (equipment: string) => {
    if (disabled) return;

    const newValue = value.includes(equipment)
      ? value.filter(e => e !== equipment)
      : [...value, equipment];

    onChange(newValue);

    // Defer validation to prevent setState during render
    if (onValidation) {
      const isValid = newValue.length > 0;
      setTimeout(() => {
        onValidation({
          isValid,
          message: isValid ? undefined : 'Please select at least one piece of equipment',
          details: {
            selected: newValue,
            minimumRequired: 1
          }
        });
      }, 0);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredCategories = Object.entries(EQUIPMENT_CATEGORIES).map(([category, items]) => ({
    category,
    items: items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(({ items }) => items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Available Equipment</h3>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          disabled={disabled}
        />
      </div>

      {/* Equipment Categories */}
      <div className="space-y-4">
        {filteredCategories.map(({ category, items }) => (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">{category}</span>
              {expandedCategories[category] ? (
                <Minus className="w-4 h-4 text-gray-500" />
              ) : (
                <Plus className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedCategories[category] && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => toggleEquipment(equipment)}
                    disabled={disabled}
                    className={`
                      px-4 py-2 rounded-lg border transition-all duration-300 text-left
                      ${value.includes(equipment)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{equipment}</span>
                      {value.includes(equipment) && (
                        <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Equipment Summary */}
      {value.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-700 mb-2">Selected Equipment ({value.length})</div>
          <div className="flex flex-wrap gap-2">
            {value.map((equipment) => (
              <div
                key={equipment}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
              >
                <span>{equipment}</span>
                <button
                  onClick={() => toggleEquipment(equipment)}
                  disabled={disabled}
                  className="hover:text-purple-900"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentForm; 