import { PromptDataTransformer } from '../../shared/utils/PromptDataTransformer';
import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/core';

// Mock the equipment filtering function
jest.mock('../../../../../utils/equipmentRecommendations', () => ({
  filterAvailableEquipment: jest.fn((focus: string, availableEquipment: string[], locations?: string[]) => {
    // Mock implementation that returns filtered equipment based on focus
    if (focus === 'strength' || focus === 'Quick Sweat') {
      return ['Dumbbells', 'Resistance Bands'];
    }
    return ['Body Weight'];
  })
}));

// Sample complete profile data (same as ReviewPage expects)
const completeProfileData: ProfileData = {
  // Experience & Activity
  experienceLevel: 'Some Experience',
  physicalActivity: 'moderate',
  calculatedFitnessLevel: 'intermediate',
  calculatedWorkoutIntensity: 'moderate',
  
  // Time & Commitment
  preferredDuration: '30-45 min',
  timeCommitment: '3-4',
  intensityLevel: 'moderately',
  
  // Preferences
  preferredActivities: ['Running/Jogging', 'Swimming'],
  availableLocations: ['Home', 'Gym'],
  availableEquipment: ['Dumbbells', 'Resistance Bands'],
  
  // Goals & Timeline
  primaryGoal: 'Strength',
  goalTimeline: '3 months',
  
  // Personal Information
  age: '26-35',
  height: '175',
  weight: '70',
  gender: 'male',
  
  // Health & Safety
  hasCardiovascularConditions: 'No',
  injuries: ['No Injuries']
};

const quickWorkoutData: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 30,
  customization_energy: 7,
  customization_soreness: {
    'Upper Body': { selected: false, rating: 0 },
    'Lower Body': { selected: true, rating: 3 }
  }
};

