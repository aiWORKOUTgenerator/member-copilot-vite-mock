// AI Integration Example - Shows how to migrate from legacy AI to new service
import React, { useState, useEffect } from 'react';
import { useAI, useAIRecommendations, useAIInsights, useAIHealth, useMigrationStatus } from '../../contexts/AIContext';
import { UserProfile, PerWorkoutOptions } from '../../types';

import { dataTransformers } from '../../utils/dataTransformers';

/**
 * Example component showing migration from legacy AI to new service
 */
export const AIIntegrationExample: React.FC = () => {
  const { 
    initialize, 
    updateSelections, 
    analyze, 
    getEnergyInsights, 
    serviceStatus,
    enableValidation,
    setValidationMode
  } = useAI();
  
  const { recommendations, conflicts, insights } = useAIRecommendations();
  const { isHealthy, performanceMetrics } = useAIHealth();
  const { migrationStatus, migrationReport } = useMigrationStatus();
  
  const [workoutOptions, setWorkoutOptions] = useState<PerWorkoutOptions>({
    customization_energy: 3,
    customization_duration: 45,
    customization_focus: 'strength',
    customization_equipment: ['Dumbbells'],
    customization_areas: ['Upper Body', 'Core']
  });
  
  const [userProfile] = useState<UserProfile>({
    fitnessLevel: 'some experience',
    goals: ['strength', 'muscle_building'],
    preferences: {
      workoutStyle: ['strength_training'],
      timePreference: 'morning',
      intensityPreference: 'moderate',
      advancedFeatures: false,
      aiAssistanceLevel: 'moderate'
    }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Initialize AI service
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await initialize(userProfile);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
      }
    };
    
    initializeAI();
  }, [initialize, userProfile]);
  
  // Update selections when options change
  useEffect(() => {
    if (isInitialized) {
      updateSelections(workoutOptions);
    }
  }, [workoutOptions, isInitialized, updateSelections]);
  
  // Handle manual analysis
  const handleAnalyze = async () => {
    setAnalysisLoading(true);
    try {
      await analyze();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // Handle option changes
  const handleEnergyChange = (value: number) => {
    setWorkoutOptions(prev => ({ ...prev, customization_energy: value }));
  };
  
  const handleDurationChange = (value: number) => {
    setWorkoutOptions(prev => ({ ...prev, customization_duration: value }));
  };
  
  const handleFocusChange = (value: string) => {
    setWorkoutOptions(prev => ({ ...prev, customization_focus: value }));
  };
  
  // Legacy vs New Service Comparison
  const [legacyResults, setLegacyResults] = useState<any>(null);
  const [newResults, setNewResults] = useState<any>(null);
  
  const compareImplementations = async () => {
    // This would use the extracted legacy implementations
    // For demonstration, we'll simulate the comparison
    
    const legacyEnergyInsights = [
      {
        type: 'warning',
        message: 'Moderate energy level',
        recommendation: 'Consider a balanced, moderate-intensity workout'
      }
    ];
    
    const newEnergyInsights = getEnergyInsights(workoutOptions.customization_energy || 3);
    
    setLegacyResults({ energyInsights: legacyEnergyInsights });
    setNewResults({ energyInsights: newEnergyInsights });
  };
  
  if (!isInitialized) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">AI Service Integration Example</h2>
        <div className="text-gray-600">Initializing AI service...</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-100 rounded-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">AI Service Integration Example</h2>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded text-xs ${
            serviceStatus === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {serviceStatus}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isHealthy ? 'Healthy' : 'Unhealthy'}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            migrationStatus === 'complete' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
          }`}>
            Migration: {migrationStatus}
          </span>
        </div>
      </div>
      
      {/* Workout Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Energy Level</label>
          <select 
            value={workoutOptions.customization_energy || 3}
            onChange={(e) => handleEnergyChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={1}>Very Low (1)</option>
            <option value={2}>Low (2)</option>
            <option value={3}>Moderate (3)</option>
            <option value={4}>High (4)</option>
            <option value={5}>Maximum (5)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
          <select 
            value={dataTransformers.extractDurationValue(workoutOptions.customization_duration) || 45}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={75}>75 minutes</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Focus</label>
          <select 
            value={dataTransformers.extractFocusValue(workoutOptions.customization_focus) || 'strength'}
            onChange={(e) => handleFocusChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
            <option value="power">Power</option>
            <option value="recovery">Recovery</option>
          </select>
        </div>
      </div>
      
      {/* Analysis Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleAnalyze}
          disabled={analysisLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {analysisLoading ? 'Analyzing...' : 'Analyze Workout'}
        </button>
        
        <button
          onClick={compareImplementations}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Compare Legacy vs New
        </button>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={enableValidation}
            onChange={(e) => setValidationMode(e.target.checked)}
          />
          <span>Enable Validation Mode</span>
        </label>
      </div>
      
      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnergyInsightsCard workoutOptions={workoutOptions} />
        <RecommendationsCard recommendations={recommendations} />
      </div>
      
      {/* Cross-Component Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-2">Conflicts Detected</h3>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-red-700">{conflict.description}</div>
                <div className="text-red-600">{conflict.suggestedResolution}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600">Avg Response Time</div>
              <div className="font-medium">{performanceMetrics.averageExecutionTime?.toFixed(2) || 0}ms</div>
            </div>
            <div>
              <div className="text-blue-600">Cache Hit Rate</div>
              <div className="font-medium">{((performanceMetrics.cacheHitRate || 0) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-blue-600">Error Rate</div>
              <div className="font-medium">{((performanceMetrics.errorRate || 0) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-blue-600">Memory Usage</div>
              <div className="font-medium">{((performanceMetrics.memoryUsage || 0) / 1024 / 1024).toFixed(1)}MB</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Migration Status */}
      {migrationReport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Migration Status</h3>
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-medium">Phase:</span> {migrationReport.status.phase}
            </div>
            <div className="mb-2">
              <span className="font-medium">Completed:</span> {migrationReport.status.componentsCompleted.join(', ') || 'None'}
            </div>
            {migrationReport.recommendations.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Recommendations:</span>
                <ul className="ml-4 mt-1">
                  {migrationReport.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-yellow-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legacy vs New Comparison */}
      {legacyResults && newResults && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-2">Legacy vs New Service Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Legacy Implementation</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(legacyResults, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">New Service Implementation</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(newResults, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Energy Insights Card - Shows component-specific insights
 */
const EnergyInsightsCard: React.FC<{ workoutOptions: PerWorkoutOptions }> = ({ workoutOptions }) => {
  const energyInsights = useAIInsights('energy');
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3">Energy Insights</h3>
      <div className="mb-3">
        <span className="text-sm text-gray-600">Current Energy Level: </span>
        <span className="font-medium">{workoutOptions.customization_energy || 'Not set'}</span>
      </div>
      
      <div className="space-y-2">
        {energyInsights.insights.map((insight, index) => (
          <div key={index} className={`p-2 rounded text-sm ${
            insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            insight.type === 'encouragement' ? 'bg-green-50 border border-green-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="font-medium">{insight.message}</div>
            {insight.metadata?.recommendation && (
              <div className="text-xs mt-1 opacity-75">{insight.metadata.recommendation}</div>
            )}
          </div>
        ))}
        
        {energyInsights.recommendations.map((rec, index) => (
          <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="font-medium">{rec.title}</div>
            <div className="text-xs mt-1">{rec.description}</div>
          </div>
        ))}
      </div>
      
      {energyInsights.insights.length === 0 && energyInsights.recommendations.length === 0 && (
        <div className="text-gray-500 text-sm">No insights available</div>
      )}
    </div>
  );
};

