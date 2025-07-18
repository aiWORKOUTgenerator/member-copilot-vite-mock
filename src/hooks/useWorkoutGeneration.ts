// Custom hook for workout generation workflow
import { useState, useCallback, useRef } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  WorkoutGenerationState, 
  WorkoutGenerationRequest, 
  WorkoutGenerationError, 
  WorkoutGenerationOptions,
  WorkoutGenerationStatus 
} from '../types/workout-results.types';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { UserProfile, PerWorkoutOptions } from '../types/enhanced-workout-types';
import { ProfileData } from '../components/Profile/types/profile.types';
import { LiabilityWaiverData } from '../components/LiabilityWaiver/types/liability-waiver.types';
import { logger } from '../utils/logger';

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
  const { generateWorkout: aiGenerateWorkout, serviceStatus } = useAI();
  
  const [state, setState] = useState<WorkoutGenerationState>({
    isGenerating: false,
    generatedWorkout: null,
    error: null,
    generationProgress: 0,
    lastGenerated: null
  });
  
  const [status, setStatus] = useState<WorkoutGenerationStatus>('idle');
  const lastRequestRef = useRef<WorkoutGenerationRequest | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert profile data to user profile format
  const convertProfileToUserProfile = useCallback((profileData: ProfileData): UserProfile => {
    return {
      fitnessLevel: profileData.experienceLevel.toLowerCase() as 'new to exercise' | 'some experience' | 'advanced athlete',
      goals: [profileData.primaryGoal.toLowerCase().replace(' ', '_')],
      preferences: {
        workoutStyle: profileData.preferredActivities.map(activity => 
          activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
        ),
        timePreference: 'morning', // Default, could be enhanced
        intensityPreference: (() => {
          // Map target activity level to progression rate (not immediate intensity)
          let targetProgressionRate: 'conservative' | 'moderate' | 'aggressive';
          switch (profileData.intensityLevel) {
            case 'lightly':
            case 'light-moderate':
              targetProgressionRate = 'conservative';
              break;
            case 'moderately':
            case 'active':
              targetProgressionRate = 'moderate';
              break;
            case 'very':
            case 'extremely':
              targetProgressionRate = 'aggressive';
              break;
            default:
              targetProgressionRate = 'moderate';
          }

          // Calculate appropriate starting intensity based on current activity level
          // This ensures safety while working toward the target goal
          switch (profileData.physicalActivity) {
            case 'sedentary':
              // Sedentary users start with low intensity regardless of target
              return 'low';
              
            case 'light':
              // Lightly active users start with low-to-moderate intensity
              return targetProgressionRate === 'aggressive' ? 'moderate' : 'low';
              
            case 'moderate':
              // Moderately active users can start with moderate intensity
              return 'moderate';
              
            case 'very':
              // Very active users can handle moderate-to-high intensity
              return targetProgressionRate === 'conservative' ? 'moderate' : 'high';
              
            case 'extremely':
              // Extremely active users can handle high intensity
              return targetProgressionRate === 'conservative' ? 'moderate' : 'high';
              
            case 'varies':
              // For users with varying activity, use moderate as default
              return 'moderate';
              
            default:
              return 'moderate';
          }
        })(),
        advancedFeatures: profileData.experienceLevel === 'Advanced Athlete',
        aiAssistanceLevel: 'moderate'
      },
      limitations: {
        timeConstraints: parseInt(profileData.preferredDuration.split('-')[1]) || 60,
        equipmentConstraints: profileData.availableEquipment.map(eq => 
          eq.toLowerCase().replace(/[^a-z0-9]/g, '_')
        ),
        injuries: profileData.injuries.filter(injury => injury !== 'No Injuries')
      },
      history: {
        completedWorkouts: 0,
        averageDuration: parseInt(profileData.preferredDuration.split('-')[0]) || 30,
        preferredFocusAreas: [],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.7
      },
      learningProfile: {
        prefersSimplicity: profileData.experienceLevel === 'New to Exercise',
        explorationTendency: 'moderate',
        feedbackPreference: 'detailed'
      }
    };
  }, []);

  // Validate generation request
  const validateRequest = useCallback((request: WorkoutGenerationRequest): WorkoutGenerationError | null => {
    if (!request.profileData) {
      return {
        code: 'INVALID_DATA',
        message: 'Profile data is required for workout generation',
        retryable: false
      };
    }

    if (!request.workoutFocusData) {
      return {
        code: 'INVALID_DATA',
        message: 'Workout focus data is required',
        retryable: false
      };
    }

    if (serviceStatus !== 'ready') {
      return {
        code: 'API_ERROR',
        message: 'AI service is not ready. Please try again.',
        retryable: true
      };
    }

    return null;
  }, [serviceStatus]);

  // Update generation progress
  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, generationProgress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  // Main workout generation function
  const generateWorkout = useCallback(async (
    request: WorkoutGenerationRequest, 
    options: WorkoutGenerationOptions = {}
  ): Promise<GeneratedWorkout | null> => {
    try {
      // Abort any existing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      lastRequestRef.current = request;

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

      setStatus('generating');
      updateProgress(10);

      // Convert profile data to user profile
      const userProfile = convertProfileToUserProfile(request.profileData);
      updateProgress(20);

      // Prepare workout options
      const workoutOptions: PerWorkoutOptions = {
        ...request.workoutFocusData,
        // Add any additional processing needed
      };

      updateProgress(30);

      // Generate workout using AI service
      logger.info('Starting workout generation', { userProfile, workoutOptions });
      
      const generatedWorkout = await aiGenerateWorkout(workoutOptions);
      
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Generation was cancelled');
      }

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

      logger.info('Workout generation completed successfully', { 
        workoutId: enhancedWorkout.id,
        duration: enhancedWorkout.totalDuration,
        difficulty: enhancedWorkout.difficulty
      });

      return enhancedWorkout;

    } catch (error) {
      const workoutError: WorkoutGenerationError = {
        code: error.name === 'AbortError' ? 'NETWORK_ERROR' : 'GENERATION_FAILED',
        message: error.message || 'Failed to generate workout',
        details: error,
        retryable: error.name !== 'AbortError'
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: workoutError.message,
        generationProgress: 0
      }));

      setStatus('error');
      
      logger.error('Workout generation failed', workoutError);
      
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [aiGenerateWorkout, validateRequest, convertProfileToUserProfile, updateProgress]);

  // Regenerate workout with same parameters
  const regenerateWorkout = useCallback(async (options?: WorkoutGenerationOptions): Promise<GeneratedWorkout | null> => {
    if (!lastRequestRef.current) {
      setState(prev => ({
        ...prev,
        error: 'No previous generation request to retry'
      }));
      return null;
    }

    return generateWorkout(lastRequestRef.current, options);
  }, [generateWorkout]);

  // Retry generation (same as regenerate but with different semantics)
  const retryGeneration = useCallback(async (): Promise<GeneratedWorkout | null> => {
    return regenerateWorkout({ retryAttempts: 3 });
  }, [regenerateWorkout]);

  // Clear workout state
  const clearWorkout = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      isGenerating: false,
      generatedWorkout: null,
      error: null,
      generationProgress: 0,
      lastGenerated: null
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