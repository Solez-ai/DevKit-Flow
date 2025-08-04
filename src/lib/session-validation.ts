/**
 * Session validation utilities and schemas
 */

import type { 
  DevFlowSession, 
  SessionSettings, 
  SessionMetadata,
  NodeConnection,
  TimelineEvent,
  ValidationResult
} from '@/types'

export interface SessionValidationOptions {
  validateNodes?: boolean
  validateConnections?: boolean
  validateTimeline?: boolean
  strictMode?: boolean
}

/**
 * Validate session settings
 */
export function validateSessionSettings(settings: SessionSettings): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  if (typeof settings.gridSize !== 'number' || settings.gridSize <= 0) {
    errors.push({
      field: 'gridSize',
      message: 'Grid size must be a positive number',
      code: 'INVALID_VALUE'
    })
  }

  if (typeof settings.snapToGrid !== 'boolean') {
    errors.push({
      field: 'snapToGrid',
      message: 'snapToGrid must be a boolean',
      code: 'INVALID_TYPE'
    })
  }

  if (typeof settings.autoLayout !== 'boolean') {
    errors.push({
      field: 'autoLayout',
      message: 'autoLayout must be a boolean',
      code: 'INVALID_TYPE'
    })
  }

  const validThemes = ['light', 'dark', 'system']
  if (!validThemes.includes(settings.theme)) {
    errors.push({
      field: 'theme',
      message: `Invalid theme: ${settings.theme}`,
      code: 'INVALID_VALUE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate session metadata
 */
export function validateSessionMetadata(metadata: SessionMetadata): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  if (!metadata.createdAt || !(metadata.createdAt instanceof Date)) {
    errors.push({
      field: 'createdAt',
      message: 'createdAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }

  if (!metadata.updatedAt || !(metadata.updatedAt instanceof Date)) {
    errors.push({
      field: 'updatedAt',
      message: 'updatedAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }

  if (metadata.createdAt && metadata.updatedAt && metadata.updatedAt < metadata.createdAt) {
    warnings.push({
      field: 'updatedAt',
      message: 'updatedAt should not be before createdAt',
      code: 'INVALID_DATE_ORDER'
    })
  }

  if (!metadata.version || typeof metadata.version !== 'string') {
    errors.push({
      field: 'version',
      message: 'version must be a non-empty string',
      code: 'REQUIRED_FIELD'
    })
  }

  if (!Array.isArray(metadata.tags)) {
    errors.push({
      field: 'tags',
      message: 'tags must be an array',
      code: 'INVALID_TYPE'
    })
  } else {
    metadata.tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || tag.trim() === '') {
        errors.push({
          field: `tags[${index}]`,
          message: 'tag must be a non-empty string',
          code: 'INVALID_VALUE'
        })
      }
    })
  }

  if (metadata.author !== undefined && (typeof metadata.author !== 'string' || metadata.author.trim() === '')) {
    errors.push({
      field: 'author',
      message: 'author must be a non-empty string if provided',
      code: 'INVALID_VALUE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate timeline event
 */
export function validateTimelineEvent(event: TimelineEvent): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  if (!event.id || typeof event.id !== 'string' || event.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Timeline event ID is required',
      code: 'REQUIRED_FIELD'
    })
  }

  if (!event.timestamp || !(event.timestamp instanceof Date)) {
    errors.push({
      field: 'timestamp',
      message: 'Timeline event timestamp must be a valid Date',
      code: 'INVALID_DATE'
    })
  }

  const validTypes = [
    'session_created',
    'session_updated',
    'node_created',
    'node_updated',
    'node_deleted',
    'node_completed',
    'node_status_changed',
    'todo_added',
    'todo_updated',
    'todo_completed',
    'todo_deleted',
    'code_snippet_added',
    'code_snippet_updated',
    'code_snippet_deleted',
    'reference_added',
    'reference_updated',
    'reference_deleted',
    'comment_added',
    'comment_updated',
    'comment_deleted',
    'connection_added',
    'connection_updated',
    'connection_deleted',
    'template_applied',
    'export_created',
    'import_completed'
  ]
  if (!validTypes.includes(event.type)) {
    errors.push({
      field: 'type',
      message: `Invalid timeline event type: ${event.type}`,
      code: 'INVALID_TYPE'
    })
  }

  if (!event.description || typeof event.description !== 'string' || event.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Timeline event description is required',
      code: 'REQUIRED_FIELD'
    })
  }

  if (event.nodeId !== undefined && (typeof event.nodeId !== 'string' || event.nodeId.trim() === '')) {
    errors.push({
      field: 'nodeId',
      message: 'nodeId must be a non-empty string if provided',
      code: 'INVALID_VALUE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate connection integrity within a session
 */
export function validateConnectionIntegrity(
  connections: NodeConnection[],
  nodeIds: Set<string>
): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  // Check for duplicate connections
  const connectionKeys = new Set<string>()
  const duplicateConnections: string[] = []

  connections.forEach((connection, index) => {
    const key = `${connection.sourceNodeId}-${connection.targetNodeId}-${connection.type}`
    if (connectionKeys.has(key)) {
      duplicateConnections.push(connection.id)
      warnings.push({
        field: `connections[${index}]`,
        message: `Duplicate connection: ${connection.sourceNodeId} -> ${connection.targetNodeId}`,
        code: 'DUPLICATE_CONNECTION'
      })
    } else {
      connectionKeys.add(key)
    }
  })

  // Check for orphaned connections
  connections.forEach((connection, index) => {
    if (!nodeIds.has(connection.sourceNodeId)) {
      errors.push({
        field: `connections[${index}].sourceNodeId`,
        message: `Source node ${connection.sourceNodeId} does not exist`,
        code: 'ORPHANED_CONNECTION'
      })
    }

    if (!nodeIds.has(connection.targetNodeId)) {
      errors.push({
        field: `connections[${index}].targetNodeId`,
        message: `Target node ${connection.targetNodeId} does not exist`,
        code: 'ORPHANED_CONNECTION'
      })
    }
  })

  // Check for circular dependencies
  const circularDependencies = findCircularDependencies(connections)
  if (circularDependencies.length > 0) {
    warnings.push({
      field: 'connections',
      message: `Found ${circularDependencies.length} circular dependencies`,
      code: 'CIRCULAR_DEPENDENCY'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Find circular dependencies in connections
 */
function findCircularDependencies(connections: NodeConnection[]): string[][] {
  const dependencyConnections = connections.filter(c => c.type === 'dependency')
  const graph = new Map<string, string[]>()

  // Build adjacency list
  dependencyConnections.forEach(connection => {
    if (!graph.has(connection.sourceNodeId)) {
      graph.set(connection.sourceNodeId, [])
    }
    graph.get(connection.sourceNodeId)!.push(connection.targetNodeId)
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, path: string[]): void {
    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path])
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart))
        }
      }
    }

    recursionStack.delete(node)
  }

  // Check all nodes for cycles
  for (const [node] of graph) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

/**
 * Validate session completeness
 */
export function validateSessionCompleteness(session: DevFlowSession): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []

  // Check if session has nodes
  if (session.nodes.length === 0) {
    warnings.push({
      field: 'nodes',
      message: 'Session has no nodes',
      code: 'EMPTY_SESSION'
    })
  }

  // Check for isolated nodes (no connections)
  if (session.nodes.length > 1 && session.connections.length === 0) {
    warnings.push({
      field: 'connections',
      message: 'Session has multiple nodes but no connections',
      code: 'ISOLATED_NODES'
    })
  }

  // Check for nodes without content
  const emptyNodes = session.nodes.filter(node => {
    const content = node.content
    return (
      content.todos.length === 0 &&
      content.codeSnippets.length === 0 &&
      content.references.length === 0 &&
      content.comments.length === 0
    )
  })

  if (emptyNodes.length > 0) {
    warnings.push({
      field: 'nodes',
      message: `${emptyNodes.length} nodes have no content`,
      code: 'EMPTY_NODES'
    })
  }

  // Check for incomplete tasks
  const incompleteTasks = session.nodes.filter(node => 
    node.type === 'task' && 
    node.status !== 'completed' &&
    node.content.todos.some(todo => !todo.completed)
  )

  if (incompleteTasks.length > 0) {
    warnings.push({
      field: 'nodes',
      message: `${incompleteTasks.length} task nodes have incomplete todos`,
      code: 'INCOMPLETE_TASKS'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Sanitize session data
 */
export function sanitizeSession(session: DevFlowSession): DevFlowSession {
  return {
    ...session,
    name: session.name.trim(),
    description: session.description?.trim(),
    metadata: {
      ...session.metadata,
      tags: session.metadata.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      author: session.metadata.author?.trim()
    },
    timeline: session.timeline.map(event => ({
      ...event,
      description: event.description.trim()
    }))
  }
}

/**
 * Generate session validation report
 */
export function generateSessionValidationReport(
  session: DevFlowSession,
  options: SessionValidationOptions = {}
): {
  summary: {
    isValid: boolean
    errorCount: number
    warningCount: number
    nodeErrorCount: number
    connectionErrorCount: number
  }
  details: {
    sessionErrors: ValidationResult
    settingsErrors: ValidationResult
    metadataErrors: ValidationResult
    timelineErrors: ValidationResult[]
    connectionIntegrityErrors: ValidationResult
    completenessErrors: ValidationResult
  }
} {
  const {
    validateNodes: _validateNodes = true,
    validateConnections = true,
    validateTimeline = true,
    strictMode = false
  } = options

  // Validate session structure
  const sessionErrors: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  if (!session.id || session.id.trim() === '') {
    sessionErrors.errors.push({
      field: 'id',
      message: 'Session ID is required',
      code: 'REQUIRED_FIELD'
    })
  }

  if (!session.name || session.name.trim() === '') {
    sessionErrors.errors.push({
      field: 'name',
      message: 'Session name is required',
      code: 'REQUIRED_FIELD'
    })
  }

  sessionErrors.isValid = sessionErrors.errors.length === 0

  // Validate settings
  const settingsErrors = validateSessionSettings(session.settings)

  // Validate metadata
  const metadataErrors = validateSessionMetadata(session.metadata)

  // Validate timeline
  const timelineErrors: ValidationResult[] = []
  if (validateTimeline) {
    session.timeline.forEach(event => {
      timelineErrors.push(validateTimelineEvent(event))
    })
  }

  // Validate connection integrity
  let connectionIntegrityErrors: ValidationResult = { isValid: true, errors: [], warnings: [] }
  if (validateConnections) {
    const nodeIds = new Set(session.nodes.map(n => n.id))
    connectionIntegrityErrors = validateConnectionIntegrity(session.connections, nodeIds)
  }

  // Validate completeness
  const completenessErrors = validateSessionCompleteness(session)

  // Calculate summary
  const allErrors = [
    ...sessionErrors.errors,
    ...settingsErrors.errors,
    ...metadataErrors.errors,
    ...timelineErrors.flatMap(te => te.errors),
    ...connectionIntegrityErrors.errors,
    ...(strictMode ? completenessErrors.errors : [])
  ]

  const allWarnings = [
    ...(sessionErrors.warnings || []),
    ...(settingsErrors.warnings || []),
    ...(metadataErrors.warnings || []),
    ...timelineErrors.flatMap(te => te.warnings || []),
    ...(connectionIntegrityErrors.warnings || []),
    ...(completenessErrors.warnings || [])
  ]

  return {
    summary: {
      isValid: allErrors.length === 0,
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
      nodeErrorCount: 0, // Will be filled by node validation
      connectionErrorCount: connectionIntegrityErrors.errors.length
    },
    details: {
      sessionErrors,
      settingsErrors,
      metadataErrors,
      timelineErrors,
      connectionIntegrityErrors,
      completenessErrors
    }
  }
}