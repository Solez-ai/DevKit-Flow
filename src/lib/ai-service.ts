import { ClaudeMCPClient } from './claude-mcp-client'
import { builtInPromptTemplates } from './prompt-templates'
import type { 
  ClaudeMCPConfig, 
  AIRequest, 
  AIResponse, 
  AIError,
  PromptTemplate,
  AIServiceStatus
} from '@/types'

/**
 * AI Service Manager
 * Manages AI integration and provides high-level interface for AI features
 */
export class AIService {
  private client: ClaudeMCPClient
  private isInitialized = false
  private fallbackMode = false
  private serviceStatus: 'unknown' | 'healthy' | 'degraded' | 'unavailable' = 'unknown'
  private lastHealthCheck = 0
  private healthCheckInterval = 30000 // 30 seconds
  private consecutiveFailures = 0
  private maxConsecutiveFailures = 3
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private statusListeners: Set<(status: AIServiceStatus) => void> = new Set()

  constructor() {
    // Initialize with default configuration
    const defaultConfig: ClaudeMCPConfig = {
      isEnabled: false,
      baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'anthropic/claude-3-haiku',
      rateLimiting: {
        requestsPerMinute: 20,
        cooldownPeriod: 60,
        maxConcurrentRequests: 3
      },
      promptTemplates: [...builtInPromptTemplates]
    }

    this.client = new ClaudeMCPClient(defaultConfig)
    
    // Start periodic health checks
    this.startHealthMonitoring()
  }

  /**
   * Initialize AI service with user configuration
   */
  async initialize(config: Partial<ClaudeMCPConfig>): Promise<void> {
    try {
      this.client.updateConfig(config)
      
      // Test connection if API key is provided
      if (config.apiKey && config.isEnabled) {
        await this.testConnection()
        this.serviceStatus = 'healthy'
        this.consecutiveFailures = 0
      }
      
      this.isInitialized = true
      this.fallbackMode = false
      this.notifyStatusListeners()
    } catch (error) {
      console.warn('AI service initialization failed, falling back to offline mode:', error)
      this.handleServiceFailure(error as Error)
      this.isInitialized = true
    }
  }

