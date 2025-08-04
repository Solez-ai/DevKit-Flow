import React from 'react'
import { 
  Brain, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Lightbulb,
  BarChart3,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface ProductivityInsightsProps {
  analytics: ProgressAnalytics
  className?: string
}

export function ProductivityInsights({ analytics, className = '' }: ProductivityInsightsProps) {
  const {
    mostProductiveTimeOfDay,
    mostProductiveDayOfWeek,
    longestWorkSession,
    averageBreakBetweenSessions,
    workPatterns,
    averageSessionLength,
    todoCompletionRate
  } = analytics

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getPatternIcon = (pattern: string) => {
    switch (pattern.toLowerCase()) {
      case 'task creation overload':
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'inconsistent work schedule':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'status change cycling':
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Brain className="h-4 w-4 text-gray-500" />
    }
  }

  const getPatternSeverity = (pattern: { pattern: string; frequency: number }) => {
    if (pattern.frequency > 10) return 'high'
    if (pattern.frequency > 5) return 'medium'
    return 'low'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Peak Performance Times */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Peak Performance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Most Productive Time</p>
              <p className="font-medium">{mostProductiveTimeOfDay}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Most Productive Day</p>
              <p className="font-medium">{mostProductiveDayOfWeek}</p>
            </div>
          </div>
        </div>

        {/* Work Session Analytics */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Work Session Analytics
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Average Session Length</span>
              <Badge variant="outline">
                {formatDuration(averageSessionLength)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Longest Work Session</span>
              <Badge variant="outline">
                {formatDuration(longestWorkSession)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Average Break Time</span>
              <Badge variant="outline">
                {formatDuration(averageBreakBetweenSessions)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Todo Completion Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={todoCompletionRate * 10} className="w-16 h-2" />
                <Badge variant="outline">
                  {todoCompletionRate.toFixed(1)}/day
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Work Patterns */}
        {workPatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Identified Patterns
            </h4>
            <div className="space-y-3">
              {workPatterns.map((pattern, index) => {
                const severity = getPatternSeverity(pattern)
                return (
                  <Alert 
                    key={index}
                    className={
                      severity === 'high' ? 'border-red-200 bg-red-50' :
                      severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }
                  >
                    <div className="flex items-start gap-3">
                      {getPatternIcon(pattern.pattern)}
                      <div className="flex-1">
                        <AlertDescription>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{pattern.pattern}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {pattern.description}
                              </p>
                              {pattern.recommendation && (
                                <p className="text-sm font-medium mt-2 text-blue-600">
                                  💡 {pattern.recommendation}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant={
                                severity === 'high' ? 'destructive' :
                                severity === 'medium' ? 'default' :
                                'secondary'
                              }
                              className="ml-2"
                            >
                              {pattern.frequency}x
                            </Badge>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )
              })}
            </div>
          </div>
        )}

        {/* Productivity Score */}
        <div>
          <h4 className="text-sm font-medium mb-3">Productivity Score</h4>
          <div className="space-y-3">
            {/* Calculate a simple productivity score based on various factors */}
            {(() => {
              const completionScore = Math.min(analytics.completionPercentage, 100)
              const velocityScore = Math.min(analytics.completionVelocity * 20, 100)
              const consistencyScore = workPatterns.length === 0 ? 100 : Math.max(0, 100 - workPatterns.length * 20)
              const overallScore = (completionScore + velocityScore + consistencyScore) / 3

              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Productivity</span>
                    <Badge 
                      variant={
                        overallScore >= 80 ? 'default' :
                        overallScore >= 60 ? 'secondary' :
                        'outline'
                      }
                    >
                      {overallScore.toFixed(0)}/100
                    </Badge>
                  </div>
                  <Progress value={overallScore} className="h-2" />
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Completion</p>
                      <p className="font-medium">{completionScore.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Velocity</p>
                      <p className="font-medium">{velocityScore.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Consistency</p>
                      <p className="font-medium">{consistencyScore.toFixed(0)}%</p>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>

        {/* Recommendations */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </h4>
          <div className="space-y-2 text-sm">
            {analytics.completionPercentage < 50 && (
              <p className="text-muted-foreground">
                • Focus on completing existing tasks before creating new ones
              </p>
            )}
            {analytics.blockedNodes > 0 && (
              <p className="text-muted-foreground">
                • Address blocked nodes to improve overall progress
              </p>
            )}
            {analytics.completionVelocity < 1 && (
              <p className="text-muted-foreground">
                • Consider breaking down large tasks into smaller, manageable pieces
              </p>
            )}
            {workPatterns.length === 0 && analytics.completionPercentage > 70 && (
              <p className="text-muted-foreground">
                • Great work! Your productivity patterns look healthy
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}