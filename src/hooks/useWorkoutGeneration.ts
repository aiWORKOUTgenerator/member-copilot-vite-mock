// Custom hook for workout generation workflow
import { useState, useCallback, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  WorkoutGenerationState, 
  WorkoutGenerationRequest, 
  WorkoutGenerationStatus 
} from '../types/workout-generation.types';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { UserProfile } from '../types/user';
import { PerWorkoutOptions } from '../types/core';
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { logger } from '../utils/logger';
import { profileTransformers } from '../utils/dataTransformers';

// Enhanced return type interface
export interface UseWorkoutGenerationReturn {
  // State
  state: WorkoutGenerationState;
  status: WorkoutGenerationStatus;
  
  // Actions
  generateWorkout: (request: WorkoutGenerationRequest, options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  regenerateWorkout: (options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  clearWorkout: () => void;
  retryGeneration: () => Promise<GeneratedWorkout | null>;
  
  // Utilities
  canRegenerate: boolean;
  hasError: boolean;
  isGenerating: boolean;
}

// Enhanced error types with specific codes and recovery suggestions
export interface WorkoutGenerationError {
  code: 'INVALID_DATA' | 'API_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'GENERATION_FAILED' | 'SERVICE_UNAVAILABLE' | 'RATE_LIMITED' | 'INSUFFICIENT_DATA';
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number; // seconds
  recoverySuggestion?: string;
  fallbackAvailable?: boolean;
}

// Enhanced generation options with retry and timeout settings
export interface WorkoutGenerationOptions {
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  useFallback?: boolean;
  enableDetailedLogging?: boolean;
}

// Fallback workout generation function
const generateFallbackWorkout = (userProfile: UserProfile, workoutOptions: PerWorkoutOptions): GeneratedWorkout => {
  console.log('🔄 Generating fallback workout due to AI service unavailability');
  
  const focusArea = workoutOptions.customization_focus || 'strength';
  const energyLevel = workoutOptions.customization_energy || 3;
  const duration = workoutOptions.customization_duration || 45;
  
  // Create a basic workout structure
  const exercises = [
    {
      id: 'fallback-1',
      name: 'Bodyweight Squats',
      sets: 3,
      reps: 12,
      duration: 60,
      rest: 90,
      difficulty: 'beginner',
      equipment: ['body_weight'],
      focusAreas: ['legs', 'glutes'],
      instructions: 'Stand with feet shoulder-width apart, lower into a squat position, then return to standing.'
    },
    {
      id: 'fallback-2',
      name: 'Push-ups',
      sets: 3,
      reps: 8,
      duration: 45,
      rest: 90,
      difficulty: 'beginner',
      equipment: ['body_weight'],
      focusAreas: ['chest', 'arms'],
      instructions: 'Start in plank position, lower body to ground, then push back up.'
    },
    {
      id: 'fallback-3',
      name: 'Plank Hold',
      sets: 3,
      reps: 1,
      duration: 30,
      rest: 60,
      difficulty: 'beginner',
      equipment: ['body_weight'],
      focusAreas: ['core'],
      instructions: 'Hold plank position with straight body from head to heels.'
    }
  ];

  return {
    id: `fallback-${Date.now()}`,
    name: `Basic ${focusArea} Workout`,
    description: 'A simple, effective workout using bodyweight exercises.',
    exercises,
    totalDuration: duration,
    difficulty: 'beginner',
    focusAreas: [focusArea],
    equipment: ['body_weight'],
    tags: ['fallback', 'bodyweight', focusArea],
    confidence: 0.6, // Lower confidence for fallback
    generatedAt: new Date(),
    metadata: {
      isFallback: true,
      reason: 'AI service unavailable',
      userProfile: {
        fitnessLevel: userProfile.fitnessLevel,
        goals: userProfile.goals
      }
    }
  };
};

// Enhanced error message mapping
const getErrorDetails = (code: WorkoutGenerationError['code'], originalError?: any): WorkoutGenerationError => {
  const errorMap: Record<WorkoutGenerationError['code'], Omit<WorkoutGenerationError, 'code'>> = {
    INVALID_DATA: {
      message: 'The provided workout data is incomplete or invalid. Please check your selections and try again.',
      retryable: false,
      recoverySuggestion: 'Please review your workout preferences and ensure all required fields are filled.',
      fallbackAvailable: false
    },
    API_ERROR: {
      message: 'The AI service encountered an error while generating your workout. This is usually temporary.',
      retryable: true,
      retryAfter: 5,
      recoverySuggestion: 'Please wait a moment and try again. If the problem persists, try refreshing the page.',
      fallbackAvailable: true
    },
    NETWORK_ERROR: {
      message: 'Unable to connect to the workout generation service. Please check your internet connection.',
      retryable: true,
      retryAfter: 10,
      recoverySuggestion: 'Check your internet connection and try again. If using a VPN, try disconnecting it.',
      fallbackAvailable: true
    },
    TIMEOUT_ERROR: {
      message: 'The workout generation is taking longer than expected. This might be due to high demand.',
      retryable: true,
      retryAfter: 15,
      recoverySuggestion: 'Please try again in a few moments. If the issue continues, try during off-peak hours.',
      fallbackAvailable: true
    },
    GENERATION_FAILED: {
      message: 'We encountered an unexpected error while creating your workout. Our team has been notified.',
      retryable: true,
      retryAfter: 30,
      recoverySuggestion: 'Please try again. If the problem persists, contact support with the error details.',
      fallbackAvailable: true
    },
    SERVICE_UNAVAILABLE: {
      message: 'The workout generation service is temporarily unavailable. We\'re working to restore it.',
      retryable: true,
      retryAfter: 60,
      recoverySuggestion: 'Please try again in a few minutes. You can also try our basic workout templates.',
      fallbackAvailable: true
    },
    RATE_LIMITED: {
      message: 'You\'ve reached the limit for workout generations. Please wait before trying again.',
      retryable: true,
      retryAfter: 300, // 5 minutes
      recoverySuggestion: 'Please wait 5 minutes before generating another workout. Consider saving your favorites.',
      fallbackAvailable: true
    },
    INSUFFICIENT_DATA: {
      message: 'We need more information about your fitness preferences to generate a personalized workout.',
      retryable: false,
      recoverySuggestion: 'Please complete your fitness profile with more details about your goals and preferences.',
      fallbackAvailable: true
    }
  };

  const baseError = errorMap[code];
  return {
    code,
    ...baseError,
    details: originalError,
    retryAfter: baseError.retryAfter || 0
  };
};

// Retry logic with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`🔄 Retry attempt ${attempt}/${maxAttempts} in ${Math.round(delay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Timeout wrapper
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
};

export const useWorkoutGeneration = (): UseWorkoutGenerationReturn => {
  const { generateWorkout: aiGenerateWorkout, serviceStatus } = useAI();
  
  // Enhanced state with retry tracking
  const [state, setState] = useState<WorkoutGenerationState>({
    isGenerating: false,
    generatedWorkout: null,
    error: null,
    generationProgress: 0,
    lastGenerated: null
  });
  
  // Separate retry tracking state
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<WorkoutGenerationError | null>(null);
  
  const [status, setStatus] = useState<WorkoutGenerationStatus>('idle');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<WorkoutGenerationRequest | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced profile conversion with better error handling
  const convertProfileToUserProfile = useCallback((profileData: ProfileData): UserProfile => {
    return profileTransformers.convertProfileToUserProfileSimple(profileData);
  }, []);

  // Enhanced validation with better error messages
  const validateRequest = useCallback((request: WorkoutGenerationRequest): WorkoutGenerationError | null => {
    if (!request.profileData) {
      return getErrorDetails('INVALID_DATA', new Error('Profile data is missing'));
    }

    if (!request.workoutFocusData) {
      return getErrorDetails('INVALID_DATA', new Error('Workout focus data is missing'));
    }

    // Check for minimum required profile data
    if (!request.profileData.experienceLevel || !request.profileData.primaryGoal) {
      return getErrorDetails('INSUFFICIENT_DATA', new Error('Missing experience level or primary goal'));
    }

    if (serviceStatus === 'error') {
      return getErrorDetails('SERVICE_UNAVAILABLE', new Error('AI service is in error state'));
    }

    if (serviceStatus === 'initializing') {
      return getErrorDetails('API_ERROR', new Error('AI service is still initializing'));
    }

    if (serviceStatus !== 'ready') {
      return getErrorDetails('API_ERROR', new Error('AI service is not ready'));
    }

    return null;
  }, [serviceStatus]);

  // Update generation progress
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, generationProgress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  // Enhanced workout generation with retry logic and fallbacks
  const generateWorkout = useCallback(async (
    request: WorkoutGenerationRequest, 
    options: WorkoutGenerationOptions = {}
  ): Promise<GeneratedWorkout | null> => {
    const {
      retryAttempts = 3,
      retryDelay = 1000,
      timeout = 30000, // 30 seconds
      useFallback = true,
      enableDetailedLogging = false
    } = options;

    try {
      // Abort any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      lastRequestRef.current = request;

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Validate request
      setStatus('validating');
      const validationError = validateRequest(request);
      if (validationError) {
        throw validationError;
      }

      // Start generation
      setState(prev => ({
        ...prev,
        isGenerating: true,
        error: null,
        generationProgress: 0
      }));
      setRetryCount(0);
      setLastError(null);

      setStatus('generating');
      updateProgress(10);

      // Use the provided userProfile or convert from profileData if not provided
      const userProfile = request.userProfile || convertProfileToUserProfile(request.profileData);
      
      // Debug log to verify userProfile
      console.log('🔍 useWorkoutGeneration - userProfile:', {
        hasUserProfile: !!request.userProfile,
        fitnessLevel: userProfile.fitnessLevel,
        goals: userProfile.goals,
        source: request.userProfile ? 'provided' : 'converted'
      });
      
      updateProgress(20);

      // Prepare workout options
      const workoutOptions: PerWorkoutOptions = {
        ...request.workoutFocusData,
      };

      updateProgress(30);

      // Enhanced generation with retry logic and timeout
      const generationOperation = async (): Promise<GeneratedWorkout> => {
        if (enableDetailedLogging) {
          logger.info('Starting workout generation with retry logic', { 
            userProfile: { fitnessLevel: userProfile.fitnessLevel, goals: userProfile.goals }, 
            workoutOptions,
            retryAttempts,
            timeout
          });
        }
        
        const generatedWorkout = await aiGenerateWorkout(workoutOptions);
        
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Generation was cancelled');
        }

        return generatedWorkout;
      };

      // Execute with retry logic and timeout
      const generatedWorkout = await retryWithBackoff(
        () => withTimeout(generationOperation(), timeout, 'Workout generation timed out'),
        retryAttempts,
        retryDelay
      );

      updateProgress(80);
      setStatus('enhancing');

      // Enhance workout with additional metadata
      const enhancedWorkout: GeneratedWorkout = {
        ...generatedWorkout,
        generatedAt: new Date(),
        confidence: generatedWorkout.confidence || 0.85,
        tags: [
          ...(generatedWorkout.tags || []),
          userProfile.fitnessLevel,
          'ai_generated',
          new Date().toISOString().split('T')[0]
        ]
      };

      updateProgress(100);
      setStatus('complete');

      // Update state with successful generation
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedWorkout: enhancedWorkout,
        error: null,
        generationProgress: 100,
        lastGenerated: new Date()
      }));
      setRetryCount(0);
      setLastError(null);

