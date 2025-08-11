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
    activeRequests: number;
  };
  consecutiveFailures: number;
  lastHealthCheck: Date;
  
  // Additional methods expected by components
  clearError: () => void;
  disableFallbackMode: () => void;
  enableFallbackMode: () => void;
  sendRequest: (prompt: string, context?: any, type?: string) => Promise<string>;
  
  // Specialized AI methods - return objects with content property
  generateCode: (prompt: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  reviewCode: (code: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  generateDocumentation: (code: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  debugError: (error: string, code: string) => Promise<{ content: string; confidence?: number }>;
  modernizeCode: (code: string, language?: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  extractFunctions: (code: string) => Promise<{ content: string; confidence?: number }>;
  planArchitecture: (requirements: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  suggestComponentStructure: (description: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  generateProjectScaffolding: (description: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  analyzeCodeComplexity: (code: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  generateUnitTests: (code: string, context?: any) => Promise<{ content: string; confidence?: number }>;
  generateRegex: (description: string, options?: any) => Promise<{ content: string; confidence?: number }>;
  optimizeRegex: (pattern: string, options?: any) => Promise<{ content: string; confidence?: number }>;
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
    failed: 0,
    activeRequests: 0
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

  // Specialized AI methods - return objects with content property
  const generateCode = useCallback(async (prompt: string, context?: any) => {
    const content = await generateResponse(`Generate code: ${prompt}`, context);
    return { content, confidence: 0.8 };
  }, [generateResponse]);
  
  const reviewCode = useCallback(async (code: string, context?: any) => {
    const prompt = context?.focus ? `Review this code with focus on ${context.focus}: ${code}` : `Review this code: ${code}`;
    const content = await generateResponse(prompt, context);
    return { content, confidence: 0.9 };
  }, [generateResponse]);
  
  const generateDocumentation = useCallback(async (code: string, context?: any) => {
    const content = await generateResponse(`Generate documentation for: ${code}`, context);
    return { content, confidence: 0.85 };
  }, [generateResponse]);
  
  const debugError = useCallback(async (error: string, code: string) => {
    const content = await generateResponse(`Debug error "${error}" in code: ${code}`);
    return { content, confidence: 0.75 };
  }, [generateResponse]);
  
  const modernizeCode = useCallback(async (code: string, language?: string, context?: any) => {
    const content = await generateResponse(`Modernize this ${language || ''} code: ${code}`, context);
    return { content, confidence: 0.8 };
  }, [generateResponse]);
  
  const extractFunctions = useCallback(async (code: string) => {
    const content = await generateResponse(`Extract functions from: ${code}`);
    return { content, confidence: 0.85 };
  }, [generateResponse]);
  
  const planArchitecture = useCallback(async (requirements: string, context?: any) => {
    const content = await generateResponse(`Plan architecture for: ${requirements}`, context);
    return { content, confidence: 0.8 };
  }, [generateResponse]);
  
  const suggestComponentStructure = useCallback(async (description: string, context?: any) => {
    const content = await generateResponse(`Suggest component structure for: ${description}`, context);
    return { content, confidence: 0.8 };
  }, [generateResponse]);
  
  const generateProjectScaffolding = useCallback(async (description: string, context?: any) => {
    const content = await generateResponse(`Generate project scaffolding for: ${description}`, context);
    return { content, confidence: 0.75 };
  }, [generateResponse]);
  
  const analyzeCodeComplexity = useCallback(async (code: string, context?: any) => {
    const content = await generateResponse(`Analyze complexity of: ${code}`, context);
    return { content, confidence: 0.9 };
  }, [generateResponse]);
  
  const generateUnitTests = useCallback(async (code: string, context?: any) => {
    const content = await generateResponse(`Generate unit tests for: ${code}`, context);
    return { content, confidence: 0.85 };
  }, [generateResponse]);
  
  const generateRegex = useCallback(async (description: string, options?: any) => {
    const content = await generateResponse(`Generate regex for: ${description}`, options);
    return { content, confidence: 0.8 };
  }, [generateResponse]);
  
  const optimizeRegex = useCallback(async (pattern: string, options?: any) => {
    const content = await generateResponse(`Optimize regex pattern: ${pattern}`, options);
    return { content, confidence: 0.85 };
  }, [generateResponse]);

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
    sendRequest: (prompt: string, context?: any, type?: string) => generateResponse(prompt, context),
    
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