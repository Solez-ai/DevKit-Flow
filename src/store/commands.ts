/**
 * Command factory for app store operations
 */

import type { DevFlowSession, RegexPattern, SessionTemplate, DevFlowNode, NodeConnection } from '@/types'
import {
  CreateSessionCommand,
  DeleteSessionCommand,
  UpdateSessionCommand,
  CreateNodeCommand,
  DeleteNodeCommand,
  UpdateNodeCommand,
  MoveNodeCommand,
  CreateConnectionCommand,
  DeleteConnectionCommand,
  CreatePatternCommand,
  DeletePatternCommand,
  UpdatePatternCommand,
  BatchCommand
} from '@/lib/commands'

/**
 * Command factory for creating app store commands
 */
export class AppStoreCommandFactory {
  constructor(
    private storeActions: {
      addSession: (session: DevFlowSession) => void
      updateSession: (sessionId: string, updates: Partial<DevFlowSession>) => void
      deleteSession: (sessionId: string) => void
      addPattern: (pattern: RegexPattern) => void
      updatePattern: (patternId: string, updates: Partial<RegexPattern>) => void
      deletePattern: (patternId: string) => void
      addTemplate: (template: SessionTemplate) => void
      updateTemplate: (templateId: string, updates: Partial<SessionTemplate>) => void
      deleteTemplate: (templateId: string) => void
    },
    private storeGetters: {
      getSession: (sessionId: string) => DevFlowSession | undefined
      getPattern: (patternId: string) => RegexPattern | undefined
      getTemplate: (templateId: string) => SessionTemplate | undefined
      getNode: (sessionId: string, nodeId: string) => DevFlowNode | undefined
      getConnection: (sessionId: string, connectionId: string) => NodeConnection | undefined
    }
  ) {}

  /**
   * Create session commands
   */
  createSession(session: DevFlowSession) {
    return new CreateSessionCommand(
      session,
      this.storeActions.addSession,
      this.storeActions.deleteSession
    )
  }

  deleteSession(sessionId: string) {
    const session = this.storeGetters.getSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    return new DeleteSessionCommand(
      session,
      this.storeActions.deleteSession,
      this.storeActions.addSession
    )
  }

