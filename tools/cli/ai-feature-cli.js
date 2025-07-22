#!/usr/bin/env node

// AI Feature CLI - Developer Experience Tool
// Provides feature generation, workflow management, and debugging utilities

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// CLI Colors for better output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

class AIFeatureCLI {
  constructor() {
    this.version = '1.0.0';
    this.basePath = process.cwd();
  }

  // Main CLI entry point
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const command = args[0];
    const subCommand = args[1];

    try {
      switch (command) {
        case 'generate':
        case 'g':
          await this.handleGenerate(subCommand, args.slice(2));
          break;
        case 'workflow':
        case 'w':
          await this.handleWorkflow(subCommand, args.slice(2));
          break;
        case 'debug':
        case 'd':
          await this.handleDebug(subCommand, args.slice(2));
          break;
        case 'validate':
        case 'v':
          await this.handleValidate(subCommand, args.slice(2));
          break;
        case 'health':
        case 'h':
          await this.handleHealth(subCommand, args.slice(2));
          break;
        case 'docs':
          await this.handleDocs(subCommand, args.slice(2));
          break;
        case '--version':
        case 'version':
          this.showVersion();
          break;
        case '--help':
        case 'help':
          this.showHelp();
          break;
        default:
          this.log(`Unknown command: ${command}`, 'red');
          this.showHelp();
      }
    } catch (error) {
      this.log(`Error: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  // Feature Generation Commands
  async handleGenerate(subCommand, args) {
    switch (subCommand) {
      case 'feature':
        await this.generateFeature(args);
        break;
      case 'workflow':
        await this.generateWorkflow(args);
        break;
      case 'template':
        await this.generateTemplate(args);
        break;
      default:
        this.log('Available generate commands:', 'cyan');
        this.log('  feature <name>     Generate a new feature');
        this.log('  workflow <name>    Generate a workflow template');
        this.log('  template <type>    Generate code templates');
    }
  }

  // Generate New Feature
  async generateFeature(args) {
    const featureName = args[0];
    
    if (!featureName) {
      this.log('Please provide a feature name', 'red');
      this.log('Usage: ai-feature generate feature <feature-name>', 'yellow');
      return;
    }

    this.log(`🚀 Generating feature: ${featureName}`, 'green');

    const featureDir = this.getFeatureDir(featureName);
    
    // Check if feature already exists
    if (fs.existsSync(featureDir)) {
      this.log(`Feature '${featureName}' already exists!`, 'red');
      return;
    }

    // Create feature directory structure
    this.createFeatureStructure(featureName, featureDir);
    
    // Generate feature files
    await this.generateFeatureFiles(featureName, featureDir);
    
    // Generate tests
    await this.generateFeatureTests(featureName, featureDir);
    
    this.log(`✅ Feature '${featureName}' generated successfully!`, 'green');
    this.log(`📁 Location: ${featureDir}`, 'blue');
    this.log(`🎯 Next steps:`, 'cyan');
    this.log(`   1. Implement feature logic in ${featureName}Feature.ts`);
    this.log(`   2. Update workflow components in workflow/ directory`);
    this.log(`   3. Run tests: npm test ${featureName}`);
    this.log(`   4. Register feature in your application`);
  }

  createFeatureStructure(featureName, featureDir) {
    const dirs = [
      featureDir,
      path.join(featureDir, 'workflow'),
      path.join(featureDir, 'prompts'),
      path.join(featureDir, 'types'),
      path.join(featureDir, 'helpers'),
      path.join(featureDir, 'constants'),
      path.join(featureDir, '__tests__', 'unit'),
      path.join(featureDir, '__tests__', 'integration')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateFeatureFiles(featureName, featureDir) {
    const className = this.toPascalCase(featureName);
    
    // Main feature file
    const featureTemplate = this.getFeatureTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, `${className}Feature.ts`), featureTemplate);

    // Workflow files
    const workflowFiles = {
      'DataProcessor.ts': this.getDataProcessorTemplate(className),
      'PromptSelector.ts': this.getPromptSelectorTemplate(className),
      'ResponseValidator.ts': this.getResponseValidatorTemplate(className)
    };

    Object.entries(workflowFiles).forEach(([filename, content]) => {
      fs.writeFileSync(path.join(featureDir, 'workflow', filename), content);
    });

    // Types file
    const typesTemplate = this.getTypesTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, 'types', `${featureName}.types.ts`), typesTemplate);

    // Constants file
    const constantsTemplate = this.getConstantsTemplate(featureName);
    fs.writeFileSync(path.join(featureDir, 'constants', `${featureName}.constants.ts`), constantsTemplate);

    // Index file
    const indexTemplate = this.getIndexTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, 'index.ts'), indexTemplate);

    // README
    const readmeTemplate = this.getFeatureReadmeTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, 'README.md'), readmeTemplate);
  }

  async generateFeatureTests(featureName, featureDir) {
    const className = this.toPascalCase(featureName);
    
    // Unit tests
    const unitTestTemplate = this.getUnitTestTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, '__tests__', 'unit', `${className}Feature.test.ts`), unitTestTemplate);

    // Integration tests
    const integrationTestTemplate = this.getIntegrationTestTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, '__tests__', 'integration', `${className}Integration.test.ts`), integrationTestTemplate);

    // Workflow tests
    const workflowTestTemplate = this.getWorkflowTestTemplate(featureName, className);
    fs.writeFileSync(path.join(featureDir, '__tests__', 'workflow.test.ts'), workflowTestTemplate);
  }

  // Workflow Management Commands
  async handleWorkflow(subCommand, args) {
    switch (subCommand) {
      case 'create':
        await this.createWorkflow(args);
        break;
      case 'validate':
        await this.validateWorkflow(args);
        break;
      case 'test':
        await this.testWorkflow(args);
        break;
      case 'optimize':
        await this.optimizeWorkflow(args);
        break;
      case 'list':
        await this.listWorkflows();
        break;
      default:
        this.log('Available workflow commands:', 'cyan');
        this.log('  create <name>      Create a new workflow');
        this.log('  validate <name>    Validate workflow configuration');
        this.log('  test <name>        Test workflow execution');
        this.log('  optimize <name>    Optimize workflow performance');
        this.log('  list               List available workflows');
    }
  }

  async createWorkflow(args) {
    const workflowName = args[0];
    
    if (!workflowName) {
      this.log('Please provide a workflow name', 'red');
      return;
    }

    this.log(`🔄 Creating workflow: ${workflowName}`, 'green');

    const workflowsDir = path.join(this.basePath, 'src', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    const workflowFile = path.join(workflowsDir, `${workflowName}.workflow.ts`);
    
    if (fs.existsSync(workflowFile)) {
      this.log(`Workflow '${workflowName}' already exists!`, 'red');
      return;
    }

    const workflowTemplate = this.getWorkflowTemplate(workflowName);
    fs.writeFileSync(workflowFile, workflowTemplate);

    this.log(`✅ Workflow '${workflowName}' created successfully!`, 'green');
    this.log(`📁 Location: ${workflowFile}`, 'blue');
  }

  // Debug Commands
  async handleDebug(subCommand, args) {
    switch (subCommand) {
      case 'feature':
        await this.debugFeature(args);
        break;
      case 'workflow':
        await this.debugWorkflow(args);
        break;
      case 'performance':
        await this.debugPerformance(args);
        break;
      case 'cache':
        await this.debugCache(args);
        break;
      default:
        this.log('Available debug commands:', 'cyan');
        this.log('  feature <name>     Debug a specific feature');
        this.log('  workflow <name>    Debug workflow execution');
        this.log('  performance        Show performance metrics');
        this.log('  cache              Show cache statistics');
    }
  }

  async debugFeature(args) {
    const featureName = args[0];
    
    if (!featureName) {
      this.log('Please specify a feature name', 'red');
      return;
    }

    this.log(`🔍 Debugging feature: ${featureName}`, 'blue');

    // Check if feature exists
    const featureDir = this.getFeatureDir(featureName);
    if (!fs.existsSync(featureDir)) {
      this.log(`Feature '${featureName}' not found!`, 'red');
      return;
    }

    // Generate debug report
    const debugInfo = await this.generateFeatureDebugInfo(featureName, featureDir);
    
    this.log('📊 Feature Debug Report:', 'cyan');
    this.log(`   Structure: ${debugInfo.structure ? '✅' : '❌'}`);
    this.log(`   Types: ${debugInfo.types ? '✅' : '❌'}`);
    this.log(`   Tests: ${debugInfo.tests ? '✅' : '❌'}`);
    this.log(`   Dependencies: ${debugInfo.dependencies ? '✅' : '❌'}`);

    if (debugInfo.issues.length > 0) {
      this.log('⚠️  Issues found:', 'yellow');
      debugInfo.issues.forEach(issue => {
        this.log(`   • ${issue}`, 'red');
      });
    }
  }

  // Health Check Commands
  async handleHealth(subCommand, args) {
    switch (subCommand) {
      case 'check':
        await this.healthCheck();
        break;
      case 'features':
        await this.checkFeatureHealth();
        break;
      case 'system':
        await this.checkSystemHealth();
        break;
      default:
        await this.healthCheck();
    }
  }

  async healthCheck() {
    this.log('🏥 AI Service Health Check', 'green');
    this.log('=' .repeat(40), 'blue');

    const checks = [
      { name: 'Project Structure', check: () => this.checkProjectStructure() },
      { name: 'Dependencies', check: () => this.checkDependencies() },
      { name: 'Features', check: () => this.checkFeatures() },
      { name: 'Configuration', check: () => this.checkConfiguration() },
      { name: 'Tests', check: () => this.checkTests() }
    ];

    const results = [];
    
    for (const check of checks) {
      try {
        const result = await check.check();
        results.push({ name: check.name, status: result ? 'PASS' : 'FAIL', details: result });
        this.log(`${check.name}: ${result ? '✅ PASS' : '❌ FAIL'}`, result ? 'green' : 'red');
      } catch (error) {
        results.push({ name: check.name, status: 'ERROR', error: error.message });
        this.log(`${check.name}: ❌ ERROR - ${error.message}`, 'red');
      }
    }

    const passCount = results.filter(r => r.status === 'PASS').length;
    this.log(`\n📊 Health Score: ${passCount}/${results.length}`, 'cyan');
    
    if (passCount === results.length) {
      this.log('🎉 All systems healthy!', 'green');
    } else {
      this.log('⚠️  Some issues detected. Run individual checks for details.', 'yellow');
    }
  }

  // Documentation Commands
  async handleDocs(subCommand, args) {
    switch (subCommand) {
      case 'generate':
        await this.generateDocs();
        break;
      case 'serve':
        await this.serveDocs();
        break;
      case 'update':
        await this.updateDocs();
        break;
      default:
        this.log('Available docs commands:', 'cyan');
        this.log('  generate           Generate API documentation');
        this.log('  serve              Serve documentation locally');
        this.log('  update             Update existing documentation');
    }
  }

  // Utility Methods
  getFeatureDir(featureName) {
    return path.join(this.basePath, 'src', 'services', 'ai', 'external', 'features', featureName);
  }

  toPascalCase(str) {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  showVersion() {
    this.log(`AI Feature CLI v${this.version}`, 'green');
  }

  showHelp() {
    this.log('AI Feature CLI - Developer Experience Tool', 'green');
    this.log('=' .repeat(40), 'blue');
    this.log('');
    this.log('Usage:', 'cyan');
    this.log('  ai-feature <command> [options]', 'white');
    this.log('');
    this.log('Commands:', 'cyan');
    this.log('  generate, g        Generate features, workflows, templates');
    this.log('  workflow, w        Workflow management commands');
    this.log('  debug, d           Debug features and workflows');
    this.log('  validate, v        Validate configurations');
    this.log('  health, h          Health check commands');
    this.log('  docs               Documentation commands');
    this.log('  version            Show version information');
    this.log('  help               Show this help message');
    this.log('');
    this.log('Examples:', 'yellow');
    this.log('  ai-feature generate feature user-analysis');
    this.log('  ai-feature workflow create comprehensive-workout');
    this.log('  ai-feature debug feature quick-workout-setup');
    this.log('  ai-feature health check');
    this.log('');
    this.log('For more information, visit the documentation.', 'blue');
  }

  // Template Methods
  getFeatureTemplate(featureName, className) {
    return `// ${className} Feature - AI-powered ${featureName} functionality
// Generated by AI Feature CLI v${this.version}

import { OpenAIService } from '../../shared/core';
import { 
  ${className}Params, 
  ${className}Result, 
  ${className}Metadata,
  FeatureCapabilities,
  FeatureHealthStatus,
  FeatureMetrics
} from './types/${featureName}.types';
import { DataProcessor } from './workflow/DataProcessor';
import { PromptSelector } from './workflow/PromptSelector';
import { ResponseValidator } from './workflow/ResponseValidator';
import { ${featureName.toUpperCase()}_CONSTANTS } from './constants/${featureName}.constants';

/**
 * Dependencies for ${className}Feature
 */
export interface ${className}FeatureDependencies {
  openAIService: OpenAIService;
  dataProcessor?: DataProcessor;
  promptSelector?: PromptSelector;
  responseValidator?: ResponseValidator;
}

/**
 * ${className}Feature - Main orchestrator for ${featureName} functionality
 */
export class ${className}Feature {
  private openAIService: OpenAIService;
  private dataProcessor: DataProcessor;
  private promptSelector: PromptSelector;
  private responseValidator: ResponseValidator;
  private metrics: FeatureMetrics;

  constructor(dependencies: ${className}FeatureDependencies) {
    this.openAIService = dependencies.openAIService;
    this.dataProcessor = dependencies.dataProcessor ?? new DataProcessor();
    this.promptSelector = dependencies.promptSelector ?? new PromptSelector();
    this.responseValidator = dependencies.responseValidator ?? new ResponseValidator();
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0
    };
  }

  /**
   * Main feature operation - process ${featureName} request
   */
  async process(params: ${className}Params): Promise<${className}Result> {
    const startTime = Date.now();
    
    try {
      // 1. Process and validate input data
      const processedData = await this.dataProcessor.process(params);
      
      // 2. Select appropriate prompt
      const prompt = await this.promptSelector.selectPrompt(processedData);
      
      // 3. Generate AI response
      const aiResponse = await this.openAIService.generateCompletion(prompt);
      
      // 4. Validate and process response
      const validatedResult = await this.responseValidator.validate(aiResponse, processedData);
      
      // 5. Build result
      const result: ${className}Result = {
        data: validatedResult,
        metadata: this.buildMetadata(params, startTime),
        processingTime: Date.now() - startTime,
        cacheHit: false // TODO: Implement caching
      };
      
      this.updateMetrics(true, Date.now() - startTime);
      return result;
      
    } catch (error) {
      this.updateMetrics(false, Date.now() - startTime);
      throw new Error(\`${className} processing failed: \${error.message}\`);
    }
  }

  /**
   * Get feature capabilities
   */
  getCapabilities(): FeatureCapabilities {
    return {
      name: '${className}',
      version: '1.0.0',
      description: 'AI-powered ${featureName} functionality',
      capabilities: [
        '${featureName}-processing',
        'data-validation',
        'ai-integration'
      ],
      supportedOperations: ['process'],
      maxConcurrentRequests: 10
    };
  }

  /**
   * Get feature health status
   */
  async getHealthStatus(): Promise<FeatureHealthStatus> {
    try {
      // Perform health checks
      const aiServiceHealthy = await this.openAIService.healthCheck();
      const dataProcessorHealthy = await this.dataProcessor.healthCheck();
      
      return {
        healthy: aiServiceHealthy && dataProcessorHealthy,
        lastCheck: new Date(),
        responseTime: this.metrics.averageResponseTime,
        details: {
          aiServiceConnected: aiServiceHealthy,
          dataProcessorWorking: dataProcessorHealthy,
          dependenciesHealthy: true
        },
        issues: []
      };
    } catch (error) {
      return {
        healthy: false,
        lastCheck: new Date(),
        responseTime: -1,
        details: { error: error.message },
        issues: ['Health check failed']
      };
    }
  }

  /**
   * Get feature metrics
   */
  getMetrics(): FeatureMetrics {
    return { ...this.metrics };
  }

  private buildMetadata(params: ${className}Params, startTime: number): ${className}Metadata {
    return {
      processedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
      version: '1.0.0',
      parameters: params
    };
  }

  private updateMetrics(success: boolean, responseTime: number): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }
}
`;
  }

  getTypesTemplate(featureName, className) {
    return `// ${className} Feature Types
// Generated by AI Feature CLI v${this.version}

export interface ${className}Params {
  // TODO: Define input parameters for ${featureName}
  data: any;
  options?: ${className}Options;
}

export interface ${className}Options {
  // TODO: Define optional parameters
  timeout?: number;
  retries?: number;
}

export interface ${className}Result {
  data: any; // TODO: Define result data structure
  metadata: ${className}Metadata;
  processingTime: number;
  cacheHit: boolean;
}

export interface ${className}Metadata {
  processedAt: Date;
  processingTimeMs: number;
  version: string;
  parameters: ${className}Params;
}

export interface FeatureCapabilities {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  supportedOperations: string[];
  maxConcurrentRequests: number;
}

export interface FeatureHealthStatus {
  healthy: boolean;
  lastCheck: Date;
  responseTime: number;
  details: Record<string, any>;
  issues: string[];
}

export interface FeatureMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHits: number;
}

// Validation functions
export function is${className}Params(obj: any): obj is ${className}Params {
  return obj && typeof obj === 'object' && 'data' in obj;
}
`;
  }

  getConstantsTemplate(featureName) {
    return `// ${this.toPascalCase(featureName)} Feature Constants
// Generated by AI Feature CLI v${this.version}

export const ${featureName.toUpperCase()}_CONSTANTS = {
  // Feature configuration
  FEATURE_NAME: '${featureName}',
  VERSION: '1.0.0',
  
  // Timeouts and limits
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  MAX_CONCURRENT_REQUESTS: 10,
  
  // Prompt configuration
  DEFAULT_PROMPT_TEMPLATE: 'default-${featureName}',
  MAX_PROMPT_LENGTH: 4000,
  
  // Response configuration
  MAX_RESPONSE_LENGTH: 8000,
  RESPONSE_FORMAT: 'json',
  
  // Error messages
  ERRORS: {
    INVALID_PARAMS: 'Invalid ${featureName} parameters',
    PROCESSING_FAILED: '${this.toPascalCase(featureName)} processing failed',
    TIMEOUT: '${this.toPascalCase(featureName)} request timed out',
    AI_SERVICE_ERROR: 'AI service error during ${featureName} processing'
  }
} as const;

export type ${this.toPascalCase(featureName)}ErrorType = keyof typeof ${featureName.toUpperCase()}_CONSTANTS.ERRORS;
`;
  }

  getIndexTemplate(featureName, className) {
    return `// ${className} Feature - Public API
// Generated by AI Feature CLI v${this.version}

export { ${className}Feature } from './${className}Feature';
export type {
  ${className}Params,
  ${className}Result,
  ${className}Options,
  ${className}Metadata,
  FeatureCapabilities,
  FeatureHealthStatus,
  FeatureMetrics
} from './types/${featureName}.types';
export { ${featureName.toUpperCase()}_CONSTANTS } from './constants/${featureName}.constants';

// Workflow components
export { DataProcessor } from './workflow/DataProcessor';
export { PromptSelector } from './workflow/PromptSelector';
export { ResponseValidator } from './workflow/ResponseValidator';
`;
  }
}

// Export for module usage
module.exports = { AIFeatureCLI };

// CLI execution
if (require.main === module) {
  const cli = new AIFeatureCLI();
  cli.run().catch(error => {
    console.error('CLI Error:', error.message);
    process.exit(1);
  });
} 