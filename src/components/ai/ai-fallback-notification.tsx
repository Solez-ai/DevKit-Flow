import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  X, 
  Settings,
  Clock
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import type { AIServiceStatus } from '@/types'

interface AIFallbackNotificationProps {
  onOpenSettings?: () => void
  className?: string
}

/**
 * AI Fallback Notification Component
 * Shows notifications when AI service fails and provides recovery options
 */
export function AIFallbackNotification({ 
  onOpenSettings, 
  className 
}: AIFallbackNotificationProps) {
  const { 
    isAvailable, 
    isFallbackMode, 
    error, 
    disableFallbackMode, 
    clearError,
    isLoading 
  } = useAIService()
  
  const [isDismissed, setIsDismissed] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Reset dismissal when service status changes
  useEffect(() => {
    if (isAvailable && !isFallbackMode) {
      setIsDismissed(false)
      setLastError(null)
      setRetryCount(0)
    }
  }, [isAvailable, isFallbackMode])

  // Track error changes
  useEffect(() => {
    if (error && error.message !== lastError) {
      setLastError(error.message)
      setIsDismissed(false)
    }
  }, [error, lastError])

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)
    clearError()
    
    try {
      await disableFallbackMode()
    } catch (err) {
      // Error will be handled by the hook
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    clearError()
  }

  // Don't show if dismissed or if service is working normally
  if (isDismissed || (isAvailable && !isFallbackMode && !error)) {
    return null
  }

  const getNotificationContent = () => {
    if (error) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'AI Service Error',
        description: error.message,
        showRetry: error.code !== 'SERVICE_UNAVAILABLE'
      }
    }

    if (isFallbackMode) {
      return {
        variant: 'default' as const,
        icon: WifiOff,
        title: 'Working Offline',
        description: 'AI features are disabled. Core functionality remains available.',
        showRetry: true
      }
    }

    return null
  }

  const content = getNotificationContent()
  if (!content) return null

  const Icon = content.icon

  return (
    <Alert variant={content.variant} className={className}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="flex items-center gap-2">
          {content.title}
          {retryCount > 0 && (
            <Badge variant="outline" className="text-xs">
              Retry {retryCount}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="mt-1">
          {content.description}
        </AlertDescription>
        
        <div className="flex items-center gap-2 mt-3">
          {content.showRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Connection
                </>
              )}
            </Button>
          )}
          
          {onOpenSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="h-8"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Enhanced AI Status Indicator with detailed status information
 */
export function EnhancedAIStatusIndicator({ className }: { className?: string }) {
  const [status, setStatus] = useState<AIServiceStatus | null>(null)

  useEffect(() => {
    // This would be connected to the AI service status listener
    // For now, we'll use a placeholder
    const mockStatus: AIServiceStatus = {
      isAvailable: false,
      isFallbackMode: true,
      serviceStatus: 'unavailable',
      consecutiveFailures: 2,
      lastHealthCheck: new Date(),
      queueStatus: {
        pending: 0,
        processing: 0,
        completed: 5,
        failed: 2,
        activeRequests: 0
      }
    }
    setStatus(mockStatus)
  }, [])

  if (!status) return null

  const getStatusColor = () => {
    switch (status.serviceStatus) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'unavailable': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    if (status.isFallbackMode) return 'Offline Mode'
    if (!status.isAvailable) return 'Disabled'
    
    switch (status.serviceStatus) {
      case 'healthy': return 'Healthy'
      case 'degraded': return 'Degraded'
      case 'unavailable': return 'Unavailable'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-muted-foreground">
        AI: {getStatusText()}
      </span>
      
      {status.consecutiveFailures > 0 && (
        <Badge variant="outline" className="text-xs">
          {status.consecutiveFailures} failures
        </Badge>
      )}
      
      {status.queueStatus.processing > 0 && (
        <Badge variant="default" className="text-xs">
          <RefreshCw className="h-2 w-2 mr-1 animate-spin" />
          {status.queueStatus.processing}
        </Badge>
      )}
    </div>
  )
}

/**
 * AI Service Health Monitor Component
 * Shows detailed health information in a tooltip or panel
 */
export function AIServiceHealthMonitor() {
  const [status, setStatus] = useState<AIServiceStatus | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // This would be connected to the AI service status listener
    // For now, we'll use a placeholder
    const mockStatus: AIServiceStatus = {
      isAvailable: false,
      isFallbackMode: true,
      serviceStatus: 'unavailable',
      consecutiveFailures: 2,
      lastHealthCheck: new Date(Date.now() - 30000), // 30 seconds ago
      queueStatus: {
        pending: 0,
        processing: 0,
        completed: 5,
        failed: 2,
        activeRequests: 0
      }
    }
    setStatus(mockStatus)
  }, [])

  if (!status) return null

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ago`
    }
    return `${seconds}s ago`
  }

  return (
    <div className="p-3 border rounded-lg bg-card">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status.serviceStatus === 'healthy' ? 'bg-green-500' :
            status.serviceStatus === 'degraded' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="font-medium">AI Service</span>
        </div>
        
        <Badge variant={status.isAvailable ? 'default' : 'secondary'}>
          {status.isAvailable ? 'Available' : 'Offline'}
        </Badge>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="capitalize">{status.serviceStatus}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Last Check:</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatLastCheck(status.lastHealthCheck)}
            </span>
          </div>
          
          {status.consecutiveFailures > 0 && (
            <div className="flex justify-between">
              <span>Failures:</span>
              <span className="text-red-500">{status.consecutiveFailures}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Queue:</span>
            <span>
              {status.queueStatus.pending}P / {status.queueStatus.processing}R / {status.queueStatus.completed}C
            </span>
          </div>
        </div>
      )}
    </div>
  )
}