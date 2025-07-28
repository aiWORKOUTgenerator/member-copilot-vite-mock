import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Settings } from 'lucide-react';
import { PerWorkoutOptions } from '../types/core';
import { UserProfile } from '../types/user';
import { ProfileData } from './Profile/types/profile.types';
import { 
  TrainingStructureStep,
  TrainingDetailsStep,
  PhysicalStateStep,
  ExerciseSelectionStep
} from '../services/ai/external/features/detailed-workout-setup/components/steps';
import { DetailedWorkoutFeature } from '../services/ai/external/features/detailed-workout-setup/DetailedWorkoutFeature';
import { useAI } from '../contexts/AIContext';
import { aiLogger } from '../services/ai/logging/AILogger';

interface DetailedWorkoutWizardProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  profileData: ProfileData | null;
  userProfile?: UserProfile;
  initialData?: PerWorkoutOptions;
  onDataUpdate?: (data: PerWorkoutOptions, workoutType: 'detailed') => void;
}

interface StepConfig {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  required: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: 'training_structure',
    label: 'Training Structure',
    component: TrainingStructureStep,
    required: true
  },
  {
    id: 'training_details',
    label: 'Training Details',
    component: TrainingDetailsStep,
    required: true
  },
  {
    id: 'physical_state',
    label: 'Physical State',
    component: PhysicalStateStep,
    required: true
  },
  {
    id: 'exercise_selection',
    label: 'Exercise Selection',
    component: ExerciseSelectionStep,
    required: false
  }
];

export const DetailedWorkoutWizard: React.FC<DetailedWorkoutWizardProps> = ({
  onNavigate,
  profileData,
  userProfile,
  initialData,
  onDataUpdate
}) => {
  // Central wizard state object
  const [wizardState, setWizardState] = useState<PerWorkoutOptions>(initialData || {});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get AI service from context
  const { aiService } = useAI();

  // Initialize DetailedWorkoutFeature
  const detailedWorkoutFeature = useMemo(() => {
    try {
      const openAIService = aiService.getOpenAIService();
      return new DetailedWorkoutFeature({
        openAIService: openAIService || undefined,
        logger: console
      });
    } catch (error) {
      aiLogger.warn('Failed to initialize DetailedWorkoutFeature with OpenAIService', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return new DetailedWorkoutFeature({
        openAIService: undefined,
        logger: console
      });
    }
  }, [aiService]);

  // Handle step data changes
  const handleStepChange = useCallback((stepKey: string, stepData: Partial<PerWorkoutOptions>) => {
    setWizardState(prev => ({ ...prev, ...stepData }));
  }, []);

  // Handle step validation
  const handleStepValidation = useCallback((stepId: string, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [stepId]: isValid }));
  }, []);

  // Navigate to next step
  const handleNext = useCallback(() => {
    const currentStep = STEPS[currentStepIndex];
    if (currentStep && stepValidation[currentStep.id]) {
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // All steps complete, proceed to review
        handleComplete();
      }
    }
  }, [currentStepIndex, stepValidation]);

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      // Go back to focus selection
      onNavigate('focus');
    }
  }, [currentStepIndex, onNavigate]);

  // Handle wizard completion
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Update parent state with completed wizard data
      if (onDataUpdate) {
        onDataUpdate(wizardState, 'detailed');
      }
      
      // Navigate to review page
      onNavigate('review');
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'detailed workout setup completion',
        component: 'DetailedWorkoutWizard',
        severity: 'medium',
        userImpact: true
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [wizardState, onDataUpdate, onNavigate]);

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const currentStep = STEPS[currentStepIndex];
    return currentStep ? stepValidation[currentStep.id] : false;
  }, [currentStepIndex, stepValidation]);

  // Check if all required steps are complete
  const areAllRequiredStepsComplete = useMemo(() => {
    return STEPS.every(step => 
      !step.required || stepValidation[step.id]
    );
  }, [stepValidation]);

  // Get current step
  const currentStep = STEPS[currentStepIndex];
  const CurrentStepComponent = currentStep?.component;

  if (!currentStep || !CurrentStepComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">Invalid Step</div>
          <p className="text-sm">The requested step could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Detailed Workout Setup</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index < currentStepIndex 
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStepIndex
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentStep.label}
            </h2>
            
            <CurrentStepComponent
              options={wizardState}
              onChange={(key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => {
                handleStepChange(key, { [key]: value });
              }}
              onValidation={(isValid: boolean) => handleStepValidation(currentStep.id, isValid)}
              workoutFeature={detailedWorkoutFeature}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStepIndex === 0 ? 'Back to Selection' : 'Previous'}
          </button>

          <div className="flex items-center space-x-4">
            {currentStep.required && !isCurrentStepValid && (
              <span className="text-sm text-red-600">
                Please complete this step to continue
              </span>
            )}
            
            <button
              onClick={handleNext}
              disabled={!isCurrentStepValid || isSubmitting}
              className={`flex items-center px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
                isCurrentStepValid && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : currentStepIndex === STEPS.length - 1 ? (
                <>
                  Complete Setup
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 