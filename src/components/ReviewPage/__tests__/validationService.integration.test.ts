import { ValidationService } from '../utils/validationService';
import { ProfileData } from '../../Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';

// Sample test data
const sampleProfileData: ProfileData = {
  experienceLevel: 'Some Experience',
  primaryGoal: 'Strength',
  physicalActivity: 'moderate',
  preferredDuration: '30-45 min',
  timeCommitment: '3-4',
  intensityLevel: 'moderately',
  goalTimeline: '3 months',
  preferredActivities: ['Running/Jogging', 'Swimming'],
  availableEquipment: ['Dumbbells', 'Resistance Bands'],
  availableLocations: ['Home', 'Gym'],
  age: '26-35',
  height: '175',
  weight: '70',
  gender: 'male',
  hasCardiovascularConditions: 'No',
  injuries: ['No Injuries']
};

const sampleQuickWorkoutData: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 30,
  customization_energy: 7
};

const sampleDetailedWorkoutData: PerWorkoutOptions = {
  customization_focus: 'strength',
  customization_duration: 45,
  customization_energy: 8,
  customization_areas: ['Upper Body', 'Lower Body'],
  customization_equipment: ['Dumbbells', 'Resistance Bands']
};

// Mock navigation function
const mockOnNavigate = jest.fn();

