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
import { generateId } from '@/lib/utils'

/**
 * Timeline Event Manager
 * Handles creation, tracking, and management of timeline events
 */
export class TimelineEventManager {
  private events: Map<string, TimelineEvent[]> = new Map()
  private listeners: Set<(event: TimelineEvent) => void> = new Set()

  /**
   * Create a new timeline event
   */
  createEvent(
    type: TimelineEventType,
    sessionId: string,
    description: string,
    options: {
      nodeId?: string
      details?: string
      metadata?: Record<string, any>
      duration?: number
      userId?: string
    } = {}
  ): TimelineEvent {
    const event: TimelineEvent = {
      id: generateId(),
      timestamp: new Date(),
      type,
      category: this.getCategoryForType(type),
      sessionId,
      description,
      ...options
    }

    this.addEvent(event)
    return event
  }

  /**
   * Add an event to the timeline
   */
  addEvent(event: TimelineEvent): void {
    const sessionEvents = this.events.get(event.sessionId) || []
    sessionEvents.push(event)
    this.events.set(event.sessionId, sessionEvents)

    // Notify listeners
    this.listeners.forEach(listener => listener(event))
  }

  /**
   * Get events for a session
   */
  getSessionEvents(sessionId: string, options: {
    category?: TimelineEventCategory
    type?: TimelineEventType
    nodeId?: string
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  } = {}): TimelineEvent[] {
    const sessionEvents = this.events.get(sessionId) || []
    let filteredEvents = [...sessionEvents]

    // Apply filters
    if (options.category) {
      filteredEvents = filteredEvents.filter(e => e.category === options.category)
    }

    if (options.type) {
      filteredEvents = filteredEvents.filter(e => e.type === options.type)
    }

    if (options.nodeId) {
      filteredEvents = filteredEvents.filter(e => e.nodeId === options.nodeId)
    }

    if (options.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= options.startDate!)
    }

    if (options.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= options.endDate!)
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    if (options.offset) {
      filteredEvents = filteredEvents.slice(options.offset)
    }

    if (options.limit) {
      filteredEvents = filteredEvents.slice(0, options.limit)
    }

