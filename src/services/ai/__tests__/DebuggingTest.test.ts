/**
 * Debugging Test - Tests the debugging and state validation features
 * This test verifies that our Day 1 Afternoon debugging enhancements are working
 */

import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';

describe('AI Service Debugging Features', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('State Validation', () => {
    it('should provide health status with debugging information', () => {
      const healthStatus = aiService.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.cacheSize).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.errorRate).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should provide performance metrics', () => {
      const metrics = aiService.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeLessThanOrEqual(1);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Context Setting with Validation', () => {
    it('should set context and provide validation information', async () => {
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
      
      // Verify context was set
      const retrievedContext = aiService.getContext();
      expect(retrievedContext).toBeDefined();
      expect(retrievedContext?.userProfile.fitnessLevel).toBe('some experience');
      
      // Check health status after context setting
      const healthStatus = aiService.getHealthStatus();
      expect(healthStatus.status).not.toBe('unhealthy');
      
      // Check performance metrics
      const metrics = aiService.getPerformanceMetrics();
      expect(metrics.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Debugging', () => {
    it('should handle invalid context gracefully', async () => {
      const invalidContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: [], // Empty goals should cause issues
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

      // This should not throw but should be handled gracefully
      await expect(aiService.setContext(invalidContext)).resolves.not.toThrow();
      
      // Check that we can still get health status
      const healthStatus = aiService.getHealthStatus();
      expect(healthStatus).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics during operations', async () => {
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

      // Get initial metrics
      const initialMetrics = aiService.getPerformanceMetrics();
      
      // Perform operations
      await aiService.setContext(context);
      const analysis = await aiService.analyze();
      
      // Get final metrics
      const finalMetrics = aiService.getPerformanceMetrics();
      
      // Verify metrics were updated
      expect(finalMetrics.averageExecutionTime).toBeGreaterThanOrEqual(initialMetrics.averageExecutionTime);
      expect(finalMetrics.memoryUsage).toBeGreaterThanOrEqual(0);
      
      // Verify analysis was generated
      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });
  });
}); 