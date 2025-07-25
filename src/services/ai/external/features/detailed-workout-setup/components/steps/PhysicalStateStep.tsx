import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PerWorkoutOptions, ValidationResult, CategoryRatingData, TrainingLoadData } from '../../../../../../../types/core';
import { EnergyForm } from '../forms/EnergyForm';
import { SorenessForm } from '../forms/SorenessForm';
import { SleepQualityForm } from '../forms/SleepQualityForm';
import { StressAndMoodForm } from '../forms/StressAndMoodForm';
import InjuryAndRecoveryForm from '../forms/InjuryStatusForm';
import { TrainingLoadForm } from '../forms/TrainingLoadForm';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';
import { useEnhancedPersistedState } from '../../../../../../../hooks/usePersistedState';
import { useFormValidation } from '../../../../../../../hooks/useFormValidation';
import { TransformationContext } from '../../../../DataTransformer/core/TransformationContext';
import { z } from 'zod';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// Validation schema for physical state
const physicalStateSchema = z.object({
  energy: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  soreness: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  injury: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  sleep: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  stress: z.object({
    rating: z.number(),
    categories: z.array(z.string())
  }).optional(),
  trainingLoad: z.object({
    recentActivities: z.array(z.object({
      type: z.string(),
      intensity: z.enum(['light', 'moderate', 'intense']),
      duration: z.number(),
      date: z.string()
    })),
    weeklyVolume: z.number(),
    averageIntensity: z.enum(['light', 'moderate', 'intense'])
  }).optional(),
  areas: z.array(z.string()).optional(),
  restPeriods: z.enum(['short', 'moderate', 'long']).optional()
});

// Required fields for validation
const REQUIRED_FIELDS = ['energy', 'soreness'] as const;

// Validation rules
const VALIDATION_RULES = {
  energy: {
    required: true,
    min: 1,
    max: 10,
    message: 'Energy level is required and must be between 1 and 10'
  },
  soreness: {
    required: true,
    message: 'Soreness assessment is required'
  },
  sleep: {
    required: false,
    min: 0,
    max: 24,
    message: 'Sleep duration must be between 0 and 24 hours'
  },
  stress: {
    required: false,
    message: 'Invalid stress level format'
  },
  trainingLoad: {
    required: false,
    message: 'Invalid training load format'
  }
} as const;

type PhysicalStateData = z.infer<typeof physicalStateSchema>;

interface PhysicalStateStepProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  onValidation?: (isValid: boolean) => void;
  workoutFeature: DetailedWorkoutFeature;
  disabled?: boolean;
}

export type { PhysicalStateStepProps };

