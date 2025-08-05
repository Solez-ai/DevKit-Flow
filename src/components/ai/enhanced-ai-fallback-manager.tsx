import { useState, useEffect, useCallback } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  X, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { toast } from '@/hooks/use-toast'

interface FallbackEvent {
  error: Error
  reason: 'critical' | 'consecutive'
  message: string
  consecutiveFailures: number
}

interface DegradationEvent {
  error: Error
  consecutiveFailures: number
  maxFailures: number
  message: string
}

interface RetryEvent {
  delay?: number
  attempt?: number
  nextRetryTime?: Date
}

interface RecoveryEvent {
  previousFailures: number
  recoveryTime: Date
}

/**
 * Enhanced AI Fallback Manager
 * Provides comprehensive fallback handling with user notifications and recovery options
 */
export function EnhancedAIFallbackManager() {
  const { 
    isAvailable, 
    isFallbackMode, 
    error, 
    disableFallbackMode, 
    enableFallbackMode,
    clearError,
    isLoading 
  } = useAIService()

  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const [retryProgress, setRetryProgress] = useState(0)
  const [nextRetryTime, setNextRetryTime] = useState<Date | null>(null)
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [recentEvents, setRecentEvents] = useState<Array<{
    type: string
    message: string
    timestamp: Date
    details?: any
  }>>([])

  // Listen for AI service events
  useEffect(() => {
    const handleFallbackActivated = (event: CustomEvent<FallbackEvent>) => {
      const { reason, message, error } = event.detail
      setFallbackReason(message)
      
      addEvent('fallback-activated', message, { reason, error: error.message })
      
      // Show appropriate toast notification
      if (reason === 'critical') {
        toast({
          title: "AI Service Disabled",
          description: "Critical error detected. Working in offline mode.",
          duration: 8000,
          className: "border-red-200 bg-red-50",
        })
      } else {
        toast({
          title: "AI Service Unavailable",
          description: "Multiple failures detected. Switched to offline mode.",
          duration: 6000,
          className: "border-orange-200 bg-orange-50",
        })
      }
    }

    const handleServiceDegraded = (event: CustomEvent<DegradationEvent>) => {
      const { message, consecutiveFailures, maxFailures } = event.detail
      
      addEvent('service-degraded', message, { consecutiveFailures, maxFailures })
      
      toast({
        title: "AI Service Issues",
        description: `Service degraded (${consecutiveFailures}/${maxFailures} failures)`,
        duration: 4000,
        className: "border-yellow-200 bg-yellow-50",
      })
    }

    const handleRetryScheduled = (event: CustomEvent<RetryEvent>) => {
      const { delay, attempt, nextRetryTime } = event.detail
      setNextRetryTime(nextRetryTime || null)
      
      addEvent('retry-scheduled', `Retry scheduled in ${Math.ceil((delay || 0) / 1000)}s`, { 
        attempt, 
        delay 
      })
    }

    const handleRetryAttempt = (event: CustomEvent<RetryEvent>) => {
      const { attempt } = event.detail
      
      addEvent('retry-attempt', `Attempting reconnection (attempt ${attempt})`, { attempt })
      
      toast({
        title: "Reconnecting...",
        description: `Attempting to restore AI service (attempt ${attempt})`,
        duration: 3000,
      })
    }

    const handleServiceRecovered = (event: CustomEvent<RecoveryEvent>) => {
      const { previousFailures } = event.detail
      setFallbackReason(null)
      setNextRetryTime(null)
      setRetryProgress(0)
      
      addEvent('service-recovered', `Service recovered after ${previousFailures} failures`, {
        previousFailures
      })
      
      toast({
        title: "AI Service Restored",
        description: "Connection recovered successfully. AI features are now available.",
        duration: 4000,
        className: "border-green-200 bg-green-50",
      })
    }

    // Add event listeners
    window.addEventListener('ai-fallback-activated', handleFallbackActivated as EventListener)
    window.addEventListener('ai-service-degraded', handleServiceDegraded as EventListener)
    window.addEventListener('ai-retry-scheduled', handleRetryScheduled as EventListener)
    window.addEventListener('ai-retry-attempt', handleRetryAttempt as EventListener)
    window.addEventListener('ai-service-recovered', handleServiceRecovered as EventListener)

    return () => {
      window.removeEventListener('ai-fallback-activated', handleFallbackActivated as EventListener)
      window.removeEventListener('ai-service-degraded', handleServiceDegraded as EventListener)
      window.removeEventListener('ai-retry-scheduled', handleRetryScheduled as EventListener)
      window.removeEventListener('ai-retry-attempt', handleRetryAttempt as EventListener)
      window.removeEventListener('ai-service-recovered', handleServiceRecovered as EventListener)
    }
  }, [])

  // Update retry progress
  useEffect(() => {
    if (!nextRetryTime || !autoRetryEnabled) {
      setRetryProgress(0)
      return
    }

    const updateProgress = () => {
      const now = new Date()
      const totalTime = nextRetryTime.getTime() - (now.getTime() - 30000) // Assume 30s total
      const elapsed = now.getTime() - (nextRetryTime.getTime() - totalTime)
      const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
      
      setRetryProgress(progress)
      
      if (progress >= 100) {
        setNextRetryTime(null)
        setRetryProgress(0)
      }
    }

    const interval = setInterval(updateProgress, 1000)
    return () => clearInterval(interval)
  }, [nextRetryTime, autoRetryEnabled])

  const addEvent = useCallback((type: string, message: string, details?: any) => {
    setRecentEvents(prev => [
      { type, message, timestamp: new Date(), details },
      ...prev.slice(0, 9) // Keep last 10 events
    ])
  }, [])

  const handleManualRetry = async () => {
    clearError()
    try {
      await disableFallbackMode()
    } catch (err) {
      // Error will be handled by the service
    }
  }

  const handleEnableOfflineMode = () => {
    enableFallbackMode()
    setAutoRetryEnabled(false)
  }

  const formatTimeUntilRetry = () => {
    if (!nextRetryTime) return null
    
    const now = new Date()
    const diff = nextRetryTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'now'
    
    const seconds = Math.ceil(diff / 1000)
    if (seconds < 60) return `${seconds}s`
    
    const minutes = Math.ceil(seconds / 60)
    return `${minutes}m`
  }

  // Don't show if service is working normally
  if (isAvailable && !isFallbackMode && !error) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Main Status Alert */}
      <Alert variant={error ? 'destructive' : 'default'}>
        <div className="flex items-start gap-3">
          {error ? (
            <AlertTriangle className="h-5 w-5 mt-0.5" />
          ) : isFallbackMode ? (
            <WifiOff className="h-5 w-5 mt-0.5" />
          ) : (
            <Wifi className="h-5 w-5 mt-0.5" />
          )}
          
          <div className="flex-1 min-w-0">
            <AlertTitle className="flex items-center gap-2">
              {error ? 'AI Service Error' : isFallbackMode ? 'Working Offline' : 'AI Service Status'}
              
              {nextRetryTime && autoRetryEnabled && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Retry in {formatTimeUntilRetry()}
                </Badge>
              )}
            </AlertTitle>
            
            <AlertDescription className="mt-1">
              {error?.message || fallbackReason || 'AI features are disabled. Core functionality remains available.'}
            </AlertDescription>

            {/* Retry Progress */}
            {nextRetryTime && autoRetryEnabled && retryProgress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Auto-retry progress</span>
                  <span>{Math.round(retryProgress)}%</span>
                </div>
                <Progress value={retryProgress} className="h-1" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleManualRetry}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Now
                  </>
                )}
              </Button>

              {!isFallbackMode && (
                <Button
                  onClick={handleEnableOfflineMode}
                  size="sm"
                  variant="outline"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Work Offline
                </Button>
              )}

              <Button
                onClick={() => setAutoRetryEnabled(!autoRetryEnabled)}
                size="sm"
                variant="ghost"
              >
                <Zap className="h-3 w-3 mr-1" />
                {autoRetryEnabled ? 'Disable' : 'Enable'} Auto-retry
              </Button>

              <Button
                onClick={() => setShowDetails(!showDetails)}
                size="sm"
                variant="ghost"
              >
                <Info className="h-3 w-3 mr-1" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </div>
      </Alert>

      {/* Detailed Status Panel */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Service Details</CardTitle>
            <CardDescription>Recent events and diagnostic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Events */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Events</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recentEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent events</p>
                ) : (
                  recentEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <div className="flex-shrink-0 mt-1">
                        {event.type === 'service-recovered' && <CheckCircle className="h-3 w-3 text-green-500" />}
                        {event.type === 'fallback-activated' && <XCircle className="h-3 w-3 text-red-500" />}
                        {event.type === 'service-degraded' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                        {event.type === 'retry-scheduled' && <Clock className="h-3 w-3 text-blue-500" />}
                        {event.type === 'retry-attempt' && <RefreshCw className="h-3 w-3 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground">{event.message}</p>
                        <p className="text-muted-foreground">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recovery Tips */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recovery Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Check your internet connection</li>
                <li>• Verify your API key is valid and has sufficient credits</li>
                <li>• Try disabling and re-enabling AI features in settings</li>
                <li>• Consider working in offline mode if issues persist</li>
                <li>• Contact support if problems continue</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Compact AI Fallback Status Indicator
 */
export function AIFallbackStatusIndicator({ className }: { className?: string }) {
  const { isAvailable, isFallbackMode, error } = useAIService()
  const [hasRecentIssues, setHasRecentIssues] = useState(false)

  useEffect(() => {
    const handleServiceIssues = () => {
      setHasRecentIssues(true)
      setTimeout(() => setHasRecentIssues(false), 30000) // Clear after 30 seconds
    }

    window.addEventListener('ai-service-degraded', handleServiceIssues)
    window.addEventListener('ai-fallback-activated', handleServiceIssues)

    return () => {
      window.removeEventListener('ai-service-degraded', handleServiceIssues)
      window.removeEventListener('ai-fallback-activated', handleServiceIssues)
    }
  }, [])

  if (isAvailable && !isFallbackMode && !error && !hasRecentIssues) {
    return null
  }

  const getStatusInfo = () => {
    if (error) {
      return { icon: XCircle, color: 'text-red-500', label: 'Error' }
    }
    if (isFallbackMode) {
      return { icon: WifiOff, color: 'text-orange-500', label: 'Offline' }
    }
    if (hasRecentIssues) {
      return { icon: AlertTriangle, color: 'text-yellow-500', label: 'Issues' }
    }
    return { icon: Wifi, color: 'text-green-500', label: 'Online' }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon className={`h-3 w-3 ${statusInfo.color}`} />
      <span className="text-xs text-muted-foreground">AI: {statusInfo.label}</span>
    </div>
  )
}