import { DynamicEquipmentService } from '../dynamicEquipmentService';

describe('DynamicEquipmentService', () => {
  test('getAvailableEquipmentForLocations returns correct equipment for gym', () => {
    const equipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Gym']);
    expect(equipment).toContain('Barbells & Weight Plates');
    expect(equipment).toContain('Strength Machines');
    expect(equipment).toContain('Cardio Machines (Treadmill, Elliptical, Bike)');
  });

  test('getAvailableEquipmentForLocations returns correct equipment for home', () => {
    const equipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Home']);
    expect(equipment).toContain('Body Weight');
    expect(equipment).toContain('Resistance Bands');
    expect(equipment).toContain('Yoga Mat');
    expect(equipment).toContain('Dumbbells');
    expect(equipment).toContain('Kettlebells');
    expect(equipment).not.toContain('Strength Machines');
  });

  test('getAvailableEquipmentForLocations combines equipment from multiple locations', () => {
    const equipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Home', 'Parks/Outdoor Spaces']);
    expect(equipment).toContain('Body Weight');
    expect(equipment).toContain('Resistance Bands');
    expect(equipment).toContain('Yoga Mat');
    expect(equipment).toContain('Dumbbells');
    expect(equipment).toContain('Kettlebells');
    expect(equipment).toContain('Suspension Trainer/TRX');
  });

  test('getDefaultEquipmentForLocations returns correct defaults for gym', () => {
    const defaults = DynamicEquipmentService.getDefaultEquipmentForLocations(['Gym']);
    expect(defaults).toContain('Barbells & Weight Plates');
    expect(defaults).toContain('Cardio Machines (Treadmill, Elliptical, Bike)');
  });

  test('getDefaultEquipmentForLocations returns correct defaults for home', () => {
    const defaults = DynamicEquipmentService.getDefaultEquipmentForLocations(['Home']);
    expect(defaults).toEqual(['Body Weight']);
  });

  test('validateEquipmentForLocations detects invalid equipment', () => {
    const result = DynamicEquipmentService.validateEquipmentForLocations(
      ['Strength Machines'],
      ['Home']
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Strength Machines is not available for your selected locations');
  });

  test('validateEquipmentForLocations accepts valid equipment', () => {
    const result = DynamicEquipmentService.validateEquipmentForLocations(
      ['Body Weight', 'Resistance Bands'],
      ['Home']
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateEquipmentForLocations requires at least one equipment', () => {
    const result = DynamicEquipmentService.validateEquipmentForLocations(
      [],
      ['Home']
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Please select at least one equipment option');
  });

  test('validateEquipmentForLocations handles multiple locations', () => {
    const result = DynamicEquipmentService.validateEquipmentForLocations(
      ['Body Weight', 'Resistance Bands'],
      ['Home', 'Parks/Outdoor Spaces']
    );
    expect(result.isValid).toBe(true);
  });

  test('Suspension Trainer/TRX appears for Home, Home Gym, and Parks/Outdoor Spaces', () => {
    const homeEquipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Home']);
    const homeGymEquipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Home Gym']);
    const parksEquipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Parks/Outdoor Spaces']);
    
    expect(homeEquipment).toContain('Suspension Trainer/TRX');
    expect(homeGymEquipment).toContain('Suspension Trainer/TRX');
    expect(parksEquipment).toContain('Suspension Trainer/TRX');
  });

  test('Suspension Trainer/TRX does not get duplicated when multiple locations are selected', () => {
    const equipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Home', 'Home Gym', 'Parks/Outdoor Spaces']);
    const suspensionTrainerCount = equipment.filter(eq => eq === 'Suspension Trainer/TRX').length;
    
    expect(suspensionTrainerCount).toBe(1);
  });
}); 