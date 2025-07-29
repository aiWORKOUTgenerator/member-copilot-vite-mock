import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout } from '../../../../../types/external-ai.types';
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
        const parsed = await this.parseWithCleaning(jsonBlock);
        return await this.directStrategy.parse(parsed);
      } catch (error) {
        console.log('❌ MarkdownExtractorStrategy: JSON block parsing failed, trying generic blocks');
      }
    }

    // Try generic code blocks
    const codeBlock = this.extractGenericCodeBlock(content);
    if (codeBlock) {
      try {
        const parsed = await this.parseWithCleaning(codeBlock);
        return await this.directStrategy.parse(parsed);
      } catch (error) {
        console.log('❌ MarkdownExtractorStrategy: Generic block parsing failed');
      }
    }

    throw new Error('No valid JSON found in markdown code blocks');
  }

  private async parseWithCleaning(jsonString: string): Promise<any> {
    // Enhanced cleaning logic to handle more edge cases
    let cleaned = jsonString
      // Handle escaped characters
      .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
      .replace(/\\t/g, ' ') // Replace escaped tabs with spaces
      .replace(/\\r/g, ' ') // Replace escaped carriage returns with spaces
      
      // Handle unescaped quotes in string values
      .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
        // Only apply this if we're not dealing with a valid JSON property pattern like "key": "value"
        if (p2.trim().startsWith(':')) {
          // This is a valid JSON property, don't modify it
          return match;
        }
        // If we have multiple quotes, escape the inner ones
        return `"${p1}${p2.replace(/"/g, '\\"')}${p3}"`;
      })
      
      // Handle single quotes that should be double quotes
      .replace(/([{,]\s*)'([^']*)'(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*)'(\s*[,}])/g, ':"$1"$2')
      
      // Normalize whitespace (but preserve colons)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/"\s*([{[])/g, '"$1') // Remove spaces after quotes before objects/arrays
      .replace(/([}\]])\s*"/g, '$1"') // Remove spaces before quotes after objects/arrays
      .replace(/([}\]])\s*,\s*"/g, '$1,"') // Normalize spaces around commas
      // Don't normalize colons in property names - this was causing the issue
      // .replace(/"\s*:\s*"/g, '":"') // Normalize spaces around colons in string values only
      
      // Handle trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      
      // Handle missing quotes around property names
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      
      // Handle special characters that might break JSON
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      
      .trim();

    // Try multiple parsing attempts with different cleaning strategies
    const parsingAttempts = [
      () => JSON.parse(cleaned),
      () => JSON.parse(cleaned.replace(/,\s*}/g, '}').replace(/,\s*]}/g, ']')), // Remove trailing commas
      () => JSON.parse(cleaned.replace(/\\/g, '\\\\')), // Escape backslashes
      () => JSON.parse(cleaned.replace(/"/g, '\\"').replace(/\\"/g, '"')), // Fix quote escaping
      // New attempt: Fix missing colons after property names
      () => JSON.parse(cleaned.replace(/"([^"]+)"\s*([^":,}\]]+)/g, '"$1": $2')),
      // New attempt: Fix property names without quotes
      () => JSON.parse(cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*([^":,}\]]+)/g, '$1"$2": $3')),
      // New attempt: Fix the specific issue with missing colons after quoted property names
      () => JSON.parse(cleaned.replace(/"([^"]+)"\s+([^":,}\]]+)/g, '"$1": $2')),
      // New attempt: Fix unescaped quotes in string values
      () => JSON.parse(cleaned.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
        return `"${p1}${p2.replace(/"/g, '\\"')}${p3}"`;
      })),
    ];

    for (let i = 0; i < parsingAttempts.length; i++) {
      try {
        const parsed = parsingAttempts[i]();
        console.log(`✅ MarkdownExtractorStrategy: Successfully parsed with cleaning attempt ${i + 1}`);
        return parsed;
      } catch (error) {
        if (i === parsingAttempts.length - 1) {
          // Last attempt failed, analyze the error
          this.analyzeJsonError(cleaned, error);
          console.log('❌ MarkdownExtractorStrategy: All cleaning attempts failed');
          console.log('🔍 MarkdownExtractorStrategy: Failed JSON preview:', cleaned.substring(0, 100) + '...');
          throw new Error(`JSON parsing failed after cleaning: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    throw new Error('JSON parsing failed after all cleaning attempts');
  }

  private analyzeJsonError(jsonString: string, error: unknown): void {
    if (error instanceof Error && error.message.includes('position')) {
      const positionMatch = error.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const contextStart = Math.max(0, position - 50);
        const contextEnd = Math.min(jsonString.length, position + 50);
        const context = jsonString.substring(contextStart, contextEnd);
        
        console.log('🔍 MarkdownExtractorStrategy: JSON Error Analysis');
        console.log('📍 Error position:', position);
        console.log('📍 Context around error:', context);
        console.log('📍 Character at position:', jsonString[position]);
        console.log('📍 Previous 10 chars:', jsonString.substring(Math.max(0, position - 10), position));
        console.log('📍 Next 10 chars:', jsonString.substring(position + 1, position + 11));
      }
    }
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