/**
 * Recommendations Card - Shows general recommendations
 */
const RecommendationsCard: React.FC<{ recommendations: any[] }> = ({ recommendations }) => {
  const priorityColors = {
    critical: 'bg-red-100 border-red-200 text-red-800',
    high: 'bg-orange-100 border-orange-200 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    low: 'bg-blue-100 border-blue-200 text-blue-800'
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3">AI Recommendations</h3>
      
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div key={index} className={`p-2 border rounded text-sm ${priorityColors[rec.priority as keyof typeof priorityColors]}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{rec.title}</div>
                <div className="text-xs mt-1">{rec.description}</div>
              </div>
              <div className="text-xs opacity-75 ml-2">
                {rec.priority} | {(rec.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length === 0 && (
        <div className="text-gray-500 text-sm">No recommendations available</div>
      )}
    </div>
  );
};

/**
 * Migration Control Panel - For development/testing
 */
export const MigrationControlPanel: React.FC = () => {
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  
  const handleRolloutChange = (percentage: number) => {
    setRolloutPercentage(percentage);
            // Rollout percentage setting removed - no longer needed
  };
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-gray-800 mb-3">Migration Control Panel</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Rollout Percentage: {rolloutPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={rolloutPercentage}
            onChange={(e) => handleRolloutChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% (Legacy)</span>
            <span>100% (New Service)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRolloutChange(0)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Full Legacy
          </button>
          <button
            onClick={() => handleRolloutChange(100)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Full New Service
          </button>
        </div>
      </div>
    </div>
  );
}; 