
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Target,
  Calendar,
  Activity,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface SessionStatisticsDashboardProps {
  analytics: ProgressAnalytics
  className?: string
}

export function SessionStatisticsDashboard({ analytics, className = '' }: SessionStatisticsDashboardProps) {
  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const nodeTypeDistribution = [
    { type: 'Task', count: analytics.totalNodes * 0.4, color: 'bg-blue-500' },
    { type: 'Code', count: analytics.totalNodes * 0.3, color: 'bg-green-500' },
    { type: 'Reference', count: analytics.totalNodes * 0.2, color: 'bg-purple-500' },
    { type: 'Comment', count: analytics.totalNodes * 0.1, color: 'bg-orange-500' }
  ]

  const statusDistribution = [
    { status: 'Completed', count: analytics.completedNodes, color: 'bg-green-500' },
    { status: 'Active', count: analytics.activeNodes, color: 'bg-blue-500' },
    { status: 'Blocked', count: analytics.blockedNodes, color: 'bg-red-500' },
    { status: 'Idle', count: analytics.idleNodes, color: 'bg-gray-400' }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Session Statistics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="time">Time Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{analytics.totalNodes}</p>
                <p className="text-sm text-muted-foreground">Total Nodes</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{analytics.completedNodes}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{analytics.completionVelocity.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Velocity/Day</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{(analytics.averageTimePerNode / (1000 * 60 * 60)).toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Avg/Node</p>
              </div>
            </div>

            {/* Completion Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Overall Progress</h4>
                <Badge variant="outline" className={getCompletionColor(analytics.completionPercentage)}>
                  {analytics.completionPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={analytics.completionPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{analytics.completedNodes} completed</span>
                <span>{analytics.totalNodes - analytics.completedNodes} remaining</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            {/* Node Status Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Node Status Distribution
              </h4>
              <div className="space-y-3">
                {statusDistribution.map((item) => (
                  <div key={item.status} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{item.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / analytics.totalNodes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Node Type Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-3">Node Type Distribution</h4>
              <div className="space-y-3">
                {nodeTypeDistribution.map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / analytics.totalNodes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{Math.round(item.count)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            {/* Time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Time Spent</span>
                </div>
                <p className="text-2xl font-bold">{formatDuration(analytics.totalTimeSpent)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Est. Time Remaining</span>
                </div>
                <p className="text-2xl font-bold">{formatDuration(analytics.estimatedTimeRemaining)}</p>
              </div>
            </div>

            {/* Productivity Times */}
            <div>
              <h4 className="text-sm font-medium mb-3">Productivity Patterns</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Most Productive Time</span>
                  <Badge variant="outline">{analytics.mostProductiveTimeOfDay}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Most Productive Day</span>
                  <Badge variant="outline">{analytics.mostProductiveDayOfWeek}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Longest Work Session</span>
                  <Badge variant="outline">{formatDuration(analytics.longestWorkSession)}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Average Session Length</span>
                  <Badge variant="outline">{formatDuration(analytics.averageSessionLength)}</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-xl font-bold">{analytics.completionVelocity.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Nodes/Day</p>
                <p className="text-xs text-muted-foreground mt-1">Completion Velocity</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-xl font-bold">{analytics.todoCompletionRate.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Todos/Day</p>
                <p className="text-xs text-muted-foreground mt-1">Todo Completion Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-xl font-bold">{(analytics.averageNodeCompletionTime / (1000 * 60 * 60)).toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-xs text-muted-foreground mt-1">Node Completion</p>
              </div>
            </div>

            {/* Efficiency Score */}
            <div>
              <h4 className="text-sm font-medium mb-3">Efficiency Analysis</h4>
              <div className="space-y-4">
                {/* Calculate efficiency metrics */}
                {(() => {
                  const completionEfficiency = Math.min((analytics.completionPercentage / 100) * 100, 100)
                  const velocityEfficiency = Math.min(analytics.completionVelocity * 20, 100)
                  const timeEfficiency = analytics.averageTimePerNode > 0 
                    ? Math.max(0, 100 - (analytics.averageTimePerNode / (1000 * 60 * 60 * 8)) * 100)
                    : 0
                  
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completion Efficiency</span>
                          <span className="text-sm font-medium">{completionEfficiency.toFixed(0)}%</span>
                        </div>
                        <Progress value={completionEfficiency} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Velocity Efficiency</span>
                          <span className="text-sm font-medium">{velocityEfficiency.toFixed(0)}%</span>
                        </div>
                        <Progress value={velocityEfficiency} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Time Efficiency</span>
                          <span className="text-sm font-medium">{timeEfficiency.toFixed(0)}%</span>
                        </div>
                        <Progress value={timeEfficiency} className="h-2" />
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Completion Forecast */}
            {analytics.completionVelocity > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Completion Forecast
                </h4>
                <p className="text-sm text-muted-foreground">
                  At your current velocity of {analytics.completionVelocity.toFixed(1)} nodes per day, 
                  you'll complete all remaining work in approximately{' '}
                  <span className="font-medium text-blue-600">
                    {Math.ceil((analytics.totalNodes - analytics.completedNodes) / analytics.completionVelocity)} days
                  </span>
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}