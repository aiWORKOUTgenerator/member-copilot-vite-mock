import { DynamicEquipmentService } from './dynamicEquipmentService';

interface WorkoutEquipment {
  equipment: string[];
}

export const WORKOUT_EQUIPMENT_OPTIONS: Record<string, WorkoutEquipment> = {
  'Energizing Boost': {
    equipment: [
      'Dumbbells',
      'Resistance Bands',
      'Kettlebells',
      'Suspension Trainer/TRX',
      'Body Weight'
    ]
  },
  'Improve Posture': {
    equipment: [
      'Resistance Bands',
      'Dumbbells',
      'Yoga Mat',
      'Body Weight'
    ]
  },
  'Stress Reduction': {
    equipment: [
      'Yoga Mat',
      'Body Weight'
    ]
  },
  'Quick Sweat': {
    equipment: [
      'Dumbbells',
      'Kettlebells',
      'Suspension Trainer/TRX',
      'Cardio Machine (Treadmill, Bike)',
      'Body Weight'
    ]
  },
  'Gentle Recovery & Mobility': {
    equipment: [
      'Yoga Mat',
      'Resistance Bands',
      'Body Weight'
    ]
  },
  'Core & Abs Focus': {
    equipment: [
      'Yoga Mat',
      'Body Weight',
      'Dumbbells',
      'Kettlebells',
      'Suspension Trainer/TRX'
    ]
  }
};

export function filterAvailableEquipment(
  workoutFocus: string,
  availableEquipment: string[],
  availableLocations?: string[]
): string[] {
  // If locations are provided, validate equipment against them
  if (availableLocations && availableLocations.length > 0) {
    const validEquipment = DynamicEquipmentService.validateEquipmentForLocations(
      availableEquipment as string[],
      availableLocations
    );
    
    if (!validEquipment.isValid) {
      // Use default equipment for selected locations
      return DynamicEquipmentService.getDefaultEquipmentForLocations(availableLocations);
    }
  }
  
  // Existing logic for workout focus filtering
  const workoutOptions = WORKOUT_EQUIPMENT_OPTIONS[workoutFocus]?.equipment || [];
  
  if (!workoutOptions.length || !availableEquipment?.length) {
    return ['Body Weight'];
  }
  
  const matchingEquipment = workoutOptions.filter(equipment => 
    availableEquipment.includes(equipment)
  );
  
  return matchingEquipment.length ? matchingEquipment : ['Body Weight'];
}

export function validateEquipmentForFocus(
  workoutFocus: string,
  selectedEquipment: string[]
): boolean {
  const recommendation = WORKOUT_EQUIPMENT_OPTIONS[workoutFocus];
  if (!recommendation) return true;

  // Check if all required equipment is selected
  return recommendation.equipment.every(eq => 
    selectedEquipment.includes(eq) || selectedEquipment.includes('Body Weight')
  );
}

export function getEquipmentDescription(workoutFocus: string): string {
  return WORKOUT_EQUIPMENT_OPTIONS[workoutFocus]?.equipment.join(', ') || 'Equipment selected based on workout focus';
} 