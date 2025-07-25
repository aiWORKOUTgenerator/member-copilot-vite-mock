import React from 'react';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';

interface Conflict {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  affectedFields: string[];
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

interface ConflictWarningProps {
  conflicts: Conflict[];
  onDismiss: (conflictId: string) => void;
  className?: string;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({
  conflicts,
  onDismiss,
  className = ''
}) => {
  if (!conflicts.length) return null;

  const getSeverityStyles = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-500'
        };
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {conflicts.map((conflict) => {
        const styles = getSeverityStyles(conflict.severity);
        
        return (
          <div
            key={conflict.id}
            className={`
              relative p-4 rounded-lg border
              ${styles.bg} ${styles.border}
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${styles.icon}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium ${styles.text}`}>
                    {conflict.message}
                  </p>
                  {conflict.affectedFields.length > 0 && (
                    <div className="mt-1 text-sm space-x-2">
                      <span className={`${styles.text} opacity-75`}>Affects:</span>
                      {conflict.affectedFields.map((field, index) => (
                        <span
                          key={field}
                          className={`
                            inline-block px-2 py-0.5 rounded-full text-xs
                            ${styles.bg} ${styles.text} border ${styles.border}
                          `}
                        >
                          {field}
                          {index < conflict.affectedFields.length - 1 && ','}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {conflict.suggestedAction && (
                  <button
                    onClick={conflict.suggestedAction.action}
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${styles.text} hover:${styles.bg}
                    `}
                  >
                    {conflict.suggestedAction.label}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDismiss(conflict.id)}
                  className={`
                    p-1 rounded-full hover:${styles.bg}
                    transition-colors duration-200
                  `}
                >
                  <X className={`w-4 h-4 ${styles.text}`} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConflictWarning; 