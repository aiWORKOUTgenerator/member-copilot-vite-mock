// QuickWorkoutSetup Feature - Integration Tests
import { QuickWorkoutFeature } from '../../QuickWorkoutFeature';
import { OpenAIService } from '../../../OpenAIService';
import { QuickWorkoutParams } from '../../types/quick-workout.types';
import { UserProfile } from '../../../../../types';

// Mock OpenAI Service
jest.mock('../../../OpenAIService');

describe('QuickWorkoutFeature Integration', () => {
  let feature: QuickWorkoutFeature;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    mockOpenAIService = new OpenAIService() as jest.Mocked<OpenAIService>;
    
    // Mock successful AI response
    mockOpenAIService.generateFromTemplate.mockResolvedValue({
      id: 'workout_123',
      title: 'Quick Sweat Workout',
      description: 'High-intensity 30-minute workout',
      totalDuration: 30,
      warmup: {
        name: 'Warm-up',
        duration: 300,
        exercises: [{
          name: 'Arm Circles',
          description: 'Dynamic arm movement',
          duration: 300
        }]
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 1200,
        exercises: [{
          name: 'Jumping Jacks',
          description: 'Full body cardio exercise',
          duration: 600
        }, {
          name: 'Push-ups',
          description: 'Upper body strength exercise',
          duration: 600
        }]
      },
      cooldown: {
        name: 'Cool-down',
        duration: 300,
        exercises: [{
          name: 'Deep Breathing',
          description: 'Relaxation exercise',
          duration: 300
        }]
      },
      reasoning: 'AI-generated workout for high energy level',
      confidence: 0.9
    });

    feature = new QuickWorkoutFeature({
      openAIService: mockOpenAIService
    });

    mockUserProfile = {
      fitnessLevel: 'some experience',
      goals: ['weight_loss', 'cardiovascular_health'],
      basicLimitations: {
        availableEquipment: ['Dumbbells'],
        timeConstraints: 30
      }
    } as UserProfile;
  });

  describe('generateWorkout', () => {
    it('should complete full workflow successfully', async () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['Dumbbells']
      };

      const result = await feature.generateWorkout(params, mockUserProfile);

      expect(result).toBeDefined();
      expect(result.workout).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.durationOptimization).toBeDefined();
      expect(result.personalizedNotes).toBeInstanceOf(Array);
      expect(result.safetyReminders).toBeInstanceOf(Array);
    });

    it('should handle duration adjustment workflow', async () => {
      const params: QuickWorkoutParams = {
        duration: 25, // Not directly supported
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const result = await feature.generateWorkout(params, mockUserProfile);

      expect(result.durationOptimization.requestedDuration).toBe(25);
      expect(result.durationOptimization.actualDuration).toBe(20); // Closest supported
      expect(result.durationOptimization.isOptimal).toBe(false);
      expect(result.metadata.durationAdjustmentReason).toContain('25min not directly supported');
    });

    it('should handle low energy context', async () => {
      const params: QuickWorkoutParams = {
        duration: 45,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 2, // Very low energy
        sorenessAreas: [],
        equipment: []
      };

      const result = await feature.generateWorkout(params, mockUserProfile);

      expect(result.durationOptimization.actualDuration).toBeLessThan(45);
      expect(result.personalizedNotes.some(note => 
        note.includes('low energy')
      )).toBe(true);
    });

    it('should handle soreness areas', async () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: ['legs', 'back'],
        equipment: []
      };

      const result = await feature.generateWorkout(params, mockUserProfile);

      expect(result.safetyReminders.some(reminder => 
        reminder.includes('sore areas')
      )).toBe(true);
    });

    it('should validate input parameters', async () => {
      const invalidParams: QuickWorkoutParams = {
        duration: 999, // Invalid duration
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      await expect(
        feature.generateWorkout(invalidParams, mockUserProfile)
      ).rejects.toThrow('Duration must be between');
    });

    it('should require user profile', async () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      await expect(
        feature.generateWorkout(params, null as any)
      ).rejects.toThrow('UserProfile is required');
    });

    it('should handle OpenAI service errors gracefully', async () => {
      mockOpenAIService.generateFromTemplate.mockRejectedValue(
        new Error('OpenAI API error')
      );

      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      await expect(
        feature.generateWorkout(params, mockUserProfile)
      ).rejects.toThrow('QuickWorkoutSetup feature failed');
    });

    it('should track metrics correctly', async () => {
      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      // Reset metrics first
      feature.resetMetrics();
      
      await feature.generateWorkout(params, mockUserProfile);
      
      const metrics = feature.getMetrics();
      expect(metrics.successRate).toBeGreaterThan(0);
      expect(metrics.durationUsage['30']).toBe(1);
    });
  });

  describe('healthCheck', () => {
    it('should pass health check with valid components', async () => {
      const isHealthy = await feature.healthCheck();
      
      expect(isHealthy).toBe(true);
    });

    it('should fail health check with invalid components', async () => {
      // Create feature with invalid dependencies
      const brokenFeature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService,
        durationStrategy: null as any
      });

      const isHealthy = await brokenFeature.healthCheck();
      
      expect(isHealthy).toBe(false);
    });
  });

  describe('getCapabilities', () => {
    it('should return correct capabilities', () => {
      const capabilities = feature.getCapabilities();

      expect(capabilities.supportedDurations).toEqual([5, 10, 15, 20, 30, 45]);
      expect(capabilities.supportedFitnessLevels).toContain('some experience');
      expect(capabilities.contextAwareness).toBe(true);
      expect(capabilities.durationOptimization).toBe(true);
    });
  });

  describe('getMetrics', () => {
    it('should return current metrics', () => {
      const metrics = feature.getMetrics();

      expect(metrics).toHaveProperty('averageGenerationTime');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('durationUsage');
    });
  });

  describe('resetMetrics', () => {
    it('should reset metrics to initial state', () => {
      feature.resetMetrics();
      
      const metrics = feature.getMetrics();
      expect(metrics.averageGenerationTime).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(Object.keys(metrics.durationUsage)).toHaveLength(0);
    });
  });
}); 