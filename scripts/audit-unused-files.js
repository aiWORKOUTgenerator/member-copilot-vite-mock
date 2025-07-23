#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class UnusedFileAuditor {
  constructor(srcDir = 'src') {
    this.srcDir = srcDir;
    this.allFiles = [];
    this.importMap = new Map();
    this.exportMap = new Map();
  }

  async audit() {
    console.log('🔍 Starting comprehensive unused file audit...\n');
    
    // 1. Gather all TypeScript files
    this.gatherAllFiles();
    
    // 2. Build import/export maps
    await this.buildMaps();
    
    // 3. Analyze usage
    this.analyzeUsage();
    
    // 4. Generate report
    this.generateReport();
  }

  gatherAllFiles() {
    this.allFiles = glob.sync(`${this.srcDir}/**/*.{ts,tsx}`, {
      ignore: [`${this.srcDir}/**/*.test.{ts,tsx}`, `${this.srcDir}/**/*.spec.{ts,tsx}`]
    });
    console.log(`📁 Found ${this.allFiles.length} TypeScript files`);
  }

  async buildMaps() {
    for (const file of this.allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract imports
      const imports = this.extractImports(content);
      this.importMap.set(file, imports);
      
      // Extract exports
      const exports = this.extractExports(content);
      this.exportMap.set(file, exports);
    }
  }

  extractImports(content) {
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  analyzeUsage() {
    console.log('\n📊 Analyzing file usage...\n');
    
    const results = {
      unused: [],
      potentially_unused: [],
      test_only: [],
      config_files: []
    };

    for (const file of this.allFiles) {
      const usage = this.analyzeFileUsage(file);
      
      if (usage.category !== 'used') {
        results[usage.category].push({
          file,
          reason: usage.reason,
          exports: this.exportMap.get(file) || []
        });
      }
    }

    this.results = results;
  }

  analyzeFileUsage(file) {
    const relativePath = path.relative(this.srcDir, file);
    const fileName = path.basename(file, path.extname(file));
    
    // Check if file is imported anywhere
    const isImported = this.allFiles.some(otherFile => {
      if (otherFile === file) return false;
      const imports = this.importMap.get(otherFile) || [];
      return imports.some(imp => 
        imp.includes(fileName) || 
        imp.includes(relativePath.replace(/\.(ts|tsx)$/, ''))
      );
    });

    // Special cases
    if (file.includes('index.ts') || file.includes('index.tsx')) {
      return { category: 'used', reason: 'Index file' };
    }
    
    if (file.includes('.config.') || file.includes('.setup.')) {
      return { category: 'config_files', reason: 'Configuration file' };
    }

    if (!isImported) {
      return { category: 'unused', reason: 'Never imported' };
    }

    return { category: 'used', reason: 'Actively imported' };
  }

  generateReport() {
    console.log('📋 UNUSED FILE AUDIT REPORT');
    console.log('=' .repeat(50));
    
    console.log(`\n🚨 UNUSED FILES (${this.results.unused.length}):`);
    this.results.unused.forEach(item => {
      console.log(`  ❌ ${item.file}`);
      console.log(`     Reason: ${item.reason}`);
      if (item.exports.length > 0) {
        console.log(`     Exports: ${item.exports.join(', ')}`);
      }
      console.log();
    });

    console.log(`\n⚠️  POTENTIALLY UNUSED (${this.results.potentially_unused.length}):`);
    this.results.potentially_unused.forEach(item => {
      console.log(`  ⚠️  ${item.file} - ${item.reason}`);
    });

    console.log(`\n🧪 TEST-ONLY FILES (${this.results.test_only.length}):`);
    this.results.test_only.forEach(item => {
      console.log(`  🧪 ${item.file} - ${item.reason}`);
    });

    console.log(`\n⚙️  CONFIG FILES (${this.results.config_files.length}):`);
    this.results.config_files.forEach(item => {
      console.log(`  ⚙️  ${item.file} - ${item.reason}`);
    });

    // Summary
    const totalUnused = this.results.unused.length + this.results.potentially_unused.length;
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total files scanned: ${this.allFiles.length}`);
    console.log(`  Definitely unused: ${this.results.unused.length}`);
    console.log(`  Potentially unused: ${this.results.potentially_unused.length}`);
    console.log(`  Cleanup opportunity: ${totalUnused} files`);
  }
}

// Run the audit
new UnusedFileAuditor().audit().catch(console.error); 