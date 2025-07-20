import { AIServiceExternalStrategy } from '../AIServiceExternalStrategy';
import { AIServiceExternalStrategyValidator } from '../AIServiceExternalStrategyValidator';
import { GlobalAIContext, PrioritizedRecommendation } from '../../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile, AIAssistanceLevel } from '../../../../../types';

// Mock external strategy for integration testing
class IntegrationMockStrategy {
  private callCount = 0;
  private shouldFail = false;

  constructor(shouldFail = false) {
    this.shouldFail = shouldFail;
  }

  async generateWorkout(request: any): Promise<any> {
    this.callCount++;
    if (this.shouldFail) {
      throw new Error('Integration workout generation failed');
    }
    
    // Validate request structure
    if (!request.userProfile || !request.workoutOptions) {
      throw new Error('Invalid workout request structure');
    }

    return {
      id: `integration_workout_${this.callCount}`,
      exercises: [
        { name: 'Integration Push-ups', sets: 3, reps: 12 },
        { name: 'Integration Squats', sets: 3, reps: 15 },
        { name: 'Integration Planks', sets: 2, duration: 30 }
      ],
      duration: request.preferences.duration,
      intensity: 'moderate', // Fixed intensity for consistent testing
      focus: request.preferences.focus,
      equipment: request.preferences.equipment
    };
  }

  async generateRecommendations(context: any): Promise<PrioritizedRecommendation[]> {
    this.callCount++;
    if (this.shouldFail) {
      throw new Error('Integration recommendations failed');
    }

    // Validate context structure
    if (!context.userProfile || !context.currentSelections) {
      throw new Error('Invalid context structure');
    }

    return [
      {
        id: `integration_rec_${this.callCount}`,
        priority: 'high',
        category: 'optimization',
        targetComponent: 'energy',
        title: 'Integration Energy Optimization',
        description: 'Optimize energy level based on integration analysis',
        reasoning: 'Based on integration context analysis',
        confidence: 0.9,
        risk: 'low'
      },
      {
        id: `integration_rec_${this.callCount}_2`,
        priority: 'medium',
        category: 'education',
        targetComponent: 'focus',
        title: 'Integration Focus Education',
        description: 'Learn about focus optimization',
        reasoning: 'Based on user preferences and history',
        confidence: 0.75,
        risk: 'low'
      }
    ];
  }

  async enhanceInsights(insights: any[], context: any): Promise<any> {
    this.callCount++;
    if (this.shouldFail) {
      throw new Error('Integration insight enhancement failed');
    }

    // Validate inputs
    if (!Array.isArray(insights)) {
      throw new Error('Insights must be an array');
    }

    if (!context.userProfile) {
      throw new Error('Invalid context for insight enhancement');
    }

    return insights.map((insight, index) => ({
      ...insight,
      enhanced: true,
      aiGenerated: true,
      integrationId: `enhanced_${this.callCount}_${index}`,
      confidence: 0.85
    }));
  }

  async analyzeUserPreferences(context: any): Promise<any> {
    this.callCount++;
    if (this.shouldFail) {
      throw new Error('Integration user analysis failed');
    }

    // Validate context
    if (!context.userProfile || !context.currentSelections) {
      throw new Error('Invalid context for user analysis');
    }

    return {
      preferredIntensity: 'moderate',
      preferredDuration: context.currentSelections.customization_duration,
      preferredFocus: context.currentSelections.customization_focus,
      confidence: 0.8,
      integrationAnalysis: true,
      callCount: this.callCount
    };
  }

  isHealthy(): boolean {
    return !this.shouldFail;
  }

  getCallCount(): number {
    return this.callCount;
  }

  resetCallCount(): void {
    this.callCount = 0;
  }
}

// Integration test data
const integrationUserProfile: UserProfile = {
  fitnessLevel: 'advanced',
  age: 28,
  weight: 75,
  height: 180,
  goals: ['strength', 'muscle_gain', 'endurance'],
  experience: 5
};

const integrationWorkoutOptions: PerWorkoutOptions = {
  customization_energy: 8,
  customization_soreness: ['shoulders', 'core'],
  customization_focus: 'strength_training',
  customization_duration: 60,
  customization_equipment: ['barbell', 'dumbbells', 'bench']
};

