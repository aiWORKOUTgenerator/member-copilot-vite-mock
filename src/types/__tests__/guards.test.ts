import {
  isSimpleDuration,
  isDurationConfig,
  isSimpleFocus,
  isFocusConfig,
  isSimpleEquipment,
  isEquipmentConfig,
  isCategoryRatingData,
  extractDurationValue,
  extractFocusValue,
  extractEquipmentList,
  extractSorenessAreas,
  normalizePerWorkoutOptions,
  hasValidData,
  isValidProfileData
} from '../guards';

describe('Type Guards', () => {
  describe('Duration Guards', () => {
    it('should correctly identify simple duration', () => {
      expect(isSimpleDuration(30)).toBe(true);
      expect(isSimpleDuration(45.5)).toBe(true);
      expect(isSimpleDuration('30')).toBe(false);
      expect(isSimpleDuration({ totalDuration: 30 })).toBe(false);
      expect(isSimpleDuration(null)).toBe(false);
      expect(isSimpleDuration(undefined)).toBe(false);
    });

    it('should correctly identify duration config', () => {
      const validConfig = {
        selected: true,
        totalDuration: 45,
        label: '45 minutes',
        value: 45,
        workingTime: 35,
        configuration: 'duration-only' as const,
        warmUp: { included: false, duration: 0, type: 'dynamic' as const },
        coolDown: { included: false, duration: 0, type: 'static_stretch' as const }
      };
      
      expect(isDurationConfig(validConfig)).toBe(true);
      expect(isDurationConfig(30)).toBe(false);
      expect(isDurationConfig({ totalDuration: 30 })).toBe(false);
    });

    it('should extract duration value correctly', () => {
      expect(extractDurationValue(30)).toBe(30);
      expect(extractDurationValue({
        selected: true,
        totalDuration: 45,
        label: '45 minutes',
        value: 45,
        workingTime: 35,
        configuration: 'duration-only' as const,
        warmUp: { included: false, duration: 0, type: 'dynamic' as const },
        coolDown: { included: false, duration: 0, type: 'static_stretch' as const }
      })).toBe(45);
      expect(extractDurationValue(undefined)).toBe(undefined);
    });
  });

  describe('Focus Guards', () => {
    it('should correctly identify simple focus', () => {
      expect(isSimpleFocus('strength')).toBe(true);
      expect(isSimpleFocus('')).toBe(false);
      expect(isSimpleFocus(123)).toBe(false);
      expect(isSimpleFocus({ focus: 'strength' })).toBe(false);
    });

    it('should correctly identify focus config', () => {
      const validConfig = {
        selected: true,
        focus: 'strength',
        focusLabel: 'Strength Training',
        label: 'Strength Training',
        value: 'strength',
        description: 'Build muscle and strength',
        configuration: 'focus-only',
        metadata: {
          intensity: 'high',
          equipment: 'moderate',
          experience: 'some experience'
        }
      };
      
      expect(isFocusConfig(validConfig)).toBe(true);
      expect(isFocusConfig('strength')).toBe(false);
    });

    it('should extract focus value correctly', () => {
      expect(extractFocusValue('strength')).toBe('strength');
      expect(extractFocusValue({
        selected: true,
        focus: 'cardio',
        focusLabel: 'Cardio Training',
        label: 'Cardio Training',
        value: 'cardio',
        description: 'Improve cardiovascular fitness',
        configuration: 'focus-only',
        metadata: {
          intensity: 'moderate',
          equipment: 'minimal',
          experience: 'new to exercise'
        }
      })).toBe('cardio');
      expect(extractFocusValue(undefined)).toBe(undefined);
    });
  });

  describe('Equipment Guards', () => {
    it('should correctly identify simple equipment', () => {
      expect(isSimpleEquipment(['Dumbbells', 'Barbell'])).toBe(true);
      expect(isSimpleEquipment([])).toBe(true);
      expect(isSimpleEquipment(['Dumbbells', 123])).toBe(false);
      expect(isSimpleEquipment('Dumbbells')).toBe(false);
    });

    it('should correctly identify equipment config', () => {
      const validConfig = {
        contexts: ['Weight Training'],
        specificEquipment: ['Dumbbells', 'Barbell'],
        location: 'Home'
      };
      
      expect(isEquipmentConfig(validConfig)).toBe(true);
      expect(isEquipmentConfig(['Dumbbells'])).toBe(false);
    });

    it('should extract equipment list correctly', () => {
      expect(extractEquipmentList(['Dumbbells', 'Barbell'])).toEqual(['Dumbbells', 'Barbell']);
      expect(extractEquipmentList({
        contexts: ['Weight Training'],
        specificEquipment: ['Kettlebells', 'Resistance Bands'],
        location: 'Gym'
      })).toEqual(['Kettlebells', 'Resistance Bands']);
      expect(extractEquipmentList(undefined)).toEqual([]);
    });
  });

  describe('Category Rating Data Guards', () => {
    it('should correctly identify category rating data', () => {
      const validData = {
        'Upper Body': {
          selected: true,
          rating: 3,
          label: 'Upper Body'
        },
        'Lower Body': {
          selected: false,
          rating: 1,
          label: 'Lower Body'
        }
      };
      
      expect(isCategoryRatingData(validData)).toBe(true);
      expect(isCategoryRatingData(['Upper Body'])).toBe(false);
      expect(isCategoryRatingData({})).toBe(true);
    });

    it('should extract soreness areas correctly', () => {
      expect(extractSorenessAreas(['Upper Body', 'Lower Body'])).toEqual(['Upper Body', 'Lower Body']);
      expect(extractSorenessAreas({
        'Upper Body': { selected: true, rating: 3, label: 'Upper Body' },
        'Lower Body': { selected: false, rating: 1, label: 'Lower Body' },
        'Core': { selected: true, rating: 2, label: 'Core' }
      })).toEqual(['Upper Body', 'Core']);
      expect(extractSorenessAreas(undefined)).toEqual([]);
    });
  });

  describe('PerWorkoutOptions Utilities', () => {
    it('should normalize PerWorkoutOptions correctly', () => {
      const options = {
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['Dumbbells'],
        customization_soreness: {
          'Upper Body': { selected: true, rating: 3, label: 'Upper Body' }
        },
        customization_energy: 4
      };
      
      const normalized = normalizePerWorkoutOptions(options);
      
      expect(normalized.duration).toBe(45);
      expect(normalized.focus).toBe('strength');
      expect(normalized.equipment).toEqual(['Dumbbells']);
      expect(normalized.soreness).toEqual(['Upper Body']);
      expect(normalized.energy).toBe(4);
    });

    it('should check if PerWorkoutOptions has valid data', () => {
      expect(hasValidData({})).toBe(false);
      expect(hasValidData({ customization_duration: 30 })).toBe(true);
      expect(hasValidData({ customization_focus: 'strength' })).toBe(true);
      expect(hasValidData({ customization_equipment: ['Dumbbells'] })).toBe(true);
      expect(hasValidData({ customization_soreness: { 'Upper Body': { selected: true, rating: 3, label: 'Upper Body' } } })).toBe(true);
    });
  });
}); 

