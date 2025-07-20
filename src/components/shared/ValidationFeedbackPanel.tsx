import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  helpText?: string;
}

interface ValidationFeedbackPanelProps {
  issues: ValidationIssue[];
  title?: string;
  showHelp?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const ValidationFeedbackPanel: React.FC<ValidationFeedbackPanelProps> = ({
  issues,
  title = 'Validation Issues',
  showHelp = true,
  onDismiss,
  className = ''
}) => {
  if (issues.length === 0) return null;

  const getSeverityConfig = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  const getSeverityCounts = () => {
    return issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const severityCounts = getSeverityCounts();
  const hasErrors = severityCounts.error > 0;
  const hasWarnings = severityCounts.warning > 0;
  const hasInfo = severityCounts.info > 0;

  const getPanelConfig = () => {
    if (hasErrors) {
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        title: 'Required Information Missing'
      };
    }
    if (hasWarnings) {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        title: 'Recommendations for Better Results'
      };
    }
    return {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      title: 'Additional Information Available'
    };
  };

  const panelConfig = getPanelConfig();

  return (
    <div className={`border rounded-lg p-4 ${panelConfig.bgColor} ${panelConfig.borderColor} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <panelConfig.icon className={`w-5 h-5 ${panelConfig.iconColor} mr-2`} />
          <div>
            <h3 className={`text-sm font-medium ${panelConfig.textColor}`}>
              {panelConfig.title}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              {hasErrors && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  {severityCounts.error} Error{severityCounts.error !== 1 ? 's' : ''}
                </span>
              )}
              {hasWarnings && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  {severityCounts.warning} Warning{severityCounts.warning !== 1 ? 's' : ''}
                </span>
              )}
              {hasInfo && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {severityCounts.info} Info
                </span>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss validation feedback"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {issues.map((issue, index) => {
          const config = getSeverityConfig(issue.severity);
          const IconComponent = config.icon;

          return (
            <div key={index} className="flex items-start space-x-3">
              <IconComponent className={`w-4 h-4 ${config.iconColor} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${config.textColor} font-medium`}>
                      {issue.field}
                    </p>
                    <p className={`text-sm ${config.textColor} mt-1`}>
                      {issue.message}
                    </p>
                    {issue.helpText && showHelp && (
                      <div className="mt-2 p-2 bg-white/50 rounded border-l-2 border-gray-300">
                        <div className="flex items-start">
                          <HelpCircle className="w-3 h-3 text-gray-500 mr-1 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{issue.helpText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {issue.action && (
                    <button
                      onClick={issue.action.onClick}
                      className="ml-3 flex items-center px-3 py-1 bg-white border border-gray-300 text-xs text-gray-700 rounded hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      <span>{issue.action.label}</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Actions */}
      {hasErrors && (
        <div className="mt-4 pt-3 border-t border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-700">
              Please address all errors to continue with workout generation.
            </p>
            <div className="flex space-x-2">
              <button className="text-xs text-red-700 hover:text-red-800 underline">
                View Help Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 