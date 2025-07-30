import { renderHook, act } from '@testing-library/react';
import { useWorkoutGeneration } from '../useWorkoutGeneration';
import { SelectionAnalysisFactory } from '../../services/ai/domains/confidence/selection/SelectionAnalysisFactory';

// Mock the SelectionAnalysisFactory
jest.mock('../../services/ai/domains/confidence/selection/SelectionAnalysisFactory');

describe('useWorkoutGeneration - Selection Analysis Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include selection analysis in the return object', () => {
    const { result } = renderHook(() => useWorkoutGeneration());
    
    expect(result.current.selectionAnalysis).toBeNull();
    expect(result.current.selectionAnalysisProgress).toBe(0);
  });

  it('should start selection analysis when workout generation begins', async () => {
    const mockAnalysis = {
      overallScore: 0.85,
      factors: {
        goalAlignment: { score: 0.9, status: 'excellent', reasoning: 'Great alignment' },
        intensityMatch: { score: 0.8, status: 'good', reasoning: 'Good match' },
        durationFit: { score: 0.7, status: 'good', reasoning: 'Fits well' },
        recoveryRespect: { score: 0.9, status: 'excellent', reasoning: 'Respects recovery' },
        equipmentOptimization: { score: 0.8, status: 'good', reasoning: 'Optimized' }
      },
      insights: [],
      suggestions: [],
      educationalContent: []
    };

    (SelectionAnalysisFactory.analyzeSelections as jest.Mock).mockResolvedValue(mockAnalysis);

    const { result } = renderHook(() => useWorkoutGeneration());

    const mockRequest = {
      type: 'quick' as const,
      userProfile: {
        fitnessLevel: 'intermediate' as const,
        goals: ['strength'],
        preferences: { workoutStyle: ['strength'], timePreference: 'morning', intensityPreference: 'moderate', advancedFeatures: false, aiAssistanceLevel: 'moderate' },
        basicLimitations: { injuries: [], availableEquipment: ['dumbbells'], availableLocations: ['home'] },
        enhancedLimitations: { timeConstraints: 30, equipmentConstraints: ['dumbbells'], locationConstraints: ['home'], recoveryNeeds: { restDays: 2, sleepHours: 8, hydrationLevel: 'moderate' }, mobilityLimitations: [], progressionRate: 'moderate' },
        workoutHistory: { estimatedCompletedWorkouts: 10, averageDuration: 30, preferredFocusAreas: ['strength'], progressiveEnhancementUsage: {}, aiRecommendationAcceptance: 0.8, consistencyScore: 0.7, plateauRisk: 'low' },
        learningProfile: { prefersSimplicity: false, explorationTendency: 'moderate', feedbackPreference: 'detailed', learningStyle: 'mixed', motivationType: 'achievement', adaptationSpeed: 'moderate' }
      },
      workoutFocusData: {
        customization_focus: 'strength',
        customization_energy: { rating: 7, categories: ['moderate'] },
        customization_duration: 30
      }
    };

    await act(async () => {
      await result.current.generateWorkout(mockRequest);
    });

    expect(SelectionAnalysisFactory.analyzeSelections).toHaveBeenCalledWith(
      mockRequest.userProfile,
      mockRequest.workoutFocusData,
      expect.objectContaining({
        generationType: 'quick',
        userExperience: 'intermediate',
        timeOfDay: expect.any(String)
      })
    );
  });

  it('should handle selection analysis failures gracefully', async () => {
    (SelectionAnalysisFactory.analyzeSelections as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

    const { result } = renderHook(() => useWorkoutGeneration());

    const mockRequest = {
      type: 'quick' as const,
      userProfile: {
        fitnessLevel: 'beginner' as const,
        goals: ['weight loss'],
        preferences: { workoutStyle: ['cardio'], timePreference: 'morning', intensityPreference: 'low', advancedFeatures: false, aiAssistanceLevel: 'minimal' },
        basicLimitations: { injuries: [], availableEquipment: ['none'], availableLocations: ['home'] },
        enhancedLimitations: { timeConstraints: 20, equipmentConstraints: ['none'], locationConstraints: ['home'], recoveryNeeds: { restDays: 3, sleepHours: 8, hydrationLevel: 'low' }, mobilityLimitations: [], progressionRate: 'conservative' },
        workoutHistory: { estimatedCompletedWorkouts: 0, averageDuration: 0, preferredFocusAreas: [], progressiveEnhancementUsage: {}, aiRecommendationAcceptance: 0.5, consistencyScore: 0.3, plateauRisk: 'high' },
        learningProfile: { prefersSimplicity: true, explorationTendency: 'low', feedbackPreference: 'simple', learningStyle: 'visual', motivationType: 'intrinsic', adaptationSpeed: 'slow' }
      },
      workoutFocusData: {
        customization_focus: 'cardio',
        customization_energy: { rating: 5, categories: ['low'] },
        customization_duration: 20
      }
    };

    await act(async () => {
      await result.current.generateWorkout(mockRequest);
    });

    // Should not throw error and should continue without analysis
    expect(result.current.selectionAnalysis).toBeNull();
  });
}); 