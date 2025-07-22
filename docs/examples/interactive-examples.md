# Interactive Examples

## 🎯 **Overview**

These interactive examples demonstrate the AI Service Feature-First Architecture capabilities. Each example is complete, runnable code that showcases different aspects of the system.

## 🚀 **Basic Examples**

### **Example 1: Simple Workout Generation**

```typescript
import { 
  OpenAIService, 
  QuickWorkoutFeature 
} from '@/services/ai/external';

async function basicWorkoutExample() {
  console.log('🏃‍♂️ Example 1: Basic Workout Generation');
  
  // Initialize services
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  
  try {
    // Generate a simple workout
    const result = await quickWorkout.generateWorkout({
      duration: 30,
      fitnessLevel: 'some experience',
      focus: 'Strength Building',
      energyLevel: 7
    });
    
    console.log('✅ Workout generated successfully!');
    console.log(`📝 Name: ${result.workout.name}`);
    console.log(`⏱️  Duration: ${result.workout.totalDuration}s`);
    console.log(`📊 Quality Score: ${result.qualityScore}/100`);
    console.log(`⚡ Response Time: ${result.processingTime}ms`);
    console.log(`💾 Cache Hit: ${result.cacheHit ? 'Yes' : 'No'}`);
    
    // Show workout structure
    result.workout.phases.forEach((phase, index) => {
      console.log(`\n🔥 Phase ${index + 1}: ${phase.name}`);
      console.log(`   Duration: ${phase.duration}s`);
      phase.exercises.forEach(exercise => {
        console.log(`   • ${exercise.name}: ${exercise.sets || 1}x${exercise.reps || exercise.duration}`);
      });
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error generating workout:', error.message);
    throw error;
  }
}

// Run the example
basicWorkoutExample()
  .then(result => console.log('🎉 Example completed successfully'))
  .catch(error => console.error('💥 Example failed:', error));
```

**Expected Output:**
```
🏃‍♂️ Example 1: Basic Workout Generation
✅ Workout generated successfully!
📝 Name: 30-Minute Strength Builder
⏱️  Duration: 1800s
📊 Quality Score: 87/100
⚡ Response Time: 2341ms
💾 Cache Hit: No

🔥 Phase 1: Dynamic Warm-Up
   Duration: 300s
   • Arm Circles: 1x30s
   • Leg Swings: 1x20
   • Bodyweight Squats: 1x15

🔥 Phase 2: Strength Training
   Duration: 1200s
   • Push-ups: 3x12
   • Squats: 3x15
   • Lunges: 3x10
   • Plank: 3x30s

🔥 Phase 3: Cool Down
   Duration: 300s
   • Static Stretching: 1x300s

🎉 Example completed successfully
```

### **Example 2: Equipment-Aware Workout**

```typescript
async function equipmentAwareExample() {
  console.log('🏋️‍♀️ Example 2: Equipment-Aware Workout Generation');
  
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  
  const params = {
    duration: 45,
    fitnessLevel: 'advanced athlete',
    focus: 'Full Body HIIT',
    energyLevel: 9,
    equipment: ['dumbbells', 'resistance-bands', 'yoga-mat'],
    sorenessAreas: ['lower-back'],
    timeOfDay: 'morning',
    workoutLocation: 'home',
    intensityPreference: 'high'
  };
  
  console.log('🔧 Equipment available:', params.equipment.join(', '));
  console.log('⚠️  Avoiding areas:', params.sorenessAreas.join(', '));
  
  const result = await quickWorkout.generateWorkout(params);
  
  console.log('\n✅ Advanced workout generated!');
  console.log(`📝 Name: ${result.workout.name}`);
  console.log(`🎯 Equipment used: ${result.workout.equipment.join(', ')}`);
  console.log(`⚡ Difficulty: ${result.workout.difficulty}`);
  console.log(`🔥 Estimated calories: ${result.workout.calories}`);
  
  // Show adaptations made
  if (result.metadata.adaptations) {
    console.log('\n🎯 Adaptations made:');
    result.metadata.adaptations.forEach(adaptation => {
      console.log(`   • ${adaptation.reason}: ${adaptation.change}`);
    });
  }
  
  return result;
}

equipmentAwareExample().catch(console.error);
```

### **Example 3: Duration Optimization**

