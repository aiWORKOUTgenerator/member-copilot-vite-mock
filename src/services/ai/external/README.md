# External AI Service Integration Guide

## Overview

This guide explains how to integrate and use the external AI services with your existing AI service layer. The integration provides enhanced workout generation, recommendations, and user analysis using OpenAI's API.

**🎯 Feature-First Architecture** - The service follows a feature-first architecture with three main features:
- **QuickWorkoutSetup**: Rapid workout generation with intelligent duration optimization
- **DetailedWorkoutSetup**: Comprehensive workout planning with advanced customization
- **RecommendationSystem**: AI-powered personalized recommendations

## 🏗️ Architecture

### Directory Structure
```
src/services/ai/external/
├── features/                    # Feature-First Organization
│   ├── quick-workout-setup/     # Quick workout generation
│   │   ├── QuickWorkoutFeature.ts
│   │   ├── workflow/           # Feature workflow
│   │   ├── prompts/           # Feature-specific prompts
│   │   │   └── duration-configs/  # Duration-specific templates
│   │   ├── types/             # Feature-specific types
│   │   ├── constants/         # Feature-specific constants
│   │   └── helpers/           # Feature-specific utilities
│   │
│   ├── detailed-workout-setup/ # Detailed workout generation
│   │   ├── DetailedWorkoutFeature.ts
│   │   ├── workflow/          # Enhanced workout logic
│   │   ├── prompts/          # Comprehensive templates
│   │   │   └── duration-configs/  # Duration-specific (20min-150min)
│   │   ├── types/            # Advanced workout types
│   │   ├── constants/        # Workout configurations
│   │   └── helpers/          # Specialized utilities
│   │
│   └── recommendation-system/ # AI recommendations
│       ├── index.ts          # Feature exports
│       ├── prompts/          # Recommendation templates
│       └── README.md         # Feature documentation
│
├── shared/                     # Shared Components
│   ├── core/                  # Core services
│   │   ├── OpenAIService.ts   # Main service
│   │   ├── OpenAIStrategy.ts  # Strategy implementation
│   │   └── OpenAIWorkoutGenerator.ts
│   ├── infrastructure/        # Infrastructure
│   │   ├── cache/            # Caching
│   │   ├── config/           # Configuration
│   │   ├── error-handling/   # Error handling
│   │   ├── metrics/          # Monitoring
│   │   └── request-handling/ # Request processing
│   ├── types/                # Shared types
│   └── utils/                # Shared utilities
│
└── README.md                  # This documentation
```

## 🎯 Features

### 1. QuickWorkoutSetup Feature

Provides intelligent, context-aware quick workout generation:

```typescript
import { QuickWorkoutFeature } from '@/services/ai/external/features/quick-workout-setup';

const feature = new QuickWorkoutFeature({ openAIService });

const result = await feature.generateWorkout({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Quick Sweat',
  energyLevel: 7,
  sorenessAreas: ['legs'],
  equipment: ['Dumbbells']
}, userProfile);
```

**Capabilities:**
- ✅ Duration Intelligence (5-45 minutes)
- ✅ Smart Prompt Selection
- ✅ Response Normalization
- ✅ Comprehensive Validation
- ✅ Rich Metadata

### 2. DetailedWorkoutSetup Feature

Provides comprehensive workout planning with advanced customization:

```typescript
import { DetailedWorkoutFeature } from '@/services/ai/external/features/detailed-workout-setup';

const feature = new DetailedWorkoutFeature({ openAIService });

const result = await feature.generateWorkout({
  duration: 90,
  fitnessLevel: 'advanced',
  focus: 'strength',
  energyLevel: 8,
  sorenessAreas: [],
  equipment: ['Barbell', 'Dumbbells'],
  trainingGoals: ['muscle_building'],
  experienceLevel: 'advanced',
  intensityPreference: 'high',
  workoutStructure: 'traditional'
});
```

**Capabilities:**
- ✅ Extended Durations (20-150 minutes)
- ✅ Progressive Training Plans
- ✅ Advanced Exercise Selection
- ✅ Detailed Form Guidance
- ✅ Recovery Management

### 3. RecommendationSystem Feature

Provides AI-powered personalized recommendations:

