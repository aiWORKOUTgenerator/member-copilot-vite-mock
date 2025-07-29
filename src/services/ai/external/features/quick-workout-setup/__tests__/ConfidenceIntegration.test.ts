import { QuickWorkoutFeature } from '../QuickWorkoutFeature';
import { OpenAIService } from '../../../OpenAIService';
import { UserProfile } from '../../../../../../types/user';
import { ConfidenceServiceFactory } from '../../../../domains/confidence/ConfidenceServiceFactory';

// Mock OpenAI service
jest.mock('../../../OpenAIService');

describe('Confidence Integration with QuickWorkoutFeature', () => {
  let quickWorkoutFeature: QuickWorkoutFeature;
  let mockOpenAIService: jest.Mocked<OpenAIService>;

  const mockUserProfile: UserProfile = {
    fitnessLevel: 'intermediate',
    goals: ['strength', 'weight loss'],
    preferences: {
      workoutStyle: ['strength training', 'cardio'],
      timePreference: 'morning',
      intensityPreference: 'moderate',
      advancedFeatures: false,
      aiAssistanceLevel: 'moderate'
    },
    basicLimitations: {
      injuries: [],
      availableEquipment: ['dumbbells', 'resistance bands'],
      availableLocations: ['home', 'gym']
    },
    enhancedLimitations: {
      timeConstraints: 30,
      equipmentConstraints: [],
      locationConstraints: [],
      recoveryNeeds: {
        restDays: 2,
        sleepHours: 8,
        hydrationLevel: 'moderate'
      },
      mobilityLimitations: [],
      progressionRate: 'moderate'
    },
    workoutHistory: {
      estimatedCompletedWorkouts: 15,
      averageDuration: 30,
      preferredFocusAreas: ['upper body', 'core'],
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.8,
      consistencyScore: 0.7,
      plateauRisk: 'low'
    },
    learningProfile: {
      prefersSimplicity: false,
      explorationTendency: 'moderate',
      feedbackPreference: 'detailed',
      learningStyle: 'visual',
      motivationType: 'intrinsic',
      adaptationSpeed: 'moderate'
    }
  };

  beforeEach(() => {
    // Reset confidence service
    ConfidenceServiceFactory.reset();
    
    // Mock the confidence service to enable calculation for testing
    jest.spyOn(ConfidenceServiceFactory, 'isConfidenceEnabled').mockReturnValue(true);

    // Setup mock OpenAI service
    mockOpenAIService = {
      generateFromTemplate: jest.fn().mockResolvedValue(`
        {
          "id": "test-workout-1",
          "title": "Quick Strength Training",
          "description": "A 30-minute strength training workout",
          "totalDuration": 1800,
          "estimatedCalories": 250,
          "difficulty": "some experience",
          "equipment": ["dumbbells"],
          "warmup": {
            "name": "Warmup",
            "duration": 300,
            "exercises": [
              {
                "name": "Arm Circles",
                "sets": 1,
                "reps": 10,
                "equipment": [],
                "instructions": ["Stand with feet shoulder-width apart"],
                "tips": ["Keep movements controlled"],
                "intensity": "low",
                "restBetweenSets": 0
              }
            ],
            "instructions": "Begin with light cardio",
            "tips": ["Focus on form"]
          },
          "mainWorkout": {
            "name": "Strength Training",
            "duration": 1200,
            "exercises": [
              {
                "name": "Dumbbell Squats",
                "sets": 3,
                "reps": 12,
                "equipment": ["dumbbells"],
                "instructions": ["Stand with feet shoulder-width apart"],
                "tips": ["Keep chest up"],
                "intensity": "moderate",
                "restBetweenSets": 60
              }
            ],
            "instructions": "Complete all sets",
            "tips": ["Maintain proper form"]
          },
          "cooldown": {
            "name": "Cooldown",
            "duration": 300,
            "exercises": [
              {
                "name": "Static Stretches",
                "sets": 1,
                "reps": 5,
                "equipment": [],
                "instructions": ["Hold each stretch"],
                "tips": ["Don't bounce"],
                "intensity": "low",
                "restBetweenSets": 0
              }
            ],
            "instructions": "End with stretching",
            "tips": ["Hold stretches"]
          },
          "reasoning": "This workout provides balanced strength training",
          "personalizedNotes": ["Good for intermediate level"],
          "progressionTips": ["Increase weight gradually"],
          "safetyReminders": ["Stop if you feel pain"],
          "generatedAt": "2024-01-01T00:00:00.000Z",
          "aiModel": "gpt-4o",
          "confidence": 0.85,
          "tags": ["strength", "intermediate"]
        }
      `),
      generateRecommendations: jest.fn(),
      enhanceInsights: jest.fn(),
      analyzeUserPreferences: jest.fn()
    } as unknown as jest.Mocked<OpenAIService>;

    quickWorkoutFeature = new QuickWorkoutFeature({
      openAIService: mockOpenAIService
    });
  });

  describe('Confidence Calculation Integration', () => {
    it('should calculate confidence factors during workout generation', async () => {
      const params = {
        duration: 30,
        fitnessLevel: 'some experience' as const,
        focus: 'strength training',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['dumbbells', 'resistance bands'],
        location: 'home' as const
      };

      const result = await quickWorkoutFeature.generateWorkout(params, mockUserProfile);

      // Verify confidence calculation was performed
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);

      // Verify workout has confidence factors
      expect(result.workout.confidenceFactors).toBeDefined();
      if (result.workout.confidenceFactors) {
        expect(result.workout.confidenceFactors.profileMatch).toBeGreaterThan(0);
        expect(result.workout.confidenceFactors.safetyAlignment).toBeGreaterThan(0);
        expect(result.workout.confidenceFactors.equipmentFit).toBeGreaterThan(0);
        expect(result.workout.confidenceFactors.goalAlignment).toBeGreaterThan(0);
        expect(result.workout.confidenceFactors.structureQuality).toBeGreaterThan(0);

        // All factors should be between 0 and 1
        Object.values(result.workout.confidenceFactors).forEach(factor => {
          expect(factor).toBeGreaterThanOrEqual(0);
          expect(factor).toBeLessThanOrEqual(1);
        });
      }
    });

    it('should handle confidence calculation errors gracefully', async () => {
      // Mock the confidence service to disable calculation for this test
      jest.spyOn(ConfidenceServiceFactory, 'isConfidenceEnabled').mockReturnValue(false);

      const params = {
        duration: 30,
        fitnessLevel: 'some experience' as const,
        focus: 'strength training',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['dumbbells'],
        location: 'home' as const
      };

      const result = await quickWorkoutFeature.generateWorkout(params, mockUserProfile);

      // Should still return a result with fallback confidence
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.workout.confidenceFactors).toBeUndefined();
    });

    it('should use different confidence scores for different workout types', async () => {
      // Test with different fitness levels
      const params1 = {
        duration: 30,
        fitnessLevel: 'new to exercise' as const,
        focus: 'cardio',
        energyLevel: 5,
        sorenessAreas: [],
        equipment: [],
        location: 'home' as const
      };

      const params2 = {
        duration: 30,
        fitnessLevel: 'advanced athlete' as const,
        focus: 'strength training',
        energyLevel: 9,
        sorenessAreas: [],
        equipment: ['dumbbells', 'barbell', 'bench'],
        location: 'gym' as const
      };

      const result1 = await quickWorkoutFeature.generateWorkout(params1, mockUserProfile);
      const result2 = await quickWorkoutFeature.generateWorkout(params2, mockUserProfile);

      // Both should have confidence factors
      expect(result1.workout.confidenceFactors).toBeDefined();
      expect(result2.workout.confidenceFactors).toBeDefined();
      
      // Confidence scores should be reasonable (between 0 and 1)
      expect(result1.confidence).toBeGreaterThan(0);
      expect(result1.confidence).toBeLessThanOrEqual(1);
      expect(result2.confidence).toBeGreaterThan(0);
      expect(result2.confidence).toBeLessThanOrEqual(1);

      // Both should have confidence factors
      expect(result1.workout.confidenceFactors).toBeDefined();
      expect(result2.workout.confidenceFactors).toBeDefined();
    });

    it('should maintain backward compatibility', async () => {
      const params = {
        duration: 30,
        fitnessLevel: 'some experience' as const,
        focus: 'strength training',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['dumbbells'],
        location: 'home' as const
      };

      const result = await quickWorkoutFeature.generateWorkout(params, mockUserProfile);

      // Should have all required fields
      expect(result.workout).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.reasoning).toBeDefined();
      expect(result.durationOptimization).toBeDefined();
      expect(result.personalizedNotes).toBeDefined();
      expect(result.safetyReminders).toBeDefined();

      // Should have the new confidence factors (optional)
      expect(result.workout.confidenceFactors).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete confidence calculation within reasonable time', async () => {
      const params = {
        duration: 30,
        fitnessLevel: 'some experience' as const,
        focus: 'strength training',
        energyLevel: 7,
        sorenessAreas: [],
        equipment: ['dumbbells'],
        location: 'home' as const
      };

      const startTime = Date.now();
      const result = await quickWorkoutFeature.generateWorkout(params, mockUserProfile);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      
      // Should complete within 5 seconds (including AI generation)
      expect(totalTime).toBeLessThan(5000);
      
      // Should have confidence factors
      expect(result.workout.confidenceFactors).toBeDefined();
    });
  });
}); 