```typescript
async function durationOptimizationExample() {
  console.log('⏱️  Example 3: Duration Optimization');
  
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  
  // Scenario: User wants 45min workout but has low energy and soreness
  const baseParams = {
    duration: 45,
    fitnessLevel: 'some experience',
    focus: 'Strength Building',
    energyLevel: 3,  // Very low energy
    sorenessAreas: ['legs', 'shoulders', 'core']
  };
  
  console.log('📊 Original request:');
  console.log(`   Duration: ${baseParams.duration} minutes`);
  console.log(`   Energy Level: ${baseParams.energyLevel}/10`);
  console.log(`   Sore Areas: ${baseParams.sorenessAreas.join(', ')}`);
  
  // Get duration optimization
  const optimization = await quickWorkout.optimizeDuration(baseParams);
  
  console.log('\n🧠 AI Optimization Analysis:');
  console.log(`   Original: ${optimization.originalDuration} minutes`);
  console.log(`   Optimized: ${optimization.optimizedDuration} minutes`);
  console.log(`   Change: ${optimization.optimizedDuration - optimization.originalDuration} minutes`);
  console.log(`   Efficiency Score: ${optimization.efficiencyScore}/100`);
  console.log(`   Confidence: ${Math.round(optimization.confidence * 100)}%`);
  console.log(`   Reasoning: ${optimization.reasoning}`);
  
  // Generate workout with optimized duration
  const optimizedParams = { ...baseParams, duration: optimization.optimizedDuration };
  const result = await quickWorkout.generateWorkout(optimizedParams);
  
  console.log('\n✅ Optimized workout generated!');
  console.log(`📝 Name: ${result.workout.name}`);
  console.log(`⏱️  Actual Duration: ${result.workout.totalDuration / 60} minutes`);
  
  return { optimization, workout: result };
}

durationOptimizationExample().catch(console.error);
```

## 🔄 **Workflow Orchestration Examples**

### **Example 4: Basic Workflow**

```typescript
import { WorkflowOrchestrator } from '@/services/ai/external/shared/core/orchestration';

async function basicWorkflowExample() {
  console.log('🔄 Example 4: Basic Workflow Orchestration');
  
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  const orchestrator = new WorkflowOrchestrator();
  
  // Register features
  orchestrator.registerFeature('quick-workout-setup', quickWorkout);
  
  // Define workflow
  const workflowConfig = {
    id: 'personalized-morning-workout',
    name: 'Personalized Morning Workout',
    steps: [
      {
        id: 'generate-workout',
        name: 'Generate Morning Workout',
        type: 'feature',
        feature: 'quick-workout-setup',
        operation: 'generateWorkout',
        params: {
          duration: 25,
          fitnessLevel: 'some experience',
          focus: 'Morning Energy Boost',
          energyLevel: 6,
          timeOfDay: 'morning',
          equipment: ['yoga-mat']
        }
      }
    ],
    timeout: 30000
  };
  
  console.log('🚀 Executing workflow:', workflowConfig.name);
  
  // Execute workflow
  const result = await orchestrator.executeWorkflow(workflowConfig);
  
  console.log('✅ Workflow completed successfully!');
  console.log(`📊 Steps executed: ${result.steps.length}`);
  console.log(`⏱️  Total duration: ${result.duration}ms`);
  console.log(`✨ Success: ${result.success}`);
  
  // Access the generated workout
  const workout = result.steps[0].result.workout;
  console.log(`💪 Generated: ${workout.name}`);
  console.log(`🕐 Workout length: ${workout.totalDuration}s`);
  
  return result;
}

basicWorkflowExample().catch(console.error);
```

### **Example 5: Advanced Multi-Step Workflow**

