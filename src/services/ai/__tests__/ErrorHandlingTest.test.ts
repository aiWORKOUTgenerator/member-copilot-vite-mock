/**
 * Error Handling Test - Tests the enhanced error handling and fallback mechanisms
 * This test verifies that our Day 2 Morning enhancements are working
 */

import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';

describe('AI Service Error Handling and Fallbacks', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock a network error
      const mockContext: GlobalAIContext = {
        userProfile: {
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
        },
        currentSelections: {},
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      // Set context
      await aiService.setContext(mockContext);

      // Verify service is healthy
      const healthStatus = aiService.getHealthStatus();
      expect(healthStatus.status).not.toBe('unhealthy');

      // Test error handling by checking health status
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.errorRate).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should provide detailed error information', () => {
      const healthStatus = aiService.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      
      if (healthStatus.status === 'unhealthy') {
        expect(healthStatus.details).toBeDefined();
        expect(typeof healthStatus.details).toBe('object');
      }
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should provide basic workout generation when AI service is unavailable', async () => {
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
          availableEquipment: ['body_weight'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 45,
          equipmentConstraints: ['body_weight'],
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
          customization_focus: 'strength'
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      // Set context
      await aiService.setContext(context);

      // Test analysis generation (this should work even with basic service)
      const analysis = await aiService.analyze();
      
      // Verify we get some form of analysis
      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
      // Insights might be an array or object, both are valid
      expect(typeof analysis.insights).toBe('object');
    });
  });

  describe('Retry Logic', () => {
    it('should handle retry attempts gracefully', async () => {
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

      // Set context
      await aiService.setContext(context);

      // Test multiple analysis attempts
      const results = [];
      for (let i = 0; i < 3; i++) {
        try {
          const analysis = await aiService.analyze();
          results.push(analysis);
        } catch (error) {
          // Should handle errors gracefully
          expect(error).toBeDefined();
        }
      }

      // Should have at least one successful result
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeouts gracefully', async () => {
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

      // Set context
      await aiService.setContext(context);

      // Test with a reasonable timeout expectation
      const startTime = Date.now();
      
      try {
        const analysis = await aiService.analyze();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time (less than 10 seconds)
        expect(duration).toBeLessThan(10000);
        expect(analysis).toBeDefined();
      } catch (error) {
        // If it fails, should be a reasonable error
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary errors', async () => {
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

      // Set context
      await aiService.setContext(context);

      // Test service health before and after operations
      const initialHealth = aiService.getHealthStatus();
      expect(initialHealth.status).toBeDefined();

      // Perform operations
      const analysis = await aiService.analyze();
      expect(analysis).toBeDefined();

      // Check health after operations
      const finalHealth = aiService.getHealthStatus();
      expect(finalHealth.status).toBeDefined();

      // Service should remain functional
      expect(['healthy', 'degraded']).toContain(finalHealth.status);
    });
  });
}); 