import React from 'react';
import { CustomizationComponentProps } from '../../../types/config';
import { IncludeExercisesData, ExcludeExercisesData } from '../../../types/exercises';
import ExerciseTextInput from './ExerciseTextInput';

interface TextInputWrapperProps extends CustomizationComponentProps<string | IncludeExercisesData | ExcludeExercisesData> {
  type: 'include' | 'exclude';
  enableAI?: boolean;
  suggestions?: string[];
}

const TextInputWrapper: React.FC<TextInputWrapperProps> = ({
  value,
  onChange,
  type,
  enableAI = false,
  suggestions = [],
  userProfile,
  aiContext
}) => {
  // Generate AI suggestions based on user profile and context
  const generateAISuggestions = () => {
    if (!enableAI || !userProfile) return suggestions;
    
    const baseSuggestions = [...suggestions];
    
    if (type === 'include') {
      if (userProfile.fitnessLevel === 'beginner') {
        baseSuggestions.push('push-ups', 'squats', 'planks');
      } else if (userProfile.fitnessLevel === 'advanced') {
        baseSuggestions.push('deadlifts', 'pull-ups', 'muscle-ups');
      }
      
      if (userProfile.goals?.includes('strength')) {
        baseSuggestions.push('bench press', 'overhead press', 'rows');
      }
      
      if (userProfile.goals?.includes('cardio')) {
        baseSuggestions.push('jumping jacks', 'mountain climbers', 'burpees');
      }
    } else {
      // Exclude suggestions based on common issues
      if (userProfile.injuries?.includes('knee')) {
        baseSuggestions.push('jump squats', 'lunges', 'box jumps');
      }
      
      if (userProfile.injuries?.includes('back')) {
        baseSuggestions.push('deadlifts', 'good mornings', 'sit-ups');
      }
    }
    
    return [...new Set(baseSuggestions)]; // Remove duplicates
  };

  const aiSuggestions = generateAISuggestions();

  return (
    <ExerciseTextInput
      value={value}
      onChange={onChange}
      type={type}
      enableAI={enableAI}
      suggestions={aiSuggestions}
    />
  );
};

export default TextInputWrapper; 