import {
  selectInsightTemplate,
  selectGoalAlignmentTemplate,
  selectIntensityMatchTemplate,
  selectDurationFitTemplate,
  selectRecoveryRespectTemplate,
  selectEquipmentOptimizationTemplate,
  InsightContext
} from '../content/InsightTemplates';
import {
  getApplicableSuggestions,
  getFactorSuggestions,
  getQuickFixSuggestions,
  SuggestionContext
} from '../content/SuggestionDatabase';
import {
  getApplicableEducationalContent,
  getCategoryEducationalContent,
  getLowScoreEducationalContent,
  getBeginnerEducationalContent,
  EducationalContext
} from '../content/EducationalContent';

// Mock user profiles for testing
const mockBeginnerProfile = {
  fitnessLevel: 'beginner' as const,
  goals: ['weight loss'],
  preferences: {
    workoutStyle: ['cardio'],
    timePreference: 'morning',
    intensityPreference: 'low',
    advancedFeatures: false,
    aiAssistanceLevel: 'high'
  },
  basicLimitations: {
    injuries: [],
    availableEquipment: ['none'],
    availableLocations: ['home']
  },
  enhancedLimitations: {
    timeConstraints: 20,
    equipmentConstraints: ['none'],
    locationConstraints: ['home'],
    recoveryNeeds: {
      restDays: 3,
      sleepHours: 8,
      hydrationLevel: 'high'
    },
    mobilityLimitations: [],
    progressionRate: 'slow'
  },
  workoutHistory: {
    estimatedCompletedWorkouts: 2,
    averageDuration: 15,
    preferredFocusAreas: ['cardio'],
    progressiveEnhancementUsage: {},
    aiRecommendationAcceptance: 0.9,
    consistencyScore: 0.3,
    plateauRisk: 'high'
  },
  learningProfile: {
    prefersSimplicity: true,
    explorationTendency: 'low',
    feedbackPreference: 'simple',
    learningStyle: 'visual',
    motivationType: 'support',
    adaptationSpeed: 'slow'
  }
};

const mockAdvancedProfile = {
  fitnessLevel: 'advanced' as const,
  goals: ['strength', 'muscle building'],
  preferences: {
    workoutStyle: ['strength'],
    timePreference: 'evening',
    intensityPreference: 'high',
    advancedFeatures: true,
    aiAssistanceLevel: 'low'
  },
  basicLimitations: {
    injuries: ['knee'],
    availableEquipment: ['dumbbells', 'barbell', 'bench'],
    availableLocations: ['gym', 'home']
  },
  enhancedLimitations: {
    timeConstraints: 60,
    equipmentConstraints: ['dumbbells', 'barbell'],
    locationConstraints: ['gym'],
    recoveryNeeds: {
      restDays: 1,
      sleepHours: 7,
      hydrationLevel: 'moderate'
    },
    mobilityLimitations: ['knee'],
    progressionRate: 'fast'
  },
  workoutHistory: {
    estimatedCompletedWorkouts: 50,
    averageDuration: 45,
    preferredFocusAreas: ['strength'],
    progressiveEnhancementUsage: { progressiveOverload: true },
    aiRecommendationAcceptance: 0.3,
    consistencyScore: 0.9,
    plateauRisk: 'low'
  },
  learningProfile: {
    prefersSimplicity: false,
    explorationTendency: 'high',
    feedbackPreference: 'detailed',
    learningStyle: 'kinesthetic',
    motivationType: 'achievement',
    adaptationSpeed: 'fast'
  }
};

const mockIntermediateProfile = {
  fitnessLevel: 'intermediate' as const,
  goals: ['endurance'],
  preferences: {
    workoutStyle: ['cardio'],
    timePreference: 'afternoon',
    intensityPreference: 'moderate',
    advancedFeatures: false,
    aiAssistanceLevel: 'moderate'
  },
  basicLimitations: {
    injuries: [],
    availableEquipment: ['treadmill', 'dumbbells'],
    availableLocations: ['home', 'gym']
  },
  enhancedLimitations: {
    timeConstraints: 30,
    equipmentConstraints: ['treadmill'],
    locationConstraints: ['home'],
    recoveryNeeds: {
      restDays: 2,
      sleepHours: 7,
      hydrationLevel: 'moderate'
    },
    mobilityLimitations: [],
    progressionRate: 'moderate'
  },
  workoutHistory: {
    estimatedCompletedWorkouts: 15,
    averageDuration: 30,
    preferredFocusAreas: ['cardio'],
    progressiveEnhancementUsage: {},
    aiRecommendationAcceptance: 0.7,
    consistencyScore: 0.6,
    plateauRisk: 'medium'
  },
  learningProfile: {
    prefersSimplicity: false,
    explorationTendency: 'moderate',
    feedbackPreference: 'balanced',
    learningStyle: 'mixed',
    motivationType: 'health',
    adaptationSpeed: 'moderate'
  }
};

