# AI Integration Examples

## 🎯 **Copy-Paste Integration Patterns**

This document provides ready-to-use code examples for integrating AI services into your components and workflows.

## 🔋 **Energy Analysis Integration**

### **Basic Energy Analysis**
```typescript
import { useGlobalAIContext } from '@/contexts/AIContext';

const EnergyAnalysisComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [energyAnalysis, setEnergyAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeEnergy = async (energyLevel: number, userProfile: UserProfile) => {
    setLoading(true);
    try {
      const analysis = await aiService.analyzeEnergyLevel(
        energyLevel,
        userProfile,
        {
          timeOfDay: 'morning',
          previousWorkout: 'yesterday'
        }
      );
      setEnergyAnalysis(analysis);
    } catch (error) {
      console.error('Energy analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>Analyzing energy level...</div>}
      {energyAnalysis && (
        <div>
          <h3>Energy Insights</h3>
          {energyAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Recommendations</h3>
          {energyAnalysis.recommendations.map((rec, index) => (
            <div key={index}>
              <strong>{rec.suggestion}</strong>
              <p>{rec.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **Energy-Based Workout Recommendations**
```typescript
const EnergyRecommendationsComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [recommendations, setRecommendations] = useState([]);

  const getEnergyRecommendations = async (energyLevel: number, userProfile: UserProfile) => {
    try {
      const recs = await aiService.getEnergyRecommendations(
        energyLevel,
        userProfile,
        'strength' // workout type
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get energy recommendations:', error);
    }
  };

  return (
    <div>
      {recommendations.map((rec, index) => (
        <div key={index} className={`priority-${rec.priority}`}>
          <h4>{rec.suggestion}</h4>
          <p>{rec.reasoning}</p>
          <small>Applicable to: {rec.applicableWorkoutTypes.join(', ')}</small>
        </div>
      ))}
    </div>
  );
};
```

## 🏃 **Soreness Analysis Integration**

### **Soreness Area Analysis**
```typescript
const SorenessAnalysisComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [sorenessAnalysis, setSorenessAnalysis] = useState(null);

  const analyzeSoreness = async (sorenessAreas: string[], userProfile: UserProfile) => {
    try {
      const analysis = await aiService.analyzeSorenessAreas(
        sorenessAreas,
        userProfile,
        {
          sorenessDuration: '2 days',
          workoutHistory: ['strength', 'cardio'],
          recoveryMethods: ['stretching', 'ice']
        }
      );
      setSorenessAnalysis(analysis);
    } catch (error) {
      console.error('Soreness analysis failed:', error);
    }
  };

  return (
    <div>
      {sorenessAnalysis && (
        <div>
          <h3>Recovery Insights</h3>
          {sorenessAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Modification Suggestions</h3>
          {sorenessAnalysis.recommendations.map((rec, index) => (
            <div key={index}>
              <strong>{rec.suggestion}</strong>
              <p>{rec.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **Soreness-Based Workout Modifications**
```typescript
const SorenessModificationsComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [modifications, setModifications] = useState([]);

  const getSorenessModifications = async (sorenessAreas: string[], userProfile: UserProfile) => {
    try {
      const mods = await aiService.getSorenessRecommendations(
        sorenessAreas,
        userProfile,
        'strength'
      );
      setModifications(mods);
    } catch (error) {
      console.error('Failed to get soreness modifications:', error);
    }
  };

  return (
    <div>
      <h3>Workout Modifications for Soreness</h3>
      {modifications.map((mod, index) => (
        <div key={index} className="modification-card">
          <h4>{mod.suggestion}</h4>
          <p>{mod.reasoning}</p>
          <div className="priority-badge">{mod.priority}</div>
        </div>
      ))}
    </div>
  );
};
```

## 🎯 **Focus Area Integration**

### **Focus Area Analysis**
```typescript
const FocusAnalysisComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [focusAnalysis, setFocusAnalysis] = useState(null);

  const analyzeFocus = async (focusAreas: string[], userProfile: UserProfile) => {
    try {
      const analysis = await aiService.analyzeFocusAreas(
        focusAreas,
        userProfile,
        {
          previousFocusAreas: ['upper body', 'core'],
          goalAlignment: 0.8,
          varietyPreference: 'moderate'
        }
      );
      setFocusAnalysis(analysis);
    } catch (error) {
      console.error('Focus analysis failed:', error);
    }
  };

  return (
    <div>
      {focusAnalysis && (
        <div>
          <h3>Focus Area Insights</h3>
          {focusAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Exercise Suggestions</h3>
          {focusAnalysis.exerciseSuggestions.map((exercise, index) => (
            <div key={index} className="exercise-suggestion">
              <h4>{exercise.name}</h4>
              <p>{exercise.description}</p>
              <small>Target areas: {exercise.targetAreas.join(', ')}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## ⏱️ **Duration Analysis Integration**

### **Duration Optimization**
```typescript
const DurationOptimizationComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [durationAnalysis, setDurationAnalysis] = useState(null);

  const optimizeDuration = async (duration: number, userProfile: UserProfile) => {
    try {
      const analysis = await aiService.analyzeDurationPreferences(
        duration,
        userProfile,
        {
          availableTime: 45,
          intensityPreference: 'moderate',
          scheduleConstraints: ['morning-only']
        }
      );
      setDurationAnalysis(analysis);
    } catch (error) {
      console.error('Duration analysis failed:', error);
    }
  };

  return (
    <div>
      {durationAnalysis && (
        <div>
          <h3>Duration Optimization</h3>
          {durationAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Structure Recommendations</h3>
          {durationAnalysis.recommendations.map((rec, index) => (
            <div key={index}>
              <strong>{rec.suggestion}</strong>
              <p>{rec.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🏋️ **Equipment Analysis Integration**

### **Equipment Optimization**
```typescript
const EquipmentOptimizationComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [equipmentAnalysis, setEquipmentAnalysis] = useState(null);

  const optimizeEquipment = async (equipment: string[], userProfile: UserProfile) => {
    try {
      const analysis = await aiService.analyzeEquipmentPreferences(
        equipment,
        userProfile,
        {
          equipmentProficiency: {
            'Dumbbells': 0.8,
            'Resistance Bands': 0.6,
            'Body Weight': 0.9
          },
          spaceConstraints: ['small-apartment'],
          budgetConsiderations: ['minimal']
        }
      );
      setEquipmentAnalysis(analysis);
    } catch (error) {
      console.error('Equipment analysis failed:', error);
    }
  };

  return (
    <div>
      {equipmentAnalysis && (
        <div>
          <h3>Equipment Optimization</h3>
          {equipmentAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Equipment Recommendations</h3>
          {equipmentAnalysis.recommendations.map((rec, index) => (
            <div key={index}>
              <strong>{rec.suggestion}</strong>
              <p>{rec.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔗 **Cross-Component Analysis Integration**

### **Component Relationship Analysis**
```typescript
const CrossComponentAnalysisComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [crossComponentAnalysis, setCrossComponentAnalysis] = useState(null);

  const analyzeComponents = async (components: ComponentData[], userProfile: UserProfile) => {
    try {
      const analysis = await aiService.analyzeCrossComponentRelationships(
        components,
        userProfile,
        {
          componentInteractions: ['energy-focus', 'duration-equipment'],
          optimizationGoals: ['balance', 'efficiency'],
          balancePreferences: ['moderate']
        }
      );
      setCrossComponentAnalysis(analysis);
    } catch (error) {
      console.error('Cross-component analysis failed:', error);
    }
  };

  return (
    <div>
      {crossComponentAnalysis && (
        <div>
          <h3>Component Relationships</h3>
          {crossComponentAnalysis.insights.map((insight, index) => (
            <p key={index}>{insight}</p>
          ))}
          <h3>Optimization Recommendations</h3>
          {crossComponentAnalysis.recommendations.map((rec, index) => (
            <div key={index}>
              <strong>{rec.suggestion}</strong>
              <p>{rec.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔧 **Error Handling Patterns**

### **Comprehensive Error Handling**
```typescript
const AIComponentWithErrorHandling = () => {
  const { aiService } = useGlobalAIContext();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAIAnalysis = async (params: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await aiService.analyzeEnergyLevel(
        params.energyLevel,
        params.userProfile,
        params.context
      );
      setResult(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      if (error instanceof ValidationError) {
        setError('Invalid input parameters. Please check your data.');
      } else if (error instanceof ServiceError) {
        setError('AI service temporarily unavailable. Please try again.');
      } else {
        setError('An unexpected error occurred. Please contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>Processing...</div>}
      {error && <div className="error-message">{error}</div>}
      {result && (
        <div>
          {/* Display results */}
        </div>
      )}
    </div>
  );
};
```

## 📊 **Performance Optimization Patterns**

### **Caching and Memoization**
```typescript
import { useMemo, useCallback } from 'react';

const OptimizedAIComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [userProfile, setUserProfile] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(5);

  // Memoize analysis function
  const analyzeEnergy = useCallback(async () => {
    if (!userProfile) return null;
    
    return await aiService.analyzeEnergyLevel(
      energyLevel,
      userProfile
    );
  }, [aiService, energyLevel, userProfile]);

  // Memoize results
  const energyAnalysis = useMemo(() => {
    return analyzeEnergy();
  }, [analyzeEnergy]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## 🎯 **Integration Best Practices**

1. **Always use GlobalAIContext** for consistent service access
2. **Provide complete user profiles** for accurate analysis
3. **Handle errors gracefully** with user-friendly messages
4. **Cache results** when appropriate to improve performance
5. **Validate inputs** before calling AI services
6. **Use loading states** to provide user feedback
7. **Implement fallback mechanisms** for service failures

---

**For more examples, see**: [Common Integration Examples](./common-integration-examples.md)