```typescript
async function advancedWorkflowExample() {
  console.log('🎯 Example 5: Advanced Multi-Step Workflow');
  
  const orchestrator = new WorkflowOrchestrator();
  
  // Complex workflow with dependencies
  const comprehensiveWorkflow = {
    id: 'comprehensive-fitness-session',
    name: 'Comprehensive Fitness Session',
    steps: [
      // Step 1: Quick assessment
      {
        id: 'quick-assessment',
        name: 'Quick Fitness Assessment',
        type: 'feature',
        feature: 'fitness-assessor',
        operation: 'quickAssess',
        params: {
          userId: '{{userId}}',
          selfReportedLevel: '{{fitnessLevel}}'
        },
        timeout: 10000
      },
      
      // Step 2: Generate base workout (depends on assessment)
      {
        id: 'generate-base-workout',
        name: 'Generate Base Workout',
        type: 'feature',
        feature: 'quick-workout-setup',
        operation: 'generateWorkout',
        dependencies: ['quick-assessment'],
        params: {
          duration: '{{duration}}',
          fitnessLevel: '{{quick-assessment.result.adjustedLevel}}',
          focus: '{{focus}}',
          energyLevel: '{{energyLevel}}',
          equipment: '{{equipment}}'
        },
        timeout: 30000
      },
      
      // Step 3: Safety validation (parallel with recommendations)
      {
        id: 'parallel-analysis',
        name: 'Parallel Safety and Recommendations',
        type: 'parallel',
        dependencies: ['generate-base-workout'],
        parallel: [
          {
            id: 'safety-check',
            name: 'Safety Validation',
            type: 'feature',
            feature: 'safety-validator',
            operation: 'validateWorkout',
            params: {
              workout: '{{generate-base-workout.result.workout}}',
              userProfile: '{{quick-assessment.result}}'
            }
          },
          {
            id: 'get-recommendations',
            name: 'Generate Recommendations',
            type: 'feature',
            feature: 'recommendation-engine',
            operation: 'generateRecommendations',
            params: {
              workout: '{{generate-base-workout.result.workout}}',
              userContext: '{{quick-assessment.result}}'
            }
          }
        ]
      }
    ],
    timeout: 90000
  };
  
  console.log('🚀 Executing comprehensive workflow...');
  console.log(`📋 Steps: ${comprehensiveWorkflow.steps.length} main steps`);
  
  const startTime = Date.now();
  
  try {
    const result = await orchestrator.executeWorkflow(comprehensiveWorkflow, {
      userId: 'user-demo-123',
      duration: 35,
      fitnessLevel: 'some experience',
      focus: 'Full Body Strength',
      energyLevel: 7,
      equipment: ['dumbbells', 'resistance-bands']
    });
    
    const endTime = Date.now();
    
    console.log('\n✅ Comprehensive workflow completed!');
    console.log(`⏱️  Execution time: ${endTime - startTime}ms`);
    console.log(`📊 Success rate: ${result.success ? '100%' : '0%'}`);
    console.log(`🔄 Steps completed: ${result.steps.length}`);
    
    // Show step results
    result.steps.forEach((step, index) => {
      console.log(`\n📋 Step ${index + 1}: ${step.name}`);
      console.log(`   Status: ${step.status}`);
      console.log(`   Duration: ${step.duration}ms`);
      if (step.result && step.result.workout) {
        console.log(`   Generated: ${step.result.workout.name}`);
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
    throw error;
  }
}

advancedWorkflowExample().catch(console.error);
```

## 🔄 **Feature Communication Examples**

### **Example 6: FeatureBus Communication**

```typescript
import { FeatureBus } from '@/services/ai/external/shared/core/orchestration';

async function featureBusExample() {
  console.log('📡 Example 6: Feature-to-Feature Communication');
  
  const featureBus = new FeatureBus();
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  
  // Register request handlers
  featureBus.registerRequestHandler(
    'quick-workout-setup',
    'generateWorkout',
    async (params) => {
      console.log('📥 Received workout generation request:', params.focus);
      const result = await quickWorkout.generateWorkout(params);
      console.log('📤 Sending workout response');
      return result;
    }
  );
  
  // Set up event subscriptions
  featureBus.subscribe('workout-generated', (workout, metadata) => {
    console.log(`🎉 Event: Workout "${workout.name}" generated by ${metadata.source}`);
    console.log(`   Duration: ${workout.totalDuration}s`);
    console.log(`   Quality: ${workout.qualityScore || 'N/A'}/100`);
  });
  
  featureBus.subscribe('feature-error', (error) => {
    console.error(`⚠️  Feature error in ${error.feature}: ${error.message}`);
  });
  
  console.log('\n🚀 Testing direct feature communication...');
  
  // Request workout via feature bus
  const workoutResult = await featureBus.request(
    'quick-workout-setup',
    'generateWorkout',
    {
      duration: 20,
      fitnessLevel: 'new to exercise',
      focus: 'Beginner Cardio',
      energyLevel: 6
    }
  );
  
  console.log('✅ Direct request successful');
  
  // Publish workout generated event
  await featureBus.publish('workout-generated', {
    name: workoutResult.workout.name,
    totalDuration: workoutResult.workout.totalDuration,
    qualityScore: workoutResult.qualityScore
  }, {
    source: 'interactive-example'
  });
  
  console.log('📊 FeatureBus metrics:');
  const metrics = featureBus.getEventMetrics();
  console.log(`   Total events: ${metrics.totalPublished}`);
  console.log(`   Active subscriptions: ${metrics.activeSubscriptions}`);
  
  return workoutResult;
}

featureBusExample().catch(console.error);
```

