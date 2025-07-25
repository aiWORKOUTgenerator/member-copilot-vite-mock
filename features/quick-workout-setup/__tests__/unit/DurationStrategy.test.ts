// QuickWorkoutSetup Feature - DurationStrategy Unit Tests
import { DurationStrategy } from '../../workflow/DurationStrategy';
import { QuickWorkoutParams } from '../../types/quick-workout.types';
import { UserProfile } from '../../../../../types';

describe('DurationStrategy', () => {
  let strategy: DurationStrategy;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    strategy = new DurationStrategy();
    mockUserProfile = {
      fitnessLevel: 'some experience',
      goals: ['general fitness'],
      basicLimitations: {
        availableEquipment: [],
        timeConstraints: 30
      }
    } as UserProfile;
  });

  describe('selectStrategy', () => {
    it('should select exact duration when supported', () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);

      expect(result.adjustedDuration).toBe(30);
      expect(result.isExactMatch).toBe(true);
      expect(result.config.duration).toBe(30);
    });

    it('should adjust to closest supported duration', () => {
      const params: QuickWorkoutParams = {
        duration: 25, // Not directly supported
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);

      expect(result.adjustedDuration).toBe(20); // Closest supported
      expect(result.isExactMatch).toBe(false);
      expect(result.adjustmentReason).toContain('25min not directly supported');
    });

    it('should adjust duration down for low energy', () => {
      const params: QuickWorkoutParams = {
        duration: 45,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 2, // Very low energy
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);

      expect(result.adjustedDuration).toBeLessThan(45);
      expect(result.adjustmentReason).toContain('low energy');
    });

    it('should adjust duration for high soreness', () => {
      const params: QuickWorkoutParams = {
        duration: 45,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: ['legs', 'arms', 'back'], // High soreness
        equipment: []
      };

      const result = strategy.selectStrategy(params);

      expect(result.adjustedDuration).toBeLessThanOrEqual(45);
      expect(result.adjustmentReason).toContain('high soreness');
    });

    it('should cap duration for beginners', () => {
      const params: QuickWorkoutParams = {
        duration: 45,
        fitnessLevel: 'new to exercise',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);

      expect(result.adjustedDuration).toBeLessThanOrEqual(30);
    });

    it('should generate appropriate recommendations', () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 8, // High energy
        sorenessAreas: [],
        equipment: ['Dumbbells']
      };

      const result = strategy.selectStrategy(params);

      expect(result.recommendations).toContain('High energy level');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('validateStrategy', () => {
    it('should validate correct strategy result', () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);
      const isValid = strategy.validateStrategy(result, params);

      expect(isValid).toBe(true);
    });

    it('should reject invalid duration', () => {
      const invalidResult = {
        config: { duration: 99 } as any,
        adjustedDuration: 99,
        isExactMatch: false,
        recommendations: [],
        alternativeOptions: []
      };

      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const isValid = strategy.validateStrategy(invalidResult, params);

      expect(isValid).toBe(false);
    });
  });

  describe('createDurationOptimization', () => {
    it('should create optimization info with correct phase allocation', () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = strategy.selectStrategy(params);
      const optimization = strategy.createDurationOptimization(params, result);

      expect(optimization.requestedDuration).toBe(30);
      expect(optimization.actualDuration).toBe(30);
      expect(optimization.isOptimal).toBe(true);
      expect(optimization.phaseAllocation.warmup).toBeGreaterThan(0);
      expect(optimization.phaseAllocation.main).toBeGreaterThan(0);
      expect(optimization.phaseAllocation.cooldown).toBeGreaterThan(0);
    });
  });

  describe('getSupportedDurations', () => {
    it('should return all supported durations', () => {
      const durations = strategy.getSupportedDurations();

      expect(durations).toEqual([5, 10, 15, 20, 30, 45]);
    });
  });
}); 