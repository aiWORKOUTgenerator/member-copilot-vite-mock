import React, { useState, useCallback } from 'react';
import { PerWorkoutOptions, CategoryRatingData, TrainingLoadData } from '../../../../../../../types/core';
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
import { usePhysicalStateValidation } from '../hooks/usePhysicalStateValidation';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// Validation logic has been extracted to separate modules

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
  // Use the extracted validation hook
  const {
    validationResults,
    conflicts,
    recommendations,
    isValidating,
    handleFieldValidation,
    handleConflictDismiss,
    handleRecommendationApply
  } = usePhysicalStateValidation({
    options,
    onChange,
    onValidation,
    workoutFeature
  });

  // Progressive disclosure state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    energy: true,
    soreness: true,
    sleep: false,
    stress: false,
    injury: false,
    training: false
  });

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

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
          onValidation={(result) => handleFieldValidation('energy', result)}
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
          onValidation={(result) => handleFieldValidation('soreness', result)}
          disabled={disabled}
        />
        {validationResults.soreness && !validationResults.soreness.isValid && (
          <ValidationFeedback
            validation={validationResults.soreness}
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
          onValidation={(result) => handleFieldValidation('sleep', result)}
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
          onValidation={(result) => handleFieldValidation('stress', result)}
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
          onValidation={(result) => handleFieldValidation('injury', result)}
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
          onValidation={(result) => handleFieldValidation('training_load', result)}
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