import { AIServiceValidator } from '../AIServiceValidator';
import { 
  UnifiedAIAnalysis, 
  GlobalAIContext,
  ValidationResult,
  PrioritizedRecommendation
} from '../../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile } from '../../../../../types';
import { AIInsight } from '../../../../../types/insights';

describe('AIServiceValidator', () => {
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

  const mockInsights = {
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
  };

  const mockRecommendations: PrioritizedRecommendation[] = [
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
  ];

  const mockAnalysis: UnifiedAIAnalysis = {
    id: 'analysis_1',
    timestamp: new Date(),
    insights: mockInsights,
    crossComponentConflicts: [],
    recommendations: mockRecommendations,
    confidence: 0.8,
    reasoning: 'Analysis based on energy, soreness, focus, duration, and equipment parameters',
    performanceMetrics: {
      totalExecutionTime: 150,
      cacheHitRate: 0.2,
      memoryPeakUsage: 1024
    }
  };

  beforeEach(() => {
    validator = new AIServiceValidator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(validator).toBeInstanceOf(AIServiceValidator);
      expect(validator.isValidationEnabled()).toBe(false);
    });
  });

  describe('validateAnalysis', () => {
    it('should return default result when validation is disabled', async () => {
      const result = await validator.validateAnalysis(
        mockAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(true);
      expect(result.consistencyScore).toBe(1.0);
      expect(result.discrepancies).toHaveLength(0);
    });

    it('should validate analysis when validation is enabled', async () => {
      validator.setValidationMode(true);

      const result = await validator.validateAnalysis(
        mockAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(true);
      expect(result.consistencyScore).toBe(1.0);
      expect(result.discrepancies).toHaveLength(0);
    });

    it('should detect missing analysis id', async () => {
      validator.setValidationMode(true);
      const invalidAnalysis = { ...mockAnalysis, id: '' };

      const result = await validator.validateAnalysis(
        invalidAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.discrepancies).toHaveLength(1);
      expect(result.discrepancies[0].component).toBe('analysis_structure');
    });

    it('should detect missing insights domain', async () => {
      validator.setValidationMode(true);
      const invalidAnalysis = {
        ...mockAnalysis,
        insights: { ...mockInsights, energy: undefined }
      };

      const result = await validator.validateAnalysis(
        invalidAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.discrepancies.some(d => d.component === 'insights.energy')).toBe(true);
    });

    it('should detect invalid recommendation priority', async () => {
      validator.setValidationMode(true);
      const invalidAnalysis = {
        ...mockAnalysis,
        recommendations: [
          { ...mockRecommendations[0], priority: 'invalid' as any }
        ]
      };

      const result = await validator.validateAnalysis(
        invalidAnalysis,
        mockContext.currentSelections,
        mockContext
      );

      expect(result.isValid).toBe(false);
      expect(result.discrepancies.some(d => d.component.includes('priority'))).toBe(true);
    });

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
  });

  describe('setValidationMode', () => {
    it('should enable validation mode', () => {
      validator.setValidationMode(true);
      expect(validator.isValidationEnabled()).toBe(true);
    });

    it('should disable validation mode', () => {
      validator.setValidationMode(true);
      validator.setValidationMode(false);
      expect(validator.isValidationEnabled()).toBe(false);
    });
  });

  describe('getValidationSummary', () => {
    it('should return correct summary when validation is disabled', () => {
      const summary = validator.getValidationSummary();
      
      expect(summary.enabled).toBe(false);
      expect(summary.lastValidation).toBeUndefined();
    });

    it('should return correct summary when validation is enabled', () => {
      validator.setValidationMode(true);
      const summary = validator.getValidationSummary();
      
      expect(summary.enabled).toBe(true);
    });
  });
}); 