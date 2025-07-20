// Tests for AIServiceContext
import { AIServiceContext } from '../AIServiceContext';
import { AIServiceContextValidator } from '../AIServiceContextValidator';
import { AIServiceConfig, GlobalAIContext, UserProfile, PerWorkoutOptions } from '../../types/AIServiceTypes';

describe('AIServiceContext', () => {
  let contextManager: AIServiceContext;
  let config: AIServiceConfig;

  beforeEach(() => {
    config = {
      enableValidation: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 1000,
      cacheTimeout: 5 * 60 * 1000,
      maxRetries: 3,
      fallbackToLegacy: true
    };
    contextManager = new AIServiceContext(config);
  });

  describe('Context Management', () => {
    it('should initialize with no context', () => {
      expect(contextManager.getContext()).toBeNull();
      expect(contextManager.hasContext()).toBe(false);
    });

    it('should set and get context successfully', async () => {
      const mockUserProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        age: 30,
        gender: 'male',
        height: '175',
        weight: '70'
      };

      const mockSelections: PerWorkoutOptions = {
        customization_energy: 7,
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['dumbbells'],
        customization_soreness: []
      };

      const mockContext: GlobalAIContext = {
        userProfile: mockUserProfile,
        currentSelections: mockSelections,
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await contextManager.setContext(mockContext);

      expect(contextManager.hasContext()).toBe(true);
      expect(contextManager.getContext()).toEqual(mockContext);
      expect(contextManager.getUserProfile()).toEqual(mockUserProfile);
      expect(contextManager.getCurrentSelections()).toEqual(mockSelections);
    });

    it('should update selections correctly', async () => {
      const mockContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'beginner',
          goals: ['general fitness'],
          age: 25,
          gender: 'female'
        },
        currentSelections: {
          customization_energy: 5,
          customization_duration: 30
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'minimal',
          showLearningInsights: false,
          autoApplyLowRiskRecommendations: false
        }
      };

      await contextManager.setContext(mockContext);

      contextManager.updateSelections({
        customization_energy: 8,
        customization_focus: 'cardio'
      });

      const updatedSelections = contextManager.getCurrentSelections();
      expect(updatedSelections?.customization_energy).toBe(8);
      expect(updatedSelections?.customization_focus).toBe('cardio');
      expect(updatedSelections?.customization_duration).toBe(30); // Should remain unchanged
    });

    it('should clear context correctly', async () => {
      const mockContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'advanced',
          goals: ['strength'],
          age: 35,
          gender: 'male'
        },
        currentSelections: {
          customization_energy: 9,
          customization_duration: 60
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: true
        }
      };

      await contextManager.setContext(mockContext);
      expect(contextManager.hasContext()).toBe(true);

      contextManager.clearContext();
      expect(contextManager.hasContext()).toBe(false);
      expect(contextManager.getContext()).toBeNull();
    });
  });

  describe('Session History Management', () => {
    it('should record interactions correctly', async () => {
      const mockContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['endurance'],
          age: 28,
          gender: 'female'
        },
        currentSelections: {
          customization_energy: 6,
          customization_duration: 40
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await contextManager.setContext(mockContext);

      const interaction = {
        id: 'test-interaction-1',
        timestamp: new Date(),
        component: 'energy_analysis',
        action: 'recommendation_shown' as const,
        userFeedback: 'helpful' as const
      };

      contextManager.recordInteraction(interaction);

      const history = contextManager.getSessionHistory();
      expect(history).toHaveLength(2); // 1 from setContext + 1 from recordInteraction
      expect(history[1]).toEqual(interaction); // The last interaction should be our test interaction
    });

    it('should get session statistics correctly', async () => {
      const mockContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'beginner',
          goals: ['general fitness'],
          age: 22,
          gender: 'male'
        },
        currentSelections: {
          customization_energy: 4,
          customization_duration: 25
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'minimal',
          showLearningInsights: false,
          autoApplyLowRiskRecommendations: false
        }
      };

      await contextManager.setContext(mockContext);

      // Record various interactions
      contextManager.recordInteraction({
        id: '1',
        timestamp: new Date(),
        component: 'energy',
        action: 'recommendation_shown'
      });

      contextManager.recordInteraction({
        id: '2',
        timestamp: new Date(),
        component: 'focus',
        action: 'recommendation_applied',
        userFeedback: 'helpful'
      });

      contextManager.recordInteraction({
        id: '3',
        timestamp: new Date(),
        component: 'duration',
        action: 'recommendation_dismissed',
        userFeedback: 'not_helpful'
      });

      const stats = contextManager.getSessionStats();
      expect(stats.totalInteractions).toBe(4); // 1 from setContext + 3 from our test interactions
      expect(stats.recommendationsShown).toBe(2); // 1 from setContext + 1 from our test
      expect(stats.recommendationsApplied).toBe(1);
      expect(stats.recommendationsDismissed).toBe(1);
      expect(stats.errorsOccurred).toBe(0);
      expect(stats.averageUserFeedback).toBe(0.5); // (1 + 0) / 2 = 0.5
    });
  });

  describe('Health Status', () => {
    it('should return correct health status', async () => {
      // Initially should be 'not_set'
      expect(contextManager.getHealthStatus()).toBe('not_set');

      // With valid context should be 'set'
      const validContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['strength'],
          age: 30,
          gender: 'male'
        },
        currentSelections: {
          customization_energy: 7,
          customization_duration: 45
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await contextManager.setContext(validContext);
      expect(contextManager.getHealthStatus()).toBe('set');
    });
  });
});

