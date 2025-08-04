import { useState, useEffect, useCallback } from 'react'
import { aiService } from '@/lib/ai-service'
import type { AIResponse, AIError, ClaudeMCPConfig, PromptTemplate, AIServiceStatus } from '@/types'

interface UseAIServiceReturn {
  // Status
  isAvailable: boolean
  isFallbackMode: boolean
  isLoading: boolean
  error: AIError | null
  
  // Methods
  generateCode: (requirements: string, context?: any) => Promise<AIResponse | null>
  reviewCode: (code: string, context?: any) => Promise<AIResponse | null>
  generateDocumentation: (code: string, context?: any) => Promise<AIResponse | null>
  generateRegex: (description: string, context?: any) => Promise<AIResponse | null>
  optimizeRegex: (pattern: string, context?: any) => Promise<AIResponse | null>
  debugError: (error: string, code: string, context?: any) => Promise<AIResponse | null>
  debugPerformance: (code: string, issue: string, context?: any) => Promise<AIResponse | null>
  planArchitecture: (requirements: string, context?: any) => Promise<AIResponse | null>
  designDatabase: (entities: string, context?: any) => Promise<AIResponse | null>
  modernizeCode: (code: string, language: string, context?: any) => Promise<AIResponse | null>
  extractFunctions: (code: string, context?: any) => Promise<AIResponse | null>
  suggestComponentStructure: (featureDescription: string, context?: any) => Promise<AIResponse | null>
  generateProjectScaffolding: (projectType: string, context?: any) => Promise<AIResponse | null>
  analyzeCodeComplexity: (code: string, context?: any) => Promise<AIResponse | null>
  generateUnitTests: (code: string, context?: any) => Promise<AIResponse | null>
  sendRequest: (prompt: string, context?: any, templateId?: string) => Promise<AIResponse | null>
  
  // Configuration
  updateConfig: (config: Partial<ClaudeMCPConfig>) => void
  getPromptTemplates: () => PromptTemplate[]
  
  // Utilities
  clearError: () => void
  enableFallbackMode: () => void
  disableFallbackMode: () => Promise<void>
}

/**
 * React hook for AI service integration
 */
