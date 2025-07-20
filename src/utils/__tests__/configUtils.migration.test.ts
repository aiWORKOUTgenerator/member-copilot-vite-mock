import { mapExperienceLevelToFitnessLevel, mapFitnessLevelToExperienceLevel } from '../configUtils';

describe('Experience Level Migration', () => {
  describe('mapExperienceLevelToFitnessLevel', () => {
    it('should migrate legacy "Beginner" to "new to exercise"', () => {
      const result = mapExperienceLevelToFitnessLevel('Beginner');
      expect(result).toBe('new to exercise');
    });

    it('should handle valid experience levels correctly', () => {
      expect(mapExperienceLevelToFitnessLevel('New to Exercise')).toBe('new to exercise');
      expect(mapExperienceLevelToFitnessLevel('Some Experience')).toBe('some experience');
      expect(mapExperienceLevelToFitnessLevel('Advanced Athlete')).toBe('advanced athlete');
    });

    it('should handle case variations', () => {
      expect(mapExperienceLevelToFitnessLevel('NEW TO EXERCISE')).toBe('new to exercise');
      expect(mapExperienceLevelToFitnessLevel('some experience')).toBe('some experience');
      expect(mapExperienceLevelToFitnessLevel('ADVANCED ATHLETE')).toBe('advanced athlete');
    });

    it('should default to "some experience" for unknown values', () => {
      const result = mapExperienceLevelToFitnessLevel('Unknown Level');
      expect(result).toBe('some experience');
    });
  });

  describe('mapFitnessLevelToExperienceLevel', () => {
    it('should handle legacy "beginner" fitness level', () => {
      const result = mapFitnessLevelToExperienceLevel('beginner');
      expect(result).toBe('New to Exercise');
    });

    it('should map fitness levels to correct UI experience levels', () => {
      expect(mapFitnessLevelToExperienceLevel('new to exercise')).toBe('New to Exercise');
      expect(mapFitnessLevelToExperienceLevel('some experience')).toBe('Some Experience');
      expect(mapFitnessLevelToExperienceLevel('advanced athlete')).toBe('Advanced Athlete');
    });

    it('should handle case variations', () => {
      expect(mapFitnessLevelToExperienceLevel('NEW TO EXERCISE')).toBe('New to Exercise');
      expect(mapFitnessLevelToExperienceLevel('SOME EXPERIENCE')).toBe('Some Experience');
      expect(mapFitnessLevelToExperienceLevel('ADVANCED ATHLETE')).toBe('Advanced Athlete');
    });

    it('should default to "Some Experience" for unknown values', () => {
      const result = mapFitnessLevelToExperienceLevel('unknown level');
      expect(result).toBe('Some Experience');
    });
  });
}); 