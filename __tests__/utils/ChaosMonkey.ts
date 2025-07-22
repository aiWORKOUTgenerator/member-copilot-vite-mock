// Chaos Monkey - Failure simulation utility for chaos engineering
// Part of Phase 4: Testing & QA

import { spawn, ChildProcess, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export interface ChaosConfig {
  enabled: boolean;
  dryRun: boolean;
  safetyLimits: {
    maxMemoryPressure: number;
    maxCPUUsage: number;
    maxDiskUsage: number;
    maxNetworkLatency: number;
  };
}

export interface MemoryPressureConfig {
  targetUtilization: number; // 0-1
  duration: number; // milliseconds
  growthRate?: number; // MB per second
}

export interface CPUStarvationConfig {
  targetUtilization: number; // 0-1
  duration: number; // milliseconds
  pattern?: 'constant' | 'spike' | 'oscillate';
}

export interface DiskBottleneckConfig {
  readLatency: number; // milliseconds
  writeLatency: number; // milliseconds
  iopsLimit: number; // operations per second
  fillPercentage?: number; // 0-100
}

export interface DataCorruptionConfig {
  type: 'partial' | 'metadata' | 'index' | 'complete';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target: string; // target data store
  pattern?: 'random' | 'systematic' | 'burst';
}

export class ChaosMonkey extends EventEmitter {
  private config: ChaosConfig;
  private activeProcesses = new Map<string, ChildProcess>();
  private memoryHogs: Buffer[] = [];
  private cpuBurners = new Set<NodeJS.Timeout>();
  private diskFillers = new Set<string>();
  private restorationCallbacks = new Map<string, () => Promise<void>>();
  private chaosActive = new Set<string>();

  constructor(config?: Partial<ChaosConfig>) {
    super();
    
    this.config = {
      enabled: process.env.NODE_ENV === 'test',
      dryRun: process.env.CHAOS_DRY_RUN === 'true',
      safetyLimits: {
        maxMemoryPressure: 0.95, // 95% max memory usage
        maxCPUUsage: 0.98, // 98% max CPU usage  
        maxDiskUsage: 0.90, // 90% max disk usage
        maxNetworkLatency: 10000, // 10 second max latency
      },
      ...config
    };

    if (!this.config.enabled) {
      console.warn('⚠️ ChaosMonkey is disabled in this environment');
    }
  }

  // ===== MEMORY CHAOS =====
  
  async createMemoryPressure(config: MemoryPressureConfig): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would create memory pressure: ${config.targetUtilization * 100}%`);
      return;
    }

    const safeTarget = Math.min(config.targetUtilization, this.config.safetyLimits.maxMemoryPressure);
    if (safeTarget !== config.targetUtilization) {
      console.warn(`⚠️ Memory pressure limited to ${safeTarget * 100}% for safety`);
    }

    console.log(`💾 Creating memory pressure: ${safeTarget * 100}%`);
    this.chaosActive.add('memory-pressure');

    const totalMemory = this.getSystemMemory();
    const targetMemory = totalMemory * safeTarget;
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryToAllocate = Math.max(0, targetMemory - currentMemory);
    
    // Gradually allocate memory
    const chunkSize = 100 * 1024 * 1024; // 100MB chunks
    const chunks = Math.floor(memoryToAllocate / chunkSize);
    const growthRate = config.growthRate || 10; // MB per second
    const interval = (chunkSize / (growthRate * 1024 * 1024)) * 1000;

    let allocatedChunks = 0;
    const allocateChunk = () => {
      if (allocatedChunks < chunks && this.chaosActive.has('memory-pressure')) {
        try {
          // Allocate and fill buffer to prevent garbage collection
          const buffer = Buffer.alloc(chunkSize, 0xFF);
          this.memoryHogs.push(buffer);
          allocatedChunks++;
          
          this.emit('memory-pressure-update', {
            allocatedMB: allocatedChunks * (chunkSize / 1024 / 1024),
            targetMB: memoryToAllocate / 1024 / 1024,
            progress: allocatedChunks / chunks
          });
          
          setTimeout(allocateChunk, interval);
        } catch (error) {
          console.warn('⚠️ Memory allocation failed:', error.message);
          this.emit('memory-pressure-error', error);
        }
      }
    };

    allocateChunk();

    // Auto cleanup after duration
    if (config.duration) {
      setTimeout(() => {
        this.stopMemoryPressure();
      }, config.duration);
    }

    this.emit('memory-pressure-started', { target: safeTarget, duration: config.duration });
  }

  async stopMemoryPressure(): Promise<void> {
    console.log('🧹 Stopping memory pressure');
    
    this.chaosActive.delete('memory-pressure');
    this.memoryHogs.length = 0; // Clear all memory hogs
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    this.emit('memory-pressure-stopped');
  }

  // ===== CPU CHAOS =====
  
  async createCPUStarvation(config: CPUStarvationConfig): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would create CPU starvation: ${config.targetUtilization * 100}%`);
      return;
    }

    const safeTarget = Math.min(config.targetUtilization, this.config.safetyLimits.maxCPUUsage);
    console.log(`⚡ Creating CPU starvation: ${safeTarget * 100}%`);
    
    this.chaosActive.add('cpu-starvation');

    const cpuCount = require('os').cpus().length;
    const burnerCount = Math.ceil(cpuCount * safeTarget);

    // Create CPU burning processes
    for (let i = 0; i < burnerCount; i++) {
      const burner = this.createCPUBurner(config.pattern || 'constant');
      this.cpuBurners.add(burner);
    }

    // Auto cleanup after duration
    if (config.duration) {
      setTimeout(() => {
        this.stopCPUStarvation();
      }, config.duration);
    }

    this.emit('cpu-starvation-started', { target: safeTarget, burners: burnerCount });
  }

  private createCPUBurner(pattern: 'constant' | 'spike' | 'oscillate'): NodeJS.Timeout {
    const burn = () => {
      if (!this.chaosActive.has('cpu-starvation')) return;
      
      const start = Date.now();
      let duration: number;
      
      switch (pattern) {
        case 'constant':
          duration = 100; // 100ms of work
          break;
        case 'spike':
          duration = Math.random() * 200 + 50; // 50-250ms
          break;
        case 'oscillate':
          duration = 50 + 50 * Math.sin(Date.now() / 1000); // Oscillating load
          break;
      }
      
      // Busy wait to consume CPU
      while (Date.now() - start < duration) {
        Math.random() * Math.random();
      }
      
      // Small break to prevent complete lockup
      setTimeout(burn, pattern === 'constant' ? 10 : Math.random() * 20);
    };

    burn();
    return setInterval(() => {}, 1000); // Dummy interval for cleanup tracking
  }

  async stopCPUStarvation(): Promise<void> {
    console.log('🧹 Stopping CPU starvation');
    
    this.chaosActive.delete('cpu-starvation');
    
    // Clear all CPU burners
    this.cpuBurners.forEach(burner => clearInterval(burner));
    this.cpuBurners.clear();
    
    this.emit('cpu-starvation-stopped');
  }

  // ===== DISK CHAOS =====
  
  async createDiskBottleneck(config: DiskBottleneckConfig): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would create disk bottleneck: ${config.iopsLimit} IOPS`);
      return;
    }

    console.log(`💿 Creating disk I/O bottleneck: ${config.iopsLimit} IOPS, ${config.readLatency}ms read, ${config.writeLatency}ms write`);
    
    this.chaosActive.add('disk-bottleneck');

    // Simulate I/O operations to create bottleneck
    const ioSimulator = async () => {
      while (this.chaosActive.has('disk-bottleneck')) {
        try {
          // Create temporary files for I/O load
          const tempDir = path.join(__dirname, '../../tmp/chaos');
          await fs.mkdir(tempDir, { recursive: true });
          
          const operations = Math.min(config.iopsLimit, 10); // Limit for safety
          const operationPromises: Promise<void>[] = [];
          
          for (let i = 0; i < operations; i++) {
            operationPromises.push(this.simulateIOOperation(tempDir, config));
          }
          
          await Promise.all(operationPromises);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second interval
          
        } catch (error) {
          console.warn('⚠️ Disk I/O simulation error:', error.message);
        }
      }
    };

    ioSimulator();

    // Fill disk if requested
    if (config.fillPercentage && config.fillPercentage > 0) {
      await this.fillDisk(config.fillPercentage);
    }

    this.emit('disk-bottleneck-started', config);
  }

  private async simulateIOOperation(tempDir: string, config: DiskBottleneckConfig): Promise<void> {
    const filename = path.join(tempDir, `chaos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.tmp`);
    
    try {
      // Simulate write with latency
      const writeData = Buffer.alloc(1024 * Math.random() * 100); // 0-100KB
      await new Promise(resolve => setTimeout(resolve, config.writeLatency));
      await fs.writeFile(filename, writeData);
      this.diskFillers.add(filename);
      
      // Simulate read with latency
      await new Promise(resolve => setTimeout(resolve, config.readLatency));
      await fs.readFile(filename);
      
    } catch (error) {
      // Ignore individual operation errors
    }
  }

  private async fillDisk(percentage: number): Promise<void> {
    const safePercentage = Math.min(percentage, this.config.safetyLimits.maxDiskUsage);
    console.log(`💿 Filling disk to ${safePercentage}%`);
    
    // This is a simplified implementation - in reality would check available space
    const tempDir = path.join(__dirname, '../../tmp/chaos/disk-fill');
    await fs.mkdir(tempDir, { recursive: true });
    
    const fillers = Math.floor(safePercentage / 10); // Create multiple filler files
    
    for (let i = 0; i < fillers; i++) {
      const filename = path.join(tempDir, `disk-filler-${i}.tmp`);
      const size = 10 * 1024 * 1024; // 10MB per file
      const data = Buffer.alloc(size, 0xFF);
      
      try {
        await fs.writeFile(filename, data);
        this.diskFillers.add(filename);
      } catch (error) {
        console.warn(`⚠️ Could not create disk filler ${i}:`, error.message);
        break;
      }
    }
  }

  async stopDiskBottleneck(): Promise<void> {
    console.log('🧹 Stopping disk bottleneck');
    
    this.chaosActive.delete('disk-bottleneck');
    
    // Clean up temporary files
    for (const filename of this.diskFillers) {
      try {
        await fs.unlink(filename);
      } catch (error) {
        // File might already be deleted
      }
    }
    this.diskFillers.clear();
    
    // Clean up temp directories
    try {
      await fs.rmdir(path.join(__dirname, '../../tmp/chaos'), { recursive: true });
    } catch (error) {
      // Directory might not exist
    }
    
    this.emit('disk-bottleneck-stopped');
  }

  // ===== SERVICE CHAOS =====
  
  async killService(serviceName: string): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would kill service: ${serviceName}`);
      return;
    }

    console.log(`💀 Killing service: ${serviceName}`);
    
    try {
      // Stop Docker container
      const killProcess = spawn('docker', ['stop', `ai-${serviceName}-prod`], {
        stdio: 'pipe'
      });
      
      killProcess.on('close', (code) => {
        if (code === 0) {
          this.emit('service-killed', { service: serviceName });
        } else {
          console.warn(`⚠️ Failed to kill service ${serviceName}: exit code ${code}`);
        }
      });
      
      // Store kill process for tracking
      this.activeProcesses.set(`kill-${serviceName}`, killProcess);
      
    } catch (error) {
      console.error(`❌ Error killing service ${serviceName}:`, error.message);
      this.emit('service-kill-error', { service: serviceName, error: error.message });
    }
  }

  async restoreService(serviceName: string): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would restore service: ${serviceName}`);
      return;
    }

    console.log(`🔧 Restoring service: ${serviceName}`);
    
    try {
      // Start Docker container
      const restoreProcess = spawn('docker', ['start', `ai-${serviceName}-prod`], {
        stdio: 'pipe'
      });
      
      restoreProcess.on('close', (code) => {
        if (code === 0) {
          this.emit('service-restored', { service: serviceName });
        } else {
          console.warn(`⚠️ Failed to restore service ${serviceName}: exit code ${code}`);
        }
      });
      
      this.activeProcesses.set(`restore-${serviceName}`, restoreProcess);
      
    } catch (error) {
      console.error(`❌ Error restoring service ${serviceName}:`, error.message);
      this.emit('service-restore-error', { service: serviceName, error: error.message });
    }
  }

  async disableService(serviceName: string): Promise<void> {
    console.log(`🔐 Disabling service: ${serviceName}`);
    
    // Store restoration callback
    this.restorationCallbacks.set(serviceName, async () => {
      await this.enableService(serviceName);
    });
    
    await this.killService(serviceName);
  }

  async enableService(serviceName: string): Promise<void> {
    console.log(`🔓 Enabling service: ${serviceName}`);
    
    await this.restoreService(serviceName);
    this.restorationCallbacks.delete(serviceName);
  }

  async restoreAllServices(): Promise<void> {
    console.log('🔧 Restoring all services');
    
    const restorations = Array.from(this.restorationCallbacks.entries()).map(
      ([serviceName, callback]) => callback()
    );
    
    await Promise.allSettled(restorations);
    this.restorationCallbacks.clear();
  }

  // ===== DATA CHAOS =====
  
  async corruptData(config: DataCorruptionConfig): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would corrupt data: ${config.type} ${config.severity} on ${config.target}`);
      return;
    }

    console.log(`🗂️ Corrupting data: ${config.type} ${config.severity} on ${config.target}`);
    
    try {
      switch (config.type) {
        case 'partial':
          await this.corruptPartialData(config);
          break;
        case 'metadata':
          await this.corruptMetadata(config);
          break;
        case 'index':
          await this.corruptIndex(config);
          break;
        case 'complete':
          await this.corruptCompleteData(config);
          break;
      }
      
      this.emit('data-corrupted', config);
      
    } catch (error) {
      console.error(`❌ Error corrupting data:`, error.message);
      this.emit('data-corruption-error', { config, error: error.message });
    }
  }

  private async corruptPartialData(config: DataCorruptionConfig): Promise<void> {
    // Simulate partial data corruption by modifying cache entries
    const corruptionScript = `
      const redis = require('redis');
      const client = redis.createClient({ host: 'localhost', port: 6379 });
      
      client.keys('*${config.target}*').then(keys => {
        const corruptCount = Math.floor(keys.length * 0.1); // Corrupt 10% of entries
        const toCorrupt = keys.slice(0, corruptCount);
        
        toCorrupt.forEach(key => {
          client.set(key, 'CORRUPTED_DATA_' + Math.random());
        });
      });
    `;
    
    // This would execute in a real environment
    console.log('📝 Simulated partial data corruption script execution');
  }

  private async corruptMetadata(config: DataCorruptionConfig): Promise<void> {
    // Simulate metadata corruption
    console.log('📝 Simulated metadata corruption');
  }

  private async corruptIndex(config: DataCorruptionConfig): Promise<void> {
    // Simulate index corruption
    console.log('📝 Simulated index corruption');
  }

  private async corruptCompleteData(config: DataCorruptionConfig): Promise<void> {
    // Simulate complete data corruption
    console.log('📝 Simulated complete data corruption');
  }

  // ===== TIME CHAOS =====
  
  async adjustSystemTime(offsetMs: number): Promise<void> {
    if (!this.config.enabled || this.config.dryRun) {
      console.log(`[DRY RUN] Would adjust system time by ${offsetMs}ms`);
      return;
    }

    console.log(`⏰ Adjusting system time by ${offsetMs}ms`);
    
    // In a real implementation, this would adjust system time
    // For testing, we simulate time skew effects
    
    // Mock Date.now to return skewed time
    const originalDateNow = Date.now;
    Date.now = () => originalDateNow() + offsetMs;
    
    // Store restoration function
    this.restorationCallbacks.set('system-time', async () => {
      Date.now = originalDateNow;
    });
    
    this.emit('time-adjusted', { offset: offsetMs });
  }

  async resetSystemTime(): Promise<void> {
    console.log('⏰ Resetting system time');
    
    const callback = this.restorationCallbacks.get('system-time');
    if (callback) {
      await callback();
      this.restorationCallbacks.delete('system-time');
    }
    
    this.emit('time-reset');
  }

  // ===== UTILITY METHODS =====
  
  async reset(): Promise<void> {
    console.log('🔄 Resetting ChaosMonkey');
    
    // Stop all active chaos
    await this.stopAll();
    
    // Clear all tracking sets
    this.chaosActive.clear();
    this.memoryHogs.length = 0;
    this.cpuBurners.clear();
    this.diskFillers.clear();
    this.restorationCallbacks.clear();
    
    // Kill active processes
    for (const [name, process] of this.activeProcesses) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    }
    this.activeProcesses.clear();
    
    this.emit('reset');
  }

  async stopAll(): Promise<void> {
    console.log('⏹️ Stopping all chaos activities');
    
    // Stop all chaos types
    await Promise.allSettled([
      this.stopMemoryPressure(),
      this.stopCPUStarvation(),
      this.stopDiskBottleneck(),
      this.restoreAllServices(),
      this.resetSystemTime()
    ]);
    
    this.emit('all-stopped');
  }

  // System information helpers
  private getSystemMemory(): number {
    return require('os').totalmem();
  }

  private getCurrentMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  // Status checks
  isActive(chaosType?: string): boolean {
    if (chaosType) {
      return this.chaosActive.has(chaosType);
    }
    return this.chaosActive.size > 0;
  }

  getActiveChaosList(): string[] {
    return Array.from(this.chaosActive);
  }

  getStatus(): {
    enabled: boolean;
    dryRun: boolean;
    activeChaos: string[];
    activeProcesses: string[];
  } {
    return {
      enabled: this.config.enabled,
      dryRun: this.config.dryRun,
      activeChaos: this.getActiveChaosList(),
      activeProcesses: Array.from(this.activeProcesses.keys())
    };
  }
}

export default ChaosMonkey; 