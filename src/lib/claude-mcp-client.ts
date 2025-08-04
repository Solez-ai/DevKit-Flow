import type { 
  ClaudeMCPConfig, 
  AIRequest, 
  AIResponse, 
  AIError,
  PromptTemplate 
} from '@/types'

/**
 * Claude MCP Client for AI-powered assistance
 * Handles communication with Claude API through OpenRouter
 */
export class ClaudeMCPClient {
  private config: ClaudeMCPConfig
  private requestQueue: Map<string, AIRequest> = new Map()
  private rateLimitTracker: Map<string, number[]> = new Map()
  private activeRequests = 0

  constructor(config: ClaudeMCPConfig) {
    this.config = config
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<ClaudeMCPConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check if AI features are enabled and properly configured
   */
  isEnabled(): boolean {
    return this.config.isEnabled && !!this.config.apiKey
  }

  /**
   * Send a request to Claude API
   */
  async sendRequest(
    prompt: string, 
    context?: any,
    templateId?: string,
    isHealthCheck = false
  ): Promise<AIResponse> {
    if (!this.isEnabled()) {
      throw this.createError('SERVICE_UNAVAILABLE', 'AI service is not enabled or configured')
    }

    // Skip rate limiting for health checks
    if (!isHealthCheck) {
      await this.checkRateLimit()
    }

    const request: AIRequest = {
      id: this.generateRequestId(),
      prompt,
      context,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0
    }

    // Don't queue health check requests
    if (!isHealthCheck) {
      this.requestQueue.set(request.id, request)
    }

    try {
      return await this.processRequest(request, templateId, isHealthCheck)
    } catch (error) {
      if (!isHealthCheck) {
        this.requestQueue.delete(request.id)
      }
      throw error
    }
  }

  /**
   * Process a single AI request
   */
  private async processRequest(request: AIRequest, templateId?: string, isHealthCheck = false): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      this.activeRequests++
      
      if (!isHealthCheck) {
        request.status = 'processing'
        this.requestQueue.set(request.id, request)
      }

      // Apply prompt template if specified and not a health check
      let finalPrompt = request.prompt
      if (templateId && !isHealthCheck) {
        const template = this.config.promptTemplates.find(t => t.id === templateId)
        if (template) {
          finalPrompt = template.prompt(request.context || {})
        }
      }

      // For health checks, use a minimal request
      if (isHealthCheck) {
        finalPrompt = 'ping'
      }

      const response = await this.makeAPICall(finalPrompt, request.context, isHealthCheck)
      
      const aiResponse: AIResponse = {
        id: this.generateResponseId(),
        requestId: request.id,
        content: response.content,
        confidence: response.confidence,
        metadata: response.metadata,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      }

      if (!isHealthCheck) {
        request.status = 'completed'
        this.requestQueue.set(request.id, request)
      }
      
      return aiResponse
    } catch (error) {
      if (!isHealthCheck) {
        request.status = 'failed'
        this.requestQueue.set(request.id, request)
        
        if (this.shouldRetry(error, request)) {
          request.retryCount++
          await this.delay(this.getRetryDelay(request.retryCount))
          return this.processRequest(request, templateId, isHealthCheck)
        }
      }
      
      throw this.handleAPIError(error)
    } finally {
      this.activeRequests--
    }
  }

  /**
   * Make the actual API call to Claude via OpenRouter
   */
  private async makeAPICall(prompt: string, context?: any, isHealthCheck = false): Promise<{
    content: string
    confidence?: number
    metadata?: Record<string, any>
  }> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'DevKit Flow'
    }

    // Use minimal request for health checks
    const body = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: isHealthCheck ? 'You are a health check service.' : this.getSystemPrompt()
        },
        {
          role: 'user',
          content: isHealthCheck ? 'ping' : this.formatPrompt(prompt, context)
        }
      ],
      max_tokens: isHealthCheck ? 10 : 4000,
      temperature: isHealthCheck ? 0 : 0.7,
      top_p: isHealthCheck ? 1 : 0.9
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), isHealthCheck ? 5000 : 30000)

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API request failed: ${response.status} ${response.statusText}`, {
          cause: errorData
        })
      }

      const data = await response.json()
      
      return {
        content: data.choices?.[0]?.message?.content || (isHealthCheck ? 'pong' : ''),
        confidence: data.confidence,
        metadata: {
          model: data.model,
          usage: data.usage,
          finish_reason: data.choices?.[0]?.finish_reason
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      throw error
    }
  }

  /**
   * Get system prompt for Claude
   */
  private getSystemPrompt(): string {
    return `You are an AI assistant integrated into DevKit Flow, a developer productivity workspace. 
    You help developers with:
    - Code generation and suggestions
    - Regex pattern creation and explanation
    - Debugging assistance
    - Architecture planning
    - Code refactoring

    Always provide practical, actionable advice. Format code blocks with proper syntax highlighting.
    Be concise but thorough in explanations.`
  }

  /**
   * Format the user prompt with context
   */
  private formatPrompt(prompt: string, context?: any): string {
    if (!context) return prompt

    let formattedPrompt = prompt

    // Add context information
    if (context.nodeType) {
      formattedPrompt += `\n\nContext: Working with a ${context.nodeType} node`
    }

    if (context.codeLanguage) {
      formattedPrompt += `\n\nLanguage: ${context.codeLanguage}`
    }

    if (context.existingCode) {
      formattedPrompt += `\n\nExisting code:\n\`\`\`\n${context.existingCode}\n\`\`\``
    }

    if (context.sessionInfo) {
      formattedPrompt += `\n\nSession: ${context.sessionInfo.name}`
      if (context.sessionInfo.description) {
        formattedPrompt += ` - ${context.sessionInfo.description}`
      }
    }

    return formattedPrompt
  }

  /**
   * Check rate limiting constraints
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now()
    const windowStart = now - (60 * 1000) // 1 minute window
    
    // Clean old requests
    const recentRequests = this.rateLimitTracker.get('requests') || []
    const validRequests = recentRequests.filter(time => time > windowStart)
    this.rateLimitTracker.set('requests', validRequests)

    // Check requests per minute limit
    if (validRequests.length >= this.config.rateLimiting.requestsPerMinute) {
      const oldestRequest = Math.min(...validRequests)
      const waitTime = (oldestRequest + 60 * 1000) - now
      throw this.createError('RATE_LIMIT', `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`, { retryAfter: waitTime })
    }

    // Check concurrent requests limit
    if (this.activeRequests >= this.config.rateLimiting.maxConcurrentRequests) {
      throw this.createError('RATE_LIMIT', 'Too many concurrent requests. Please wait.')
    }

    // Record this request
    validRequests.push(now)
    this.rateLimitTracker.set('requests', validRequests)
  }

  /**
   * Determine if a request should be retried
   */
  private shouldRetry(error: any, request: AIRequest): boolean {
    if (request.retryCount >= 3) return false
    
    // Retry on network errors or temporary API issues
    if (error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.status === 429 || 
        error.status >= 500) {
      return true
    }
    
    return false
  }

  /**
   * Get retry delay with exponential backoff
   */
  private getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10 seconds
  }

  /**
   * Handle API errors and convert to AIError
   */
  private handleAPIError(error: any): AIError {
    if (error.status === 429) {
      return this.createError('RATE_LIMIT', 'API rate limit exceeded', error)
    }
    
    if (error.status >= 500) {
      return this.createError('API_ERROR', 'API server error', error)
    }
    
    if (error.status === 401 || error.status === 403) {
      return this.createError('API_ERROR', 'Invalid API key or unauthorized', error)
    }
    
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return this.createError('NETWORK_ERROR', 'Network connection failed', error)
    }
    
    return this.createError('API_ERROR', error.message || 'Unknown API error', error)
  }

  /**
   * Create a standardized AI error
   */
  private createError(code: AIError['code'], message: string, details?: any): AIError {
    return {
      code,
      message,
      details,
      retryAfter: details?.retryAfter
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique response ID
   */
  private generateResponseId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current request queue status
   */
  getQueueStatus(): {
    pending: number
    processing: number
    completed: number
    failed: number
    activeRequests: number
  } {
    const requests = Array.from(this.requestQueue.values())
    
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      processing: requests.filter(r => r.status === 'processing').length,
      completed: requests.filter(r => r.status === 'completed').length,
      failed: requests.filter(r => r.status === 'failed').length,
      activeRequests: this.activeRequests
    }
  }

  /**
   * Clear completed and failed requests from queue
   */
  clearQueue(): void {
    const activeRequests = Array.from(this.requestQueue.entries())
      .filter(([_, request]) => request.status === 'pending' || request.status === 'processing')
    
    this.requestQueue.clear()
    activeRequests.forEach(([id, request]) => {
      this.requestQueue.set(id, request)
    })
  }

  /**
   * Get available prompt templates
   */
  getPromptTemplates(): PromptTemplate[] {
    return this.config.promptTemplates
  }

  /**
   * Add or update a prompt template
   */
  updatePromptTemplate(template: PromptTemplate): void {
    const existingIndex = this.config.promptTemplates.findIndex(t => t.id === template.id)
    
    if (existingIndex >= 0) {
      this.config.promptTemplates[existingIndex] = template
    } else {
      this.config.promptTemplates.push(template)
    }
  }

  /**
   * Remove a prompt template
   */
  removePromptTemplate(templateId: string): void {
    this.config.promptTemplates = this.config.promptTemplates.filter(t => t.id !== templateId)
  }
}