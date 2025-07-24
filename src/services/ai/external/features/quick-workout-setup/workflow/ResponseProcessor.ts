// QuickWorkoutSetup Feature - Response Processor
// Handles AI response parsing, workout structure normalization, and validation

import { GeneratedWorkout, WorkoutPhase, Exercise } from '../../../types/external-ai.types';
import { 
  QuickWorkoutParams, 
  ResponseProcessingResult, 
  FeatureValidationResult,
  QuickWorkoutMetadata,
  DurationStrategyResult 
} from '../types/quick-workout.types';

/**
 * Response processor for AI workout generation responses
 * Handles parsing, normalization, and validation of generated workouts
 */
export class ResponseProcessor {

  /**
   * Process AI response into a validated workout structure
   */
  async process(
    aiResponse: unknown,
    durationResult: DurationStrategyResult,
    params: QuickWorkoutParams,
    generationStartTime: number
  ): Promise<ResponseProcessingResult> {
    console.log('🔄 ResponseProcessor: Processing AI response');
    
    const processingStartTime = Date.now();
    const issuesFound: string[] = [];
    const fixesApplied: string[] = [];

    try {
      // Parse the AI response
      console.log('🔍 ResponseProcessor.process - About to parse aiResponse');
      const parsedWorkout = this.parseAIResponse(aiResponse);
      console.log('🔍 ResponseProcessor.process - Parsed workout result:', {
        hasId: !!parsedWorkout?.id,
        hasTitle: !!parsedWorkout?.title,
        actualId: parsedWorkout?.id,
        actualTitle: parsedWorkout?.title,
        isFallback: parsedWorkout?.title === 'AI Generated Workout'
      });
      
      // Normalize workout structure (fix duration issues)
      const normalizedWorkout = this.normalizeWorkoutStructure(parsedWorkout, durationResult, issuesFound, fixesApplied);
      
      // Validate the workout
      const validation = this.validateWorkout(normalizedWorkout, params);
      
      // Calculate processing metrics
      const processingTime = Date.now() - processingStartTime;
      const structureScore = this.calculateStructureScore(normalizedWorkout);
      const completenessScore = this.calculateCompletenessScore(normalizedWorkout);
      const consistencyScore = this.calculateConsistencyScore(normalizedWorkout, durationResult);

      console.log(`✅ ResponseProcessor: Processing completed in ${processingTime}ms`);

      return {
        workout: normalizedWorkout,
        processingTime,
        validationPassed: validation.isValid,
        normalizationApplied: fixesApplied.length > 0,
        issuesFound,
        fixesApplied,
        structureScore,
        completenessScore,
        consistencyScore
      };

    } catch (error) {
      console.error('❌ ResponseProcessor: Processing failed:', error);
      throw new Error(`Response processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateResponseStructure(response: unknown): { 
    isValid: boolean;
    issues: string[];
    structure: {
      hasValidStructure: boolean;
      missingFields: string[];
      invalidFields: string[];
      contentLength?: number;
      truncationPoint?: number;
    }
  } {
    console.log('🔍 ResponseProcessor: Validating response structure');
    
    const issues: string[] = [];
    const missingFields: string[] = [];
    const invalidFields: string[] = [];
    let contentLength: number | undefined;
    let truncationPoint: number | undefined;

    // Check if response is string
    if (typeof response === 'string') {
      contentLength = response.length;
      
      // Check for potential truncation
      const lastBrace = response.lastIndexOf('}');
      const lastContent = response.slice(lastBrace - 50, lastBrace + 1);
      console.log('🔍 ResponseProcessor - String response analysis:', {
        length: contentLength,
        lastBrace,
        lastContent: lastContent + '...',
        startsWithBrace: response.trim().startsWith('{'),
        endsWithBrace: response.trim().endsWith('}')
      });

      // Look for truncation indicators
      if (!response.trim().endsWith('}')) {
        issues.push('Response appears to be truncated - does not end with }');
        truncationPoint = lastBrace;
      }

      try {
        const parsed = JSON.parse(response);
        return this.validateParsedStructure(parsed, issues, missingFields, invalidFields);
      } catch (error) {
        issues.push(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
          isValid: false,
          issues,
          structure: {
            hasValidStructure: false,
            missingFields,
            invalidFields,
            contentLength,
            truncationPoint
          }
        };
      }
    }

    // If response is already an object
    if (typeof response === 'object' && response !== null) {
      return this.validateParsedStructure(response, issues, missingFields, invalidFields);
    }

    issues.push(`Invalid response type: ${typeof response}`);
    return {
      isValid: false,
      issues,
      structure: {
        hasValidStructure: false,
        missingFields,
        invalidFields
      }
    };
  }

  private validateParsedStructure(
    parsed: any, 
    issues: string[], 
    missingFields: string[], 
    invalidFields: string[]
  ) {
    // Required fields
    const requiredFields = [
      'id',
      'title',
      'description',
      'totalDuration',
      'warmup',
      'mainWorkout',
      'cooldown'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        missingFields.push(field);
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Validate workout phases
    if (parsed.warmup) {
      if (!Array.isArray(parsed.warmup.exercises)) {
        invalidFields.push('warmup.exercises');
        issues.push('warmup.exercises must be an array');
      }
    }

    if (parsed.mainWorkout) {
      if (!Array.isArray(parsed.mainWorkout.exercises)) {
        invalidFields.push('mainWorkout.exercises');
        issues.push('mainWorkout.exercises must be an array');
      }
    }

    if (parsed.cooldown) {
      if (!Array.isArray(parsed.cooldown.exercises)) {
        invalidFields.push('cooldown.exercises');
        issues.push('cooldown.exercises must be an array');
      }
    }

    // Log validation results
    console.log('🔍 ResponseProcessor - Structure validation results:', {
      missingFieldCount: missingFields.length,
      invalidFieldCount: invalidFields.length,
      totalIssues: issues.length,
      hasWarmupExercises: parsed.warmup?.exercises?.length || 0,
      hasMainExercises: parsed.mainWorkout?.exercises?.length || 0,
      hasCooldownExercises: parsed.cooldown?.exercises?.length || 0
    });

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      issues,
      structure: {
        hasValidStructure: missingFields.length === 0,
        missingFields,
        invalidFields
      }
    };
  }

  /**
   * Parse AI response with multiple strategies
   */
  private parseAIResponse(response: unknown): any {
    console.log('📝 ResponseProcessor: Parsing AI response');
    
    // Validate response structure first
    const validation = this.validateResponseStructure(response);
    
    // Log validation results
    console.log('🔍 ResponseProcessor - Response validation:', {
      isValid: validation.isValid,
      issueCount: validation.issues.length,
      structureValid: validation.structure.hasValidStructure,
      missingFields: validation.structure.missingFields,
      invalidFields: validation.structure.invalidFields,
      contentLength: validation.structure.contentLength,
      truncationPoint: validation.structure.truncationPoint
    });

    // If response is already a valid workout object, return it
    if (validation.isValid && typeof response === 'object' && response !== null) {
      console.log('🔍 ResponseProcessor - Valid workout object detected');
      return response;
    }

    // If response is a string, try parsing it
    if (typeof response === 'string') {
      console.log('🔍 ResponseProcessor - Processing as string');
      return this.parseStringResponse(response);
    }

    // If response is an object but not valid, try stringifying and parsing
    if (typeof response === 'object' && response !== null) {
      console.log('🔍 ResponseProcessor - Processing object through string parser');
      return this.parseStringResponse(JSON.stringify(response));
    }

    throw new Error('Invalid AI response format');
  }

  /**
   * Parse string response with comprehensive JSON extraction strategies
   * ✅ MIGRATION: Enhanced parsing logic moved from OpenAIStrategy
   */
  private parseStringResponse(content: string): any {
    console.log(`📝 ResponseProcessor: Parsing string response (${content.length} chars)`);

    // Strategy 1: Try direct JSON parsing
    try {
      const parsed = JSON.parse(content);
      console.log('✅ ResponseProcessor: Successfully parsed as direct JSON');
      
      // 🔍 DEBUG: Log the parsed AI response structure
      console.log('🔍 PARSED AI RESPONSE STRUCTURE:', {
        hasId: !!parsed.id,
        hasTitle: !!parsed.title,
        actualId: parsed.id,
        actualTitle: parsed.title,
        hasWarmup: !!parsed.warmup,
        hasMainWorkout: !!parsed.mainWorkout,
        hasCooldown: !!parsed.cooldown,
        topLevelKeys: Object.keys(parsed)
      });
      
      // 🔍 DEBUG: Log exercise counts
      if (parsed.warmup?.exercises) {
        console.log('🔍 WARMUP EXERCISES:', parsed.warmup.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          duration: ex.duration
        })));
      }
      
      if (parsed.mainWorkout?.exercises) {
        console.log('🔍 MAIN WORKOUT EXERCISES:', parsed.mainWorkout.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          duration: ex.duration
        })));
      }
      
      return parsed;
    } catch (error) {
      console.log('❌ ResponseProcessor: Direct JSON parsing failed:', (error as Error).message);
    }

    // Strategy 2: Extract JSON from markdown code blocks with language specification
    try {
      const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('✅ ResponseProcessor: Successfully parsed from markdown JSON block');
        
        // 🔍 DEBUG: Same debugging for extracted JSON
        console.log('🔍 EXTRACTED AI RESPONSE STRUCTURE:', {
          actualId: parsed.id,
          actualTitle: parsed.title,
          topLevelKeys: Object.keys(parsed)
        });
        
        return parsed;
      }
    } catch (error) {
      console.log('❌ ResponseProcessor: Markdown JSON parsing failed:', (error as Error).message);
    }

    // Strategy 3: Extract JSON from any code blocks (without language specification)
    try {
      const codeMatch = content.match(/```\s*\n([\s\S*]*?)\n```/);
      if (codeMatch) {
        const parsed = JSON.parse(codeMatch[1]);
        console.log('✅ ResponseProcessor: Successfully parsed from code block');
        
        // 🔍 DEBUG: Same debugging for code block extraction
        console.log('🔍 CODE BLOCK AI RESPONSE STRUCTURE:', {
          actualId: parsed.id,
          actualTitle: parsed.title,
          topLevelKeys: Object.keys(parsed)
        });
        
        return parsed;
      }
    } catch (error) {
      console.log('❌ ResponseProcessor: Code block parsing failed:', (error as Error).message);
    }

    // Strategy 4: Find JSON object in text (more robust pattern)
    try {
      // Look for the largest JSON object that contains workout structure
      const jsonMatches = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonMatches) {
        // Find the largest JSON object that looks like a workout
        let bestMatch = null;
        let bestScore = 0;
        
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            // Score based on workout-like properties
            let score = 0;
            if (parsed.id) score += 10;
            if (parsed.title) score += 10;
            if (parsed.warmup) score += 20;
            if (parsed.mainWorkout) score += 20;
            if (parsed.cooldown) score += 20;
            if (parsed.totalDuration) score += 10;
            if (parsed.exercises && Array.isArray(parsed.exercises)) score += 5;
            
            if (score > bestScore) {
              bestScore = score;
              bestMatch = parsed;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
        
        if (bestMatch && bestScore >= 30) { // Must have at least some workout structure
          console.log('✅ ResponseProcessor: Successfully parsed best workout JSON object');
          
          // 🔍 DEBUG: This is where it succeeded in your case
          console.log('🔍 EXTRACTED JSON OBJECT STRUCTURE:', {
            actualId: bestMatch.id,
            actualTitle: bestMatch.title,
            hasWarmup: !!bestMatch.warmup,
            hasMainWorkout: !!bestMatch.mainWorkout,
            hasCooldown: !!bestMatch.cooldown,
            topLevelKeys: Object.keys(bestMatch),
            score: bestScore,
            fullStructure: JSON.stringify(bestMatch, null, 2).substring(0, 1000)
          });
          
          return bestMatch;
        }
      }
    } catch (error) {
      console.log('❌ ResponseProcessor: JSON object extraction failed:', (error as Error).message);
    }

    // Strategy 5: Try to extract and clean JSON from mixed content
    try {
      // Remove common prefixes/suffixes that might wrap JSON
      let cleanedContent = content
        .replace(/^Here's your workout plan:\s*/i, '')
        .replace(/^Here is your workout:\s*/i, '')
        .replace(/^Workout generated:\s*/i, '')
        .replace(/^Generated workout:\s*/i, '')
        .replace(/\s*Enjoy your workout!$/i, '')
        .replace(/\s*Have a great workout!$/i, '')
        .trim();

      // Try to find JSON structure in cleaned content
      const jsonStart = cleanedContent.indexOf('{');
      const jsonEnd = cleanedContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = cleanedContent.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        console.log('✅ ResponseProcessor: Cleaned JSON extraction successful');
        return parsed;
      }
    } catch (error) {
      console.log('📝 ResponseProcessor: Cleaned JSON extraction failed');
    }

    // Strategy 6: Create basic workout from text if all JSON parsing fails
    console.warn('📝 ResponseProcessor: All JSON parsing failed, creating basic workout from text');
    console.log('🔍 ResponseProcessor: Full response for analysis:');
    console.log(content);
    
    return this.createBasicWorkoutFromText(content);
  }

  /**
   * Create a basic workout structure from text response
   * ✅ MIGRATION: Enhanced text-to-workout conversion
   */
  private createBasicWorkoutFromText(textResponse: string): any {
    console.log('📝 ResponseProcessor: Creating basic workout from text response');
    console.log('🔍 ResponseProcessor.createBasicWorkoutFromText - Input text length:', textResponse.length);
    console.log('🔍 ResponseProcessor.createBasicWorkoutFromText - Input text preview:', textResponse.substring(0, 200) + '...');
    
    // Try to extract meaningful information from the text
    const lines = textResponse.split('\n').filter(line => line.trim().length > 0);
    const exercises: string[] = [];
    
    // Look for exercise patterns in the text
    lines.forEach(line => {
      const trimmedLine = line.trim();
      // Look for lines that might be exercises (contain numbers, common exercise keywords)
      if (trimmedLine.match(/\d+/) && 
          (trimmedLine.toLowerCase().includes('push') || 
           trimmedLine.toLowerCase().includes('squat') || 
           trimmedLine.toLowerCase().includes('jump') || 
           trimmedLine.toLowerCase().includes('plank') || 
           trimmedLine.toLowerCase().includes('lunge') ||
           trimmedLine.toLowerCase().includes('crunch') ||
           trimmedLine.toLowerCase().includes('burpee'))) {
        exercises.push(trimmedLine);
      }
    });
    
    // Create structured workout from extracted information
    const workout = {
      id: `workout_${Date.now()}`,
      title: 'AI Generated Workout',
      description: textResponse.substring(0, 200) + (textResponse.length > 200 ? '...' : ''),
      totalDuration: 30,
      warmup: {
        name: 'Warm-up',
        duration: 300, // 5 minutes in seconds
        exercises: [{
          name: 'Dynamic Warm-up',
          description: 'Prepare your body with gentle movements',
          duration: 300
        }]
      },
      mainWorkout: {
        name: 'Main Workout',
        duration: 1200, // 20 minutes in seconds
        exercises: exercises.length > 0 
          ? exercises.slice(0, 3).map((exercise, index) => ({
              name: `Exercise ${index + 1}`,
              description: exercise,
              duration: 400 // ~6-7 minutes each
            }))
          : [{
              name: 'Main Exercise',
              description: 'Complete the main workout routine',
              duration: 1200
            }]
      },
      cooldown: {
        name: 'Cool-down',
        duration: 300, // 5 minutes in seconds
        exercises: [{
          name: 'Cool-down Stretch',
          description: 'Gentle stretching and relaxation',
          duration: 300
        }]
      }
    };
    
    console.log(`📝 ResponseProcessor: Created basic workout with ${exercises.length} extracted exercises`);
    return workout;
  }

  /**
   * Normalize workout structure and fix duration issues
   * This incorporates the duration normalization logic from OpenAIStrategy
   */
  private normalizeWorkoutStructure(
    workout: any, 
    durationResult: DurationStrategyResult,
    issuesFound: string[],
    fixesApplied: string[]
  ): GeneratedWorkout {
    console.log('🔧 ResponseProcessor: Normalizing workout structure');
    
    // 🔍 DEBUG: Log input workout structure before normalization
    console.log('🔍 BEFORE NORMALIZATION - Input workout:', {
      hasId: !!workout.id,
      hasTitle: !!workout.title,
      actualId: workout.id,
      actualTitle: workout.title,
      hasWarmup: !!workout.warmup,
      hasMainWorkout: !!workout.mainWorkout,
      hasCooldown: !!workout.cooldown,
      inputKeys: Object.keys(workout)
    });

    // Handle different phase structures
    let warmup, mainWorkout, cooldown;
    
    // Handle phases at root level
    if (workout.warmup || workout.mainWorkout || workout.cooldown) {
      warmup = workout.warmup;
      mainWorkout = workout.mainWorkout;
      cooldown = workout.cooldown;
      
      console.log('🔍 PHASE EXTRACTION - Found root level phases:', {
        warmupExercises: warmup?.exercises?.length || 0,
        mainExercises: mainWorkout?.exercises?.length || 0,
        cooldownExercises: cooldown?.exercises?.length || 0
      });
    }

    // ✅ FIXED: Recalculate phase durations based on exercises to ensure accuracy
    if (warmup && warmup.exercises && Array.isArray(warmup.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating warm-up phase duration');
      
      // 🔍 DEBUG: Log warmup before processing
      console.log('🔍 WARMUP BEFORE PROCESSING:', {
        name: warmup.name,
        exerciseCount: warmup.exercises.length,
        exercises: warmup.exercises.map(ex => ({ id: ex.id, name: ex.name, duration: ex.duration }))
      });
      
      // Check if AI generated phase duration in minutes and convert
      if (warmup.duration && warmup.duration >= 1 && warmup.duration <= 10) {
        issuesFound.push(`Warm-up phase has duration ${warmup.duration} which appears to be in minutes`);
        fixesApplied.push('Converted warm-up duration from minutes to seconds');
        warmup.duration = warmup.duration * 60;
      }
      
      warmup = this.createPhaseFromExercises('Warm-up', warmup.exercises, issuesFound, fixesApplied);
      
      // 🔍 DEBUG: Log warmup after processing
      console.log('🔍 WARMUP AFTER PROCESSING:', {
        name: warmup.name,
        duration: warmup.duration,
        exerciseCount: warmup.exercises.length
      });
    }

    if (mainWorkout && mainWorkout.exercises && Array.isArray(mainWorkout.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating main workout phase duration');
      
      // 🔍 DEBUG: Log main workout before processing
      console.log('🔍 MAIN WORKOUT BEFORE PROCESSING:', {
        name: mainWorkout.name,
        exerciseCount: mainWorkout.exercises.length,
        exercises: mainWorkout.exercises.map(ex => ({ id: ex.id, name: ex.name, duration: ex.duration }))
      });
      
      // Check if AI generated phase duration in minutes and convert
      if (mainWorkout.duration && mainWorkout.duration >= 1 && mainWorkout.duration <= 10) {
        issuesFound.push(`Main workout phase has duration ${mainWorkout.duration} which appears to be in minutes`);
        fixesApplied.push('Converted main workout duration from minutes to seconds');
        mainWorkout.duration = mainWorkout.duration * 60;
      }
      
      mainWorkout = this.createPhaseFromExercises('Main Workout', mainWorkout.exercises, issuesFound, fixesApplied);
      
      // 🔍 DEBUG: Log main workout after processing
      console.log('🔍 MAIN WORKOUT AFTER PROCESSING:', {
        name: mainWorkout.name,
        duration: mainWorkout.duration,
        exerciseCount: mainWorkout.exercises.length
      });
    }

    if (cooldown && cooldown.exercises && Array.isArray(cooldown.exercises)) {
      console.log('🔧 ResponseProcessor: Recalculating cool-down phase duration');
      
      // 🔍 DEBUG: Log cooldown before processing
      console.log('🔍 COOLDOWN BEFORE PROCESSING:', {
        name: cooldown.name,
        exerciseCount: cooldown.exercises.length,
        exercises: cooldown.exercises.map(ex => ({ id: ex.id, name: ex.name, duration: ex.duration }))
      });
      
      cooldown = this.createPhaseFromExercises('Cool-down', cooldown.exercises, issuesFound, fixesApplied);
      
      // 🔍 DEBUG: Log cooldown after processing
      console.log('🔍 COOLDOWN AFTER PROCESSING:', {
        name: cooldown.name,
        duration: cooldown.duration,
        exerciseCount: cooldown.exercises.length
      });
    }

    // Create default phases if missing
    if (!warmup) {
      warmup = this.createDefaultPhase('Warm-up', 5, issuesFound, fixesApplied);
      fixesApplied.push('Created default warm-up phase');
    }
    
    if (!mainWorkout) {
      mainWorkout = this.createDefaultPhase('Main Workout', 20, issuesFound, fixesApplied);
      fixesApplied.push('Created default main workout phase');
    }
    
    if (!cooldown) {
      cooldown = this.createDefaultPhase('Cool-down', 5, issuesFound, fixesApplied);
      fixesApplied.push('Created default cool-down phase');
    }

    // 🔍 DEBUG: Log what we're about to create
    const proposedId = workout.id || `workout_${Date.now()}`;
    const proposedTitle = workout.title || workout.name || 'AI Generated Workout';
    
    console.log('🔍 PROPOSED WORKOUT METADATA:', {
      proposedId,
      proposedTitle,
      originalId: workout.id,
      originalTitle: workout.title,
      originalName: workout.name
    });

    // Create normalized workout structure
    const normalizedWorkout: GeneratedWorkout = {
      id: workout.id || `workout_${Date.now()}`,
      title: workout.title || workout.name || workout.workoutName || 'Generated Workout',
      description: workout.description || 'AI-generated workout plan',
      totalDuration: workout.totalDuration || workout.duration || durationResult.adjustedDuration,
      estimatedCalories: workout.estimatedCalories || this.estimateCalories(durationResult.adjustedDuration),
      difficulty: workout.difficulty || 'some experience',
      equipment: Array.isArray(workout.equipment) ? workout.equipment : [],
      warmup,
      mainWorkout,
      cooldown,
      reasoning: workout.reasoning || 'AI-generated workout based on your profile and preferences',
      personalizedNotes: Array.isArray(workout.personalizedNotes) ? workout.personalizedNotes : [],
      progressionTips: Array.isArray(workout.progressionTips) ? workout.progressionTips : [],
      safetyReminders: Array.isArray(workout.safetyReminders) ? workout.safetyReminders : [],
      generatedAt: workout.generatedAt || new Date(),
      aiModel: workout.aiModel || 'gpt-4o',
      confidence: workout.confidence || 0.8,
      tags: Array.isArray(workout.tags) ? workout.tags : []
    };

    // 🔍 DEBUG: Log the final normalized workout
    console.log('🔍 FINAL NORMALIZED WORKOUT:', {
      finalId: normalizedWorkout.id,
      finalTitle: normalizedWorkout.title,
      finalTotalDuration: normalizedWorkout.totalDuration,
      warmupExercises: normalizedWorkout.warmup.exercises.length,
      mainExercises: normalizedWorkout.mainWorkout.exercises.length,
      cooldownExercises: normalizedWorkout.cooldown.exercises.length,
      fixesAppliedCount: fixesApplied.length,
      fixesApplied
    });

    console.log(`✅ ResponseProcessor: Normalized workout with ${fixesApplied.length} fixes applied`);
    return normalizedWorkout;
  }

  /**
   * Create a workout phase from exercises with accurate duration calculation
   */
  private createPhaseFromExercises(
    name: string, 
    exercises: any[],
    issuesFound: string[],
    fixesApplied: string[]
  ): WorkoutPhase {
    console.log(`🔧 ResponseProcessor: Creating phase "${name}" with ${exercises.length} exercises`);
    
    // 🔍 DEBUG: Log input exercises
    console.log(`🔍 INPUT EXERCISES for ${name}:`, exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      duration: ex.duration,
      hasDescription: !!ex.description
    })));
    
    // Calculate total duration including exercise time and rest periods
    const totalDuration = exercises.reduce((sum, ex, index) => {
      let exerciseDuration = ex.duration || ex.durationMinutes || 60;
      const restTime = ex.restTime || ex.rest || 30;
      
      // ✅ FIXED: More intelligent duration detection
      if (exerciseDuration >= 1 && exerciseDuration <= 10) {
        issuesFound.push(`Exercise "${ex.name}" has duration ${exerciseDuration} which appears to be in minutes`);
        fixesApplied.push(`Converted exercise "${ex.name}" duration from minutes to seconds`);
        exerciseDuration = exerciseDuration * 60;
      }
      
      // Add exercise duration
      let phaseTime = exerciseDuration;
      
      // Add rest time after each exercise (except the last one)
      if (index < exercises.length - 1) {
        phaseTime += restTime;
      }
      
      return sum + phaseTime;
    }, 0);
    
    console.log(`🔧 ResponseProcessor: Phase "${name}" total duration: ${totalDuration} seconds`);
    
    const phase = {
      name,
      duration: totalDuration,
      exercises: exercises.map((exercise, index) => this.normalizeExercise(exercise, index, issuesFound, fixesApplied)),
      instructions: `Complete ${name.toLowerCase()} phase with proper form`,
      tips: []
    };
    
    // 🔍 DEBUG: Log final phase structure
    console.log(`🔍 FINAL PHASE "${name}":`, {
      name: phase.name,
      duration: phase.duration,
      exerciseCount: phase.exercises.length,
      firstExercise: phase.exercises[0] ? {
        id: phase.exercises[0].id,
        name: phase.exercises[0].name
      } : null
    });
    
    return phase;
  }

  /**
   * Normalize individual exercise structure
   */
  private normalizeExercise(
    exercise: any, 
    index: number,
    issuesFound: string[],
    fixesApplied: string[]
  ): Exercise {
    let exerciseDuration = exercise.duration || exercise.durationMinutes || 60;
    
    // ✅ FIXED: Apply the same intelligent duration fix to individual exercises
    if (exerciseDuration >= 1 && exerciseDuration <= 10) {
      issuesFound.push(`Exercise duration appears to be in minutes: ${exerciseDuration}`);
      fixesApplied.push(`Converted exercise duration to seconds: ${exerciseDuration * 60}`);
      exerciseDuration = exerciseDuration * 60;
    }
    
    return {
      id: exercise.id || `exercise_${index + 1}`,
      name: exercise.name || exercise.activityName || `Exercise ${index + 1}`,
      description: exercise.description || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'}`,
      duration: exerciseDuration,
      sets: exercise.sets || 1,
      reps: exercise.reps || exercise.repetitions || 10,
      restTime: exercise.rest || exercise.restTime || 30,
      equipment: exercise.equipment || exercise.equipmentNeeded ? [exercise.equipmentNeeded] : [],
      form: exercise.form || exercise.instructions || `Perform ${exercise.name || exercise.activityName || 'exercise'} with proper form`,
      modifications: exercise.modifications || [],
      commonMistakes: exercise.commonMistakes || [],
      primaryMuscles: exercise.primaryMuscles || [],
      secondaryMuscles: exercise.secondaryMuscles || [],
      movementType: exercise.movementType || 'strength' as const,
      personalizedNotes: exercise.personalizedNotes || [],
      difficultyAdjustments: exercise.difficultyAdjustments || []
    };
  }

  /**
   * Create a default workout phase
   */
  private createDefaultPhase(
    name: string, 
    durationMinutes: number,
    issuesFound: string[],
    fixesApplied: string[]
  ): WorkoutPhase {
    const duration = durationMinutes * 60; // Convert to seconds
    
    issuesFound.push(`Missing ${name.toLowerCase()} phase in AI response`);
    fixesApplied.push(`Created default ${name.toLowerCase()} phase`);
    
    return {
      name,
      duration,
      exercises: [{
        id: `exercise_1`,
        name: `${name} Exercise`,
        description: `Perform ${name.toLowerCase()} exercises`,
        duration,
        form: `Perform ${name.toLowerCase()} exercises with proper form`,
        modifications: [],
        commonMistakes: [],
        primaryMuscles: [],
        secondaryMuscles: [],
        movementType: 'strength' as const,
        personalizedNotes: [],
        difficultyAdjustments: []
      }],
      instructions: `Complete ${name.toLowerCase()} phase`,
      tips: []
    };
  }

  /**
   * Validate the processed workout
   */
  private validateWorkout(workout: GeneratedWorkout, params: QuickWorkoutParams): FeatureValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check required fields
    if (!workout.id) errors.push({ field: 'id', message: 'Workout ID is required', severity: 'error' });
    if (!workout.title) errors.push({ field: 'title', message: 'Workout title is required', severity: 'error' });
    
    // Check phases
    if (!workout.warmup) errors.push({ field: 'warmup', message: 'Warmup phase is required', severity: 'error' });
    if (!workout.mainWorkout) errors.push({ field: 'mainWorkout', message: 'Main workout phase is required', severity: 'error' });
    if (!workout.cooldown) errors.push({ field: 'cooldown', message: 'Cooldown phase is required', severity: 'error' });

    // Check duration consistency
    const totalPhaseDuration = (workout.warmup?.duration || 0) + (workout.mainWorkout?.duration || 0) + (workout.cooldown?.duration || 0);
    const expectedDuration = params.duration * 60; // Convert to seconds
    
    if (Math.abs(totalPhaseDuration - expectedDuration) > 300) { // 5 minute tolerance
      warnings.push({ 
        field: 'duration', 
        message: `Total phase duration (${Math.round(totalPhaseDuration/60)}min) differs from expected (${params.duration}min)`,
        recommendation: 'Consider adjusting phase durations'
      });
    }

    // Calculate validation score
    const maxScore = 100;
    const errorPenalty = errors.length * 20;
    const warningPenalty = warnings.length * 5;
    const score = Math.max(0, maxScore - errorPenalty - warningPenalty);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(workout: GeneratedWorkout): number {
    let score = 0;
    
    // Phase completeness (30 points)
    if (workout.warmup) score += 10;
    if (workout.mainWorkout) score += 10;
    if (workout.cooldown) score += 10;
    
    // Exercise completeness (40 points)
    const totalExercises = (workout.warmup?.exercises?.length || 0) + 
                          (workout.mainWorkout?.exercises?.length || 0) + 
                          (workout.cooldown?.exercises?.length || 0);
    score += Math.min(40, totalExercises * 5);
    
    // Metadata completeness (30 points)
    if (workout.title) score += 5;
    if (workout.description) score += 5;
    if (workout.reasoning) score += 10;
    if (workout.personalizedNotes?.length) score += 5;
    if (workout.safetyReminders?.length) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(workout: GeneratedWorkout): number {
    let score = 0;
    const maxScore = 100;
    
    // Required fields (50 points)
    const requiredFields = ['id', 'title', 'description', 'warmup', 'mainWorkout', 'cooldown'];
    const presentFields = requiredFields.filter(field => workout[field as keyof GeneratedWorkout]);
    score += (presentFields.length / requiredFields.length) * 50;
    
    // Optional enhancement fields (50 points)
    const enhancementFields = ['reasoning', 'personalizedNotes', 'progressionTips', 'safetyReminders'];
    const presentEnhancements = enhancementFields.filter(field => {
      const value = workout[field as keyof GeneratedWorkout];
      return Array.isArray(value) ? value.length > 0 : !!value;
    });
    score += (presentEnhancements.length / enhancementFields.length) * 50;
    
    return Math.min(maxScore, score);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(workout: GeneratedWorkout, durationResult: DurationStrategyResult): number {
    let score = 100;
    
    // Duration consistency
    const totalPhaseDuration = (workout.warmup?.duration || 0) + 
                              (workout.mainWorkout?.duration || 0) + 
                              (workout.cooldown?.duration || 0);
    const expectedDuration = durationResult.adjustedDuration * 60;
    const durationDiff = Math.abs(totalPhaseDuration - expectedDuration);
    
    if (durationDiff > 300) score -= 20; // 5+ minute difference
    else if (durationDiff > 120) score -= 10; // 2+ minute difference
    
    // Exercise count consistency with duration config
    const config = durationResult.config;
    const actualExerciseCount = (workout.warmup?.exercises?.length || 0) + 
                               (workout.mainWorkout?.exercises?.length || 0) + 
                               (workout.cooldown?.exercises?.length || 0);
    
    const expectedExerciseCount = config.exerciseCount.total;
    const exerciseCountDiff = Math.abs(actualExerciseCount - expectedExerciseCount);
    
    if (exerciseCountDiff > 3) score -= 15;
    else if (exerciseCountDiff > 1) score -= 5;
    
    return Math.max(0, score);
  }

  /**
   * Estimate calories for workout duration
   */
  private estimateCalories(durationMinutes: number): number {
    // Rough estimate: 7-10 calories per minute for moderate intensity
    return Math.round(durationMinutes * 8.5);
  }
} 