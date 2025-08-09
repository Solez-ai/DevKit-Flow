import { useState, useCallback } from 'react';

export interface UseAIServiceReturn {
  // Core functionality
  generateResponse: (prompt: string, context?: any) => Promise<string>;
  isEnabled: boolean;
  isLoading: boolean;
  error: { message: string; code?: string; retryAfter?: number } | null;
  
  // Extended properties expected by components
  isAvailable: boolean;
  isFallbackMode: boolean;
  serviceStatus: 'healthy' | 'degraded' | 'unavailable';
  queueStatus: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  consecutiveFailures: number;
  lastHealthCheck: Date;
  
  // Additional methods expected by components
  clearError: () => void;
  disableFallbackMode: () => void;
  enableFallbackMode: () => void;
  sendRequest: (prompt: string, context?: any) => Promise<string>;
  
  // Specialized AI methods
  generateCode: (prompt: string) => Promise<string>;
  reviewCode: (code: string) => Promise<string>;
  generateDocumentation: (code: string) => Promise<string>;
  debugError: (error: string, code: string) => Promise<string>;
  modernizeCode: (code: string) => Promise<string>;
  extractFunctions: (code: string) => Promise<string>;
  planArchitecture: (requirements: string) => Promise<string>;
  suggestComponentStructure: (description: string) => Promise<string>;
  generateProjectScaffolding: (description: string) => Promise<string>;
  analyzeCodeComplexity: (code: string) => Promise<string>;
  generateUnitTests: (code: string) => Promise<string>;
  generateRegex: (description: string) => Promise<string>;
  optimizeRegex: (pattern: string) => Promise<string>;
}

export const useAIService = (): UseAIServiceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; retryAfter?: number } | null>(null);
  const [isEnabled] = useState(false); // Default to disabled for now
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [queueStatus] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });

  const generateResponse = useCallback(async (prompt: string, context?: any): Promise<string> => {
    if (!isEnabled) {
      throw new Error('AI service is not enabled');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation - replace with actual AI service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `AI response for: ${prompt}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError({ message: errorMessage, code: 'SERVICE_ERROR' });
      setConsecutiveFailures(prev => prev + 1);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  // Helper methods
  const clearError = useCallback(() => {
    setError(null);
    setConsecutiveFailures(0);
  }, []);

  const disableFallbackMode = useCallback(() => {
    setIsFallbackMode(false);
  }, []);

  const enableFallbackMode = useCallback(() => {
    setIsFallbackMode(true);
  }, []);

  // Specialized AI methods - all use generateResponse internally
  const generateCode = useCallback((prompt: string) => generateResponse(`Generate code: ${prompt}`), [generateResponse]);
  const reviewCode = useCallback((code: string) => generateResponse(`Review this code: ${code}`), [generateResponse]);
  const generateDocumentation = useCallback((code: string) => generateResponse(`Generate documentation for: ${code}`), [generateResponse]);
  const debugError = useCallback((error: string, code: string) => generateResponse(`Debug error "${error}" in code: ${code}`), [generateResponse]);
  const modernizeCode = useCallback((code: string) => generateResponse(`Modernize this code: ${code}`), [generateResponse]);
  const extractFunctions = useCallback((code: string) => generateResponse(`Extract functions from: ${code}`), [generateResponse]);
  const planArchitecture = useCallback((requirements: string) => generateResponse(`Plan architecture for: ${requirements}`), [generateResponse]);
  const suggestComponentStructure = useCallback((description: string) => generateResponse(`Suggest component structure for: ${description}`), [generateResponse]);
  const generateProjectScaffolding = useCallback((description: string) => generateResponse(`Generate project scaffolding for: ${description}`), [generateResponse]);
  const analyzeCodeComplexity = useCallback((code: string) => generateResponse(`Analyze complexity of: ${code}`), [generateResponse]);
  const generateUnitTests = useCallback((code: string) => generateResponse(`Generate unit tests for: ${code}`), [generateResponse]);
  const generateRegex = useCallback((description: string) => generateResponse(`Generate regex for: ${description}`), [generateResponse]);
  const optimizeRegex = useCallback((pattern: string) => generateResponse(`Optimize regex pattern: ${pattern}`), [generateResponse]);

  return {
    // Core functionality
    generateResponse,
    isEnabled,
    isLoading,
    error,
    
    // Extended properties
    isAvailable: isEnabled,
    isFallbackMode,
    serviceStatus: error ? 'unavailable' : (consecutiveFailures > 0 ? 'degraded' : 'healthy'),
    queueStatus,
    consecutiveFailures,
    lastHealthCheck: new Date(),
    
    // Additional methods
    clearError,
    disableFallbackMode,
    enableFallbackMode,
    sendRequest: generateResponse,
    
    // Specialized AI methods
    generateCode,
    reviewCode,
    generateDocumentation,
    debugError,
    modernizeCode,
    extractFunctions,
    planArchitecture,
    suggestComponentStructure,
    generateProjectScaffolding,
    analyzeCodeComplexity,
    generateUnitTests,
    generateRegex,
    optimizeRegex
  };
};

// Alias for backward compatibility
export const useAIServiceStatus = useAIService;