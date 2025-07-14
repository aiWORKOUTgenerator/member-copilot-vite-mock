import { useProfileValidation } from '../../components/Profile/hooks/useProfileValidation';
import { ProfileData } from '../../components/Profile/schemas/profileSchema';
import { renderHook, act } from '@testing-library/react';

describe('useProfileValidation', () => {
  const mockProfileData: Partial<ProfileData> = {
    experienceLevel: 'Beginner',
    physicalActivity: 'light',
    preferredDuration: '30-45 min',
    timeCommitment: '2-3',
    intensityLevel: 'moderate',
    workoutType: 'strength',
    preferredActivities: ['Running'],
    availableEquipment: ['Dumbbells'],
    primaryGoal: 'weight-loss',
    goalTimeline: '3 months',
    age: '26-35',
    height: '5\'8"',
    weight: '150 lbs',
    gender: 'male',
    hasCardiovascularConditions: 'No',
    injuries: ['None']
  };

  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors()).toBe(false);
  });

  it('should validate step correctly', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      const isValid = result.current.validateCurrentStep(1, mockProfileData);
      expect(isValid).toBe(true);
    });
  });

  it('should handle field validation', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      const isValid = result.current.validateField('experienceLevel', 'Beginner', 1);
      expect(isValid).toBe(true);
    });
  });

  it('should handle invalid field validation', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      const isValid = result.current.validateField('experienceLevel', '', 1);
      expect(isValid).toBe(false);
    });
    
    expect(result.current.getFieldError('experienceLevel')).toBeDefined();
  });

  it('should clear field errors', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      result.current.validateField('experienceLevel', '', 1);
      result.current.clearFieldError('experienceLevel');
    });
    
    expect(result.current.getFieldError('experienceLevel')).toBeUndefined();
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      result.current.validateField('experienceLevel', '', 1);
      result.current.clearAllErrors();
    });
    
    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors()).toBe(false);
  });

  it('should validate complete profile', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      const isValid = result.current.validateComplete(mockProfileData as ProfileData);
      expect(isValid).toBe(true);
    });
  });

  it('should handle incomplete profile validation', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    const incompleteData = {
      experienceLevel: 'Beginner'
      // Missing required fields
    };
    
    act(() => {
      const isValid = result.current.validateComplete(incompleteData as ProfileData);
      expect(isValid).toBe(false);
    });
    
    expect(result.current.hasErrors()).toBe(true);
  });

  it('should track touched fields', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      result.current.validateField('experienceLevel', 'Beginner', 1);
    });
    
    expect(result.current.touchedFields).toContain('experienceLevel');
  });

  it('should check if field is valid', () => {
    const { result } = renderHook(() => useProfileValidation());
    
    act(() => {
      result.current.validateField('experienceLevel', 'Beginner', 1);
    });
    
    expect(result.current.isFieldValid('experienceLevel')).toBe(true);
  });
}); 