## 📊 **Performance & Monitoring Examples**

### **Example 7: Performance Monitoring**

```typescript
async function performanceMonitoringExample() {
  console.log('📊 Example 7: Performance Monitoring');
  
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  const orchestrator = new WorkflowOrchestrator();
  
  // Set up event monitoring
  orchestrator.on('workflow-started', (event) => {
    console.log(`🚀 Workflow started: ${event.workflowId}`);
  });
  
  orchestrator.on('step-completed', (event) => {
    console.log(`✅ Step completed: ${event.stepId} (${event.duration}ms)`);
  });
  
  orchestrator.on('workflow-completed', (event) => {
    console.log(`🎉 Workflow completed: ${event.workflowId}`);
    console.log('📈 Performance metrics:', {
      totalDuration: `${event.metrics.totalDuration}ms`,
      stepCount: event.metrics.stepCount,
      successRate: `${event.metrics.successRate}%`,
      parallelEfficiency: `${event.metrics.parallelEfficiency || 'N/A'}%`
    });
  });
  
  // Generate multiple workouts to show performance
  console.log('🔄 Generating 3 workouts for performance analysis...');
  
  const workouts = [
    { duration: 15, focus: 'Quick Cardio', energyLevel: 8 },
    { duration: 30, focus: 'Strength Building', energyLevel: 7 },
    { duration: 45, focus: 'Full Body HIIT', energyLevel: 6 }
  ];
  
  const startTime = Date.now();
  const results = [];
  
  for (const workout of workouts) {
    const workflowConfig = {
      id: `perf-test-${workout.duration}min`,
      name: `Performance Test ${workout.duration}min`,
      steps: [{
        id: 'generate',
        type: 'feature',
        feature: 'quick-workout-setup',
        operation: 'generateWorkout',
        params: {
          ...workout,
          fitnessLevel: 'some experience'
        }
      }]
    };
    
    orchestrator.registerFeature('quick-workout-setup', quickWorkout);
    const result = await orchestrator.executeWorkflow(workflowConfig);
    results.push(result);
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n📊 Performance Summary:');
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`📈 Average per workout: ${Math.round(totalTime / workouts.length)}ms`);
  
  // Feature-level metrics
  const featureMetrics = quickWorkout.getMetrics();
  console.log('\n🎯 Feature Metrics:');
  console.log(`   Success rate: ${featureMetrics.successRate}%`);
  console.log(`   Average response: ${featureMetrics.averageResponseTime}ms`);
  console.log(`   Cache hit rate: ${featureMetrics.cacheHitRate}%`);
  console.log(`   Total requests: ${featureMetrics.totalRequests}`);
  
  return { results, metrics: featureMetrics, totalTime };
}

performanceMonitoringExample().catch(console.error);
```

### **Example 8: Error Handling & Resilience**

```typescript
async function errorHandlingExample() {
  console.log('🛡️  Example 8: Error Handling & Resilience');
  
  const openAIService = new OpenAIService();
  const quickWorkout = new QuickWorkoutFeature({ openAIService });
  const orchestrator = new WorkflowOrchestrator();
  
  orchestrator.registerFeature('quick-workout-setup', quickWorkout);
  
  // Workflow with fallback mechanisms
  const resilientWorkflow = {
    id: 'resilient-workout-generation',
    name: 'Resilient Workout Generation',
    steps: [
      {
        id: 'primary-generation',
        name: 'Primary AI Generation',
        type: 'feature',
        feature: 'quick-workout-setup',
        operation: 'generateWorkout',
        params: {
          duration: 30,
          fitnessLevel: 'some experience',
          focus: 'Strength Building',
          energyLevel: 7
        },
        timeout: 15000,
        retries: 2,
        fallback: {
          id: 'fallback-generation',
          name: 'Template-Based Fallback',
          type: 'feature',
          feature: 'template-generator',
          operation: 'generateFromTemplate',
          params: {
            template: 'strength-30min-basic'
          }
        }
      }
    ]
  };
  
  // Set up error event monitoring
  orchestrator.on('step-failed', (event) => {
    console.log(`❌ Step failed: ${event.stepId} - ${event.error.message}`);
    console.log(`🔄 Attempting fallback...`);
  });
  
  orchestrator.on('step-recovered', (event) => {
    console.log(`✅ Step recovered: ${event.stepId} using fallback`);
  });
  
  try {
    console.log('🚀 Testing resilient workflow...');
    const result = await orchestrator.executeWorkflow(resilientWorkflow);
    
    console.log('✅ Workflow completed with resilience patterns');
    console.log(`📊 Success: ${result.success}`);
    
    // Check if fallback was used
    const step = result.steps[0];
    if (step.fallbackUsed) {
      console.log('🔄 Fallback mechanism was activated');
      console.log(`   Fallback reason: ${step.fallbackReason}`);
    } else {
      console.log('✨ Primary generation successful');
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 All resilience mechanisms failed:', error.message);
    
    // Demonstrate graceful degradation
    console.log('🆘 Activating emergency fallback...');
    
    const emergencyWorkout = {
      name: 'Emergency Bodyweight Workout',
      phases: [
        {
          name: 'Warm-up',
          exercises: [
            { name: 'Jumping Jacks', duration: '30s' },
            { name: 'Arm Circles', duration: '30s' }
          ]
        },
        {
          name: 'Main Workout',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 10 },
            { name: 'Squats', sets: 3, reps: 15 },
            { name: 'Plank', sets: 3, duration: '30s' }
          ]
        }
      ]
    };
    
    console.log('✅ Emergency workout provided');
    return { emergencyWorkout, fallbackActivated: true };
  }
}

errorHandlingExample().catch(console.error);
```

