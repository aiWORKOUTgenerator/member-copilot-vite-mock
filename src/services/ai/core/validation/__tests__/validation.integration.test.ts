import { AIServiceValidator } from '../AIServiceValidator';
import { 
  UnifiedAIAnalysis, 
  GlobalAIContext,
  ValidationResult,
  PrioritizedRecommendation
} from '../../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile } from '../../../../../types';
import { AIInsight } from '../../../../../types/insights';

describe('Validation System Integration', () => {
  let validator: AIServiceValidator;

  const mockUserProfile: UserProfile = {
    fitnessLevel: 'some experience',
    goals: ['strength'],
    experience: 'some experience',
    age: 30,
    weight: 70,
    height: 175,
    gender: 'male',
    injuries: [],
    preferences: {
      workoutDuration: 45,
      workoutFrequency: 3,
      preferredExercises: [],
      equipment: ['dumbbells']
    }
  };

  const mockContext: GlobalAIContext = {
    userProfile: mockUserProfile,
    currentSelections: {
      customization_energy: 5,
      customization_soreness: ['legs'],
      customization_focus: 'strength',
      customization_duration: 30,
      customization_equipment: ['dumbbells']
    },
    sessionHistory: [],
    preferences: {
      aiAssistanceLevel: 'moderate',
      showLearningInsights: true,
      autoApplyLowRiskRecommendations: false
    }
  };

  const createMockAnalysis = (overrides: Partial<UnifiedAIAnalysis> = {}): UnifiedAIAnalysis => ({
    id: 'analysis_1',
    timestamp: new Date(),
    insights: {
      energy: [
        {
          id: 'energy_1',
          type: 'info',
          message: 'Good energy level for strength training',
          recommendation: 'Proceed with planned workout',
          confidence: 0.8,
          actionable: true
        }
      ],
      soreness: [
        {
          id: 'soreness_1',
          type: 'warning',
          message: 'Leg soreness detected',
          recommendation: 'Consider lighter leg exercises',
          confidence: 0.7,
          actionable: true
        }
      ],
      focus: [
        {
          id: 'focus_1',
          type: 'info',
          message: 'Strength focus aligned with goals',
          recommendation: 'Continue with strength training',
          confidence: 0.9,
          actionable: true
        }
      ],
      duration: [
        {
          id: 'duration_1',
          type: 'info',
          message: '30-minute duration is appropriate',
          recommendation: 'Maintain current duration',
          confidence: 0.8,
          actionable: true
        }
      ],
      equipment: [
        {
          id: 'equipment_1',
          type: 'info',
          message: 'Dumbbells available for workout',
          recommendation: 'Use dumbbell exercises',
          confidence: 0.9,
          actionable: true
        }
      ]
    },
    crossComponentConflicts: [],
    recommendations: [
      {
        id: 'rec_1',
        priority: 'high',
        category: 'safety',
        targetComponent: 'soreness',
        title: 'Adjust Leg Exercises',
        description: 'Consider lighter leg exercises due to soreness',
        reasoning: 'Leg soreness detected, reduce intensity',
        confidence: 0.7,
        risk: 'medium'
      }
    ],
    confidence: 0.8,
    reasoning: 'Analysis based on energy, soreness, focus, duration, and equipment parameters',
    performanceMetrics: {
      totalExecutionTime: 150,
      cacheHitRate: 0.2,
      memoryPeakUsage: 1024
    },
    ...overrides
  });

  beforeEach(() => {
    validator = new AIServiceValidator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Validation Flow', () => {
    it('should perform complete validation with all components', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis();

      const result = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(true);
      expect(result.consistencyScore).toBe(1.0);
      expect(result.discrepancies).toHaveLength(0);
      expect(result.performanceComparison.newTime).toBeGreaterThan(0);
    });

    it('should handle validation mode changes correctly', async () => {
      const analysis = createMockAnalysis();

      // Test with validation disabled
      const resultDisabled = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );
      expect(resultDisabled.isValid).toBe(true);

      // Test with validation enabled
      validator.setValidationMode(true);
      const resultEnabled = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );
      expect(resultEnabled.isValid).toBe(true);
    });
  });

  describe('Validation Result Consistency', () => {
    it('should maintain consistent validation results for same input', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis();

      const result1 = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      const result2 = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.consistencyScore).toBe(result2.consistencyScore);
      expect(result1.discrepancies.length).toBe(result2.discrepancies.length);
    });

    it('should detect changes in analysis structure', async () => {
      validator.setValidationMode(true);
      
      const validAnalysis = createMockAnalysis();
      const invalidAnalysis = createMockAnalysis({ id: '' });

      const validResult = await validator.validateAnalysis(
        validAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      const invalidResult = await validator.validateAnalysis(
        invalidAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.discrepancies.some(d => d.component === 'analysis_structure')).toBe(true);
    });
  });

  describe('Validation Summary Generation', () => {
    it('should generate accurate validation summaries', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis();

      await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      const summary = validator.getValidationSummary();
      expect(summary.enabled).toBe(true);
    });

    it('should correctly categorize discrepancies by severity', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis({
        insights: {
          energy: undefined,
          soreness: [],
          focus: [],
          duration: [],
          equipment: []
        }
      });

      const result = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.discrepancies.length).toBeGreaterThan(0);
      expect(result.discrepancies.some(d => d.severity === 'high')).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should properly update and retrieve configuration', () => {
      expect(validator.isValidationEnabled()).toBe(false);
      
      validator.setValidationMode(true);
      expect(validator.isValidationEnabled()).toBe(true);
      
      validator.setValidationMode(false);
      expect(validator.isValidationEnabled()).toBe(false);
    });

    it('should maintain validation mode state across config updates', () => {
      validator.setValidationMode(true);
      expect(validator.isValidationEnabled()).toBe(true);
      
      // Simulate multiple config updates
      validator.setValidationMode(false);
      validator.setValidationMode(true);
      validator.setValidationMode(false);
      
      expect(validator.isValidationEnabled()).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle validation errors gracefully', async () => {
      validator.setValidationMode(true);
      const invalidAnalysis = null as any;

      const result = await validator.validateAnalysis(
        invalidAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.consistencyScore).toBe(0);
      expect(result.discrepancies).toHaveLength(1);
      expect(result.discrepancies[0].component).toBe('validation_error');
    });

    it('should provide meaningful error information', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis({
        recommendations: [
          {
            id: 'rec_1',
            priority: 'invalid' as any,
            category: 'safety',
            targetComponent: 'soreness',
            title: 'Test',
            description: 'Test',
            reasoning: 'Test',
            confidence: 0.7,
            risk: 'medium'
          }
        ]
      });

      const result = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.discrepancies.some(d => 
        d.component.includes('priority') && 
        d.expected.includes('critical|high|medium|low')
      )).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should complete validation within reasonable time', async () => {
      validator.setValidationMode(true);
      const analysis = createMockAnalysis();

      const startTime = performance.now();
      const result = await validator.validateAnalysis(
        analysis,
        mockContext.currentSelections,
        mockContext
      );
      const endTime = performance.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle large analysis objects', async () => {
      validator.setValidationMode(true);
      
      // Create analysis with many insights and recommendations
      const largeAnalysis = createMockAnalysis({
        insights: {
          energy: Array(100).fill(null).map((_, i) => ({
            id: `energy_${i}`,
            type: 'info',
            message: `Energy insight ${i}`,
            recommendation: `Recommendation ${i}`,
            confidence: 0.8,
            actionable: true
          })),
          soreness: Array(50).fill(null).map((_, i) => ({
            id: `soreness_${i}`,
            type: 'warning',
            message: `Soreness insight ${i}`,
            recommendation: `Recommendation ${i}`,
            confidence: 0.7,
            actionable: true
          })),
          focus: [],
          duration: [],
          equipment: []
        },
        recommendations: Array(200).fill(null).map((_, i) => ({
          id: `rec_${i}`,
          priority: 'medium',
          category: 'optimization',
          targetComponent: 'general',
          title: `Recommendation ${i}`,
          description: `Description ${i}`,
          reasoning: `Reasoning ${i}`,
          confidence: 0.8,
          risk: 'low'
        }))
      });

      const result = await validator.validateAnalysis(
        largeAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(true);
      expect(result.consistencyScore).toBe(1.0);
    });
  });
}); 