  /**
   * Test AI service connection
   */
  private async testConnection(): Promise<void> {
    try {
      // Use a minimal test request to avoid quota usage
      await this.client.sendRequest('ping', {}, undefined, true)
      this.serviceStatus = 'healthy'
      this.consecutiveFailures = 0
    } catch (error) {
      this.consecutiveFailures++
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.serviceStatus = 'unavailable'
      } else {
        this.serviceStatus = 'degraded'
      }
      throw new Error(`AI service connection test failed: ${error}`)
    }
  }

  /**
   * Check if AI features are available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.client.isEnabled() && !this.fallbackMode && this.serviceStatus !== 'unavailable'
  }

  /**
   * Check if in fallback mode
   */
  isFallbackMode(): boolean {
    return this.fallbackMode
  }

  /**
   * Get current service status
   */
  getServiceStatus(): 'unknown' | 'healthy' | 'degraded' | 'unavailable' {
    return this.serviceStatus
  }

  /**
   * Enable fallback mode (offline operation)
   */
  enableFallbackMode(reason?: string): void {
    this.fallbackMode = true
    this.serviceStatus = 'unavailable'
    console.log(`AI service fallback mode enabled: ${reason || 'Manual activation'}`)
    this.notifyStatusListeners()
  }

  /**
   * Disable fallback mode and retry AI connection
   */
  async disableFallbackMode(): Promise<void> {
    this.fallbackMode = false
    if (this.client.isEnabled()) {
      try {
        await this.testConnection()
        this.notifyStatusListeners()
      } catch (error) {
        this.handleServiceFailure(error as Error)
        throw error
      }
    }
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck()
    }, this.healthCheckInterval)
  }

  /**
   * Perform health check if service is enabled
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.client.isEnabled() || this.fallbackMode) {
      return
    }

    const now = Date.now()
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return
    }

    this.lastHealthCheck = now

    try {
      await this.testConnection()
      
      // If we were in degraded state and health check passes, try to recover
      if (this.serviceStatus === 'degraded') {
        this.serviceStatus = 'healthy'
        this.consecutiveFailures = 0
        this.notifyStatusListeners()
      }
    } catch (error) {
      this.handleServiceFailure(error as Error, false)
    }
  }

  /**
   * Handle service failure with automatic fallback
   */
  private handleServiceFailure(error: Error, enableFallback = true): void {
    this.consecutiveFailures++
    
    // Enhanced failure detection based on error type
    // const isTemporaryFailure = this.isTemporaryFailure(error)
    const isCriticalFailure = this.isCriticalFailure(error)
    
    if (isCriticalFailure || this.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.serviceStatus = 'unavailable'
      if (enableFallback) {
        this.fallbackMode = true
        this.notifyFallbackActivation(error, isCriticalFailure ? 'critical' : 'consecutive')
      }
    } else {
      this.serviceStatus = 'degraded'
      this.notifyServiceDegradation(error)
    }

    console.warn(`AI service failure (${this.consecutiveFailures}/${this.maxConsecutiveFailures}):`, error.message)
    this.notifyStatusListeners()

    // Schedule retry with enhanced exponential backoff
    if (!isCriticalFailure) {
      this.scheduleRetry()
    }
  }

  /**
   * Check if error is temporary and retryable
   */
  private isTemporaryFailure(error: Error): boolean {
    const temporaryErrors = [
      'network',
      'timeout',
      'fetch',
      'connection',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT'
    ]
    
    return temporaryErrors.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    ) || (error as any).status >= 500
  }

  /**
   * Check if error is critical and requires immediate fallback
   */
  private isCriticalFailure(error: Error): boolean {
    const criticalErrors = [
      'invalid api key',
      'unauthorized',
      'forbidden',
      'quota exceeded',
      'billing',
      'suspended'
    ]
    
    return criticalErrors.some(keyword => 
      error.message.toLowerCase().includes(keyword)
    ) || (error as any).status === 401 || (error as any).status === 403
  }

  /**
   * Notify about fallback mode activation
   */
  private notifyFallbackActivation(error: Error, reason: 'critical' | 'consecutive'): void {
    const message = reason === 'critical' 
      ? `AI service disabled due to critical error: ${error.message}`
      : `AI service disabled after ${this.consecutiveFailures} consecutive failures`
    
    // Dispatch custom event for UI components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-fallback-activated', {
        detail: { 
          error, 
          reason, 
          message, 
          consecutiveFailures: this.consecutiveFailures,
          timestamp: new Date(),
          errorCode: (error as any).code || 'UNKNOWN_ERROR'
        }
      }))
    }
  }

  /**
   * Notify about service degradation
   */
  private notifyServiceDegradation(error: Error): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-service-degraded', {
        detail: { 
          error, 
          consecutiveFailures: this.consecutiveFailures,
          maxFailures: this.maxConsecutiveFailures,
          message: `AI service experiencing issues (${this.consecutiveFailures}/${this.maxConsecutiveFailures} failures)`,
          timestamp: new Date(),
          errorCode: (error as any).code || 'UNKNOWN_ERROR',
          isTemporary: this.isTemporaryFailure(error)
        }
      }))
    }
  }

  /**
   * Notify about service recovery
   */
  private notifyServiceRecovery(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-service-recovered', {
        detail: {
          previousFailures: this.consecutiveFailures,
          recoveryTime: new Date(),
          serviceStatus: this.serviceStatus
        }
      }))
    }
  }

  /**
   * Schedule automatic retry with enhanced exponential backoff
   */
  private scheduleRetry(): void {
    const retryKey = 'health-check'
    
    // Clear existing retry timeout
    const existingTimeout = this.retryTimeouts.get(retryKey)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Enhanced retry delay calculation with jitter
    const baseDelay = 5000 // 5 seconds
    const maxDelay = 300000 // 5 minutes
    const exponentialDelay = baseDelay * Math.pow(2, this.consecutiveFailures - 1)
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay
    const delay = Math.min(exponentialDelay + jitter, maxDelay)

    // Notify about scheduled retry
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-retry-scheduled', {
        detail: { 
          delay, 
          attempt: this.consecutiveFailures,
          nextRetryTime: new Date(Date.now() + delay)
        }
      }))
    }

    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(retryKey)
      
      if (!this.fallbackMode && this.client.isEnabled()) {
        // Notify about retry attempt
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ai-retry-attempt', {
            detail: { attempt: this.consecutiveFailures }
          }))
        }

        try {
          await this.testConnection()
          console.log('AI service recovery successful')
          
          // Notify about successful recovery
          this.notifyServiceRecovery()
        } catch (error) {
          this.handleServiceFailure(error as Error, false)
        }
      }
    }, delay)

    this.retryTimeouts.set(retryKey, timeout)
  }

  /**
   * Add status change listener
   */
  addStatusListener(listener: (status: AIServiceStatus) => void): void {
    this.statusListeners.add(listener)
  }

  /**
   * Remove status change listener
   */
  removeStatusListener(listener: (status: AIServiceStatus) => void): void {
    this.statusListeners.delete(listener)
  }

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(): void {
    const status: AIServiceStatus = {
      isAvailable: this.isAvailable(),
      isFallbackMode: this.isFallbackMode(),
      serviceStatus: this.serviceStatus,
      consecutiveFailures: this.consecutiveFailures,
      lastHealthCheck: new Date(this.lastHealthCheck),
      queueStatus: this.client.getQueueStatus()
    }

    this.statusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in AI service status listener:', error)
      }
    })
  }

  // Code Assistant Methods

  /**
   * Execute AI request with automatic fallback handling
   */
  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackMessage: string
  ): Promise<T> {
    if (!this.isAvailable()) {
      throw this.createFallbackError(fallbackMessage)
    }

    try {
      const result = await operation()
      
      // Reset failure count on successful request
      if (this.consecutiveFailures > 0) {
        this.consecutiveFailures = 0
        this.serviceStatus = 'healthy'
        this.notifyStatusListeners()
      }
      
      return result
    } catch (error) {
      this.handleServiceFailure(error as Error)
      throw error
    }
  }

  // Code Assistant Methods

  /**
   * Generate code based on requirements
   */
  async generateCode(
    requirements: string,
    context?: {
      language?: string
      framework?: string
      existingCode?: string
      style?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(requirements, context, 'code-generation'),
      'Code generation requires AI features'
    )
  }

  /**
   * Review code and provide suggestions
   */
  async reviewCode(
    code: string,
    context?: {
      language?: string
      focus?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, context, 'code-review'),
      'Code review requires AI features'
    )
  }

  /**
   * Generate function documentation
   */
  async generateDocumentation(
    code: string,
    context?: {
      language?: string
      style?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, context, 'function-documentation'),
      'Documentation generation requires AI features'
    )
  }

  // Regex Assistant Methods

  /**
   * Generate regex pattern from description
   */
  async generateRegex(
    description: string,
    context?: {
      examples?: string[]
      flags?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(description, context, 'regex-from-description'),
      'Regex generation requires AI features'
    )
  }

  /**
   * Optimize regex pattern
   */
  async optimizeRegex(
    pattern: string,
    context?: {
      issues?: string[]
      testCases?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(pattern, context, 'regex-optimization'),
      'Regex optimization requires AI features'
    )
  }

  // Debug Assistant Methods

  /**
   * Help debug code errors
   */
  async debugError(
    error: string,
    code: string,
    context?: {
      language?: string
      context?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(`${error}\n\n${code}`, context, 'debug-error'),
      'Debug assistance requires AI features'
    )
  }

  /**
   * Analyze performance issues
   */
  async debugPerformance(
    code: string,
    issue: string,
    context?: {
      language?: string
      metrics?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(`${issue}\n\n${code}`, context, 'performance-debug'),
      'Performance debugging requires AI features'
    )
  }

  // Architecture Planning Methods

  /**
   * Design system architecture
   */
  async planArchitecture(
    requirements: string,
    context?: {
      scale?: string
      constraints?: string[]
      technologies?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(requirements, context, 'system-architecture'),
      'Architecture planning requires AI features'
    )
  }

  /**
   * Design database schema
   */
  async designDatabase(
    entities: string,
    context?: {
      relationships?: string
      requirements?: string
      dbType?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(entities, context, 'database-design'),
      'Database design requires AI features'
    )
  }

  /**
   * Suggest component structure for a feature
   */
  async suggestComponentStructure(
    featureDescription: string,
    context?: {
      framework?: string
      existingComponents?: string[]
      designPatterns?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(featureDescription, context, 'component-structure'),
      'Component structure planning requires AI features'
    )
  }

  /**
   * Generate project scaffolding suggestions
   */
  async generateProjectScaffolding(
    projectType: string,
    context?: {
      requirements?: string[]
      technologies?: string[]
      scale?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(projectType, context, 'project-scaffolding'),
      'Project scaffolding requires AI features'
    )
  }

  /**
   * Analyze code complexity and suggest improvements
   */
  async analyzeCodeComplexity(
    code: string,
    context?: {
      language?: string
      metrics?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, context, 'complexity-analysis'),
      'Code complexity analysis requires AI features'
    )
  }

  /**
   * Generate unit tests for code
   */
  async generateUnitTests(
    code: string,
    context?: {
      language?: string
      testFramework?: string
      coverage?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, context, 'unit-test-generation'),
      'Unit test generation requires AI features'
    )
  }

  // Code Refactoring Methods

  /**
   * Modernize code to current standards
   */
  async modernizeCode(
    code: string,
    language: string,
    context?: {
      targetVersion?: string
      patterns?: string[]
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, { ...context, language }, 'modernize-code'),
      'Code modernization requires AI features'
    )
  }

  /**
   * Extract reusable functions from code
   */
  async extractFunctions(
    code: string,
    context?: {
      language?: string
      criteria?: string
    }
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(code, context, 'extract-functions'),
      'Function extraction requires AI features'
    )
  }

  // Generic AI Request

  /**
   * Send custom AI request with optional template
   */
  async sendRequest(
    prompt: string,
    context?: any,
    templateId?: string
  ): Promise<AIResponse> {
    return this.executeWithFallback(
      () => this.client.sendRequest(prompt, context, templateId),
      'AI assistance requires AI features'
    )
  }

  // Configuration and Management

  /**
   * Update AI service configuration
   */
  updateConfig(config: Partial<ClaudeMCPConfig>): void {
    this.client.updateConfig(config)
  }

  /**
   * Get current configuration
   */
  getConfig(): ClaudeMCPConfig {
    return { ...this.client['config'] } // Access private config safely
  }

  /**
   * Get available prompt templates
   */
  getPromptTemplates(): PromptTemplate[] {
    return this.client.getPromptTemplates()
  }

  /**
   * Add or update prompt template
   */
  updatePromptTemplate(template: PromptTemplate): void {
    this.client.updatePromptTemplate(template)
  }

  /**
   * Remove prompt template
   */
  removePromptTemplate(templateId: string): void {
    this.client.removePromptTemplate(templateId)
  }

  /**
   * Get comprehensive service status
   */
  getStatus(): AIServiceStatus {
    return {
      isAvailable: this.isAvailable(),
      isFallbackMode: this.isFallbackMode(),
      serviceStatus: this.serviceStatus,
      consecutiveFailures: this.consecutiveFailures,
      lastHealthCheck: new Date(this.lastHealthCheck),
      queueStatus: this.client.getQueueStatus()
    }
  }

  /**
   * Clear request queue
   */
  clearQueue(): void {
    this.client.clearQueue()
  }

  /**
   * Create fallback error for offline mode
   */
  private createFallbackError(message: string): AIError {
    return {
      code: 'SERVICE_UNAVAILABLE',
      message: `${message}. Currently in offline mode.`,
      details: { fallbackMode: true }
    }
  }
}

// Export singleton instance
export const aiService = new AIService()

// Export types for convenience
export type { ClaudeMCPConfig, AIRequest, AIResponse, AIError, PromptTemplate, AIServiceStatus }