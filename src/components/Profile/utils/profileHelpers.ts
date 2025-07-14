// Utility functions for profile operations
import { ProfileData } from '../types/profile.types';

// Calculate completion percentage
export const calculateCompletionPercentage = (profileData: ProfileData): number => {
  const totalFields = Object.keys(profileData).length;
  let completedFields = 0;

  Object.entries(profileData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) completedFields++;
    } else if (typeof value === 'string') {
      if (value.trim().length > 0) completedFields++;
    }
  });

  return Math.round((completedFields / totalFields) * 100);
};

// Check if profile is complete
export const isProfileComplete = (profileData: ProfileData): boolean => {
  return calculateCompletionPercentage(profileData) === 100;
};

// Format field values for display
export const formatFieldValue = (value: string | string[]): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value;
}; 