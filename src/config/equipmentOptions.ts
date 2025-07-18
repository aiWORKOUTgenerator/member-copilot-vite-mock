import { OptionConfig } from '../components/Profile/shared';
import { DynamicEquipmentService, AvailableEquipment } from '../utils/dynamicEquipmentService';

export const createEquipmentOptions = (locations: string[]): OptionConfig[] => {
  const availableEquipment = DynamicEquipmentService.getAvailableEquipmentForLocations(locations);
  
  return availableEquipment.map(equipment => ({
    value: equipment,
    label: equipment,
    description: getEquipmentDescription(equipment),
    metadata: {
      category: getEquipmentCategory(equipment),
      difficulty: getEquipmentDifficulty(equipment),
      spaceRequired: getEquipmentSpaceRequirement(equipment)
    }
  }));
};

const getEquipmentDescription = (equipment: AvailableEquipment): string => {
  const descriptions: Record<AvailableEquipment, string> = {
    'Barbells & Weight Plates': 'Gym-level barbell equipment for heavy strength training',
    'Strength Machines': 'Guided machines for targeted muscle development',
    'Cardio Machines (Treadmill, Elliptical, Bike)': 'Equipment for cardiovascular training',
    'Functional Training Area (Kettlebells, Resistance Bands, TRX)': 'Dynamic training equipment for functional fitness',
    'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)': 'Equipment for flexibility and recovery work',
    'Pool (If available)': 'Water-based training equipment and facilities',
    'Dumbbells': 'Handheld weights for strength training',
    'Resistance Bands': 'Elastic bands providing variable resistance',
    'Kettlebells': 'Weighted bells for dynamic strength training',
    'Cardio Machine (Treadmill, Bike)': 'Home cardio equipment for endurance training',
    'Yoga Mat & Stretching Space': 'Dedicated space for flexibility and mobility work',
    'Suspension Trainer/TRX': 'Suspension training system for body weight exercises and functional fitness',
    'Body Weight': 'Exercises using your own body weight for strength and conditioning',
    'Yoga Mat': 'Exercise mat for floor work and stretching',
    'No equipment required': 'Water-based training with no additional equipment needed'
  };
  return descriptions[equipment] || 'Equipment for training';
};

const getEquipmentCategory = (equipment: AvailableEquipment): string => {
  if (equipment.includes('Cardio') || equipment.includes('Bike') || equipment.includes('Treadmill')) {
    return 'cardio';
  }
  if (equipment.includes('Weight') || equipment.includes('Strength') || equipment.includes('Kettlebell')) {
    return 'strength';
  }
  if (equipment.includes('Yoga') || equipment.includes('Stretching') || equipment.includes('Mobility')) {
    return 'flexibility';
  }
  if (equipment === 'Body Weight' || equipment.includes('No equipment')) {
    return 'body weight';
  }
  if (equipment.includes('Pool')) {
    return 'aquatic';
  }
  if (equipment.includes('Suspension') || equipment.includes('TRX')) {
    return 'functional';
  }
  return 'functional';
};

const getEquipmentDifficulty = (equipment: AvailableEquipment): 'new to exercise' | 'some experience' | 'advanced athlete' => {
  if (equipment === 'Body Weight' || equipment.includes('Yoga Mat') || equipment.includes('No equipment')) {
    return 'new to exercise';
  }
  if (equipment.includes('Resistance Bands') || equipment.includes('Dumbbells')) {
    return 'some experience';
  }
  if (equipment.includes('Barbells & Weight Plates') || equipment.includes('Kettlebells') || equipment.includes('TRX') || equipment.includes('Suspension')) {
    return 'advanced athlete';
  }
  return 'some experience';
};

const getEquipmentSpaceRequirement = (equipment: AvailableEquipment): 'minimal' | 'moderate' | 'large' => {
  if (equipment === 'Body Weight' || equipment.includes('Yoga Mat') || equipment.includes('Resistance Bands')) {
    return 'minimal';
  }
  if (equipment.includes('Dumbbells') || equipment.includes('Kettlebells') || equipment.includes('Cardio Machine') || equipment.includes('Suspension')) {
    return 'moderate';
  }
  if (equipment.includes('Strength Machines') || equipment.includes('Functional Training Area')) {
    return 'large';
  }
  return 'moderate';
}; 