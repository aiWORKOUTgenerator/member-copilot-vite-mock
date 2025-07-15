import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { EquipmentSelectionData } from '../../../types/equipment';
import { CustomizationComponentProps } from '../../../types/config';
import { UserProfile } from '../../../types/user';
import LocationSelection from './LocationSelection';
import ContextSelection from './ContextSelection';
import EquipmentSelection from './EquipmentSelection';
import AdvancedSettings from './AdvancedSettings';

const EnhancedEquipmentCustomization: React.FC<CustomizationComponentProps<string[] | EquipmentSelectionData>> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply,
  onComplexityChange
}) => {
  // Intelligent initial disclosure level based on data complexity and user profile
  const [disclosureLevel, setDisclosureLevel] = useState<1 | 2 | 3 | 4>(() => {
    if (typeof value === 'object' && !Array.isArray(value)) return 4;
    if (userProfile?.fitnessLevel === 'advanced') return 2;
    return 1;
  });
  
  const [internalState, setInternalState] = useState<EquipmentSelectionData>(() => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
    return {
      location: '',
      contexts: [],
      specificEquipment: Array.isArray(value) ? value : [],
      disclosureLevel: disclosureLevel
    };
  });
  
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  
  // Helper function to generate AI suggestions based on location
  const getLocationBasedSuggestions = (location: string, userProfile?: UserProfile) => {
    const suggestions = [];
    if (location === 'home' && userProfile?.goals?.includes('strength')) {
      suggestions.push('For home strength training, consider resistance bands and dumbbells');
    }
    if (location === 'gym' && userProfile?.fitnessLevel === 'beginner') {
      suggestions.push('Gym access allows for progressive overload with barbells and machines');
    }
    return suggestions;
  };
  
  const needsAdvancedSettings = (equipment: string[]) => {
    return equipment.some(eq => ['Dumbbells', 'Barbell', 'Kettlebells'].includes(eq));
  };
  
  const handleLocationSelect = (location: string) => {
    const newState = { ...internalState, location };
    setInternalState(newState);
    setDisclosureLevel(2);
    
    // Generate AI suggestions based on location
    const suggestions = getLocationBasedSuggestions(location, userProfile);
    setAISuggestions(suggestions);
  };
  
  const handleContextSelect = (context: string) => {
    const newContexts = internalState.contexts.includes(context)
      ? internalState.contexts.filter(c => c !== context)
      : [...internalState.contexts, context];
    const newState = { ...internalState, contexts: newContexts };
    setInternalState(newState);
    if (newContexts.length > 0) {
      setDisclosureLevel(3);
    }
  };
  
  const handleEquipmentSelect = (equipment: string) => {
    const newEquipment = internalState.specificEquipment.includes(equipment)
      ? internalState.specificEquipment.filter(e => e !== equipment)
      : [...internalState.specificEquipment, equipment];
    const newState = { ...internalState, specificEquipment: newEquipment };
    setInternalState(newState);
    
    // Emit final data or continue to advanced settings
    if (needsAdvancedSettings(newEquipment)) {
      setDisclosureLevel(4);
    } else {
      onChange(newState);
    }
  };
  
  const handleAdvancedSave = (data: EquipmentSelectionData) => {
    onChange(data);
    onComplexityChange?.('simple', 'complex');
  };
  
  const handleDone = () => {
    onChange(internalState);
  };
  
  // Render current level
  const renderCurrentLevel = () => {
    switch (disclosureLevel) {
      case 1:
        return (
          <LocationSelection
            selectedLocation={internalState.location || ''}
            onLocationSelect={handleLocationSelect}
            userProfile={userProfile}
            aiSuggestions={aiSuggestions}
            onAIRecommendationApply={onAIRecommendationApply}
          />
        );
      case 2:
        return (
          <ContextSelection
            selectedContexts={internalState.contexts}
            onContextSelect={handleContextSelect}
            onBack={() => setDisclosureLevel(1)}
            userProfile={userProfile}
            currentOptions={aiContext?.currentSelections}
          />
        );
      case 3:
        return (
          <EquipmentSelection
            selectedEquipment={internalState.specificEquipment}
            onEquipmentSelect={handleEquipmentSelect}
            onBack={() => setDisclosureLevel(2)}
            onAdvancedSettings={() => setDisclosureLevel(4)}
            onDone={handleDone}
            location={internalState.location || ''}
            contexts={internalState.contexts}
            userProfile={userProfile}
            currentOptions={aiContext?.currentSelections}
          />
        );
      case 4:
        return (
          <AdvancedSettings
            equipmentData={internalState}
            onBack={() => setDisclosureLevel(3)}
            onSave={handleAdvancedSave}
            onDataChange={setInternalState}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="enhanced-equipment-progressive-disclosure">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Equipment Setup Progress</span>
          <span className="text-sm text-gray-500">{disclosureLevel}/4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(disclosureLevel / 4) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Current Level Content */}
      {renderCurrentLevel()}
      
      {/* AI Enhancement Suggestion */}
      {disclosureLevel < 4 && userProfile?.fitnessLevel === 'advanced' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Pro Tip</h4>
              <p className="text-sm text-yellow-700 mt-1">
                As an advanced user, you can access detailed equipment settings for more precise workout planning.
              </p>
              <button
                onClick={() => setDisclosureLevel(4)}
                className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                Enable Advanced Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedEquipmentCustomization; 