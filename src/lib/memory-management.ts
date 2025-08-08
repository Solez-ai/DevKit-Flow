/**
 * AI-Powered Memory Management System
 * Intelligent memory cleanup and optimization for virtual rendering
 */

import React from 'react';

export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
  timestamp: number;
}

export interface MemoryThresholds {
  warning: number; // Percentage
  critical: number; // Percentage
  cleanup: number; // Percentage
}

export interface CacheItem {
  id: string;
  data: any;
  size: number; // Estimated size in bytes
  lastAccessed: number;
  accessCount: number;
  priority: number;
  isSticky: boolean; // Prevent cleanup
}

export interface MemoryCleanupStrategy {
  name: string;
  description: string;
  aggressiveness: 'low' | 'medium' | 'high';
  execute: () => Promise<number>; // Returns bytes freed
}

export class MemoryManager {
  private caches = new Map<string, Map<string, CacheItem>>();
  private memoryHistory: MemoryStats[] = [];
  private thresholds: MemoryThresholds;
  private cleanupStrategies: MemoryCleanupStrategy[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private observers: ((stats: MemoryStats) => void)[] = [];

  constructor(thresholds: Partial<MemoryThresholds> = {}) {
    this.thresholds = {
      warning: 70,
      critical: 85,
      cleanup: 90,
      ...thresholds
    };

    this.initializeCleanupStrategies();
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Register a cache for management
   */
  registerCache(name: string): void {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Map());
    }
  }

  /**
   * Add item to cache
   */
  addToCache(cacheName: string, item: CacheItem): void {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      this.registerCache(cacheName);
      return this.addToCache(cacheName, item);
    }

    // Update access information
    item.lastAccessed = Date.now();
    item.accessCount = (item.accessCount || 0) + 1;

    cache.set(item.id, item);

