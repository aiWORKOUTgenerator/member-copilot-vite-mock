import { dataTransformers, legacyTransformers } from '../dataTransformers';

describe('Data Transformers', () => {
  describe('extractSorenessAreas', () => {
    it('should handle string array input', () => {
      const input = ['legs', 'back', 'arms'];
      const result = dataTransformers.extractSorenessAreas(input);
      expect(result).toEqual(['legs', 'back', 'arms']);
    });

    it('should handle CategoryRatingData input', () => {
      const input = {
        'legs': { selected: true, label: 'Legs', rating: 3 },
        'back': { selected: false, label: 'Back', rating: 2 },
        'arms': { selected: true, label: 'Arms', rating: 4 }
      };
      const result = dataTransformers.extractSorenessAreas(input);
      expect(result).toEqual(['legs', 'arms']);
    });

    it('should handle undefined input', () => {
      const result = dataTransformers.extractSorenessAreas(undefined);
      expect(result).toEqual([]);
    });

    it('should handle null input', () => {
      const result = dataTransformers.extractSorenessAreas(null as any);
      expect(result).toEqual([]);
    });
  });

  describe('extractDurationValue', () => {
    it('should handle number input', () => {
      const input = 45;
      const result = dataTransformers.extractDurationValue(input);
      expect(result).toBe(45);
    });

    it('should handle DurationConfigurationData input', () => {
      const input = {
        selected: true,
        totalDuration: 60,
        label: '60 minutes',
        value: 60,
        workingTime: 50,
        configuration: 'duration-only' as const,
        warmUp: { included: false, duration: 0, type: 'dynamic' },
        coolDown: { included: false, duration: 0, type: 'static_stretch' }
      };
      const result = dataTransformers.extractDurationValue(input);
      expect(result).toBe(60);
    });

    it('should handle undefined input', () => {
      const result = dataTransformers.extractDurationValue(undefined);
      expect(result).toBe(0);
    });

    it('should handle invalid object input', () => {
      const input = { someOtherProperty: 'value' };
      const result = dataTransformers.extractDurationValue(input as any);
      expect(result).toBe(0);
    });
  });

  describe('extractFocusValue', () => {
    it('should handle string input', () => {
      const input = 'strength';
      const result = dataTransformers.extractFocusValue(input);
      expect(result).toBe('strength');
    });

    it('should handle WorkoutFocusConfigurationData input', () => {
      const input = {
        focus: 'cardio',
        intensity: 'moderate',
        preferences: ['endurance', 'fat_burning']
      };
      const result = dataTransformers.extractFocusValue(input);
      expect(result).toBe('cardio');
    });

    it('should handle undefined input', () => {
      const result = dataTransformers.extractFocusValue(undefined);
      expect(result).toBe('');
    });

    it('should handle invalid object input', () => {
      const input = { someOtherProperty: 'value' };
      const result = dataTransformers.extractFocusValue(input as any);
      expect(result).toBe('');
    });
  });

  describe('extractEquipmentList', () => {
    it('should handle string array input', () => {
      const input = ['Dumbbells', 'Resistance Bands'];
      const result = dataTransformers.extractEquipmentList(input);
      expect(result).toEqual(['Dumbbells', 'Resistance Bands']);
    });

    it('should handle EquipmentSelectionData with specificEquipment', () => {
      const input = {
        contexts: ['home', 'gym'],
        specificEquipment: ['Dumbbells', 'Bench']
      };
      const result = dataTransformers.extractEquipmentList(input);
      expect(result).toEqual(['Dumbbells', 'Bench']);
    });

    it('should handle EquipmentSelectionData with equipment', () => {
      const input = {
        contexts: ['home'],
        equipment: ['Resistance Bands', 'Yoga Mat']
      };
      const result = dataTransformers.extractEquipmentList(input);
      expect(result).toEqual(['Resistance Bands', 'Yoga Mat']);
    });

    it('should handle undefined input', () => {
      const result = dataTransformers.extractEquipmentList(undefined);
      expect(result).toEqual([]);
    });
  });

  describe('extractAreasList', () => {
    it('should handle string array input', () => {
      const input = ['chest', 'back', 'legs'];
      const result = dataTransformers.extractAreasList(input);
      expect(result).toEqual(['chest', 'back', 'legs']);
    });

    it('should handle HierarchicalSelectionData with selectedAreas', () => {
      const input = {
        selectedAreas: ['chest', 'back'],
        hierarchy: { primary: 'upper_body', secondary: 'chest' }
      };
      const result = dataTransformers.extractAreasList(input);
      expect(result).toEqual(['chest', 'back']);
    });

    it('should handle undefined input', () => {
      const result = dataTransformers.extractAreasList(undefined);
      expect(result).toEqual([]);
    });
  });

  describe('normalizePerWorkoutOptions', () => {
    it('should normalize complete options', () => {
      const input = {
        customization_energy: 4,
        customization_soreness: ['legs'],
        customization_focus: 'strength',
        customization_duration: 45,
        customization_equipment: ['Dumbbells'],
        customization_areas: ['chest']
      };
      const result = dataTransformers.normalizePerWorkoutOptions(input);
      expect(result).toEqual({
        customization_energy: 4,
        customization_soreness: ['legs'],
        customization_focus: 'strength',
        customization_duration: 45,
        customization_equipment: ['Dumbbells'],
        customization_areas: ['chest']
      });
    });

    it('should provide defaults for missing values', () => {
      const input = {
        customization_energy: 4
      };
      const result = dataTransformers.normalizePerWorkoutOptions(input);
      expect(result.customization_energy).toBe(4);
      expect(result.customization_soreness).toEqual([]);
      expect(result.customization_focus).toBe('');
      expect(result.customization_duration).toBe(0);
      expect(result.customization_equipment).toEqual([]);
      expect(result.customization_areas).toEqual([]);
    });
  });

  describe('validateAndTransform', () => {
    it('should handle valid data', () => {
      const result = dataTransformers.validateAndTransform.soreness(['legs', 'back']);
      expect(result).toEqual(['legs', 'back']);
    });

    it('should handle invalid data with defaults', () => {
      const result = dataTransformers.validateAndTransform.duration('invalid' as any);
      expect(result).toBe(30); // Default value
    });

    it('should handle focus validation', () => {
      const result = dataTransformers.validateAndTransform.focus('strength');
      expect(result).toBe('strength');
    });

    it('should handle equipment validation', () => {
      const result = dataTransformers.validateAndTransform.equipment(['Dumbbells']);
      expect(result).toEqual(['Dumbbells']);
    });
  });

  describe('isValidFormat', () => {
    it('should validate soreness format', () => {
      expect(dataTransformers.isValidFormat.soreness(['legs'])).toBe(true);
      expect(dataTransformers.isValidFormat.soreness({
        'legs': { selected: true, label: 'Legs' }
      })).toBe(true);
      expect(dataTransformers.isValidFormat.soreness('invalid')).toBe(false);
    });

    it('should validate duration format', () => {
      expect(dataTransformers.isValidFormat.duration(45)).toBe(true);
      expect(dataTransformers.isValidFormat.duration({
        totalDuration: 60,
        selected: true,
        label: '60 minutes'
      })).toBe(true);
      expect(dataTransformers.isValidFormat.duration('invalid')).toBe(false);
    });

    it('should validate focus format', () => {
      expect(dataTransformers.isValidFormat.focus('strength')).toBe(true);
      expect(dataTransformers.isValidFormat.focus({
        focus: 'cardio',
        intensity: 'moderate'
      })).toBe(true);
      expect(dataTransformers.isValidFormat.focus(123)).toBe(false);
    });
  });
});

