import { AIService } from '../AIService';
import { OpenAIStrategy } from '../../external/OpenAIStrategy';
import { GlobalAIContext, PrioritizedRecommendation } from '../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { AIInsight } from '../../../types/insights';

// Mock OpenAIStrategy for testing
const mockOpenAIStrategy = {
  generateWorkout: jest.fn(),
  generateRecommendations: jest.fn(),
  enhanceInsights: jest.fn(),
  analyzeUserPreferences: jest.fn()
};

// Mock data
const mockUserProfile: UserProfile = {
  fitnessLevel: 'intermediate',
  goals: ['strength', 'endurance'],
  preferences: {
    workoutStyle: ['strength training', 'cardio'],
    timePreference: 'morning',
    intensityPreference: 'moderate',
    advancedFeatures: true,
    aiAssistanceLevel: 'moderate'
  },
  basicLimitations: {
    injuries: [],
    availableEquipment: ['dumbbells', 'resistance bands'],
    availableLocations: ['home', 'gym']
  },
  enhancedLimitations: {
    timeConstraints: 45,
    equipmentConstraints: ['dumbbells', 'resistance bands'],
    locationConstraints: ['home', 'gym'],
    recoveryNeeds: {
      restDays: 2,
      sleepHours: 8,
      hydrationLevel: 'moderate'
    },
    mobilityLimitations: [],
    progressionRate: 'moderate'
  },
  workoutHistory: {
    estimatedCompletedWorkouts: 25,
    averageDuration: 45,
    preferredFocusAreas: ['strength', 'cardio'],
    progressiveEnhancementUsage: {},
    aiRecommendationAcceptance: 0.8,
    consistencyScore: 0.7,
    plateauRisk: 'low'
  },
  learningProfile: {
    prefersSimplicity: false,
    explorationTendency: 'moderate',
    feedbackPreference: 'detailed',
    learningStyle: 'mixed',
    motivationType: 'achievement',
    adaptationSpeed: 'moderate'
  }
};

const mockWorkoutData: PerWorkoutOptions = {
  customization_energy: 7,
  customization_soreness: ['legs', 'back'],
  customization_focus: 'strength',
  customization_duration: 45,
  customization_equipment: ['dumbbells', 'resistance bands']
};

const mockContext: GlobalAIContext = {
  userProfile: mockUserProfile,
  currentSelections: mockWorkoutData,
  sessionHistory: [],
  preferences: {
    aiAssistanceLevel: 'moderate',
    showLearningInsights: true,
    autoApplyLowRiskRecommendations: false
  }
};

