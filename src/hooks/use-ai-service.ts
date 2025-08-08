import { useState, useCallback } from 'react';

export interface UseAIServiceReturn {
  generateResponse: (prompt: string, context?: any) => Promise<string>;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAIService = (): UseAIServiceReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled] = useState(false); // Default to disabled for now

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
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  return {
    generateResponse,
    isEnabled,
    isLoading,
    error
  };
};