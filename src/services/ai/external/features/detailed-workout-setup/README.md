# Detailed Workout Setup Feature

## Overview
The Detailed Workout Setup feature provides a comprehensive, AI-powered interface for creating customized workout plans. It integrates with the AI service architecture to provide real-time recommendations and validations.

## Directory Structure
```
detailed-workout-setup/
├── components/                    # UI Components
│   ├── containers/               # Container components
│   │   └── DetailedWorkoutContainer.tsx
│   ├── forms/                    # Form components
│   │   ├── DurationForm.tsx
│   │   └── FocusForm.tsx
│   ├── steps/                    # Multi-step wizard components
│   └── shared/                   # Shared UI components
│       └── AIRecommendationPanel.tsx
├── DetailedWorkoutFeature.ts     # Main feature class
├── workflow/                     # Workflow management
├── prompts/                      # AI prompt templates
├── types/                        # Feature-specific types
├── constants/                    # Feature constants
└── helpers/                      # Utility functions
```

## Key Components

### DetailedWorkoutContainer
The main container component that orchestrates the detailed workout setup process. It integrates with the DetailedWorkoutFeature class to provide:
- Multi-step workout configuration
- AI-powered recommendations
- Real-time validation
- Progressive enhancement

### Form Components
- **DurationForm**: Handles workout duration selection with smart defaults
- **FocusForm**: Manages workout focus/type selection with AI recommendations

### Shared Components
- **AIRecommendationPanel**: Displays AI-generated recommendations with priority levels

## Integration

### Using the Container
```tsx
import { DetailedWorkoutContainer } from './features/detailed-workout-setup';

function App() {
  return (
    <DetailedWorkoutContainer
      options={workoutOptions}
      onChange={handleChange}
      userProfile={userProfile}
      aiContext={aiContext}
    />
  );
}
```

### Using Individual Forms
```tsx
import { DurationForm, FocusForm } from './features/detailed-workout-setup';

function WorkoutForm() {
  return (
    <div>
      <DurationForm
        value={duration}
        onChange={handleDurationChange}
        onValidation={handleValidation}
      />
      <FocusForm
        value={focus}
        onChange={handleFocusChange}
        onValidation={handleValidation}
      />
    </div>
  );
}
```

## AI Integration

The feature integrates with the AI service through the DetailedWorkoutFeature class:

```tsx
const workoutFeature = new DetailedWorkoutFeature({
  openAIService,
  logger
});

// Generate workout
const result = await workoutFeature.generateWorkout(params);
```

## Type System

The feature uses a comprehensive type system to ensure type safety:

```tsx
interface DetailedWorkoutParams {
  duration: number;
  focus: string;
  equipment: string[];
  // ... other parameters
}

interface DetailedWorkoutResult {
  workout: GeneratedWorkout;
  metadata: DetailedWorkoutMetadata;
  recommendations: EnhancedRecommendation[];
}
```

## Best Practices

1. **State Management**
   - Use the container component for complex state management
   - Individual forms should be stateless when possible

2. **AI Integration**
   - Always handle AI service errors gracefully
   - Provide fallback UI when AI services are unavailable

3. **Performance**
   - Use memo and callbacks for expensive computations
   - Lazy load components when appropriate

4. **Accessibility**
   - All components follow WCAG guidelines
   - Proper ARIA labels and roles are implemented

## Contributing

When adding new components or modifying existing ones:

1. Follow the established component structure
2. Add proper TypeScript types
3. Update this documentation
4. Add unit tests for new functionality

## Testing

Run tests using:
```bash
npm test src/services/ai/external/features/detailed-workout-setup
``` 