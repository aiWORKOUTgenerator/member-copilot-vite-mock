import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { z } from 'zod';

describe('useFormValidation', () => {
  const schema = z.object({
    experienceLevel: z.enum(['New to Exercise', 'Some Experience', 'Advanced Athlete']),
    physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'very', 'extremely', 'varies']),
    preferredDuration: z.enum(['15-30 min', '30-45 min', '45-60 min', '60+ min']),
    timeCommitment: z.enum(['2-3', '3-4', '4-5', '6-7']),
    intensityLevel: z.enum(['lightly', 'light-moderate', 'moderately', 'active', 'very', 'extremely']),
    preferredActivities: z.array(z.enum([
      'Walking/Power Walking', 'Running/Jogging', 'Swimming', 'Cycling/Mountain Biking',
      'Rock Climbing/Bouldering', 'Yoga', 'Pilates', 'Hiking', 'Dancing',
      'Team Sports', 'Golf', 'Martial Arts'
    ])),
    availableEquipment: z.array(z.enum([
      'Barbells & Weight Plates', 'Strength Machines',
      'Cardio Machines (Treadmill, Elliptical, Bike)', 'Functional Training Area (Kettlebells, Resistance Bands, TRX)',
      'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)', 'Pool (If available)',
      'Dumbbells', 'Resistance Bands', 'Kettlebells',
      'Cardio Machine (Treadmill, Bike)', 'Yoga Mat & Stretching Space',
      'Body Weight', 'Yoga Mat', 'Suspension Trainer/TRX', 'No equipment required'
    ]))
  });

  it('should validate fields correctly', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    act(() => {
      result.current.validateField('experienceLevel', 'New to Exercise');
      expect(result.current.getFieldError('experienceLevel')).toBeUndefined();

      result.current.validateField('experienceLevel', 'Invalid');
      expect(result.current.getFieldError('experienceLevel')).toBeDefined();
    });
  });

  it('should validate complete form', () => {
    const { result } = renderHook(() => useFormValidation(schema));

    const validData: z.infer<typeof schema> = {
      experienceLevel: 'New to Exercise',
      physicalActivity: 'moderate',
      preferredDuration: '30-45 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      preferredActivities: ['Walking/Power Walking', 'Running/Jogging'],
      availableEquipment: ['Dumbbells', 'Yoga Mat']
    };

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