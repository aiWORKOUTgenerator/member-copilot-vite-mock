// Workflow Builder - Developer Tool for Creating and Managing Workflows
// Part of Phase 4: Developer Experience Optimization

import {
  WorkflowConfig,
  WorkflowStep,
  WorkflowCondition,
  RetryPolicy,
  WorkflowStepType
} from '../../src/services/ai/external/shared/types/workflow.types';

export interface WorkflowBuilderConfig {
  id: string;
  name: string;
  description?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  optimizations: OptimizationSuggestion[];
}

export interface ValidationError {
  type: 'error';
  message: string;
  stepId?: string;
  field?: string;
}

export interface ValidationWarning {
  type: 'warning';
  message: string;
  stepId?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
  type: 'optimization';
  message: string;
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'reliability' | 'maintainability';
  implementation?: string;
}

export interface OptimizedWorkflowConfig extends WorkflowConfig {
  optimizations: {
    applied: OptimizationSuggestion[];
    performance: PerformanceOptimizations;
    reliability: ReliabilityOptimizations;
  };
}

export interface PerformanceOptimizations {
  parallelization: ParallelizationInfo[];
  caching: CachingInfo[];
  timeoutOptimization: TimeoutInfo[];
}

export interface ReliabilityOptimizations {
  fallbacks: FallbackInfo[];
  retries: RetryInfo[];
  healthChecks: HealthCheckInfo[];
}

/**
 * WorkflowBuilder - Comprehensive tool for building, validating, and optimizing workflows
 */
export class WorkflowBuilder {
  private config: WorkflowBuilderConfig;
  private steps: WorkflowStep[] = [];
  private validationRules: ValidationRule[] = [];

  constructor(config: WorkflowBuilderConfig) {
    this.config = config;
    this.initializeValidationRules();
  }

  // ===== WORKFLOW CONSTRUCTION METHODS =====

  /**
   * Add a feature step to the workflow
   */
  addFeatureStep(
    id: string,
    name: string,
    feature: string,
    operation: string,
    params: any,
    options: Partial<WorkflowStep> = {}
  ): WorkflowBuilder {
    const step: WorkflowStep = {
      id,
      name,
      type: WorkflowStepType.FEATURE,
      feature,
      operation,
      params,
      ...options
    };

    this.steps.push(step);
    return this;
  }

  /**
   * Add a parallel execution step
   */
  addParallelStep(
    id: string,
    name: string,
    parallelSteps: WorkflowStep[],
    options: Partial<WorkflowStep> = {}
  ): WorkflowBuilder {
    const step: WorkflowStep = {
      id,
      name,
      type: WorkflowStepType.PARALLEL,
      parallel: parallelSteps,
      ...options
    };

    this.steps.push(step);
    return this;
  }

  /**
   * Add a conditional step
   */
  addConditionalStep(
    id: string,
    name: string,
    condition: WorkflowCondition,
    ifTrueSteps: WorkflowStep[],
    ifFalseSteps: WorkflowStep[] = [],
    options: Partial<WorkflowStep> = {}
  ): WorkflowBuilder {
    const step: WorkflowStep = {
      id,
      name,
      type: WorkflowStepType.CONDITIONAL,
      condition,
      ifTrue: ifTrueSteps,
      ifFalse: ifFalseSteps,
      ...options
    };

    this.steps.push(step);
    return this;
  }

  /**
   * Add a sequential execution step
   */
  addSequentialStep(
    id: string,
    name: string,
    sequentialSteps: WorkflowStep[],
    options: Partial<WorkflowStep> = {}
  ): WorkflowBuilder {
    const step: WorkflowStep = {
      id,
      name,
      type: WorkflowStepType.SEQUENTIAL,
      sequential: sequentialSteps,
      ...options
    };

    this.steps.push(step);
    return this;
  }

