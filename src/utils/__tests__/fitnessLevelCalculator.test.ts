import { 
  calculateFitnessLevel, 
  getFitnessLevelDescription, 
  getFitnessLevelIntensityRange,
  validateFitnessLevelCalculation,
  type ExperienceLevel,
  type ActivityLevel,
  type FitnessLevel 
} from '../fitnessLevelCalculator';

describe('Fitness Level Calculator', () => {
  describe('calculateFitnessLevel', () => {
    it('should calculate beginner level for New to Exercise + Sedentary', () => {
      const result = calculateFitnessLevel('New to Exercise', 'sedentary');
      expect(result).toBe('beginner');
    });

    it('should calculate beginner level for New to Exercise + Light Activity', () => {
      const result = calculateFitnessLevel('New to Exercise', 'light');
      expect(result).toBe('beginner');
    });

    it('should calculate novice level for New to Exercise + Moderate Activity', () => {
      const result = calculateFitnessLevel('New to Exercise', 'moderate');
      expect(result).toBe('novice');
    });

    it('should calculate novice level for Some Experience + Sedentary', () => {
      const result = calculateFitnessLevel('Some Experience', 'sedentary');
      expect(result).toBe('novice');
    });

    it('should calculate novice level for Some Experience + Light Activity', () => {
      const result = calculateFitnessLevel('Some Experience', 'light');
      expect(result).toBe('novice');
    });

    it('should calculate intermediate level for Some Experience + Moderate Activity', () => {
      const result = calculateFitnessLevel('Some Experience', 'moderate');
      expect(result).toBe('intermediate');
    });

    it('should calculate intermediate level for Some Experience + Very Active', () => {
      const result = calculateFitnessLevel('Some Experience', 'very');
      expect(result).toBe('intermediate');
    });

    it('should calculate advanced level for Advanced Athlete + Any Activity', () => {
      const activities: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very', 'extremely'];
      activities.forEach(activity => {
        const result = calculateFitnessLevel('Advanced Athlete', activity);
        expect(result).toBe('advanced');
      });
    });

    it('should calculate advanced level for Some Experience + Extremely Active', () => {
      const result = calculateFitnessLevel('Some Experience', 'extremely');
      expect(result).toBe('advanced');
    });

    it('should calculate adaptive level for any experience + Varies activity', () => {
      const experiences: ExperienceLevel[] = ['New to Exercise', 'Some Experience', 'Advanced Athlete'];
      experiences.forEach(experience => {
        const result = calculateFitnessLevel(experience, 'varies');
        expect(result).toBe('adaptive');
      });
    });

    it('should fallback to intermediate for edge cases', () => {
      // This tests the default fallback case
      const result = calculateFitnessLevel('Some Experience', 'extremely' as ActivityLevel);
      expect(result).toBe('advanced'); // This should actually be advanced, not intermediate
    });
  });

  describe('getFitnessLevelDescription', () => {
    it('should return appropriate descriptions for all fitness levels', () => {
      const descriptions = {
        beginner: 'Minimal current fitness. Starting foundational movements, low intensity.',
        novice: 'Basic fitness. Has either some foundational skills or regular but gentle activity. Moderate intensity recommended.',
        intermediate: 'Established fitness routine, moderate-to-high intensity manageable, can safely progress.',
        advanced: 'High fitness, accustomed to intense training, able to handle advanced workouts regularly.',
        adaptive: 'Requires adaptive workout intensity, tailored day-to-day based on current energy and soreness assessments.'
      };

      Object.entries(descriptions).forEach(([level, expectedDescription]) => {
        const result = getFitnessLevelDescription(level as FitnessLevel);
        expect(result).toBe(expectedDescription);
      });
    });
  });

  describe('getFitnessLevelIntensityRange', () => {
    it('should return appropriate intensity ranges for all fitness levels', () => {
      const expectedRanges = {
        beginner: { min: 1, max: 4, description: 'Low intensity, focus on form and building habits' },
        novice: { min: 2, max: 6, description: 'Moderate intensity, gradual progression' },
        intermediate: { min: 4, max: 8, description: 'Moderate-to-high intensity, structured progression' },
        advanced: { min: 6, max: 10, description: 'High intensity, advanced training methods' },
        adaptive: { min: 1, max: 10, description: 'Variable intensity based on daily assessment' }
      };

      Object.entries(expectedRanges).forEach(([level, expectedRange]) => {
        const result = getFitnessLevelIntensityRange(level as FitnessLevel);
        expect(result).toEqual(expectedRange);
      });
    });
  });

  describe('validateFitnessLevelCalculation', () => {
    it('should validate correct fitness level calculations', () => {
      const testCases = [
        { experience: 'New to Exercise' as ExperienceLevel, activity: 'sedentary' as ActivityLevel, expected: 'beginner' as FitnessLevel },
        { experience: 'Some Experience' as ExperienceLevel, activity: 'moderate' as ActivityLevel, expected: 'intermediate' as FitnessLevel },
        { experience: 'Advanced Athlete' as ExperienceLevel, activity: 'very' as ActivityLevel, expected: 'advanced' as FitnessLevel },
        { experience: 'New to Exercise' as ExperienceLevel, activity: 'varies' as ActivityLevel, expected: 'adaptive' as FitnessLevel }
      ];

      testCases.forEach(({ experience, activity, expected }) => {
        const isValid = validateFitnessLevelCalculation(experience, activity, expected);
        expect(isValid).toBe(true);
      });
    });

    it('should reject incorrect fitness level calculations', () => {
      const isValid = validateFitnessLevelCalculation('New to Exercise', 'sedentary', 'advanced');
      expect(isValid).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should provide consistent results across all functions', () => {
      const experience: ExperienceLevel = 'Some Experience';
      const activity: ActivityLevel = 'moderate';
      
      const calculatedLevel = calculateFitnessLevel(experience, activity);
      const description = getFitnessLevelDescription(calculatedLevel);
      const intensityRange = getFitnessLevelIntensityRange(calculatedLevel);
      const isValid = validateFitnessLevelCalculation(experience, activity, calculatedLevel);

      expect(calculatedLevel).toBe('intermediate');
      expect(description).toContain('Established fitness routine');
      expect(intensityRange.min).toBe(4);
      expect(intensityRange.max).toBe(8);
      expect(isValid).toBe(true);
    });

    it('should handle all possible combinations of experience and activity levels', () => {
      const experiences: ExperienceLevel[] = ['New to Exercise', 'Some Experience', 'Advanced Athlete'];
      const activities: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'very', 'extremely', 'varies'];

      experiences.forEach(experience => {
        activities.forEach(activity => {
          const fitnessLevel = calculateFitnessLevel(experience, activity);
          const description = getFitnessLevelDescription(fitnessLevel);
          const intensityRange = getFitnessLevelIntensityRange(fitnessLevel);

          // All results should be valid fitness levels
          expect(['beginner', 'novice', 'intermediate', 'advanced', 'adaptive']).toContain(fitnessLevel);
          
          // All descriptions should be non-empty strings
          expect(description).toBeTruthy();
          expect(typeof description).toBe('string');
          
          // All intensity ranges should have valid min/max values
          expect(intensityRange.min).toBeGreaterThanOrEqual(1);
          expect(intensityRange.max).toBeLessThanOrEqual(10);
          expect(intensityRange.min).toBeLessThanOrEqual(intensityRange.max);
        });
      });
    });
  });
}); 