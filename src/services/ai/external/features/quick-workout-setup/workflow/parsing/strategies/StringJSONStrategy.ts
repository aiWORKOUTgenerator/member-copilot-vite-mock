import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout } from '../../../../../../../types/external-ai.types';
import { DirectJSONStrategy } from './DirectJSONStrategy';

/**
 * Strategy for handling string responses that contain JSON
 */
export class StringJSONStrategy implements ParseStrategy {
  private directStrategy: DirectJSONStrategy;

  constructor() {
    this.directStrategy = new DirectJSONStrategy();
  }

  canHandle(response: unknown): boolean {
    return typeof response === 'string' && response.trim().length > 0;
  }

  async parse(response: unknown): Promise<GeneratedWorkout> {
    const content = response as string;
    console.log('🔍 StringJSONStrategy: Processing string response', content.length, 'chars');

    // Try direct JSON parse first
    try {
      const parsed = JSON.parse(content);
      // Use DirectJSONStrategy to validate and normalize the parsed object
      return await this.directStrategy.parse(parsed);
    } catch (error) {
      console.log('🔄 StringJSONStrategy: Direct parse failed, trying extraction');
      return await this.extractJSONFromString(content);
    }
  }

  private async extractJSONFromString(content: string): Promise<GeneratedWorkout> {
    // Find JSON boundaries
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('No valid JSON structure found in string');
    }

    // Log potential truncation
    if (lastBrace < content.length - 1) {
      console.log('⚠️ StringJSONStrategy: Potential truncation detected', {
        contentLength: content.length,
        lastBracePosition: lastBrace,
        remainingChars: content.length - lastBrace - 1
      });
    }

    const jsonString = content.slice(firstBrace, lastBrace + 1);
    
    try {
      const parsed = JSON.parse(jsonString);
      // Use DirectJSONStrategy to validate and normalize the parsed object
      return await this.directStrategy.parse(parsed);
    } catch (error) {
      // Try cleaning the string if initial parse fails
      return await this.tryCleanAndParse(jsonString);
    }
  }

  private async tryCleanAndParse(jsonString: string): Promise<GeneratedWorkout> {
    // Remove common issues that might cause parsing failures
    const cleaned = jsonString
      .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/"\s*([{[])/g, '"$1') // Remove spaces after quotes before objects/arrays
      .replace(/([}\]])\s*"/g, '$1"') // Remove spaces before quotes after objects/arrays
      .replace(/([}\]])\s*,\s*"/g, '$1,"') // Normalize spaces around commas
      .replace(/"\s*:\s*"/g, '":"') // Normalize spaces around colons
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      // Use DirectJSONStrategy to validate and normalize the parsed object
      return await this.directStrategy.parse(parsed);
    } catch (error) {
      throw new Error(`JSON extraction failed after cleaning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPriority(): number {
    return 90; // High priority but below direct object
  }
} 