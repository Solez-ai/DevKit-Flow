/**
 * Session management core with CRUD operations, validation, and history
 */

import { persistenceManager } from './persistence'
import { validateNode } from './node-validation'
import { generateId } from './utils'
import { timelineEventFactory } from './timeline-events'
import type { 
  DevFlowSession, 
  DevFlowNode, 
  NodeConnection, 
  SessionSettings, 
  ValidationResult
} from '@/types'

export interface SessionValidationResult extends ValidationResult {
  nodeErrors: Record<string, ValidationResult>
  connectionErrors: Record<string, ValidationResult>
}

export interface SessionHistory {
  id: string
  sessionId: string
  timestamp: Date
  action: 'created' | 'updated' | 'deleted' | 'restored'
  snapshot?: DevFlowSession
  changes?: Partial<DevFlowSession>
  metadata: {
    version: string
    author?: string
    description?: string
  }
}

export interface SessionStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  totalNodes: number
  totalConnections: number
  averageNodesPerSession: number
  lastActivity: Date | null
}

class SessionManager {
  private initialized = false
  private sessionHistory = new Map<string, SessionHistory[]>()
  private maxHistoryEntries = 50

  /**
   * Initialize the session manager
   */
  async init(): Promise<void> {
    if (this.initialized) return

    await persistenceManager.init()
    await this.loadSessionHistory()
    
    this.initialized = true
  }

  /**
   * Initialize the session manager (alias for init)
   */
  async initialize(): Promise<void> {
    return this.init()
  }

