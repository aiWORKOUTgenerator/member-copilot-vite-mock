import React, { useState, useCallback } from 'react';
import { Zap, ChevronLeft, AlertTriangle, RefreshCw, Target, HelpCircle, Info } from 'lucide-react';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { UseWorkoutGenerationReturn } from '../hooks/useWorkoutGeneration';
import { WorkoutDisplay } from './WorkoutDisplay';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { aiLogger } from '../services/ai/logging/AILogger';
import { 
  ConfidenceExplanation, 
  ImprovementActions, 
  ConfidenceHelp 
} from './confidence';
import { SelectionAnalysisDisplay } from './confidence/generation/SelectionAnalysisDisplay';

export interface WorkoutResultsPageProps {
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  generatedWorkout: GeneratedWorkout | null;
  workoutGeneration: UseWorkoutGenerationReturn;
  onWorkoutUpdate: (workout: GeneratedWorkout) => void;
}

const WorkoutResultsPage: React.FC<WorkoutResultsPageProps> = ({ 
  onNavigate, 
  generatedWorkout, 
  workoutGeneration,
  onWorkoutUpdate 
}) => {
  // Transparency features state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Create a fallback user profile from available workout data
  const confidenceUserProfile = generatedWorkout ? {
    fitnessLevel: generatedWorkout.difficulty,
    experience: generatedWorkout.difficulty, // Map difficulty to experience
    goals: ['general_fitness'], // Default goal since not available in workout
    equipment: generatedWorkout.equipment,
    injuries: [], // Not available in workout data
    limitations: [] // Not available in workout data
  } : undefined;

  // Handle improvement action clicks
  const handleImprovementAction = useCallback((suggestion: any) => {
    aiLogger.debug('Improvement action clicked', {
      action: suggestion.action,
      category: suggestion.category,
      impact: suggestion.impact
    });

    // Navigate to appropriate page based on suggestion
    if (suggestion.deepLink) {
      if (suggestion.deepLink.includes('profile')) {
        onNavigate('profile');
      } else if (suggestion.deepLink.includes('focus')) {
        onNavigate('focus');
      }
    }
  }, [onNavigate]);

  // Handle workout regeneration
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      const newWorkout = await workoutGeneration.regenerateWorkout();
      if (newWorkout) {
        onWorkoutUpdate(newWorkout);
      }
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout regeneration',
        component: 'WorkoutResultsPage',
        severity: 'medium',
        userImpact: true
      });
    } finally {
      setIsRegenerating(false);
    }
  }, [workoutGeneration, onWorkoutUpdate]);

  // Handle workout download
  const handleDownload = useCallback(async () => {
    if (!generatedWorkout) return;
    
    try {
      // Create a simple text version of the workout
      const workoutText = `
${generatedWorkout.title}
${generatedWorkout.description}

Duration: ${generatedWorkout.totalDuration} minutes
Difficulty: ${generatedWorkout.difficulty}
Estimated Calories: ${generatedWorkout.estimatedCalories}

WARM-UP (${generatedWorkout.warmup.duration} minutes)
${generatedWorkout.warmup.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.description}`).join('\n')}

MAIN WORKOUT (${generatedWorkout.mainWorkout.duration} minutes)
${generatedWorkout.mainWorkout.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.description}`).join('\n')}

COOL-DOWN (${generatedWorkout.cooldown.duration} minutes)
${generatedWorkout.cooldown.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.description}`).join('\n')}

SAFETY REMINDERS:
${generatedWorkout.safetyReminders?.map(reminder => `• ${reminder}`).join('\n') || 'None'}

