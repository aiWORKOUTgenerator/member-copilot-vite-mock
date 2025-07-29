# Domain Services API Reference

## 📋 **Complete API Documentation**

This document provides the complete API reference for all domain services in the internal AI system.

## 🎯 **Service Overview**

All domain services are accessed through the `AIService` class and provide rule-based intelligence for specific fitness domains.

```typescript
import { AIService } from '@/services/ai/internal/core/AIService';

const aiService = new AIService();
```

## 🔋 **EnergyAIService**

### **analyzeEnergyLevel(energyLevel, userProfile, context?)**

Analyzes energy level and provides contextual insights and recommendations.

**Parameters:**
- `energyLevel: number` - Energy level on 1-10 scale
- `userProfile: UserProfile` - Complete user profile data
- `context?: EnergyContext` - Optional context information

**Returns:** `Promise<EnergyAnalysis>`

**Example:**
```typescript
const analysis = await aiService.analyzeEnergyLevel(
  7,
  userProfile,
  { timeOfDay: 'morning', previousWorkout: 'yesterday' }
);
```

### **getEnergyRecommendations(energyLevel, userProfile, workoutType?)**

Gets energy-based workout recommendations.

**Parameters:**
- `energyLevel: number` - Energy level on 1-10 scale
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<EnergyRecommendation[]>`

## 🏃 **SorenessAIService**

### **analyzeSorenessAreas(sorenessAreas, userProfile, context?)**

Analyzes soreness areas and provides recovery insights.

**Parameters:**
- `sorenessAreas: string[]` - Array of sore body parts
- `userProfile: UserProfile` - Complete user profile data
- `context?: SorenessContext` - Optional context information

**Returns:** `Promise<SorenessAnalysis>`

### **getSorenessRecommendations(sorenessAreas, userProfile, workoutType?)**

Gets soreness-based workout modifications and recommendations.

**Parameters:**
- `sorenessAreas: string[]` - Array of sore body parts
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<SorenessRecommendation[]>`

## 🎯 **FocusAIService**

### **analyzeFocusAreas(focusAreas, userProfile, context?)**

Analyzes focus areas and provides exercise recommendations.

**Parameters:**
- `focusAreas: string[]` - Array of focus areas
- `userProfile: UserProfile` - Complete user profile data
- `context?: FocusContext` - Optional context information

**Returns:** `Promise<FocusAnalysis>`

### **getFocusRecommendations(focusAreas, userProfile, workoutType?)**

Gets focus-based exercise and workout recommendations.

**Parameters:**
- `focusAreas: string[]` - Array of focus areas
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<FocusRecommendation[]>`

## ⏱️ **DurationAIService**

### **analyzeDurationPreferences(duration, userProfile, context?)**

Analyzes duration preferences and provides optimization insights.

**Parameters:**
- `duration: number` - Duration in minutes
- `userProfile: UserProfile` - Complete user profile data
- `context?: DurationContext` - Optional context information

**Returns:** `Promise<DurationAnalysis>`

### **getDurationRecommendations(duration, userProfile, workoutType?)**

Gets duration-based workout structure recommendations.

**Parameters:**
- `duration: number` - Duration in minutes
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<DurationRecommendation[]>`

## 🏋️ **EquipmentAIService**

### **analyzeEquipmentPreferences(equipment, userProfile, context?)**

Analyzes equipment preferences and provides optimization insights.

**Parameters:**
- `equipment: string[]` - Array of available equipment
- `userProfile: UserProfile` - Complete user profile data
- `context?: EquipmentContext` - Optional context information

**Returns:** `Promise<EquipmentAnalysis>`

### **getEquipmentRecommendations(equipment, userProfile, workoutType?)**

Gets equipment-based exercise and workout recommendations.

**Parameters:**
- `equipment: string[]` - Array of available equipment
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<EquipmentRecommendation[]>`

## 🔗 **CrossComponentAIService**

### **analyzeCrossComponentRelationships(components, userProfile, context?)**

Analyzes relationships between different workout components.

**Parameters:**
- `components: ComponentData[]` - Array of component data
- `userProfile: UserProfile` - Complete user profile data
- `context?: CrossComponentContext` - Optional context information

**Returns:** `Promise<CrossComponentAnalysis>`

### **getCrossComponentRecommendations(components, userProfile, workoutType?)**

Gets cross-component optimization recommendations.

**Parameters:**
- `components: ComponentData[]` - Array of component data
- `userProfile: UserProfile` - Complete user profile data
- `workoutType?: string` - Optional workout type filter

**Returns:** `Promise<CrossComponentRecommendation[]>`

## 📊 **Type Definitions**

### **UserProfile**
```typescript
interface UserProfile {
  fitnessLevel: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive';
  experienceLevel: 'New to Exercise' | 'Some Experience' | 'Advanced Athlete';
  primaryGoal: string;
  energyLevel: number;
  focus: string;
  equipment: string[];
  sorenessAreas: string[];
  duration: number;
  // ... additional profile fields
}
```

### **Analysis Results**
```typescript
interface EnergyAnalysis {
  insights: string[];
  recommendations: EnergyRecommendation[];
  confidence: number;
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

### **Context Types**
```typescript
interface EnergyContext {
  timeOfDay?: string;
  previousWorkout?: string;
  sleepQuality?: number;
  stressLevel?: number;
}

interface SorenessContext {
  sorenessDuration?: string;
  workoutHistory?: string[];
  recoveryMethods?: string[];
}

interface FocusContext {
  previousFocusAreas?: string[];
  goalAlignment?: number;
  varietyPreference?: string;
}

interface DurationContext {
  availableTime?: number;
  intensityPreference?: string;
  scheduleConstraints?: string[];
}

interface EquipmentContext {
  equipmentProficiency?: Record<string, number>;
  spaceConstraints?: string[];
  budgetConsiderations?: string[];
}

interface CrossComponentContext {
  componentInteractions?: string[];
  optimizationGoals?: string[];
  balancePreferences?: string[];
}
```

## 🔧 **Error Handling**

All methods return promises that may reject with specific error types:

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

## 📈 **Performance Characteristics**

- **Response Time**: <100ms for most operations
- **Memory Usage**: Minimal, rule-based processing
- **Scalability**: Linear with request volume
- **Reliability**: 99.9% uptime

## 🎯 **Best Practices**

1. **Always provide complete user profiles** for accurate analysis
2. **Use appropriate context** when available for better insights
3. **Handle errors gracefully** with proper fallback mechanisms
4. **Cache results** when appropriate to improve performance
5. **Validate inputs** before calling service methods

---

**For implementation examples, see**: [AI Integration Examples](../examples/ai-integration-examples.md)