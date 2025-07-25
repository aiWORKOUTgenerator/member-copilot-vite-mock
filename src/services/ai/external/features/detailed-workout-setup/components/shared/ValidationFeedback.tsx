import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ValidationResult } from '../../../../../../../types/core';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  showSuccess?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  showSuccess = false,
  className = '',
  size = 'medium'
}) => {
  if (!validation.message && (!validation.isValid || !showSuccess)) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2 text-xs',
          icon: 'w-3 h-3'
        };
      case 'large':
        return {
          container: 'p-4 text-base',
          icon: 'w-5 h-5'
        };
      default:
        return {
          container: 'p-3 text-sm',
          icon: 'w-4 h-4'
        };
    }
  };

  const getValidationStyles = () => {
    if (validation.isValid) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: <CheckCircle className={`${getSizeStyles().icon} text-green-500`} />
      };
    }

    // Handle different types of validation errors
    if (validation.details?.severity === 'warning') {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: <AlertTriangle className={`${getSizeStyles().icon} text-yellow-500`} />
      };
    }

    if (validation.details?.severity === 'info') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: <Info className={`${getSizeStyles().icon} text-blue-500`} />
      };
    }

    // Default error style
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle className={`${getSizeStyles().icon} text-red-500`} />
    };
  };

  const styles = getValidationStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div
      className={`
        flex items-start gap-2 rounded-lg border
        ${styles.bg} ${styles.border} ${styles.text} ${sizeStyles.container}
        ${className}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {styles.icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {validation.message || (validation.isValid ? 'Validation passed' : 'Validation failed')}
        </p>
        {validation.details?.description && (
          <p className="mt-1 opacity-90">
            {validation.details.description}
          </p>
        )}
        {validation.details?.suggestions && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-sm opacity-90">
            {validation.details.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ValidationFeedback; 