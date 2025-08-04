import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { Mock } from 'vitest'
import { AIService } from '../ai-service'
import { ClaudeMCPClient } from '../claude-mcp-client'
import type { ClaudeMCPConfig } from '@/types'

// Mock the ClaudeMCPClient
vi.mock('../claude-mcp-client')
const MockedClaudeMCPClient = ClaudeMCPClient as unknown as Mock

describe('AI Fallback and Graceful Degradation', () => {
  let aiService: AIService
  let mockClient: any
  let statusListener: Mock

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create mock client
    mockClient = {
      updateConfig: vi.fn(),
      isEnabled: vi.fn(() => true),
      sendRequest: vi.fn(),
      getQueueStatus: vi.fn(() => ({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        activeRequests: 0
      })),
      getPromptTemplates: vi.fn(() => []),
      updatePromptTemplate: vi.fn(),
      removePromptTemplate: vi.fn(),
      clearQueue: vi.fn()
    }
    
    MockedClaudeMCPClient.mockImplementation(() => mockClient)
    
    // Create new AI service instance
    aiService = new AIService()
    
    // Mock status listener
    statusListener = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Service Initialization', () => {
    it('should initialize in unknown state', () => {
      const status = aiService.getStatus()
      expect(status.serviceStatus).toBe('unknown')
      expect(status.isAvailable).toBe(false)
      expect(status.isFallbackMode).toBe(false)
    })

    it('should transition to healthy state on successful initialization', async () => {
      mockClient.sendRequest.mockResolvedValueOnce({
        id: 'test',
        requestId: 'test',
        content: 'pong',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })

      const status = aiService.getStatus()
      expect(status.serviceStatus).toBe('healthy')
      expect(status.isAvailable).toBe(true)
      expect(status.isFallbackMode).toBe(false)
    })

    it('should enable fallback mode on initialization failure', async () => {
      mockClient.sendRequest.mockRejectedValueOnce(new Error('Connection failed'))

      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })

      const status = aiService.getStatus()
      expect(status.serviceStatus).toBe('unavailable')
      expect(status.isAvailable).toBe(false)
      expect(status.isFallbackMode).toBe(true)
    })
  })

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      mockClient.sendRequest.mockResolvedValue({
        id: 'test',
        requestId: 'test',
        content: 'pong',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })
    })

    it('should track consecutive failures', async () => {
      mockClient.sendRequest.mockRejectedValue(new Error('Service error'))

      // Simulate multiple failures
      try { await aiService.generateCode('test') } catch {}
      try { await aiService.generateCode('test') } catch {}
      try { await aiService.generateCode('test') } catch {}

      const status = aiService.getStatus()
      expect(status.consecutiveFailures).toBe(3)
      expect(status.serviceStatus).toBe('unavailable')
      expect(status.isFallbackMode).toBe(true)
    })

    it('should reset failure count on successful request', async () => {
      // First, cause some failures
      mockClient.sendRequest.mockRejectedValueOnce(new Error('Service error'))
      try { await aiService.generateCode('test') } catch {}

      // Then succeed
      mockClient.sendRequest.mockResolvedValueOnce({
        id: 'test',
        requestId: 'test',
        content: 'success',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.generateCode('test')

      const status = aiService.getStatus()
      expect(status.consecutiveFailures).toBe(0)
      expect(status.serviceStatus).toBe('healthy')
    })

    it('should transition to degraded state with some failures', async () => {
      mockClient.sendRequest.mockRejectedValue(new Error('Service error'))

      // Cause one failure (less than max)
      try { await aiService.generateCode('test') } catch {}

      const status = aiService.getStatus()
      expect(status.consecutiveFailures).toBe(1)
      expect(status.serviceStatus).toBe('degraded')
      expect(status.isFallbackMode).toBe(false) // Not yet in fallback
    })
  })

  describe('Status Listeners', () => {
    it('should notify listeners of status changes', async () => {
      aiService.addStatusListener(statusListener)

      mockClient.sendRequest.mockRejectedValue(new Error('Service error'))
      
      // Trigger status change
      try { await aiService.generateCode('test') } catch {}

      expect(statusListener).toHaveBeenCalled()
      const lastCall = statusListener.mock.calls[statusListener.mock.calls.length - 1][0]
      expect(lastCall.serviceStatus).toBe('degraded')
    })

    it('should remove listeners properly', async () => {
      aiService.addStatusListener(statusListener)
      aiService.removeStatusListener(statusListener)

      mockClient.sendRequest.mockRejectedValue(new Error('Service error'))
      
      // Trigger status change
      try { await aiService.generateCode('test') } catch {}

      expect(statusListener).not.toHaveBeenCalled()
    })
  })

  describe('Fallback Mode Management', () => {
    it('should enable fallback mode manually', () => {
      aiService.enableFallbackMode('Manual test')

      const status = aiService.getStatus()
      expect(status.isFallbackMode).toBe(true)
      expect(status.serviceStatus).toBe('unavailable')
    })

    it('should disable fallback mode and retry connection', async () => {
      // First enable fallback
      aiService.enableFallbackMode('Test')

      // Mock successful connection
      mockClient.sendRequest.mockResolvedValueOnce({
        id: 'test',
        requestId: 'test',
        content: 'pong',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.disableFallbackMode()

      const status = aiService.getStatus()
      expect(status.isFallbackMode).toBe(false)
      expect(status.serviceStatus).toBe('healthy')
    })

    it('should handle fallback disable failure', async () => {
      // First enable fallback
      aiService.enableFallbackMode('Test')

      // Mock failed connection
      mockClient.sendRequest.mockRejectedValueOnce(new Error('Still failing'))

      await expect(aiService.disableFallbackMode()).rejects.toThrow()

      const status = aiService.getStatus()
      expect(status.isFallbackMode).toBe(true)
    })
  })

  describe('Request Handling with Fallback', () => {
    it('should throw fallback error when service unavailable', async () => {
      aiService.enableFallbackMode('Test')

      await expect(aiService.generateCode('test')).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
        message: expect.stringContaining('offline mode')
      })
    })

    it('should handle successful requests after recovery', async () => {
      // Start in healthy state
      mockClient.sendRequest.mockResolvedValue({
        id: 'test',
        requestId: 'test',
        content: 'Generated code',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })

      const response = await aiService.generateCode('test code')
      expect(response.content).toBe('Generated code')
    })

    it('should handle all AI methods with fallback', async () => {
      aiService.enableFallbackMode('Test')

      const methods = [
        () => aiService.generateCode('test'),
        () => aiService.reviewCode('test'),
        () => aiService.generateDocumentation('test'),
        () => aiService.generateRegex('test'),
        () => aiService.optimizeRegex('test'),
        () => aiService.debugError('error', 'code'),
        () => aiService.debugPerformance('code', 'issue'),
        () => aiService.planArchitecture('requirements'),
        () => aiService.designDatabase('entities'),
        () => aiService.modernizeCode('code', 'javascript'),
        () => aiService.extractFunctions('code'),
        () => aiService.suggestComponentStructure('feature'),
        () => aiService.generateProjectScaffolding('web-app'),
        () => aiService.analyzeCodeComplexity('code'),
        () => aiService.generateUnitTests('code'),
        () => aiService.sendRequest('test')
      ]

      for (const method of methods) {
        await expect(method()).rejects.toMatchObject({
          code: 'SERVICE_UNAVAILABLE'
        })
      }
    })
  })

  describe('Service Status Reporting', () => {
    it('should provide comprehensive status information', async () => {
      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })

      const status = aiService.getStatus()

      expect(status).toMatchObject({
        isAvailable: expect.any(Boolean),
        isFallbackMode: expect.any(Boolean),
        serviceStatus: expect.stringMatching(/^(unknown|healthy|degraded|unavailable)$/),
        consecutiveFailures: expect.any(Number),
        lastHealthCheck: expect.any(Date),
        queueStatus: expect.objectContaining({
          pending: expect.any(Number),
          processing: expect.any(Number),
          completed: expect.any(Number),
          failed: expect.any(Number),
          activeRequests: expect.any(Number)
        })
      })
    })

    it('should update last health check timestamp', async () => {
      const initialStatus = aiService.getStatus()
      const initialTime = initialStatus.lastHealthCheck.getTime()

      // Wait a bit and trigger a health check
      await new Promise(resolve => setTimeout(resolve, 10))
      
      mockClient.sendRequest.mockResolvedValueOnce({
        id: 'test',
        requestId: 'test',
        content: 'pong',
        timestamp: new Date(),
        processingTime: 100
      })

      await aiService.initialize({
        isEnabled: true,
        apiKey: 'test-key'
      })

      const updatedStatus = aiService.getStatus()
      expect(updatedStatus.lastHealthCheck.getTime()).toBeGreaterThan(initialTime)
    })
  })

  describe('Configuration Management', () => {
    it('should update configuration and maintain status', () => {
      const newConfig: Partial<ClaudeMCPConfig> = {
        model: 'anthropic/claude-3-sonnet',
        rateLimiting: {
          requestsPerMinute: 30,
          cooldownPeriod: 60,
          maxConcurrentRequests: 5
        }
      }

      aiService.updateConfig(newConfig)

      expect(mockClient.updateConfig).toHaveBeenCalledWith(newConfig)
    })

    it('should provide current configuration', () => {
      const config = aiService.getConfig()
      expect(config).toBeDefined()
      expect(config.baseUrl).toBeDefined()
      expect(config.model).toBeDefined()
    })
  })

  describe('Queue Management', () => {
    it('should clear request queue', () => {
      aiService.clearQueue()
      expect(mockClient.clearQueue).toHaveBeenCalled()
    })

    it('should provide queue status', () => {
      const status = aiService.getStatus()
      expect(status.queueStatus).toMatchObject({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        activeRequests: 0
      })
    })
  })
})