export const PhysicalStateStep: React.FC<PhysicalStateStepProps> = ({
  options,
  onChange,
  onValidation,
  workoutFeature,
  disabled = false
}) => {
  // Initialize persisted state with empty values
  const {
    state: persistedState,
    setState: setPersistedState,
    forceSave
  } = useEnhancedPersistedState<PhysicalStateData>('physical_state', {
    energy: undefined,
    energyCategories: undefined,
    soreness: [],
    injury: undefined,
    sleep: undefined,
    stress: undefined,
    trainingLoad: undefined,
    areas: [],
    restPeriods: undefined
  });

  // Form validation
  const { validate, validateField } = useFormValidation<PhysicalStateData>(physicalStateSchema);

  // Transformation context
  const transformationContext = useMemo(() => new TransformationContext(), []);

  // Validation state
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [conflicts, setConflicts] = useState<Array<{
    id: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    affectedFields: string[];
    suggestedAction?: {
      label: string;
      action: () => void;
    };
  }>>([]);

  // AI recommendations state
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'form' | 'progression' | 'modification' | 'alternative';
    description: string;
    priority: 'low' | 'medium' | 'high';
    context?: Record<string, any>;
  }>>([]);

  // Progressive disclosure state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    energy: true,
    soreness: true,
    sleep: false,
    stress: false,
    injury: false,
    training: false
  });

  // Loading states
  const [isValidating, setIsValidating] = useState(false);

  // Sync persisted state with props using useEffect
  useEffect(() => {
    const newState = {
      energy: typeof options.customization_energy === 'number' ? options.customization_energy : undefined,
      energyCategories: typeof options.customization_energy === 'object'
        ? (options.customization_energy as CategoryRatingData)?.categories
        : undefined,
      soreness: options.customization_soreness || [],
      injury: typeof options.customization_injury === 'object'
        ? options.customization_injury as CategoryRatingData
        : undefined,
      sleep: typeof options.customization_sleep === 'object'
        ? options.customization_sleep as CategoryRatingData
        : undefined,
      stress: options.customization_stress,
      trainingLoad: options.customization_trainingLoad,
      areas: options.customization_areas || [],
      restPeriods: options.customization_restPeriods
    };

    setPersistedState(newState);
  }, [options, setPersistedState]);

  // Enhanced validation with required fields check
  const handleValidation = useCallback((field: string, result: ValidationResult) => {
    setValidationResults(prev => {
      const newResults = { ...prev, [field]: result };
      
      // Check if all required fields are valid
      const isValid = REQUIRED_FIELDS.every(field => {
        const validation = newResults[field];
        return validation?.isValid ?? false;
      });

      // Defer parent validation to prevent setState during render
      if (onValidation) {
        setTimeout(() => {
          onValidation(isValid);
        }, 0);
      }
      
      return newResults;
    });
  }, [onValidation]);

  // Enhanced cross-field validation
  const validateAndRecommend = useCallback(async () => {
    if (!options.customization_energy || !options.customization_soreness) return;

    try {
      setIsValidating(true); // Set loading state
      
      // Transform data for validation
      const energyValue = typeof options.customization_energy === 'number'
        ? options.customization_energy
        : (options.customization_energy as CategoryRatingData).rating;

      // Validate physical state
      const validationResult = await workoutFeature.validatePhysicalState({
        energyLevel: energyValue,
        sorenessAreas: options.customization_soreness?.map(s => {
          const [area, intensity = 'moderate'] = s.split('_');
          return { area, intensity };
        }) || []
      });

      // Update conflicts and recommendations based on validation result
      if (!validationResult.isValid && validationResult.details?.conflicts) {
        const newConflicts = validationResult.details.conflicts.map((conflict: {
          message: string;
          severity?: 'high' | 'medium' | 'low';
          fields?: string[];
          suggestion?: {
            label: string;
            changes?: Record<string, unknown>;
          };
        }, index: number) => ({
          id: `physical-conflict-${index}`,
          message: conflict.message,
          severity: conflict.severity || 'medium',
          affectedFields: conflict.fields || [],
          suggestedAction: conflict.suggestion ? {
            label: conflict.suggestion.label,
            action: () => {
              if (conflict.suggestion?.changes) {
                Object.entries(conflict.suggestion.changes).forEach(([key, value]) => {
                  const transformedValue = transformationContext.getState(key) || value;
                  const rule = VALIDATION_RULES[key as keyof typeof VALIDATION_RULES];

                  if (rule) {
                    const isValid = validateField(key as keyof PhysicalStateData, transformedValue);
                    if (isValid) {
                      onChange(key as keyof PerWorkoutOptions, transformedValue as PerWorkoutOptions[keyof PerWorkoutOptions]);
                    }
                  } else {
                    onChange(key as keyof PerWorkoutOptions, transformedValue as PerWorkoutOptions[keyof PerWorkoutOptions]);
                  }
                });
              }
            }
          } : undefined
        }));

        setConflicts(newConflicts);

        // Generate recommendations for high severity conflicts
        const highSeverityConflicts = newConflicts.filter((conflict: { severity: 'high' | 'medium' | 'low' }) => 
          conflict.severity === 'high'
        );

        if (highSeverityConflicts.length > 0) {
          setRecommendations([{
            type: 'modification',
            description: 'Adjust your selections to resolve conflicts',
            priority: 'high',
            context: { conflicts: highSeverityConflicts }
          }]);
        } else {
          setRecommendations([]);
        }
      } else {
        setConflicts([]);
        setRecommendations([]);
      }

      // Validate full state
      const isValid = validate(persistedState);
      if (isValid) {
        forceSave();
      }
    } catch (error) {
      console.error('Error validating physical state:', error);
      setConflicts([]);
      setRecommendations([]);
    } finally {
      setIsValidating(false); // Clear loading state
    }
  }, [options, workoutFeature, onChange, transformationContext, persistedState, validate, forceSave, validateField]);

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle conflict dismissal
  const handleConflictDismiss = useCallback((conflictId: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, []);

  // Handle recommendation application
  const handleRecommendationApply = useCallback((type: string, description: string) => {
    switch (type) {
      case 'modification':
        if (options.customization_energy) {
          const currentEnergy = typeof options.customization_energy === 'number'
            ? options.customization_energy
            : (options.customization_energy as CategoryRatingData).rating;

          const newEnergy = description.includes('increase')
            ? Math.min(10, currentEnergy + 1)
            : Math.max(1, currentEnergy - 1);

          if (validateField('energy', newEnergy)) {
            onChange('customization_energy', newEnergy);
          }
        }
        break;

      case 'alternative':
        if (description.includes('rest') && options.customization_restPeriods) {
          const newRestPeriod = description.includes('more') ? 'long' :
                               description.includes('less') ? 'short' : 'moderate';

          if (validateField('restPeriods', newRestPeriod)) {
            onChange('customization_restPeriods', newRestPeriod);
          }
        }
        break;

      default:
        console.warn('Unhandled recommendation type:', type);
    }
  }, [options.customization_energy, options.customization_restPeriods, onChange, validateField]);

  // Run cross-field validation only when required fields change
  useEffect(() => {
    if (options.customization_energy && options.customization_soreness) {
      validateAndRecommend();
    }
  }, [options.customization_energy, options.customization_soreness, validateAndRecommend]);

  // Section wrapper component
  const Section: React.FC<{
    title: string;
    id: string;
    children: React.ReactNode;
    hasError?: boolean;
  }> = ({ title, id, children, hasError }) => (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => handleSectionToggle(id)}
        className={`
          w-full px-4 py-3 flex items-center justify-between
          ${hasError ? 'bg-red-50' : 'bg-gray-50'}
          hover:bg-gray-100 transition-colors duration-200
        `}
        aria-expanded={expandedSections[id]}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {hasError && (
            <AlertCircle className="w-4 h-4 text-red-500" aria-label="Error" />
          )}
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections[id] && (
        <div
          id={`section-${id}`}
          className="p-4 bg-white"
          role="region"
          aria-labelledby={`section-${id}-title`}
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Energy Assessment */}
      <Section
        title="Energy Level"
        id="energy"
        hasError={validationResults.energy?.isValid === false}
      >
        <EnergyForm
          value={typeof options.customization_energy === 'number'
            ? {
                rating: options.customization_energy,
                categories: [
                  `physical_${options.customization_energy >= 7 ? 'high' : options.customization_energy >= 4 ? 'moderate' : 'low'}`,
                  `mental_moderate`
                ]
              }
            : options.customization_energy as CategoryRatingData | undefined}
          onChange={(value: CategoryRatingData) => {
            onChange('customization_energy', value);
            // Remove validateAndRecommend to prevent infinite render
          }}
          onValidation={(result: ValidationResult) => handleValidation('energy', result)}
          disabled={disabled}
        />
        {validationResults.energy && !validationResults.energy.isValid && (
          <ValidationFeedback
            validation={validationResults.energy}
            size="small"
          />
        )}
      </Section>

      {/* Soreness Assessment */}
      <Section
        title="Soreness"
        id="soreness"
        hasError={validationResults.soreness?.isValid === false}
      >
        <SorenessForm
          value={options.customization_soreness}
          onChange={(value: CategoryRatingData) => {
            onChange('customization_soreness', value);
          }}
          onValidation={(result: ValidationResult) => handleValidation('soreness', result)}
          disabled={disabled}
        />
        {validationResults.soreness && !validationResults.soreness.isValid && (
          <ValidationFeedback
            validationResult={validationResults.soreness}
          />
        )}
      </Section>

      {/* Sleep Assessment */}
      <Section
        title="Sleep Quality"
        id="sleep"
        hasError={validationResults.sleep?.isValid === false}
      >
        <SleepQualityForm
          value={typeof options.customization_sleep === 'object'
            ? options.customization_sleep as CategoryRatingData
            : undefined}
          onChange={(value: CategoryRatingData) => {
            onChange('customization_sleep', value);
            // Remove validateAndRecommend to prevent infinite render
          }}
          onValidation={(result: ValidationResult) => handleValidation('sleep', result)}
          disabled={disabled}
        />
        {validationResults.sleep && !validationResults.sleep.isValid && (
          <ValidationFeedback
            validation={validationResults.sleep}
            size="small"
          />
        )}
      </Section>

      {/* Stress Assessment */}
      <Section
        title="Stress & Mood"
        id="stress"
        hasError={validationResults.stress?.isValid === false}
      >
        <StressAndMoodForm
          value={options.customization_stress}
          onChange={(value: CategoryRatingData) => {
            onChange('customization_stress', value);
            // Remove validateAndRecommend to prevent infinite render
          }}
          onValidation={(result: ValidationResult) => handleValidation('stress', result)}
          disabled={disabled}
        />
        {validationResults.stress && !validationResults.stress.isValid && (
          <ValidationFeedback
            validation={validationResults.stress}
            size="small"
          />
        )}
      </Section>

      {/* Injury Assessment */}
      <Section
        title="Injuries & Limitations"
        id="injury"
        hasError={validationResults.injury?.isValid === false}
      >
        <InjuryAndRecoveryForm
          value={options.customization_injury}
          onChange={(value: CategoryRatingData) => {
            onChange('customization_injury', value);
          }}
          onValidation={(result: ValidationResult) => handleValidation('injury', result)}
          disabled={disabled}
        />
        {validationResults.injury && !validationResults.injury.isValid && (
          <ValidationFeedback
            validation={validationResults.injury}
            size="small"
          />
        )}
      </Section>

      {/* Training Load Assessment */}
      <Section
        title="Recent Training"
        id="training"
        hasError={validationResults.training_load?.isValid === false}
      >
        <TrainingLoadForm
          value={options.customization_trainingLoad}
          onChange={(value: TrainingLoadData) => {
            onChange('customization_trainingLoad', value);
          }}
          onValidation={(result: ValidationResult) => handleValidation('training_load', result)}
          disabled={disabled}
        />
        {validationResults.training_load && !validationResults.training_load.isValid && (
          <ValidationFeedback
            validation={validationResults.training_load}
            size="small"
          />
        )}
      </Section>

      {/* Loading Indicator */}
      {isValidating && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <AIRecommendationPanel
          recommendations={recommendations}
          onApply={handleRecommendationApply}
          className="mt-6"
        />
      )}

      {/* Cross-field Validation Warnings */}
      {conflicts.length > 0 && (
        <ConflictWarning
          conflicts={conflicts}
          onDismiss={handleConflictDismiss}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default PhysicalStateStep;