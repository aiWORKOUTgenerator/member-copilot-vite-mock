import { LOCATION_EQUIPMENT_MAPPING } from './locationEquipmentMapping';

export type AvailableEquipment = 
  // Gym Equipment
  | 'Barbells & Weight Plates'
  | 'Strength Machines'
  | 'Cardio Machines (Treadmill, Elliptical, Bike)'
  | 'Functional Training Area (Kettlebells, Resistance Bands, TRX)'
  | 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)'
  | 'Pool (If available)'
  // Home Gym Equipment
  | 'Dumbbells'
  | 'Resistance Bands'
  | 'Kettlebells'
  | 'Cardio Machine (Treadmill, Bike)'
  | 'Yoga Mat & Stretching Space'
  | 'Suspension Trainer/TRX'
  // Home Equipment
  | 'Body Weight'
  | 'Yoga Mat'
  // Specialized
  | 'No equipment required';

export class DynamicEquipmentService {
  static getAvailableEquipmentForLocations(locations: string[]): AvailableEquipment[] {
    const allEquipment = new Set<AvailableEquipment>();
    
    locations.forEach(location => {
      const locationMap = LOCATION_EQUIPMENT_MAPPING[location];
      if (locationMap) {
        locationMap.equipment.forEach(equipment => 
          allEquipment.add(equipment as AvailableEquipment)
        );
      }
    });
    
    return Array.from(allEquipment);
  }
  
  static getDefaultEquipmentForLocations(locations: string[]): AvailableEquipment[] {
    const defaultEquipment = new Set<AvailableEquipment>();
    
    locations.forEach(location => {
      const locationMap = LOCATION_EQUIPMENT_MAPPING[location];
      if (locationMap) {
        locationMap.defaultEquipment.forEach(equipment => 
          defaultEquipment.add(equipment as AvailableEquipment)
        );
      }
    });
    
    return Array.from(defaultEquipment);
  }
  
  static validateEquipmentForLocations(
    equipment: AvailableEquipment[], 
    locations: string[]
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const availableEquipment = this.getAvailableEquipmentForLocations(locations);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    equipment.forEach(eq => {
      if (!availableEquipment.includes(eq)) {
        errors.push(`${eq} is not available for your selected locations`);
      }
    });
    
    if (equipment.length === 0) {
      errors.push('Please select at least one equipment option');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 