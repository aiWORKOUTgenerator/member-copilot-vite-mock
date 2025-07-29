import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Eye, ChevronLeft, ChevronRight, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';
import { WorkoutGenerationRequest } from '../../types/workout-generation.types';
import { calculateFitnessLevel } from '../../utils/fitnessLevelCalculator';
import { calculateWorkoutIntensity } from '../../utils/fitnessLevelCalculator';
import { ReviewPageProps } from './types';
import { ProfileSection, WorkoutSection, DetailedWorkoutSection } from './sections';
import { 
  convertWorkoutFocusToDisplay, 
  validateWorkoutFocusData, 
  validateDetailedWorkoutProgression
} from './utils';
import { ValidationService } from './utils/validationService';
import { ValidationFeedbackPanel, ErrorHandlingPanel, ErrorTemplates } from '../shared';
import { aiLogger } from '../../services/ai/logging/AILogger';

// Section types for type safety
type SectionKey = 'profile' | 'timeIntensity' | 'preferences' | 'goals' | 'metrics' | 'health';

export const ReviewPage: React.FC<ReviewPageProps> = ({ 
  onNavigate, 
  profileData, 
  waiverData, 
  workoutFocusData,
  workoutType,
  workoutGeneration,
  onWorkoutGenerated 
}) => {
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Progressive disclosure state
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    profile: false,
    timeIntensity: false,
    preferences: false,
    goals: false,
    metrics: false,
    health: false
  });

  // Toggle section expansion
  const toggleSection = useCallback((section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Convert workout focus data to display format
  const displayWorkoutFocus = convertWorkoutFocusToDisplay(workoutFocusData, workoutType);

  // Validation state
  const [isDataReady, setIsDataReady] = useState(false);
  const validationResult = useMemo(() => {
    if (!isDataReady) return { isValid: false, issues: [], summary: { errors: 0, warnings: 0, info: 0 } };
    return ValidationService.validateWorkoutData(workoutFocusData, profileData, workoutType, onNavigate);
  }, [isDataReady, workoutFocusData, profileData, workoutType, onNavigate]);

  // More lenient validation for enabling the button
  const hasRequiredData = useMemo(() => {
    return !!(
      profileData?.experienceLevel &&
      profileData?.primaryGoal &&
      workoutFocusData &&
      validateWorkoutFocusData(workoutFocusData, workoutType)
    );
  }, [profileData, workoutFocusData, workoutType]);

  // Handle workout generation
  const handleGenerateWorkout = useCallback(async () => {
    // Debug logging before generation
    aiLogger.debug('ReviewPage - Starting workout generation', {
      hasProfileData: !!profileData,
      hasWorkoutFocusData: !!workoutFocusData,
      workoutType,
      hasRequiredData,
      workoutGenerationIsGenerating: workoutGeneration.isGenerating
    });

    if (!profileData || !workoutFocusData || !validateWorkoutFocusData(workoutFocusData, workoutType)) {
      const errorMsg = 'Missing required data. Please complete your profile and workout focus.';
      aiLogger.error({
        error: new Error(errorMsg),
        context: 'workout generation validation',
        component: 'ReviewPage',
        severity: 'medium',
        userImpact: true
      });
      setGenerationError(errorMsg);
      return;
    }

    // Clear any previous errors
    setGenerationError(null);

    try {
      // Build the request
      const request: WorkoutGenerationRequest = {
        workoutType,
        profileData: profileData!,
        waiverData: waiverData || undefined,
        workoutFocusData: workoutFocusData!,
        userProfile: {
          fitnessLevel: profileData!.calculatedFitnessLevel || calculateFitnessLevel(profileData!.experienceLevel, profileData!.physicalActivity),
          goals: [profileData!.primaryGoal.toLowerCase().replace(' ', '_')],
          preferences: {
            workoutStyle: profileData!.preferredActivities.map(activity => 
              activity.toLowerCase().replace(/[^a-z0-9]/g, '_')
            ),
            timePreference: 'morning',
            intensityPreference: profileData!.calculatedWorkoutIntensity || 'moderate',
            advancedFeatures: profileData!.experienceLevel === 'Advanced Athlete',
            aiAssistanceLevel: 'moderate'
          },
          basicLimitations: {
            injuries: profileData!.injuries.filter(injury => injury !== 'No Injuries'),
            availableEquipment: profileData!.availableEquipment,
            availableLocations: profileData!.availableLocations
          },
          enhancedLimitations: {
            timeConstraints: 0,
            equipmentConstraints: [],
            locationConstraints: [],
            recoveryNeeds: {
              restDays: 2,
              sleepHours: 7,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'moderate'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 0,
            averageDuration: 45,
            preferredFocusAreas: [],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.7,
            consistencyScore: 0.5,
            plateauRisk: 'low'
          },
          learningProfile: {
            prefersSimplicity: true,
            explorationTendency: 'moderate',
            feedbackPreference: 'simple',
            learningStyle: 'visual',
            motivationType: 'intrinsic',
            adaptationSpeed: 'moderate'
          }
        }
      };

      // Start the generation process (don't await it)
      workoutGeneration.generateWorkout(request).then((generatedWorkout) => {
        aiLogger.debug('ReviewPage - Workout generation completed in background', {
          hasGeneratedWorkout: !!generatedWorkout,
          workoutId: generatedWorkout?.id,
          workoutTitle: generatedWorkout?.title
        });
        if (generatedWorkout) {
          onWorkoutGenerated(generatedWorkout);
        }
      }).catch((error) => {
        aiLogger.error({
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'background workout generation error',
          component: 'ReviewPage',
          severity: 'medium',
          userImpact: true
        });
      });

      // Immediately navigate to results page
      onNavigate('results');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout generation',
        component: 'ReviewPage',
        severity: 'high',
        userImpact: true
      });
      setGenerationError(errorMsg);
    }
  }, [profileData, workoutFocusData, workoutType, workoutGeneration, onNavigate, onWorkoutGenerated]);

  // Initialize data validation after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataReady(true);
    }, 300); // Increased delay to give App.tsx more time to load data from localStorage
    return () => clearTimeout(timer);
  }, []);

  // Debug logging for validation state
  useEffect(() => {
    aiLogger.debug('ReviewPage - Validation state updated', {
      isDataReady,
      validationResult: {
        isValid: validationResult.isValid,
        issueCount: validationResult.issues?.length || 0
      },
      hasRequiredData
    });
  }, [isDataReady, validationResult, hasRequiredData]);

  // Main Content - Two Column Layout
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('focus')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Review & Generate</h1>
          </div>
          <div className="flex items-center space-x-4">
            {validationResult.isValid ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Ready to Generate</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Review Required</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Your Fitness Profile */}
          <div className="space-y-6">
            {profileData && (
              <ProfileSection
                profileData={profileData}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
              />
            )}
          </div>

          {/* Right Column - Today's Workout Focus */}
          <div className="space-y-6">
            {/* Quick Workout Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Workout Focus</h2>
              {workoutType === 'quick' && displayWorkoutFocus && profileData ? (
                <WorkoutSection
                  displayWorkoutFocus={displayWorkoutFocus}
                  profileData={profileData}
                />
              ) : workoutType === 'detailed' && workoutFocusData && profileData ? (
                <DetailedWorkoutSection
                  profileData={profileData}
                  workoutFocusData={workoutFocusData}
                />
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Please complete your workout focus preferences
                </div>
              )}
            </div>

            {/* Validation Feedback */}
            {!validationResult.isValid && (
              <ValidationFeedbackPanel
                issues={validationResult.issues}
                summary={validationResult.summary}
                title="Review Required"
                showHelp={true}
              />
            )}

            {/* Error Handling */}
            {generationError && (
              <ErrorHandlingPanel
                error={ErrorTemplates.generationFailed(generationError)}
                onRetry={handleGenerateWorkout}
                onDismiss={() => setGenerationError(null)}
              />
            )}

            {/* Generate Button */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerateWorkout}
                disabled={!hasRequiredData}
                className={`
                  flex items-center px-6 py-3 rounded-xl font-medium text-lg
                  transition-all duration-300 group
                  ${hasRequiredData
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-lg">
                  {workoutType === 'quick' ? 'Generate Workout' : 'Generate Detailed Workout'}
                </span>
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Development Fallback Button */}
            {process.env.NODE_ENV === 'development' && !hasRequiredData && (
              <button
                onClick={handleGenerateWorkout}
                className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Force Generate (Debug)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};