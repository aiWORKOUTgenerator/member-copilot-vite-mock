import { SelectionAnalyzer } from '../SelectionAnalyzer';
import { SelectionAnalysisFactory } from '../SelectionAnalysisFactory';
import { UserProfile } from '../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../types/workout-generation.types';
import { SelectionAnalysisContext } from '../types/selection-analysis.types';

// Mock user profile for testing
const mockUserProfile: UserProfile = {
  id: 'test-user',
  basicLimitations: {
    fitnessLevel: 'some experience',
    experience: 'intermediate',
    fitnessGoals: ['weight loss', 'strength building'],
    availableEquipment: ['dumbbells', 'resistance bands', 'yoga mat'],
    injuries: [],
    limitations: [],
    healthConditions: []
  }
};

// Mock workout options for testing
const mockWorkoutOptions: PerWorkoutOptions = {
  focus: 'strength training',
  energy: 'moderate',
  duration: 'medium',
  equipment: ['dumbbells', 'resistance bands']
};

// Mock context for testing
const mockContext: SelectionAnalysisContext = {
  generationType: 'detailed',
  userExperience: 'intermediate',
  previousWorkouts: 2,
  timeOfDay: 'morning'
};

describe('SelectionAnalyzer', () => {
  let analyzer: SelectionAnalyzer;

  beforeEach(() => {
    analyzer = new SelectionAnalyzer();
  });

  describe('Basic Functionality', () => {
    it('should create a SelectionAnalyzer instance', () => {
      expect(analyzer).toBeInstanceOf(SelectionAnalyzer);
    });

    it('should have default configuration', () => {
      const config = analyzer.getConfig();
      expect(config.weights).toBeDefined();
      expect(config.thresholds).toBeDefined();
      expect(config.enableCaching).toBe(true);
    });

    it('should have all required analyzers', () => {
      const analyzers = analyzer.getAnalyzers();
      expect(analyzers).toHaveLength(5);
      
      const analyzerNames = analyzers.map(a => a.getAnalyzerName());
      expect(analyzerNames).toContain('goalAlignment');
      expect(analyzerNames).toContain('intensityMatch');
      expect(analyzerNames).toContain('durationFit');
      expect(analyzerNames).toContain('recoveryRespect');
      expect(analyzerNames).toContain('equipmentOptimization');
    });
  });

  describe('Analysis Functionality', () => {
    it('should analyze selections and return valid results', async () => {
      const result = await analyzer.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
      expect(result.factors).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(result.educationalContent).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should return all required factors', async () => {
      const result = await analyzer.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      expect(result.factors.goalAlignment).toBeDefined();
      expect(result.factors.intensityMatch).toBeDefined();
      expect(result.factors.durationFit).toBeDefined();
      expect(result.factors.recoveryRespect).toBeDefined();
      expect(result.factors.equipmentOptimization).toBeDefined();
    });

    it('should return factors with valid scores', async () => {
      const result = await analyzer.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      Object.values(result.factors).forEach(factor => {
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(factor.score).toBeLessThanOrEqual(1);
        expect(factor.status).toBeDefined();
        expect(factor.reasoning).toBeDefined();
        expect(factor.impact).toBeDefined();
        expect(factor.details).toBeDefined();
      });
    });

    it('should generate insights based on analysis', async () => {
      const result = await analyzer.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      expect(result.insights.length).toBeGreaterThan(0);
      result.insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.title).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.factor).toBeDefined();
        expect(insight.priority).toBeDefined();
        expect(typeof insight.actionable).toBe('boolean');
      });
    });

    it('should generate suggestions when needed', async () => {
      const result = await analyzer.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      // Suggestions may or may not be present depending on the analysis
      if (result.suggestions.length > 0) {
        result.suggestions.forEach(suggestion => {
          expect(suggestion.id).toBeDefined();
          expect(suggestion.action).toBeDefined();
          expect(suggestion.description).toBeDefined();
          expect(suggestion.impact).toBeDefined();
          expect(suggestion.estimatedScoreIncrease).toBeGreaterThanOrEqual(0);
          expect(typeof suggestion.quickFix).toBe('boolean');
          expect(suggestion.category).toBeDefined();
          expect(suggestion.timeRequired).toBeDefined();
          expect(suggestion.priority).toBeDefined();
        });
      }
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      const newConfig = {
        weights: {
          goalAlignment: 0.3,
          intensityMatch: 0.3,
          durationFit: 0.2,
          recoveryRespect: 0.1,
          equipmentOptimization: 0.1
        }
      };

      analyzer.updateConfig(newConfig);
      const updatedConfig = analyzer.getConfig();
      expect(updatedConfig.weights.goalAlignment).toBe(0.3);
      expect(updatedConfig.weights.intensityMatch).toBe(0.3);
    });

    it('should maintain other configuration values when updating', () => {
      const originalConfig = analyzer.getConfig();
      const newConfig = {
        weights: {
          goalAlignment: 0.3,
          intensityMatch: 0.3,
          durationFit: 0.2,
          recoveryRespect: 0.1,
          equipmentOptimization: 0.1
        }
      };

      analyzer.updateConfig(newConfig);
      const updatedConfig = analyzer.getConfig();
      
      // Check that other values are preserved
      expect(updatedConfig.thresholds).toEqual(originalConfig.thresholds);
      expect(updatedConfig.enableCaching).toBe(originalConfig.enableCaching);
    });
  });

  describe('Caching', () => {
    it('should cache results when enabled', async () => {
      const analyzerWithCache = new SelectionAnalyzer({ enableCaching: true });
      
      const result1 = await analyzerWithCache.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);
      const result2 = await analyzerWithCache.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);

      expect(result1.overallScore).toBe(result2.overallScore);
      expect(result1.metadata.timestamp).toEqual(result2.metadata.timestamp);
    });

    it('should clear cache when requested', async () => {
      const analyzerWithCache = new SelectionAnalyzer({ enableCaching: true });
      
      await analyzerWithCache.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);
      analyzerWithCache.clearCache();
      
      const result = await analyzerWithCache.analyzeSelections(mockUserProfile, mockWorkoutOptions, mockContext);
      expect(result).toBeDefined();
    });
  });
});

