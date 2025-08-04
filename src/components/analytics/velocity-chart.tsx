
import { Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface VelocityChartProps {
  analytics: ProgressAnalytics
  className?: string
}

export function VelocityChart({ analytics, className = '' }: VelocityChartProps) {
  const { velocityTrend } = analytics

  // Calculate velocity trend direction
  const getVelocityTrend = () => {
    if (velocityTrend.length < 2) return 'stable'
    
    const recent = velocityTrend.slice(-7) // Last 7 days
    const earlier = velocityTrend.slice(-14, -7) // Previous 7 days
    
    if (recent.length === 0 || earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, d) => sum + d.velocity, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, d) => sum + d.velocity, 0) / earlier.length
    
    const change = (recentAvg - earlierAvg) / (earlierAvg || 1)
    
    if (change > 0.1) return 'accelerating'
    if (change < -0.1) return 'slowing'
    return 'steady'
  }

  const trendDirection = getVelocityTrend()
  const maxVelocity = Math.max(...velocityTrend.map(d => Math.max(d.velocity, d.movingAverage)), 1)
  
  // Get recent data (last 14 days)
  const recentVelocity = velocityTrend.slice(-14)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Velocity Trend
          </div>
          <Badge 
            variant={
              trendDirection === 'accelerating' ? 'default' : 
              trendDirection === 'slowing' ? 'destructive' : 
              'secondary'
            }
          >
            {trendDirection === 'accelerating' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trendDirection === 'slowing' && <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
            {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentVelocity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No velocity data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Velocity chart */}
            <div className="relative h-32 flex items-end justify-between gap-1">
              {recentVelocity.map((day) => {
                const velocityHeight = (day.velocity / maxVelocity) * 100
                const avgHeight = (day.movingAverage / maxVelocity) * 100
                const date = new Date(day.date)
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex flex-col justify-end h-24">
                      {/* Daily velocity bar */}
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ height: `${velocityHeight}%` }}
                        title={`${day.velocity.toFixed(1)} nodes completed`}
                      />
                      {/* Moving average line indicator */}
                      {avgHeight > 0 && (
                        <div 
                          className="absolute w-full border-t-2 border-orange-400"
                          style={{ bottom: `${avgHeight}%` }}
                          title={`7-day average: ${day.movingAverage.toFixed(1)}`}
                        />
                      )}
                    </div>
                    <div className={`text-xs text-center ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Daily Velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-orange-400"></div>
                <span>7-day Average</span>
              </div>
            </div>

            {/* Velocity insights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Velocity</p>
                <p className="text-lg font-semibold text-blue-600">
                  {analytics.completionVelocity.toFixed(1)} nodes/day
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Peak Velocity</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.max(...recentVelocity.map(d => d.velocity)).toFixed(1)} nodes/day
                </p>
              </div>
            </div>

            {/* Velocity prediction */}
            {analytics.completionVelocity > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Completion Forecast</p>
                <p className="text-xs text-muted-foreground">
                  At current velocity, you'll complete remaining work in{' '}
                  <span className="font-medium">
                    {Math.ceil((analytics.totalNodes - analytics.completedNodes) / analytics.completionVelocity)} days
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}