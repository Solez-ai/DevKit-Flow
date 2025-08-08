/**
 * Performance Monitor
 * Tracks application performance metrics and provides optimization insights
 */

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
  errorCount: number;
  userInteractions: number;
  lastUpdated: Date;
  itemsRendered?: number;
  cacheHitRate?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    renderTime: 0,
    loadTime: 0,
    errorCount: 0,
    userInteractions: 0,
    lastUpdated: new Date(),
    itemsRendered: 0,
    cacheHitRate: 0
  };

  private observers: PerformanceObserver[] = [];
  private monitoring = false;

  startMonitoring(): void {
    if (this.monitoring) return;

    this.monitoring = true;
    console.log('📊 Performance monitoring started');

    // Monitor navigation timing
    this.monitorNavigationTiming();

    // Monitor resource timing
    this.monitorResourceTiming();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor user interactions
    this.monitorUserInteractions();

    // Update metrics periodically
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  stopMonitoring(): void {
    if (!this.monitoring) return;

    this.monitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('📊 Performance monitoring stopped');
  }

  private monitorNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - (navigation as any).navigationStart;
      }
    }
  }

  private monitorResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              // Track slow resources
              if (entry.duration > 1000) {
                console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
              }
            }
          });
        });

        observer.observe({ entryTypes: ['resource'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('Resource timing monitoring not supported:', error);
      }
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  }

  private monitorUserInteractions(): void {
    const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
    
    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.metrics.userInteractions++;
      }, { passive: true });
    });
  }

  private updateMetrics(): void {
    this.monitorMemoryUsage();
    this.metrics.lastUpdated = new Date();

    // Warn about high memory usage
    if (this.metrics.memoryUsage > 0.8) {
      console.warn('High memory usage detected:', this.metrics.memoryUsage);
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  recordError(): void {
    this.metrics.errorCount++;
  }

  recordRenderTime(time: number): void {
    this.metrics.renderTime = time;
  }

  // Performance optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.memoryUsage > 0.7) {
      suggestions.push('Consider reducing memory usage by cleaning up unused data');
    }

    if (this.metrics.loadTime > 3000) {
      suggestions.push('Consider optimizing initial load time');
    }

    if (this.metrics.errorCount > 10) {
      suggestions.push('High error count detected - review error handling');
    }

    return suggestions;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Also export as default for compatibility
export default performanceMonitor;

// Hook for using performance monitor in components
export const usePerformanceMonitor = (config?: any) => {
  return {
    currentMetrics: performanceMonitor.getMetrics(),
    alerts: [] as PerformanceAlert[],
    generateReport: () => performanceMonitor.getOptimizationSuggestions()
  };
};

// Performance alert interface
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}