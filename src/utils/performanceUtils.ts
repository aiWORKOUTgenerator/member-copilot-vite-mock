/**
 * Cross-browser performance utilities
 * Handles memory measurement with fallbacks for browsers that don't support non-standard APIs
 */

// Type definitions for non-standard performance APIs
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Safely get memory usage with cross-browser compatibility
 * @returns Memory usage in bytes, or 0 if not available
 */
export function getMemoryUsage(): number {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 0;
    }

    const performance = window.performance as ExtendedPerformance;
    
    // Check if the non-standard memory API is available (Chrome/Chromium)
    if (performance.memory?.usedJSHeapSize) {
      return performance.memory.usedJSHeapSize;
    }

    // Fallback: Try to estimate memory usage from other available metrics
    if (performance.memory?.totalJSHeapSize) {
      return performance.memory.totalJSHeapSize;
    }

    // If no memory API is available, return 0
    return 0;
  } catch (error) {
    // Silently fail and return 0 for any errors
    console.warn('Memory measurement not available:', error);
    return 0;
  }
}

/**
 * Get memory usage difference between two measurements
 * @param startMemory Starting memory measurement
 * @param endMemory Ending memory measurement
 * @returns Memory difference in bytes
 */
export function getMemoryDifference(startMemory: number, endMemory: number): number {
  return endMemory - startMemory;
}

/**
 * Format memory usage for display
 * @param bytes Memory usage in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatMemoryUsage(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const base = 1024;
  const exponent = Math.floor(Math.log(bytes) / Math.log(base));
  const value = bytes / Math.pow(base, exponent);
  
  return `${value.toFixed(1)} ${units[exponent]}`;
}

/**
 * Check if memory measurement is available in the current environment
 * @returns True if memory measurement is supported
 */
export function isMemoryMeasurementAvailable(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    const performance = window.performance as ExtendedPerformance;
    return !!(performance.memory?.usedJSHeapSize);
  } catch {
    return false;
  }
}

/**
 * Performance measurement wrapper with memory tracking
 */
export class PerformanceTracker {
  private startTime: number;
  private startMemory: number;

  constructor() {
    this.startTime = performance.now();
    this.startMemory = getMemoryUsage();
  }

  /**
   * End tracking and get results
   */
  end(): {
    executionTime: number;
    memoryUsage: number;
    memoryDifference: number;
    formattedMemory: string;
  } {
    const endTime = performance.now();
    const endMemory = getMemoryUsage();
    
    return {
      executionTime: endTime - this.startTime,
      memoryUsage: endMemory,
      memoryDifference: getMemoryDifference(this.startMemory, endMemory),
      formattedMemory: formatMemoryUsage(endMemory)
    };
  }
} 