import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number;
  onStepClick: (step: number) => void;
  stepConfig?: any; // TODO: Type this properly
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  completedSteps,
  onStepClick,
  stepConfig
}) => {
  // TODO: Implement component
  return <div>ProgressIndicator - TODO</div>;
};

export default ProgressIndicator; 