  /**
   * Add dependencies between steps
   */
  addDependency(stepId: string, dependsOn: string | string[]): WorkflowBuilder {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id '${stepId}' not found`);
    }

    const dependencies = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
    step.dependencies = [...(step.dependencies || []), ...dependencies];
    
    return this;
  }

  /**
   * Add fallback to a step
   */
  addFallback(stepId: string, fallbackStep: WorkflowStep): WorkflowBuilder {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id '${stepId}' not found`);
    }

    step.fallback = fallbackStep;
    return this;
  }

  /**
   * Set timeout for a specific step
   */
  setTimeout(stepId: string, timeout: number): WorkflowBuilder {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id '${stepId}' not found`);
    }

    step.timeout = timeout;
    return this;
  }

  /**
   * Set retry policy for a specific step
   */
  setRetries(stepId: string, retries: number): WorkflowBuilder {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id '${stepId}' not found`);
    }

    step.retries = retries;
    return this;
  }

  // ===== VALIDATION METHODS =====

  /**
   * Validate the current workflow configuration
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    // Run all validation rules
    for (const rule of this.validationRules) {
      const result = rule.validate(this.build());
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      optimizations.push(...result.optimizations);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      optimizations
    };
  }

  /**
   * Validate workflow dependencies
   */
  private validateDependencies(): ValidationResult {
    const errors: ValidationError[] = [];
    const stepIds = new Set(this.steps.map(s => s.id));

    for (const step of this.steps) {
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!stepIds.has(depId)) {
            errors.push({
              type: 'error',
              message: `Step '${step.id}' depends on non-existent step '${depId}'`,
              stepId: step.id,
              field: 'dependencies'
            });
          }
        }
      }
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies();
    circularDeps.forEach(cycle => {
      errors.push({
        type: 'error',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`
      });
    });

    return { valid: errors.length === 0, errors, warnings: [], optimizations: [] };
  }

  private detectCircularDependencies(): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (stepId: string, path: string[] = []): void => {
      if (recursionStack.has(stepId)) {
        const cycleStart = path.indexOf(stepId);
        cycles.push([...path.slice(cycleStart), stepId]);
        return;
      }

      if (visited.has(stepId)) return;

      visited.add(stepId);
      recursionStack.add(stepId);
      path.push(stepId);

      const step = this.steps.find(s => s.id === stepId);
      if (step?.dependencies) {
        for (const depId of step.dependencies) {
          dfs(depId, path);
        }
      }

      recursionStack.delete(stepId);
      path.pop();
    };

    this.steps.forEach(step => {
      if (!visited.has(step.id)) {
        dfs(step.id);
      }
    });

    return cycles;
  }

  // ===== OPTIMIZATION METHODS =====

  /**
   * Optimize the workflow for better performance and reliability
   */
  optimize(): OptimizedWorkflowConfig {
    const baseConfig = this.build();
    const validationResult = this.validate();
    
    // Apply performance optimizations
    const performanceOpts = this.optimizePerformance();
    
    // Apply reliability optimizations
    const reliabilityOpts = this.optimizeReliability();
    
    // Apply suggested optimizations
    const appliedOptimizations = this.applyOptimizations(validationResult.optimizations);

    return {
      ...baseConfig,
      optimizations: {
        applied: appliedOptimizations,
        performance: performanceOpts,
        reliability: reliabilityOpts
      }
    };
  }

  private optimizePerformance(): PerformanceOptimizations {
    return {
      parallelization: this.identifyParallelizationOpportunities(),
      caching: this.identifyCachingOpportunities(),
      timeoutOptimization: this.optimizeTimeouts()
    };
  }

  private optimizeReliability(): ReliabilityOptimizations {
    return {
      fallbacks: this.identifyFallbackOpportunities(),
      retries: this.optimizeRetries(),
      healthChecks: this.identifyHealthCheckOpportunities()
    };
  }

  private identifyParallelizationOpportunities(): ParallelizationInfo[] {
    const opportunities: ParallelizationInfo[] = [];
    
    // Find independent steps that can run in parallel
    const independentGroups = this.findIndependentStepGroups();
    
    independentGroups.forEach(group => {
      if (group.length > 1) {
        opportunities.push({
          stepIds: group.map(s => s.id),
          estimatedSpeedup: this.calculateParallelSpeedup(group),
          complexity: this.assessParallelizationComplexity(group)
        });
      }
    });

    return opportunities;
  }

  private identifyCachingOpportunities(): CachingInfo[] {
    const opportunities: CachingInfo[] = [];
    
    this.steps.forEach(step => {
      if (step.type === WorkflowStepType.FEATURE) {
        const cacheability = this.assessCacheability(step);
        if (cacheability.cacheable) {
          opportunities.push({
            stepId: step.id,
            cacheKey: cacheability.keyStrategy,
            ttl: cacheability.recommendedTTL,
            impact: cacheability.impact
          });
        }
      }
    });

    return opportunities;
  }

  // ===== TEMPLATE METHODS =====

  /**
   * Create workflow from predefined template
   */
  static fromTemplate(templateName: string, params: Record<string, any> = {}): WorkflowBuilder {
    const template = WORKFLOW_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return template.create(params);
  }

  /**
   * Export workflow as template
   */
  exportAsTemplate(): WorkflowTemplate {
    const config = this.build();
    
    return {
      name: config.name,
      description: config.description || '',
      parameters: this.extractParameters(),
      create: (params: Record<string, any>) => {
        const builder = new WorkflowBuilder({
          id: this.substituteParameters(config.id, params),
          name: this.substituteParameters(config.name, params),
          description: config.description ? this.substituteParameters(config.description, params) : undefined,
          timeout: config.timeout,
          retryPolicy: config.retryPolicy
        });

        this.steps.forEach(step => {
          const substitutedStep = this.substituteStepParameters(step, params);
          builder.steps.push(substitutedStep);
        });

        return builder;
      }
    };
  }

  // ===== BUILD METHOD =====

  /**
   * Build the final workflow configuration
   */
  build(): WorkflowConfig {
    return {
      id: this.config.id,
      name: this.config.name,
      description: this.config.description,
      steps: [...this.steps],
      timeout: this.config.timeout,
      retryPolicy: this.config.retryPolicy,
      metadata: this.config.metadata
    };
  }

  // ===== UTILITY METHODS =====

  private initializeValidationRules(): void {
    this.validationRules = [
      new DependencyValidationRule(),
      new TimeoutValidationRule(),
      new FeatureExistenceValidationRule(),
      new ParameterValidationRule(),
      new PerformanceValidationRule()
    ];
  }

  private findIndependentStepGroups(): WorkflowStep[][] {
    // Implementation for finding groups of steps that can run independently
    const groups: WorkflowStep[][] = [];
    const processed = new Set<string>();
    
    for (const step of this.steps) {
      if (processed.has(step.id)) continue;
      
      const group = this.findIndependentSteps(step, processed);
      if (group.length > 0) {
        groups.push(group);
      }
    }
    
    return groups;
  }

  private findIndependentSteps(startStep: WorkflowStep, processed: Set<string>): WorkflowStep[] {
    // Find all steps that can run independently with this step
    const independentSteps = [startStep];
    processed.add(startStep.id);
    
    for (const step of this.steps) {
      if (processed.has(step.id)) continue;
      
      if (this.areStepsIndependent(startStep, step)) {
        independentSteps.push(step);
        processed.add(step.id);
      }
    }
    
    return independentSteps;
  }

  private areStepsIndependent(step1: WorkflowStep, step2: WorkflowStep): boolean {
    // Check if two steps can run independently
    const step1Deps = step1.dependencies || [];
    const step2Deps = step2.dependencies || [];
    
    // Steps are independent if neither depends on the other
    return !step1Deps.includes(step2.id) && !step2Deps.includes(step1.id);
  }

  private calculateParallelSpeedup(steps: WorkflowStep[]): number {
    // Estimate speedup from parallelization
    const totalSequentialTime = steps.reduce((sum, step) => sum + (step.timeout || 30000), 0);
    const maxParallelTime = Math.max(...steps.map(step => step.timeout || 30000));
    
    return totalSequentialTime / maxParallelTime;
  }

  private assessParallelizationComplexity(steps: WorkflowStep[]): 'low' | 'medium' | 'high' {
    // Assess complexity of parallelizing these steps
    if (steps.length <= 2) return 'low';
    if (steps.length <= 4) return 'medium';
    return 'high';
  }

  private assessCacheability(step: WorkflowStep): CacheabilityAssessment {
    // Assess if and how a step can be cached
    // This is a simplified implementation
    return {
      cacheable: step.type === WorkflowStepType.FEATURE,
      keyStrategy: `${step.feature}-${step.operation}`,
      recommendedTTL: 3600000, // 1 hour
      impact: 'medium'
    };
  }

  private extractParameters(): TemplateParameter[] {
    // Extract parameterized values from the workflow
    const parameters: TemplateParameter[] = [];
    const paramRegex = /\{\{(\w+)\}\}/g;
    
    const extractFromObject = (obj: any, context: string) => {
      const objStr = JSON.stringify(obj);
      let match;
      
      while ((match = paramRegex.exec(objStr)) !== null) {
        const paramName = match[1];
        if (!parameters.find(p => p.name === paramName)) {
          parameters.push({
            name: paramName,
            type: 'string',
            description: `Parameter used in ${context}`,
            required: true
          });
        }
      }
    };
    
    this.steps.forEach(step => {
      extractFromObject(step.params, `step ${step.id}`);
    });
    
    return parameters;
  }

  private substituteParameters(template: string, params: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return params[paramName] || match;
    });
  }

  private substituteStepParameters(step: WorkflowStep, params: Record<string, any>): WorkflowStep {
    const substituted = JSON.parse(JSON.stringify(step));
    
    const substitute = (obj: any): any => {
      if (typeof obj === 'string') {
        return this.substituteParameters(obj, params);
      } else if (Array.isArray(obj)) {
        return obj.map(substitute);
      } else if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = substitute(value);
        }
        return result;
      }
      return obj;
    };
    
    return substitute(substituted);
  }

  private optimizeTimeouts(): TimeoutInfo[] {
    // Analyze and optimize timeouts based on step characteristics
    return this.steps.map(step => ({
      stepId: step.id,
      currentTimeout: step.timeout || 30000,
      recommendedTimeout: this.calculateOptimalTimeout(step),
      reasoning: this.getTimeoutReasoning(step)
    }));
  }

  private calculateOptimalTimeout(step: WorkflowStep): number {
    // Calculate optimal timeout based on step type and characteristics
    switch (step.type) {
      case WorkflowStepType.FEATURE:
        return this.calculateFeatureTimeout(step);
      case WorkflowStepType.PARALLEL:
        return Math.max(...(step.parallel || []).map(s => this.calculateOptimalTimeout(s))) + 5000;
      case WorkflowStepType.SEQUENTIAL:
        return (step.sequential || []).reduce((sum, s) => sum + this.calculateOptimalTimeout(s), 0);
      default:
        return 30000;
    }
  }

  private calculateFeatureTimeout(step: WorkflowStep): number {
    // Feature-specific timeout calculation
    const baseTimeout = 15000;
    const complexityMultiplier = this.assessStepComplexity(step);
    
    return Math.min(baseTimeout * complexityMultiplier, 120000); // Cap at 2 minutes
  }

  private assessStepComplexity(step: WorkflowStep): number {
    // Assess step complexity for timeout calculation
    let complexity = 1;
    
    // More complex operations need longer timeouts
    if (step.operation?.includes('comprehensive')) complexity *= 2;
    if (step.operation?.includes('detailed')) complexity *= 1.5;
    if (step.operation?.includes('analysis')) complexity *= 1.3;
    
    return complexity;
  }

  private getTimeoutReasoning(step: WorkflowStep): string {
    return `Optimized based on ${step.type} step characteristics and operation complexity`;
  }

  private identifyFallbackOpportunities(): FallbackInfo[] {
    return this.steps
      .filter(step => !step.fallback && step.type === WorkflowStepType.FEATURE)
      .map(step => ({
        stepId: step.id,
        recommendedFallback: this.recommendFallbackStrategy(step),
        impact: this.assessFallbackImpact(step)
      }));
  }

  private recommendFallbackStrategy(step: WorkflowStep): FallbackStrategy {
    return {
      type: 'template',
      description: `Template-based fallback for ${step.operation}`,
      implementation: `Use pre-defined template for ${step.feature} ${step.operation}`
    };
  }

  private assessFallbackImpact(step: WorkflowStep): 'low' | 'medium' | 'high' {
    // Assess the impact of adding fallback to this step
    return step.dependencies?.length ? 'high' : 'medium';
  }

  private optimizeRetries(): RetryInfo[] {
    return this.steps.map(step => ({
      stepId: step.id,
      currentRetries: step.retries || 0,
      recommendedRetries: this.calculateOptimalRetries(step),
      strategy: this.recommendRetryStrategy(step)
    }));
  }

  private calculateOptimalRetries(step: WorkflowStep): number {
    // Calculate optimal retry count based on step characteristics
    if (step.type === WorkflowStepType.FEATURE) {
      return step.operation?.includes('critical') ? 3 : 2;
    }
    return 1;
  }

  private recommendRetryStrategy(step: WorkflowStep): RetryStrategy {
    return {
      type: 'exponential-backoff',
      baseDelay: 1000,
      multiplier: 2,
      maxDelay: 10000
    };
  }

  private identifyHealthCheckOpportunities(): HealthCheckInfo[] {
    return this.steps
      .filter(step => step.type === WorkflowStepType.FEATURE)
      .map(step => ({
        stepId: step.id,
        checkType: 'dependency-health',
        frequency: 'before-execution',
        impact: 'medium'
      }));
  }

  private applyOptimizations(optimizations: OptimizationSuggestion[]): OptimizationSuggestion[] {
    const applied: OptimizationSuggestion[] = [];
    
    optimizations.forEach(opt => {
      if (opt.impact === 'high' || opt.impact === 'medium') {
        // Apply high and medium impact optimizations automatically
        applied.push(opt);
        
        // Apply the optimization logic here
        this.applyOptimization(opt);
      }
    });
    
    return applied;
  }

  private applyOptimization(optimization: OptimizationSuggestion): void {
    // Apply specific optimization based on its type and category
    switch (optimization.category) {
      case 'performance':
        this.applyPerformanceOptimization(optimization);
        break;
      case 'reliability':
        this.applyReliabilityOptimization(optimization);
        break;
      case 'maintainability':
        this.applyMaintainabilityOptimization(optimization);
        break;
    }
  }

  private applyPerformanceOptimization(optimization: OptimizationSuggestion): void {
    // Implementation for applying performance optimizations
    // This would modify the workflow steps based on the optimization
  }

  private applyReliabilityOptimization(optimization: OptimizationSuggestion): void {
    // Implementation for applying reliability optimizations
  }

  private applyMaintainabilityOptimization(optimization: OptimizationSuggestion): void {
    // Implementation for applying maintainability optimizations
  }
}

// ===== INTERFACES AND TYPES =====

interface ValidationRule {
  validate(config: WorkflowConfig): ValidationResult;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  parameters: TemplateParameter[];
  create: (params: Record<string, any>) => WorkflowBuilder;
}

interface TemplateParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

interface ParallelizationInfo {
  stepIds: string[];
  estimatedSpeedup: number;
  complexity: 'low' | 'medium' | 'high';
}

interface CachingInfo {
  stepId: string;
  cacheKey: string;
  ttl: number;
  impact: 'low' | 'medium' | 'high';
}

interface TimeoutInfo {
  stepId: string;
  currentTimeout: number;
  recommendedTimeout: number;
  reasoning: string;
}

interface FallbackInfo {
  stepId: string;
  recommendedFallback: FallbackStrategy;
  impact: 'low' | 'medium' | 'high';
}

interface RetryInfo {
  stepId: string;
  currentRetries: number;
  recommendedRetries: number;
  strategy: RetryStrategy;
}

interface HealthCheckInfo {
  stepId: string;
  checkType: string;
  frequency: string;
  impact: 'low' | 'medium' | 'high';
}

interface CacheabilityAssessment {
  cacheable: boolean;
  keyStrategy: string;
  recommendedTTL: number;
  impact: 'low' | 'medium' | 'high';
}

interface FallbackStrategy {
  type: string;
  description: string;
  implementation: string;
}

interface RetryStrategy {
  type: string;
  baseDelay: number;
  multiplier: number;
  maxDelay: number;
}

// ===== VALIDATION RULES =====

class DependencyValidationRule implements ValidationRule {
  validate(config: WorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    // Validate dependencies exist
    const stepIds = new Set(config.steps.map(s => s.id));
    
    config.steps.forEach(step => {
      if (step.dependencies) {
        step.dependencies.forEach(depId => {
          if (!stepIds.has(depId)) {
            errors.push({
              type: 'error',
              message: `Step '${step.id}' depends on non-existent step '${depId}'`,
              stepId: step.id
            });
          }
        });
      }
    });

    return { valid: errors.length === 0, errors, warnings, optimizations };
  }
}

class TimeoutValidationRule implements ValidationRule {
  validate(config: WorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    config.steps.forEach(step => {
      if (step.timeout && step.timeout > 300000) { // 5 minutes
        warnings.push({
          type: 'warning',
          message: `Step '${step.id}' has very long timeout (${step.timeout}ms)`,
          stepId: step.id,
          severity: 'medium'
        });
      }

      if (!step.timeout) {
        optimizations.push({
          type: 'optimization',
          message: `Consider setting explicit timeout for step '${step.id}'`,
          impact: 'low',
          category: 'reliability'
        });
      }
    });

    return { valid: errors.length === 0, errors, warnings, optimizations };
  }
}

class FeatureExistenceValidationRule implements ValidationRule {
  validate(config: WorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    // This would check if features actually exist in the system
    // For now, just check that feature steps have required fields

    config.steps.forEach(step => {
      if (step.type === WorkflowStepType.FEATURE) {
        if (!step.feature) {
          errors.push({
            type: 'error',
            message: `Feature step '${step.id}' missing feature name`,
            stepId: step.id
          });
        }

        if (!step.operation) {
          errors.push({
            type: 'error',
            message: `Feature step '${step.id}' missing operation name`,
            stepId: step.id
          });
        }
      }
    });

    return { valid: errors.length === 0, errors, warnings, optimizations };
  }
}

class ParameterValidationRule implements ValidationRule {
  validate(config: WorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    config.steps.forEach(step => {
      if (step.params) {
        // Check for parameter template syntax issues
        const paramStr = JSON.stringify(step.params);
        const unclosedTemplates = paramStr.match(/\{\{[^}]*$/g);
        
        if (unclosedTemplates) {
          errors.push({
            type: 'error',
            message: `Step '${step.id}' has malformed parameter templates`,
            stepId: step.id
          });
        }
      }
    });

    return { valid: errors.length === 0, errors, warnings, optimizations };
  }
}

class PerformanceValidationRule implements ValidationRule {
  validate(config: WorkflowConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    // Look for parallelization opportunities
    const independentSteps = this.findIndependentSteps(config.steps);
    
    if (independentSteps.length > 1) {
      optimizations.push({
        type: 'optimization',
        message: `Consider parallelizing ${independentSteps.length} independent steps`,
        impact: 'high',
        category: 'performance',
        implementation: 'Group independent steps in parallel execution block'
      });
    }

    return { valid: errors.length === 0, errors, warnings, optimizations };
  }

  private findIndependentSteps(steps: WorkflowStep[]): WorkflowStep[] {
    return steps.filter(step => !step.dependencies || step.dependencies.length === 0);
  }
}

// ===== PREDEFINED TEMPLATES =====

const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  'basic-feature': {
    name: 'Basic Feature Workflow',
    description: 'Simple single-feature workflow template',
    parameters: [
      { name: 'featureName', type: 'string', description: 'Name of the feature to call', required: true },
      { name: 'operation', type: 'string', description: 'Operation to perform', required: true },
      { name: 'timeout', type: 'number', description: 'Timeout in milliseconds', required: false, default: 30000 }
    ],
    create: (params) => new WorkflowBuilder({
      id: `{{workflowId}}`,
      name: `{{workflowName}}`,
      timeout: params.timeout || 30000
    }).addFeatureStep(
      'main-step',
      `Execute ${params.featureName}`,
      params.featureName,
      params.operation,
      '{{params}}',
      { timeout: params.timeout || 30000 }
    )
  },

  'comprehensive-analysis': {
    name: 'Comprehensive Analysis Workflow',
    description: 'Multi-step analysis workflow with parallel processing',
    parameters: [
      { name: 'analysisType', type: 'string', description: 'Type of analysis to perform', required: true },
      { name: 'dataSource', type: 'string', description: 'Source of data to analyze', required: true }
    ],
    create: (params) => new WorkflowBuilder({
      id: 'comprehensive-{{analysisType}}-analysis',
      name: 'Comprehensive {{analysisType}} Analysis',
      timeout: 120000
    })
      .addFeatureStep('data-collection', 'Collect Data', 'data-collector', 'collect', { source: '{{dataSource}}' })
      .addParallelStep('parallel-analysis', 'Parallel Analysis', [
        { id: 'analyze-patterns', name: 'Pattern Analysis', type: WorkflowStepType.FEATURE, feature: 'pattern-analyzer', operation: 'analyze', params: { data: '{{data-collection.result}}' } },
        { id: 'analyze-trends', name: 'Trend Analysis', type: WorkflowStepType.FEATURE, feature: 'trend-analyzer', operation: 'analyze', params: { data: '{{data-collection.result}}' } },
        { id: 'analyze-anomalies', name: 'Anomaly Detection', type: WorkflowStepType.FEATURE, feature: 'anomaly-detector', operation: 'detect', params: { data: '{{data-collection.result}}' } }
      ])
      .addFeatureStep('synthesize-results', 'Synthesize Results', 'result-synthesizer', 'synthesize', {
        patterns: '{{analyze-patterns.result}}',
        trends: '{{analyze-trends.result}}',
        anomalies: '{{analyze-anomalies.result}}'
      })
      .addDependency('parallel-analysis', 'data-collection')
      .addDependency('synthesize-results', 'parallel-analysis')
  }
};

export { WorkflowBuilder, WORKFLOW_TEMPLATES }; 