describe('Educational Content System - Insight Templates', () => {
  describe('Goal Alignment Templates', () => {
    it('should select weight loss template for poor goal alignment', () => {
      const context: InsightContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 30
        },
        factorScore: 0.3,
        factorName: 'goalAlignment'
      };

      const template = selectGoalAlignmentTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Selection-Goal Mismatch');
      expect(template?.suggestion).toContain('Cardio');
    });

    it('should select strength template for strength goals', () => {
      const context: InsightContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScore: 0.4,
        factorName: 'goalAlignment'
      };

      const template = selectGoalAlignmentTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Goal-Focus Misalignment');
    });

    it('should return null for good alignment', () => {
      const context: InsightContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScore: 0.8,
        factorName: 'goalAlignment'
      };

      const template = selectGoalAlignmentTemplate(context);
      expect(template).toBeNull();
    });
  });

  describe('Intensity Match Templates', () => {
    it('should select beginner template for high intensity', () => {
      const context: InsightContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 9, categories: ['high'] },
          customization_duration: 20
        },
        factorScore: 0.3,
        factorName: 'intensityMatch'
      };

      const template = selectIntensityMatchTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Intensity Too High');
    });

    it('should select advanced template for low intensity', () => {
      const context: InsightContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 3, categories: ['low'] },
          customization_duration: 45
        },
        factorScore: 0.4,
        factorName: 'intensityMatch'
      };

      const template = selectIntensityMatchTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Intensity Below Your Level');
    });
  });

  describe('Duration Fit Templates', () => {
    it('should select beginner template for long duration', () => {
      const context: InsightContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 45
        },
        factorScore: 0.3,
        factorName: 'durationFit'
      };

      const template = selectDurationFitTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Duration May Be Too Long');
    });

    it('should select advanced template for short duration', () => {
      const context: InsightContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 15
        },
        factorScore: 0.4,
        factorName: 'durationFit'
      };

      const template = selectDurationFitTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Short Duration for Your Level');
    });
  });

  describe('Recovery Respect Templates', () => {
    it('should select injury template for high intensity with injuries', () => {
      const context: InsightContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 9, categories: ['high'] },
          customization_duration: 45
        },
        factorScore: 0.3,
        factorName: 'recoveryRespect'
      };

      const template = selectRecoveryRespectTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('High Intensity with Injury Risk');
    });
  });

  describe('Equipment Optimization Templates', () => {
    it('should select limited equipment template', () => {
      const context: InsightContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 20
        },
        factorScore: 0.3,
        factorName: 'equipmentOptimization'
      };

      const template = selectEquipmentOptimizationTemplate(context);
      expect(template).toBeTruthy();
      expect(template?.title).toContain('Equipment Limitations');
    });
  });
});

