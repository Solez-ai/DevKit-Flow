
import { TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface ProgressChartProps {
  analytics: ProgressAnalytics
  className?: string
}

export function ProgressChart({ analytics, className = '' }: ProgressChartProps) {
  const { completionTrend } = analytics

  // Calculate trend direction
  const getTrendDirection = () => {
    if (completionTrend.length < 2) return 'stable'
    
    const recent = completionTrend.slice(-7) // Last 7 days
    const earlier = completionTrend.slice(-14, -7) // Previous 7 days
    
    if (recent.length === 0 || earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, d) => sum + d.netProgress, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, d) => sum + d.netProgress, 0) / earlier.length
    
    const change = recentAvg - earlierAvg
    
    if (change > 0.5) return 'improving'
    if (change < -0.5) return 'declining'
    return 'stable'
  }

  const trendDirection = getTrendDirection()
  const maxValue = Math.max(...completionTrend.map(d => Math.max(d.completed, d.created)), 1)
  
  // Get recent data (last 14 days)
  const recentTrend = completionTrend.slice(-14)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Progress Trend
          </div>
          <Badge 
            variant={
              trendDirection === 'improving' ? 'default' : 
              trendDirection === 'declining' ? 'destructive' : 
              'secondary'
            }
          >
            {trendDirection === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trendDirection === 'declining' && <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
            {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTrend.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No progress data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart visualization */}
            <div className="relative h-32 flex items-end justify-between gap-1">
              {recentTrend.map((day, index) => {
                const completedHeight = (day.completed / maxValue) * 100
                const createdHeight = (day.created / maxValue) * 100
                const date = new Date(day.date)
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex flex-col justify-end h-24">
                      {/* Created nodes bar (background) */}
                      <div 
                        className="w-full bg-red-200 rounded-t-sm"
                        style={{ height: `${createdHeight}%` }}
                        title={`${day.created} nodes created`}
                      />
                      {/* Completed nodes bar (foreground) */}
                      <div 
                        className="w-full bg-green-500 rounded-t-sm absolute bottom-0"
                        style={{ height: `${completedHeight}%` }}
                        title={`${day.completed} nodes completed`}
                      />
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
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>Created</span>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Completed</p>
                <p className="text-lg font-semibold text-green-600">
                  {recentTrend.reduce((sum, d) => sum + d.completed, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Created</p>
                <p className="text-lg font-semibold text-blue-600">
                  {recentTrend.reduce((sum, d) => sum + d.created, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Progress</p>
                <p className={`text-lg font-semibold ${
                  recentTrend.reduce((sum, d) => sum + d.netProgress, 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {recentTrend.reduce((sum, d) => sum + d.netProgress, 0) >= 0 ? '+' : ''}
                  {recentTrend.reduce((sum, d) => sum + d.netProgress, 0)}
                </p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Daily Average Completion</span>
                <span className="font-medium">
                  {(recentTrend.reduce((sum, d) => sum + d.completed, 0) / recentTrend.length).toFixed(1)} nodes/day
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Best Day</span>
                <span className="font-medium">
                  {Math.max(...recentTrend.map(d => d.completed))} nodes completed
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Consistency Score</span>
                <span className="font-medium">
                  {(() => {
                    const completions = recentTrend.map(d => d.completed)
                    const avg = completions.reduce((sum, val) => sum + val, 0) / completions.length
                    const variance = completions.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / completions.length
                    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avg) * 100)
                    return isNaN(consistency) ? 0 : consistency.toFixed(0)
                  })()}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}