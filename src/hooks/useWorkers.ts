/**
 * React hooks for worker integration
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { WorkerManager } from '../lib/workers/WorkerManager';
import type { WorkerManagerConfig, ProgressCallback } from '../lib/workers/WorkerManager';

// Global worker manager instance
let globalWorkerManager: WorkerManager | null = null;

export interface UseWorkersConfig {
  regex?: {
    maxWorkers?: number;
    enabled?: boolean;
  };
  ai?: {
    maxWorkers?: number;
    enabled?: boolean;
    apiKey?: string;
    model?: string;
    rateLimitPerMinute?: number;
  };
  analysis?: {
    maxWorkers?: number;
    enabled?: boolean;
  };
}

export interface WorkerStats {
  initialized: boolean;
  pools: {
    regex: { enabled: boolean; [key: string]: any };
    ai: { enabled: boolean; [key: string]: any };
    analysis: { enabled: boolean; [key: string]: any };
  };
}

export function useWorkers(config?: UseWorkersConfig) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const configRef = useRef(config);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const initialize = useCallback(async () => {
    if (isInitializing || isInitialized) return;

    setIsInitializing(true);
    setError(null);

    try {
      const workerConfig: WorkerManagerConfig = {
        regex: {
          maxWorkers: configRef.current?.regex?.maxWorkers || 2,
          enabled: configRef.current?.regex?.enabled ?? true
        },
        ai: {
          maxWorkers: configRef.current?.ai?.maxWorkers || 1,
          enabled: configRef.current?.ai?.enabled ?? false,
          apiKey: configRef.current?.ai?.apiKey,
          model: configRef.current?.ai?.model || 'anthropic/claude-3-haiku',
          rateLimitPerMinute: configRef.current?.ai?.rateLimitPerMinute || 30
        },
        analysis: {
          maxWorkers: configRef.current?.analysis?.maxWorkers || 1,
          enabled: configRef.current?.analysis?.enabled ?? true
        }
      };

      if (!globalWorkerManager) {
        globalWorkerManager = new WorkerManager(workerConfig);
      } else {
        globalWorkerManager.updateConfig(workerConfig);
      }

      await globalWorkerManager.initialize();
      setIsInitialized(true);
      
      // Get initial stats
      const initialStats = globalWorkerManager.getStats();
      setStats(initialStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize workers');
      console.error('Worker initialization failed:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isInitialized]);

  const shutdown = useCallback(async () => {
    if (globalWorkerManager) {
      await globalWorkerManager.shutdown();
      globalWorkerManager = null;
      setIsInitialized(false);
      setStats(null);
    }
  }, []);

  const updateStats = useCallback(async () => {
    if (globalWorkerManager && isInitialized) {
      try {
        const newStats = await globalWorkerManager.getDetailedStats();
        setStats(newStats);
      } catch (err) {
        console.warn('Failed to update worker stats:', err);
      }
    }
  }, [isInitialized]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      // Don't shutdown on unmount as other components might be using workers
    };
  }, [initialize]);

  // Update stats periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [isInitialized, updateStats]);

  return {
    isInitialized,
    isInitializing,
    error,
    stats,
    initialize,
    shutdown,
    updateStats,
    workerManager: globalWorkerManager
  };
}

export function useRegexWorker() {
  const { workerManager, isInitialized } = useWorkers();
  const [isProcessing, setIsProcessing] = useState(false);

  const testPattern = useCallback(async (
    regex: string,
    flags: string,
    testCases: any[],
    options?: { maxMatches?: number },
    onProgress?: ProgressCallback
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.testRegexPattern(regex, flags, testCases, options, onProgress);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const analyzePerformance = useCallback(async (
    regex: string,
    flags: string,
    testInput: string
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.analyzeRegexPerformance(regex, flags, testInput);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const validateRegex = useCallback(async (regex: string, flags: string) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    return await workerManager.validateRegex(regex, flags);
  }, [workerManager, isInitialized]);

  const batchTest = useCallback(async (
    patterns: Array<{ regex: string; flags: string; testCases: any[] }>,
    onProgress?: ProgressCallback
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.batchTestRegex(patterns, onProgress);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  return {
    testPattern,
    analyzePerformance,
    validateRegex,
    batchTest,
    isProcessing,
    isAvailable: isInitialized && workerManager !== null
  };
}

export function useAIWorker() {
  const { workerManager, isInitialized } = useWorkers();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);

  const generateCode = useCallback(async (
    language: string,
    framework: string,
    description: string,
    context?: string,
    onProgress?: ProgressCallback
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.generateCode(language, framework, description, context, onProgress);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const explainRegex = useCallback(async (
    regex: string,
    flags: string,
    context?: string
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.explainRegex(regex, flags, context);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const debugCode = useCallback(async (
    code: string,
    error: string,
    language: string,
    context?: string
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.debugCode(code, error, language, context);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const planArchitecture = useCallback(async (
    projectType: string,
    requirements: string,
    constraints?: string,
    preferences?: string
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.planArchitecture(projectType, requirements, constraints, preferences);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const refactorCode = useCallback(async (
    code: string,
    language: string,
    goals?: string,
    constraints?: string
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.refactorCode(code, language, goals, constraints);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const updateRateLimitStatus = useCallback(async () => {
    if (!workerManager || !isInitialized) return;

    try {
      const status = await workerManager.getAIRateLimitStatus();
      setRateLimitStatus(status);
    } catch (error) {
      console.warn('Failed to get rate limit status:', error);
    }
  }, [workerManager, isInitialized]);

  // Update rate limit status periodically
  useEffect(() => {
    if (!isInitialized) return;

    updateRateLimitStatus();
    const interval = setInterval(updateRateLimitStatus, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [isInitialized, updateRateLimitStatus]);

  return {
    generateCode,
    explainRegex,
    debugCode,
    planArchitecture,
    refactorCode,
    rateLimitStatus,
    updateRateLimitStatus,
    isProcessing,
    isAvailable: isInitialized && workerManager !== null
  };
}

export function useAnalysisWorker() {
  const { workerManager, isInitialized } = useWorkers();
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeComplexity = useCallback(async (
    nodes: any[],
    connections: any[],
    onProgress?: ProgressCallback
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.analyzeSessionComplexity(nodes, connections, onProgress);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const analyzeProgress = useCallback(async (
    nodes: any[],
    timeline: any[],
    timeRange?: { start: number; end: number }
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.analyzeProgress(nodes, timeline, timeRange);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  const batchAnalyze = useCallback(async (
    nodeBatches: Array<{ nodes: any[]; connections: any[] }>,
    onProgress?: ProgressCallback
  ) => {
    if (!workerManager || !isInitialized) {
      throw new Error('Worker manager not initialized');
    }

    setIsProcessing(true);
    try {
      return await workerManager.batchAnalyzeNodes(nodeBatches, onProgress);
    } finally {
      setIsProcessing(false);
    }
  }, [workerManager, isInitialized]);

  return {
    analyzeComplexity,
    analyzeProgress,
    batchAnalyze,
    isProcessing,
    isAvailable: isInitialized && workerManager !== null
  };
}

export function useWorkerHealth() {
  const { workerManager, isInitialized } = useWorkers();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    if (!workerManager || !isInitialized) return;

    setIsChecking(true);
    try {
      const status = await workerManager.healthCheck();
      setHealthStatus(status);
    } catch (error) {
      setHealthStatus({
        healthy: false,
        issues: [`Health check failed: ${(error as Error).message}`],
        pools: { regex: false, ai: false, analysis: false }
      });
    } finally {
      setIsChecking(false);
    }
  }, [workerManager, isInitialized]);

  // Check health on mount and periodically
  useEffect(() => {
    if (!isInitialized) return;

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [isInitialized, checkHealth]);

  return {
    healthStatus,
    isChecking,
    checkHealth
  };
}