describe('ValidationService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quick Workout Validation', () => {
    it('should validate complete quick workout data successfully', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.summary.errors).toBe(0);
      expect(result.summary.warnings).toBe(0);
      expect(result.summary.info).toBe(0);
    });

    it('should detect missing focus in quick workout', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_duration: 30,
        customization_energy: 7
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.summary.errors).toBe(1);
      expect(result.issues.some(issue => 
        issue.field === 'Workout Focus' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should detect missing duration in quick workout', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength',
        customization_energy: 7
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.summary.errors).toBe(1);
      expect(result.issues.some(issue => 
        issue.field === 'Workout Duration' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should detect missing energy level in quick workout', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength',
        customization_duration: 30
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.summary.errors).toBe(1);
      expect(result.issues.some(issue => 
        issue.field === 'Energy Level' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should provide actionable guidance for quick workout issues', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength'
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'quick',
        mockOnNavigate
      );

      const durationIssue = result.issues.find(issue => issue.field === 'Workout Duration');
      expect(durationIssue?.action).toBeDefined();
      expect(durationIssue?.action?.label).toBe('Set Duration');
      expect(durationIssue?.helpText).toContain('Duration helps us structure');
    });
  });

  describe('Detailed Workout Validation', () => {
    it('should validate complete detailed workout data successfully', () => {
      const result = ValidationService.validateWorkoutData(
        sampleDetailedWorkoutData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true);
      // May have info messages for high energy level, which is expected
      expect(result.summary.errors).toBe(0);
    });

    it('should detect missing focus areas in detailed workout', () => {
      const incompleteData: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_areas: undefined
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Focus Areas' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should detect missing equipment in detailed workout', () => {
      const incompleteData: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_equipment: undefined
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Equipment' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should handle complex data structures for focus areas', () => {
      const hierarchicalAreas = ['Upper Body', 'Core'];

      const detailedData: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_areas: hierarchicalAreas
      };

      const result = ValidationService.validateWorkoutData(
        detailedData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true);
    });

    it('should handle complex data structures for equipment', () => {
      const equipmentData = {
        location: 'home',
        contexts: ['strength'],
        specificEquipment: ['Dumbbells', 'Resistance Bands']
      };

      const detailedData: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_equipment: equipmentData
      };

      const result = ValidationService.validateWorkoutData(
        detailedData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true);
    });

    it('should warn about too many focus areas', () => {
      const tooManyAreas: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_areas: ['Upper Body', 'Lower Body', 'Core', 'Cardio', 'Back', 'Shoulders']
      };

      const result = ValidationService.validateWorkoutData(
        tooManyAreas,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true); // Still valid, but with warning
      expect(result.issues.some(issue => 
        issue.field === 'Focus Areas' && 
        issue.severity === 'warning' &&
        issue.message.includes('Too many focus areas')
      )).toBe(true);
    });
  });

  describe('Profile Validation', () => {
    it('should detect missing profile data', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        null,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Profile Information' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should detect missing experience level', () => {
      const incompleteProfile = {
        ...sampleProfileData,
        experienceLevel: undefined
      };

      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        incompleteProfile as any,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Experience Level' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should detect missing primary goal', () => {
      const incompleteProfile = {
        ...sampleProfileData,
        primaryGoal: undefined
      };

      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        incompleteProfile as any,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Primary Goal' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should provide navigation actions for profile issues', () => {
      const result = ValidationService.validateWorkoutData(
        sampleQuickWorkoutData,
        null,
        'quick',
        mockOnNavigate
      );

      const profileIssue = result.issues.find(issue => issue.field === 'Profile Information');
      expect(profileIssue?.action).toBeDefined();
      expect(profileIssue?.action?.label).toBe('Complete Profile');
    });
  });

  describe('Duration Validation', () => {
    it('should warn about very short detailed workouts', () => {
      const shortWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_duration: 10
      };

      const result = ValidationService.validateWorkoutData(
        shortWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Duration' && 
        issue.severity === 'warning' &&
        issue.message.includes('at least 15 minutes')
      )).toBe(true);
    });

    it('should warn about very long workouts', () => {
      const longWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_duration: 120
      };

      const result = ValidationService.validateWorkoutData(
        longWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Duration' && 
        issue.severity === 'warning' &&
        issue.message.includes('longer than 90 minutes')
      )).toBe(true);
    });

    it('should not warn about reasonable durations', () => {
      const reasonableWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_duration: 45
      };

      const result = ValidationService.validateWorkoutData(
        reasonableWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Duration' && 
        issue.severity === 'warning'
      )).toBe(false);
    });
  });

  describe('Energy Level Validation', () => {
    it('should warn about low energy levels', () => {
      const lowEnergyWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_energy: 2
      };

      const result = ValidationService.validateWorkoutData(
        lowEnergyWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Energy Level' && 
        issue.severity === 'warning' &&
        issue.message.includes('Low energy level')
      )).toBe(true);
    });

    it('should provide info for high energy levels', () => {
      const highEnergyWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_energy: 9
      };

      const result = ValidationService.validateWorkoutData(
        highEnergyWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Energy Level' && 
        issue.severity === 'info' &&
        issue.message.includes('High energy level')
      )).toBe(true);
    });

    it('should not warn about moderate energy levels', () => {
      const moderateEnergyWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_energy: 5
      };

      const result = ValidationService.validateWorkoutData(
        moderateEnergyWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Energy Level' && 
        (issue.severity === 'warning' || issue.severity === 'info')
      )).toBe(false);
    });
  });

  describe('Cross-Component Validation', () => {
    it('should warn about high energy with long duration', () => {
      const intenseWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_duration: 90,
        customization_energy: 9
      };

      const result = ValidationService.validateWorkoutData(
        intenseWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Intensity' && 
        issue.severity === 'warning' &&
        issue.message.includes('overtraining')
      )).toBe(true);
    });

    it('should warn about low energy with long duration', () => {
      const fatiguedWorkout: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_duration: 60,
        customization_energy: 2
      };

      const result = ValidationService.validateWorkoutData(
        fatiguedWorkout,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Workout Intensity' && 
        issue.severity === 'warning' &&
        issue.message.includes('Low energy with long duration')
      )).toBe(true);
    });

    it('should warn about strength focus with body weight only', () => {
      const bodyWeightStrength: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_equipment: ['Body Weight']
      };

      const result = ValidationService.validateWorkoutData(
        bodyWeightStrength,
        sampleProfileData,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Equipment' && 
        issue.severity === 'warning' &&
        issue.message.includes('Body weight-only training')
      )).toBe(true);
    });

    it('should provide info for beginners doing strength training', () => {
      const beginnerProfile: ProfileData = {
        ...sampleProfileData,
        experienceLevel: 'New to Exercise'
      };

      const result = ValidationService.validateWorkoutData(
        sampleDetailedWorkoutData,
        beginnerProfile,
        'detailed'
      );

      expect(result.issues.some(issue => 
        issue.field === 'Experience Level' && 
        issue.severity === 'info' &&
        issue.message.includes('form and progression')
      )).toBe(true);
    });
  });

  describe('Navigation Integration', () => {
    it('should provide navigation actions for all validation issues', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength'
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        null,
        'detailed',
        mockOnNavigate
      );

      // Check that all error issues have navigation actions
      const errorIssues = result.issues.filter(issue => issue.severity === 'error');
      errorIssues.forEach(issue => {
        expect(issue.action).toBeDefined();
        expect(issue.action?.onClick).toBeDefined();
      });
    });

    it('should call navigation function when action is triggered', () => {
      const incompleteData: PerWorkoutOptions = {
        customization_focus: 'strength'
      };

      const result = ValidationService.validateWorkoutData(
        incompleteData,
        null,
        'detailed',
        mockOnNavigate
      );

      const profileIssue = result.issues.find(issue => issue.field === 'Profile Information');
      if (profileIssue?.action) {
        profileIssue.action.onClick();
        expect(mockOnNavigate).toHaveBeenCalledWith('profile');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined workout data gracefully', () => {
      const result = ValidationService.validateWorkoutData(
        null,
        sampleProfileData,
        'quick'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Workout Preferences' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should handle empty arrays for areas and equipment', () => {
      const emptyArrays: PerWorkoutOptions = {
        ...sampleDetailedWorkoutData,
        customization_areas: [],
        customization_equipment: []
      };

      const result = ValidationService.validateWorkoutData(
        emptyArrays,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => 
        issue.field === 'Focus Areas' && 
        issue.severity === 'error'
      )).toBe(true);
      expect(result.issues.some(issue => 
        issue.field === 'Equipment' && 
        issue.severity === 'error'
      )).toBe(true);
    });

    it('should handle complex nested data structures', () => {
      const complexData: PerWorkoutOptions = {
        customization_focus: 'strength',
        customization_duration: 45,
        customization_energy: 7,
        customization_areas: ['Upper Body', 'Lower Body'],
        customization_equipment: ['Dumbbells']
      };

      const result = ValidationService.validateWorkoutData(
        complexData,
        sampleProfileData,
        'detailed'
      );

      expect(result.isValid).toBe(true);
    });
  });
}); 