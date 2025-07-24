import { ParseStrategy, ParseResult } from './types/parsing.types';
import { DirectJSONStrategy } from './strategies/DirectJSONStrategy';
import { StringJSONStrategy } from './strategies/StringJSONStrategy';
import { MarkdownExtractorStrategy } from './strategies/MarkdownExtractorStrategy';
import { FallbackStrategy } from './strategies/FallbackStrategy';

/**
 * Main parser that orchestrates different parsing strategies
 */
export class ResponseParser {
  private strategies: ParseStrategy[] = [];

  constructor() {
    this.registerStrategies();
  }

  /**
   * Register parsing strategies in priority order
   */
  private registerStrategies(): void {
    this.strategies = [
      new DirectJSONStrategy(),
      new StringJSONStrategy(),
      new MarkdownExtractorStrategy(),
      new FallbackStrategy()
    ].sort((a, b) => b.getPriority() - a.getPriority());
  }

  /**
   * Parse AI response using the most appropriate strategy
   */
  async parse(response: unknown): Promise<ParseResult> {
    const startTime = Date.now();
    const issues: string[] = [];

    console.log('🔍 ResponseParser: Starting parsing with', this.strategies.length, 'strategies');

    for (const strategy of this.strategies) {
      if (strategy.canHandle(response)) {
        try {
          console.log('🎯 ResponseParser: Trying strategy:', strategy.constructor.name);
          
          const data = await strategy.parse(response);
          const processingTime = Date.now() - startTime;

          console.log('✅ ResponseParser: Successfully parsed with', strategy.constructor.name);
          
          return {
            success: true,
            data,
            strategy: strategy.constructor.name,
            issues,
            processingTime,
            metrics: {
              contentLength: typeof response === 'string' ? response.length : undefined,
              validationScore: 100 // Base score, will be adjusted by validation layer
            }
          };
        } catch (error) {
          const errorMsg = `${strategy.constructor.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          issues.push(errorMsg);
          console.log('❌ ResponseParser:', errorMsg);
        }
      }
    }

    throw new Error(`All parsing strategies failed. Issues: ${issues.join(', ')}`);
  }
} 