describe('AIServiceContextValidator', () => {
  let validator: AIServiceContextValidator;

  beforeEach(() => {
    validator = new AIServiceContextValidator();
  });

  describe('User Profile Validation', () => {
    it('should validate valid user profile', () => {
      const validProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        age: 30,
        gender: 'male',
        height: '175',
        weight: '70'
      };

      expect(() => validator.validateUserProfile(validProfile)).not.toThrow();
    });

    it('should reject invalid fitness level', () => {
      const invalidProfile: UserProfile = {
        fitnessLevel: 'invalid' as any,
        goals: ['strength'],
        age: 30,
        gender: 'male'
      };

      expect(() => validator.validateUserProfile(invalidProfile)).toThrow('fitnessLevel must be one of');
    });

    it('should reject empty goals array', () => {
      const invalidProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: [],
        age: 30,
        gender: 'male'
      };

      expect(() => validator.validateUserProfile(invalidProfile)).toThrow('User goals must be a non-empty array');
    });
  });

  describe('Current Selections Validation', () => {
    it('should validate valid selections', () => {
      const validSelections: PerWorkoutOptions = {
        customization_energy: 7,
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['dumbbells'],
        customization_soreness: []
      };

      expect(() => validator.validateCurrentSelections(validSelections)).not.toThrow();
    });

    it('should reject invalid energy level', () => {
      const invalidSelections: PerWorkoutOptions = {
        customization_energy: 15, // Invalid: should be 1-10
        customization_duration: 45
      };

      expect(() => validator.validateCurrentSelections(invalidSelections)).toThrow('energy level must be between 1 and 10');
    });

    it('should reject invalid duration', () => {
      const invalidSelections: PerWorkoutOptions = {
        customization_energy: 7,
        customization_duration: 200 // Invalid: should be 5-120
      };

      expect(() => validator.validateCurrentSelections(invalidSelections)).toThrow('duration (minutes) must be between 5 and 120');
    });
  });

  describe('Context Validation for Operations', () => {
    it('should validate context for analysis', () => {
      const validContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['strength'],
          age: 30,
          gender: 'male'
        },
        currentSelections: {
          customization_energy: 7,
          customization_duration: 45
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      expect(() => validator.validateContextForAnalysis(validContext)).not.toThrow();
    });

    it('should validate context for workout generation', () => {
      const validContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['strength'],
          age: 30,
          gender: 'male'
        },
        currentSelections: {
          customization_energy: 7,
          customization_duration: 45
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      expect(() => validator.validateContextForWorkoutGeneration(validContext)).not.toThrow();
    });

    it('should reject context without energy level for workout generation', () => {
      const invalidContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          goals: ['strength'],
          age: 30,
          gender: 'male'
        },
        currentSelections: {
          customization_duration: 45 // Missing energy level
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      expect(() => validator.validateContextForWorkoutGeneration(invalidContext)).toThrow('Energy level is required for workout generation');
    });
  });
}); 