const integrationContext: GlobalAIContext = {
  userProfile: integrationUserProfile,
  currentSelections: integrationWorkoutOptions,
  sessionHistory: [
    {
      id: 'session_1',
      timestamp: new Date(),
      component: 'energy',
      action: 'recommendation_applied',
      recommendationId: 'rec_1'
    }
  ],
  preferences: {
    aiAssistanceLevel: 'high' as AIAssistanceLevel,
    showLearningInsights: true,
    autoApplyLowRiskRecommendations: true
  },
  environmentalFactors: {
    timeOfDay: 'afternoon',
    location: 'gym',
    availableTime: 90
  }
};

describe('External Strategy Integration Tests', () => {
  let externalStrategy: AIServiceExternalStrategy;
  let validator: AIServiceExternalStrategyValidator;
  let mockStrategy: IntegrationMockStrategy;

  beforeEach(() => {
    externalStrategy = new AIServiceExternalStrategy();
    validator = new AIServiceExternalStrategyValidator();
    mockStrategy = new IntegrationMockStrategy();
  });

  describe('Strategy Configuration Integration', () => {
    it('should configure and validate strategy together', () => {
      // Validate strategy before configuration
      const isValid = validator.validateStrategy(mockStrategy);
      expect(isValid).toBe(true);

      // Configure strategy
      externalStrategy.setExternalStrategy(mockStrategy);
      
      // Verify configuration
      expect(externalStrategy.isConfigured()).toBe(true);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      const config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('IntegrationMockStrategy');
      expect(config.isConfigured).toBe(true);
      expect(config.healthStatus).toBe('healthy');
    });

    it('should handle invalid strategy configuration', () => {
      const invalidStrategy = { invalid: 'strategy' };
      
      // Validate strategy should fail
      const isValid = validator.validateStrategy(invalidStrategy);
      expect(isValid).toBe(false);

      // Configuration should handle invalid strategy gracefully
      externalStrategy.setExternalStrategy(invalidStrategy);
      
      expect(externalStrategy.isConfigured()).toBe(false);
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
    });
  });

  describe('Workout Generation Integration', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should generate workout with full integration', async () => {
      const result = await externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('integration_workout_1');
      expect(result.exercises).toHaveLength(3);
      expect(result.duration).toBe(60);
      expect(result.intensity).toBe('moderate');
      expect(result.focus).toBe('strength_training');
      expect(result.equipment).toEqual(['barbell', 'dumbbells', 'bench']);
    });

    it('should validate request structure before generation', async () => {
      const invalidOptions = { ...integrationWorkoutOptions, customization_energy: 15 };
      
      await expect(
        externalStrategy.generateWorkout(invalidOptions, integrationContext)
      ).rejects.toThrow('Invalid workout request data');
    });

    it('should handle workout generation failure gracefully', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext)
      ).rejects.toThrow('Integration workout generation failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
      expect(externalStrategy.getLastError()).toBeDefined();
    });
  });

  describe('Recommendations Generation Integration', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should generate recommendations with full integration', async () => {
      const result = await externalStrategy.generateRecommendations(integrationContext);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      
      expect(result[0].id).toBe('integration_rec_1');
      expect(result[0].priority).toBe('high');
      expect(result[0].category).toBe('optimization');
      
      expect(result[1].id).toBe('integration_rec_1_2');
      expect(result[1].priority).toBe('medium');
      expect(result[1].category).toBe('education');
    });

    it('should validate context before generating recommendations', async () => {
      const invalidContext = { ...integrationContext, userProfile: null };
      
      await expect(
        externalStrategy.generateRecommendations(invalidContext as any)
      ).rejects.toThrow('Invalid context provided for recommendations');
    });

    it('should handle recommendations failure gracefully', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateRecommendations(integrationContext)
      ).rejects.toThrow('Integration recommendations failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });
  });

  describe('Insight Enhancement Integration', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should enhance insights with full integration', async () => {
      const originalInsights = [
        { id: '1', message: 'Energy level is optimal for strength training' },
        { id: '2', message: 'Consider longer rest periods between sets' },
        { id: '3', message: 'Focus on compound movements' }
      ];
      
      const result = await externalStrategy.enhanceInsights(originalInsights, integrationContext);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      
      result.forEach((insight, index) => {
        expect(insight.enhanced).toBe(true);
        expect(insight.aiGenerated).toBe(true);
        expect(insight.integrationId).toBe(`enhanced_1_${index}`);
        expect(insight.confidence).toBe(0.85);
        expect(insight.message).toBe(originalInsights[index].message);
      });
    });

    it('should validate context before enhancing insights', async () => {
      const invalidContext = { ...integrationContext, currentSelections: null };
      
      await expect(
        externalStrategy.enhanceInsights([], invalidContext as any)
      ).rejects.toThrow('Invalid context provided for insight enhancement');
    });

    it('should handle insight enhancement failure gracefully', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.enhanceInsights([], integrationContext)
      ).rejects.toThrow('Integration insight enhancement failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });
  });

  describe('User Preference Analysis Integration', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should analyze user preferences with full integration', async () => {
      const result = await externalStrategy.analyzeUserPreferences(integrationContext);
      
      expect(result).toBeDefined();
      expect(result.preferredIntensity).toBe('moderate');
      expect(result.preferredDuration).toBe(60);
      expect(result.preferredFocus).toBe('strength_training');
      expect(result.confidence).toBe(0.8);
      expect(result.integrationAnalysis).toBe(true);
      expect(result.callCount).toBe(1);
    });

    it('should validate context before analyzing preferences', async () => {
      const invalidContext = { ...integrationContext, sessionHistory: null };
      
      await expect(
        externalStrategy.analyzeUserPreferences(invalidContext as any)
      ).rejects.toThrow('Invalid context provided for user preference analysis');
    });

    it('should handle user analysis failure gracefully', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.analyzeUserPreferences(integrationContext)
      ).rejects.toThrow('Integration user analysis failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });
  });

  describe('Health Status Integration', () => {
    it('should track health status across operations', async () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      // Perform operations to test health tracking
      await externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      await externalStrategy.generateRecommendations(integrationContext);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      // Switch to failing strategy
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext)
      ).rejects.toThrow('Integration workout generation failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should recover health status when switching to healthy strategy', async () => {
      // Start with failing strategy
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext)
      ).rejects.toThrow('Integration workout generation failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
      
      // Switch to healthy strategy
      externalStrategy.setExternalStrategy(mockStrategy);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      expect(externalStrategy.getLastError()).toBeNull();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors consistently across all operations', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      // Test error handling for each operation
      const operations = [
        () => externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext),
        () => externalStrategy.generateRecommendations(integrationContext),
        () => externalStrategy.enhanceInsights([], integrationContext),
        () => externalStrategy.analyzeUserPreferences(integrationContext)
      ];
      
      for (const operation of operations) {
        await expect(operation()).rejects.toThrow();
        expect(externalStrategy.getHealthStatus()).toBe('error');
        expect(externalStrategy.getLastError()).toBeDefined();
      }
    });

    it('should clear errors when strategy is reset', async () => {
      const failingStrategy = new IntegrationMockStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateWorkout(integrationWorkoutOptions, integrationContext)
      ).rejects.toThrow();
      
      expect(externalStrategy.getLastError()).toBeDefined();
      
      externalStrategy.reset();
      expect(externalStrategy.getLastError()).toBeNull();
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
    });
  });

  describe('Configuration Management Integration', () => {
    it('should manage configuration changes properly', () => {
      // Initial state
      let config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('none');
      expect(config.isConfigured).toBe(false);
      
      // Configure strategy
      externalStrategy.setExternalStrategy(mockStrategy);
      config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('IntegrationMockStrategy');
      expect(config.isConfigured).toBe(true);
      
      // Reset configuration
      externalStrategy.reset();
      config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('none');
      expect(config.isConfigured).toBe(false);
    });

    it('should maintain configuration consistency', () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      
      const config1 = externalStrategy.getConfig();
      const config2 = externalStrategy.getConfig();
      
      // Configurations should be different objects but same content
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
      
      // Health status should be consistent
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      expect(config1.healthStatus).toBe('healthy');
    });
  });
}); 