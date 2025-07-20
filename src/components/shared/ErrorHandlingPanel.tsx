import React, { useState } from 'react';
import { XCircle, AlertTriangle, Info, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';

interface ErrorInfo {
  type: 'generation' | 'validation' | 'network' | 'environment' | 'unknown';
  title: string;
  message: string;
  details?: string;
  suggestions: string[];
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  helpLink?: string;
}

interface ErrorHandlingPanelProps {
  error: ErrorInfo | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const ErrorHandlingPanel: React.FC<ErrorHandlingPanelProps> = ({
  error,
  onDismiss,
  onRetry,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const getErrorConfig = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'generation':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: 'Workout Generation Failed'
        };
      case 'validation':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: 'Validation Issues'
        };
      case 'network':
        return {
          icon: XCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          title: 'Network Connection Issue'
        };
      case 'environment':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Configuration Issue'
        };
      default:
        return {
          icon: XCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          title: 'An Error Occurred'
        };
    }
  };

  const config = getErrorConfig(error.type);
  const IconComponent = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {error.title}
            </h3>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {error.message}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-3 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss error"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Details */}
      {error.details && (
        <div className="mb-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Info className="w-3 h-3 mr-1" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {showDetails && (
            <div className="mt-2 p-3 bg-white/50 rounded border-l-2 border-gray-300">
              <p className="text-xs text-gray-700 font-mono">{error.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {error.suggestions.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Suggestions:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {error.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {error.actions && error.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {error.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center px-3 py-1 text-xs rounded transition-colors ${
                action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : action.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Help Link */}
      {error.helpLink && (
        <div className="pt-3 border-t border-gray-200">
          <a
            href={error.helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 underline"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Get Help
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}
    </div>
  );
};

// Predefined error templates
export const ErrorTemplates = {
  generationFailed: (details?: string): ErrorInfo => ({
    type: 'generation',
    title: 'Workout Generation Failed',
    message: 'We encountered an issue while creating your personalized workout.',
    details,
    suggestions: [
      'Check your internet connection',
      'Try generating a different workout type',
      'Verify your profile information is complete',
      'Contact support if the issue persists'
    ],
    actions: [
      {
        label: 'Try Again',
        onClick: () => window.location.reload(),
        variant: 'primary'
      }
    ]
  }),

  validationError: (field: string, message: string): ErrorInfo => ({
    type: 'validation',
    title: 'Validation Error',
    message: `${field}: ${message}`,
    suggestions: [
      'Please complete all required fields',
      'Check that your selections are valid',
      'Ensure your profile information is up to date'
    ],
    actions: [
      {
        label: 'Fix Issues',
        onClick: () => window.history.back(),
        variant: 'primary'
      }
    ]
  }),

  networkError: (): ErrorInfo => ({
    type: 'network',
    title: 'Network Connection Issue',
    message: 'Unable to connect to our servers. Please check your internet connection.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable any VPN or proxy services',
      'Contact your network administrator if the issue persists'
    ],
    actions: [
      {
        label: 'Retry',
        onClick: () => window.location.reload(),
        variant: 'primary'
      }
    ]
  }),

  environmentError: (message: string): ErrorInfo => ({
    type: 'environment',
    title: 'Configuration Issue',
    message,
    suggestions: [
      'Check your environment configuration',
      'Verify API keys are properly set',
      'Ensure all required services are running'
    ],
    helpLink: '/help/configuration'
  })
}; 