describe('PromptDataTransformer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transformProfileData', () => {
    it('should transform all 17 profile fields correctly', () => {
      const result = PromptDataTransformer.transformProfileData(completeProfileData);
      
      // Verify all profile fields are present and not "Not specified"
      expect(result.experienceLevel).toBe('Some Experience');
      expect(result.physicalActivity).toBe('moderate');
      expect(result.fitnessLevel).toBe('intermediate');
      expect(result.preferredDuration).toBe('30-45 min');
      expect(result.timeCommitment).toBe('3-4');
      expect(result.intensityLevel).toBe('moderately');
      expect(result.preferredActivities).toBe('Running/Jogging, Swimming');
      expect(result.availableLocations).toBe('Home, Gym');
      expect(result.availableEquipment).toEqual(['Dumbbells', 'Resistance Bands']);
      expect(result.primaryGoal).toBe('Strength');
      expect(result.goalTimeline).toBe('3 months');
      expect(result.age).toBe('26-35');
      expect(result.height).toBe('175');
      expect(result.weight).toBe('70');
      expect(result.gender).toBe('male');
      expect(result.hasCardiovascularConditions).toBe('No');
      expect(result.injuries).toBe('No Injuries');
    });

    it('should handle missing optional fields gracefully', () => {
      const incompleteProfile = {
        experienceLevel: 'New to Exercise',
        primaryGoal: 'Weight Loss'
      } as ProfileData;

      const result = PromptDataTransformer.transformProfileData(incompleteProfile);
      
      // Should still have core fields
      expect(result.experienceLevel).toBe('New to Exercise');
      expect(result.primaryGoal).toBe('Weight Loss');
      
      // Missing fields should have sensible defaults, not "Not specified"
      expect(result.availableEquipment).toEqual(['Body Weight']);
      expect(result.injuries).toBe('No Injuries');
    });
  });

  describe('transformWorkoutFocusData', () => {
    it('should transform workout focus data correctly', () => {
      const result = PromptDataTransformer.transformWorkoutFocusData(quickWorkoutData);
      
      expect(result.energyLevel).toBe(7);
      expect(result.duration).toBe(30);
      expect(result.focus).toBe('strength');
      expect(result.sorenessAreas).toContain('Lower Body (Level 3)');
      expect(result.equipment).toEqual(['Body Weight']); // Default when not specified
    });

    it('should handle complex soreness data', () => {
      const complexSoreness: PerWorkoutOptions = {
        ...quickWorkoutData,
        customization_soreness: {
          'Upper Body': { selected: true, rating: 2 },
          'Lower Body': { selected: true, rating: 4 },
          'Core': { selected: false, rating: 0 }
        }
      };

      const result = PromptDataTransformer.transformWorkoutFocusData(complexSoreness);
      
      expect(result.sorenessAreas).toHaveLength(2);
      expect(result.sorenessAreas).toContain('Upper Body (Level 2)');
      expect(result.sorenessAreas).toContain('Lower Body (Level 4)');
      expect(result.sorenessAreas).not.toContain('Core');
    });
  });

  describe('transformToPromptVariables', () => {
    it('should combine all data sources correctly with equipment filtering', () => {
      const result = PromptDataTransformer.transformToPromptVariables(
        completeProfileData,
        quickWorkoutData,
        { additionalContext: 'test' }
      );
      
      // Should have profile data
      expect(result.experienceLevel).toBe('Some Experience');
      expect(result.primaryGoal).toBe('Strength');
      
      // Should have workout data
      expect(result.energyLevel).toBe(7);
      expect(result.focus).toBe('strength');
      
      // Should have filtered equipment (not raw equipment)
      expect(result.equipment).toEqual(['Dumbbells', 'Resistance Bands']);
      
      // Should have additional context
      expect(result.additionalContext).toBe('test');
      
      // Should have defaults for optional fields
      expect(result.location).toBeDefined();
      expect(result.weather).toBe('indoor');
      expect(result.temperature).toBe('comfortable');
    });

    it('should fallback to Body Weight when equipment filtering fails', () => {
      const incompleteWorkoutData: PerWorkoutOptions = {
        customization_focus: '', // Empty focus should trigger fallback
        customization_duration: 30,
        customization_energy: 7
      };

      const result = PromptDataTransformer.transformToPromptVariables(
        completeProfileData,
        incompleteWorkoutData
      );
      
      // Should fallback to Body Weight when filtering fails
      expect(result.equipment).toEqual(['Body Weight']);
    });
  });

  describe('validatePromptVariables', () => {
    it('should validate complete data successfully', () => {
      const variables = PromptDataTransformer.transformToPromptVariables(
        completeProfileData,
        quickWorkoutData
      );
      
      const validation = PromptDataTransformer.validatePromptVariables(variables);
      
      expect(validation.isValid).toBe(true);
      expect(validation.missingRequired).toHaveLength(0);
      expect(validation.populatedFields).toBeGreaterThan(15); // Should have most fields populated
      const coverage = (validation.populatedFields / validation.totalFields) * 100;
      expect(coverage).toBeGreaterThan(80); // Should have high coverage
    });

    it('should detect missing required fields', () => {
      const incompleteVariables = {
        experienceLevel: 'Some Experience',
        // Missing required fields: fitnessLevel, primaryGoal, energyLevel, duration, focus, equipment
      };
      
      const validation = PromptDataTransformer.validatePromptVariables(incompleteVariables);
      
      expect(validation.isValid).toBe(false);
      expect(validation.missingRequired.length).toBeGreaterThan(0);
      expect(validation.missingRequired).toContain('fitnessLevel');
      expect(validation.missingRequired).toContain('primaryGoal');
    });
  });

  describe('Error handling', () => {
    it('should throw meaningful error for null profile data', () => {
      expect(() => {
        PromptDataTransformer.transformProfileData(null as any);
      }).toThrow('ProfileData is required for workout generation');
    });

    it('should throw meaningful error for null workout data', () => {
      expect(() => {
        PromptDataTransformer.transformWorkoutFocusData(null as any);
      }).toThrow('WorkoutFocusData is required for workout generation');
    });
  });

  describe('Integration with ValidationService compatibility', () => {
    it('should work with the same data that passes ReviewPage validation', () => {
      // This test ensures that data that passes ReviewPage validation
      // will also transform correctly for prompt generation
      
      const variables = PromptDataTransformer.transformToPromptVariables(
        completeProfileData,
        quickWorkoutData
      );
      
      const validation = PromptDataTransformer.validatePromptVariables(variables);
      
      // If ReviewPage says data is complete, transformation should be valid
      expect(validation.isValid).toBe(true);
      
      // All profile fields should be populated (not "Not specified")
      expect(Object.values(variables).filter(v => v === 'Not specified')).toHaveLength(0);
      
      // Equipment should be filtered (not just default)
      expect(variables.equipment).toEqual(['Dumbbells', 'Resistance Bands']);
      
      // Debug output for manual verification
      console.log('🔍 Integration Test Results:', {
        populatedFields: validation.populatedFields,
        totalFields: validation.totalFields,
        coverage: `${((validation.populatedFields / validation.totalFields) * 100).toFixed(1)}%`,
        missingRequired: validation.missingRequired,
        filteredEquipment: variables.equipment
      });
    });
  });
}); 