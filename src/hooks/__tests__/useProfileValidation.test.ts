import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { z } from 'zod';

describe('useFormValidation', () => {
  const schema = z.object({
    experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'very']),
    preferredDuration: z.enum(['15-30 min', '30-45 min', '45-60 min', '60+ min']),
    timeCommitment: z.enum(['2-3', '3-4', '4-5', '6-7']),
    intensityLevel: z.enum(['low', 'moderate', 'high']),
    preferredActivities: z.array(z.enum([
      'Walking/Power Walking', 'Running/Jogging', 'Swimming', 'Cycling/Mountain Biking',
      'Rock Climbing/Bouldering', 'Yoga', 'Pilates', 'Hiking', 'Dancing',
      'Team Sports', 'Golf', 'Martial Arts'
    ])),
    availableEquipment: z.array(z.enum([
      'Gym Membership', 'Home Gym', 'Dumbbells or Free Weights', 'Resistance Bands',
      'Treadmill or Cardio Machines', 'Yoga Mat', 'Body Weight', 'Kettlebells',
      'Access to Parks/Outdoor Spaces', 'Swimming Pool', 'Mountain Bike', 'Road Bike (Cycling)'
    ]))
  });

  it('should validate fields correctly', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    act(() => {
      result.current.validateField('experienceLevel', 'Beginner');
      expect(result.current.getFieldError('experienceLevel')).toBeUndefined();

      result.current.validateField('experienceLevel', 'Invalid');
      expect(result.current.getFieldError('experienceLevel')).toBeDefined();
    });
  });

  it('should validate complete form', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    const validData = {
      experienceLevel: 'Beginner',
      physicalActivity: 'moderate',
      preferredDuration: '30-45 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderate',
      preferredActivities: ['Walking/Power Walking', 'Running/Jogging'],
      availableEquipment: ['Dumbbells or Free Weights', 'Yoga Mat']
    } as const;

    act(() => {
      const isValid = result.current.validate(validData);
      expect(isValid).toBe(true);
      expect(result.current.errors).toHaveLength(0);
    });
  });

  it('should handle invalid data', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    const invalidData = {
      experienceLevel: 'Invalid',
      physicalActivity: 'Invalid',
      preferredDuration: 'Invalid',
      timeCommitment: 'Invalid',
      intensityLevel: 'Invalid',
      preferredActivities: ['Invalid'],
      availableEquipment: ['Invalid']
    } as any;

    act(() => {
      const isValid = result.current.validate(invalidData);
      expect(isValid).toBe(false);
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    act(() => {
      result.current.validateField('experienceLevel', 'Invalid');
      expect(result.current.errors.length).toBeGreaterThan(0);
      
      result.current.clearErrors();
      expect(result.current.errors).toHaveLength(0);
    });
  });
}); 