```typescript
import { selectRecommendationPrompt } from '@/services/ai/external/features/recommendation-system';

// In OpenAIStrategy
const prompt = selectRecommendationPrompt(
  'enhanced',           // context
  userLevel,           // user fitness level  
  'detailed'           // complexity
);
```

**Capabilities:**
- ✅ Enhanced Recommendations
- ✅ Cross-Component Analysis
- ✅ Progressive Suggestions
- ✅ Personalized Insights

## 🔧 Integration

### OpenAIStrategy Integration

The strategy automatically selects the appropriate feature based on the request:

```typescript
const strategy = new OpenAIStrategy(openAIService);

// Automatically uses appropriate feature
const workout = await strategy.generateWorkout({
  preferences: {
    duration: 90,    // Will use DetailedWorkoutSetup
    focus: 'strength',
    intensity: 'high'
  },
  userProfile: {
    fitnessLevel: 'advanced',
    goals: ['muscle_building']
  }
});
```

### Feature Selection Logic

```typescript
// In OpenAIStrategy
private shouldUseDetailedWorkout(request: WorkoutGenerationRequest): boolean {
  const duration = request.preferences?.duration ?? 30;
  const hasComplexRequirements = request.preferences?.intensity === 'high';
  
  return duration > 45 || hasComplexRequirements;
}
```

## 🔍 Advanced Usage

### Custom Feature Integration

Create new features following the feature-first pattern:

```typescript
src/services/ai/external/features/your-feature/
├── YourFeature.ts           # Main orchestrator
├── workflow/                # Feature workflow
├── prompts/                # Feature-specific prompts
├── types/                  # Feature-specific types
├── constants/              # Feature-specific constants
└── helpers/               # Feature-specific utilities
```

### Feature Development Guidelines

1. **Atomic Components**: Keep features self-contained
2. **Shared Infrastructure**: Use shared components for common needs
3. **Clear Boundaries**: Define clear feature interfaces
4. **Documentation**: Maintain feature-level README.md
5. **Testing**: Include feature-specific tests

## 🚨 Error Handling

Each feature implements its own error handling with fallback to shared handlers:

```typescript
try {
  const result = await feature.generateWorkout(params);
} catch (error) {
  if (error instanceof FeatureSpecificError) {
    // Handle feature-specific error
  } else {
    // Use shared error handling
    this.errorHandler.handleError(error);
  }
}
```

## 📊 Monitoring

Each feature provides its own metrics that roll up to service-level monitoring:

```typescript
const metrics = {
  quickWorkout: quickWorkoutFeature.getMetrics(),
  detailedWorkout: detailedWorkoutFeature.getMetrics(),
  recommendations: recommendationSystem.getMetrics()
};
```

## 🧪 Testing

### Feature-Level Tests

```typescript
src/services/ai/external/features/feature-name/__tests__/
├── integration/            # Integration tests
├── unit/                  # Unit tests
└── workflow.test.ts       # Workflow tests
```

### Cross-Feature Tests

```typescript
src/services/ai/external/__tests__/
└── integration/
    └── workflow/          # Cross-feature workflows
```

## 📚 Migration Status

### ✅ Completed
1. **Feature-First Architecture**
   - QuickWorkoutSetup feature
   - DetailedWorkoutSetup feature
   - RecommendationSystem feature

2. **Legacy System Removal**
   - Removed workout-generation.prompts.ts
   - Removed templates.ts
   - Removed WorkoutPromptBuilder.ts
   - Removed OpenAIRecommendationEngine.ts

3. **Architecture Improvements**
   - Feature-based organization
   - Shared infrastructure
   - Clear feature boundaries

### 🔄 In Progress
1. **Documentation Updates**
   - Feature-specific documentation
   - Integration guides
   - Migration guides

2. **Testing Expansion**
   - Feature-level tests
   - Integration tests
   - Performance tests

3. **Performance Optimization**
   - Response caching
   - Request batching
   - Token optimization

## 📞 Support

For issues or questions:
1. Check feature-specific README.md
2. Review error logs
3. Test with feature flags disabled
4. Contact the AI team for assistance

---

**Note**: This integration requires an OpenAI API key and may incur costs based on usage. Monitor your usage and adjust rate limits accordingly. 