describe('ClaudeMCPClient Health Check Support', () => {
  let client: ClaudeMCPClient
  let mockFetch: Mock

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch

    const config: ClaudeMCPConfig = {
      isEnabled: true,
      apiKey: 'test-key',
      baseUrl: 'https://api.test.com',
      model: 'test-model',
      rateLimiting: {
        requestsPerMinute: 20,
        cooldownPeriod: 60,
        maxConcurrentRequests: 3
      },
      promptTemplates: []
    }

    client = new ClaudeMCPClient(config)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle health check requests differently', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'pong' } }]
      })
    })

    const response = await client.sendRequest('ping', {}, undefined, true)
    
    expect(response.content).toBe('pong')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"max_tokens":10')
      })
    )
  })

  it('should use shorter timeout for health checks', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 6000))
    )

    try {
      await client.sendRequest('ping', {}, undefined, true)
    } catch (error) {
      // Expected to timeout
    }

    // Should have been aborted due to 5s timeout for health checks
    expect(abortSpy).toHaveBeenCalled()
  })

  it('should not queue health check requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: 'pong' } }]
      })
    })

    await client.sendRequest('ping', {}, undefined, true)
    
    const queueStatus = client.getQueueStatus()
    expect(queueStatus.completed).toBe(0) // Health checks don't count
  })
})