import { AIServiceExternalStrategy } from '../AIServiceExternalStrategy';
import { GlobalAIContext, PrioritizedRecommendation } from '../../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile, AIAssistanceLevel } from '../../../../../types';

// Mock external strategy for testing
class MockExternalStrategy {
  private isHealthyValue = true;
  private shouldFail = false;

  constructor(shouldFail = false) {
    this.shouldFail = shouldFail;
  }

  async generateWorkout(request: any): Promise<any> {
    if (this.shouldFail) {
      throw new Error('Mock workout generation failed');
    }
    return {
      id: 'mock_workout_1',
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 10 },
        { name: 'Squats', sets: 3, reps: 15 }
      ],
      duration: 30,
      intensity: 'moderate'
    };
  }

  async generateRecommendations(context: any): Promise<PrioritizedRecommendation[]> {
    if (this.shouldFail) {
      throw new Error('Mock recommendations failed');
    }
    return [
      {
        id: 'rec_1',
        priority: 'high',
        category: 'optimization',
        targetComponent: 'energy',
        title: 'Optimize Energy Level',
        description: 'Consider adjusting energy level for better performance',
        reasoning: 'Based on your current selections and fitness level',
        confidence: 0.85,
        risk: 'low'
      }
    ];
  }

  async enhanceInsights(insights: any[], context: any): Promise<any> {
    if (this.shouldFail) {
      throw new Error('Mock insight enhancement failed');
    }
    return insights.map(insight => ({
      ...insight,
      enhanced: true,
      aiGenerated: true
    }));
  }

  async analyzeUserPreferences(context: any): Promise<any> {
    if (this.shouldFail) {
      throw new Error('Mock user analysis failed');
    }
    return {
      preferredIntensity: 'moderate',
      preferredDuration: 45,
      preferredFocus: 'strength',
      confidence: 0.8
    };
  }

  isHealthy(): boolean {
    return this.isHealthyValue;
  }

  setHealthStatus(healthy: boolean): void {
    this.isHealthyValue = healthy;
  }
}

// Mock context and data for testing
const mockUserProfile: UserProfile = {
  fitnessLevel: 'intermediate',
  age: 30,
  weight: 70,
  height: 175,
  goals: ['strength', 'endurance'],
  experience: 2
};

const mockWorkoutOptions: PerWorkoutOptions = {
  customization_energy: 7,
  customization_soreness: ['legs', 'back'],
  customization_focus: 'strength',
  customization_duration: 45,
  customization_equipment: ['dumbbells', 'resistance bands']
};

const mockContext: GlobalAIContext = {
  userProfile: mockUserProfile,
  currentSelections: mockWorkoutOptions,
  sessionHistory: [],
  preferences: {
    aiAssistanceLevel: 'moderate' as AIAssistanceLevel,
    showLearningInsights: true,
    autoApplyLowRiskRecommendations: false
  }
};