describe('SelectionAnalysisFactory', () => {
  beforeEach(() => {
    SelectionAnalysisFactory.reset();
  });

  describe('Factory Functionality', () => {
    it('should create singleton instance', () => {
      const instance1 = SelectionAnalysisFactory.getInstance();
      const instance2 = SelectionAnalysisFactory.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create context correctly', () => {
      const context = SelectionAnalysisFactory.createContext('detailed', 'intermediate', 3, 'morning');
      
      expect(context.generationType).toBe('detailed');
      expect(context.userExperience).toBe('intermediate');
      expect(context.previousWorkouts).toBe(3);
      expect(context.timeOfDay).toBe('morning');
    });

    it('should create context with defaults', () => {
      const context = SelectionAnalysisFactory.createContext();
      
      expect(context.generationType).toBe('detailed');
      expect(context.userExperience).toBe('beginner');
      expect(context.environmentalFactors?.location).toBe('indoor');
    });
  });

  describe('Analysis Methods', () => {
    it('should analyze selections through factory', async () => {
      const result = await SelectionAnalysisFactory.analyzeSelections(
        mockUserProfile,
        mockWorkoutOptions,
        mockContext
      );

      if (result) {
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(1);
        expect(result.factors).toBeDefined();
        expect(result.insights).toBeDefined();
        expect(result.suggestions).toBeDefined();
        expect(result.educationalContent).toBeDefined();
      }
    });

    it('should provide quick analysis summary', async () => {
      const result = await SelectionAnalysisFactory.getQuickAnalysis(
        mockUserProfile,
        mockWorkoutOptions,
        mockContext
      );

      if (result) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(result.status).toBeDefined();
        expect(result.message).toBeDefined();
      }
    });
  });

  describe('Configuration Management', () => {
    it('should get and update configuration', () => {
      const config = SelectionAnalysisFactory.getConfig();
      expect(config.weights).toBeDefined();

      const newWeights = {
        goalAlignment: 0.3,
        intensityMatch: 0.3,
        durationFit: 0.2,
        recoveryRespect: 0.1,
        equipmentOptimization: 0.1
      };

      SelectionAnalysisFactory.updateConfig({ weights: newWeights });
      const updatedConfig = SelectionAnalysisFactory.getConfig();
      expect(updatedConfig.weights.goalAlignment).toBe(0.3);
    });

    it('should clear cache', () => {
      expect(() => SelectionAnalysisFactory.clearCache()).not.toThrow();
    });
  });
}); 