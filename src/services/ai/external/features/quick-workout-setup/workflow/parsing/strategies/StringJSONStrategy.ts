import { ParseStrategy } from '../types/parsing.types';
import { GeneratedWorkout } from '../../../types/external-ai.types';
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
      const remainingChars = content.length - lastBrace - 1;
      console.log('⚠️ StringJSONStrategy: Potential truncation detected', {
        contentLength: content.length,
        lastBracePosition: lastBrace,
        remainingChars,
        truncationPercentage: Math.round((remainingChars / content.length) * 100)
      });
      
      // If significant truncation, try to complete the JSON structure
      if (remainingChars > 50) {
        console.log('🔄 StringJSONStrategy: Attempting to complete truncated JSON');
        return await this.tryCompleteTruncatedJSON(jsonString, content);
      }
    }

    const jsonString = content.slice(firstBrace, lastBrace + 1);
    
    // Debug: Log the extracted JSON string
    console.log('🔍 StringJSONStrategy: Extracted JSON string:', jsonString.substring(0, 200) + '...');
    
    try {
      const parsed = JSON.parse(jsonString);
      // Use DirectJSONStrategy to validate and normalize the parsed object
      return await this.directStrategy.parse(parsed);
    } catch (error) {
      console.log('🔄 StringJSONStrategy: Initial JSON parse failed, trying cleaning');
      // Try cleaning the string if initial parse fails
      return await this.tryCleanAndParse(jsonString);
    }
  }

  private async tryCleanAndParse(jsonString: string): Promise<GeneratedWorkout> {
    console.log('🔍 StringJSONStrategy: Starting cleaning process');
    console.log('🔍 StringJSONStrategy: Original JSON string:', jsonString.substring(0, 100) + '...');
    
    // Enhanced cleaning logic to handle more edge cases
    let cleaned = jsonString;
    
    console.log('🔍 StringJSONStrategy: Step 0 - Original:', cleaned.substring(0, 50) + '...');
    
    // Handle escaped characters
    cleaned = cleaned
      .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
      .replace(/\\t/g, ' ') // Replace escaped tabs with spaces
      .replace(/\\r/g, ' ') // Replace escaped carriage returns with spaces;
    
    console.log('🔍 StringJSONStrategy: Step 1 - After escaped chars:', cleaned.substring(0, 50) + '...');
    
    // Handle unescaped quotes in string values
    cleaned = cleaned.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
      // Only apply this if we're not dealing with a valid JSON property pattern like "key": "value"
      if (p2.trim().startsWith(':')) {
        // This is a valid JSON property, don't modify it
        return match;
      }
      // If we have multiple quotes, escape the inner ones
      return `"${p1}${p2.replace(/"/g, '\\"')}${p3}"`;
    });
    
    console.log('🔍 StringJSONStrategy: Step 2 - After quote handling:', cleaned.substring(0, 50) + '...');
    
    // Handle single quotes that should be double quotes
    cleaned = cleaned
      .replace(/([{,]\s*)'([^']*)'(\s*:)/g, '$1"$2"$3')
      .replace(/:\s*'([^']*)'(\s*[,}])/g, ':"$1"$2');
    
    console.log('🔍 StringJSONStrategy: Step 3 - After single quote handling:', cleaned.substring(0, 50) + '...');
    
    // Normalize whitespace (but preserve colons)
    cleaned = cleaned
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/"\s*([{[])/g, '"$1') // Remove spaces after quotes before objects/arrays
      .replace(/([}\]])\s*"/g, '$1"') // Remove spaces before quotes after objects/arrays
      .replace(/([}\]])\s*,\s*"/g, '$1,"'); // Normalize spaces around commas
    
    console.log('🔍 StringJSONStrategy: Step 4 - After whitespace normalization:', cleaned.substring(0, 50) + '...');
    
    // Handle trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('🔍 StringJSONStrategy: Step 5 - After trailing comma handling:', cleaned.substring(0, 50) + '...');
    
    // Handle missing quotes around property names
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    console.log('🔍 StringJSONStrategy: Step 6 - After property name handling:', cleaned.substring(0, 50) + '...');
    
    // Handle special characters that might break JSON
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
    
    console.log('🔍 StringJSONStrategy: Step 7 - After control char handling:', cleaned.substring(0, 50) + '...');
    
    cleaned = cleaned.trim();
    
    console.log('🔍 StringJSONStrategy: Step 8 - After trim:', cleaned.substring(0, 50) + '...');

    // Try multiple parsing attempts with different cleaning strategies
    const parsingAttempts = [
      () => JSON.parse(cleaned),
      () => JSON.parse(cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')), // Remove trailing commas
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
        console.log(`🔄 StringJSONStrategy: Trying cleaning attempt ${i + 1}`);
        const parsed = parsingAttempts[i]();
        console.log(`✅ StringJSONStrategy: Successfully parsed with cleaning attempt ${i + 1}`);
        // Use DirectJSONStrategy to validate and normalize the parsed object
        return await this.directStrategy.parse(parsed);
      } catch (error) {
        console.log(`❌ StringJSONStrategy: Cleaning attempt ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        if (i === parsingAttempts.length - 1) {
          // Last attempt failed, analyze the error
          this.analyzeJsonError(cleaned, error);
          console.log('❌ StringJSONStrategy: All cleaning attempts failed');
          console.log('🔍 StringJSONStrategy: Failed JSON preview:', cleaned.substring(0, 100) + '...');
          throw new Error(`JSON extraction failed after cleaning: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    throw new Error('JSON extraction failed after all cleaning attempts');
  }

  private analyzeJsonError(jsonString: string, error: unknown): void {
    if (error instanceof Error && error.message.includes('position')) {
      const positionMatch = error.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const contextStart = Math.max(0, position - 50);
        const contextEnd = Math.min(jsonString.length, position + 50);
        const context = jsonString.substring(contextStart, contextEnd);
        
        console.log('🔍 StringJSONStrategy: JSON Error Analysis');
        console.log('📍 Error position:', position);
        console.log('📍 Context around error:', context);
        console.log('📍 Character at position:', jsonString[position]);
        console.log('📍 Previous 10 chars:', jsonString.substring(Math.max(0, position - 10), position));
        console.log('📍 Next 10 chars:', jsonString.substring(position + 1, position + 11));
      }
    }
  }

  private async tryCompleteTruncatedJSON(jsonString: string, originalContent: string): Promise<GeneratedWorkout> {
    // Try to complete common truncated patterns
    let completed = jsonString;
    
    // Count open brackets/braces
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;
    
    // Complete missing closing braces/brackets
    for (let i = 0; i < openBraces - closeBraces; i++) {
      completed += '}';
    }
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      completed += ']';
    }
    
    // If the JSON ends with a comma, remove it
    completed = completed.replace(/,\s*$/, '');
    
    try {
      const parsed = JSON.parse(completed);
      console.log('✅ StringJSONStrategy: Successfully completed truncated JSON');
      return await this.directStrategy.parse(parsed);
    } catch (error) {
      console.log('❌ StringJSONStrategy: Failed to complete truncated JSON, falling back to original');
      throw new Error(`Truncated JSON completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPriority(): number {
    return 90; // High priority but below direct object
  }
} 