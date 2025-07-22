# QuickWorkoutSetup Feature

## 🎯 Overview

The QuickWorkoutSetup feature provides AI-powered quick workout generation with duration-specific optimization. This feature handles the complete workflow from user input to structured workout output.

## 🏗️ Architecture

### Feature Structure
```
quick-workout-setup/
├── QuickWorkoutFeature.ts     # Main orchestrator
├── workflow/                  # Workflow components
│   ├── DurationStrategy.ts    # Duration selection logic
│   ├── PromptSelector.ts      # Context-aware prompt selection
│   └── ResponseProcessor.ts   # AI response processing
├── prompts/                   # Feature-specific prompts
├── types/                     # Feature-specific types
├── helpers/                   # Feature-specific utilities
├── constants/                 # Feature constants
└── __tests__/                # Feature tests
```

### Workflow Process
1. **Duration Strategy** - Selects optimal configuration based on available time
2. **Prompt Selection** - Chooses duration-specific prompts with context
3. **AI Generation** - Generates workout via OpenAI service
4. **Response Processing** - Normalizes and validates the workout structure

## 🚀 Usage

```typescript
import { QuickWorkoutFeature } from './QuickWorkoutFeature';

const feature = new QuickWorkoutFeature(dependencies);

const workout = await feature.generateWorkout({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Quick Sweat',
  energyLevel: 7,
  equipment: ['Dumbbells'],
  sorenessAreas: []
});
```

## 🧪 Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: Feature workflow testing  
- **Workflow Tests**: End-to-end feature validation

## 📝 API Reference

### QuickWorkoutParams
- `duration`: Workout duration in minutes
- `fitnessLevel`: User's fitness experience level
- `focus`: Workout focus area
- `energyLevel`: Current energy level (1-10)
- `equipment`: Available equipment list
- `sorenessAreas`: Areas of muscle soreness

### QuickWorkoutResult
- `workout`: Generated workout structure
- `metadata`: Generation metadata
- `confidence`: AI confidence score

## 🔄 Workflow Details

### Duration Strategy
Supports optimized configurations for:
- 5min: Quick break sessions
- 10min: Mini sessions
- 15min: Express workouts
- 20min: Focused workouts
- 30min: Complete workouts
- 45min: Extended workouts

### Prompt Selection
- Duration-specific prompt templates
- Context-aware variable injection
- User profile integration
- Equipment and constraint handling

### Response Processing
- AI response parsing and validation
- Workout structure normalization
- Duration calculation (minutes to seconds)
- Exercise phase organization 