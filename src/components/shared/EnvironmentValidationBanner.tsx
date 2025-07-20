import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface EnvironmentValidationBannerProps {
  environmentStatus: {
    isConfigured: boolean;
    hasApiKey: boolean;
    isDevelopment: boolean;
    issues: string[];
    recommendations: string[];
  };
  onDismiss?: () => void;
  showInDevelopment?: boolean;
}

export const EnvironmentValidationBanner: React.FC<EnvironmentValidationBannerProps> = ({
  environmentStatus,
  onDismiss,
  showInDevelopment = true
}) => {
  // Don't show in production if everything is configured
  if (!environmentStatus.isDevelopment && environmentStatus.isConfigured) {
    return null;
  }

  // Don't show in development if showInDevelopment is false
  if (environmentStatus.isDevelopment && !showInDevelopment) {
    return null;
  }

  // Don't show if there are no issues
  if (environmentStatus.issues.length === 0) {
    return null;
  }

  const getBannerType = () => {
    if (environmentStatus.isDevelopment && !environmentStatus.isConfigured) {
      return 'warning';
    }
    if (!environmentStatus.hasApiKey) {
      return 'error';
    }
    return 'info';
  };

  const bannerType = getBannerType();

  const getIcon = () => {
    switch (bannerType) {
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getBannerStyles = () => {
    switch (bannerType) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getTitle = () => {
    if (environmentStatus.isDevelopment) {
      return 'Development Environment Notice';
    }
    return 'AI Service Configuration';
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getBannerStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-2">{getTitle()}</h3>
            
            {environmentStatus.issues.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium mb-1">Issues:</h4>
                <ul className="text-xs space-y-1">
                  {environmentStatus.issues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {environmentStatus.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-1">Recommendations:</h4>
                <ul className="text-xs space-y-1">
                  {environmentStatus.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {environmentStatus.isDevelopment && (
              <div className="mt-3 text-xs opacity-75">
                <p>This is a development environment. Some AI features may be limited.</p>
              </div>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}; 