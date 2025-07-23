# AI Recommendation System

## 🎯 Overview

The AI Recommendation System provides personalized fitness recommendations using OpenAI integration. It's currently implemented through `OpenAIStrategy.generateRecommendations()`.

## 🏗️ Architecture

### Current Integration
- **Primary Integration**: `OpenAIStrategy.generateRecommendations()`
- **Prompt Selection**: `selectRecommendationPrompt(context, userLevel, complexity)`
- **4 Prompt Types**: Enhanced, Quick, Cross-Component, Progressive

### Workflow
```
OpenAIStrategy.generateRecommendations()
    ↓
selectRecommendationPrompt() // Smart prompt selection
    ↓
OpenAIService.generateFromTemplate() // AI generation
    ↓
Enhanced recommendations with personalization
```

## 📝 Available Prompts

1. **Enhanced Recommendations** (`enhanced_recommendations_v1`)
   - Comprehensive analysis with user profile integration
   - Detects issues and optimization opportunities
   - Rich variable system for personalization

2. **Quick Recommendations** (`quick_recommendations_v1`) 
   - Fast suggestions for time-sensitive contexts
   - Simplified variable set for rapid generation

3. **Cross-Component Recommendations** (`cross_component_v1`)
   - Analyzes interactions between workout components
   - Identifies conflicts and synergies

4. **Progressive Recommendations** (`progressive_v1`)
   - Advancement and skill development focus
   - Long-term progression planning

## 🔧 Usage

```typescript
import { selectRecommendationPrompt } from './features/recommendation-system';

// In OpenAIStrategy.generateRecommendations()
const prompt = selectRecommendationPrompt(
  'enhanced',           // context
  userLevel,           // user fitness level  
  'detailed'           // complexity
);
```

## ✅ Status

- **Active**: Currently working through OpenAIStrategy
- **Tested**: Integrated with main workout generation workflow
- **Maintained**: Part of core AI feature set 