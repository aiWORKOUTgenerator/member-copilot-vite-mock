import { ValidationResult } from '../types/core';
import { WorkoutFocusConfigurationData } from '../types/focus';

export const validateFocus = (value: string | WorkoutFocusConfigurationData, allOptions?: any): ValidationResult => {
  const focus = typeof value === 'string' ? value : value?.focus;
  const result: ValidationResult = { isValid: true };
  
  if (!focus) {
    result.isValid = false;
    result.errors = ['Please select a primary workout focus'];
  }
  
  // Cross-component validation
  if (focus === 'strength' && Array.isArray(allOptions?.customization_equipment)) {
    const equipment = allOptions.customization_equipment;
    if (equipment.includes('Bodyweight Only') && equipment.length === 1) {
      result.warnings = ['Bodyweight exercises may limit strength training effectiveness'];
      result.recommendations = ['Consider adding resistance equipment for better strength gains'];
    }
  }
  
  if (focus === 'endurance' && allOptions?.customization_duration) {
    const duration = typeof allOptions.customization_duration === 'number' 
      ? allOptions.customization_duration 
      : allOptions.customization_duration?.totalDuration;
    
    if (duration && duration < 20) {
      result.warnings = ['Endurance training is more effective with longer durations'];
      result.recommendations = ['Consider increasing workout duration to 20+ minutes'];
    }
  }
  
  return result;
}; 