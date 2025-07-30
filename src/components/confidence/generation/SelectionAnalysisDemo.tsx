import React from 'react';
import { useWorkoutGeneration } from '../../../hooks/useWorkoutGeneration';
import { SelectionAnalysisDisplay } from './SelectionAnalysisDisplay';
import './SelectionAnalysisDemo.css';

export const SelectionAnalysisDemo: React.FC = () => {
  const {
    state,
    status,
    generateWorkout,
    selectionAnalysis,
    selectionAnalysisProgress,
    isGenerating
  } = useWorkoutGeneration();

  const handleGenerateWorkout = async () => {
    const mockRequest = {
      type: 'quick' as const,
      userProfile: {
        fitnessLevel: 'intermediate' as const,
        goals: ['strength'],
        preferences: { 
          workoutStyle: ['strength'], 
          timePreference: 'morning', 
          intensityPreference: 'moderate', 
          advancedFeatures: false, 
          aiAssistanceLevel: 'moderate' 
        },
        basicLimitations: { 
          injuries: [], 
          availableEquipment: ['dumbbells'], 
          availableLocations: ['home'] 
        },
        enhancedLimitations: { 
          timeConstraints: 30, 
          equipmentConstraints: ['dumbbells'], 
          locationConstraints: ['home'], 
          recoveryNeeds: { 
            restDays: 2, 
            sleepHours: 8, 
            hydrationLevel: 'moderate' 
          }, 
          mobilityLimitations: [], 
          progressionRate: 'moderate' 
        },
        workoutHistory: { 
          estimatedCompletedWorkouts: 10, 
          averageDuration: 30, 
          preferredFocusAreas: ['strength'], 
          progressiveEnhancementUsage: {}, 
          aiRecommendationAcceptance: 0.8, 
          consistencyScore: 0.7, 
          plateauRisk: 'low' 
        },
        learningProfile: { 
          prefersSimplicity: false, 
          explorationTendency: 'moderate', 
          feedbackPreference: 'detailed', 
          learningStyle: 'mixed', 
          motivationType: 'achievement', 
          adaptationSpeed: 'moderate' 
        }
      },
      workoutFocusData: {
        customization_focus: 'strength',
        customization_energy: { rating: 7, categories: ['moderate'] },
        customization_duration: 30
      }
    };

    try {
      await generateWorkout(mockRequest);
    } catch (error) {
      console.error('Demo generation failed:', error);
    }
  };

  return (
    <div className="selection-analysis-demo">
      <div className="demo-header">
        <h2>Selection Analysis Demo</h2>
        <p>This demo shows the real-time selection analysis during workout generation.</p>
      </div>

      <div className="demo-controls">
        <button 
          onClick={handleGenerateWorkout}
          disabled={isGenerating}
          className="generate-button"
        >
          {isGenerating ? 'Generating...' : 'Generate Workout'}
        </button>
        
        <div className="status-info">
          <span className="status-label">Status:</span>
          <span className={`status-value ${status}`}>{status}</span>
        </div>
      </div>

      <div className="demo-content">
        <div className="generation-progress">
          <h3>Workout Generation Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${state.generationProgress}%` }}
            />
          </div>
          <span className="progress-text">{state.generationProgress}%</span>
        </div>

        <div className="analysis-section">
          <h3>Selection Analysis</h3>
          <SelectionAnalysisDisplay
            analysis={selectionAnalysis}
            analysisProgress={selectionAnalysisProgress}
            generationProgress={state.generationProgress}
            isGenerating={isGenerating}
          />
        </div>

        {state.generatedWorkout && (
          <div className="workout-result">
            <h3>Generated Workout</h3>
            <div className="workout-info">
              <p><strong>Duration:</strong> {state.generatedWorkout.totalDuration} minutes</p>
              <p><strong>Difficulty:</strong> {state.generatedWorkout.difficulty}</p>
              <p><strong>Exercises:</strong> {state.generatedWorkout.exercises.length}</p>
            </div>
          </div>
        )}

        {state.error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 