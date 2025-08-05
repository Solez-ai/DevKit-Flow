
import { 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle,
  Activity,
  BarChart3,
  Zap,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { ProgressChart } from './progress-chart'
import { VelocityChart } from './velocity-chart'
import { BlockedNodesPanel } from './blocked-nodes-panel'
import { ProductivityInsights } from './productivity-insights'

interface ProgressDashboardProps {
  sessionId?: string
  className?: string
}

export function ProgressDashboard({ sessionId, className = '' }: ProgressDashboardProps) {
  const { 
    analytics, 
    insights, 
    isLoading, 
    error,
    getCompletionRate,
    getVelocity,
    getBlockedNodesCount,
    getEstimatedTimeRemaining,
    getMostProductiveTime,
    getTopBlockingReason
  } = useProgressAnalytics({ 
    sessionId, 
    includeInsights: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load progress analytics: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!analytics) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No progress data available</p>
      </div>
    )
  }

  const completionRate = getCompletionRate()
  const velocity = getVelocity()
  const blockedCount = getBlockedNodesCount()
  const estimatedHours = getEstimatedTimeRemaining() / (1000 * 60 * 60)
  const productiveTime = getMostProductiveTime()
  const topBlocker = getTopBlockingReason()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
                <Progress value={completionRate} className="mt-2 h-2" />
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Velocity</p>
                <p className="text-2xl font-bold">{velocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">nodes/day</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Nodes</p>
                <p className="text-2xl font-bold">{blockedCount}</p>
                {blockedCount > 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Needs attention
                  </Badge>
                )}
              </div>
              <AlertTriangle className={`h-8 w-8 ${blockedCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Time Left</p>
                <p className="text-2xl font-bold">{estimatedHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalNodes - analytics.completedNodes} nodes remaining
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, index) => (
                <Alert key={index} className={
                  insight.type === 'success' ? 'border-green-200 bg-green-50' :
                  insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  insight.type === 'error' ? 'border-red-200 bg-red-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <p className="text-sm font-medium mt-2 text-blue-600">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                      {insight.metric !== undefined && (
                        <Badge variant="outline" className="ml-4">
                          {typeof insight.metric === 'number' ? insight.metric.toFixed(1) : insight.metric}
                        </Badge>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart analytics={analytics} />
        <VelocityChart analytics={analytics} />
      </div>

      {/* Productivity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityInsights analytics={analytics} />
        {blockedCount > 0 && <BlockedNodesPanel analytics={analytics} />}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Productive Time</p>
                <p className="text-lg font-semibold">{productiveTime}</p>
              </div>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Time/Node</p>
                <p className="text-lg font-semibold">
                  {(analytics.averageTimePerNode / (1000 * 60 * 60)).toFixed(1)}h
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Blocker</p>
                <p className="text-lg font-semibold">
                  {topBlocker || 'None'}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}