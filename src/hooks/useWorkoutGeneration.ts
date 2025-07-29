// Custom hook for workout generation workflow
import { useState, useCallback, useRef } from 'react';
import { 
  WorkoutGenerationStatus,
  WorkoutGenerationError,
  WorkoutGenerationOptions
} from '../types/workout-generation.types';
import { WorkoutGenerationRequest } from '../types/workout-results.types';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { OpenAIStrategy } from '../services/ai/external/OpenAIStrategy';
import { RecommendationEngine } from '../services/ai/internal/RecommendationEngine';
import { retryWithBackoff } from '../utils/retryUtils';
import { withTimeout } from '../utils/timeoutUtils';
import { aiLogger } from '../services/ai/logging/AILogger';
import { transformToInternalContext } from '../utils/contextTransformers';
import { generateFallbackWorkout } from '../utils/fallbackWorkoutGenerator';
import { getErrorDetails } from '../utils/errorUtils';
import { updateProgressWithDelay, simulateAIProgress } from '../utils/progressUtils';

// Local state interface using external AI types
interface WorkoutGenerationState {
  status: WorkoutGenerationStatus;
  generationProgress: number;
  error: string | null;
  retryCount: number;
  lastError: WorkoutGenerationError | null;
  generatedWorkout: GeneratedWorkout | null;
  lastGenerated: Date | null;
}

// Enhanced return type interface - RESTORED FROM UN-REFACTORED VERSION
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

export const useWorkoutGeneration = (): UseWorkoutGenerationReturn => {
  const [state, setState] = useState<WorkoutGenerationState>({
    status: 'idle',
    generationProgress: 0,
    error: null,
    retryCount: 0,
    lastError: null,
    generatedWorkout: null,
    lastGenerated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const openAIStrategy = useRef(new OpenAIStrategy());
  const recommendationEngine = useRef(new RecommendationEngine());
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<WorkoutGenerationRequest | null>(null);

  /**
   * Update progress handler
   */
  const handleProgressUpdate = useCallback((progress: number) => {
    setState(prev => ({ ...prev, generationProgress: progress }));
  }, []);

  /**
   * Generate workout with internal and external AI
   */
  const generateWorkout = useCallback(async (
    request: WorkoutGenerationRequest,
    options: WorkoutGenerationOptions = {}
  ): Promise<GeneratedWorkout | null> => {
    const {
      timeout = 30000,
      retryAttempts = 3,
      retryDelay = 1000,
      useExternalAI = true,
      fallbackToInternal = true,
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

      // Reset state
      setState({ 
        status: 'generating', 
        generationProgress: 0, 
        error: null,
        retryCount: 0,
        lastError: null,
        generatedWorkout: null,
        lastGenerated: null
      });

      // Initial progress update
      await updateProgressWithDelay(handleProgressUpdate, 10, 300);

      // Transform request to internal context
      const internalContext = transformToInternalContext(request);

      // Generate internal recommendations and prompt
      const internalPhasePromise = recommendationEngine.current.generateWorkout(
        internalContext,
        {
          useExternalAI,
          fallbackToInternal,
          confidenceThreshold: 0.7,
          maxRecommendations: 10
        }
      );

      // Start progress simulation
      const progressPromise = simulateAIProgress(
        handleProgressUpdate,
        10,
        40,
        3000,
        abortControllerRef.current?.signal
      );

      // Wait for internal phase
      const [internalResult] = await Promise.all([
        internalPhasePromise,
        progressPromise
      ]);

      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Generation was cancelled');
      }

      // Update progress
      await updateProgressWithDelay(handleProgressUpdate, 50);

      let workout: GeneratedWorkout;

      if (useExternalAI) {
        try {
          // Generate workout with OpenAI
          const generationPromise = retryWithBackoff(
            () => withTimeout(
              openAIStrategy.current.generateWorkout({
                ...request,
                recommendations: internalResult.recommendations,
                enhancedPrompt: internalResult.prompt
              }),
              timeout,
              'Workout generation timed out'
            ),
            retryAttempts,
            retryDelay
          );

          // Simulate progress during external generation
          const externalProgressPromise = simulateAIProgress(
            handleProgressUpdate,
            50,
            90,
            5000,
            abortControllerRef.current?.signal
          );

          // Wait for external generation
          const [externalWorkout] = await Promise.all([
            generationPromise,
            externalProgressPromise
          ]);

          workout = externalWorkout;

        } catch (error) {
          if (!fallbackToInternal) {
            throw error;
          }

          aiLogger.debug('External AI failed, falling back to internal generation', {
            component: 'useWorkoutGeneration',
            context: 'workout generation'
          });

          // Use internal template as fallback
          workout = internalResult.template as GeneratedWorkout;
        }
      } else {
        // Use internal template directly
        workout = internalResult.template as GeneratedWorkout;
      }

      // Final progress update
      await updateProgressWithDelay(handleProgressUpdate, 100);

      // Update state
      setState((prev: WorkoutGenerationState) => ({
        ...prev,
        status: 'complete',
        generationProgress: 100,
        error: null,
        retryCount: 0,
        lastError: null,
        generatedWorkout: workout,
        lastGenerated: new Date()
      }));

      if (enableDetailedLogging) {
        aiLogger.info('Workout generation completed successfully', { 
          workoutId: workout.id,
          duration: workout.totalDuration,
          difficulty: workout.difficulty,
          retryCount: 0
        });
      }

      return workout;

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
        status: 'error',
        error: workoutError.message,
        generationProgress: 0,
        lastError: workoutError
      }));
      
      aiLogger.error({
        error: new Error(workoutError.message),
        context: 'workout generation',
        component: 'useWorkoutGeneration',
        severity: 'high',
        userImpact: true
      });
      
      // Try fallback generation if enabled and available
      if (fallbackToInternal && workoutError.fallbackAvailable && request) {
        try {
          console.log('🔄 Attempting fallback workout generation...');
          
          const fallbackWorkout = generateFallbackWorkout(request.userProfile, request.workoutFocusData);
          
          setState(prev => ({
            ...prev,
            status: 'complete',
            error: null,
            generationProgress: 100,
            lastError: null,
            generatedWorkout: fallbackWorkout as any, // Type assertion to bypass incompatible Exercise types
            lastGenerated: new Date()
          }));
          
          console.log('✅ Fallback workout generated successfully');
          return fallbackWorkout as any; // Type assertion to bypass incompatible Exercise types
          
        } catch (fallbackError) {
          console.error('❌ Fallback generation also failed:', fallbackError);
          // Keep the original error if fallback also fails
        }
      }
      
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [handleProgressUpdate]);

  /**
   * Regenerate workout with same parameters - RESTORED FROM UN-REFACTORED VERSION
   */
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

  /**
   * Clear workout state - RESTORED FROM UN-REFACTORED VERSION
   */
  const clearWorkout = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    setState({
      status: 'idle',
      generationProgress: 0,
      error: null,
      retryCount: 0,
      lastError: null,
      generatedWorkout: null,
      lastGenerated: null
    });
    
    lastRequestRef.current = null;
  }, []);

  /**
   * Retry generation with exponential backoff
   */
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

  // Computed properties - RESTORED FROM UN-REFACTORED VERSION
  const isGenerating = state.status === 'generating';
  const canRegenerate = !isGenerating && lastRequestRef.current !== null;
  const hasError = state.error !== null;

  return {
    state,
    status: state.status,
    generateWorkout,
    regenerateWorkout,
    clearWorkout,
    retryGeneration,
    canRegenerate,
    hasError,
    isGenerating
  };
}; 