## 🎯 **Running All Examples**

### **Complete Example Runner**

```typescript
async function runAllExamples() {
  console.log('🚀 Running All Interactive Examples');
  console.log('=' .repeat(50));
  
  const examples = [
    { name: 'Basic Workout Generation', fn: basicWorkoutExample },
    { name: 'Equipment-Aware Workout', fn: equipmentAwareExample },
    { name: 'Duration Optimization', fn: durationOptimizationExample },
    { name: 'Basic Workflow', fn: basicWorkflowExample },
    { name: 'Advanced Multi-Step Workflow', fn: advancedWorkflowExample },
    { name: 'FeatureBus Communication', fn: featureBusExample },
    { name: 'Performance Monitoring', fn: performanceMonitoringExample },
    { name: 'Error Handling & Resilience', fn: errorHandlingExample }
  ];
  
  const results = [];
  let successCount = 0;
  
  for (const example of examples) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Running: ${example.name}`);
      console.log(`${'='.repeat(50)}`);
      
      const startTime = Date.now();
      const result = await example.fn();
      const endTime = Date.now();
      
      console.log(`✅ ${example.name} completed in ${endTime - startTime}ms`);
      results.push({ name: example.name, success: true, duration: endTime - startTime, result });
      successCount++;
      
    } catch (error) {
      console.error(`❌ ${example.name} failed:`, error.message);
      results.push({ name: example.name, success: false, error: error.message });
    }
    
    // Brief pause between examples
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 FINAL RESULTS');
  console.log(`${'='.repeat(50)}`);
  
  console.log(`✅ Successful: ${successCount}/${examples.length}`);
  console.log(`📊 Success Rate: ${Math.round(successCount / examples.length * 100)}%`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${status} ${result.name}${duration}`);
  });
  
  console.log('\n🎉 All examples completed!');
  return results;
}

// Export for easy running
export {
  basicWorkoutExample,
  equipmentAwareExample,
  durationOptimizationExample,
  basicWorkflowExample,
  advancedWorkflowExample,
  featureBusExample,
  performanceMonitoringExample,
  errorHandlingExample,
  runAllExamples
};

// Auto-run if executed directly
if (import.meta.main) {
  runAllExamples().catch(console.error);
}
```

## 🎯 **Usage Instructions**

### **Running Individual Examples**

```typescript
import { basicWorkoutExample } from './docs/examples/interactive-examples';

// Run a single example
await basicWorkoutExample();
```

### **Running All Examples**

```bash
# Run all examples
npm run examples:all

# Run specific example
npm run examples:basic

# Run with debug output
DEBUG=ai:* npm run examples:all
```

### **Custom Example Template**

```typescript
// Template for creating your own examples
async function myCustomExample() {
  console.log('🎯 My Custom Example');
  
  try {
    // Your example code here
    const openAIService = new OpenAIService();
    const quickWorkout = new QuickWorkoutFeature({ openAIService });
    
    const result = await quickWorkout.generateWorkout({
      // Your parameters
    });
    
    console.log('✅ Example completed');
    return result;
    
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    throw error;
  }
}
```

---

**🎯 These interactive examples demonstrate the full capabilities of the AI Service Feature-First Architecture with real, runnable code!** 