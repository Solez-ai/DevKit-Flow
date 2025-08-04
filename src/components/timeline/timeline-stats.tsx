
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock,
  Calendar,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { TimelineEventCategory, TimelineEventType } from '@/types'

interface TimelineStatsProps {
  stats: {
    totalEvents: number
    eventsByCategory: Record<TimelineEventCategory, number>
    eventsByType: Record<TimelineEventType, number>
    eventsToday: number
    eventsThisWeek: number
    averageEventsPerDay: number
  }
  className?: string
}

const categoryLabels: Record<TimelineEventCategory, string> = {
  session: 'Session',
  node: 'Node',
  content: 'Content',
  connection: 'Connection',
  template: 'Template',
  data: 'Data'
}

const categoryColors: Record<TimelineEventCategory, string> = {
  session: 'bg-blue-500',
  node: 'bg-green-500',
  content: 'bg-purple-500',
  connection: 'bg-orange-500',
  template: 'bg-indigo-500',
  data: 'bg-gray-500'
}

export function TimelineStats({ stats, className = '' }: TimelineStatsProps) {
  const maxCategoryCount = Math.max(...Object.values(stats.eventsByCategory))
  
  const topEventTypes = Object.entries(stats.eventsByType)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const formatEventType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.eventsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.eventsThisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{stats.averageEventsPerDay.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Events by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.eventsByCategory).map(([category, count]) => {
              const percentage = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${categoryColors[category as TimelineEventCategory]}`}
                      />
                      <span className="text-sm font-medium">
                        {categoryLabels[category as TimelineEventCategory]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Event Types */}
      {topEventTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Most Common Event Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEventTypes.map(([type, count], index) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">
                      {formatEventType(type)}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {count} events
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Activity Level</span>
              <Badge variant={stats.averageEventsPerDay > 10 ? 'default' : stats.averageEventsPerDay > 5 ? 'secondary' : 'outline'}>
                {stats.averageEventsPerDay > 10 ? 'High' : stats.averageEventsPerDay > 5 ? 'Medium' : 'Low'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Today vs Average</span>
              <div className="flex items-center gap-2">
                {stats.eventsToday > stats.averageEventsPerDay ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                )}
                <span className="text-sm font-medium">
                  {stats.eventsToday > stats.averageEventsPerDay ? '+' : ''}
                  {(stats.eventsToday - stats.averageEventsPerDay).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Weekly Progress</span>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(stats.eventsThisWeek / (stats.averageEventsPerDay * 7)) * 100} 
                  className="w-20 h-2" 
                />
                <span className="text-sm font-medium">
                  {((stats.eventsThisWeek / (stats.averageEventsPerDay * 7)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}