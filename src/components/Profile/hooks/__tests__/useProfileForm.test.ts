import { renderHook, act } from '@testing-library/react';
import { useProfileForm } from '../useProfileForm';

describe('useProfileForm', () => {
  const mockValidData = {
    experienceLevel: 'New to Exercise',
    physicalActivity: 'moderate',
    preferredDuration: '30-45 min',
    timeCommitment: '3-4',
    intensityLevel: 'moderately',
    preferredActivities: ['Walking/Power Walking', 'Running/Jogging'],
    availableEquipment: ['Dumbbells', 'Yoga Mat'],
    primaryGoal: 'Weight Loss',
    goalTimeline: '3 months',
    age: '26-35',
    height: '170',
    weight: '70',
    gender: 'prefer-not-to-say',
    hasCardiovascularConditions: 'No',
    injuries: ['No Injuries']
  };

  const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useProfileForm());
    expect(result.current.profileData).toBeDefined();
    expect(result.current.currentStep).toBe(1);
  });

  it('should handle input changes', () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.handleInputChange('experienceLevel', 'New to Exercise');
    });

    expect(result.current.profileData.experienceLevel).toBe('New to Exercise');
  });

  it('should handle array toggles', () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      result.current.handleArrayToggle('preferredActivities', 'Walking/Power Walking');
    });

    expect(result.current.profileData.preferredActivities).toContain('Walking/Power Walking');

    act(() => {
      result.current.handleArrayToggle('preferredActivities', 'Walking/Power Walking');
    });

    expect(result.current.profileData.preferredActivities).not.toContain('Walking/Power Walking');
  });

  it('should calculate completion percentage', () => {
    const { result } = renderHook(() => useProfileForm());

    act(() => {
      Object.entries(mockValidData).forEach(([key, value]) => {
        result.current.handleInputChange(key as keyof typeof mockValidData, value as string | string[]);
      });
    });

    expect(result.current.getCompletionPercentage()).toBeGreaterThan(0);
  });

  it('should validate steps correctly', () => {
    const { result } = renderHook(() => useProfileForm());

    // Step 1
    act(() => {
      result.current.handleInputChange('experienceLevel', 'New to Exercise');
      result.current.handleInputChange('physicalActivity', 'moderate');
    });

    expect(result.current.canProceedToNextStep()).toBe(true);

    // Navigate to next step
    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);
  });
}); 