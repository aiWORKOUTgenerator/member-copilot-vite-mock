import { ConfidenceAIService } from '../ConfidenceAIService';
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { ConfidenceContext } from '../types/confidence.types';

describe('ConfidenceAIService', () => {
  let confidenceService: ConfidenceAIService;
  
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
      timeConstraints: 45,
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
      estimatedCompletedWorkouts: 20,
      averageDuration: 45,
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

  const mockWorkoutData: GeneratedWorkout = {
    id: 'test-workout-1',
    title: 'Intermediate Strength Training',
    description: 'A balanced strength training workout focusing on compound movements',
    totalDuration: 2700, // 45 minutes
    estimatedCalories: 350,
    difficulty: 'some experience',
    equipment: ['dumbbells', 'resistance bands'],
    warmup: {
      name: 'Warmup',
      duration: 300,
      exercises: [
        {
          name: 'Arm Circles',
          sets: 1,
          reps: 10,
          equipment: [],
          instructions: ['Stand with feet shoulder-width apart', 'Make circular motions with arms'],
          tips: ['Keep movements controlled'],
          intensity: 'low',
          restBetweenSets: 0
        }
      ],
      instructions: 'Begin with light cardio and dynamic stretching',
      tips: ['Focus on form', 'Breathe steadily']
    },
    mainWorkout: {
      name: 'Strength Training',
      duration: 1800,
      exercises: [
        {
          name: 'Dumbbell Squats',
          sets: 3,
          reps: 12,
          equipment: ['dumbbells'],
          instructions: ['Stand with feet shoulder-width apart', 'Hold dumbbells at sides', 'Squat down'],
          tips: ['Keep chest up', 'Knees behind toes'],
          intensity: 'moderate',
          restBetweenSets: 60
        },
        {
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          equipment: [],
          instructions: ['Start in plank position', 'Lower body to ground', 'Push back up'],
          tips: ['Keep body straight', 'Engage core'],
          intensity: 'moderate',
          restBetweenSets: 60
        }
      ],
      instructions: 'Complete all sets of each exercise before moving to the next',
      tips: ['Maintain proper form', 'Rest between sets']
    },
    cooldown: {
      name: 'Cooldown',
      duration: 300,
      exercises: [
        {
          name: 'Static Stretches',
          sets: 1,
          reps: 5,
          equipment: [],
          instructions: ['Hold each stretch for 30 seconds', 'Focus on major muscle groups'],
          tips: ['Don\'t bounce', 'Breathe deeply'],
          intensity: 'low',
          restBetweenSets: 0
        }
      ],
      instructions: 'End with gentle stretching and deep breathing',
      tips: ['Hold stretches', 'Relax muscles']
    },
    reasoning: 'This workout provides a balanced approach to strength training',
    personalizedNotes: ['Good for intermediate level', 'Focus on form'],
    progressionTips: ['Increase weight gradually', 'Add more sets as you progress'],
    safetyReminders: ['Stop if you feel pain', 'Maintain proper form'],
    generatedAt: new Date(),
    aiModel: 'gpt-4',
    confidence: 0.85,
    tags: ['strength', 'intermediate', 'compound movements']
  };

  const mockContext: ConfidenceContext = {
    workoutType: 'quick',
    environmentalFactors: {
      location: 'home',
      timeOfDay: 'morning',
      availableTime: 45
    },
    userPreferences: {
      intensity: 'moderate',
      duration: 45,
      focus: 'strength'
    }
  };

  beforeEach(() => {
    confidenceService = new ConfidenceAIService();
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence score successfully', async () => {
      const result = await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
      expect(result.level).toBeDefined();
      expect(result.factors).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should return all required factor scores', async () => {
      const result = await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );

      expect(result.factors.profileMatch).toBeDefined();
      expect(result.factors.safetyAlignment).toBeDefined();
      expect(result.factors.equipmentFit).toBeDefined();
      expect(result.factors.goalAlignment).toBeDefined();
      expect(result.factors.structureQuality).toBeDefined();

      // All factor scores should be between 0 and 1
      Object.values(result.factors).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate weighted overall score correctly', async () => {
      const result = await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );

      // The overall score should be a weighted average of individual factors
      const config = confidenceService.getConfig();
      const expectedScore = 
        result.factors.profileMatch * config.weights.profileMatch +
        result.factors.safetyAlignment * config.weights.safetyAlignment +
        result.factors.equipmentFit * config.weights.equipmentFit +
        result.factors.goalAlignment * config.weights.goalAlignment +
        result.factors.structureQuality * config.weights.structureQuality;

      expect(result.overallScore).toBeCloseTo(expectedScore, 2);
    });

    it('should provide recommendations based on factor scores', async () => {
      const result = await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Should have at least one level-based recommendation
      const hasLevelRecommendation = result.recommendations.some(rec => 
        rec.includes('workout') || rec.includes('profile') || rec.includes('adjustments')
      );
      expect(hasLevelRecommendation).toBe(true);
    });

    it('should include calculation metadata', async () => {
      const result = await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );

      expect(result.metadata.calculationTime).toBeDefined();
      expect(result.metadata.calculationTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.factorWeights).toBeDefined();
      expect(result.metadata.dataQuality).toBeDefined();
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.timestamp).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should complete calculation within 100ms', async () => {
      const startTime = Date.now();
      
      await confidenceService.calculateConfidence(
        mockUserProfile,
        mockWorkoutData,
        mockContext
      );
      
      const endTime = Date.now();
      const calculationTime = endTime - startTime;
      
      expect(calculationTime).toBeLessThan(100);
    });
  });
}); 