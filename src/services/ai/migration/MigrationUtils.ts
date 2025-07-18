// Migration Utilities - Helper functions for transitioning to new AI service
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { AIInsight } from '../../../types/insights';
import { aiLogicExtractor } from './AILogicExtractor';
import { AIService, GlobalAIContext } from '../core/AIService';

export interface MigrationStatus {
  phase: 'preparation' | 'partial' | 'complete';
  componentsCompleted: string[];
  validationPassed: boolean;
  performanceComparison: {
    oldPerformance: number;
    newPerformance: number;
    improvement: number;
  };
  errors: string[];
}

export interface MigrationConfig {
  enableValidation: boolean;
  enablePerformanceComparison: boolean;
  enableGradualRollout: boolean;
  rolloutPercentage: number;
  fallbackOnError: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class MigrationUtils {
  private config: MigrationConfig;
  private legacyImplementations: any = null;
  private migrationStatus: MigrationStatus = {
    phase: 'preparation',
    componentsCompleted: [],
    validationPassed: false,
    performanceComparison: {
      oldPerformance: 0,
      newPerformance: 0,
      improvement: 0
    },
    errors: []
  };
  
  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      enableValidation: true,
      enablePerformanceComparison: true,
      enableGradualRollout: true,
      rolloutPercentage: 0,
      fallbackOnError: true,
      logLevel: 'info',
      ...config
    };
  }
  
  /**
   * Initialize migration process
   */
  async initializeMigration(): Promise<void> {
    try {
      // Extract legacy implementations
      this.legacyImplementations = await aiLogicExtractor.extractAllAILogic();
      
      // Validate extraction
      if (!this.legacyImplementations) {
        throw new Error('Failed to extract legacy AI implementations');
      }
      
      this.log('info', 'Legacy AI implementations extracted successfully');
      
      // Run validation tests
      if (this.config.enableValidation) {
        const validationPassed = await this.validateLegacyImplementations();
        this.migrationStatus.validationPassed = validationPassed;
        
        if (!validationPassed) {
          throw new Error('Legacy implementation validation failed');
        }
      }
      
      this.migrationStatus.phase = 'partial';
      this.log('info', 'Migration initialization complete');
      
    } catch (error) {
      this.log('error', `Migration initialization failed: ${error}`);
      this.migrationStatus.errors.push(`Initialization failed: ${error}`);
      throw error;
    }
  }
  
  /**
   * Migrate a specific component with validation
   */
  async migrateComponent(
    componentName: string,
    newService: AIService,
    testCases: any[]
  ): Promise<boolean> {
    try {
      this.log('info', `Starting migration of ${componentName}`);
      
      // Performance comparison
      let performanceComparison = null;
      if (this.config.enablePerformanceComparison) {
        performanceComparison = await this.comparePerformance(
          componentName,
          newService,
          testCases
        );
      }
      
      // Validation
      if (this.config.enableValidation) {
        const validationPassed = await this.validateComponent(
          componentName,
          newService,
          testCases
        );
        
        if (!validationPassed) {
          this.log('error', `${componentName} validation failed`);
          return false;
        }
      }
      
      // Mark component as completed
      this.migrationStatus.componentsCompleted.push(componentName);
      
      if (performanceComparison) {
        this.migrationStatus.performanceComparison = performanceComparison;
      }
      
      this.log('info', `${componentName} migration completed successfully`);
      return true;
      
    } catch (error) {
      this.log('error', `${componentName} migration failed: ${error}`);
      this.migrationStatus.errors.push(`${componentName} migration failed: ${error}`);
      return false;
    }
  }
  
  /**
   * Validate a component against legacy implementation
   */
  async validateComponent(
    componentName: string,
    newService: AIService,
    testCases: any[]
  ): Promise<boolean> {
    if (!this.legacyImplementations) {
      this.log('warn', 'No legacy implementations available for validation');
      return true;
    }
    
    const legacyComponent = this.legacyImplementations[componentName];
    if (!legacyComponent) {
      this.log('warn', `No legacy implementation found for ${componentName}`);
      return true;
    }
    
    let passedTests = 0;
    const totalTests = testCases.length;
    
    for (const testCase of testCases) {
      try {
        // Get legacy result
        const legacyResult = legacyComponent.implementation(...testCase.input);
        
        // Get new result
        const newResult = await this.getNewServiceResult(
          componentName,
          newService,
          testCase.input
        );
        
        // Compare results
        const isMatch = this.compareResults(legacyResult, newResult);
        
        if (isMatch) {
          passedTests++;
        } else {
          this.log('warn', `Test case failed for ${componentName}`, {
            input: testCase.input,
            expected: legacyResult,
            actual: newResult
          });
        }
        
      } catch (error) {
        this.log('error', `Test case error for ${componentName}: ${error}`);
      }
    }
    
    const passRate = passedTests / totalTests;
    const passed = passRate >= 0.9; // 90% pass rate required
    
    this.log('info', `${componentName} validation: ${passedTests}/${totalTests} tests passed (${(passRate * 100).toFixed(1)}%)`);
    
    return passed;
  }
  
  /**
   * Compare performance between old and new implementations
   */
  async comparePerformance(
    componentName: string,
    newService: AIService,
    testCases: any[]
  ): Promise<{
    oldPerformance: number;
    newPerformance: number;
    improvement: number;
  }> {
    const iterations = 100;
    const legacyComponent = this.legacyImplementations[componentName];
    
    if (!legacyComponent) {
      return {
        oldPerformance: 0,
        newPerformance: 0,
        improvement: 0
      };
    }
    
    // Measure legacy performance
    const legacyTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const testCase = testCases[i % testCases.length];
      const start = performance.now();
      
      try {
        legacyComponent.implementation(...testCase.input);
      } catch (error) {
        // Skip failed tests
      }
      
      const end = performance.now();
      legacyTimes.push(end - start);
    }
    
    // Measure new service performance
    const newTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const testCase = testCases[i % testCases.length];
      const start = performance.now();
      
      try {
        await this.getNewServiceResult(componentName, newService, testCase.input);
      } catch (error) {
        // Skip failed tests
      }
      
      const end = performance.now();
      newTimes.push(end - start);
    }
    
    const oldPerformance = this.calculateAverage(legacyTimes);
    const newPerformance = this.calculateAverage(newTimes);
    const improvement = ((oldPerformance - newPerformance) / oldPerformance) * 100;
    
    this.log('info', `Performance comparison for ${componentName}:`, {
      oldPerformance: `${oldPerformance.toFixed(2)}ms`,
      newPerformance: `${newPerformance.toFixed(2)}ms`,
      improvement: `${improvement.toFixed(1)}%`
    });
    
    return {
      oldPerformance,
      newPerformance,
      improvement
    };
  }
  
  /**
   * Get result from new service based on component type
   */
  private async getNewServiceResult(
    componentName: string,
    newService: AIService,
    input: any[]
  ): Promise<any> {
    switch (componentName) {
      case 'energyInsights':
        return newService.getEnergyInsights(input[0]);
      
      case 'sorenessInsights':
        return newService.getSorenessInsights(input[0]);
      
      case 'recommendationEngine':
        const analysis = await newService.analyze(input[0]);
        return {
          immediate: analysis.recommendations.filter(r => r.priority === 'critical').map(r => r.description),
          contextual: analysis.recommendations.filter(r => r.priority === 'high').map(r => r.description),
          learning: analysis.recommendations.filter(r => r.category === 'education').map(r => r.description),
          optimization: analysis.recommendations.filter(r => r.category === 'optimization').map(r => r.description)
        };
      
      default:
        throw new Error(`Unknown component: ${componentName}`);
    }
  }
  
  /**
   * Compare two results for equality
   */
  private compareResults(legacy: any, current: any): boolean {
    // Handle different result types
    if (Array.isArray(legacy) && Array.isArray(current)) {
      return this.compareArrays(legacy, current);
    }
    
    if (typeof legacy === 'object' && typeof current === 'object') {
      return this.compareObjects(legacy, current);
    }
    
    return legacy === current;
  }
  
  /**
   * Compare two arrays for equality
   */
  private compareArrays(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    
    for (let i = 0; i < arr1.length; i++) {
      if (!this.compareResults(arr1[i], arr2[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Compare two objects for equality
   */
  private compareObjects(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      
      if (!this.compareResults(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate legacy implementations
   */
  private async validateLegacyImplementations(): Promise<boolean> {
    try {
      // Test each component
      const components = ['energyInsights', 'sorenessInsights', 'recommendationEngine'];
      
      for (const component of components) {
        const legacyComponent = this.legacyImplementations[component];
        if (!legacyComponent) {
          this.log('warn', `No legacy implementation found for ${component}`);
          continue;
        }
        
        // Test with sample data
        const testCases = legacyComponent.testCases || [];
        if (testCases.length === 0) {
          this.log('warn', `No test cases found for ${component}`);
          continue;
        }
        
        // Run a few test cases
        let passed = 0;
        for (const testCase of testCases.slice(0, 3)) {
          try {
            const result = legacyComponent.implementation(...testCase.input);
            if (result !== undefined) {
              passed++;
            }
          } catch (error) {
            this.log('warn', `Legacy test failed for ${component}: ${error}`);
          }
        }
        
        if (passed === 0) {
          this.log('error', `All legacy tests failed for ${component}`);
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      this.log('error', `Legacy validation failed: ${error}`);
      return false;
    }
  }
  
  /**
   * Calculate average of array
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
  
  /**
   * Check if gradual rollout should use new service
   */
  shouldUseNewService(userId?: string): boolean {
    if (!this.config.enableGradualRollout) {
      return this.migrationStatus.phase === 'complete';
    }
    
    if (this.config.rolloutPercentage === 0) {
      return false;
    }
    
    if (this.config.rolloutPercentage >= 100) {
      return true;
    }
    
    // Use user ID for consistent rollout
    if (userId) {
      const hash = this.hashString(userId);
      return (hash % 100) < this.config.rolloutPercentage;
    }
    
    // Random rollout if no user ID
    return Math.random() * 100 < this.config.rolloutPercentage;
  }
  
  /**
   * Set rollout percentage
   */
  setRolloutPercentage(percentage: number): void {
    this.config.rolloutPercentage = Math.max(0, Math.min(100, percentage));
    this.log('info', `Rollout percentage set to ${this.config.rolloutPercentage}%`);
  }
  
  /**
   * Get migration status
   */
  getMigrationStatus(): MigrationStatus {
    return { ...this.migrationStatus };
  }
  
  /**
   * Get migration report
   */
  getMigrationReport(): {
    status: MigrationStatus;
    recommendations: string[];
    nextSteps: string[];
  } {
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    
    if (this.migrationStatus.errors.length > 0) {
      recommendations.push('Review and fix migration errors before proceeding');
    }
    
    if (this.migrationStatus.performanceComparison.improvement < 0) {
      recommendations.push('New implementation is slower - consider optimization');
    }
    
    if (this.migrationStatus.componentsCompleted.length === 0) {
      nextSteps.push('Start with energy insights migration');
    } else if (this.migrationStatus.phase === 'partial') {
      nextSteps.push('Continue with remaining components');
    } else {
      nextSteps.push('Increase rollout percentage gradually');
    }
    
    return {
      status: this.migrationStatus,
      recommendations,
      nextSteps
    };
  }
  
  /**
   * Create compatibility wrapper for legacy functions
   */
  createCompatibilityWrapper(newService: AIService): {
    generateEnergyInsights: (value: number) => AIInsight[];
    generateSorenessInsights: (value: number) => AIInsight[];
    aiRecommendationEngine: {
      generateRecommendations: (options: PerWorkoutOptions, userProfile: UserProfile) => any;
    };
  } {
    return {
      generateEnergyInsights: (value: number) => {
        console.warn('Using legacy compatibility wrapper for generateEnergyInsights');
        return newService.getEnergyInsights(value);
      },
      
      generateSorenessInsights: (value: number) => {
        console.warn('Using legacy compatibility wrapper for generateSorenessInsights');
        return newService.getSorenessInsights(value);
      },
      
      aiRecommendationEngine: {
        generateRecommendations: (options: PerWorkoutOptions, userProfile: UserProfile) => {
          console.warn('Using legacy compatibility wrapper for aiRecommendationEngine');
          
          // This would need to be implemented as a sync wrapper
          // For now, return empty recommendations
          return {
            immediate: [],
            contextual: [],
            learning: [],
            optimization: []
          };
        }
      }
    };
  }
  
  /**
   * Hash string for consistent rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Log message with level
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];
    
    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [AI Migration] [${level.toUpperCase()}] ${message}`;
      
      if (data) {
        console[level](logMessage, data);
      } else {
        console[level](logMessage);
      }
    }
  }
}

// Create singleton instance
export const migrationUtils = new MigrationUtils(); 