import { useState } from 'react'
import { 
  Clock, 
  BarChart3, 
  Filter,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TimelineView } from './timeline-view'
import { TimelineStats } from './timeline-stats'
import { useTimeline } from '@/hooks/use-timeline'
import { useSessions } from '@/hooks/use-app-store'
import type { TimelineEvent, TimelineEventCategory } from '@/types'

interface TimelinePanelProps {
  className?: string
  defaultTab?: 'timeline' | 'stats'
  showSessionSelector?: boolean
  maxHeight?: string
}

export function TimelinePanel({ 
  className = '',
  defaultTab = 'timeline',
  showSessionSelector = true,
  maxHeight = '600px'
}: TimelinePanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<TimelineEventCategory | 'all'>('all')
  
  const { sessions, currentSession } = useSessions()
  const sessionId = selectedSessionId || currentSession?.id
  
  const { 
    events, 
    stats, 
    isLoading, 
    error, 
    refresh 
  } = useTimeline({ 
    sessionId,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    autoRefresh: true
  })

  const handleEventClick = (event: TimelineEvent) => {
    // TODO: Implement event detail view or navigation
    console.log('Timeline event clicked:', event)
  }

  const handleExportTimeline = () => {
    const dataStr = JSON.stringify(events, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timeline-${sessionId || 'all'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectedSession = sessions.find(s => s.id === sessionId)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline & Activity
            {selectedSession && (
              <Badge variant="outline" className="ml-2">
                {selectedSession.name}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Session Selector */}
            {showSessionSelector && sessions.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedSession ? selectedSession.name : 'All Sessions'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Select Session</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedSessionId(undefined)}>
                    <span>All Sessions</span>
                  </DropdownMenuItem>
                  {sessions.map((session) => (
                    <DropdownMenuItem 
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <span>{session.name}</span>
                      {session.id === currentSession?.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('session')}>
                  Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('node')}>
                  Node
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('content')}>
                  Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('connection')}>
                  Connection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('template')}>
                  Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCategoryFilter('data')}>
                  Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={refresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportTimeline}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Timeline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "timeline" | "stats")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
              <Badge variant="secondary" className="text-xs">
                {events.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            {error ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading timeline: {error}</p>
                <Button variant="outline" onClick={refresh} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <TimelineView
                events={events}
                sessionId={sessionId}
                onEventClick={handleEventClick}
                showFilters={false} // We handle filters at the panel level
                maxHeight={maxHeight}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <div style={{ maxHeight }} className="overflow-auto">
              <TimelineStats stats={stats} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}