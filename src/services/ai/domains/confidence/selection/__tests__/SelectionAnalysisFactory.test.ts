import { SelectionAnalysisFactory } from '../SelectionAnalysisFactory';
import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';

describe('SelectionAnalysisFactory', () => {
  const mockUserProfile: UserProfile = {
    id: 'test-user',
    fitnessLevel: 'intermediate',
    experience: 'intermediate',
    goals: ['strength', 'endurance'],
    equipment: ['dumbbells', 'resistance_bands'],
    injuries: [],
    limitations: []
  };

  const mockWorkoutOptions: PerWorkoutOptions = {
    focus: 'strength',
    energy: 'moderate',
    duration: 'medium',
    equipment: ['dumbbells'],
    areas: ['upper_body', 'core']
  };

  describe('Feature Flag Integration', () => {
    it('should enable selection analysis when feature flag is enabled', () => {
      const isEnabled = SelectionAnalysisFactory.isSelectionAnalysisEnabled(mockUserProfile);
      expect(isEnabled).toBe(true);
    });

    it('should return null when user profile is not provided', () => {
      const isEnabled = SelectionAnalysisFactory.isSelectionAnalysisEnabled(undefined);
      expect(isEnabled).toBe(false);
    });

    it('should analyze selections when feature flag is enabled', async () => {
      const context = SelectionAnalysisFactory.createContext('detailed', 'intermediate');
      const result = await SelectionAnalysisFactory.analyzeSelections(
        mockUserProfile,
        mockWorkoutOptions,
        context
      );

      expect(result).not.toBeNull();
      expect(result?.overallScore).toBeGreaterThan(0);
      expect(result?.factors).toBeDefined();
      expect(result?.insights).toBeDefined();
      expect(result?.suggestions).toBeDefined();
      expect(result?.educationalContent).toBeDefined();
    });
  });

  describe('Context Creation', () => {
    it('should create valid analysis context', () => {
      const context = SelectionAnalysisFactory.createContext(
        'detailed',
        'intermediate',
        5,
        'morning'
      );

      expect(context.generationType).toBe('detailed');
      expect(context.userExperience).toBe('intermediate');
      expect(context.previousWorkouts).toBe(5);
      expect(context.timeOfDay).toBe('morning');
      expect(context.environmentalFactors).toBeDefined();
    });
  });

  describe('Quick Analysis', () => {
    it('should provide quick analysis summary', async () => {
      const context = SelectionAnalysisFactory.createContext('quick', 'beginner');
      const result = await SelectionAnalysisFactory.getQuickAnalysis(
        mockUserProfile,
        mockWorkoutOptions,
        context
      );

      expect(result).not.toBeNull();
      expect(result?.score).toBeGreaterThan(0);
      expect(result?.status).toMatch(/excellent|good|warning|poor/);
      expect(result?.message).toBeDefined();
    });
  });
}); 