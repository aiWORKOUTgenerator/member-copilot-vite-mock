export interface LocationEquipmentMap {
  location: string;
  equipment: string[];
  description: string;
  defaultEquipment: string[];
}

export const LOCATION_EQUIPMENT_MAPPING: Record<string, LocationEquipmentMap> = {
  'Gym': {
    location: 'Gym',
    equipment: [
      'Barbells & Weight Plates',
      'Strength Machines',
      'Cardio Machines (Treadmill, Elliptical, Bike)',
      'Functional Training Area (Kettlebells, Resistance Bands, TRX)',
      'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)',
      'Pool (If available)'
    ],
    description: 'Full commercial gym with comprehensive equipment',
    defaultEquipment: ['Barbells & Weight Plates', 'Cardio Machines (Treadmill, Elliptical, Bike)']
  },
  'Home Gym': {
    location: 'Home Gym',
    equipment: [
      'Dumbbells',
      'Resistance Bands',
      'Kettlebells',
      'Cardio Machine (Treadmill, Bike)',
      'Yoga Mat & Stretching Space',
      'Suspension Trainer/TRX'
    ],
    description: 'Dedicated home workout space with equipment',
    defaultEquipment: ['Dumbbells', 'Resistance Bands']
  },
  'Home': {
    location: 'Home',
    equipment: [
      'Body Weight',
      'Resistance Bands',
      'Yoga Mat',
      'Dumbbells',
      'Kettlebells',
      'Suspension Trainer/TRX'
    ],
    description: 'Limited space with minimal equipment',
    defaultEquipment: ['Body Weight']
  },
  'Parks/Outdoor Spaces': {
    location: 'Parks/Outdoor Spaces',
    equipment: [
      'Body Weight',
      'Resistance Bands',
      'Yoga Mat',
      'Suspension Trainer/TRX'
    ],
    description: 'Outdoor training with portable equipment',
    defaultEquipment: ['Body Weight']
  },
  'Swimming Pool': {
    location: 'Swimming Pool',
    equipment: [
      'No equipment required'
    ],
    description: 'Water-based training',
    defaultEquipment: ['No equipment required']
  },
  'Running Track': {
    location: 'Running Track',
    equipment: [
      'Body Weight'
    ],
    description: 'Track-based training',
    defaultEquipment: ['Body Weight']
  }
}; 