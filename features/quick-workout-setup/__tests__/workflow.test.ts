// QuickWorkoutSetup Feature - End-to-End Workflow Tests
import { QuickWorkoutFeature } from '../QuickWorkoutFeature';
import { DurationStrategy } from '../workflow/DurationStrategy';
import { PromptSelector } from '../workflow/PromptSelector';
import { ResponseProcessor } from '../workflow/ResponseProcessor';
import { OpenAIService } from '../../../src/services/ai/external/OpenAIService';
import { QuickWorkoutParams } from '../types/quick-workout.types';
import { UserProfile } from '../../../src/types';

// Mock OpenAI Service for workflow testing
jest.mock('../../../src/services/ai/external/OpenAIService');

describe('QuickWorkoutSetup Workflow E2E', () => {
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  
  beforeEach(() => {
    mockOpenAIService = new OpenAIService() as jest.Mocked<OpenAIService>;
  });

  describe('Complete Workflow Scenarios', () => {
    it('should handle beginner 15-minute cardio workout', async () => {
      // Mock AI response for beginner workout
      mockOpenAIService.generateFromTemplate.mockResolvedValue({
        id: 'beginner_cardio_15',
        title: '15-Minute Beginner Cardio',
        description: 'Gentle cardio workout for beginners',
        totalDuration: 15,
        warmup: {
          name: 'Gentle Warm-up',
          duration: 120, // 2 minutes
          exercises: [{
            name: 'Marching in Place',
            description: 'Gentle marching motion',
            duration: 120
          }]
        },
        mainWorkout: {
          name: 'Cardio Workout',
          duration: 660, // 11 minutes
          exercises: [{
            name: 'Step Touch',
            description: 'Low-impact stepping motion',
            duration: 330
          }, {
            name: 'Arm Raises',
            description: 'Gentle arm movements',
            duration: 330
          }]
        },
        cooldown: {
          name: 'Cool-down Stretch',
          duration: 120, // 2 minutes
          exercises: [{
            name: 'Deep Breathing',
            description: 'Relaxation breathing',
            duration: 120
          }]
        }
      });

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService
      });

      const params: QuickWorkoutParams = {
        duration: 15,
        fitnessLevel: 'new to exercise',
        focus: 'Cardio Blast',
        energyLevel: 6,
        sorenessAreas: [],
        equipment: []
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['cardiovascular_health'],
        preferences: {
          workoutStyle: ['cardio'],
          timePreference: 'morning',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'comprehensive'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 15,
          equipmentConstraints: [],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 3,
            sleepHours: 8,
            hydrationLevel: 'high'
          },
          mobilityLimitations: [],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 0,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.3,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'simple',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'slow'
        }
      };

      const result = await feature.generateWorkout(params, userProfile);

      // Validate workflow results
      expect(result.workout.title).toContain('15-Minute');
      expect(result.durationOptimization.actualDuration).toBe(15);
      expect(result.personalizedNotes.some(note => 
        note.includes('beginner') || note.includes('form')
      )).toBe(true);
      expect(result.safetyReminders).toContain(
        expect.stringContaining('form over speed')
      );
    });

    it('should handle advanced 45-minute strength workout with equipment', async () => {
      // Mock AI response for advanced workout
      mockOpenAIService.generateFromTemplate.mockResolvedValue({
        id: 'advanced_strength_45',
        title: '45-Minute Advanced Strength',
        description: 'Comprehensive strength training',
        totalDuration: 45,
        warmup: {
          name: 'Dynamic Warm-up',
          duration: 420, // 7 minutes
          exercises: [{
            name: 'Dynamic Stretching',
            description: 'Full body dynamic movements',
            duration: 420
          }]
        },
        mainWorkout: {
          name: 'Strength Training',
          duration: 1860, // 31 minutes
          exercises: [{
            name: 'Dumbbell Compound Sets',
            description: 'Multi-muscle exercises',
            duration: 930
          }, {
            name: 'Progressive Overload Sets',
            description: 'Challenging strength work',
            duration: 930
          }]
        },
        cooldown: {
          name: 'Recovery Stretch',
          duration: 420, // 7 minutes
          exercises: [{
            name: 'Static Stretching',
            description: 'Deep stretching routine',
            duration: 420
          }]
        }
      });

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService
      });

      const params: QuickWorkoutParams = {
        duration: 45,
        fitnessLevel: 'advanced athlete',
        focus: 'Strength Building',
        energyLevel: 9,
        sorenessAreas: [],
        equipment: ['Dumbbells', 'Kettlebell']
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'advanced',
        goals: ['muscle_building', 'strength'],
        preferences: {
          workoutStyle: ['strength_training', 'hiit'],
          timePreference: 'morning',
          intensityPreference: 'high',
          advancedFeatures: true,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Dumbbells', 'Kettlebell'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 45,
          equipmentConstraints: ['Dumbbells', 'Kettlebell'],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 6,
            hydrationLevel: 'high'
          },
          mobilityLimitations: [],
          progressionRate: 'aggressive'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 50,
          averageDuration: 45,
          preferredFocusAreas: ['upper_body', 'lower_body', 'core'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.3,
          consistencyScore: 0.9,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'high',
          feedbackPreference: 'detailed',
          learningStyle: 'kinesthetic',
          motivationType: 'achievement',
          adaptationSpeed: 'fast'
        }
      };

      const result = await feature.generateWorkout(params, userProfile);

      // Validate advanced workout characteristics
      expect(result.workout.title).toContain('Advanced');
      expect(result.durationOptimization.actualDuration).toBe(45);
      expect(result.personalizedNotes.some(note => 
        note.includes('advanced') || note.includes('intensity')
      )).toBe(true);
      expect(result.metadata.featuresUsed).toContain('duration-strategy');
    });

    it('should handle low energy scenario with duration adjustment', async () => {
      // Mock AI response for adjusted workout
      mockOpenAIService.generateFromTemplate.mockResolvedValue({
        id: 'low_energy_adjusted',
        title: '20-Minute Gentle Workout',
        description: 'Adjusted for low energy level',
        totalDuration: 20,
        warmup: {
          name: 'Gentle Warm-up',
          duration: 180,
          exercises: [{
            name: 'Slow Movements',
            description: 'Very gentle preparation',
            duration: 180
          }]
        },
        mainWorkout: {
          name: 'Light Activity',
          duration: 840,
          exercises: [{
            name: 'Easy Movements',
            description: 'Low-intensity exercises',
            duration: 420
          }, {
            name: 'Restorative Poses',
            description: 'Gentle strengthening',
            duration: 420
          }]
        },
        cooldown: {
          name: 'Relaxation',
          duration: 180,
          exercises: [{
            name: 'Meditation',
            description: 'Calming finish',
            duration: 180
          }]
        }
      });

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService
      });

      const params: QuickWorkoutParams = {
        duration: 30, // Requested 30 minutes
        fitnessLevel: 'some experience',
        focus: 'Flexibility & Mobility',
        energyLevel: 2, // Very low energy
        sorenessAreas: ['legs', 'back'],
        equipment: []
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['flexibility'],
        preferences: {
          workoutStyle: ['yoga', 'pilates'],
          timePreference: 'evening',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: [],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: ['legs', 'back'],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 25,
          averageDuration: 30,
          preferredFocusAreas: ['flexibility', 'mobility'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.6,
          consistencyScore: 0.7,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'kinesthetic',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };

      const result = await feature.generateWorkout(params, userProfile);

      // Validate low energy adaptations
      expect(result.durationOptimization.requestedDuration).toBe(30);
      expect(result.durationOptimization.actualDuration).toBeLessThan(30);
      expect(result.durationOptimization.isOptimal).toBe(false);
      expect(result.personalizedNotes.some(note => 
        note.includes('low energy')
      )).toBe(true);
      expect(result.safetyReminders.some(reminder => 
        reminder.includes('sore areas')
      )).toBe(true);
    });

    it('should handle unsupported duration with smart adjustment', async () => {
      // Mock AI response for adjusted duration
      mockOpenAIService.generateFromTemplate.mockResolvedValue({
        id: 'adjusted_duration',
        title: '20-Minute Focused Workout',
        description: 'Adjusted from 22 minutes to 20 minutes',
        totalDuration: 20
      });

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService
      });

      const params: QuickWorkoutParams = {
        duration: 22, // Not directly supported
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['general fitness'],
        preferences: {
          workoutStyle: ['cardio', 'bodyweight'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 22,
          equipmentConstraints: [],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 20,
          averageDuration: 25,
          preferredFocusAreas: ['full_body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.6,
          consistencyScore: 0.7,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'mixed',
          motivationType: 'achievement',
          adaptationSpeed: 'moderate'
        }
      };

      const result = await feature.generateWorkout(params, userProfile);

      // Validate duration adjustment
      expect(result.durationOptimization.requestedDuration).toBe(22);
      expect(result.durationOptimization.actualDuration).toBe(20); // Closest supported
      expect(result.durationOptimization.alternativeDurations).toContain(15);
      expect(result.durationOptimization.alternativeDurations).toContain(30);
      expect(result.metadata.durationAdjustmentReason).toContain('22min not directly supported');
    });

    it('should validate complete workflow components integration', async () => {
      // Mock comprehensive AI response
      mockOpenAIService.generateFromTemplate.mockResolvedValue({
        id: 'integration_test',
        title: 'Complete Integration Test',
        description: 'Testing all workflow components',
        totalDuration: 30,
        warmup: { name: 'Warm-up', duration: 300, exercises: [] },
        mainWorkout: { name: 'Main', duration: 1500, exercises: [] },
        cooldown: { name: 'Cool-down', duration: 300, exercises: [] }
      });

      // Create feature with all components
      const durationStrategy = new DurationStrategy();
      const promptSelector = new PromptSelector();
      const responseProcessor = new ResponseProcessor();

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService,
        durationStrategy,
        promptSelector,
        responseProcessor
      });

      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['Dumbbells']
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['general fitness'],
        preferences: {
          workoutStyle: ['strength_training', 'cardio'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: ['Dumbbells'],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 30,
          averageDuration: 30,
          preferredFocusAreas: ['full_body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.6,
          consistencyScore: 0.8,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'mixed',
          motivationType: 'achievement',
          adaptationSpeed: 'moderate'
        }
      };

      const result = await feature.generateWorkout(params, userProfile);

      // Validate all workflow components were used
      expect(result.metadata.featuresUsed).toEqual([
        'duration-strategy',
        'prompt-selection', 
        'response-processing',
        'workout-normalization'
      ]);
      expect(result.metadata.generationTime).toBeGreaterThan(0);
      expect(result.metadata.durationConfig).toBeDefined();
      expect(result.metadata.promptTemplate).toBeDefined();
      
      // Validate feature capabilities
      const capabilities = feature.getCapabilities();
      expect(capabilities.contextAwareness).toBe(true);
      expect(capabilities.durationOptimization).toBe(true);
      expect(capabilities.metricsTracking).toBe(true);
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle OpenAI service failure gracefully', async () => {
      mockOpenAIService.generateFromTemplate.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService
      });

      const params: QuickWorkoutParams = {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Quick Sweat',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: []
      };

      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['general fitness'],
        preferences: {
          workoutStyle: ['cardio'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: [],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 20,
          averageDuration: 30,
          preferredFocusAreas: ['full_body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.6,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'moderate',
          feedbackPreference: 'simple',
          learningStyle: 'mixed',
          motivationType: 'achievement',
          adaptationSpeed: 'moderate'
        }
      };

      await expect(
        feature.generateWorkout(params, userProfile)
      ).rejects.toThrow('QuickWorkoutSetup feature failed');

      // Check that error metrics are tracked
      const metrics = feature.getMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    it('should validate workflow component failures', async () => {
      const feature = new QuickWorkoutFeature({
        openAIService: mockOpenAIService,
        durationStrategy: null as any // Broken component
      });

      const healthCheck = await feature.healthCheck();
      expect(healthCheck).toBe(false);
    });
  });
}); 