    // Check if cleanup is needed
    this.checkCacheSize(cacheName);
  }

  /**
   * Get item from cache
   */
  getFromCache(cacheName: string, itemId: string): CacheItem | undefined {
    const cache = this.caches.get(cacheName);
    if (!cache) return undefined;

    const item = cache.get(itemId);
    if (item) {
      // Update access information
      item.lastAccessed = Date.now();
      item.accessCount += 1;
      
      // Recalculate priority based on AI algorithm
      item.priority = this.calculateItemPriority(item);
    }

    return item;
  }

  /**
   * Remove item from cache
   */
  removeFromCache(cacheName: string, itemId: string): boolean {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;

    return cache.delete(itemId);
  }

  /**
   * Calculate AI-based item priority
   */
  private calculateItemPriority(item: CacheItem): number {
    const now = Date.now();
    const timeSinceAccess = now - item.lastAccessed;
    const hoursSinceAccess = timeSinceAccess / (1000 * 60 * 60);

    // Base priority factors
    const recencyScore = Math.max(0, 1 - hoursSinceAccess / 24); // Decay over 24 hours
    const frequencyScore = Math.min(1, item.accessCount / 10); // Max at 10 accesses
    const sizeScore = Math.max(0, 1 - item.size / (1024 * 1024)); // Penalty for large items

    // AI-weighted combination
    const priority = (recencyScore * 0.4) + (frequencyScore * 0.4) + (sizeScore * 0.2);

    return Math.max(0, Math.min(1, priority));
  }

  /**
   * Check cache size and perform cleanup if needed
   */
  private checkCacheSize(cacheName: string): void {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    const totalSize = Array.from(cache.values()).reduce((sum, item) => sum + item.size, 0);
    const maxSize = 50 * 1024 * 1024; // 50MB per cache

    if (totalSize > maxSize) {
      this.cleanupCache(cacheName, 0.3); // Remove 30% of items
    }
  }

  /**
   * Cleanup cache using AI-based prioritization
   */
  private cleanupCache(cacheName: string, targetReduction: number): number {
    const cache = this.caches.get(cacheName);
    if (!cache) return 0;

    const items = Array.from(cache.values());
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    const targetSize = totalSize * (1 - targetReduction);

    // Sort by priority (lowest first) and exclude sticky items
    const sortedItems = items
      .filter(item => !item.isSticky)
      .sort((a, b) => a.priority - b.priority);

    let currentSize = totalSize;
    let freedBytes = 0;

    for (const item of sortedItems) {
      if (currentSize <= targetSize) break;

      cache.delete(item.id);
      currentSize -= item.size;
      freedBytes += item.size;
    }

    console.log(`Cleaned up ${freedBytes} bytes from cache ${cacheName}`);
    return freedBytes;
  }

  /**
   * Get current memory statistics
   */
  getCurrentMemoryStats(): MemoryStats | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as any).memory;
    const stats: MemoryStats = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      timestamp: Date.now()
    };

    return stats;
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    const stats = this.getCurrentMemoryStats();
    if (!stats) return;

    this.memoryHistory.push(stats);
    
    // Keep only last 100 measurements
    if (this.memoryHistory.length > 100) {
      this.memoryHistory = this.memoryHistory.slice(-100);
    }

    // Notify observers
    this.observers.forEach(observer => observer(stats));

    // Check thresholds and trigger cleanup
    if (stats.usagePercentage >= this.thresholds.cleanup) {
      this.performEmergencyCleanup();
    } else if (stats.usagePercentage >= this.thresholds.critical) {
      this.performAggressiveCleanup();
    } else if (stats.usagePercentage >= this.thresholds.warning) {
      this.performGentleCleanup();
    }
  }

  /**
   * Initialize cleanup strategies
   */
  private initializeCleanupStrategies(): void {
    this.cleanupStrategies = [
      {
        name: 'Cache Cleanup',
        description: 'Remove least recently used cache items',
        aggressiveness: 'low',
        execute: async () => {
          let totalFreed = 0;
          for (const [cacheName] of this.caches) {
            totalFreed += this.cleanupCache(cacheName, 0.2); // Remove 20%
          }
          return totalFreed;
        }
      },
      {
        name: 'Aggressive Cache Cleanup',
        description: 'Remove more cache items with lower priority',
        aggressiveness: 'medium',
        execute: async () => {
          let totalFreed = 0;
          for (const [cacheName] of this.caches) {
            totalFreed += this.cleanupCache(cacheName, 0.5); // Remove 50%
          }
          return totalFreed;
        }
      },
      {
        name: 'Emergency Cleanup',
        description: 'Clear all non-sticky cache items',
        aggressiveness: 'high',
        execute: async () => {
          let totalFreed = 0;
          for (const [cacheName, cache] of this.caches) {
            const items = Array.from(cache.values());
            for (const item of items) {
              if (!item.isSticky) {
                cache.delete(item.id);
                totalFreed += item.size;
              }
            }
          }
          
          // Force garbage collection if available
          if ('gc' in window) {
            (window as any).gc();
          }
          
          return totalFreed;
        }
      },
      {
        name: 'DOM Cleanup',
        description: 'Remove unused DOM elements and event listeners',
        aggressiveness: 'medium',
        execute: async () => {
          // Remove unused virtual items
          const virtualItems = document.querySelectorAll('.virtual-item[data-unused="true"]');
          virtualItems.forEach(item => item.remove());
          
          // Estimate freed memory (rough calculation)
          return virtualItems.length * 1024; // 1KB per item estimate
        }
      }
    ];
  }

  /**
   * Perform gentle cleanup
   */
  private async performGentleCleanup(): Promise<void> {
    const strategy = this.cleanupStrategies.find(s => s.aggressiveness === 'low');
    if (strategy) {
      const freed = await strategy.execute();
      console.log(`Gentle cleanup freed ${freed} bytes`);
    }
  }

  /**
   * Perform aggressive cleanup
   */
  private async performAggressiveCleanup(): Promise<void> {
    const strategies = this.cleanupStrategies.filter(s => 
      s.aggressiveness === 'low' || s.aggressiveness === 'medium'
    );
    
    let totalFreed = 0;
    for (const strategy of strategies) {
      const freed = await strategy.execute();
      totalFreed += freed;
    }
    
    console.warn(`Aggressive cleanup freed ${totalFreed} bytes`);
  }

  /**
   * Perform emergency cleanup
   */
  private async performEmergencyCleanup(): Promise<void> {
    let totalFreed = 0;
    
    for (const strategy of this.cleanupStrategies) {
      const freed = await strategy.execute();
      totalFreed += freed;
    }
    
    console.error(`Emergency cleanup freed ${totalFreed} bytes`);
    
    // Additional emergency measures
    this.clearAllCaches();
    
    // Request garbage collection
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    for (const [cacheName, cache] of this.caches) {
      const items = Array.from(cache.values());
      for (const item of items) {
        if (!item.isSticky) {
          cache.delete(item.id);
        }
      }
    }
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 5) return 'stable';

    const recent = this.memoryHistory.slice(-5);
    const trend = recent.reduce((sum, stats, index) => {
      if (index === 0) return sum;
      const prev = recent[index - 1];
      return sum + (stats.usagePercentage - prev.usagePercentage);
    }, 0);

    if (trend > 5) return 'increasing';
    if (trend < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { [cacheName: string]: { itemCount: number; totalSize: number; avgPriority: number } } {
    const stats: { [cacheName: string]: { itemCount: number; totalSize: number; avgPriority: number } } = {};

    for (const [cacheName, cache] of this.caches) {
      const items = Array.from(cache.values());
      const totalSize = items.reduce((sum, item) => sum + item.size, 0);
      const avgPriority = items.length > 0 
        ? items.reduce((sum, item) => sum + item.priority, 0) / items.length 
        : 0;

      stats[cacheName] = {
        itemCount: items.length,
        totalSize,
        avgPriority
      };
    }

    return stats;
  }

  /**
   * Subscribe to memory updates
   */
  subscribe(observer: (stats: MemoryStats) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Generate memory report
   */
  generateReport(): {
    currentStats: MemoryStats | null;
    trend: 'increasing' | 'decreasing' | 'stable';
    cacheStats: { [cacheName: string]: { itemCount: number; totalSize: number; avgPriority: number } };
    recommendations: string[];
  } {
    const currentStats = this.getCurrentMemoryStats();
    const trend = this.getMemoryTrend();
    const cacheStats = this.getCacheStats();
    const recommendations = this.generateRecommendations(currentStats, trend);

    return {
      currentStats,
      trend,
      cacheStats,
      recommendations
    };
  }

  /**
   * Generate AI-powered recommendations
   */
  private generateRecommendations(stats: MemoryStats | null, trend: string): string[] {
    const recommendations: string[] = [];

    if (!stats) {
      recommendations.push('Memory monitoring not available in this browser');
      return recommendations;
    }

    if (stats.usagePercentage > this.thresholds.warning) {
      recommendations.push('Memory usage is high - consider enabling aggressive cleanup');
    }

    if (trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - monitor for memory leaks');
      recommendations.push('Consider reducing cache sizes or enabling more frequent cleanup');
    }

    const cacheStats = this.getCacheStats();
    const largeCaches = Object.entries(cacheStats)
      .filter(([, stats]) => stats.totalSize > 10 * 1024 * 1024) // > 10MB
      .map(([name]) => name);

    if (largeCaches.length > 0) {
      recommendations.push(`Large caches detected: ${largeCaches.join(', ')} - consider cleanup`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Memory usage is optimal');
    }

    return recommendations;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.clearAllCaches();
    this.observers = [];
    this.memoryHistory = [];
  }
}

/**
 * React hook for memory management
 */
export function useMemoryManager(thresholds?: Partial<MemoryThresholds>) {
  const managerRef = React.useRef<MemoryManager | null>(null);
  const [memoryStats, setMemoryStats] = React.useState<MemoryStats | null>(null);
  const [memoryTrend, setMemoryTrend] = React.useState<'increasing' | 'decreasing' | 'stable'>('stable');

  React.useEffect(() => {
    managerRef.current = new MemoryManager(thresholds);
    
    const unsubscribe = managerRef.current.subscribe((stats) => {
      setMemoryStats(stats);
      setMemoryTrend(managerRef.current!.getMemoryTrend());
    });

    managerRef.current.startMonitoring();

    return () => {
      unsubscribe();
      managerRef.current?.destroy();
    };
  }, []);

  const addToCache = React.useCallback((cacheName: string, item: CacheItem) => {
    managerRef.current?.addToCache(cacheName, item);
  }, []);

  const getFromCache = React.useCallback((cacheName: string, itemId: string) => {
    return managerRef.current?.getFromCache(cacheName, itemId);
  }, []);

  const removeFromCache = React.useCallback((cacheName: string, itemId: string) => {
    return managerRef.current?.removeFromCache(cacheName, itemId);
  }, []);

  const generateReport = React.useCallback(() => {
    return managerRef.current?.generateReport();
  }, []);

  return {
    memoryStats,
    memoryTrend,
    addToCache,
    getFromCache,
    removeFromCache,
    generateReport,
    manager: managerRef.current
  };
}