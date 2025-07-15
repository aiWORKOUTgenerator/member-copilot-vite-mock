import { ValidationResult } from '../types/core';
import { HierarchicalSelectionData } from '../types/areas';

export const validateFocusAreas = (value: string[] | HierarchicalSelectionData, allOptions?: any): ValidationResult => {
  const areas = Array.isArray(value) ? value : Object.keys(value || {}).filter(k => value?.[k]?.selected);
  const result: ValidationResult = { isValid: true };
  
  if (areas.length === 0) {
    result.warnings = ['No focus areas selected - will use full body default'];
    result.recommendations = ['Select specific areas for better targeting'];
  }
  
  if (areas.length > 4) {
    result.warnings = ['Too many focus areas may reduce workout effectiveness'];
    result.recommendations = ['Consider focusing on 2-3 primary areas'];
  }
  
  // Validate area compatibility with duration
  if (allOptions?.customization_duration) {
    const duration = typeof allOptions.customization_duration === 'number' 
      ? allOptions.customization_duration 
      : allOptions.customization_duration?.totalDuration;
    
    if (duration && duration < 30 && areas.length > 2) {
      result.warnings = ['Short workouts work better with fewer focus areas'];
      result.recommendations = ['Consider reducing focus areas or increasing duration'];
    }
  }
  
  // Validate area compatibility with focus
  if (allOptions?.customization_focus) {
    const focus = typeof allOptions.customization_focus === 'string' 
      ? allOptions.customization_focus 
      : allOptions.customization_focus?.focus;
    
    if (focus === 'cardio' && !areas.includes('Cardio') && !areas.includes('Full Body')) {
      result.warnings = ['Cardio focus works best with cardio or full body areas'];
      result.recommendations = ['Consider adding cardio or full body areas'];
    }
    
    if (focus === 'strength' && areas.includes('Cardio') && areas.length === 1) {
      result.warnings = ['Strength focus with cardio-only areas may not be optimal'];
      result.recommendations = ['Consider adding strength-focused areas'];
    }
  }
  
  return result;
}; 