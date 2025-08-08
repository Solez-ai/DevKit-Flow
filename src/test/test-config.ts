/**
 * Test Configuration
 * Centralized configuration for AI-enhanced testing
 */

import type { TestRunConfiguration } from './TestSuiteRunner';
import type { PerformanceThresholds } from './utils/performance-tester';
import type { AccessibilityTestOptions } from './utils/accessibility-tester';

export const DEFAULT_TEST_CONFIG: TestRunConfiguration = {
  includeUnitTests: true,
  includeIntegrationTests: true,
  includePerformanceTests: true,
  includeAccessibilityTests: true,
  aiAssisted: false, // Default to false for CI/CD environments
  performanceThresholds: {
    maxExecutionTime: 1000, // 1 second
    maxMemoryUsage: 10 * 1024 * 1024, // 10MB
    minThroughput: 100 // 100 operations per second
  },
  accessibilityOptions: {
    wcagLevel: 'AA',
    includeWarnings: true,
    checkColorContrast: true,
    checkKeyboardNavigation: true,
    checkScreenReader: true,
    checkFocus: true
  },
  parallelExecution: true,
  maxConcurrency: 4
};

export const PERFORMANCE_THRESHOLDS: Record<string, PerformanceThresholds> = {
  strict: {
    maxExecutionTime: 100,
    maxMemoryUsage: 5 * 1024 * 1024, // 5MB
    minThroughput: 500
  },
  moderate: {
    maxExecutionTime: 500,
    maxMemoryUsage: 10 * 1024 * 1024, // 10MB
    minThroughput: 200
  },
  relaxed: {
    maxExecutionTime: 2000,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minThroughput: 50
  }
};

export const ACCESSIBILITY_CONFIGS: Record<string, AccessibilityTestOptions> = {
  strict: {
    wcagLevel: 'AAA',
    includeWarnings: true,
    checkColorContrast: true,
    checkKeyboardNavigation: true,
    checkScreenReader: true,
    checkFocus: true
  },
  standard: {
    wcagLevel: 'AA',
    includeWarnings: true,
    checkColorContrast: true,
    checkKeyboardNavigation: true,
    checkScreenReader: true,
    checkFocus: true
  },
  basic: {
    wcagLevel: 'A',
    includeWarnings: false,
    checkColorContrast: false,
    checkKeyboardNavigation: true,
    checkScreenReader: true,
    checkFocus: false
  }
};

export const AI_TEST_PROMPTS = {
  unitTest: `Generate comprehensive unit test cases that cover:
- Happy path scenarios with valid inputs
- Edge cases and boundary conditions
- Error conditions and exception handling
- Input validation and sanitization
- Return value verification
- Side effect testing`,

  integrationTest: `Generate integration test cases that cover:
- Component interaction with dependencies
- Data flow between components
- Event handling and state management
- API integration scenarios
- Error propagation and handling
- Cross-component communication`,

  performanceTest: `Generate performance test cases that cover:
- Execution time under normal conditions
- Memory usage patterns and leaks
- Throughput under various loads
- Scalability with increasing data
- Resource cleanup verification
- Bottleneck identification`,

  accessibilityTest: `Generate accessibility test cases that cover:
- ARIA labels and roles compliance
- Keyboard navigation functionality
- Screen reader compatibility
- Color contrast requirements
- Semantic HTML structure
- Focus management
- Alternative text for media`
};

export function createTestConfig(overrides: Partial<TestRunConfiguration> = {}): TestRunConfiguration {
  return {
    ...DEFAULT_TEST_CONFIG,
    ...overrides,
    performanceThresholds: {
      ...DEFAULT_TEST_CONFIG.performanceThresholds,
      ...overrides.performanceThresholds
    },
    accessibilityOptions: {
      ...DEFAULT_TEST_CONFIG.accessibilityOptions,
      ...overrides.accessibilityOptions
    }
  };
}

export function getPerformanceConfig(level: 'strict' | 'moderate' | 'relaxed' = 'moderate'): PerformanceThresholds {
  return PERFORMANCE_THRESHOLDS[level];
}

export function getAccessibilityConfig(level: 'strict' | 'standard' | 'basic' = 'standard'): AccessibilityTestOptions {
  return ACCESSIBILITY_CONFIGS[level];
}

// Environment-specific configurations
export const CI_TEST_CONFIG: TestRunConfiguration = createTestConfig({
  aiAssisted: false, // Disable AI in CI to avoid API costs
  parallelExecution: true,
  maxConcurrency: 2, // Lower concurrency for CI environments
  performanceThresholds: getPerformanceConfig('relaxed'), // More lenient in CI
  accessibilityOptions: getAccessibilityConfig('standard')
});

export const DEVELOPMENT_TEST_CONFIG: TestRunConfiguration = createTestConfig({
  aiAssisted: true, // Enable AI in development
  parallelExecution: true,
  maxConcurrency: 4,
  performanceThresholds: getPerformanceConfig('moderate'),
  accessibilityOptions: getAccessibilityConfig('strict')
});

export const PRODUCTION_TEST_CONFIG: TestRunConfiguration = createTestConfig({
  aiAssisted: false, // Disable AI in production testing
  parallelExecution: true,
  maxConcurrency: 8,
  performanceThresholds: getPerformanceConfig('strict'),
  accessibilityOptions: getAccessibilityConfig('strict')
});

// Test environment detection
export function getEnvironmentConfig(): TestRunConfiguration {
  const env = process.env.NODE_ENV || 'development';
  const isCI = process.env.CI === 'true';

  if (isCI) {
    return CI_TEST_CONFIG;
  }

  switch (env) {
    case 'production':
      return PRODUCTION_TEST_CONFIG;
    case 'development':
      return DEVELOPMENT_TEST_CONFIG;
    default:
      return DEFAULT_TEST_CONFIG;
  }
}