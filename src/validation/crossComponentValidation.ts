import { ValidationResult } from '../types/core';
import { PerWorkoutOptions } from '../types/core';

export const validateCrossComponent = (allOptions: PerWorkoutOptions): ValidationResult => {
  const result: ValidationResult = { isValid: true };
  
  // Duration vs Focus validation
  if (allOptions.customization_duration && allOptions.customization_focus) {
    const duration = typeof allOptions.customization_duration === 'number' 
      ? allOptions.customization_duration 
      : allOptions.customization_duration?.totalDuration;
    
    const focus = typeof allOptions.customization_focus === 'string' 
      ? allOptions.customization_focus 
      : allOptions.customization_focus?.focus;
    
    if (focus === 'strength' && duration && duration < 30) {
      result.warnings = result.warnings || [];
      result.warnings.push('Strength training is more effective with at least 30 minutes');
    }
    
    if (focus === 'endurance' && duration && duration < 20) {
      result.warnings = result.warnings || [];
      result.warnings.push('Endurance training requires at least 20 minutes for cardiovascular benefits');
    }
  }
  
  // Energy vs Sleep correlation
  if (allOptions.customization_energy && allOptions.customization_sleep) {
    const energyGap = Math.abs(allOptions.customization_energy - allOptions.customization_sleep);
    
    if (energyGap > 2) {
      result.warnings = result.warnings || [];
      result.warnings.push('Large gap between energy and sleep quality may indicate underlying issues');
      result.recommendations = result.recommendations || [];
      result.recommendations.push('Consider factors affecting energy levels beyond sleep');
    }
  }
  
  // Equipment vs Focus vs Areas validation
  if (allOptions.customization_equipment && allOptions.customization_focus && allOptions.customization_areas) {
    const equipment = Array.isArray(allOptions.customization_equipment) 
      ? allOptions.customization_equipment 
      : allOptions.customization_equipment?.specificEquipment || [];
    
    const focus = typeof allOptions.customization_focus === 'string' 
      ? allOptions.customization_focus 
      : allOptions.customization_focus?.focus;
    
    const areas = Array.isArray(allOptions.customization_areas) 
      ? allOptions.customization_areas 
      : Object.keys(allOptions.customization_areas || {}).filter(k => allOptions.customization_areas?.[k]?.selected);
    
    if (focus === 'strength' && areas.includes('Upper Body') && equipment.includes('Body Weight')) {
      result.warnings = result.warnings || [];
              result.warnings.push('Upper body strength training is challenging with Body Weight only');
      result.recommendations = result.recommendations || [];
      result.recommendations.push('Consider adding resistance bands or weights for upper body development');
    }
  }
  
  return result;
}; 