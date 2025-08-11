import { useEffect, useRef } from 'react'
import { toast } from '@/hooks/use-toast'
import { useAIService } from '@/hooks/use-ai-service'
import { CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff } from 'lucide-react'
import type { AIServiceStatus } from '@/types'

/**
 * AI Status Toast Manager
 * Automatically shows toast notifications for AI service status changes
 */
export function AIStatusToastManager() {
  const status = useAIService()
  const previousStatus = useRef<AIServiceStatus | null>(null)
  const hasShownInitialStatus = useRef(false)

  useEffect(() => {
    // Enhanced event listeners for more detailed notifications
    const handleFallbackActivated = (event: CustomEvent) => {
      const { reason, error, consecutiveFailures } = event.detail
      const title = reason === 'critical' ? 'AI Service Disabled' : 'AI Service Unavailable'
      const description = reason === 'critical' 
        ? `Critical error detected: ${error.message}`
        : `Service disabled after ${consecutiveFailures} failures. Working offline.`
      
      toast({
        title,
        description,
        duration: 8000,
        className: "border-red-200 bg-red-50",
      })
    }

    const handleServiceDegraded = (event: CustomEvent) => {
      const { consecutiveFailures, maxFailures, isTemporary } = event.detail
      toast({
        title: "AI Service Degraded",
        description: `${consecutiveFailures}/${maxFailures} failures. ${isTemporary ? 'Retrying automatically.' : 'Manual intervention may be needed.'}`,
        duration: 6000,
        className: "border-yellow-200 bg-yellow-50",
      })
    }

    const handleServiceRecovered = (event: CustomEvent) => {
      const { previousFailures } = event.detail
      toast({
        title: "AI Service Recovered",
        description: `Service restored after ${previousFailures} failures. AI features are now available.`,
        duration: 4000,
        className: "border-green-200 bg-green-50",
      })
    }

    // Add enhanced event listeners
    window.addEventListener('ai-fallback-activated', handleFallbackActivated as EventListener)
    window.addEventListener('ai-service-degraded', handleServiceDegraded as EventListener)
    window.addEventListener('ai-service-recovered', handleServiceRecovered as EventListener)

    // Don't show toast on initial load
    if (!hasShownInitialStatus.current) {
      hasShownInitialStatus.current = true
      previousStatus.current = status
      return () => {
        window.removeEventListener('ai-fallback-activated', handleFallbackActivated as EventListener)
        window.removeEventListener('ai-service-degraded', handleServiceDegraded as EventListener)
        window.removeEventListener('ai-service-recovered', handleServiceRecovered as EventListener)
      }
    }

    const prev = previousStatus.current
    if (!prev) return

    // Service recovered from failure
    if (prev.serviceStatus !== 'healthy' && status.serviceStatus === 'healthy') {
      toast({
        title: "AI Service Recovered",
        description: "AI features are now available and working normally.",
        duration: 4000,
        className: "border-green-200 bg-green-50",
      })
    }
    
    // Service became degraded
    else if (prev.serviceStatus === 'healthy' && status.serviceStatus === 'degraded') {
      toast({
        title: "AI Service Issues",
        description: `Service degraded (${status.consecutiveFailures} failures). Some features may be slower.`,
        duration: 6000,
        className: "border-yellow-200 bg-yellow-50",
      })
    }
    
    // Service became unavailable
    else if (prev.serviceStatus !== 'unavailable' && status.serviceStatus === 'unavailable') {
      toast({
        title: "AI Service Unavailable",
        description: "AI features are temporarily unavailable. Working in offline mode.",
        duration: 8000,
        className: "border-red-200 bg-red-50",
      })
    }
    
    // Switched to fallback mode
    else if (!prev.isFallbackMode && status.isFallbackMode) {
      toast({
        title: "Offline Mode Enabled",
        description: "AI features disabled. Core functionality remains available.",
        duration: 5000,
        className: "border-blue-200 bg-blue-50",
      })
    }
    
    // Switched back from fallback mode
    else if (prev.isFallbackMode && !status.isFallbackMode) {
      toast({
        title: "Online Mode Restored",
        description: "AI features are now available.",
        duration: 4000,
        className: "border-green-200 bg-green-50",
      })
    }

    // Enhanced failure detection - show more specific messages
    if (status.consecutiveFailures > prev.consecutiveFailures && status.consecutiveFailures >= 2) {
      const isNearLimit = status.consecutiveFailures >= 2 // Assuming max is 3
      if (isNearLimit) {
        toast({
          title: "Multiple AI Service Failures",
          description: `${status.consecutiveFailures} consecutive failures detected. May switch to offline mode soon.`,
          duration: 7000,
          className: "border-orange-200 bg-orange-50",
        })
      }
    }

    previousStatus.current = status

    // Cleanup function for event listeners
    return () => {
      window.removeEventListener('ai-fallback-activated', handleFallbackActivated as EventListener)
      window.removeEventListener('ai-service-degraded', handleServiceDegraded as EventListener)
      window.removeEventListener('ai-service-recovered', handleServiceRecovered as EventListener)
    }
  }, [status])

  return null // This component only manages toasts
}

