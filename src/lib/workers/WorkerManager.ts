/**
 * Worker Manager
 * Coordinates multiple worker pools and provides high-level API
 */

import { WorkerPool } from './WorkerPool';
import type { WorkerTask } from './WorkerPool';

export interface WorkerManagerConfig {
  regex: {
    maxWorkers: number;
    enabled: boolean;
  };
  ai: {
    maxWorkers: number;
    enabled: boolean;
    apiKey?: string;
    model?: string;
    rateLimitPerMinute?: number;
  };
  analysis: {
    maxWorkers: number;
    enabled: boolean;
  };
}

export interface ProgressCallback {
  (progress: number, stage?: string): void;
}

export class WorkerManager {
  private regexPool?: WorkerPool;
  private aiPool?: WorkerPool;
  private analysisPool?: WorkerPool;
  private config: WorkerManagerConfig;
  private isInitialized = false;

  constructor(config: WorkerManagerConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize regex worker pool
      if (this.config.regex.enabled) {
        this.regexPool = new WorkerPool({
          maxWorkers: this.config.regex.maxWorkers,
          workerScript: '/workers/regex-worker.js',
          taskTimeout: 30000,
          maxRetries: 2,
          loadBalancing: 'least-busy'
        });
      }

      // Initialize AI worker pool
      if (this.config.ai.enabled && this.config.ai.apiKey) {
        this.aiPool = new WorkerPool({
          maxWorkers: this.config.ai.maxWorkers,
          workerScript: '/workers/ai-worker.js',
          taskTimeout: 60000,
          maxRetries: 1,
          loadBalancing: 'priority-based'
        });

        // Configure AI rate limiting
        if (this.config.ai.rateLimitPerMinute) {
          await this.aiPool.execute({
            type: 'set-rate-limit',
            data: { requestsPerMinute: this.config.ai.rateLimitPerMinute },
            priority: 'high'
          });
        }
      }

      // Initialize analysis worker pool
      if (this.config.analysis.enabled) {
        this.analysisPool = new WorkerPool({
          maxWorkers: this.config.analysis.maxWorkers,
          workerScript: '/workers/analysis-worker.js',
          taskTimeout: 45000,
          maxRetries: 2,
          loadBalancing: 'round-robin'
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize worker manager:', error);
      throw error;
    }
  }

  // Regex Operations
  public async testRegexPattern(
    regex: string,
    flags: string,
    testCases: any[],
    options?: { maxMatches?: number },
    onProgress?: ProgressCallback
  ): Promise<any> {
    if (!this.regexPool) {
      throw new Error('Regex worker pool not initialized');
    }

    return this.regexPool.execute({
      type: 'test',
      data: { regex, flags, testCases, options },
      priority: 'medium',
      onProgress
    });
  }

  public async analyzeRegexPerformance(
    regex: string,
    flags: string,
    testInput: string
  ): Promise<any> {
    if (!this.regexPool) {
      throw new Error('Regex worker pool not initialized');
    }

    return this.regexPool.execute({
      type: 'analyze',
      data: { regex, flags, testInput },
      priority: 'low'
    });
  }

  public async validateRegex(regex: string, flags: string): Promise<any> {
    if (!this.regexPool) {
      throw new Error('Regex worker pool not initialized');
    }

    return this.regexPool.execute({
      type: 'validate',
      data: { regex, flags },
      priority: 'high'
    });
  }

  // AI Operations
  public async generateCode(
    language: string,
    framework: string,
    description: string,
    context?: string,
    onProgress?: ProgressCallback
  ): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized or API key not provided');
    }

    return this.aiPool.execute({
      type: 'generate-code',
      data: {
        language,
        framework,
        description,
        context,
        apiKey: this.config.ai.apiKey,
        model: this.config.ai.model
      },
      priority: 'medium',
      timeout: 60000,
      onProgress
    });
  }