  /**
   * Create a new session
   */
  async createSession(
    name: string,
    description?: string,
    settings?: Partial<SessionSettings>
  ): Promise<DevFlowSession> {
    await this.ensureInitialized()

    const now = new Date()
    const session: DevFlowSession = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      nodes: [],
      connections: [],
      settings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system',
        ...settings
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        tags: []
      },
      timeline: []
    }

    // Validate the session
    const validation = await this.validateSession(session)
    if (!validation.isValid) {
      throw new Error(`Invalid session data: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Save the session
    await persistenceManager.saveSession(session)

    // Add to history
    await this.addToHistory(session.id, 'created', session)

    // Track timeline event
    timelineEventFactory.sessionCreated(session.id, session.name)

    return session
  }

  /**
   * Load a session by ID
   */
  async loadSession(sessionId: string): Promise<DevFlowSession | null> {
    await this.ensureInitialized()

    const session = await persistenceManager.loadSession(sessionId)
    
    if (session) {
      // Validate loaded session
      const validation = await this.validateSession(session)
      if (!validation.isValid) {
        console.warn(`Loaded session ${sessionId} has validation errors:`, validation.errors)
        // Attempt to fix common issues
        const fixedSession = await this.repairSession(session)
        if (fixedSession) {
          await this.updateSession(sessionId, fixedSession)
          return fixedSession
        }
      }
    }

    return session
  }

  /**
   * Load all sessions
   */
  async loadAllSessions(): Promise<DevFlowSession[]> {
    await this.ensureInitialized()

    const sessions = await persistenceManager.loadAllSessions()
    
    // Validate and repair sessions if needed
    const validSessions: DevFlowSession[] = []
    
    for (const session of sessions) {
      const validation = await this.validateSession(session)
      if (validation.isValid) {
        validSessions.push(session)
      } else {
        console.warn(`Session ${session.id} has validation errors:`, validation.errors)
        const fixedSession = await this.repairSession(session)
        if (fixedSession) {
          validSessions.push(fixedSession)
          await this.updateSession(session.id, fixedSession)
        }
      }
    }

    return validSessions
  }

  /**
   * Update a session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<DevFlowSession>
  ): Promise<DevFlowSession | null> {
    await this.ensureInitialized()

    const existingSession = await persistenceManager.loadSession(sessionId)
    if (!existingSession) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const updatedSession: DevFlowSession = {
      ...existingSession,
      ...updates,
      id: sessionId, // Ensure ID cannot be changed
      metadata: {
        ...existingSession.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }

    // Validate the updated session
    const validation = await this.validateSession(updatedSession)
    if (!validation.isValid) {
      throw new Error(`Invalid session update: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Save the updated session
    await persistenceManager.saveSession(updatedSession)

    // Add to history
    await this.addToHistory(sessionId, 'updated', undefined, updates)

    // Track timeline event
    const changes = Object.keys(updates).filter(key => key !== 'metadata')
    if (changes.length > 0) {
      timelineEventFactory.sessionUpdated(sessionId, changes)
    }

    return updatedSession
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.ensureInitialized()

    const session = await persistenceManager.loadSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Add to history before deletion
    await this.addToHistory(sessionId, 'deleted', session)

    // Delete the session
    await persistenceManager.deleteSession(sessionId)
  }

  /**
   * Duplicate a session
   */
  async duplicateSession(
    sessionId: string,
    newName?: string
  ): Promise<DevFlowSession> {
    await this.ensureInitialized()

    const originalSession = await persistenceManager.loadSession(sessionId)
    if (!originalSession) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const now = new Date()
    const duplicatedSession: DevFlowSession = {
      ...originalSession,
      id: generateId(),
      name: newName || `${originalSession.name} (Copy)`,
      metadata: {
        ...originalSession.metadata,
        createdAt: now,
        updatedAt: now
      },
      timeline: []
    }

    // Generate new IDs for nodes and connections
    const nodeIdMap = new Map<string, string>()
    
    duplicatedSession.nodes = originalSession.nodes.map(node => {
      const newNodeId = generateId()
      nodeIdMap.set(node.id, newNodeId)
      
      return {
        ...node,
        id: newNodeId,
        metadata: {
          ...node.metadata,
          createdAt: now,
          updatedAt: now
        }
      }
    })

    duplicatedSession.connections = originalSession.connections.map(connection => ({
      ...connection,
      id: generateId(),
      sourceNodeId: nodeIdMap.get(connection.sourceNodeId) || connection.sourceNodeId,
      targetNodeId: nodeIdMap.get(connection.targetNodeId) || connection.targetNodeId
    }))

    // Save the duplicated session
    await persistenceManager.saveSession(duplicatedSession)

    // Add to history
    await this.addToHistory(duplicatedSession.id, 'created', duplicatedSession)

    // Track timeline event
    timelineEventFactory.sessionCreated(duplicatedSession.id, duplicatedSession.name)

    return duplicatedSession
  }

  /**
   * Validate a session
   */
  async validateSession(session: DevFlowSession): Promise<SessionValidationResult> {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []
    const nodeErrors: Record<string, ValidationResult> = {}
    const connectionErrors: Record<string, ValidationResult> = {}

    // Validate basic session structure
    if (!session.id || session.id.trim() === '') {
      errors.push({
        field: 'id',
        message: 'Session ID is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!session.name || session.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Session name is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!session.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Session metadata is required',
        code: 'REQUIRED_FIELD'
      })
    } else {
      if (!session.metadata.createdAt || !(session.metadata.createdAt instanceof Date)) {
        errors.push({
          field: 'metadata.createdAt',
          message: 'Session createdAt must be a valid Date',
          code: 'INVALID_DATE'
        })
      }

      if (!session.metadata.updatedAt || !(session.metadata.updatedAt instanceof Date)) {
        errors.push({
          field: 'metadata.updatedAt',
          message: 'Session updatedAt must be a valid Date',
          code: 'INVALID_DATE'
        })
      }
    }

    // Validate nodes
    if (session.nodes) {
      for (const node of session.nodes) {
        const nodeValidation = validateNode(node)
        if (!nodeValidation.isValid) {
          nodeErrors[node.id] = nodeValidation
        }
      }
    }

    // Validate connections
    if (session.connections) {
      for (const connection of session.connections) {
        const connectionValidation = this.validateConnection(connection, session.nodes)
        if (!connectionValidation.isValid) {
          connectionErrors[connection.id] = connectionValidation
        }
      }
    }

    // Check for orphaned connections
    const nodeIds = new Set(session.nodes.map(n => n.id))
    const orphanedConnections = session.connections.filter(
      c => !nodeIds.has(c.sourceNodeId) || !nodeIds.has(c.targetNodeId)
    )

    if (orphanedConnections.length > 0) {
      warnings.push({
        field: 'connections',
        message: `Found ${orphanedConnections.length} orphaned connections`,
        code: 'ORPHANED_CONNECTIONS'
      })
    }

    return {
      isValid: errors.length === 0 && Object.keys(nodeErrors).length === 0 && Object.keys(connectionErrors).length === 0,
      errors,
      warnings,
      nodeErrors,
      connectionErrors
    }
  }

  /**
   * Validate a connection
   */
  private validateConnection(connection: NodeConnection, nodes: DevFlowNode[]): ValidationResult {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []

    if (!connection.id) {
      errors.push({
        field: 'id',
        message: 'Connection ID is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!connection.sourceNodeId) {
      errors.push({
        field: 'sourceNodeId',
        message: 'Source node ID is required',
        code: 'REQUIRED_FIELD'
      })
    }

    if (!connection.targetNodeId) {
      errors.push({
        field: 'targetNodeId',
        message: 'Target node ID is required',
        code: 'REQUIRED_FIELD'
      })
    }

    const validTypes = ['dependency', 'sequence', 'reference', 'blocks']
    if (!validTypes.includes(connection.type)) {
      errors.push({
        field: 'type',
        message: `Invalid connection type: ${connection.type}`,
        code: 'INVALID_TYPE'
      })
    }

    // Check if referenced nodes exist
    const nodeIds = new Set(nodes.map(n => n.id))
    if (!nodeIds.has(connection.sourceNodeId)) {
      errors.push({
        field: 'sourceNodeId',
        message: `Source node ${connection.sourceNodeId} does not exist`,
        code: 'MISSING_NODE'
      })
    }

    if (!nodeIds.has(connection.targetNodeId)) {
      errors.push({
        field: 'targetNodeId',
        message: `Target node ${connection.targetNodeId} does not exist`,
        code: 'MISSING_NODE'
      })
    }

    // Check for self-connections
    if (connection.sourceNodeId === connection.targetNodeId) {
      warnings.push({
        field: 'connection',
        message: 'Node cannot connect to itself',
        code: 'SELF_CONNECTION'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Repair a session with validation errors
   */
  private async repairSession(session: DevFlowSession): Promise<DevFlowSession | null> {
    try {
      const repairedSession = { ...session }

      // Fix missing metadata
      if (!repairedSession.metadata) {
        repairedSession.metadata = {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
          tags: []
        }
      }

      // Fix invalid dates
      if (!(repairedSession.metadata.createdAt instanceof Date)) {
        repairedSession.metadata.createdAt = new Date()
      }

      if (!(repairedSession.metadata.updatedAt instanceof Date)) {
        repairedSession.metadata.updatedAt = new Date()
      }

      // Remove orphaned connections
      const nodeIds = new Set(repairedSession.nodes.map(n => n.id))
      repairedSession.connections = repairedSession.connections.filter(
        c => nodeIds.has(c.sourceNodeId) && nodeIds.has(c.targetNodeId)
      )

      // Initialize missing arrays
      if (!repairedSession.nodes) repairedSession.nodes = []
      if (!repairedSession.connections) repairedSession.connections = []
      if (!repairedSession.timeline) repairedSession.timeline = []

      // Validate the repaired session
      const validation = await this.validateSession(repairedSession)
      if (validation.isValid) {
        return repairedSession
      }

      return null
    } catch (error) {
      console.error('Failed to repair session:', error)
      return null
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionStats> {
    await this.ensureInitialized()

    const sessions = await persistenceManager.loadAllSessions()
    
    const totalSessions = sessions.length
    const activeSessions = sessions.filter(s => 
      s.nodes.some(n => n.status === 'active')
    ).length
    const completedSessions = sessions.filter(s => 
      s.nodes.length > 0 && s.nodes.every(n => n.status === 'completed')
    ).length
    
    const totalNodes = sessions.reduce((sum, s) => sum + s.nodes.length, 0)
    const totalConnections = sessions.reduce((sum, s) => sum + s.connections.length, 0)
    const averageNodesPerSession = totalSessions > 0 ? totalNodes / totalSessions : 0
    
    const lastActivity = sessions.reduce((latest, session) => {
      const sessionLatest = session.metadata.updatedAt
      return !latest || sessionLatest > latest ? sessionLatest : latest
    }, null as Date | null)

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalNodes,
      totalConnections,
      averageNodesPerSession,
      lastActivity
    }
  }

  /**
   * Add entry to session history
   */
  private async addToHistory(
    sessionId: string,
    action: SessionHistory['action'],
    snapshot?: DevFlowSession,
    changes?: Partial<DevFlowSession>
  ): Promise<void> {
    const historyEntry: SessionHistory = {
      id: generateId(),
      sessionId,
      timestamp: new Date(),
      action,
      snapshot,
      changes,
      metadata: {
        version: '1.0.0'
      }
    }

    let history = this.sessionHistory.get(sessionId) || []
    history.push(historyEntry)

    // Limit history entries
    if (history.length > this.maxHistoryEntries) {
      history = history.slice(-this.maxHistoryEntries)
    }

    this.sessionHistory.set(sessionId, history)

    // Persist history
    await this.saveSessionHistory()
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string): SessionHistory[] {
    return this.sessionHistory.get(sessionId) || []
  }

  /**
   * Restore session from history
   */
  async restoreSessionFromHistory(
    sessionId: string,
    historyId: string
  ): Promise<DevFlowSession | null> {
    await this.ensureInitialized()

    const history = this.sessionHistory.get(sessionId)
    if (!history) {
      throw new Error(`No history found for session ${sessionId}`)
    }

    const historyEntry = history.find(h => h.id === historyId)
    if (!historyEntry || !historyEntry.snapshot) {
      throw new Error(`History entry ${historyId} not found or has no snapshot`)
    }

    const restoredSession = {
      ...historyEntry.snapshot,
      metadata: {
        ...historyEntry.snapshot.metadata,
        updatedAt: new Date()
      }
    }

    // Save the restored session
    await persistenceManager.saveSession(restoredSession)

    // Add to history
    await this.addToHistory(sessionId, 'restored', restoredSession)

    return restoredSession
  }

  /**
   * Load session history from storage
   */
  private async loadSessionHistory(): Promise<void> {
    try {
      const historyData = await persistenceManager.loadPreferences()
      if (historyData && (historyData as any).sessionHistory) {
        const historyEntries = (historyData as any).sessionHistory
        for (const [sessionId, history] of Object.entries(historyEntries)) {
          this.sessionHistory.set(sessionId, history as SessionHistory[])
        }
      }
    } catch (error) {
      console.warn('Failed to load session history:', error)
    }
  }

  /**
   * Save session history to storage
   */
  private async saveSessionHistory(): Promise<void> {
    try {
      const historyData = Object.fromEntries(this.sessionHistory.entries())
      const preferences = await persistenceManager.loadPreferences() || {} as any
      preferences.sessionHistory = historyData
      await persistenceManager.savePreferences(preferences)
    } catch (error) {
      console.error('Failed to save session history:', error)
    }
  }

  /**
   * Clear session history
   */
  async clearSessionHistory(sessionId?: string): Promise<void> {
    if (sessionId) {
      this.sessionHistory.delete(sessionId)
    } else {
      this.sessionHistory.clear()
    }
    
    await this.saveSessionHistory()
  }

  /**
   * Ensure manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.sessionHistory.clear()
    this.initialized = false
  }
}

// Singleton instance
export const sessionManager = new SessionManager()