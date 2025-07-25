import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout } from '../../../types/external-ai.types';
import { DirectJSONStrategy } from './DirectJSONStrategy';

/**
 * Strategy for handling markdown-formatted responses
 */
export class MarkdownExtractorStrategy implements ParseStrategy {
  private directStrategy: DirectJSONStrategy;

  constructor() {
    this.directStrategy = new DirectJSONStrategy();
  }

  canHandle(response: unknown): boolean {
    return typeof response === 'string' && 
           (response.includes('```json') || response.includes('```'));
  }

  async parse(response: unknown): Promise<GeneratedWorkout> {
    const content = response as string;
    console.log('🔍 MarkdownExtractorStrategy: Extracting from markdown');

    // Try JSON code blocks first
    const jsonBlock = this.extractJsonCodeBlock(content);
    if (jsonBlock) {
      try {
        const parsed = JSON.parse(jsonBlock);
        return await this.directStrategy.parse(parsed);
      } catch (error) {
        console.log('❌ MarkdownExtractorStrategy: JSON block parsing failed, trying generic blocks');
      }
    }

    // Try generic code blocks
    const codeBlock = this.extractGenericCodeBlock(content);
    if (codeBlock) {
      try {
        const parsed = JSON.parse(codeBlock);
        return await this.directStrategy.parse(parsed);
      } catch (error) {
        console.log('❌ MarkdownExtractorStrategy: Generic block parsing failed');
      }
    }

    throw new Error('No valid JSON found in markdown code blocks');
  }

  private extractJsonCodeBlock(content: string): string | null {
    const matches = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (matches && matches[1]) {
      console.log('✅ MarkdownExtractorStrategy: Found JSON code block');
      return matches[1].trim();
    }
    return null;
  }

  private extractGenericCodeBlock(content: string): string | null {
    const matches = content.match(/```\s*\n([\s\S]*?)\n```/);
    if (matches && matches[1]) {
      console.log('✅ MarkdownExtractorStrategy: Found generic code block');
      return matches[1].trim();
    }
    return null;
  }

  getPriority(): number {
    return 80; // Medium priority
  }
} 