  public async explainRegex(
    regex: string,
    flags: string,
    context?: string
  ): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized or API key not provided');
    }

    return this.aiPool.execute({
      type: 'explain-regex',
      data: {
        regex,
        flags,
        context,
        apiKey: this.config.ai.apiKey,
        model: this.config.ai.model
      },
      priority: 'medium',
      timeout: 30000
    });
  }

  public async debugCode(
    code: string,
    error: string,
    language: string,
    context?: string
  ): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized or API key not provided');
    }

    return this.aiPool.execute({
      type: 'debug-code',
      data: {
        code,
        error,
        language,
        context,
        apiKey: this.config.ai.apiKey,
        model: this.config.ai.model
      },
      priority: 'high',
      timeout: 45000
    });
  }

  public async planArchitecture(
    projectType: string,
    requirements: string,
    constraints?: string,
    preferences?: string
  ): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized or API key not provided');
    }

    return this.aiPool.execute({
      type: 'plan-architecture',
      data: {
        projectType,
        requirements,
        constraints,
        preferences,
        apiKey: this.config.ai.apiKey,
        model: this.config.ai.model
      },
      priority: 'medium',
      timeout: 90000
    });
  }

  public async refactorCode(
    code: string,
    language: string,
    goals?: string,
    constraints?: string
  ): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized or API key not provided');
    }

    return this.aiPool.execute({
      type: 'refactor-code',
      data: {
        code,
        language,
        goals,
        constraints,
        apiKey: this.config.ai.apiKey,
        model: this.config.ai.model
      },
      priority: 'medium',
      timeout: 60000
    });
  }

  public async getAIRateLimitStatus(): Promise<any> {
    if (!this.aiPool) {
      throw new Error('AI worker pool not initialized');
    }

    return this.aiPool.execute({
      type: 'get-rate-limit-status',
      data: {},
      priority: 'high'
    });
  }

  // Analysis Operations
  public async analyzeSessionComplexity(
    nodes: any[],
    connections: any[],
    onProgress?: ProgressCallback
  ): Promise<any> {
    if (!this.analysisPool) {
      throw new Error('Analysis worker pool not initialized');
    }

    return this.analysisPool.execute({
      type: 'analyze-complexity',
      data: { nodes, connections },
      priority: 'medium',
      onProgress
    });
  }

  public async analyzeProgress(
    nodes: any[],
    timeline: any[],
    timeRange?: { start: number; end: number }
  ): Promise<any> {
    if (!this.analysisPool) {
      throw new Error('Analysis worker pool not initialized');
    }

    return this.analysisPool.execute({
      type: 'analyze-progress',
      data: { nodes, timeline, timeRange },
      priority: 'low'
    });
  }

  // Batch Operations
  public async batchTestRegex(
    patterns: Array<{ regex: string; flags: string; testCases: any[] }>,
    onProgress?: ProgressCallback
  ): Promise<any[]> {
    if (!this.regexPool) {
      throw new Error('Regex worker pool not initialized');
    }

    const results = [];
    const total = patterns.length;

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      try {
        const result = await this.testRegexPattern(
          pattern.regex,
          pattern.flags,
          pattern.testCases
        );
        results.push({ success: true, result, pattern });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message, pattern });
      }

      onProgress?.((i + 1) / total, `Testing pattern ${i + 1} of ${total}`);
    }

    return results;
  }

  public async batchAnalyzeNodes(
    nodeBatches: Array<{ nodes: any[]; connections: any[] }>,
    onProgress?: ProgressCallback
  ): Promise<any[]> {
    if (!this.analysisPool) {
      throw new Error('Analysis worker pool not initialized');
    }

    const results = [];
    const total = nodeBatches.length;

    for (let i = 0; i < nodeBatches.length; i++) {
      const batch = nodeBatches[i];
      try {
        const result = await this.analyzeSessionComplexity(
          batch.nodes,
          batch.connections
        );
        results.push({ success: true, result, batch });
      } catch (error) {
        results.push({ success: false, error: (error as Error).message, batch });
      }

      onProgress?.((i + 1) / total, `Analyzing batch ${i + 1} of ${total}`);
    }

    return results;
  }

  // Configuration Management
  public updateConfig(newConfig: Partial<WorkerManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update AI rate limiting if changed
    if (newConfig.ai?.rateLimitPerMinute && this.aiPool) {
      this.aiPool.execute({
        type: 'set-rate-limit',
        data: { requestsPerMinute: newConfig.ai.rateLimitPerMinute },
        priority: 'high'
      }).catch(console.error);
    }

    // Adjust pool sizes if needed
    if (newConfig.regex?.maxWorkers && this.regexPool) {
      this.regexPool.adjustPoolSize(newConfig.regex.maxWorkers);
    }
    if (newConfig.ai?.maxWorkers && this.aiPool) {
      this.aiPool.adjustPoolSize(newConfig.ai.maxWorkers);
    }
    if (newConfig.analysis?.maxWorkers && this.analysisPool) {
      this.analysisPool.adjustPoolSize(newConfig.analysis.maxWorkers);
    }
  }

  public enableAI(apiKey: string, model?: string): void {
    this.config.ai.enabled = true;
    this.config.ai.apiKey = apiKey;
    if (model) this.config.ai.model = model;

    // Reinitialize AI pool if not already done
    if (!this.aiPool && this.isInitialized) {
      this.aiPool = new WorkerPool({
        maxWorkers: this.config.ai.maxWorkers,
        workerScript: '/workers/ai-worker.js',
        taskTimeout: 60000,
        maxRetries: 1,
        loadBalancing: 'priority-based'
      });
    }
  }

  public disableAI(): void {
    this.config.ai.enabled = false;
    this.config.ai.apiKey = undefined;

    if (this.aiPool) {
      this.aiPool.shutdown();
      this.aiPool = undefined;
    }
  }

  // Statistics and Monitoring
  public getStats() {
    const stats = {
      initialized: this.isInitialized,
      pools: {
        regex: this.regexPool ? {
          enabled: true,
          ...this.regexPool.getStats()
        } : { enabled: false },
        ai: this.aiPool ? {
          enabled: true,
          ...this.aiPool.getStats()
        } : { enabled: false },
        analysis: this.analysisPool ? {
          enabled: true,
          ...this.analysisPool.getStats()
        } : { enabled: false }
      }
    };

    return stats;
  }

  public async getDetailedStats() {
    const baseStats = this.getStats();
    
    // Add AI rate limit status if available
    if (this.aiPool) {
      try {
        const rateLimitStatus = await this.getAIRateLimitStatus();
        baseStats.pools.ai = {
          ...baseStats.pools.ai,
          rateLimitStatus
        };
      } catch (error) {
        console.warn('Failed to get AI rate limit status:', error);
      }
    }

    return baseStats;
  }

  // Cleanup
  public async shutdown(): Promise<void> {
    const shutdownPromises = [];

    if (this.regexPool) {
      shutdownPromises.push(this.regexPool.shutdown());
    }
    if (this.aiPool) {
      shutdownPromises.push(this.aiPool.shutdown());
    }
    if (this.analysisPool) {
      shutdownPromises.push(this.analysisPool.shutdown());
    }

    await Promise.all(shutdownPromises);
    this.isInitialized = false;
  }

  // Health Check
  public async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    pools: Record<string, boolean>;
  }> {
    const issues: string[] = [];
    const pools = {
      regex: false,
      ai: false,
      analysis: false
    };

    // Test regex pool
    if (this.regexPool) {
      try {
        await this.validateRegex('test', '');
        pools.regex = true;
      } catch (error) {
        issues.push(`Regex pool unhealthy: ${(error as Error).message}`);
      }
    }

    // Test AI pool
    if (this.aiPool && this.config.ai.apiKey) {
      try {
        await this.getAIRateLimitStatus();
        pools.ai = true;
      } catch (error) {
        issues.push(`AI pool unhealthy: ${(error as Error).message}`);
      }
    }

    // Test analysis pool
    if (this.analysisPool) {
      try {
        await this.analyzeSessionComplexity([], []);
        pools.analysis = true;
      } catch (error) {
        issues.push(`Analysis pool unhealthy: ${(error as Error).message}`);
      }
    }

    return {
      healthy: issues.length === 0,
      issues,
      pools
    };
  }
}