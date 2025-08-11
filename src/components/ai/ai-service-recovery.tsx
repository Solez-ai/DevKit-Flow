import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Wifi,
  WifiOff,
  Settings,
  Info
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import type { AIServiceStatus } from '@/types'

interface AIServiceRecoveryProps {
  onOpenSettings?: () => void
  className?: string
}

/**
 * AI Service Recovery Component
 * Provides detailed recovery options and status monitoring
 */
export function AIServiceRecovery({ onOpenSettings, className }: AIServiceRecoveryProps) {
  const { 
    disableFallbackMode, 
    enableFallbackMode, 
    clearError, 
    isLoading,
    error,
    serviceStatus,
    isFallbackMode,
    lastHealthCheck,
    consecutiveFailures,
    queueStatus
  } = useAIService()
  const [recoveryAttempts, setRecoveryAttempts] = useState(0)
  const [lastRecoveryTime, setLastRecoveryTime] = useState<Date | null>(null)
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(false)

  // Auto-retry logic
  useEffect(() => {
    if (autoRetryEnabled && serviceStatus === 'unavailable' && !isLoading) {
      const retryDelay = Math.min(5000 * Math.pow(2, recoveryAttempts), 300000) // Max 5 minutes
      
      const timeout = setTimeout(() => {
        handleRecovery()
      }, retryDelay)

      return () => clearTimeout(timeout)
    }
  }, [autoRetryEnabled, serviceStatus, recoveryAttempts, isLoading])

  const handleRecovery = async () => {
    setRecoveryAttempts(prev => prev + 1)
    setLastRecoveryTime(new Date())
    clearError()
    
    try {
      await disableFallbackMode()
      setRecoveryAttempts(0) // Reset on success
    } catch (err) {
      // Error will be handled by the hook
    }
  }

  const handleEnableFallback = () => {
    enableFallbackMode()
    setAutoRetryEnabled(false)
  }

  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unavailable': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (serviceStatus) {
      case 'healthy': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'unavailable': return XCircle
      default: return Clock
    }
  }

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    
    if (minutes < 1) return 'just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  const getNextRetryTime = () => {
    if (!lastRecoveryTime || !autoRetryEnabled) return null
    
    const retryDelay = Math.min(5000 * Math.pow(2, recoveryAttempts), 300000)
    const nextRetry = new Date(lastRecoveryTime.getTime() + retryDelay)
    const now = new Date()
    
    if (nextRetry <= now) return 'now'
    
    const diff = nextRetry.getTime() - now.getTime()
    const seconds = Math.ceil(diff / 1000)
    
    if (seconds < 60) return `${seconds}s`
    return `${Math.ceil(seconds / 60)}m`
  }

  const StatusIcon = getStatusIcon()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${getStatusColor()}`} />
          AI Service Status
        </CardTitle>
        <CardDescription>
          Monitor and manage AI service connectivity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Service Status</div>
            <Badge 
              variant={serviceStatus === 'healthy' ? 'default' : 'secondary'}
              className="mt-1"
            >
              {serviceStatus === 'healthy' && <Wifi className="h-3 w-3 mr-1" />}
              {serviceStatus !== 'healthy' && <WifiOff className="h-3 w-3 mr-1" />}
              {serviceStatus.charAt(0).toUpperCase() + serviceStatus.slice(1)}
            </Badge>
          </div>
          
          <div>
            <div className="text-sm font-medium">Mode</div>
            <Badge 
              variant={isFallbackMode ? 'secondary' : 'default'}
              className="mt-1"
            >
              {isFallbackMode ? 'Offline' : 'Online'}
            </Badge>
          </div>
        </div>

        {/* Health Check Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Last Health Check:</span>
            <span className="text-muted-foreground">
              {formatLastCheck(lastHealthCheck)}
            </span>
          </div>
          
          {consecutiveFailures > 0 && (
            <div className="flex justify-between text-sm">
              <span>Consecutive Failures:</span>
              <span className="text-red-600 font-medium">
                {consecutiveFailures}
              </span>
            </div>
          )}
          
          {recoveryAttempts > 0 && (
            <div className="flex justify-between text-sm">
              <span>Recovery Attempts:</span>
              <span className="text-muted-foreground">
                {recoveryAttempts}
              </span>
            </div>
          )}
        </div>

        {/* Queue Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Request Queue</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">{queueStatus.pending}</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{queueStatus.processing}</div>
              <div className="text-muted-foreground">Processing</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{queueStatus.completed}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{queueStatus.failed}</div>
              <div className="text-muted-foreground">Failed</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
              {error.retryAfter && (
                <div className="mt-1 text-xs">
                  Retry available in {Math.ceil(error.retryAfter / 1000)} seconds
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-retry Status */}
        {autoRetryEnabled && serviceStatus === 'unavailable' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Auto-retry enabled. Next attempt: {getNextRetryTime()}
              <Progress 
                value={lastRecoveryTime ? 
                  Math.min(100, ((Date.now() - lastRecoveryTime.getTime()) / 
                  Math.min(5000 * Math.pow(2, recoveryAttempts), 300000)) * 100) : 0
                } 
                className="mt-2 h-1"
              />
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {serviceStatus !== 'healthy' && (
            <Button
              onClick={handleRecovery}
              disabled={isLoading}
              size="sm"
              variant="default"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Connection
                </>
              )}
            </Button>
          )}
          
          {!isFallbackMode && serviceStatus !== 'healthy' && (
            <Button
              onClick={handleEnableFallback}
              size="sm"
              variant="outline"
            >
              <WifiOff className="h-3 w-3 mr-1" />
              Work Offline
            </Button>
          )}
          
          {serviceStatus === 'unavailable' && (
            <Button
              onClick={() => setAutoRetryEnabled(!autoRetryEnabled)}
              size="sm"
              variant="outline"
            >
              <Clock className="h-3 w-3 mr-1" />
              {autoRetryEnabled ? 'Disable' : 'Enable'} Auto-retry
            </Button>
          )}
          
          {onOpenSettings && (
            <Button
              onClick={onOpenSettings}
              size="sm"
              variant="outline"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          )}
        </div>

        {/* Recovery Tips */}
        {serviceStatus !== 'healthy' && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Recovery Tips:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify your API key is valid</li>
              <li>• Ensure you have sufficient API credits</li>
              <li>• Try switching to offline mode if issues persist</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact AI Service Recovery Button
 */
export function AIServiceRecoveryButton({ className }: { className?: string }) {
  const { isEnabled, isLoading, error, serviceStatus, disableFallbackMode } = useAIService()

  if (serviceStatus === 'healthy') {
    return null
  }

  return (
    <Button
      onClick={disableFallbackMode}
      disabled={isLoading}
      size="sm"
      variant="outline"
      className={className}
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Retrying...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry AI
        </>
      )}
    </Button>
  )
}