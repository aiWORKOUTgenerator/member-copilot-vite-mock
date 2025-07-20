/**
 * Initialization Test - Tests the AI service initialization flow
 * This test verifies that our Day 1 Morning fixes are working correctly
 */

import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';

describe('AI Service Initialization', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Context Setting and Validation', () => {
    it('should successfully set context with valid user profile', async () => {
      const mockUserProfile: UserProfile = {
        fitnessLevel: 'some experience',
        goals: ['strength', 'endurance'],
        preferences: {
          workoutStyle: ['strength_training', 'cardio'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells', 'resistance_bands'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 60,
          equipmentConstraints: ['dumbbells', 'resistance_bands'],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 45,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
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

      const context: GlobalAIContext = {
        userProfile: mockUserProfile,
        currentSelections: {
          customization_energy: 3,
          customization_soreness: ['legs'],
          customization_focus: 'strength',
          customization_duration: 45,
          customization_equipment: ['Dumbbells'],
          customization_areas: ['chest', 'back']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      // Test context setting
      await expect(aiService.setContext(context)).resolves.not.toThrow();
      
      // Verify context was set
      const retrievedContext = aiService.getContext();
      expect(retrievedContext).toBeDefined();
      expect(retrievedContext?.userProfile.fitnessLevel).toBe('some experience');
      expect(retrievedContext?.userProfile.goals).toContain('strength');
    });

    it('should handle invalid user profile gracefully', async () => {
      const invalidContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: [], // Empty goals should cause validation error
          preferences: {
            workoutStyle: ['strength_training'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'moderate'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['dumbbells'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 60,
            equipmentConstraints: ['dumbbells'],
            locationConstraints: [],
            recoveryNeeds: {
              restDays: 2,
              sleepHours: 7,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'moderate'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 0,
            averageDuration: 45,
            preferredFocusAreas: [],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.7,
            consistencyScore: 0.5,
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
        },
        currentSelections: {},
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      // This should not throw but should log warnings
      await expect(aiService.setContext(invalidContext)).resolves.not.toThrow();
    });
  });

  describe('Service Health Status', () => {
    it('should provide health status after initialization', async () => {
      const mockUserProfile: UserProfile = {
        fitnessLevel: 'some experience',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 60,
          equipmentConstraints: ['dumbbells'],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 45,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
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

      const context: GlobalAIContext = {
        userProfile: mockUserProfile,
        currentSelections: {},
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);

      const healthStatus = aiService.getHealthStatus();
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.cacheSize).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.errorRate).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Analysis Generation', () => {
    it('should generate analysis after successful initialization', async () => {
      const mockUserProfile: UserProfile = {
        fitnessLevel: 'some experience',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 60,
          equipmentConstraints: ['dumbbells'],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 45,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
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

      const context: GlobalAIContext = {
        userProfile: mockUserProfile,
        currentSelections: {
          customization_energy: 3,
          customization_focus: 'strength',
          customization_duration: 45
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);

      const analysis = await aiService.analyze();
      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });
  });
}); 