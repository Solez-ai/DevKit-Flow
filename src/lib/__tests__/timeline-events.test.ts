import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TimelineEventManager, TimelineEventFactory } from '../timeline-events'
import type { DevFlowNode, NodeConnection, TodoItem, CodeSnippet, Reference, Comment } from '@/types'

// Mock the utils module
vi.mock('../utils', () => ({
  generateId: vi.fn((prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
}))

describe('TimelineEventManager', () => {
  let manager: TimelineEventManager

  beforeEach(() => {
    manager = new TimelineEventManager()
  })

  it('should create and store events', () => {
    const event = manager.createEvent(
      'session_created',
      'session-1',
      'Test session created'
    )

    expect(event).toMatchObject({
      type: 'session_created',
      category: 'session',
      sessionId: 'session-1',
      description: 'Test session created'
    })

    const events = manager.getSessionEvents('session-1')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual(event)
  })

  it('should filter events by category', () => {
    manager.createEvent('session_created', 'session-1', 'Session created')
    manager.createEvent('node_created', 'session-1', 'Node created')
    manager.createEvent('todo_added', 'session-1', 'Todo added')

    const sessionEvents = manager.getSessionEvents('session-1', { category: 'session' })
    expect(sessionEvents).toHaveLength(1)
    expect(sessionEvents[0].type).toBe('session_created')

    const contentEvents = manager.getSessionEvents('session-1', { category: 'content' })
    expect(contentEvents).toHaveLength(1)
    expect(contentEvents[0].type).toBe('todo_added')
  })

  it('should filter events by type', () => {
    manager.createEvent('node_created', 'session-1', 'Node 1 created')
    manager.createEvent('node_created', 'session-1', 'Node 2 created')
    manager.createEvent('node_updated', 'session-1', 'Node updated')

    const createdEvents = manager.getSessionEvents('session-1', { type: 'node_created' })
    expect(createdEvents).toHaveLength(2)

    const updatedEvents = manager.getSessionEvents('session-1', { type: 'node_updated' })
    expect(updatedEvents).toHaveLength(1)
  })

  it('should filter events by date range', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    manager.createEvent('session_created', 'session-1', 'Session created')
    
    const todayEvents = manager.getSessionEvents('session-1', { 
      startDate: yesterday,
      endDate: tomorrow
    })
    expect(todayEvents).toHaveLength(1)

    const futureEvents = manager.getSessionEvents('session-1', { 
      startDate: tomorrow
    })
    expect(futureEvents).toHaveLength(0)
  })

  it('should limit and paginate events', () => {
    // Create 10 events
    for (let i = 0; i < 10; i++) {
      manager.createEvent('node_created', 'session-1', `Node ${i} created`)
    }

    const limitedEvents = manager.getSessionEvents('session-1', { limit: 5 })
    expect(limitedEvents).toHaveLength(5)

    const paginatedEvents = manager.getSessionEvents('session-1', { offset: 5, limit: 3 })
    expect(paginatedEvents).toHaveLength(3)
  })

  it('should calculate event statistics', () => {
    manager.createEvent('session_created', 'session-1', 'Session created')
    manager.createEvent('node_created', 'session-1', 'Node created')
    manager.createEvent('todo_added', 'session-1', 'Todo added')
    manager.createEvent('connection_added', 'session-1', 'Connection added')

    const stats = manager.getEventStats('session-1')

    expect(stats.totalEvents).toBe(4)
    expect(stats.eventsByCategory.session).toBe(1)
    expect(stats.eventsByCategory.node).toBe(1)
    expect(stats.eventsByCategory.content).toBe(1)
    expect(stats.eventsByCategory.connection).toBe(1)
    expect(stats.eventsByType.session_created).toBe(1)
    expect(stats.eventsByType.node_created).toBe(1)
    expect(stats.eventsByType.todo_added).toBe(1)
    expect(stats.eventsByType.connection_added).toBe(1)
  })

  it('should notify subscribers of new events', () => {
    const listener = vi.fn()
    const unsubscribe = manager.subscribe(listener)

    const event = manager.createEvent('session_created', 'session-1', 'Session created')

    expect(listener).toHaveBeenCalledWith(event)

    unsubscribe()
    manager.createEvent('node_created', 'session-1', 'Node created')

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should clear session events', () => {
    manager.createEvent('session_created', 'session-1', 'Session created')
    manager.createEvent('node_created', 'session-1', 'Node created')

    expect(manager.getSessionEvents('session-1')).toHaveLength(2)

    manager.clearSessionEvents('session-1')

    expect(manager.getSessionEvents('session-1')).toHaveLength(0)
  })
})

describe('TimelineEventFactory', () => {
  let manager: TimelineEventManager
  let factory: TimelineEventFactory

  beforeEach(() => {
    manager = new TimelineEventManager()
    factory = new TimelineEventFactory(manager)
  })

  it('should create session events', () => {
    const event = factory.sessionCreated('session-1', 'Test Session')

    expect(event.type).toBe('session_created')
    expect(event.category).toBe('session')
    expect(event.description).toBe('Session "Test Session" created')
    expect(event.metadata?.sessionName).toBe('Test Session')
  })

  it('should create node events', () => {
    const node: DevFlowNode = {
      id: 'node-1',
      type: 'task',
      title: 'Test Task',
      description: 'A test task',
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
      status: 'idle',
      content: {
        todos: [],
        codeSnippets: [],
        references: [],
        comments: []
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 3,
        tags: []
      }
    }

    const event = factory.nodeCreated('session-1', node)

    expect(event.type).toBe('node_created')
    expect(event.category).toBe('node')
    expect(event.nodeId).toBe('node-1')
    expect(event.description).toBe('task node "Test Task" created')
    expect(event.metadata?.nodeType).toBe('task')
    expect(event.metadata?.nodeTitle).toBe('Test Task')
  })

  it('should create todo events', () => {
    const todo: TodoItem = {
      id: 'todo-1',
      text: 'Complete the task',
      completed: false,
      estimatedMinutes: 30
    }

    const event = factory.todoAdded('session-1', 'node-1', todo)

    expect(event.type).toBe('todo_added')
    expect(event.category).toBe('content')
    expect(event.nodeId).toBe('node-1')
    expect(event.description).toBe('Todo "Complete the task" added')
    expect(event.metadata?.todoId).toBe('todo-1')
    expect(event.metadata?.estimatedMinutes).toBe(30)
  })

  it('should create code snippet events', () => {
    const snippet: CodeSnippet = {
      id: 'snippet-1',
      title: 'Test Function',
      language: 'javascript',
      code: 'function test() { return true; }',
      isTemplate: false,
      tags: ['test']
    }

    const event = factory.codeSnippetAdded('session-1', 'node-1', snippet)

    expect(event.type).toBe('code_snippet_added')
    expect(event.category).toBe('content')
    expect(event.nodeId).toBe('node-1')
    expect(event.description).toBe('Code snippet "Test Function" added')
    expect(event.metadata?.language).toBe('javascript')
    expect(event.metadata?.isTemplate).toBe(false)
  })

  it('should create reference events', () => {
    const reference: Reference = {
      id: 'ref-1',
      title: 'API Documentation',
      url: 'https://api.example.com/docs',
      type: 'documentation',
      importance: 'high'
    }

    const event = factory.referenceAdded('session-1', 'node-1', reference)

    expect(event.type).toBe('reference_added')
    expect(event.category).toBe('content')
    expect(event.nodeId).toBe('node-1')
    expect(event.description).toBe('Reference "API Documentation" added')
    expect(event.metadata?.referenceType).toBe('documentation')
    expect(event.metadata?.importance).toBe('high')
  })

  it('should create comment events', () => {
    const comment: Comment = {
      id: 'comment-1',
      text: 'This is a test comment',
      author: 'Test User',
      createdAt: new Date()
    }

    const event = factory.commentAdded('session-1', 'node-1', comment)

    expect(event.type).toBe('comment_added')
    expect(event.category).toBe('content')
    expect(event.nodeId).toBe('node-1')
    expect(event.description).toBe('Comment added: "This is a test comment"')
    expect(event.metadata?.author).toBe('Test User')
  })

  it('should create connection events', () => {
    const connection: NodeConnection = {
      id: 'conn-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      type: 'dependency',
      label: 'depends on',
      style: {
        strokeColor: '#000',
        strokeWidth: 2
      }
    }

    const event = factory.connectionAdded('session-1', connection, 'Source Node', 'Target Node')

    expect(event.type).toBe('connection_added')
    expect(event.category).toBe('connection')
    expect(event.description).toBe('dependency connection added from "Source Node" to "Target Node"')
    expect(event.metadata?.connectionType).toBe('dependency')
    expect(event.metadata?.sourceNodeTitle).toBe('Source Node')
    expect(event.metadata?.targetNodeTitle).toBe('Target Node')
  })

  it('should create template events', () => {
    const event = factory.templateApplied('session-1', 'API Integration Template', 5)

    expect(event.type).toBe('template_applied')
    expect(event.category).toBe('template')
    expect(event.description).toBe('Template "API Integration Template" applied, created 5 nodes')
    expect(event.metadata?.templateName).toBe('API Integration Template')
    expect(event.metadata?.nodesCreated).toBe(5)
  })

  it('should create data events', () => {
    const exportEvent = factory.exportCreated('session-1', 'JSON', 10)
    expect(exportEvent.type).toBe('export_created')
    expect(exportEvent.category).toBe('data')
    expect(exportEvent.description).toBe('Session exported to JSON format (10 items)')

    const importEvent = factory.importCompleted('session-1', 'JSON', 15)
    expect(importEvent.type).toBe('import_completed')
    expect(importEvent.category).toBe('data')
    expect(importEvent.description).toBe('Data imported from JSON format (15 items)')
  })

  it('should track event duration', () => {
    const event = factory.todoCompleted('session-1', 'node-1', {
      id: 'todo-1',
      text: 'Test todo',
      completed: true,
      estimatedMinutes: 30,
      actualMinutes: 25
    }, 25 * 60 * 1000) // 25 minutes in milliseconds

    expect(event.duration).toBe(25 * 60 * 1000)
    expect(event.metadata?.actualMinutes).toBe(25)
  })
})