  updateSession(sessionId: string, updates: Partial<DevFlowSession>) {
    const session = this.storeGetters.getSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Extract the old values for undo
    const oldData: Partial<DevFlowSession> = {}
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof DevFlowSession
      oldData[typedKey] = session[typedKey] as any
    })

    return new UpdateSessionCommand(
      sessionId,
      oldData,
      updates,
      this.storeActions.updateSession
    )
  }

  /**
   * Create node commands
   */
  createNode(sessionId: string, node: DevFlowNode) {
    return new CreateNodeCommand(
      sessionId,
      node,
      (sessionId, node) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            nodes: [...session.nodes, node],
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      },
      (sessionId, nodeId) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            nodes: session.nodes.filter(n => n.id !== nodeId),
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  deleteNode(sessionId: string, nodeId: string) {
    const node = this.storeGetters.getNode(sessionId, nodeId)
    if (!node) {
      throw new Error(`Node ${nodeId} not found in session ${sessionId}`)
    }

    return new DeleteNodeCommand(
      sessionId,
      node,
      (sessionId, nodeId) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            nodes: session.nodes.filter(n => n.id !== nodeId),
            // Also remove connections involving this node
            connections: session.connections.filter(
              c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
            ),
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      },
      (sessionId, node) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            nodes: [...session.nodes, node],
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  updateNode(sessionId: string, nodeId: string, updates: Partial<DevFlowNode>) {
    const node = this.storeGetters.getNode(sessionId, nodeId)
    if (!node) {
      throw new Error(`Node ${nodeId} not found in session ${sessionId}`)
    }

    // Extract old values for undo
    const oldData: Partial<DevFlowNode> = {}
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof DevFlowNode
      oldData[typedKey] = node[typedKey] as any
    })

    return new UpdateNodeCommand(
      sessionId,
      nodeId,
      oldData,
      updates,
      (sessionId, nodeId, updates) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedNodes = session.nodes.map(n => 
            n.id === nodeId 
              ? { ...n, ...updates, metadata: { ...n.metadata, updatedAt: new Date() } }
              : n
          )
          const updatedSession = {
            ...session,
            nodes: updatedNodes,
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  moveNode(sessionId: string, nodeId: string, newPosition: { x: number; y: number }) {
    const node = this.storeGetters.getNode(sessionId, nodeId)
    if (!node) {
      throw new Error(`Node ${nodeId} not found in session ${sessionId}`)
    }

    return new MoveNodeCommand(
      sessionId,
      nodeId,
      node.position,
      newPosition,
      (sessionId, nodeId, updates) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedNodes = session.nodes.map(n => 
            n.id === nodeId 
              ? { ...n, ...updates, metadata: { ...n.metadata, updatedAt: new Date() } }
              : n
          )
          const updatedSession = {
            ...session,
            nodes: updatedNodes,
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  /**
   * Create connection commands
   */
  createConnection(sessionId: string, connection: NodeConnection) {
    return new CreateConnectionCommand(
      sessionId,
      connection,
      (sessionId, connection) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            connections: [...session.connections, connection],
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      },
      (sessionId, connectionId) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            connections: session.connections.filter(c => c.id !== connectionId),
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  deleteConnection(sessionId: string, connectionId: string) {
    const connection = this.storeGetters.getConnection(sessionId, connectionId)
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found in session ${sessionId}`)
    }

    return new DeleteConnectionCommand(
      sessionId,
      connection,
      (sessionId, connectionId) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            connections: session.connections.filter(c => c.id !== connectionId),
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      },
      (sessionId, connection) => {
        const session = this.storeGetters.getSession(sessionId)
        if (session) {
          const updatedSession = {
            ...session,
            connections: [...session.connections, connection],
            metadata: { ...session.metadata, updatedAt: new Date() }
          }
          this.storeActions.updateSession(sessionId, updatedSession)
        }
      }
    )
  }

  /**
   * Create pattern commands
   */
  createPattern(pattern: RegexPattern) {
    return new CreatePatternCommand(
      pattern,
      this.storeActions.addPattern,
      this.storeActions.deletePattern
    )
  }

  deletePattern(patternId: string) {
    const pattern = this.storeGetters.getPattern(patternId)
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`)
    }

    return new DeletePatternCommand(
      pattern,
      this.storeActions.deletePattern,
      this.storeActions.addPattern
    )
  }

  updatePattern(patternId: string, updates: Partial<RegexPattern>) {
    const pattern = this.storeGetters.getPattern(patternId)
    if (!pattern) {
      throw new Error(`Pattern ${patternId} not found`)
    }

    // Extract old values for undo
    const oldData: Partial<RegexPattern> = {}
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof RegexPattern
      oldData[typedKey] = pattern[typedKey] as any
    })

    return new UpdatePatternCommand(
      patternId,
      oldData,
      updates,
      this.storeActions.updatePattern
    )
  }

  /**
   * Create batch commands for complex operations
   */
  createBatch(commands: any[], description?: string) {
    return new BatchCommand(commands, description)
  }

  /**
   * Duplicate session command (batch operation)
   */
  duplicateSession(sessionId: string) {
    const session = this.storeGetters.getSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const duplicatedSession: DevFlowSession = {
      ...session,
      id: `${session.id}-copy-${Date.now()}`,
      name: `${session.name} (Copy)`,
      metadata: {
        ...session.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return this.createSession(duplicatedSession)
  }

  /**
   * Delete multiple nodes command (batch operation)
   */
  deleteMultipleNodes(sessionId: string, nodeIds: string[]) {
    const commands = nodeIds.map(nodeId => this.deleteNode(sessionId, nodeId))
    return this.createBatch(commands as any[], `Delete ${nodeIds.length} nodes`)
  }

  /**
   * Move multiple nodes command (batch operation)
   */
  moveMultipleNodes(sessionId: string, moves: Array<{ nodeId: string; newPosition: { x: number; y: number } }>) {
    const commands = moves.map(({ nodeId, newPosition }) => 
      this.moveNode(sessionId, nodeId, newPosition)
    )
    return this.createBatch(commands as any[], `Move ${moves.length} nodes`)
  }
}