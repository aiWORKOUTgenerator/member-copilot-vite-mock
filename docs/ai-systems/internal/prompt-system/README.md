# Internal AI Prompt System

## Overview

The Internal AI Prompt System is a comprehensive framework that provides intelligent workout generation capabilities using internal AI services without requiring external API calls. It leverages domain-specific AI services to generate personalized recommendations and workout templates.

## Architecture

The system is built around several key components:

### Core Components

- **InternalPromptEngine**: Main orchestrator for the internal prompt system
- **ProfilePromptBuilder**: Transforms profile data into internal prompt context
- **WorkoutPromptBuilder**: Transforms workout focus data into internal prompt context
- **DomainPromptGenerator**: Generates personalized prompts using domain services
- **PromptSelector**: Selects appropriate prompt templates based on context
- **InternalRecommendationStrategy**: Generates recommendations using domain services
- **InternalFallbackGenerator**: Provides pure internal workout generation

### Domain Services Integration

The system integrates with existing domain services:
- EnergyAIService
- SorenessAIService
- FocusAIService
- DurationAIService
- EquipmentAIService
- CrossComponentAIService

## Key Features

- **Profile Data Integration**: Seamlessly integrates user profile data into prompt generation
- **Workout Customization**: Supports comprehensive workout customization options
- **Domain-Specific Analysis**: Uses specialized AI services for different workout aspects
- **Fallback Generation**: Provides internal workout generation when external AI is unavailable
- **Validation System**: Comprehensive validation of context and recommendations
- **Progress Tracking**: Realistic progress simulation during workout generation

## Quick Start

```typescript
import { RecommendationEngine } from '../services/ai/internal/RecommendationEngine';
import { transformToInternalContext } from '../utils/contextTransformers';

// Transform request to internal context
const internalContext = transformToInternalContext(request);

// Generate workout with internal AI
const result = await recommendationEngine.generateWorkout(internalContext, {
  useExternalAI: false,
  fallbackToInternal: true,
  confidenceThreshold: 0.7,
  maxRecommendations: 10
});
```

## Documentation Structure

- [Architecture](./architecture.md) - Detailed system architecture
- [Components](./components/) - Individual component documentation
- [Integration](./integration.md) - Integration patterns and workflows
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [API Reference](./api-reference.md) - Complete API documentation

## Related Documentation

- [Domain Services](../domain-services/) - Domain-specific AI services
- [Core Services](../core-services/) - Core AI service components
- [Recommendation Engine](../recommendation-engine/) - Recommendation system