Generated on: ${generatedWorkout.generatedAt.toLocaleDateString()}
      `.trim();

      // Create and download the file
      const blob = new Blob([workoutText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedWorkout.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workout.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout download',
        component: 'WorkoutResultsPage',
        severity: 'low',
        userImpact: false
      });
    }
  }, [generatedWorkout]);

  // Handle workout sharing
  const handleShare = useCallback(async () => {
    if (!generatedWorkout) return;
    
    try {
      const shareData = {
        title: generatedWorkout.title,
        text: `Check out this AI-generated workout: ${generatedWorkout.description}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Workout details copied to clipboard!');
      }

    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout sharing',
        component: 'WorkoutResultsPage',
        severity: 'low',
        userImpact: false
      });
    }
  }, [generatedWorkout]);

  // Handle retry generation
  const handleRetryGeneration = useCallback(async () => {
    try {
      const newWorkout = await workoutGeneration.retryGeneration();
      if (newWorkout) {
        onWorkoutUpdate(newWorkout);
      }
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout retry generation',
        component: 'WorkoutResultsPage',
        severity: 'medium',
        userImpact: true
      });
    }
  }, [workoutGeneration, onWorkoutUpdate]);

  // Show loading state if generation is in progress
  if (workoutGeneration.isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <RefreshCw className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generating Your Workout</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI is creating a personalized workout routine just for you...
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Generation Progress</h3>
              <span className="text-lg font-bold text-purple-600">
                {workoutGeneration.state.generationProgress}%
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${workoutGeneration.state.generationProgress}%` }}
              />
            </div>
            
            {/* Dynamic Status Messages */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800 mb-2">
                  {workoutGeneration.status === 'generating' ? 
                    (workoutGeneration.state.generationProgress < 15 ? 'Initializing AI systems...' :
                     workoutGeneration.state.generationProgress < 30 ? 'Analyzing your fitness profile...' :
                     workoutGeneration.state.generationProgress < 45 ? 'Processing your preferences...' :
                     workoutGeneration.state.generationProgress < 60 ? 'Selecting optimal exercises...' :
                     workoutGeneration.state.generationProgress < 75 ? 'Personalizing your workout...' :
                     workoutGeneration.state.generationProgress < 85 ? 'Optimizing exercise sequence...' :
                     workoutGeneration.state.generationProgress < 95 ? 'Adding finishing touches...' :
                     'Almost ready!') :
                    workoutGeneration.status === 'enhancing' ? 'Enhancing with AI insights...' :
                    workoutGeneration.status === 'validating' ? 'Validating workout safety...' :
                    'Processing your request...'}
                </p>
                <p className="text-sm text-gray-600">
                  {workoutGeneration.state.generationProgress < 30 ? 
                    'Setting up your personalized workout environment' :
                   workoutGeneration.state.generationProgress < 60 ? 
                    'Matching exercises to your fitness level and goals' :
                   workoutGeneration.state.generationProgress < 85 ? 
                    'Fine-tuning intensity and progression' :
                    'Finalizing your workout details'}
                </p>
              </div>
              
              {/* Progress Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {[15, 30, 45, 60, 75, 90, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      workoutGeneration.state.generationProgress >= milestone
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-md'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Estimated Time */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    workoutGeneration.state.generationProgress > 30 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                  <span>Exercise Selection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    workoutGeneration.state.generationProgress > 60 ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                  <span>Personalization</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              While You Wait
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">💡 Pro Tip</p>
                <p>This workout is being customized based on your fitness level, goals, and available equipment.</p>
              </div>
              <div>
                <p className="font-medium mb-1">⏱️ Typical Time</p>
                <p>Most workouts are generated in 10-15 seconds. Complex routines may take a bit longer.</p>
              </div>
            </div>
          </div>

          {/* Selection Analysis Display */}
          <div className="mt-6">
            <SelectionAnalysisDisplay
              analysis={workoutGeneration.selectionAnalysis}
              analysisProgress={workoutGeneration.selectionAnalysisProgress}
              generationProgress={workoutGeneration.state.generationProgress}
              isGenerating={workoutGeneration.isGenerating}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if generation failed
  if (workoutGeneration.hasError || (!generatedWorkout && workoutGeneration.state.error)) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Generation Failed</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We encountered an issue while generating your workout. Please try again.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
            <p className="text-red-700 mb-4">
              {workoutGeneration.state.error || 'An unknown error occurred during workout generation.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleRetryGeneration}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => onNavigate('review')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the generated workout
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your AI-Generated Workout</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A personalized workout routine created specifically for your goals and preferences
        </p>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button 
          onClick={() => onNavigate('review')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Review
        </button>
      </div>

      {/* Workout Display */}
      {generatedWorkout && (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            aiLogger.error({
              error: error instanceof Error ? error : new Error(String(error)),
              context: 'WorkoutDisplay error boundary',
              component: 'WorkoutResultsPage',
              severity: 'medium',
              userImpact: true,
              metadata: { errorInfo }
            });
          }}
          fallback={
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Workout Display Error</h3>
              <p className="text-red-700 mb-4">
                There was an issue displaying your workout. Please try regenerating it.
              </p>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate Workout'}
              </button>
            </div>
          }
        >
          <WorkoutDisplay
            workout={generatedWorkout}
            onRegenerate={handleRegenerate}
            onDownload={handleDownload}
            onShare={handleShare}
            isRegenerating={isRegenerating}
          />
        </ErrorBoundary>
      )}

      {/* Selection Analysis Results */}
      {workoutGeneration.selectionAnalysis && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Selection Analysis Results</h3>
            <div className="text-sm text-gray-600">
              Analysis completed during generation
            </div>
          </div>
          <SelectionAnalysisDisplay
            analysis={workoutGeneration.selectionAnalysis}
            analysisProgress={100}
            generationProgress={100}
            isGenerating={false}
          />
        </div>
      )}

      {/* Transparency Features */}
      {generatedWorkout && (
        <div className="space-y-6">
          {/* Confidence Score Transparency */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Understanding Your Confidence Score</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </button>
            </div>

            {/* Confidence Score Summary */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Your Confidence Score: {Math.round((generatedWorkout.confidence || 0.8) * 100)}%
                  </h4>
                  <p className="text-sm text-blue-700">
                    This score shows how well this workout matches your profile and preferences.
                  </p>
                </div>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  {showExplanation ? 'Hide Details' : 'Why This Score?'}
                </button>
              </div>
            </div>

            {/* Expandable Explanation */}
            {showExplanation && (
              <div className="mb-4">
                <ConfidenceExplanation
                  confidence={generatedWorkout.confidence || 0.8}
                  factors={generatedWorkout.confidenceFactors}
                  userProfile={confidenceUserProfile}
                />
              </div>
            )}

            {/* Improvement Actions */}
            <div className="mb-4">
              <ImprovementActions
                confidence={generatedWorkout.confidence || 0.8}
                factors={generatedWorkout.confidenceFactors}
                userProfile={confidenceUserProfile}
                onActionClick={handleImprovementAction}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Want to improve your score? Update your profile preferences.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => onNavigate('focus')}
                  className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors"
                >
                  Adjust Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <ConfidenceHelp
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Additional Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Ready to Start?</h4>
            <p className="text-sm text-green-700 mb-3">
              Begin your workout and track your progress as you complete each exercise.
            </p>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              Start Workout →
            </button>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Need Changes?</h4>
            <p className="text-sm text-blue-700 mb-3">
              Adjust your preferences or generate a completely new workout routine.
            </p>
            <button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isRegenerating ? 'Generating...' : 'Generate New Workout →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsPage;