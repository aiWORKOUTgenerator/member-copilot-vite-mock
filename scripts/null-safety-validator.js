#!/usr/bin/env node

/**
 * Null Safety Validator Script
 * 
 * Scans the codebase for common null safety anti-patterns and reports them.
 * This script helps identify potential runtime crashes from null reference errors.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Anti-patterns to detect
const ANTI_PATTERNS = [
  // Pattern B (Bad) - Direct property access without null checks
  {
    name: 'Direct Property Access',
    pattern: /(\w+)\.(\w+)(?=\s*[;,)}\]])/g,
    message: 'Direct property access without null check',
    severity: 'high',
    exclude: [
      // Exclude common safe patterns
      /\.(length|toString|valueOf|constructor|prototype)\b/,
      /\.(test|exec|match|replace|split|join|slice|substring)\b/,
      /\.(getTime|getDate|getFullYear|getMonth|getDay)\b/,
      /\.(toFixed|toPrecision|toExponential)\b/,
      /\.(toLowerCase|toUpperCase|trim|startsWith|endsWith|includes)\b/,
      /\.(push|pop|shift|unshift|splice|reverse|sort)\b/,
      /\.(setAttribute|getAttribute|addEventListener|removeEventListener)\b/,
      /\.(className|id|textContent|innerHTML|value)\b/,
      // Exclude React patterns
      /\.(props|state|refs|context)\b/,
      /\.(children|key|ref)\b/,
      // Exclude TypeScript/JavaScript built-ins
      /\.(name|message|stack)\b/,
      /\.(JSON|Math|Date|Array|Object|String|Number|Boolean)\b/,
      // Exclude common safe object patterns
      /\.(window|document|console|localStorage|sessionStorage)\b/,
      /\.(process|require|module|exports|__dirname|__filename)\b/
    ]
  },
  
  // Array methods on potentially null arrays
  {
    name: 'Array Methods on Potentially Null Arrays',
    pattern: /(\w+)\.(forEach|map|filter|reduce|find|some|every|includes|indexOf|lastIndexOf|slice|splice|push|pop|shift|unshift|reverse|sort|join|concat|flat|flatMap)(?=\s*\()/g,
    message: 'Array method called on potentially null array',
    severity: 'high',
    exclude: [
      // Exclude when we can see null checks nearby
      /if\s*\(\s*!\s*\1\s*\)/,
      /if\s*\(\s*\1\s*\)/,
      /\?\s*\1\s*\./,
      /\|\|\s*\[\]/,
      /\?\?\s*\[\]/
    ]
  },
  
  // Object property access without optional chaining
  {
    name: 'Object Property Access Without Optional Chaining',
    pattern: /(\w+)\.(\w+)(?=\s*[;,)}\]])/g,
    message: 'Object property access without optional chaining',
    severity: 'medium',
    exclude: [
      // Exclude when optional chaining is used
      /\?\s*\./,
      // Exclude common safe patterns (same as above)
      /\.(length|toString|valueOf|constructor|prototype)\b/,
      /\.(test|exec|match|replace|split|join|slice|substring)\b/,
      /\.(getTime|getDate|getFullYear|getMonth|getDay)\b/,
      /\.(toFixed|toPrecision|toExponential)\b/,
      /\.(toLowerCase|toUpperCase|trim|startsWith|endsWith|includes)\b/,
      /\.(push|pop|shift|unshift|splice|reverse|sort)\b/,
      /\.(setAttribute|getAttribute|addEventListener|removeEventListener)\b/,
      /\.(className|id|textContent|innerHTML|value)\b/,
      /\.(props|state|refs|context)\b/,
      /\.(children|key|ref)\b/,
      /\.(name|message|stack)\b/,
      /\.(JSON|Math|Date|Array|Object|String|Number|Boolean)\b/,
      /\.(window|document|console|localStorage|sessionStorage)\b/,
      /\.(process|require|module|exports|__dirname|__filename)\b/
    ]
  },
  
  // State updates assuming current state exists
  {
    name: 'State Updates Without Null Check',
    pattern: /set(\w+)\s*\(\s*prev\s*=>\s*\(\s*\.\.\.prev\s*,/g,
    message: 'State update assumes current state exists',
    severity: 'medium',
    exclude: [
      // Exclude when null check is present
      /prev\s*\?\s*\{/,
      /prev\s*\|\|\s*\{/,
      /prev\s*\?\?\s*\{/
    ]
  }
];

// Files to scan
const SCAN_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  '!src/**/*.test.{ts,tsx,js,jsx}',
  '!src/**/*.spec.{ts,tsx,js,jsx}',
  '!src/**/__tests__/**',
  '!src/**/node_modules/**',
  '!src/**/dist/**',
  '!src/**/build/**'
];

// Files to exclude from scanning
const EXCLUDE_FILES = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '*.test.*',
  '*.spec.*',
  '__tests__',
  '__mocks__'
];

class NullSafetyValidator {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      totalIssues: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0
    };
  }

  /**
   * Check if a file should be excluded
   */
  shouldExcludeFile(filePath) {
    return EXCLUDE_FILES.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }

  /**
   * Check if a match should be excluded based on context
   */
  shouldExcludeMatch(match, pattern, fileContent, lineNumber) {
    // Get the line content
    const lines = fileContent.split('\n');
    const line = lines[lineNumber - 1] || '';
    
    // Check if any exclude patterns match
    return pattern.exclude.some(excludePattern => {
      if (excludePattern instanceof RegExp) {
        return excludePattern.test(line);
      }
      return line.includes(excludePattern);
    });
  }

  /**
   * Scan a single file for anti-patterns
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      ANTI_PATTERNS.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.pattern.source, 'g');
        
        while ((match = regex.exec(content)) !== null) {
          // Calculate line number
          const lineNumber = content.substring(0, match.index).split('\n').length;
          
          // Check if this match should be excluded
          if (this.shouldExcludeMatch(match, pattern, content, lineNumber)) {
            continue;
          }
          
          // Get the line content
          const line = lines[lineNumber - 1] || '';
          
          this.issues.push({
            file: filePath,
            line: lineNumber,
            column: match.index - content.substring(0, match.index).lastIndexOf('\n') - 1,
            pattern: pattern.name,
            message: pattern.message,
            severity: pattern.severity,
            code: line.trim(),
            match: match[0]
          });
          
          this.stats.totalIssues++;
          if (pattern.severity === 'high') this.stats.highSeverity++;
          else if (pattern.severity === 'medium') this.stats.mediumSeverity++;
          else this.stats.lowSeverity++;
        }
      });
      
      this.stats.filesScanned++;
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  /**
   * Scan all files in the project
   */
  async scanProject() {
    console.log('🔍 Scanning for null safety anti-patterns...\n');
    
    const files = glob.sync(SCAN_PATTERNS.join(','), {
      ignore: EXCLUDE_FILES
    });
    
    files.forEach(file => {
      if (!this.shouldExcludeFile(file)) {
        this.scanFile(file);
      }
    });
  }

  /**
   * Generate a report
   */
  generateReport() {
    console.log('📊 Null Safety Validation Report\n');
    console.log(`Files scanned: ${this.stats.filesScanned}`);
    console.log(`Total issues found: ${this.stats.totalIssues}`);
    console.log(`High severity: ${this.stats.highSeverity}`);
    console.log(`Medium severity: ${this.stats.mediumSeverity}`);
    console.log(`Low severity: ${this.stats.lowSeverity}\n`);
    
    if (this.issues.length === 0) {
      console.log('✅ No null safety issues found!');
      return;
    }
    
    // Group issues by file
    const issuesByFile = {};
    this.issues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });
    
    // Print issues grouped by file
    Object.keys(issuesByFile).sort().forEach(file => {
      console.log(`📁 ${file}`);
      issuesByFile[file].forEach(issue => {
        const severityIcon = issue.severity === 'high' ? '🔴' : 
                           issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${severityIcon} Line ${issue.line}: ${issue.message}`);
        console.log(`     ${issue.code}`);
        console.log(`     Pattern: ${issue.pattern}`);
        console.log('');
      });
    });
    
    // Print recommendations
    console.log('💡 Recommendations:');
    console.log('1. Use optional chaining (?.) for potentially null object access');
    console.log('2. Use nullish coalescing (??) for default values');
    console.log('3. Add null checks before array operations');
    console.log('4. Use defensive programming patterns');
    console.log('5. Consider using TypeScript strict mode');
  }

  /**
   * Export issues to JSON file
   */
  exportToJson(outputPath = 'null-safety-report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      issues: this.issues
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report exported to ${outputPath}`);
  }
}

// Main execution
async function main() {
  const validator = new NullSafetyValidator();
  
  try {
    await validator.scanProject();
    validator.generateReport();
    
    // Export report if issues found
    if (validator.issues.length > 0) {
      validator.exportToJson();
    }
    
    // Exit with error code if high severity issues found
    if (validator.stats.highSeverity > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = NullSafetyValidator; 