      if (enableDetailedLogging) {
        logger.info('Workout generation completed successfully', { 
          workoutId: enhancedWorkout.id,
          duration: enhancedWorkout.totalDuration,
          difficulty: enhancedWorkout.difficulty,
          retryCount: 0
        });
      }

      return enhancedWorkout;

    } catch (error) {
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isTimeoutError = error instanceof Error && error.message.includes('timed out');
      const isNetworkError = error instanceof Error && (
        error.message.includes('network') || 
        error.message.includes('fetch') ||
        error.message.includes('connection')
      );

      let errorCode: WorkoutGenerationError['code'] = 'GENERATION_FAILED';
      
      if (isAbortError) {
        errorCode = 'NETWORK_ERROR';
      } else if (isTimeoutError) {
        errorCode = 'TIMEOUT_ERROR';
      } else if (isNetworkError) {
        errorCode = 'NETWORK_ERROR';
      } else if (error instanceof Error && error.message.includes('rate limit')) {
        errorCode = 'RATE_LIMITED';
      } else if (error instanceof Error && error.message.includes('service unavailable')) {
        errorCode = 'SERVICE_UNAVAILABLE';
      }

      const workoutError = getErrorDetails(errorCode, error);
      
      // Update state with error information
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: workoutError.message,
        generationProgress: 0,
        lastError: workoutError
      }));

      setStatus('error');
      
      logger.error('Workout generation failed', workoutError);
      
      // Try fallback generation if enabled and available
      if (useFallback && workoutError.fallbackAvailable && lastRequestRef.current) {
        try {
          console.log('🔄 Attempting fallback workout generation...');
          
          const userProfile = convertProfileToUserProfile(lastRequestRef.current.profileData);
          const workoutOptions: PerWorkoutOptions = {
            ...lastRequestRef.current.workoutFocusData,
          };
          
          const fallbackWorkout = generateFallbackWorkout(userProfile, workoutOptions);
          
          setState(prev => ({
            ...prev,
            generatedWorkout: fallbackWorkout,
            error: null,
            generationProgress: 100,
            lastGenerated: new Date()
          }));
          
          setStatus('complete');
          
          console.log('✅ Fallback workout generated successfully');
          return fallbackWorkout;
          
        } catch (fallbackError) {
          console.error('❌ Fallback generation also failed:', fallbackError);
          // Keep the original error if fallback also fails
        }
      }
      
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [aiGenerateWorkout, validateRequest, convertProfileToUserProfile, updateProgress, logger]);

  // Enhanced retry with exponential backoff
  const retryGeneration = useCallback(async (): Promise<GeneratedWorkout | null> => {
    if (!lastRequestRef.current) {
      const error = getErrorDetails('INVALID_DATA', new Error('No previous generation request to retry'));
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error
      }));
      return null;
    }

    const currentRetryCount = state.retryCount + 1;
    const maxRetries = 3;
    
    if (currentRetryCount > maxRetries) {
      const error = getErrorDetails('GENERATION_FAILED', new Error('Maximum retry attempts exceeded'));
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error
      }));
      return null;
    }

    setState(prev => ({ ...prev, retryCount: currentRetryCount }));
    
    // Exponential backoff delay
    const delay = Math.pow(2, currentRetryCount) * 1000;
    
    return new Promise((resolve) => {
      retryTimeoutRef.current = setTimeout(async () => {
        const result = await generateWorkout(lastRequestRef.current!, {
          retryAttempts: 1, // Don't retry within retry
          enableDetailedLogging: true
        });
        resolve(result);
      }, delay);
    });
  }, [generateWorkout, state.retryCount]);

  // Regenerate workout with same parameters
  const regenerateWorkout = useCallback(async (options?: WorkoutGenerationOptions): Promise<GeneratedWorkout | null> => {
    if (!lastRequestRef.current) {
      const error = getErrorDetails('INVALID_DATA', new Error('No previous generation request to retry'));
      setState(prev => ({
        ...prev,
        error: error.message,
        lastError: error
      }));
      return null;
    }

    return generateWorkout(lastRequestRef.current, options);
  }, [generateWorkout]);

  // Clear workout state
  const clearWorkout = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setState({
      isGenerating: false,
      generatedWorkout: null,
      error: null,
      generationProgress: 0,
      lastGenerated: null,
      retryCount: 0,
      lastError: null
    });
    
    setStatus('idle');
    lastRequestRef.current = null;
  }, []);

  // Computed properties
  const canRegenerate = !state.isGenerating && lastRequestRef.current !== null;
  const hasError = state.error !== null;
  const isGenerating = state.isGenerating;

  return {
    state,
    status,
    generateWorkout,
    regenerateWorkout,
    clearWorkout,
    retryGeneration,
    canRegenerate,
    hasError,
    isGenerating
  };
}; 