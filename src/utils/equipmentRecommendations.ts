import { DynamicEquipmentService, AvailableEquipment } from './dynamicEquipmentService';

interface WorkoutEquipment {
  equipment: AvailableEquipment[];
}

export const WORKOUT_EQUIPMENT_OPTIONS: Record<string, WorkoutEquipment> = {
  'Energizing Boost': {
    equipment: [
      'Dumbbells',
      'Resistance Bands',
      'Kettlebells',
      'Suspension Trainer/TRX',
      'Body Weight'
    ] as AvailableEquipment[]
  },
  'Improve Posture': {
    equipment: [
      'Resistance Bands',
      'Dumbbells',
      'Yoga Mat',
      'Body Weight'
    ] as AvailableEquipment[]
  },
  'Stress Reduction': {
    equipment: [
      'Yoga Mat',
      'Body Weight'
    ] as AvailableEquipment[]
  },
  'Quick Sweat': {
    equipment: [
      'Dumbbells',
      'Kettlebells',
      'Suspension Trainer/TRX',
      'Cardio Machine (Treadmill, Bike)',
      'Body Weight'
    ] as AvailableEquipment[]
  },
  'Gentle Recovery & Mobility': {
    equipment: [
      'Yoga Mat',
      'Resistance Bands',
      'Body Weight'
    ] as AvailableEquipment[]
  },
  'Core & Abs Focus': {
    equipment: [
      'Yoga Mat',
      'Body Weight',
      'Dumbbells',
      'Kettlebells',
      'Suspension Trainer/TRX'
    ] as AvailableEquipment[]
  }
};

// Helper function to validate and convert string array to AvailableEquipment array
function validateEquipmentArray(equipment: string[]): AvailableEquipment[] {
  return equipment.filter((eq): eq is AvailableEquipment => 
    Object.values(WORKOUT_EQUIPMENT_OPTIONS).some(option => 
      option.equipment.includes(eq as AvailableEquipment)
    ) || eq === 'Body Weight' || eq === 'Yoga Mat'
  );
}

export function filterAvailableEquipment(
  workoutFocus: string,
  availableEquipment: string[],
  availableLocations?: string[]
): AvailableEquipment[] {
  // Convert and validate available equipment
  const validatedEquipment = validateEquipmentArray(availableEquipment);
  
  // If locations are provided, validate equipment against them
  if (availableLocations && availableLocations.length > 0) {
    const validEquipment = DynamicEquipmentService.validateEquipmentForLocations(
      validatedEquipment,
      availableLocations
    );
    
    if (!validEquipment.isValid) {
      // Use default equipment for selected locations
      const defaultEquipment = DynamicEquipmentService.getDefaultEquipmentForLocations(availableLocations) as AvailableEquipment[];
      return defaultEquipment;
    }
  }
  
  // Existing logic for workout focus filtering
  const workoutOptions = WORKOUT_EQUIPMENT_OPTIONS[workoutFocus]?.equipment || [];
  
  if (!workoutOptions.length || !validatedEquipment?.length) {
    return ['Body Weight'];
  }
  
  const matchingEquipment = workoutOptions.filter(equipment => 
    validatedEquipment.includes(equipment)
  );
  
  const result: AvailableEquipment[] = matchingEquipment.length ? matchingEquipment : ['Body Weight'];
  
  return result;
}

export function validateEquipmentForFocus(
  workoutFocus: string,
  selectedEquipment: string[]
): boolean {
  const recommendation = WORKOUT_EQUIPMENT_OPTIONS[workoutFocus];
  if (!recommendation) return true;

  const validatedEquipment = validateEquipmentArray(selectedEquipment);

  // Check if all required equipment is selected
  return recommendation.equipment.every(eq => 
    validatedEquipment.includes(eq) || validatedEquipment.includes('Body Weight')
  );
}

export function getEquipmentDescription(workoutFocus: string): string {
  return WORKOUT_EQUIPMENT_OPTIONS[workoutFocus]?.equipment.join(', ') || 'Equipment selected based on workout focus';
} 