describe('Legacy Transformers', () => {
  describe('convertLegacyFormat', () => {
    it('should convert legacy format to new format', () => {
      const legacyData = {
        energy: 4,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 45,
        equipment: ['Dumbbells'],
        areas: ['chest']
      };
      const result = legacyTransformers.convertLegacyFormat(legacyData);
      expect(result).toEqual({
        customization_energy: 4,
        customization_soreness: ['legs', 'back'],
        customization_focus: 'strength',
        customization_duration: 45,
        customization_equipment: ['Dumbbells'],
        customization_areas: ['chest']
      });
    });

    it('should handle legacy soreness object format', () => {
      const legacyData = {
        soreness: {
          legs: true,
          back: false,
          arms: true
        }
      };
      const result = legacyTransformers.convertLegacyFormat(legacyData);
      expect(result.customization_soreness).toEqual(['legs', 'arms']);
    });

    it('should provide defaults for missing values', () => {
      const legacyData = {};
      const result = legacyTransformers.convertLegacyFormat(legacyData);
      expect(result).toEqual({});
    });
  });

  describe('convertToLegacyFormat', () => {
    it('should convert new format to legacy format', () => {
      const newData = {
        customization_energy: 4,
        customization_soreness: ['legs', 'back'],
        customization_focus: 'strength',
        customization_duration: 45,
        customization_equipment: ['Dumbbells'],
        customization_areas: ['chest']
      };
      const result = legacyTransformers.convertToLegacyFormat(newData);
      expect(result).toEqual({
        energy: 4,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 45,
        equipment: ['Dumbbells'],
        areas: ['chest']
      });
    });
  });
}); 