    return filteredEvents
  }

  /**
   * Get all events across sessions
   */
  getAllEvents(options: {
    category?: TimelineEventCategory
    type?: TimelineEventType
    limit?: number
    startDate?: Date
    endDate?: Date
  } = {}): TimelineEvent[] {
    const allEvents: TimelineEvent[] = []
    
    for (const sessionEvents of this.events.values()) {
      allEvents.push(...sessionEvents)
    }

    let filteredEvents = allEvents

    // Apply filters
    if (options.category) {
      filteredEvents = filteredEvents.filter(e => e.category === options.category)
    }

    if (options.type) {
      filteredEvents = filteredEvents.filter(e => e.type === options.type)
    }

    if (options.startDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= options.startDate!)
    }

    if (options.endDate) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= options.endDate!)
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    if (options.limit) {
      filteredEvents = filteredEvents.slice(0, options.limit)
    }

    return filteredEvents
  }

  /**
   * Subscribe to timeline events
   */
  subscribe(listener: (event: TimelineEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Clear events for a session
   */
  clearSessionEvents(sessionId: string): void {
    this.events.delete(sessionId)
  }

  /**
   * Clear all events
   */
  clearAllEvents(): void {
    this.events.clear()
  }

  /**
   * Get event statistics
   */
  getEventStats(sessionId?: string): {
    totalEvents: number
    eventsByCategory: Record<TimelineEventCategory, number>
    eventsByType: Record<TimelineEventType, number>
    eventsToday: number
    eventsThisWeek: number
    averageEventsPerDay: number
  } {
    const events = sessionId 
      ? this.getSessionEvents(sessionId)
      : this.getAllEvents()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const eventsByCategory: Record<TimelineEventCategory, number> = {
      session: 0,
      node: 0,
      content: 0,
      connection: 0,
      template: 0,
      data: 0
    }

    const eventsByType: Record<TimelineEventType, number> = {
      session_created: 0,
      session_updated: 0,
      node_created: 0,
      node_updated: 0,
      node_deleted: 0,
      node_completed: 0,
      node_status_changed: 0,
      todo_added: 0,
      todo_updated: 0,
      todo_completed: 0,
      todo_deleted: 0,
      code_snippet_added: 0,
      code_snippet_updated: 0,
      code_snippet_deleted: 0,
      reference_added: 0,
      reference_updated: 0,
      reference_deleted: 0,
      comment_added: 0,
      comment_updated: 0,
      comment_deleted: 0,
      connection_added: 0,
      connection_updated: 0,
      connection_deleted: 0,
      template_applied: 0,
      export_created: 0,
      import_completed: 0
    }

    let eventsToday = 0
    let eventsThisWeek = 0

    events.forEach(event => {
      eventsByCategory[event.category]++
      eventsByType[event.type]++

      if (event.timestamp >= today) {
        eventsToday++
      }

      if (event.timestamp >= weekAgo) {
        eventsThisWeek++
      }
    })

    const averageEventsPerDay = events.length > 0 
      ? eventsThisWeek / 7 
      : 0

    return {
      totalEvents: events.length,
      eventsByCategory,
      eventsByType,
      eventsToday,
      eventsThisWeek,
      averageEventsPerDay
    }
  }

  /**
   * Get category for event type
   */
  private getCategoryForType(type: TimelineEventType): TimelineEventCategory {
    const categoryMap: Record<TimelineEventType, TimelineEventCategory> = {
      session_created: 'session',
      session_updated: 'session',
      node_created: 'node',
      node_updated: 'node',
      node_deleted: 'node',
      node_completed: 'node',
      node_status_changed: 'node',
      todo_added: 'content',
      todo_updated: 'content',
      todo_completed: 'content',
      todo_deleted: 'content',
      code_snippet_added: 'content',
      code_snippet_updated: 'content',
      code_snippet_deleted: 'content',
      reference_added: 'content',
      reference_updated: 'content',
      reference_deleted: 'content',
      comment_added: 'content',
      comment_updated: 'content',
      comment_deleted: 'content',
      connection_added: 'connection',
      connection_updated: 'connection',
      connection_deleted: 'connection',
      template_applied: 'template',
      export_created: 'data',
      import_completed: 'data'
    }

    return categoryMap[type]
  }
}

/**
 * Timeline Event Factory
 * Provides convenient methods for creating specific types of timeline events
 */
export class TimelineEventFactory {
  constructor(private eventManager: TimelineEventManager) {}

  // Session events
  sessionCreated(sessionId: string, sessionName: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'session_created',
      sessionId,
      `Session "${sessionName}" created`,
      {
        metadata: { sessionName },
        userId
      }
    )
  }

  sessionUpdated(sessionId: string, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'session_updated',
      sessionId,
      `Session updated: ${changes.join(', ')}`,
      {
        metadata: { changes },
        userId
      }
    )
  }

  // Node events
  nodeCreated(sessionId: string, node: DevFlowNode, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'node_created',
      sessionId,
      `${node.type} node "${node.title}" created`,
      {
        nodeId: node.id,
        metadata: { 
          nodeType: node.type,
          nodeTitle: node.title,
          position: node.position
        },
        userId
      }
    )
  }

  nodeUpdated(sessionId: string, node: DevFlowNode, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'node_updated',
      sessionId,
      `Node "${node.title}" updated: ${changes.join(', ')}`,
      {
        nodeId: node.id,
        metadata: { 
          nodeType: node.type,
          nodeTitle: node.title,
          changes
        },
        userId
      }
    )
  }

  nodeDeleted(sessionId: string, nodeId: string, nodeTitle: string, nodeType: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'node_deleted',
      sessionId,
      `${nodeType} node "${nodeTitle}" deleted`,
      {
        nodeId,
        metadata: { 
          nodeType,
          nodeTitle
        },
        userId
      }
    )
  }

  nodeCompleted(sessionId: string, node: DevFlowNode, duration?: number, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'node_completed',
      sessionId,
      `Node "${node.title}" completed`,
      {
        nodeId: node.id,
        duration,
        metadata: { 
          nodeType: node.type,
          nodeTitle: node.title,
          completedTodos: node.content.todos.filter(t => t.completed).length,
          totalTodos: node.content.todos.length
        },
        userId
      }
    )
  }

  nodeStatusChanged(sessionId: string, node: DevFlowNode, oldStatus: string, newStatus: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'node_status_changed',
      sessionId,
      `Node "${node.title}" status changed from ${oldStatus} to ${newStatus}`,
      {
        nodeId: node.id,
        metadata: { 
          nodeType: node.type,
          nodeTitle: node.title,
          oldStatus,
          newStatus
        },
        userId
      }
    )
  }

  // Todo events
  todoAdded(sessionId: string, nodeId: string, todo: TodoItem, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'todo_added',
      sessionId,
      `Todo "${todo.text}" added`,
      {
        nodeId,
        metadata: { 
          todoId: todo.id,
          todoText: todo.text,
          estimatedMinutes: todo.estimatedMinutes
        },
        userId
      }
    )
  }

  todoCompleted(sessionId: string, nodeId: string, todo: TodoItem, duration?: number, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'todo_completed',
      sessionId,
      `Todo "${todo.text}" completed`,
      {
        nodeId,
        duration,
        metadata: { 
          todoId: todo.id,
          todoText: todo.text,
          estimatedMinutes: todo.estimatedMinutes,
          actualMinutes: todo.actualMinutes
        },
        userId
      }
    )
  }

  todoUpdated(sessionId: string, nodeId: string, todo: TodoItem, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'todo_updated',
      sessionId,
      `Todo "${todo.text}" updated: ${changes.join(', ')}`,
      {
        nodeId,
        metadata: { 
          todoId: todo.id,
          todoText: todo.text,
          changes
        },
        userId
      }
    )
  }

  todoDeleted(sessionId: string, nodeId: string, todoId: string, todoText: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'todo_deleted',
      sessionId,
      `Todo "${todoText}" deleted`,
      {
        nodeId,
        metadata: { 
          todoId,
          todoText
        },
        userId
      }
    )
  }

  // Code snippet events
  codeSnippetAdded(sessionId: string, nodeId: string, snippet: CodeSnippet, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'code_snippet_added',
      sessionId,
      `Code snippet "${snippet.title}" added`,
      {
        nodeId,
        metadata: { 
          snippetId: snippet.id,
          snippetTitle: snippet.title,
          language: snippet.language,
          isTemplate: snippet.isTemplate
        },
        userId
      }
    )
  }

  codeSnippetUpdated(sessionId: string, nodeId: string, snippet: CodeSnippet, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'code_snippet_updated',
      sessionId,
      `Code snippet "${snippet.title}" updated: ${changes.join(', ')}`,
      {
        nodeId,
        metadata: { 
          snippetId: snippet.id,
          snippetTitle: snippet.title,
          language: snippet.language,
          changes
        },
        userId
      }
    )
  }

  codeSnippetDeleted(sessionId: string, nodeId: string, snippetId: string, snippetTitle: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'code_snippet_deleted',
      sessionId,
      `Code snippet "${snippetTitle}" deleted`,
      {
        nodeId,
        metadata: { 
          snippetId,
          snippetTitle
        },
        userId
      }
    )
  }

  // Reference events
  referenceAdded(sessionId: string, nodeId: string, reference: Reference, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'reference_added',
      sessionId,
      `Reference "${reference.title}" added`,
      {
        nodeId,
        metadata: { 
          referenceId: reference.id,
          referenceTitle: reference.title,
          referenceType: reference.type,
          importance: reference.importance
        },
        userId
      }
    )
  }

  referenceUpdated(sessionId: string, nodeId: string, reference: Reference, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'reference_updated',
      sessionId,
      `Reference "${reference.title}" updated: ${changes.join(', ')}`,
      {
        nodeId,
        metadata: { 
          referenceId: reference.id,
          referenceTitle: reference.title,
          referenceType: reference.type,
          changes
        },
        userId
      }
    )
  }

  referenceDeleted(sessionId: string, nodeId: string, referenceId: string, referenceTitle: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'reference_deleted',
      sessionId,
      `Reference "${referenceTitle}" deleted`,
      {
        nodeId,
        metadata: { 
          referenceId,
          referenceTitle
        },
        userId
      }
    )
  }

  // Comment events
  commentAdded(sessionId: string, nodeId: string, comment: Comment, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'comment_added',
      sessionId,
      `Comment added: "${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
      {
        nodeId,
        metadata: { 
          commentId: comment.id,
          commentText: comment.text,
          author: comment.author
        },
        userId
      }
    )
  }

  commentUpdated(sessionId: string, nodeId: string, comment: Comment, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'comment_updated',
      sessionId,
      `Comment updated: "${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
      {
        nodeId,
        metadata: { 
          commentId: comment.id,
          commentText: comment.text,
          author: comment.author
        },
        userId
      }
    )
  }

  commentDeleted(sessionId: string, nodeId: string, commentId: string, commentText: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'comment_deleted',
      sessionId,
      `Comment deleted: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      {
        nodeId,
        metadata: { 
          commentId,
          commentText
        },
        userId
      }
    )
  }

  // Connection events
  connectionAdded(sessionId: string, connection: NodeConnection, sourceNodeTitle: string, targetNodeTitle: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'connection_added',
      sessionId,
      `${connection.type} connection added from "${sourceNodeTitle}" to "${targetNodeTitle}"`,
      {
        metadata: { 
          connectionId: connection.id,
          connectionType: connection.type,
          sourceNodeId: connection.sourceNodeId,
          targetNodeId: connection.targetNodeId,
          sourceNodeTitle,
          targetNodeTitle,
          label: connection.label
        },
        userId
      }
    )
  }

  connectionUpdated(sessionId: string, connection: NodeConnection, changes: string[], userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'connection_updated',
      sessionId,
      `Connection updated: ${changes.join(', ')}`,
      {
        metadata: { 
          connectionId: connection.id,
          connectionType: connection.type,
          sourceNodeId: connection.sourceNodeId,
          targetNodeId: connection.targetNodeId,
          changes
        },
        userId
      }
    )
  }

  connectionDeleted(sessionId: string, connectionId: string, connectionType: string, sourceNodeTitle: string, targetNodeTitle: string, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'connection_deleted',
      sessionId,
      `${connectionType} connection deleted from "${sourceNodeTitle}" to "${targetNodeTitle}"`,
      {
        metadata: { 
          connectionId,
          connectionType,
          sourceNodeTitle,
          targetNodeTitle
        },
        userId
      }
    )
  }

  // Template events
  templateApplied(sessionId: string, templateName: string, nodesCreated: number, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'template_applied',
      sessionId,
      `Template "${templateName}" applied, created ${nodesCreated} nodes`,
      {
        metadata: { 
          templateName,
          nodesCreated
        },
        userId
      }
    )
  }

  // Data events
  exportCreated(sessionId: string, format: string, itemCount: number, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'export_created',
      sessionId,
      `Session exported to ${format} format (${itemCount} items)`,
      {
        metadata: { 
          format,
          itemCount
        },
        userId
      }
    )
  }

  importCompleted(sessionId: string, format: string, itemCount: number, userId?: string): TimelineEvent {
    return this.eventManager.createEvent(
      'import_completed',
      sessionId,
      `Data imported from ${format} format (${itemCount} items)`,
      {
        metadata: { 
          format,
          itemCount
        },
        userId
      }
    )
  }
}

// Global timeline event manager instance
export const timelineEventManager = new TimelineEventManager()
export const timelineEventFactory = new TimelineEventFactory(timelineEventManager)