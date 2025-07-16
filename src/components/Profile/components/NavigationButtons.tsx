import React from 'react';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  hasErrors: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onReset?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  hasErrors,
  onPrevious,
  onNext,
  onSubmit,
  onReset
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center">
      <button
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isFirstStep
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </button>

      <div className="flex gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
        )}

        {isLastStep ? (
          <button
            onClick={onSubmit}
            disabled={hasErrors || !canProceed}
            className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
              hasErrors || !canProceed ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            Complete Profile
            <Target className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={hasErrors || !canProceed}
            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg ${
              hasErrors || !canProceed ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons; 