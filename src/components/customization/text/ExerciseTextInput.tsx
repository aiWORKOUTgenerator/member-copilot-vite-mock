import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { IncludeExercisesData, ExcludeExercisesData } from '../../../types/exercises';

interface ExerciseTextInputProps {
  value: string | IncludeExercisesData | ExcludeExercisesData;
  onChange: (value: string | IncludeExercisesData | ExcludeExercisesData) => void;
  type: 'include' | 'exclude';
  enableAI?: boolean;
  suggestions?: string[];
}

const ExerciseTextInput: React.FC<ExerciseTextInputProps> = ({
  value,
  onChange,
  type,
  enableAI = false,
  suggestions = []
}) => {
  const handleTextChange = (newText: string) => {
    if (typeof value === 'string') {
      onChange(newText);
    } else {
      onChange({
        ...value,
        customExercises: newText,
        libraryExercises: value?.libraryExercises || []
      });
    }
  };

  const getCurrentText = () => {
    return typeof value === 'string' ? value : value?.customExercises || '';
  };

  const getPlaceholder = () => {
    if (type === 'include') {
      return 'e.g., push-ups, squats, deadlifts, pull-ups...';
    }
    return 'e.g., burpees, jump squats, overhead press...';
  };

  const getLabel = () => {
    return type === 'include' ? 'Include Specific Exercises' : 'Exclude Exercises';
  };

  const getIcon = () => {
    return type === 'include' ? Plus : Minus;
  };

  const getDescription = () => {
    if (type === 'include') {
      return 'Enter exercises you want to include, separated by commas';
    }
    return 'Enter exercises you want to avoid, separated by commas';
  };

  const Icon = getIcon();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <label className="block text-sm font-medium text-gray-700">
          {getLabel()}
        </label>
      </div>
      
      <textarea
        value={getCurrentText()}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label={getLabel()}
      />
      
      <p className="text-sm text-gray-500">
        {getDescription()}
      </p>
      
      {/* AI Suggestions */}
      {enableAI && suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">AI Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  const currentText = getCurrentText();
                  const newText = currentText ? `${currentText}, ${suggestion}` : suggestion;
                  handleTextChange(newText);
                }}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseTextInput; 