import React from 'react';

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
  // TODO: Implement component
  return <div>NavigationButtons - TODO</div>;
};

export default NavigationButtons; 