describe('OpenAIStrategy Direct Integration', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  describe('Strategy Configuration', () => {
    it('should set OpenAI strategy directly', () => {
      expect(() => aiService.setOpenAIStrategy(mockOpenAIStrategy as any)).not.toThrow();
    });

    it('should handle null strategy gracefully', () => {
      expect(() => aiService.setOpenAIStrategy(null as any)).not.toThrow();
    });
  });

  describe('Workout Generation', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);
    });

    it('should generate workout successfully', async () => {
      const mockWorkout = {
        id: 'test_workout_1',
        title: 'Strength Training Session',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 },
          { name: 'Squats', sets: 3, reps: 15 }
        ],
        duration: 45,
        difficulty: 'intermediate'
      };

      mockOpenAIStrategy.generateWorkout.mockResolvedValue(mockWorkout);

      const result = await aiService.generateWorkout(mockWorkoutData);

      expect(result).toEqual(mockWorkout);
      expect(mockOpenAIStrategy.generateWorkout).toHaveBeenCalledWith(mockWorkoutData);
    });

    it('should throw error when strategy not configured', async () => {
      aiService.setOpenAIStrategy(null as any);

      await expect(
        aiService.generateWorkout(mockWorkoutData)
      ).rejects.toThrow('OpenAI strategy not configured');
    });

    it('should handle workout generation failure', async () => {
      const error = new Error('OpenAI API error');
      mockOpenAIStrategy.generateWorkout.mockRejectedValue(error);

      await expect(
        aiService.generateWorkout(mockWorkoutData)
      ).rejects.toThrow('OpenAI API error');
    });
  });

  describe('Recommendations Generation', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);
    });

    it('should generate recommendations successfully', async () => {
      const mockRecommendations: PrioritizedRecommendation[] = [
        {
          id: 'rec_1',
          priority: 'high',
          category: 'workout_optimization',
          targetComponent: 'energy',
          title: 'Energy Level Optimization',
          description: 'Consider adjusting energy level for better workout performance',
          reasoning: 'Your energy level is high but workout duration is moderate',
          confidence: 0.8,
          action: 'increase_duration',
          risk: 'low'
        }
      ];

      mockOpenAIStrategy.generateRecommendations.mockResolvedValue(mockRecommendations);

      const result = await aiService.generateRecommendations(mockContext);

      expect(result).toEqual(mockRecommendations);
      expect(mockOpenAIStrategy.generateRecommendations).toHaveBeenCalledWith(mockContext);
    });

    it('should throw error when strategy not configured', async () => {
      aiService.setOpenAIStrategy(null as any);

      await expect(
        aiService.generateRecommendations(mockContext)
      ).rejects.toThrow('OpenAI strategy not configured');
    });
  });

  describe('Insights Enhancement', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);
    });

    it('should enhance insights successfully', async () => {
      const originalInsights: AIInsight[] = [
        {
          id: 'insight_1',
          type: 'info',
          title: 'Energy Level',
          content: 'Your energy level is optimal for this workout',
          priority: 'medium',
          category: 'energy'
        }
      ];

      const enhancedInsights: AIInsight[] = [
        {
          id: 'insight_1',
          type: 'info',
          title: 'Energy Level Optimization',
          content: 'Your energy level of 7 is optimal for a 45-minute strength training session. Consider adding 1-2 more exercises to maximize your energy.',
          priority: 'high',
          category: 'energy'
        }
      ];

      mockOpenAIStrategy.enhanceInsights.mockResolvedValue(enhancedInsights);

      const result = await aiService.enhanceInsights(originalInsights, mockContext);

      expect(result).toEqual(enhancedInsights);
      expect(mockOpenAIStrategy.enhanceInsights).toHaveBeenCalledWith(originalInsights, mockContext);
    });

    it('should throw error when strategy not configured', async () => {
      aiService.setOpenAIStrategy(null as any);

      await expect(
        aiService.enhanceInsights([], mockContext)
      ).rejects.toThrow('OpenAI strategy not configured');
    });
  });

  describe('User Preference Analysis', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);
    });

    it('should analyze user preferences successfully', async () => {
      const mockAnalysis = {
        preferredWorkoutStyles: ['strength training', 'cardio'],
        optimalTiming: 'morning',
        motivationFactors: ['achievement', 'progress'],
        progressionRecommendations: ['increase weight gradually', 'add variety']
      };

      mockOpenAIStrategy.analyzeUserPreferences.mockResolvedValue(mockAnalysis);

      const result = await aiService.analyzeUserPreferences(mockContext);

      expect(result).toEqual(mockAnalysis);
      expect(mockOpenAIStrategy.analyzeUserPreferences).toHaveBeenCalledWith(mockContext);
    });

    it('should throw error when strategy not configured', async () => {
      aiService.setOpenAIStrategy(null as any);

      await expect(
        aiService.analyzeUserPreferences(mockContext)
      ).rejects.toThrow('OpenAI strategy not configured');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
    });

    it('should handle strategy method failures gracefully', async () => {
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);

      const error = new Error('Network timeout');
      mockOpenAIStrategy.generateWorkout.mockRejectedValue(error);

      await expect(
        aiService.generateWorkout(mockWorkoutData)
      ).rejects.toThrow('Network timeout');
    });

    it('should provide clear error messages for missing strategy', async () => {
      await expect(
        aiService.generateWorkout(mockWorkoutData)
      ).rejects.toThrow('OpenAI strategy not configured');
    });
  });

  describe('Context Management', () => {
    it('should maintain context when generating workouts', async () => {
      await aiService.setContext(mockContext);
      aiService.setOpenAIStrategy(mockOpenAIStrategy as any);

      mockOpenAIStrategy.generateWorkout.mockResolvedValue({ workout: 'test' });

      await aiService.generateWorkout(mockWorkoutData);

      // Verify context is maintained
      const currentContext = aiService.getContext();
      expect(currentContext).toBeDefined();
      expect(currentContext?.userProfile).toEqual(mockUserProfile);
      expect(currentContext?.currentSelections).toEqual(mockWorkoutData);
    });
  });
}); 