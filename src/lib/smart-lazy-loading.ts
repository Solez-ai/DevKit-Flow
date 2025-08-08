/**
 * Smart Lazy Loading System
 * AI-powered lazy loading based on user behavior patterns
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface LazyLoadingConfig {
  threshold: number; // Distance from viewport to start loading
  rootMargin: string;
  aiPredictionEnabled: boolean;
  maxConcurrentLoads: number;
  retryAttempts: number;
  cacheSize: number;
}

export interface LoadableItem {
  id: string;
  src?: string;
  data?: any;
  priority: number;
  isLoaded: boolean;
  isLoading: boolean;
  loadAttempts: number;
  lastAccessed: number;
  userInteractionScore: number;
}

export interface UserBehaviorPattern {
  scrollDirection: 'up' | 'down' | 'none';
  scrollSpeed: number;
  averageViewTime: number;
  interactionFrequency: number;
  preferredContentTypes: string[];
  timeOfDay: number;
  sessionDuration: number;
}

export class SmartLazyLoader {
  private config: LazyLoadingConfig;
  private loadQueue: LoadableItem[] = [];
  private loadedCache = new Map<string, any>();
  private userBehavior: UserBehaviorPattern;
  private intersectionObserver: IntersectionObserver | null = null;
  private loadingPromises = new Map<string, Promise<any>>();
  private behaviorTracker: BehaviorTracker;

  constructor(config: Partial<LazyLoadingConfig> = {}) {
    this.config = {
      threshold: 0.1,
      rootMargin: '50px',
      aiPredictionEnabled: true,
      maxConcurrentLoads: 3,
      retryAttempts: 3,
      cacheSize: 100,
      ...config
    };

    this.userBehavior = {
      scrollDirection: 'none',
      scrollSpeed: 0,
      averageViewTime: 0,
      interactionFrequency: 0,
      preferredContentTypes: [],
      timeOfDay: new Date().getHours(),
      sessionDuration: 0
    };

    this.behaviorTracker = new BehaviorTracker();
    this.setupIntersectionObserver();
  }

  /**
   * Setup intersection observer for viewport detection
   */
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const itemId = entry.target.getAttribute('data-lazy-id');
          if (itemId) {
            if (entry.isIntersecting) {
              this.handleItemVisible(itemId);
            } else {
              this.handleItemHidden(itemId);
            }
          }
        });
      },
      {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      }
    );
  }

  /**
   * Register an item for lazy loading
   */
  registerItem(item: Partial<LoadableItem> & { id: string }): void {
    const loadableItem: LoadableItem = {
      priority: 0,
      isLoaded: false,
      isLoading: false,
      loadAttempts: 0,
      lastAccessed: 0,
      userInteractionScore: 0,
      ...item
    };

    // Calculate initial priority based on AI prediction
    if (this.config.aiPredictionEnabled) {
      loadableItem.priority = this.calculateAIPriority(loadableItem);
    }

    this.loadQueue.push(loadableItem);
    this.sortLoadQueue();
  }

  /**
   * Observe an element for lazy loading
   */
  observe(element: Element, itemId: string): void {
    element.setAttribute('data-lazy-id', itemId);
    this.intersectionObserver?.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: Element): void {
    this.intersectionObserver?.unobserve(element);
  }

  /**
   * Handle item becoming visible
   */
  private handleItemVisible(itemId: string): void {
    const item = this.loadQueue.find(i => i.id === itemId);
    if (!item || item.isLoaded || item.isLoading) return;

    // Update user behavior
    this.behaviorTracker.trackItemView(itemId);
    item.lastAccessed = Date.now();
    item.userInteractionScore += 1;

    // Start loading if within concurrent limit
    const currentLoading = this.loadQueue.filter(i => i.isLoading).length;
    if (currentLoading < this.config.maxConcurrentLoads) {
      this.loadItem(item);
    }

    // Predict and preload nearby items
    if (this.config.aiPredictionEnabled) {
      this.predictAndPreload(itemId);
    }
  }

  /**
   * Handle item becoming hidden
   */
  private handleItemHidden(itemId: string): void {
    this.behaviorTracker.trackItemHidden(itemId);
  }

  /**
   * Load an individual item
   */
  private async loadItem(item: LoadableItem): Promise<void> {
    if (item.isLoaded || item.isLoading) return;

    item.isLoading = true;
    item.loadAttempts += 1;

    try {
      // Check cache first
      if (this.loadedCache.has(item.id)) {
        item.data = this.loadedCache.get(item.id);
        item.isLoaded = true;
        item.isLoading = false;
        return;
      }

      // Load the item
      const loadPromise = this.performLoad(item);
      this.loadingPromises.set(item.id, loadPromise);

      const data = await loadPromise;
      
      // Cache the result
      this.cacheItem(item.id, data);
      
      item.data = data;
      item.isLoaded = true;
      item.isLoading = false;

      this.loadingPromises.delete(item.id);

      // Process next item in queue
      this.processLoadQueue();

    } catch (error) {
      item.isLoading = false;
      
      // Retry if attempts remaining
      if (item.loadAttempts < this.config.retryAttempts) {
        setTimeout(() => {
          this.loadItem(item);
        }, Math.pow(2, item.loadAttempts) * 1000); // Exponential backoff
      } else {
        console.error(`Failed to load item ${item.id} after ${item.loadAttempts} attempts:`, error);
      }
    }
  }

  /**
   * Perform the actual loading operation
   */
  private async performLoad(item: LoadableItem): Promise<any> {
    if (item.src) {
      // Load image or other resource
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = item.src;
      });
    } else if (item.data) {
      // Simulate async data loading
      await new Promise(resolve => setTimeout(resolve, 100));
      return item.data;
    } else {
      throw new Error('No src or data provided for loading');
    }
  }

  /**
   * Cache loaded item
   */
  private cacheItem(id: string, data: any): void {
    // Remove oldest items if cache is full
    if (this.loadedCache.size >= this.config.cacheSize) {
      const oldestKey = this.loadedCache.keys().next().value;
      this.loadedCache.delete(oldestKey);
    }

    this.loadedCache.set(id, data);
  }

  /**
   * Calculate AI-based priority for an item
   */
  private calculateAIPriority(item: LoadableItem): number {
    let priority = 0;

    // Base priority on user interaction score
    priority += item.userInteractionScore * 0.3;

    // Consider recency of access
    const timeSinceAccess = Date.now() - item.lastAccessed;
    const recencyScore = Math.max(0, 1 - timeSinceAccess / (1000 * 60 * 5)); // 5 minutes
    priority += recencyScore * 0.2;

    // Consider user behavior patterns
    const behaviorScore = this.behaviorTracker.getPredictionScore(item.id);
    priority += behaviorScore * 0.3;

    // Consider time of day patterns
    const timeScore = this.getTimeBasedScore();
    priority += timeScore * 0.1;

    // Consider content type preferences
    const contentScore = this.getContentTypeScore(item);
    priority += contentScore * 0.1;

    return Math.min(1, Math.max(0, priority));
  }

  /**
   * Get time-based scoring
   */
  private getTimeBasedScore(): number {
    const currentHour = new Date().getHours();
    // Higher score during typical usage hours (9 AM - 6 PM)
    if (currentHour >= 9 && currentHour <= 18) {
      return 0.8;
    } else if (currentHour >= 19 && currentHour <= 22) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  /**
   * Get content type preference score
   */
  private getContentTypeScore(item: LoadableItem): number {
    // This would be based on user's preferred content types
    // For now, return a neutral score
    return 0.5;
  }

  /**
   * Predict and preload nearby items
   */
  private predictAndPreload(currentItemId: string): void {
    const currentIndex = this.loadQueue.findIndex(item => item.id === currentItemId);
    if (currentIndex === -1) return;

    // Predict scroll direction and preload accordingly
    const scrollDirection = this.behaviorTracker.getScrollDirection();
    const preloadCount = Math.min(3, this.config.maxConcurrentLoads);

    let indicesToPreload: number[] = [];

    if (scrollDirection === 'down') {
      // Preload items below
      for (let i = 1; i <= preloadCount; i++) {
        const index = currentIndex + i;
        if (index < this.loadQueue.length) {
          indicesToPreload.push(index);
        }
      }
    } else if (scrollDirection === 'up') {
      // Preload items above
      for (let i = 1; i <= preloadCount; i++) {
        const index = currentIndex - i;
        if (index >= 0) {
          indicesToPreload.push(index);
        }
      }
    } else {
      // Preload items in both directions
      for (let i = 1; i <= Math.floor(preloadCount / 2); i++) {
        if (currentIndex + i < this.loadQueue.length) {
          indicesToPreload.push(currentIndex + i);
        }
        if (currentIndex - i >= 0) {
          indicesToPreload.push(currentIndex - i);
        }
      }
    }

    // Load predicted items
    indicesToPreload.forEach(index => {
      const item = this.loadQueue[index];
      if (!item.isLoaded && !item.isLoading) {
        item.priority += 0.2; // Boost priority for predicted items
        this.loadItem(item);
      }
    });
  }

  /**
   * Sort load queue by priority
   */
  private sortLoadQueue(): void {
    this.loadQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process load queue
   */
  private processLoadQueue(): void {
    const currentLoading = this.loadQueue.filter(i => i.isLoading).length;
    const availableSlots = this.config.maxConcurrentLoads - currentLoading;

    if (availableSlots > 0) {
      const itemsToLoad = this.loadQueue
        .filter(item => !item.isLoaded && !item.isLoading)
        .slice(0, availableSlots);

      itemsToLoad.forEach(item => this.loadItem(item));
    }
  }

  /**
   * Get loaded item data
   */
  getLoadedData(itemId: string): any {
    const item = this.loadQueue.find(i => i.id === itemId);
    return item?.data || this.loadedCache.get(itemId);
  }

  /**
   * Check if item is loaded
   */
  isLoaded(itemId: string): boolean {
    const item = this.loadQueue.find(i => i.id === itemId);
    return item?.isLoaded || this.loadedCache.has(itemId);
  }

  /**
   * Check if item is loading
   */
  isLoading(itemId: string): boolean {
    const item = this.loadQueue.find(i => i.id === itemId);
    return item?.isLoading || false;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedCache.clear();
  }

  /**
   * Destroy the lazy loader
   */
  destroy(): void {
    this.intersectionObserver?.disconnect();
    this.loadedCache.clear();
    this.loadQueue = [];
    this.loadingPromises.clear();
    this.behaviorTracker.destroy();
  }
}

/**
 * Behavior Tracker for AI predictions
 */
class BehaviorTracker {
  private scrollHistory: { timestamp: number; direction: 'up' | 'down' | 'none'; speed: number }[] = [];
  private viewHistory: { itemId: string; timestamp: number; duration?: number }[] = [];
  private lastScrollPosition = 0;
  private lastScrollTime = 0;

  constructor() {
    this.setupScrollTracking();
  }

  private setupScrollTracking(): void {
    let scrollTimeout: NodeJS.Timeout;

    window.addEventListener('scroll', () => {
      const currentPosition = window.scrollY;
      const currentTime = Date.now();
      
      const direction = currentPosition > this.lastScrollPosition ? 'down' : 
                       currentPosition < this.lastScrollPosition ? 'up' : 'none';
      
      const speed = Math.abs(currentPosition - this.lastScrollPosition) / 
                   Math.max(1, currentTime - this.lastScrollTime);

      this.scrollHistory.push({
        timestamp: currentTime,
        direction,
        speed
      });

      // Keep only recent history
      if (this.scrollHistory.length > 50) {
        this.scrollHistory = this.scrollHistory.slice(-50);
      }

      this.lastScrollPosition = currentPosition;
      this.lastScrollTime = currentTime;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.scrollHistory.push({
          timestamp: Date.now(),
          direction: 'none',
          speed: 0
        });
      }, 150);
    });
  }

  trackItemView(itemId: string): void {
    this.viewHistory.push({
      itemId,
      timestamp: Date.now()
    });
  }

  trackItemHidden(itemId: string): void {
    const lastView = this.viewHistory
      .reverse()
      .find(view => view.itemId === itemId && !view.duration);
    
    if (lastView) {
      lastView.duration = Date.now() - lastView.timestamp;
    }
  }

  getScrollDirection(): 'up' | 'down' | 'none' {
    const recentScrolls = this.scrollHistory.slice(-5);
    if (recentScrolls.length === 0) return 'none';

    const downCount = recentScrolls.filter(s => s.direction === 'down').length;
    const upCount = recentScrolls.filter(s => s.direction === 'up').length;

    if (downCount > upCount) return 'down';
    if (upCount > downCount) return 'up';
    return 'none';
  }

  getPredictionScore(itemId: string): number {
    const viewCount = this.viewHistory.filter(v => v.itemId === itemId).length;
    const recentViews = this.viewHistory
      .filter(v => v.itemId === itemId && Date.now() - v.timestamp < 5 * 60 * 1000)
      .length;

    return Math.min(1, (viewCount * 0.1) + (recentViews * 0.3));
  }

  destroy(): void {
    this.scrollHistory = [];
    this.viewHistory = [];
  }
}

/**
 * React hook for smart lazy loading
 */
export function useSmartLazyLoading(config?: Partial<LazyLoadingConfig>) {
  const loaderRef = useRef<SmartLazyLoader | null>(null);
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loaderRef.current = new SmartLazyLoader(config);

    return () => {
      loaderRef.current?.destroy();
    };
  }, []);

  const registerItem = useCallback((item: Partial<LoadableItem> & { id: string }) => {
    loaderRef.current?.registerItem(item);
  }, []);

  const observe = useCallback((element: Element, itemId: string) => {
    loaderRef.current?.observe(element, itemId);
  }, []);

  const unobserve = useCallback((element: Element) => {
    loaderRef.current?.unobserve(element);
  }, []);

  const isLoaded = useCallback((itemId: string) => {
    return loaderRef.current?.isLoaded(itemId) || false;
  }, []);

  const isLoading = useCallback((itemId: string) => {
    return loaderRef.current?.isLoading(itemId) || false;
  }, []);

  const getLoadedData = useCallback((itemId: string) => {
    return loaderRef.current?.getLoadedData(itemId);
  }, []);

  return {
    registerItem,
    observe,
    unobserve,
    isLoaded,
    isLoading,
    getLoadedData,
    loader: loaderRef.current
  };
}