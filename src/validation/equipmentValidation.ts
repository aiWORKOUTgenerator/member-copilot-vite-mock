import { ValidationResult } from '../types/core';
import { EquipmentSelectionData } from '../types/equipment';

export const validateEquipment = (value: string[] | EquipmentSelectionData, allOptions?: any): ValidationResult => {
  const equipment = Array.isArray(value) ? value : value?.specificEquipment || [];
  const result: ValidationResult = { isValid: true };
  
  if (equipment.length === 0) {
    result.isValid = false;
    result.errors = ['Please select at least one equipment option'];
  }
  
  // Validate equipment compatibility with focus
  if (allOptions?.customization_focus) {
    const focus = typeof allOptions.customization_focus === 'string' 
      ? allOptions.customization_focus 
      : allOptions.customization_focus?.focus;
    
    if (focus === 'strength' && equipment.includes('Body Weight') && equipment.length === 1) {
      result.warnings = ['Body weight-only training may limit strength development'];
      result.recommendations = ['Consider adding weights or resistance equipment'];
    }
    
    if (focus === 'power' && !equipment.some(eq => ['Barbells & Weight Plates', 'Dumbbells', 'Kettlebells'].includes(eq))) {
      result.warnings = ['Power training is most effective with weights'];
      result.recommendations = ['Consider adding weighted equipment for explosive movements'];
    }
  }
  
  // Validate location compatibility
  if (typeof value === 'object' && !Array.isArray(value) && value?.location) {
    const location = value.location;
    
    if (location === 'home' && equipment.includes('Barbells & Weight Plates')) {
      result.warnings = ['Barbell training at home requires proper safety setup'];
      result.recommendations = ['Ensure adequate space and safety equipment'];
    }
    
    if (location === 'outdoor' && equipment.some(eq => ['Strength Machines', 'Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)'].includes(eq))) {
      result.isValid = false;
      result.errors = ['Machines are not available for outdoor workouts'];
    }
  }
  
  return result;
}; 