export function useAIService(): UseAIServiceReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)
  const [isAvailable, setIsAvailable] = useState(aiService.isAvailable())
  const [isFallbackMode, setIsFallbackMode] = useState(aiService.isFallbackMode())

  // Update status when service changes
  useEffect(() => {
    const handleStatusChange = (status: AIServiceStatus) => {
      setIsAvailable(status.isAvailable)
      setIsFallbackMode(status.isFallbackMode)
    }

    // Add status listener
    aiService.addStatusListener(handleStatusChange)
    
    // Initial status update
    const initialStatus = aiService.getStatus()
    handleStatusChange(initialStatus)
    
    return () => {
      aiService.removeStatusListener(handleStatusChange)
    }
  }, [])

  // Generic request handler with error handling
  const handleRequest = useCallback(async <T extends any[]>(
    method: (...args: T) => Promise<AIResponse>,
    ...args: T
  ): Promise<AIResponse | null> => {
    if (!aiService.isAvailable()) {
      setError({
        code: 'SERVICE_UNAVAILABLE',
        message: 'AI service is not available. Enable AI features in settings.',
        details: { fallbackMode: aiService.isFallbackMode() }
      })
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await method(...args)
      return response
    } catch (err) {
      const aiError = err as AIError
      setError(aiError)
      
      // Auto-enable fallback mode on certain errors
      if (aiError.code === 'API_ERROR' || aiError.code === 'NETWORK_ERROR') {
        aiService.enableFallbackMode()
        setIsFallbackMode(true)
        setIsAvailable(false)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Code Assistant Methods
  const generateCode = useCallback((requirements: string, context?: any) => {
    return handleRequest(aiService.generateCode.bind(aiService), requirements, context)
  }, [handleRequest])

  const reviewCode = useCallback((code: string, context?: any) => {
    return handleRequest(aiService.reviewCode.bind(aiService), code, context)
  }, [handleRequest])

  const generateDocumentation = useCallback((code: string, context?: any) => {
    return handleRequest(aiService.generateDocumentation.bind(aiService), code, context)
  }, [handleRequest])

  // Regex Assistant Methods
  const generateRegex = useCallback((description: string, context?: any) => {
    return handleRequest(aiService.generateRegex.bind(aiService), description, context)
  }, [handleRequest])

  const optimizeRegex = useCallback((pattern: string, context?: any) => {
    return handleRequest(aiService.optimizeRegex.bind(aiService), pattern, context)
  }, [handleRequest])

  // Debug Assistant Methods
  const debugError = useCallback((error: string, code: string, context?: any) => {
    return handleRequest(aiService.debugError.bind(aiService), error, code, context)
  }, [handleRequest])

  const debugPerformance = useCallback((code: string, issue: string, context?: any) => {
    return handleRequest(aiService.debugPerformance.bind(aiService), code, issue, context)
  }, [handleRequest])

  // Architecture Planning Methods
  const planArchitecture = useCallback((requirements: string, context?: any) => {
    return handleRequest(aiService.planArchitecture.bind(aiService), requirements, context)
  }, [handleRequest])

  const designDatabase = useCallback((entities: string, context?: any) => {
    return handleRequest(aiService.designDatabase.bind(aiService), entities, context)
  }, [handleRequest])

  // Code Refactoring Methods
  const modernizeCode = useCallback((code: string, language: string, context?: any) => {
    return handleRequest(aiService.modernizeCode.bind(aiService), code, language, context)
  }, [handleRequest])

  const extractFunctions = useCallback((code: string, context?: any) => {
    return handleRequest(aiService.extractFunctions.bind(aiService), code, context)
  }, [handleRequest])

  // Enhanced Architecture Methods
  const suggestComponentStructure = useCallback((featureDescription: string, context?: any) => {
    return handleRequest(aiService.suggestComponentStructure.bind(aiService), featureDescription, context)
  }, [handleRequest])

  const generateProjectScaffolding = useCallback((projectType: string, context?: any) => {
    return handleRequest(aiService.generateProjectScaffolding.bind(aiService), projectType, context)
  }, [handleRequest])

  // Code Analysis Methods
  const analyzeCodeComplexity = useCallback((code: string, context?: any) => {
    return handleRequest(aiService.analyzeCodeComplexity.bind(aiService), code, context)
  }, [handleRequest])

  const generateUnitTests = useCallback((code: string, context?: any) => {
    return handleRequest(aiService.generateUnitTests.bind(aiService), code, context)
  }, [handleRequest])

  // Generic Request
  const sendRequest = useCallback((prompt: string, context?: any, templateId?: string) => {
    return handleRequest(aiService.sendRequest.bind(aiService), prompt, context, templateId)
  }, [handleRequest])

  // Configuration Methods
  const updateConfig = useCallback((config: Partial<ClaudeMCPConfig>) => {
    aiService.updateConfig(config)
    setIsAvailable(aiService.isAvailable())
    setIsFallbackMode(aiService.isFallbackMode())
  }, [])

  const getPromptTemplates = useCallback(() => {
    return aiService.getPromptTemplates()
  }, [])

  // Utility Methods
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const enableFallbackMode = useCallback(() => {
    aiService.enableFallbackMode()
    setIsFallbackMode(true)
    setIsAvailable(false)
    setError(null)
  }, [])

  const disableFallbackMode = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await aiService.disableFallbackMode()
      setIsFallbackMode(false)
      setIsAvailable(true)
    } catch (err) {
      const aiError = err as AIError
      setError(aiError)
      setIsFallbackMode(true)
      setIsAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    // Status
    isAvailable,
    isFallbackMode,
    isLoading,
    error,
    
    // Methods
    generateCode,
    reviewCode,
    generateDocumentation,
    generateRegex,
    optimizeRegex,
    debugError,
    debugPerformance,
    planArchitecture,
    designDatabase,
    modernizeCode,
    extractFunctions,
    suggestComponentStructure,
    generateProjectScaffolding,
    analyzeCodeComplexity,
    generateUnitTests,
    sendRequest,
    
    // Configuration
    updateConfig,
    getPromptTemplates,
    
    // Utilities
    clearError,
    enableFallbackMode,
    disableFallbackMode
  }
}

/**
 * Hook for AI service status only (lightweight)
 */
export function useAIServiceStatus(): AIServiceStatus {
  const [status, setStatus] = useState(() => aiService.getStatus())

  useEffect(() => {
    const handleStatusChange = (newStatus: AIServiceStatus) => {
      setStatus(newStatus)
    }

    // Add status listener
    aiService.addStatusListener(handleStatusChange)
    
    // Get initial status
    setStatus(aiService.getStatus())
    
    return () => {
      aiService.removeStatusListener(handleStatusChange)
    }
  }, [])

  return status
}