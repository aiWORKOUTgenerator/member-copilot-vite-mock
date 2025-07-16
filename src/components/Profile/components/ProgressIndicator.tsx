import React from 'react';

interface StepConfig {
  title: string;
  description: string;
  isComplete?: boolean;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number;
  onStepClick: (step: number) => void;
  stepConfig?: Record<number, StepConfig>;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  completedSteps = 0,
  onStepClick,
  stepConfig = {}
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const config = stepConfig[step];
        const isComplete = step <= completedSteps;
        const isCurrent = step === currentStep;
        
        return (
          <button
            key={step}
            onClick={() => onStepClick(step)}
            disabled={!isComplete && !isCurrent}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full 
              transition-all duration-300
              ${isComplete 
                ? 'bg-green-500 text-white' 
                : isCurrent 
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }
            `}
            title={config?.title}
          >
            {step}
          </button>
        );
      })}
    </div>
  );
};

export default ProgressIndicator; 