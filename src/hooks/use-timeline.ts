import { useState, useEffect, useCallback } from 'react'
import { timelineEventManager, timelineEventFactory } from '@/lib/timeline-events'
import { useSessions } from '@/hooks/use-app-store'
import type { 
  TimelineEvent, 
  TimelineEventType, 
  TimelineEventCategory,
  DevFlowNode,
  NodeConnection,
  TodoItem,
  CodeSnippet,
  Reference,
  Comment
} from '@/types'

interface UseTimelineOptions {
  sessionId?: string
  category?: TimelineEventCategory
  type?: TimelineEventType
  limit?: number
  autoRefresh?: boolean
}

interface UseTimelineReturn {
  events: TimelineEvent[]
  stats: {
    totalEvents: number
    eventsByCategory: Record<TimelineEventCategory, number>
    eventsByType: Record<TimelineEventType, number>
    eventsToday: number
    eventsThisWeek: number
    averageEventsPerDay: number
  }
  isLoading: boolean
  error: string | null
  refresh: () => void
  
  // Event creation methods
  trackSessionCreated: (sessionId: string, sessionName: string) => void
  trackSessionUpdated: (sessionId: string, changes: string[]) => void
  trackNodeCreated: (sessionId: string, node: DevFlowNode) => void
  trackNodeUpdated: (sessionId: string, node: DevFlowNode, changes: string[]) => void
  trackNodeDeleted: (sessionId: string, nodeId: string, nodeTitle: string, nodeType: string) => void
  trackNodeCompleted: (sessionId: string, node: DevFlowNode, duration?: number) => void
  trackNodeStatusChanged: (sessionId: string, node: DevFlowNode, oldStatus: string, newStatus: string) => void
  trackTodoAdded: (sessionId: string, nodeId: string, todo: TodoItem) => void
  trackTodoCompleted: (sessionId: string, nodeId: string, todo: TodoItem, duration?: number) => void
  trackTodoUpdated: (sessionId: string, nodeId: string, todo: TodoItem, changes: string[]) => void
  trackTodoDeleted: (sessionId: string, nodeId: string, todoId: string, todoText: string) => void
  trackCodeSnippetAdded: (sessionId: string, nodeId: string, snippet: CodeSnippet) => void
  trackCodeSnippetUpdated: (sessionId: string, nodeId: string, snippet: CodeSnippet, changes: string[]) => void
  trackCodeSnippetDeleted: (sessionId: string, nodeId: string, snippetId: string, snippetTitle: string) => void
  trackReferenceAdded: (sessionId: string, nodeId: string, reference: Reference) => void
  trackReferenceUpdated: (sessionId: string, nodeId: string, reference: Reference, changes: string[]) => void
  trackReferenceDeleted: (sessionId: string, nodeId: string, referenceId: string, referenceTitle: string) => void
  trackCommentAdded: (sessionId: string, nodeId: string, comment: Comment) => void
  trackCommentUpdated: (sessionId: string, nodeId: string, comment: Comment) => void
  trackCommentDeleted: (sessionId: string, nodeId: string, commentId: string, commentText: string) => void
  trackConnectionAdded: (sessionId: string, connection: NodeConnection, sourceNodeTitle: string, targetNodeTitle: string) => void
  trackConnectionUpdated: (sessionId: string, connection: NodeConnection, changes: string[]) => void
  trackConnectionDeleted: (sessionId: string, connectionId: string, connectionType: string, sourceNodeTitle: string, targetNodeTitle: string) => void
  trackTemplateApplied: (sessionId: string, templateName: string, nodesCreated: number) => void
  trackExportCreated: (sessionId: string, format: string, itemCount: number) => void
  trackImportCompleted: (sessionId: string, format: string, itemCount: number) => void
}

