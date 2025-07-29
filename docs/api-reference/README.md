# API Reference Overview

## 📋 **Complete API Documentation**

This section provides comprehensive API documentation for all services, components, and types in the fitness AI application.

## 📋 **API Reference Sections**

### **AI Services**
- **[Domain Services API](./ai-services/domain-services-api.md)** - Domain service methods (CRITICAL)
- **[Core AI Service API](./ai-services/core-ai-service-api.md)** - AIService class methods
- **[External AI API](./ai-services/external-ai-api.md)** - External AI service methods
- **[Hook APIs](./ai-services/hook-apis.md)** - useWorkoutGeneration, etc.

### **Components**
- **[Component Props](./components/component-props.md)** - Component prop interfaces
- **[Hook Interfaces](./components/hook-interfaces.md)** - React hook interfaces
- **[Event Handlers](./components/event-handlers.md)** - Event handler patterns

### **Types**
- **[AI Types](./types/ai-types.md)** - AI-related TypeScript types
- **[Workout Types](./types/workout-types.md)** - Workout data types
- **[User Types](./types/user-types.md)** - User profile types
- **[Component Types](./types/component-types.md)** - Component-related types

### **Examples**
- **[Common Integration Examples](./examples/common-integration-examples.md)** - Frequent code patterns
- **[AI Integration Examples](./examples/ai-integration-examples.md)** - AI service usage examples
- **[Component Usage Examples](./examples/component-usage-examples.md)** - Component implementation examples
- **[Testing Examples](./examples/testing-examples.md)** - Testing pattern examples

## 🎯 **Critical API Information**

### **Domain Services (CRITICAL)**
The domain services are the most commonly used APIs. Always refer to these for correct method usage:

- **[Method Signatures](../ai-systems/internal/domain-services/method-signatures.md)** - Exact method names and parameters
- **[Common Integration Errors](../ai-systems/internal/domain-services/common-integration-errors.md)** - Avoid common mistakes
- **[Integration Examples](./examples/ai-integration-examples.md)** - Copy-paste patterns

### **Core Service Methods**
```typescript
// Energy Analysis
await aiService.analyzeEnergyLevel(energyLevel, userProfile, context?)
await aiService.getEnergyRecommendations(energyLevel, userProfile, workoutType?)

// Soreness Analysis
await aiService.analyzeSorenessAreas(sorenessAreas, userProfile, context?)
await aiService.getSorenessRecommendations(sorenessAreas, userProfile, workoutType?)

// Focus Analysis
await aiService.analyzeFocusAreas(focusAreas, userProfile, context?)
await aiService.getFocusRecommendations(focusAreas, userProfile, workoutType?)

// Duration Analysis
await aiService.analyzeDurationPreferences(duration, userProfile, context?)
await aiService.getDurationRecommendations(duration, userProfile, workoutType?)

// Equipment Analysis
await aiService.analyzeEquipmentPreferences(equipment, userProfile, context?)
await aiService.getEquipmentRecommendations(equipment, userProfile, workoutType?)

// Cross-Component Analysis
await aiService.analyzeCrossComponentRelationships(components, userProfile, context?)
await aiService.getCrossComponentRecommendations(components, userProfile, workoutType?)
```

## 🔧 **Type Definitions**

### **UserProfile Interface**
```typescript
interface UserProfile {
  fitnessLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';
  experienceLevel: 'New to Exercise' | 'Some Experience' | 'Advanced Athlete';
  primaryGoal: string;
  energyLevel: number; // 1-10
  focus: string;
  equipment: string[];
  sorenessAreas: string[];
  duration: number; // minutes
  // ... additional fields
}
```

### **Analysis Result Interface**
```typescript
interface EnergyAnalysis {
  insights: string[];
  recommendations: EnergyRecommendation[];
  confidence: number; // 0-1
  metadata: {
    analysisType: 'energy';
    timestamp: Date;
    processingTime: number;
  };
}

interface EnergyRecommendation {
  suggestion: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  applicableWorkoutTypes: string[];
}
```

## 🎯 **Integration Patterns**

### **Standard AI Integration**
```typescript
import { useGlobalAIContext } from '@/contexts/AIContext';

const AIComponent = () => {
  const { aiService } = useGlobalAIContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async (params) => {
    setLoading(true);
    try {
      const analysis = await aiService.analyzeEnergyLevel(
        params.energyLevel,
        params.userProfile,
        params.context
      );
      setResult(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      {result && <ResultDisplay result={result} />}
    </div>
  );
};
```

### **Error Handling Pattern**
```typescript
try {
  const analysis = await aiService.analyzeEnergyLevel(energyLevel, userProfile);
  // Handle success
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof ServiceError) {
    // Handle service errors
  } else {
    // Handle unexpected errors
  }
}
```

## 📊 **Performance Characteristics**

### **Response Times**
- **Internal AI**: <100ms for most operations
- **External AI**: 1-5 seconds for complex operations
- **Validation**: Sub-10ms validation times
- **Data Transformation**: Efficient transformation

### **Reliability**
- **Internal AI**: 99.9% uptime
- **External AI**: 99.5% uptime with fallbacks
- **Error Recovery**: Automatic fallback mechanisms
- **Data Persistence**: Reliable localStorage usage

## 🔍 **API Best Practices**

### **Method Usage**
1. **Always use correct method names** from method signatures
2. **Provide complete user profiles** for accurate analysis
3. **Use appropriate context** when available
4. **Handle errors gracefully** with proper fallback mechanisms

### **Performance Optimization**
1. **Cache results** when appropriate to improve performance
2. **Use loading states** to provide user feedback
3. **Validate inputs** before calling AI services
4. **Optimize state updates** to minimize re-renders

### **Type Safety**
1. **Use TypeScript interfaces** for type safety
2. **Validate data structures** before API calls
3. **Handle optional parameters** appropriately
4. **Use proper error types** for error handling

## 📞 **API Support**

### **Documentation Support**
- API reference documentation
- Integration pattern documentation
- Performance optimization documentation
- Error handling documentation

### **Development Support**
- API usage reviews
- Performance optimization reviews
- Error handling strategy reviews
- Type safety reviews

---

**For detailed API information, see the specific sections above.**