describe('ProfileData Type Guards', () => {
  test('should validate complete ProfileData', () => {
    const completeProfileData = {
      experienceLevel: 'New to Exercise',
      physicalActivity: 'sedentary',
      preferredDuration: '30-45 min',
      timeCommitment: '2-3',
      intensityLevel: 'lightly',
      preferredActivities: ['Walking/Power Walking'],
      availableLocations: ['Home'],
      availableEquipment: ['Body Weight'],
      primaryGoal: 'General Health',
      goalTimeline: '3 months',
      age: '26-35',
      height: '5\'8"',
      weight: '150 lbs',
      gender: 'male',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
    
    expect(isValidProfileData(completeProfileData)).toBe(true);
  });

  test('should validate partial ProfileData with empty values', () => {
    const partialProfileData = {
      experienceLevel: '',
      physicalActivity: '',
      preferredDuration: '',
      timeCommitment: '',
      intensityLevel: '',
      preferredActivities: [],
      availableLocations: [],
      availableEquipment: [],
      primaryGoal: '',
      goalTimeline: '',
      age: '',
      height: '',
      weight: '',
      gender: '',
      hasCardiovascularConditions: '',
      injuries: []
    };
    
    expect(isValidProfileData(partialProfileData)).toBe(true);
  });

  test('should validate ProfileData with some fields filled', () => {
    const mixedProfileData = {
      experienceLevel: 'Some Experience',
      physicalActivity: 'moderate',
      preferredDuration: '45-60 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      preferredActivities: ['Running/Jogging', 'Yoga'],
      availableLocations: ['Gym', 'Home'],
      availableEquipment: ['Dumbbells', 'Resistance Bands'],
      primaryGoal: 'Strength',
      goalTimeline: '6 months',
      age: '36-45',
      height: '',
      weight: '',
      gender: 'prefer-not-to-say',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
    
    expect(isValidProfileData(mixedProfileData)).toBe(true);
  });

  test('should reject ProfileData with invalid values', () => {
    const invalidProfileData = {
      experienceLevel: 'Invalid Level',
      physicalActivity: 'sedentary',
      preferredDuration: '30-45 min',
      timeCommitment: '2-3',
      intensityLevel: 'lightly',
      preferredActivities: ['Walking/Power Walking'],
      availableLocations: ['Home'],
      availableEquipment: ['Body Weight'],
      primaryGoal: 'General Health',
      goalTimeline: '3 months',
      age: '26-35',
      height: '5\'8"',
      weight: '150 lbs',
      gender: 'male',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
    
    expect(isValidProfileData(invalidProfileData)).toBe(false);
  });

  test('should reject ProfileData missing required fields', () => {
    const incompleteProfileData = {
      experienceLevel: 'New to Exercise',
      // Missing physicalActivity
      preferredDuration: '30-45 min',
      timeCommitment: '2-3',
      intensityLevel: 'lightly',
      preferredActivities: ['Walking/Power Walking'],
      availableLocations: ['Home'],
      availableEquipment: ['Body Weight'],
      primaryGoal: 'General Health',
      goalTimeline: '3 months',
      age: '26-35',
      height: '5\'8"',
      weight: '150 lbs',
      gender: 'male',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
    
    expect(isValidProfileData(incompleteProfileData)).toBe(false);
  });
}); 