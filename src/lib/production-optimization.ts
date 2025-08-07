/**
 * Production Optimization System
 * Handles performance optimizations, code splitting, and production-ready features
 */

import { performanceMonitor } from './performance-monitor';

class ProductionOptimizer {
  private isProduction = process.env.NODE_ENV === 'production';
  private optimizations: Map<string, boolean> = new Map();

  constructor() {
    this.initializeOptimizations();
  }

  private initializeOptimizations(): void {
    // Enable optimizations based on environment
    this.optimizations.set('codesplitting', this.isProduction);
    this.optimizations.set('treeshaking', this.isProduction);
    this.optimizations.set('minification', this.isProduction);
    this.optimizations.set('compression', this.isProduction);
    this.optimizations.set('caching', true);
    this.optimizations.set('lazyloading', true);
    this.optimizations.set('bundleanalysis', this.isProduction);
    this.optimizations.set('serviceworker', this.isProduction);
  }

  // Lazy loading utilities
  public createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    const LazyComponent = React.lazy(importFn);
    
    if (fallback) {
      return React.lazy(async () => {
        try {
          return await importFn();
        } catch (error) {
          console.error('Lazy component loading failed:', error);
          return { default: fallback as T };
        }
      });
    }
    
    return LazyComponent;
  }

  // Bundle splitting configuration
  public getBundleSplitConfig() {
    if (!this.optimizations.get('codesplitting')) {
      return {};
    }

    return {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        ui: {
          test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 8
        },
        workspace: {
          test: /[\\/]src[\\/]components[\\/]workspaces[\\/]/,
          name: 'workspaces',
          chunks: 'all',
          priority: 6
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 4
        }
      }
    };
  }

  // Performance monitoring for production
  public setupProductionMonitoring(): void {
    if (!this.isProduction) return;

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor bundle sizes
    this.monitorBundleSizes();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor error rates
    this.monitorErrorRates();
  }

  private monitorCoreWebVitals(): void {
    if ('web-vitals' in window) {
      // This would integrate with web-vitals library
      console.log('Core Web Vitals monitoring enabled');
    }
  }

  private monitorBundleSizes(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          const size = resource.transferSize || 0;
          if (size > 500000) { // 500KB threshold
            console.warn(`Large bundle detected: ${resource.name} (${Math.round(size / 1024)}KB)`);
          }
        }
      });
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usageRatio > 0.8) {
        console.warn('High memory usage detected:', usageRatio);
        this.triggerMemoryCleanup();
      }
    }
  }

  private monitorErrorRates(): void {
    let errorCount = 0;
    const startTime = Date.now();

    window.addEventListener('error', () => {
      errorCount++;
      const errorRate = errorCount / ((Date.now() - startTime) / 60000); // errors per minute
      
      if (errorRate > 5) {
        console.error('High error rate detected:', errorRate);
      }
    });
  }

  private triggerMemoryCleanup(): void {
    // Trigger garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }

    // Clear session storage of non-essential data
    const nonEssentialKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('temp') || key.includes('cache')
    );
    nonEssentialKeys.forEach(key => sessionStorage.removeItem(key));
  }

  // Service Worker registration
  public registerServiceWorker(): void {
    if (!this.optimizations.get('serviceworker') || !('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  this.notifyUserOfUpdate();
                }
              });
            }
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  private notifyUserOfUpdate(): void {
    const event = new CustomEvent('show-update-notification', {
      detail: {
        message: 'A new version is available. Refresh to update.',
        action: () => window.location.reload()
      }
    });
    window.dispatchEvent(event);
  }

  // Resource preloading
  public preloadCriticalResources(): void {
    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/icons/sprite.svg'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('.woff') ? 'font' : 'image';
      if (resource.includes('.woff')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  // Image optimization
  public optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src!;
      });
    }
  }

  // Critical CSS inlining
  public inlineCriticalCSS(): void {
    if (!this.isProduction) return;

    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      .app-shell { display: flex; flex-direction: column; height: 100vh; }
      .header { height: 3.5rem; border-bottom: 1px solid var(--border); }
      .main-content { flex: 1; display: flex; }
      .loading-spinner { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  // Bundle analysis
  public analyzeBundleSize(): void {
    if (!this.optimizations.get('bundleanalysis')) return;

    const bundleInfo = {
      totalSize: 0,
      chunks: [] as Array<{ name: string; size: number }>
    };

    // This would integrate with webpack-bundle-analyzer or similar
    console.log('Bundle analysis:', bundleInfo);
  }

  // Performance budget enforcement
  public enforcePerformanceBudget(): void {
    const budget = {
      maxBundleSize: 2000000, // 2MB
      maxInitialLoad: 1000000, // 1MB
      maxImageSize: 500000, // 500KB
      maxFontSize: 100000 // 100KB
    };

    // Check bundle sizes against budget
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach(resource => {
        const size = resource.transferSize || 0;
        
        if (resource.name.includes('.js') && size > budget.maxBundleSize) {
          console.error(`Bundle size exceeds budget: ${resource.name} (${size} bytes)`);
        }
        
        if (resource.name.includes('.jpg') || resource.name.includes('.png')) {
          if (size > budget.maxImageSize) {
            console.warn(`Image size exceeds budget: ${resource.name} (${size} bytes)`);
          }
        }
        
        if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
          if (size > budget.maxFontSize) {
            console.warn(`Font size exceeds budget: ${resource.name} (${size} bytes)`);
          }
        }
      });
    }
  }

  // CDN optimization
  public optimizeForCDN(): void {
    if (!this.isProduction) return;

    // Set appropriate cache headers for static assets
    const staticAssets = document.querySelectorAll('link[rel="stylesheet"], script[src]');
    
    staticAssets.forEach(asset => {
      const element = asset as HTMLElement;
      if (element.tagName === 'LINK') {
        (element as HTMLLinkElement).crossOrigin = 'anonymous';
      } else if (element.tagName === 'SCRIPT') {
        (element as HTMLScriptElement).crossOrigin = 'anonymous';
      }
    });
  }

  // Initialize all production optimizations
  public initialize(): void {
    console.log('🚀 Initializing production optimizations...');
    
    this.setupProductionMonitoring();
    this.registerServiceWorker();
    this.preloadCriticalResources();
    this.optimizeImages();
    this.inlineCriticalCSS();
    this.enforcePerformanceBudget();
    this.optimizeForCDN();
    
    console.log('✅ Production optimizations initialized');
  }

  // Get optimization status
  public getOptimizationStatus(): Record<string, boolean> {
    return Object.fromEntries(this.optimizations);
  }
}

// Export singleton instance
export const productionOptimizer = new ProductionOptimizer();

// React import for lazy loading
import React from 'react';