/**
 * Manual AI Status Toast Triggers
 */
export const aiStatusToasts = {
  /**
   * Show connection retry toast
   */
  showRetryToast: (attempt: number) => {
    toast({
      title: `Retrying AI Connection (${attempt})`,
      description: "Attempting to restore AI service connectivity...",
      duration: 3000,
    })
  },

  /**
   * Show connection timeout toast
   */
  showTimeoutToast: () => {
    toast({
      title: "Connection Timeout",
      description: "AI service request timed out. Please try again.",
      duration: 5000,
      className: "border-orange-200 bg-orange-50",
    })
  },

  /**
   * Show rate limit toast
   */
  showRateLimitToast: (retryAfter?: number) => {
    const retryMessage = retryAfter 
      ? ` Try again in ${Math.ceil(retryAfter / 1000)} seconds.`
      : ' Please wait before making more requests.'
    
    toast({
      title: "Rate Limit Reached",
      description: `AI service rate limit exceeded.${retryMessage}`,
      duration: 6000,
      className: "border-yellow-200 bg-yellow-50",
    })
  },

  /**
   * Show API key error toast
   */
  showApiKeyErrorToast: () => {
    toast({
      title: "API Key Error",
      description: "Invalid or missing API key. Please check your settings.",
      duration: 8000,
      className: "border-red-200 bg-red-50",
    })
  },

  /**
   * Show network error toast
   */
  showNetworkErrorToast: () => {
    toast({
      title: "Network Error",
      description: "Unable to connect to AI service. Check your internet connection.",
      duration: 6000,
      className: "border-red-200 bg-red-50",
    })
  },

  /**
   * Show fallback mode toast
   */
  showFallbackModeToast: (reason?: string) => {
    toast({
      title: "Offline Mode Activated",
      description: reason || "AI features disabled. Core functionality remains available.",
      duration: 5000,
      className: "border-blue-200 bg-blue-50",
    })
  },

  /**
   * Show recovery success toast
   */
  showRecoverySuccessToast: () => {
    toast({
      title: "AI Service Restored",
      description: "Connection recovered successfully. AI features are now available.",
      duration: 4000,
      className: "border-green-200 bg-green-50",
    })
  },

  /**
   * Show auto-retry enabled toast
   */
  showAutoRetryToast: (enabled: boolean) => {
    toast({
      title: enabled ? "Auto-retry Enabled" : "Auto-retry Disabled",
      description: enabled 
        ? "AI service will automatically attempt to reconnect."
        : "Automatic reconnection attempts have been disabled.",
      duration: 3000,
    })
  }
}

/**
 * AI Status Toast Hook
 * Provides easy access to AI status toast functions
 */
export function useAIStatusToasts() {
  return aiStatusToasts
}