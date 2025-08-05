
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bot, BotOff, Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { useAIServiceStatus } from '@/hooks/use-ai-service'

interface AIStatusIndicatorProps {
  className?: string
  showLabel?: boolean
}

/**
 * AI Status Indicator Component
 * Shows the current status of the AI service with enhanced fallback information
 */
export function AIStatusIndicator({ className, showLabel = false }: AIStatusIndicatorProps) {
  const status = useAIServiceStatus()

  const getStatusInfo = () => {
    // Service unavailable or in fallback mode
    if (!status.isAvailable && status.isFallbackMode) {
      return {
        icon: WifiOff,
        label: 'Offline',
        variant: 'secondary' as const,
        tooltip: `AI features are disabled. Working in offline mode. ${
          status.consecutiveFailures > 0 ? `${status.consecutiveFailures} consecutive failures.` : ''
        }`
      }
    }

    // Service not configured
    if (!status.isAvailable) {
      return {
        icon: BotOff,
        label: 'Disabled',
        variant: 'outline' as const,
        tooltip: 'AI features are not configured. Enable in settings.'
      }
    }

    // Service degraded
    if (status.serviceStatus === 'degraded') {
      return {
        icon: AlertTriangle,
        label: 'Degraded',
        variant: 'destructive' as const,
        tooltip: `AI service is experiencing issues. ${status.consecutiveFailures} recent failures.`
      }
    }

    // Processing requests
    if (status.queueStatus.processing > 0) {
      return {
        icon: Loader2,
        label: 'Processing',
        variant: 'default' as const,
        tooltip: `Processing ${status.queueStatus.processing} AI request(s)`
      }
    }

    // Requests queued
    if (status.queueStatus.pending > 0) {
      return {
        icon: AlertTriangle,
        label: 'Queued',
        variant: 'default' as const,
        tooltip: `${status.queueStatus.pending} AI request(s) in queue`
      }
    }

    // Service healthy and ready
    return {
      icon: status.serviceStatus === 'healthy' ? Bot : Wifi,
      label: 'Ready',
      variant: 'default' as const,
      tooltip: 'AI features are ready and available'
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)
    
    if (minutes < 1) return 'just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  const badge = (
    <Badge variant={statusInfo.variant} className={className}>
      <Icon 
        className={`h-3 w-3 ${statusInfo.icon === Loader2 ? 'animate-spin' : ''} ${showLabel ? 'mr-1' : ''}`} 
      />
      {showLabel && statusInfo.label}
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p>{statusInfo.tooltip}</p>
            
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="capitalize">{status.serviceStatus}</p>
                </div>
                <div>
                  <p className="font-medium">Last Check</p>
                  <p>{formatLastCheck(status.lastHealthCheck)}</p>
                </div>
              </div>
              
              {status.isAvailable && (
                <div className="mt-2">
                  <p className="font-medium">Queue Status</p>
                  <p>
                    {status.queueStatus.pending} pending, {status.queueStatus.processing} processing
                  </p>
                  <p>
                    {status.queueStatus.completed} completed, {status.queueStatus.failed} failed
                  </p>
                </div>
              )}
              
              {status.consecutiveFailures > 0 && (
                <div className="mt-2 text-red-400">
                  <p className="font-medium">Issues</p>
                  <p>{status.consecutiveFailures} consecutive failures</p>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact AI Status Indicator (icon only)
 */
export function AIStatusIcon({ className }: { className?: string }) {
  return <AIStatusIndicator className={className} showLabel={false} />
}

/**
 * Full AI Status Indicator (icon + label)
 */
export function AIStatusBadge({ className }: { className?: string }) {
  return <AIStatusIndicator className={className} showLabel={true} />
}