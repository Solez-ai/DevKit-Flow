import React, { useState, useMemo } from 'react'
import { format, isToday, isYesterday, startOfDay, isSameDay } from 'date-fns'
import { 
  Clock, 
  Search, 
  Calendar,
  Activity,
  GitCommit,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Code,
  Link,
  MessageCircle,
  Download,
  Upload,
  Layers
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { 
  TimelineEvent, 
  TimelineEventType, 
  TimelineEventCategory 
} from '@/types'

interface TimelineViewProps {
  events: TimelineEvent[]
  sessionId?: string
  className?: string
  onEventClick?: (event: TimelineEvent) => void
  showFilters?: boolean
  maxHeight?: string
}

interface TimelineFilters {
  search: string
  category: TimelineEventCategory | 'all'
  type: TimelineEventType | 'all'
  dateRange: 'all' | 'today' | 'yesterday' | 'week' | 'month'
}

const eventIcons: Record<TimelineEventType, React.ComponentType<{ className?: string }>> = {
  session_created: Plus,
  session_updated: Edit,
  node_created: Plus,
  node_updated: Edit,
  node_deleted: Trash2,
  node_completed: CheckCircle,
  node_status_changed: Activity,
  todo_added: Plus,
  todo_updated: Edit,
  todo_completed: CheckCircle,
  todo_deleted: Trash2,
  code_snippet_added: Code,
  code_snippet_updated: Code,
  code_snippet_deleted: Code,
  reference_added: Link,
  reference_updated: Link,
  reference_deleted: Link,
  comment_added: MessageCircle,
  comment_updated: MessageCircle,
  comment_deleted: MessageCircle,
  connection_added: GitCommit,
  connection_updated: GitCommit,
  connection_deleted: GitCommit,
  template_applied: Layers,
  export_created: Download,
  import_completed: Upload
}

const categoryColors: Record<TimelineEventCategory, string> = {
  session: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  node: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  content: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  connection: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  template: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  data: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

export function TimelineView({ 
  events, 
  sessionId, 
  className = '',
  onEventClick,
  showFilters = true,
  maxHeight = '600px'
}: TimelineViewProps) {
  const [filters, setFilters] = useState<TimelineFilters>({
    search: '',
    category: 'all',
    type: 'all',
    dateRange: 'all'
  })

  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(event => 
        event.description.toLowerCase().includes(searchLower) ||
        event.details?.toLowerCase().includes(searchLower) ||
        event.type.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(event => event.category === filters.category)
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type)
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = startOfDay(now)
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(event => {
        const eventDate = event.timestamp
        switch (filters.dateRange) {
          case 'today':
            return isSameDay(eventDate, today)
          case 'yesterday':
            return isSameDay(eventDate, yesterday)
          case 'week':
            return eventDate >= weekAgo
          case 'month':
            return eventDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [events, filters])

  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {}
    
    filteredEvents.forEach(event => {
      const dateKey = format(event.timestamp, 'yyyy-MM-dd')
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(event)
    })

    return groups
  }, [filteredEvents])

  const formatDateGroup = (dateStr: string): string => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  const formatEventTime = (timestamp: Date): string => {
    return format(timestamp, 'h:mm a')
  }

  const getEventIcon = (type: TimelineEventType) => {
    const IconComponent = eventIcons[type] || Activity
    return IconComponent
  }

  const handleFilterChange = (key: keyof TimelineFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
          {sessionId && (
            <Badge variant="outline" className="ml-2">
              Session Events
            </Badge>
          )}
        </CardTitle>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="node">Node</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="connection">Connection</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {(filters.search || filters.category !== 'all' || filters.type !== 'all' || filters.dateRange !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  search: '',
                  category: 'all',
                  type: 'all',
                  dateRange: 'all'
                })}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          {Object.keys(groupedEvents).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events found</p>
              {(filters.search || filters.category !== 'all' || filters.dateRange !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([dateStr, dayEvents]) => (
                <div key={dateStr}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {formatDateGroup(dateStr)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {dayEvents.length} events
                    </Badge>
                  </div>

                  <div className="space-y-3 ml-6">
                    {dayEvents.map((event) => {
                      const IconComponent = getEventIcon(event.type)
                      
                      return (
                        <div
                          key={event.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            onEventClick 
                              ? 'cursor-pointer hover:bg-muted/50' 
                              : ''
                          }`}
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-8 h-8 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium leading-tight">
                                  {event.description}
                                </p>
                                {event.details && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {event.details}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${categoryColors[event.category]}`}
                                >
                                  {event.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatEventTime(event.timestamp)}
                                </span>
                              </div>
                            </div>

                            {event.duration && (
                              <div className="flex items-center gap-1 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Duration: {Math.round(event.duration / 1000)}s
                                </span>
                              </div>
                            )}

                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <details className="cursor-pointer">
                                  <summary className="hover:text-foreground">
                                    View details
                                  </summary>
                                  <div className="mt-1 p-2 bg-muted/30 rounded text-xs font-mono">
                                    {Object.entries(event.metadata).map(([key, value]) => (
                                      <div key={key} className="flex gap-2">
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span>{JSON.stringify(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {Object.keys(groupedEvents).indexOf(dateStr) < Object.keys(groupedEvents).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}