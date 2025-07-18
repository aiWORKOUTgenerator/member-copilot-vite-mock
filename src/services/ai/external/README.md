# External AI Service Integration Guide

## Overview

This guide explains how to integrate and use the external AI services with your existing AI service layer. The integration provides enhanced workout generation, recommendations, and user analysis using OpenAI's API.

## 🚀 Quick Start

### 1. Environment Setup

Add the following environment variables to your `.env` file:

```bash
# Required
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional
VITE_OPENAI_ORG_ID=your_organization_id
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Basic Integration

```typescript
import { useAI } from '@/contexts/AIContext';

function MyComponent() {
  const { generateWorkout, getEnhancedRecommendations } = useAI();

  const handleGenerateWorkout = async () => {
    const workoutData = {
      customization_duration: 30,
      customization_focus: 'Quick Sweat',
      customization_energy: 7,
      customization_equipment: ['Dumbbells'],
      customization_soreness: []
    };

    try {
      const workout = await generateWorkout(workoutData);
      console.log('Generated workout:', workout);
    } catch (error) {
      console.error('Workout generation failed:', error);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      const recommendations = await getEnhancedRecommendations();
      console.log('Enhanced recommendations:', recommendations);
    } catch (error) {
      console.error('Recommendations failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateWorkout}>Generate Workout</button>
      <button onClick={handleGetRecommendations}>Get Recommendations</button>
    </div>
  );
}
```

## 📋 Features

### 1. AI-Powered Workout Generation

Generate complete, personalized workouts using OpenAI:

```typescript
const { generateWorkout } = useAI();

const workout = await generateWorkout({
  customization_duration: 45,
  customization_focus: 'Strength Building',
  customization_energy: 8,
  customization_equipment: ['Barbell', 'Dumbbells'],
  customization_soreness: ['legs']
});

// Returns GeneratedWorkout object with:
// - Complete workout structure (warmup, main, cooldown)
// - Detailed exercises with form cues
// - Personalized notes and safety reminders
// - Progression tips
```

### 2. Enhanced Recommendations

Get AI-enhanced recommendations that consider your full context:

```typescript
const { getEnhancedRecommendations } = useAI();

const recommendations = await getEnhancedRecommendations();

// Returns PrioritizedRecommendation[] with:
// - Personalized reasoning
// - Scientific backing
// - Alternative options
// - Follow-up questions
```

### 3. Smart Insights Enhancement

Enhance existing insights with AI explanations:

```typescript
const { getEnhancedInsights } = useAI();

const insights = await getEnhancedInsights();

// Returns enhanced insights with:
// - Scientific explanations
// - Personalized context
// - Actionable next steps
```

### 4. User Preference Analysis

Analyze user patterns and preferences:

```typescript
const { analyzeUserPreferences } = useAI();

const analysis = await analyzeUserPreferences();

// Returns UserPreferenceAnalysis with:
// - Preferred workout styles
// - Optimal timing
// - Motivation factors
// - Progression recommendations
```

## 🔧 Configuration

### Feature Flags

Control AI features with feature flags:

```typescript
import { isFeatureEnabled } from '@/services/ai/external/config/openai.config';

// Check if features are enabled
if (isFeatureEnabled('openai_workout_generation')) {
  // Generate workout using OpenAI
}

if (isFeatureEnabled('openai_enhanced_recommendations')) {
  // Use enhanced recommendations
}
```

### Current Feature Flags

- `openai_workout_generation` - 10% rollout
- `openai_enhanced_recommendations` - 15% rollout  
- `openai_user_analysis` - 5% rollout

### Performance Configuration

Adjust performance settings in `openai.config.ts`:

```typescript
const productionConfig = {
  performance: {
    maxRequestsPerMinute: 100,
    timeoutMs: 15000,
    retryAttempts: 2,
    cacheTimeoutMs: 10 * 60 * 1000 // 10 minutes
  }
};
```

## 🎯 Integration with Quick Workout

The external AI services are fully integrated with the Quick Workout feature:

### Enhanced Quick Workout Flow

1. **User Input**: User fills out Quick Workout form
2. **AI Analysis**: System analyzes selections for conflicts/optimizations
3. **Workout Generation**: OpenAI generates personalized workout
4. **Enhanced Insights**: AI provides contextual recommendations
5. **Real-time Feedback**: Cross-component analysis with AI insights

### Example Integration

```typescript
// In QuickWorkoutForm component
const { generateWorkout, getEnhancedRecommendations } = useAI();

const handleSubmit = async () => {
  try {
    // Generate workout using AI
    const generatedWorkout = await generateWorkout(focusData);
    
    // Get additional recommendations
    const recommendations = await getEnhancedRecommendations();
    
    // Navigate to results with AI-generated content
    onNavigate('results', { workout: generatedWorkout, recommendations });
  } catch (error) {
    // Fallback to standard workout generation
    handleFallbackGeneration();
  }
};
```

## 🔍 Advanced Usage

### Custom Workout Generation

Generate specialized workouts:

```typescript
import { openAIWorkoutGenerator } from '@/services/ai/external/OpenAIWorkoutGenerator';

// Generate workout variations
const variations = await openAIWorkoutGenerator.generateWorkoutVariations(
  baseRequest,
  3 // Number of variations
);

// Generate progressive workout series
const progressiveWorkouts = await openAIWorkoutGenerator.generateProgressiveWorkouts(
  baseRequest,
  4 // Number of weeks
);

// Generate adapted workout
const adaptedWorkout = await openAIWorkoutGenerator.generateAdaptedWorkout(
  baseRequest,
  {
    newDuration: 20,
    newIntensity: 'low',
    newEquipment: ['Body Weight']
  }
);
```

### Direct OpenAI Integration

For advanced use cases, use the OpenAI services directly:

```typescript
import { openAIService } from '@/services/ai/external/OpenAIService';
import { WORKOUT_GENERATION_PROMPT_TEMPLATE } from '@/services/ai/external/prompts/workout-generation.prompts';

// Generate custom content
const customWorkout = await openAIService.generateFromTemplate(
  WORKOUT_GENERATION_PROMPT_TEMPLATE,
  {
    fitnessLevel: 'advanced athlete',
    duration: 60,
    focus: 'Olympic Lifting',
    // ... other variables
  }
);
```

## 🛠️ Error Handling

The system includes comprehensive error handling:

### Automatic Fallback

```typescript
// If OpenAI fails, system automatically falls back to rule-based AI
const recommendations = await getEnhancedRecommendations();
// Returns either AI-enhanced or standard recommendations
```

### Error Types

```typescript
try {
  const workout = await generateWorkout(data);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('authentication')) {
    // Handle API key issues
  } else {
    // Handle other errors
  }
}
```

## 📊 Monitoring & Analytics

### Performance Metrics

```typescript
import { openAIService } from '@/services/ai/external/OpenAIService';

const metrics = openAIService.getMetrics();
console.log('AI Performance:', {
  requestCount: metrics.requestCount,
  averageResponseTime: metrics.averageResponseTime,
  errorRate: metrics.errorRate,
  tokenUsage: metrics.tokenUsage,
  costEstimate: metrics.costEstimate
});
```

### Feature Flag Analytics

```typescript
import { featureFlagService } from '@/services/ai/featureFlags/FeatureFlagService';

const analytics = featureFlagService.getAnalytics('openai_workout_generation');
console.log('Feature Flag Performance:', analytics);
```

## 🚨 Security & Best Practices

### API Key Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage and costs

### Rate Limiting

- Respect OpenAI's rate limits
- Implement exponential backoff
- Cache responses appropriately
- Use feature flags to control usage

### Error Handling

- Always provide fallback mechanisms
- Log errors for debugging
- Provide user-friendly error messages
- Monitor error rates

## 🧪 Testing

### Unit Tests

```typescript
// Test workout generation
import { OpenAIWorkoutGenerator } from '@/services/ai/external/OpenAIWorkoutGenerator';

describe('OpenAI Workout Generator', () => {
  it('should generate valid workout', async () => {
    const generator = new OpenAIWorkoutGenerator();
    const workout = await generator.generateFromQuickWorkout(mockData, mockProfile);
    
    expect(workout).toBeDefined();
    expect(workout.totalDuration).toBe(30);
    expect(workout.warmup).toBeDefined();
    expect(workout.mainWorkout).toBeDefined();
    expect(workout.cooldown).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Test full AI service integration
import { useAI } from '@/contexts/AIContext';

describe('AI Service Integration', () => {
  it('should generate workout with fallback', async () => {
    const { generateWorkout } = renderHook(() => useAI()).result.current;
    
    // Mock OpenAI failure
    mockOpenAIFailure();
    
    const workout = await generateWorkout(mockData);
    
    // Should still return a workout (fallback)
    expect(workout).toBeDefined();
  });
});
```

## 🎨 Customization

### Custom Prompts

Create custom prompt templates:

```typescript
import { PromptTemplate } from '@/services/ai/external/types/external-ai.types';

const customPrompt: PromptTemplate = {
  id: 'custom_workout_v1',
  name: 'Custom Workout Generation',
  description: 'Generates custom workout type',
  template: `
    You are a specialized trainer for {{workoutType}}.
    Create a {{duration}} minute workout for {{fitnessLevel}} level.
    // ... rest of prompt
  `,
  variables: [
    { name: 'workoutType', type: 'string', required: true },
    { name: 'duration', type: 'number', required: true },
    { name: 'fitnessLevel', type: 'string', required: true }
  ]
};
```

### Custom Strategies

Implement custom AI strategies:

```typescript
import { AIStrategy } from '@/services/ai/external/types/external-ai.types';

class CustomAIStrategy implements AIStrategy {
  async generateRecommendations(context: GlobalAIContext): Promise<PrioritizedRecommendation[]> {
    // Custom implementation
  }
  
  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout> {
    // Custom implementation
  }
  
  // ... other methods
}
```

## 📚 API Reference

### Core Types

```typescript
interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  estimatedCalories: number;
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete';
  equipment: string[];
  warmup: WorkoutPhase;
  mainWorkout: WorkoutPhase;
  cooldown: WorkoutPhase;
  reasoning: string;
  personalizedNotes: string[];
  progressionTips: string[];
  safetyReminders: string[];
  generatedAt: Date;
  aiModel: string;
  confidence: number;
  tags: string[];
}

interface WorkoutPhase {
  name: string;
  duration: number;
  exercises: Exercise[];
  instructions: string;
  tips: string[];
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration?: number;
  repetitions?: number;
  sets?: number;
  restTime?: number;
  equipment?: string[];
  form: string;
  modifications: ExerciseModification[];
  commonMistakes: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementType: 'cardio' | 'strength' | 'flexibility' | 'balance';
  personalizedNotes?: string[];
  difficultyAdjustments?: DifficultyAdjustment[];
}
```

## 🔧 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify `VITE_OPENAI_API_KEY` is set correctly
   - Check API key permissions
   - Ensure sufficient credits

2. **Rate Limiting**
   - Reduce `maxRequestsPerMinute` in config
   - Implement request queuing
   - Use caching more aggressively

3. **Slow Response Times**
   - Reduce `maxTokens` in prompts
   - Use simpler prompt templates
   - Implement streaming for real-time feedback

4. **Feature Flags Not Working**
   - Check feature flag configuration
   - Verify user profile setup
   - Review rollout percentages

### Debug Mode

Enable debug mode for detailed logging:

```typescript
import { debugConfig } from '@/services/ai/external/config/openai.config';

// In development
if (import.meta.env.MODE === 'development') {
  debugConfig();
}
```

## 🎯 Next Steps

1. **Set up environment variables**
2. **Test basic workout generation**
3. **Customize prompts for your use case**
4. **Monitor performance and costs**
5. **Gradually increase feature flag rollouts**
6. **Implement advanced features as needed**

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the error logs
- Test with feature flags disabled
- Contact the AI team for assistance

---

**Note**: This integration requires an OpenAI API key and may incur costs based on usage. Monitor your usage and adjust rate limits accordingly. 