export function useTimeline(options: UseTimelineOptions = {}): UseTimelineReturn {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currentSession } = useSessions()

  const sessionId = options.sessionId || currentSession?.id

  const refresh = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)

      const fetchedEvents = sessionId
        ? timelineEventManager.getSessionEvents(sessionId, {
            category: options.category,
            type: options.type,
            limit: options.limit
          })
        : timelineEventManager.getAllEvents({
            category: options.category,
            type: options.type,
            limit: options.limit
          })

      setEvents(fetchedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline events')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, options.category, options.type, options.limit])

  // Subscribe to timeline events
  useEffect(() => {
    const unsubscribe = timelineEventManager.subscribe((event) => {
      // Only update if the event matches our filters
      if (sessionId && event.sessionId !== sessionId) return
      if (options.category && event.category !== options.category) return
      if (options.type && event.type !== options.type) return

      refresh()
    })

    return unsubscribe
  }, [sessionId, options.category, options.type, refresh])

  // Initial load and auto-refresh
  useEffect(() => {
    refresh()

    if (options.autoRefresh) {
      const interval = setInterval(refresh, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [refresh, options.autoRefresh])

  // Calculate stats
  const stats = timelineEventManager.getEventStats(sessionId)

  // Event tracking methods
  const trackSessionCreated = useCallback((sessionId: string, sessionName: string) => {
    timelineEventFactory.sessionCreated(sessionId, sessionName)
  }, [])

  const trackSessionUpdated = useCallback((sessionId: string, changes: string[]) => {
    timelineEventFactory.sessionUpdated(sessionId, changes)
  }, [])

  const trackNodeCreated = useCallback((sessionId: string, node: DevFlowNode) => {
    timelineEventFactory.nodeCreated(sessionId, node)
  }, [])

  const trackNodeUpdated = useCallback((sessionId: string, node: DevFlowNode, changes: string[]) => {
    timelineEventFactory.nodeUpdated(sessionId, node, changes)
  }, [])

  const trackNodeDeleted = useCallback((sessionId: string, nodeId: string, nodeTitle: string, nodeType: string) => {
    timelineEventFactory.nodeDeleted(sessionId, nodeId, nodeTitle, nodeType)
  }, [])

  const trackNodeCompleted = useCallback((sessionId: string, node: DevFlowNode, duration?: number) => {
    timelineEventFactory.nodeCompleted(sessionId, node, duration)
  }, [])

  const trackNodeStatusChanged = useCallback((sessionId: string, node: DevFlowNode, oldStatus: string, newStatus: string) => {
    timelineEventFactory.nodeStatusChanged(sessionId, node, oldStatus, newStatus)
  }, [])

  const trackTodoAdded = useCallback((sessionId: string, nodeId: string, todo: TodoItem) => {
    timelineEventFactory.todoAdded(sessionId, nodeId, todo)
  }, [])

  const trackTodoCompleted = useCallback((sessionId: string, nodeId: string, todo: TodoItem, duration?: number) => {
    timelineEventFactory.todoCompleted(sessionId, nodeId, todo, duration)
  }, [])

  const trackTodoUpdated = useCallback((sessionId: string, nodeId: string, todo: TodoItem, changes: string[]) => {
    timelineEventFactory.todoUpdated(sessionId, nodeId, todo, changes)
  }, [])

  const trackTodoDeleted = useCallback((sessionId: string, nodeId: string, todoId: string, todoText: string) => {
    timelineEventFactory.todoDeleted(sessionId, nodeId, todoId, todoText)
  }, [])

  const trackCodeSnippetAdded = useCallback((sessionId: string, nodeId: string, snippet: CodeSnippet) => {
    timelineEventFactory.codeSnippetAdded(sessionId, nodeId, snippet)
  }, [])

  const trackCodeSnippetUpdated = useCallback((sessionId: string, nodeId: string, snippet: CodeSnippet, changes: string[]) => {
    timelineEventFactory.codeSnippetUpdated(sessionId, nodeId, snippet, changes)
  }, [])

  const trackCodeSnippetDeleted = useCallback((sessionId: string, nodeId: string, snippetId: string, snippetTitle: string) => {
    timelineEventFactory.codeSnippetDeleted(sessionId, nodeId, snippetId, snippetTitle)
  }, [])

  const trackReferenceAdded = useCallback((sessionId: string, nodeId: string, reference: Reference) => {
    timelineEventFactory.referenceAdded(sessionId, nodeId, reference)
  }, [])

  const trackReferenceUpdated = useCallback((sessionId: string, nodeId: string, reference: Reference, changes: string[]) => {
    timelineEventFactory.referenceUpdated(sessionId, nodeId, reference, changes)
  }, [])

  const trackReferenceDeleted = useCallback((sessionId: string, nodeId: string, referenceId: string, referenceTitle: string) => {
    timelineEventFactory.referenceDeleted(sessionId, nodeId, referenceId, referenceTitle)
  }, [])

  const trackCommentAdded = useCallback((sessionId: string, nodeId: string, comment: Comment) => {
    timelineEventFactory.commentAdded(sessionId, nodeId, comment)
  }, [])

  const trackCommentUpdated = useCallback((sessionId: string, nodeId: string, comment: Comment) => {
    timelineEventFactory.commentUpdated(sessionId, nodeId, comment)
  }, [])

  const trackCommentDeleted = useCallback((sessionId: string, nodeId: string, commentId: string, commentText: string) => {
    timelineEventFactory.commentDeleted(sessionId, nodeId, commentId, commentText)
  }, [])

  const trackConnectionAdded = useCallback((sessionId: string, connection: NodeConnection, sourceNodeTitle: string, targetNodeTitle: string) => {
    timelineEventFactory.connectionAdded(sessionId, connection, sourceNodeTitle, targetNodeTitle)
  }, [])

  const trackConnectionUpdated = useCallback((sessionId: string, connection: NodeConnection, changes: string[]) => {
    timelineEventFactory.connectionUpdated(sessionId, connection, changes)
  }, [])

  const trackConnectionDeleted = useCallback((sessionId: string, connectionId: string, connectionType: string, sourceNodeTitle: string, targetNodeTitle: string) => {
    timelineEventFactory.connectionDeleted(sessionId, connectionId, connectionType, sourceNodeTitle, targetNodeTitle)
  }, [])

  const trackTemplateApplied = useCallback((sessionId: string, templateName: string, nodesCreated: number) => {
    timelineEventFactory.templateApplied(sessionId, templateName, nodesCreated)
  }, [])

  const trackExportCreated = useCallback((sessionId: string, format: string, itemCount: number) => {
    timelineEventFactory.exportCreated(sessionId, format, itemCount)
  }, [])

  const trackImportCompleted = useCallback((sessionId: string, format: string, itemCount: number) => {
    timelineEventFactory.importCompleted(sessionId, format, itemCount)
  }, [])

  return {
    events,
    stats,
    isLoading,
    error,
    refresh,
    trackSessionCreated,
    trackSessionUpdated,
    trackNodeCreated,
    trackNodeUpdated,
    trackNodeDeleted,
    trackNodeCompleted,
    trackNodeStatusChanged,
    trackTodoAdded,
    trackTodoCompleted,
    trackTodoUpdated,
    trackTodoDeleted,
    trackCodeSnippetAdded,
    trackCodeSnippetUpdated,
    trackCodeSnippetDeleted,
    trackReferenceAdded,
    trackReferenceUpdated,
    trackReferenceDeleted,
    trackCommentAdded,
    trackCommentUpdated,
    trackCommentDeleted,
    trackConnectionAdded,
    trackConnectionUpdated,
    trackConnectionDeleted,
    trackTemplateApplied,
    trackExportCreated,
    trackImportCompleted
  }
}