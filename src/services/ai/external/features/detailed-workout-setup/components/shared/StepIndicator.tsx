import React from 'react';
import { Clock, Target, Dumbbell, Settings, CheckCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
  validationError?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  onStepClick: (stepId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  className = '',
  disabled = false
}) => {
  const getStepStatus = (step: Step) => {
    if (step.validationError) return 'error';
    if (step.isCompleted) return 'completed';
    if (step.isActive) return 'active';
    return 'pending';
  };

  const getStepStyles = (status: 'completed' | 'active' | 'error' | 'pending') => {
    switch (status) {
      case 'completed':
        return {
          button: 'bg-green-100 border-green-500 text-green-700',
          icon: 'text-green-600',
          line: 'bg-green-500'
        };
      case 'active':
        return {
          button: 'bg-purple-100 border-purple-500 text-purple-700',
          icon: 'text-purple-600',
          line: 'bg-gray-300'
        };
      case 'error':
        return {
          button: 'bg-red-100 border-red-500 text-red-700',
          icon: 'text-red-600',
          line: 'bg-gray-300'
        };
      default:
        return {
          button: 'bg-gray-100 border-gray-300 text-gray-500',
          icon: 'text-gray-400',
          line: 'bg-gray-300'
        };
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => !disabled && onStepClick(step.id)}
                disabled={disabled}
                className={`
                  relative flex flex-col items-center group
                  ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                `}
              >
                {/* Step Icon */}
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300
                  ${getStepStyles(getStepStatus(step)).button}
                `}>
                  {step.isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className={getStepStyles(getStepStatus(step)).icon}>
                      {step.icon}
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <span className={`
                  mt-2 text-sm font-medium whitespace-nowrap
                  ${step.isActive ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>

                {/* Error Tooltip */}
                {step.validationError && (
                  <div className="absolute bottom-full mb-2 w-48 bg-red-100 text-red-700 text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {step.validationError}
                  </div>
                )}
              </button>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 ${getStepStyles(getStepStatus(step)).line}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator; 