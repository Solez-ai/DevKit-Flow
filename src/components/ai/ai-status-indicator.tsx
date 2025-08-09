
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bot, BotOff, Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'

interface AIStatusIndicatorProps {
  className?: string
  showLabel?: boolean
}

/**
 * AI Status Indicator Component
 * Shows the current status of the AI service with enhanced fallback information
 */
export function AIStatusIndicator({ className, showLabel = false }: AIStatusIndicatorProps) {
  const { isEnabled, isLoading, error } = useAIService()

  const getStatusInfo = () => {
    // Service has error
    if (error) {
      return {
        icon: AlertTriangle,
        label: 'Error',
        variant: 'destructive' as const,
        tooltip: `AI service error: ${error}`
      }
    }

    // Service not enabled
    if (!isEnabled) {
      return {
        icon: BotOff,
        label: 'Disabled',
        variant: 'outline' as const,
        tooltip: 'AI features are not enabled. Enable in settings.'
      }
    }

    // Processing requests
    if (isLoading) {
      return {
        icon: Loader2,
        label: 'Processing',
        variant: 'default' as const,
        tooltip: 'Processing AI request'
      }
    }

    // Service healthy and ready
    return {
      icon: Bot,
      label: 'Ready',
      variant: 'default' as const,
      tooltip: 'AI features are ready and available'
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon



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
                  <p className="capitalize">{isEnabled ? (isLoading ? 'processing' : 'ready') : 'disabled'}</p>
                </div>
                <div>
                  <p className="font-medium">Service</p>
                  <p>{isEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
              
              {error && (
                <div className="mt-2 text-red-400">
                  <p className="font-medium">Error</p>
                  <p>{error.message}</p>
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