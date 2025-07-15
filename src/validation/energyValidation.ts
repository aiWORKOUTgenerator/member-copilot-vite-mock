import { ValidationResult } from '../types/core';

export const validateEnergy = (value: number, allOptions?: any): ValidationResult => {
  const result: ValidationResult = { isValid: true };
  
  if (value && value <= 2) {
    result.warnings = ['Low energy may affect workout performance'];
    result.recommendations = ['Consider a shorter or less intense workout'];
  }
  
  if (value && value >= 4) {
    result.recommendations = ['High energy is perfect for challenging workouts'];
  }
  
  // Cross-validate with duration
  if (allOptions?.customization_duration && value <= 2) {
    const duration = typeof allOptions.customization_duration === 'number' 
      ? allOptions.customization_duration 
      : allOptions.customization_duration?.totalDuration;
    
    if (duration && duration > 45) {
      result.warnings = result.warnings || [];
      result.warnings.push('Long workouts with low energy may be counterproductive');
      result.recommendations = ['Consider reducing workout duration to 30 minutes or less'];
    }
  }
  
  return result;
};

export const validateSleep = (value: number, allOptions?: any): ValidationResult => {
  const result: ValidationResult = { isValid: true };
  
  if (value && value <= 2) {
    result.warnings = ['Poor sleep quality may affect recovery and performance'];
    result.recommendations = ['Consider lighter intensity or focus on mobility work'];
  }
  
  if (value && value >= 4) {
    result.recommendations = ['Good sleep supports optimal performance'];
  }
  
  // Cross-validate with focus
  if (allOptions?.customization_focus && value <= 2) {
    const focus = typeof allOptions.customization_focus === 'string' 
      ? allOptions.customization_focus 
      : allOptions.customization_focus?.focus;
    
    if (focus === 'strength' || focus === 'power') {
      result.warnings = result.warnings || [];
      result.warnings.push('Poor sleep may impair strength and power performance');
      result.recommendations = ['Consider switching to recovery or flexibility focus'];
    }
  }
  
  return result;
}; 