describe('Educational Content System - Suggestion Database', () => {
  describe('Applicable Suggestions', () => {
    it('should return suggestions for poor goal alignment', () => {
      const context: SuggestionContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 30
        },
        factorScores: {
          goalAlignment: 0.3,
          intensityMatch: 0.7,
          durationFit: 0.6,
          recoveryRespect: 0.8,
          equipmentOptimization: 0.4
        },
        overallScore: 0.56
      };

      const suggestions = getApplicableSuggestions(context, 3);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe('goals');
    });

    it('should return quick fix suggestions', () => {
      const context: SuggestionContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScores: {
          goalAlignment: 0.3,
          intensityMatch: 0.2,
          durationFit: 0.3,
          recoveryRespect: 0.8,
          equipmentOptimization: 0.4
        },
        overallScore: 0.4
      };

      const quickFixes = getQuickFixSuggestions(context, 3);
      expect(quickFixes.length).toBeGreaterThan(0);
      expect(quickFixes.every(s => s.quickFix)).toBe(true);
    });

    it('should handle empty suggestions gracefully', () => {
      const context: SuggestionContext = {
        userProfile: mockAdvancedProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScores: {
          goalAlignment: 0.9,
          intensityMatch: 0.9,
          durationFit: 0.9,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.9
        },
        overallScore: 0.9
      };

      const suggestions = getApplicableSuggestions(context, 3);
      expect(suggestions).toEqual([]);
    });
  });

  describe('Factor-Specific Suggestions', () => {
    it('should return suggestions for specific factors', () => {
      const context: SuggestionContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScores: {
          goalAlignment: 0.3,
          intensityMatch: 0.2,
          durationFit: 0.3,
          recoveryRespect: 0.8,
          equipmentOptimization: 0.4
        },
        overallScore: 0.4
      };

      const intensitySuggestions = getFactorSuggestions('intensity', context, 2);
      expect(intensitySuggestions.length).toBeGreaterThan(0);
      expect(intensitySuggestions.every(s => s.category === 'intensity')).toBe(true);
    });
  });
});

describe('Educational Content System - Educational Content', () => {
  describe('Applicable Educational Content', () => {
    it('should return content for beginners', () => {
      const context: EducationalContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 20
        },
        factorScores: {
          goalAlignment: 0.7,
          intensityMatch: 0.6,
          durationFit: 0.8,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.4
        },
        overallScore: 0.68
      };

      const content = getApplicableEducationalContent(context, 3);
      expect(content.length).toBeGreaterThan(0);
      expect(content.some(c => c.targetAudience === 'beginner')).toBe(true);
    });

    it('should return content for low-scoring factors', () => {
      const context: EducationalContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'strength',
          customization_energy: { rating: 8, categories: ['high'] },
          customization_duration: 45
        },
        factorScores: {
          goalAlignment: 0.3,
          intensityMatch: 0.2,
          durationFit: 0.3,
          recoveryRespect: 0.8,
          equipmentOptimization: 0.4
        },
        overallScore: 0.4
      };

      const lowScoreContent = getLowScoreEducationalContent(context, 2);
      expect(lowScoreContent.length).toBeGreaterThan(0);
    });

    it('should return category-specific content', () => {
      const context: EducationalContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 20
        },
        factorScores: {
          goalAlignment: 0.7,
          intensityMatch: 0.6,
          durationFit: 0.8,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.4
        },
        overallScore: 0.68
      };

      const equipmentContent = getCategoryEducationalContent('equipment', context, 2);
      expect(equipmentContent.length).toBeGreaterThan(0);
      expect(equipmentContent.every(c => c.category === 'equipment')).toBe(true);
    });

    it('should return beginner-specific content', () => {
      const context: EducationalContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 20
        },
        factorScores: {
          goalAlignment: 0.7,
          intensityMatch: 0.6,
          durationFit: 0.8,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.4
        },
        overallScore: 0.68
      };

      const beginnerContent = getBeginnerEducationalContent(context, 2);
      expect(beginnerContent.length).toBeGreaterThan(0);
      expect(beginnerContent.every(c => c.targetAudience === 'beginner')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user profile data', () => {
      const incompleteProfile = {
        ...mockBeginnerProfile,
        goals: undefined,
        basicLimitations: undefined
      };

      const context: EducationalContext = {
        userProfile: incompleteProfile as any,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: { rating: 5, categories: ['moderate'] },
          customization_duration: 20
        },
        factorScores: {
          goalAlignment: 0.7,
          intensityMatch: 0.6,
          durationFit: 0.8,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.4
        },
        overallScore: 0.68
      };

      const content = getApplicableEducationalContent(context, 3);
      expect(Array.isArray(content)).toBe(true);
    });

    it('should handle empty workout options', () => {
      const context: EducationalContext = {
        userProfile: mockBeginnerProfile,
        workoutOptions: {
          customization_focus: 'cardio',
          customization_energy: undefined,
          customization_duration: undefined
        } as any,
        factorScores: {
          goalAlignment: 0.7,
          intensityMatch: 0.6,
          durationFit: 0.8,
          recoveryRespect: 0.9,
          equipmentOptimization: 0.4
        },
        overallScore: 0.68
      };

      const content = getApplicableEducationalContent(context, 3);
      expect(Array.isArray(content)).toBe(true);
    });
  });
}); 