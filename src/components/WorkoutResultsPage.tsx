import React, { useState, useCallback } from 'react';
import { Zap, ChevronLeft, AlertTriangle, RefreshCw, Clock, Target, TrendingUp } from 'lucide-react';
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';
import { UseWorkoutGenerationReturn } from '../hooks/useWorkoutGeneration';
import { WorkoutDisplay } from './WorkoutDisplay';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { aiLogger } from '../services/ai/logging/AILogger';

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
  // 🔍 DEBUG: Log what WorkoutResultsPage receives
  aiLogger.debug('WorkoutResultsPage - Component rendered with props', {
    hasGeneratedWorkout: !!generatedWorkout,
    workoutId: generatedWorkout?.id,
    workoutTitle: generatedWorkout?.title,
    workoutKeys: generatedWorkout ? Object.keys(generatedWorkout) : 'N/A',
    isGenerating: workoutGeneration.isGenerating,
    hasError: workoutGeneration.hasError,
    status: workoutGeneration.status,
    error: workoutGeneration.state.error
  });
  
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'complete'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'complete'>('idle');

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
    
    setDownloadStatus('downloading');
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

      setDownloadStatus('complete');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout download',
        component: 'WorkoutResultsPage',
        severity: 'low',
        userImpact: false
      });
      setDownloadStatus('idle');
    }
  }, [generatedWorkout]);

  // Handle workout sharing
  const handleShare = useCallback(async () => {
    if (!generatedWorkout) return;
    
    setShareStatus('sharing');
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

      setShareStatus('complete');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (error) {
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'workout sharing',
        component: 'WorkoutResultsPage',
        severity: 'low',
        userImpact: false
      });
      setShareStatus('idle');
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
            Please wait while we create your personalized workout routine...
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generation Progress</h3>
              <span className="text-sm text-gray-600">
                {workoutGeneration.state.generationProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${workoutGeneration.state.generationProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Status: {workoutGeneration.status === 'generating' ? 'Creating your personalized workout...' :
                      workoutGeneration.status === 'enhancing' ? 'Adding finishing touches...' :
                      workoutGeneration.status === 'validating' ? 'Validating your information...' :
                      'Processing...'}
            </p>
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