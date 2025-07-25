import React from 'react';
import { Brain, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { EnhancedRecommendation } from '../../../types/detailed-workout.types';

interface AIRecommendationPanelProps {
  recommendations: EnhancedRecommendation[];
  onApply: (type: string, description: string) => void;
  className?: string;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  recommendations,
  onApply,
  className = ''
}) => {
  if (recommendations.length === 0) return null;

  const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          button: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  return (
    <div className={`max-w-4xl mx-auto mb-8 ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Workout Insights</h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const styles = getPriorityStyles(rec.priority);
                return (
                  <div 
                    key={index} 
                    className={`${styles.bg} border ${styles.border} rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {styles.icon}
                      <h4 className="font-medium text-gray-800">{rec.type}</h4>
                    </div>
                    <p className={`text-sm ${styles.text}`}>{rec.description}</p>
                    {rec.context && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(rec.context).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className="font-medium">{key}:</span>
                            <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => onApply(rec.type, rec.description)}
                      className={`mt-2 px-3 py-1 ${styles.button} text-white text-xs rounded-lg transition-colors`}
                    >
                      Apply
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationPanel; 