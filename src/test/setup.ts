/**
 * Test Setup
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Web Workers for testing environment
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  
  constructor(public url: string) {}
  
  postMessage(data: any) {
    // Simulate async worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: {
            id: data.id,
            type: 'success',
            result: { success: true, mockResponse: true }
          }
        }));
      }
    }, 10);
  }
  
  terminate() {
    // Mock termination
  }
}

// Mock performance.memory for testing
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024, // 1MB
    totalJSHeapSize: 2 * 1024 * 1024, // 2MB
    jsHeapSizeLimit: 4 * 1024 * 1024 // 4MB
  },
  writable: true
});

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          getAll: vi.fn(() => ({ onsuccess: vi.fn() }))
        }))
      }))
    },
    onsuccess: vi.fn(),
    onerror: vi.fn(),
    onupgradeneeded: vi.fn()
  })),
  deleteDatabase: vi.fn()
};

// Global test setup
beforeAll(() => {
  // Mock Worker constructor
  global.Worker = MockWorker as any;
  
  // Mock IndexedDB
  global.indexedDB = mockIndexedDB as any;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  global.localStorage = localStorageMock as any;
  
  // Mock fetch for AI API calls
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'Mock AI response for testing'
          }
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      })
    })
  ) as any;
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock getComputedStyle for accessibility testing
  global.getComputedStyle = vi.fn(() => ({
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    fontSize: '16px',
    fontWeight: 'normal',
    outline: 'none',
    border: 'none',
    boxShadow: 'none'
  })) as any;
  
  // Suppress console warnings in tests
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React Router') ||
       args[0].includes('Warning: ') ||
       args[0].includes('Failed to'))
    ) {
      return;
    }
    originalWarn(...args);
  };
});

// Cleanup after each test
afterAll(() => {
  cleanup();
  vi.clearAllMocks();
});

// Custom test utilities
export const testUtils = {
  // Create a mock DOM element with accessibility issues for testing
  createAccessibilityTestElement: () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <button>Click me</button>
      <img src="test.jpg">
      <input type="text">
      <div onclick="handleClick()">Clickable div</div>
      <a href="#">Link without text</a>
    `;
    return element;
  },
  
  // Create a mock function for performance testing
  createPerformanceTestFunction: (complexity: 'light' | 'medium' | 'heavy' = 'medium') => {
    const iterations = {
      light: 100,
      medium: 1000,
      heavy: 10000
    };
    
    return (input: any) => {
      let result = 0;
      for (let i = 0; i < iterations[complexity]; i++) {
        result += Math.sqrt(i);
      }
      return result;
    };
  },
  
  // Wait for async operations to complete
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock worker manager for testing
  createMockWorkerManager: () => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
    testRegexPattern: vi.fn().mockResolvedValue({
      results: [],
      summary: { totalTests: 0, passed: 0, failed: 0 }
    }),
    generateCode: vi.fn().mockResolvedValue({
      content: 'Mock generated code',
      usage: { total_tokens: 30 }
    }),
    analyzeSessionComplexity: vi.fn().mockResolvedValue({
      overallComplexity: 5,
      bottlenecks: [],
      recommendations: []
    }),
    getStats: vi.fn().mockReturnValue({
      initialized: true,
      pools: {
        regex: { enabled: true, totalWorkers: 1, busyWorkers: 0 },
        ai: { enabled: false, totalWorkers: 0, busyWorkers: 0 },
        analysis: { enabled: true, totalWorkers: 1, busyWorkers: 0 }
      }
    })
  })
};

// Export test configuration
export const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  mockWorkers: true,
  mockAI: true,
  enablePerformanceTesting: true,
  enableAccessibilityTesting: true
};