describe('AIServiceExternalStrategy', () => {
  let externalStrategy: AIServiceExternalStrategy;
  let mockStrategy: MockExternalStrategy;

  beforeEach(() => {
    externalStrategy = new AIServiceExternalStrategy();
    mockStrategy = new MockExternalStrategy();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(externalStrategy.isConfigured()).toBe(false);
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
      
      const config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('none');
      expect(config.isConfigured).toBe(false);
      expect(config.healthStatus).toBe('unhealthy');
    });
  });

  describe('setExternalStrategy', () => {
    it('should configure valid external strategy', () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      
      expect(externalStrategy.isConfigured()).toBe(true);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      const config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('MockExternalStrategy');
      expect(config.isConfigured).toBe(true);
      expect(config.healthStatus).toBe('healthy');
    });

    it('should handle invalid strategy gracefully', () => {
      const invalidStrategy = { invalid: 'strategy' };
      externalStrategy.setExternalStrategy(invalidStrategy);
      
      expect(externalStrategy.isConfigured()).toBe(false);
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
      
      const config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('none');
      expect(config.isConfigured).toBe(false);
      expect(config.healthStatus).toBe('unhealthy');
    });

    it('should handle null strategy', () => {
      externalStrategy.setExternalStrategy(null as any);
      
      expect(externalStrategy.isConfigured()).toBe(false);
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
    });
  });

  describe('generateWorkout', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should generate workout successfully', async () => {
      const result = await externalStrategy.generateWorkout(mockWorkoutOptions, mockContext);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('mock_workout_1');
      expect(result.exercises).toHaveLength(2);
      expect(result.duration).toBe(30);
    });

    it('should throw error when strategy not configured', async () => {
      externalStrategy.reset();
      
      await expect(
        externalStrategy.generateWorkout(mockWorkoutOptions, mockContext)
      ).rejects.toThrow('External AI strategy not configured');
    });

    it('should handle workout generation failure', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateWorkout(mockWorkoutOptions, mockContext)
      ).rejects.toThrow('Mock workout generation failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should validate context before generating workout', async () => {
      const invalidContext = { ...mockContext, userProfile: null };
      
      await expect(
        externalStrategy.generateWorkout(mockWorkoutOptions, invalidContext as any)
      ).rejects.toThrow('Invalid context provided for workout generation');
    });
  });

  describe('generateRecommendations', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should generate recommendations successfully', async () => {
      const result = await externalStrategy.generateRecommendations(mockContext);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rec_1');
      expect(result[0].priority).toBe('high');
    });

    it('should throw error when strategy not configured', async () => {
      externalStrategy.reset();
      
      await expect(
        externalStrategy.generateRecommendations(mockContext)
      ).rejects.toThrow('External AI strategy not configured');
    });

    it('should handle recommendations generation failure', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.generateRecommendations(mockContext)
      ).rejects.toThrow('Mock recommendations failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should validate context before generating recommendations', async () => {
      const invalidContext = { ...mockContext, currentSelections: null };
      
      await expect(
        externalStrategy.generateRecommendations(invalidContext as any)
      ).rejects.toThrow('Invalid context provided for recommendations');
    });
  });

  describe('enhanceInsights', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should enhance insights successfully', async () => {
      const originalInsights = [
        { id: '1', message: 'Test insight 1' },
        { id: '2', message: 'Test insight 2' }
      ];
      
      const result = await externalStrategy.enhanceInsights(originalInsights, mockContext);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].enhanced).toBe(true);
      expect(result[0].aiGenerated).toBe(true);
    });

    it('should throw error when strategy not configured', async () => {
      externalStrategy.reset();
      
      await expect(
        externalStrategy.enhanceInsights([], mockContext)
      ).rejects.toThrow('External AI strategy not configured');
    });

    it('should handle insight enhancement failure', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.enhanceInsights([], mockContext)
      ).rejects.toThrow('Mock insight enhancement failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should validate context before enhancing insights', async () => {
      const invalidContext = { ...mockContext, sessionHistory: null };
      
      await expect(
        externalStrategy.enhanceInsights([], invalidContext as any)
      ).rejects.toThrow('Invalid context provided for insight enhancement');
    });
  });

  describe('analyzeUserPreferences', () => {
    beforeEach(() => {
      externalStrategy.setExternalStrategy(mockStrategy);
    });

    it('should analyze user preferences successfully', async () => {
      const result = await externalStrategy.analyzeUserPreferences(mockContext);
      
      expect(result).toBeDefined();
      expect(result.preferredIntensity).toBe('moderate');
      expect(result.preferredDuration).toBe(45);
      expect(result.preferredFocus).toBe('strength');
      expect(result.confidence).toBe(0.8);
    });

    it('should throw error when strategy not configured', async () => {
      externalStrategy.reset();
      
      await expect(
        externalStrategy.analyzeUserPreferences(mockContext)
      ).rejects.toThrow('External AI strategy not configured');
    });

    it('should handle user analysis failure', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      await expect(
        externalStrategy.analyzeUserPreferences(mockContext)
      ).rejects.toThrow('Mock user analysis failed');
      
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should validate context before analyzing preferences', async () => {
      const invalidContext = { ...mockContext, preferences: null };
      
      await expect(
        externalStrategy.analyzeUserPreferences(invalidContext as any)
      ).rejects.toThrow('Invalid context provided for user preference analysis');
    });
  });

  describe('Health Status Management', () => {
    it('should track health status changes', () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
      
      // Simulate health degradation
      mockStrategy.setHealthStatus(false);
      
      // Force health check by calling getConfig
      const config = externalStrategy.getConfig();
      expect(config.healthStatus).toBe('degraded');
      
      // Verify that getHealthStatus reflects the degraded status
      expect(externalStrategy.getHealthStatus()).toBe('error');
    });

    it('should handle strategy without health check methods', () => {
      const basicStrategy = {
        generateWorkout: jest.fn(),
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn()
      };
      
      externalStrategy.setExternalStrategy(basicStrategy);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
    });

    it('should handle strategy with getHealthStatus method', () => {
      const strategyWithHealthStatus = {
        generateWorkout: jest.fn(),
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn(),
        getHealthStatus: () => ({ status: 'healthy' })
      };
      
      externalStrategy.setExternalStrategy(strategyWithHealthStatus);
      expect(externalStrategy.getHealthStatus()).toBe('configured');
    });
  });

  describe('Error Handling', () => {
    it('should track last error', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      // Trigger an error and wait for it to complete
      try {
        await externalStrategy.generateWorkout(mockWorkoutOptions, mockContext);
      } catch (error) {
        // Expected to fail
      }
      
      const lastError = externalStrategy.getLastError();
      expect(lastError).toBeDefined();
      expect(lastError?.message).toContain('Mock workout generation failed');
    });

    it('should clear errors when health improves', async () => {
      const failingStrategy = new MockExternalStrategy(true);
      externalStrategy.setExternalStrategy(failingStrategy);
      
      // Trigger an error and wait for it to complete
      try {
        await externalStrategy.generateWorkout(mockWorkoutOptions, mockContext);
      } catch (error) {
        // Expected to fail
      }
      expect(externalStrategy.getLastError()).toBeDefined();
      
      // Switch to healthy strategy
      externalStrategy.setExternalStrategy(mockStrategy);
      expect(externalStrategy.getLastError()).toBeNull();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset configuration completely', () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      expect(externalStrategy.isConfigured()).toBe(true);
      
      externalStrategy.reset();
      
      expect(externalStrategy.isConfigured()).toBe(false);
      expect(externalStrategy.getHealthStatus()).toBe('not_configured');
      expect(externalStrategy.getLastError()).toBeNull();
      
      const config = externalStrategy.getConfig();
      expect(config.strategyType).toBe('none');
      expect(config.isConfigured).toBe(false);
      expect(config.healthStatus).toBe('unhealthy');
    });
  });

  describe('Configuration Management', () => {
    it('should return configuration copy', () => {
      externalStrategy.setExternalStrategy(mockStrategy);
      
      const config1 = externalStrategy.getConfig();
      const config2 = externalStrategy.getConfig();
      
      expect(config1).not.toBe(config2); // Should be different objects
      expect(config1).toEqual(config2); // But same content
    });

    it('should update configuration on strategy change', () => {
      const config1 = externalStrategy.getConfig();
      expect(config1.strategyType).toBe('none');
      
      externalStrategy.setExternalStrategy(mockStrategy);
      
      const config2 = externalStrategy.getConfig();
      expect(config2.strategyType).toBe('MockExternalStrategy');
    });
  });
}); 