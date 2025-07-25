import React, { useState, useMemo, useCallback, memo } from 'react';
import { Brain, Settings, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { 
  PerWorkoutOptions, 
  ValidationResult
} from '../../../../../../../types/core';
import { UserProfile, FitnessLevel } from '../../../../../../../types/user';
import { DetailedWorkoutFeature } from '../../DetailedWorkoutFeature';
import { DetailedWorkoutServiceAdapter } from '../../helpers/DetailedWorkoutServiceAdapter';
import { DetailedWorkoutParams } from '../../types/detailed-workout.types';
import { DETAILED_WORKOUT_CONSTANTS } from '../../constants/detailed-workout.constants';
import { StepIndicator } from '../shared/StepIndicator';
import { useAI } from '../../../../../../../contexts/AIContext';
import {
  TrainingStructureStep,
  TrainingDetailsStep,
  PhysicalStateStep,
  ExerciseSelectionStep,
  ReviewStep
} from '../steps';

// Define WorkoutType locally since it's used throughout the app
type WorkoutType = 'quick' | 'detailed';

interface DetailedWorkoutContainerProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  errors: Record<string, string>;
  disabled: boolean;
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  userProfile?: UserProfile;
  workoutType: WorkoutType;
}

interface StepConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
}

const STEPS: StepConfig[] = [
  {
    id: 'training_structure',
    label: 'Training Structure',
    icon: ChevronRight,
    component: TrainingStructureStep
  },
  {
    id: 'training_details',
    label: 'Training Details',
    icon: ChevronRight,
    component: TrainingDetailsStep
  },
  {
    id: 'physical_state',
    label: 'Physical State',
    icon: ChevronRight,
    component: PhysicalStateStep
  },
  {
    id: 'exercise_selection',
    label: 'Exercise Selection',
    icon: ChevronRight,
    component: ExerciseSelectionStep
  },
  {
    id: 'review',
    label: 'Review',
    icon: ChevronRight,
    component: ReviewStep
  }
];

const DetailedWorkoutContainer = memo(function DetailedWorkoutContainer({
  options,
  onChange,
  errors,
  disabled = false,
  onNavigate,
  userProfile,
  workoutType
}: DetailedWorkoutContainerProps) {
  // Get AI service from context
  const { aiService } = useAI();

  // ✅ Fixed: Initialize DetailedWorkoutFeature with unified AIService
  const workoutFeature = useMemo(() => new DetailedWorkoutFeature({
    aiService: aiService
  }), [aiService]);

  // Step management
  const [activeStep, setActiveStep] = useState('training_structure');
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Handle step validation
  const handleStepValidation = useCallback((stepId: string, isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [stepId]: isValid
    }));
  }, []);

  // Handle step navigation
  const handleStepChange = useCallback((stepId: string) => {
    setActiveStep(stepId);
  }, []);

  // Handle step completion
  const isStepValid = useCallback((stepId: string) => {
    return stepValidation[stepId] ?? false;
  }, [stepValidation]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    onNavigate('review');
  }, [onNavigate]);

  // Get current step index
  const currentStepIndex = STEPS.findIndex(step => step.id === activeStep);
  const CurrentStepComponent = STEPS[currentStepIndex]?.component;

  if (disabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">Customization Disabled</div>
          <p className="text-sm">Detailed customization is not available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Workout Focus</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Fine-tune your workout preferences with AI-powered recommendations
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS.map(step => ({
          id: step.id,
          label: step.label,
          icon: <step.icon className="w-5 h-5" />,
          isCompleted: isStepValid(step.id),
          isActive: activeStep === step.id,
          validationError: errors[step.id]
        }))}
        onStepClick={handleStepChange}
        disabled={disabled}
        className="max-w-4xl mx-auto"
      />

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {CurrentStepComponent && (
          <CurrentStepComponent
            options={options}
            onChange={onChange}
            onValidation={(isValid: boolean) => handleStepValidation(activeStep, isValid)}
            workoutFeature={workoutFeature}
            disabled={disabled}
            onEdit={handleStepChange}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-4xl mx-auto flex justify-between">
        <button
          onClick={() => {
            if (currentStepIndex === 0) {
              onNavigate('focus');
            } else {
              handleStepChange(STEPS[currentStepIndex - 1].id);
            }
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStepIndex === 0 ? 'Back to Options' : 'Previous Step'}
        </button>

        {currentStepIndex < STEPS.length - 1 ? (
          <button
            onClick={() => handleStepChange(STEPS[currentStepIndex + 1].id)}
            disabled={!isStepValid(activeStep)}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2
              ${isStepValid(activeStep)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid(activeStep)}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2
              ${isStepValid(activeStep)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Generate Workout
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Debug Panel */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Debug Panel
            </h3>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {showDebugPanel ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showDebugPanel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Options Data</h4>
                <div className="bg-white rounded-lg p-4 border max-h-64 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(options, null, 2)}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Step Validation Status</h4>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="space-y-2">
                    {STEPS.map(step => (
                      <div key={step.id} className="flex items-center justify-between">
                        <span>{step.label}</span>
                        <span className={isStepValid(step.id) ? 'text-green-600' : 'text-gray-400'}>
                          {isStepValid(step.id) ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DetailedWorkoutContainer; 