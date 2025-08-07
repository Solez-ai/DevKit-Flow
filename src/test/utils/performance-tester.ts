/**
 * Performance Testing Utilities
 * Provides tools for measuring and analyzing performance
 */

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  throughput?: number;
  iterations: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  minThroughput?: number;
  maxCpuUsage?: number;
}

export interface PerformanceTestResult {
  testName: string;
  metrics: PerformanceMetrics;
  thresholds: PerformanceThresholds;
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

export class PerformanceTester {
  private measurements: Map<string, PerformanceMetrics[]> = new Map();

  async measureFunction<T>(
    testName: string,
    fn: () => T | Promise<T>,
    iterations: number = 1000
  ): Promise<PerformanceMetrics> {
    const startMemory = this.getMemoryUsage();
    const startTime = performance.now();
    
    // Warm up
    for (let i = 0; i < Math.min(10, iterations); i++) {
      await fn();
    }

    // Actual measurement
    const measurementStartTime = performance.now();
    const measurementStartMemory = this.getMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      executionTime: endTime - measurementStartTime,
      memoryUsage: endMemory - measurementStartMemory,
      throughput: iterations / ((endTime - measurementStartTime) / 1000),
      iterations,
      timestamp: Date.now()
    };

    // Store measurement
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName)!.push(metrics);

    return metrics;
  }

  async measureAsyncFunction<T>(
    testName: string,
    fn: () => Promise<T>,
    iterations: number = 100,
    concurrency: number = 1
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    const batches = Math.ceil(iterations / concurrency);
    const promises: Promise<T>[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);
      const batchPromises = Array.from({ length: batchSize }, () => fn());
      
      await Promise.all(batchPromises);
    }

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      throughput: iterations / ((endTime - startTime) / 1000),
      iterations,
      timestamp: Date.now()
    };

    // Store measurement
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName)!.push(metrics);

    return metrics;
  }

  async measureComponentRender(
    testName: string,
    renderFn: () => void,
    iterations: number = 100
  ): Promise<PerformanceMetrics> {
    return this.measureFunction(testName, renderFn, iterations);
  }

  async stressTest<T>(
    testName: string,
    fn: () => T | Promise<T>,
    options: {
      duration: number; // in milliseconds
      maxConcurrency: number;
      rampUpTime: number;
    }
  ): Promise<PerformanceMetrics[]> {
    const results: PerformanceMetrics[] = [];
    const startTime = Date.now();
    const endTime = startTime + options.duration;
    
    let currentConcurrency = 1;
    const rampUpInterval = options.rampUpTime / options.maxConcurrency;

    while (Date.now() < endTime) {
      const iterationStart = performance.now();
      const promises: Promise<any>[] = [];

      // Execute with current concurrency level
      for (let i = 0; i < currentConcurrency; i++) {
        promises.push(Promise.resolve(fn()));
      }

      await Promise.all(promises);
      
      const iterationEnd = performance.now();
      const iterationTime = iterationEnd - iterationStart;

      results.push({
        executionTime: iterationTime,
        memoryUsage: this.getMemoryUsage(),
        throughput: currentConcurrency / (iterationTime / 1000),
        iterations: currentConcurrency,
        timestamp: Date.now()
      });

      // Ramp up concurrency
      if (currentConcurrency < options.maxConcurrency && 
          Date.now() - startTime > rampUpInterval * currentConcurrency) {
        currentConcurrency++;
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.measurements.set(`${testName}-stress`, results);
    return results;
  }

  evaluatePerformance(
    testName: string,
    thresholds: PerformanceThresholds
  ): PerformanceTestResult {
    const measurements = this.measurements.get(testName);
    if (!measurements || measurements.length === 0) {
      return {
        testName,
        metrics: {
          executionTime: 0,
          memoryUsage: 0,
          iterations: 0,
          timestamp: Date.now()
        },
        thresholds,
        passed: false,
        issues: ['No measurements available'],
        recommendations: ['Run performance tests first']
      };
    }

    // Use the latest measurement
    const latestMetrics = measurements[measurements.length - 1];
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check execution time
    if (latestMetrics.executionTime > thresholds.maxExecutionTime) {
      issues.push(`Execution time (${latestMetrics.executionTime.toFixed(2)}ms) exceeds threshold (${thresholds.maxExecutionTime}ms)`);
      recommendations.push('Consider optimizing algorithm complexity or using web workers for heavy computations');
    }

    // Check memory usage
    if (latestMetrics.memoryUsage > thresholds.maxMemoryUsage) {
      issues.push(`Memory usage (${(latestMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB) exceeds threshold (${(thresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB)`);
      recommendations.push('Review memory allocation patterns and implement proper cleanup');
    }

    // Check throughput
    if (thresholds.minThroughput && latestMetrics.throughput && 
        latestMetrics.throughput < thresholds.minThroughput) {
      issues.push(`Throughput (${latestMetrics.throughput.toFixed(2)} ops/sec) below threshold (${thresholds.minThroughput} ops/sec)`);
      recommendations.push('Optimize critical path operations and consider caching strategies');
    }

    // Analyze trends if multiple measurements available
    if (measurements.length > 1) {
      const trend = this.analyzeTrend(measurements);
      if (trend.degrading) {
        issues.push('Performance is degrading over time');
        recommendations.push('Investigate memory leaks or accumulating overhead');
      }
    }

    return {
      testName,
      metrics: latestMetrics,
      thresholds,
      passed: issues.length === 0,
      issues,
      recommendations
    };
  }

  private analyzeTrend(measurements: PerformanceMetrics[]): { degrading: boolean; trend: number } {
    if (measurements.length < 3) {
      return { degrading: false, trend: 0 };
    }

    // Simple linear regression on execution times
    const n = measurements.length;
    const x = measurements.map((_, i) => i);
    const y = measurements.map(m => m.executionTime);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      degrading: slope > 0.1, // Threshold for considering degradation
      trend: slope
    };
  }

  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0; // Fallback when memory API is not available
  }

  generatePerformanceReport(testName?: string): string {
    const measurements = testName 
      ? this.measurements.get(testName) 
      : Array.from(this.measurements.values()).flat();

    if (!measurements || measurements.length === 0) {
      return 'No performance measurements available';
    }

    const avgExecutionTime = measurements.reduce((sum, m) => sum + m.executionTime, 0) / measurements.length;
    const avgMemoryUsage = measurements.reduce((sum, m) => sum + m.memoryUsage, 0) / measurements.length;
    const avgThroughput = measurements.reduce((sum, m) => sum + (m.throughput || 0), 0) / measurements.length;

    const maxExecutionTime = Math.max(...measurements.map(m => m.executionTime));
    const minExecutionTime = Math.min(...measurements.map(m => m.executionTime));

    return `
Performance Report${testName ? ` for ${testName}` : ''}
=====================================
Measurements: ${measurements.length}
Execution Time:
  - Average: ${avgExecutionTime.toFixed(2)}ms
  - Min: ${minExecutionTime.toFixed(2)}ms
  - Max: ${maxExecutionTime.toFixed(2)}ms
Memory Usage:
  - Average: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB
Throughput:
  - Average: ${avgThroughput.toFixed(2)} ops/sec
    `.trim();
  }

  clearMeasurements(testName?: string): void {
    if (testName) {
      this.measurements.delete(testName);
    } else {
      this.measurements.clear();
    }
  }

  exportMeasurements(): Record<string, PerformanceMetrics[]> {
    const exported: Record<string, PerformanceMetrics[]> = {};
    for (const [testName, measurements] of this.measurements.entries()) {
      exported[testName] = [...measurements];
    }
    return exported;
  }
}