/**
 * Session version management and history tracking
 */

import { generateId } from './utils'
import type { DevFlowSession } from '@/types'

export interface SessionVersion {
  id: string
  sessionId: string
  version: string
  timestamp: Date
  snapshot: DevFlowSession
  changes: SessionChange[]
  metadata: {
    author?: string
    description?: string
    tags: string[]
    isAutoSave: boolean
    parentVersionId?: string
  }
}

export interface SessionChange {
  type: 'node_added' | 'node_removed' | 'node_updated' | 'connection_added' | 'connection_removed' | 'metadata_updated' | 'settings_updated'
  entityId?: string
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: Date
}

export interface VersionDiff {
  nodesAdded: string[]
  nodesRemoved: string[]
  nodesModified: Array<{
    nodeId: string
    changes: Array<{
      field: string
      oldValue: any
      newValue: any
    }>
  }>
  connectionsAdded: string[]
  connectionsRemoved: string[]
  metadataChanges: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
  settingsChanges: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
}

class SessionVersionManager {
  private versions = new Map<string, SessionVersion[]>()
  private maxVersionsPerSession = 100
  // private autoSaveInterval = 30000 // 30 seconds

  /**
   * Create a new version of a session
   */
  createVersion(
    session: DevFlowSession,
    changes: SessionChange[] = [],
    metadata: Partial<SessionVersion['metadata']> = {}
  ): SessionVersion {
    const version: SessionVersion = {
      id: generateId(),
      sessionId: session.id,
      version: this.generateVersionNumber(session.id),
      timestamp: new Date(),
      snapshot: this.deepClone(session),
      changes,
      metadata: {
        tags: [],
        isAutoSave: false,
        ...metadata
      }
    }

    this.addVersion(version)
    return version
  }

  /**
   * Add a version to the history
   */
  private addVersion(version: SessionVersion): void {
    let sessionVersions = this.versions.get(version.sessionId) || []
    sessionVersions.push(version)

    // Limit the number of versions
    if (sessionVersions.length > this.maxVersionsPerSession) {
      sessionVersions = sessionVersions.slice(-this.maxVersionsPerSession)
    }

    this.versions.set(version.sessionId, sessionVersions)
  }

  /**
   * Get all versions for a session
   */
  getVersions(sessionId: string): SessionVersion[] {
    return this.versions.get(sessionId) || []
  }

  /**
   * Get a specific version
   */
  getVersion(sessionId: string, versionId: string): SessionVersion | null {
    const versions = this.versions.get(sessionId) || []
    return versions.find(v => v.id === versionId) || null
  }

  /**
   * Get the latest version
   */
  getLatestVersion(sessionId: string): SessionVersion | null {
    const versions = this.versions.get(sessionId) || []
    return versions.length > 0 ? versions[versions.length - 1] : null
  }

  /**
   * Compare two sessions and generate a diff
   */
  generateDiff(oldSession: DevFlowSession, newSession: DevFlowSession): VersionDiff {
    const diff: VersionDiff = {
      nodesAdded: [],
      nodesRemoved: [],
      nodesModified: [],
      connectionsAdded: [],
      connectionsRemoved: [],
      metadataChanges: [],
      settingsChanges: []
    }

    // Compare nodes
    const oldNodeIds = new Set(oldSession.nodes.map(n => n.id))
    const newNodeIds = new Set(newSession.nodes.map(n => n.id))
    const oldNodesMap = new Map(oldSession.nodes.map(n => [n.id, n]))
    const newNodesMap = new Map(newSession.nodes.map(n => [n.id, n]))

    // Find added nodes
    for (const nodeId of newNodeIds) {
      if (!oldNodeIds.has(nodeId)) {
        diff.nodesAdded.push(nodeId)
      }
    }

    // Find removed nodes
    for (const nodeId of oldNodeIds) {
      if (!newNodeIds.has(nodeId)) {
        diff.nodesRemoved.push(nodeId)
      }
    }

    // Find modified nodes
    for (const nodeId of newNodeIds) {
      if (oldNodeIds.has(nodeId)) {
        const oldNode = oldNodesMap.get(nodeId)!
        const newNode = newNodesMap.get(nodeId)!
        const nodeChanges = this.compareNodes(oldNode, newNode)
        
        if (nodeChanges.length > 0) {
          diff.nodesModified.push({
            nodeId,
            changes: nodeChanges
          })
        }
      }
    }

    // Compare connections
    const oldConnectionIds = new Set(oldSession.connections.map(c => c.id))
    const newConnectionIds = new Set(newSession.connections.map(c => c.id))

    for (const connectionId of newConnectionIds) {
      if (!oldConnectionIds.has(connectionId)) {
        diff.connectionsAdded.push(connectionId)
      }
    }

    for (const connectionId of oldConnectionIds) {
      if (!newConnectionIds.has(connectionId)) {
        diff.connectionsRemoved.push(connectionId)
      }
    }

    // Compare metadata
    diff.metadataChanges = this.compareObjects(oldSession.metadata, newSession.metadata, 'metadata')

    // Compare settings
    diff.settingsChanges = this.compareObjects(oldSession.settings, newSession.settings, 'settings')

    return diff
  }

  /**
   * Generate changes from a diff
   */
  generateChangesFromDiff(diff: VersionDiff): SessionChange[] {
    const changes: SessionChange[] = []
    const timestamp = new Date()

    // Node changes
    diff.nodesAdded.forEach(nodeId => {
      changes.push({
        type: 'node_added',
        entityId: nodeId,
        timestamp
      })
    })

    diff.nodesRemoved.forEach(nodeId => {
      changes.push({
        type: 'node_removed',
        entityId: nodeId,
        timestamp
      })
    })

    diff.nodesModified.forEach(({ nodeId, changes: nodeChanges }) => {
      nodeChanges.forEach(change => {
        changes.push({
          type: 'node_updated',
          entityId: nodeId,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          timestamp
        })
      })
    })

    // Connection changes
    diff.connectionsAdded.forEach(connectionId => {
      changes.push({
        type: 'connection_added',
        entityId: connectionId,
        timestamp
      })
    })

    diff.connectionsRemoved.forEach(connectionId => {
      changes.push({
        type: 'connection_removed',
        entityId: connectionId,
        timestamp
      })
    })

    // Metadata changes
    diff.metadataChanges.forEach(change => {
      changes.push({
        type: 'metadata_updated',
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        timestamp
      })
    })

    // Settings changes
    diff.settingsChanges.forEach(change => {
      changes.push({
        type: 'settings_updated',
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        timestamp
      })
    })

    return changes
  }

  /**
   * Restore a session to a specific version
   */
  restoreToVersion(sessionId: string, versionId: string): DevFlowSession | null {
    const version = this.getVersion(sessionId, versionId)
    if (!version) {
      return null
    }

    return this.deepClone(version.snapshot)
  }

  /**
   * Create a branch from a specific version
   */
  createBranch(
    sessionId: string,
    versionId: string,
    branchName: string
  ): DevFlowSession | null {
    const version = this.getVersion(sessionId, versionId)
    if (!version) {
      return null
    }

    const branchedSession = this.deepClone(version.snapshot)
    branchedSession.id = generateId()
    branchedSession.name = `${branchedSession.name} (${branchName})`
    branchedSession.metadata.updatedAt = new Date()

    return branchedSession
  }

  /**
   * Get version statistics
   */
  getVersionStats(sessionId: string): {
    totalVersions: number
    oldestVersion: Date | null
    newestVersion: Date | null
    totalChanges: number
    changesByType: Record<SessionChange['type'], number>
  } {
    const versions = this.versions.get(sessionId) || []
    
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        totalChanges: 0,
        changesByType: {
          node_added: 0,
          node_removed: 0,
          node_updated: 0,
          connection_added: 0,
          connection_removed: 0,
          metadata_updated: 0,
          settings_updated: 0
        }
      }
    }

    const allChanges = versions.flatMap(v => v.changes)
    const changesByType = allChanges.reduce((acc, change) => {
      acc[change.type] = (acc[change.type] || 0) + 1
      return acc
    }, {} as Record<SessionChange['type'], number>)

    // Ensure all types are present
    const completeChangesByType: Record<SessionChange['type'], number> = {
      ...changesByType,
      node_added: changesByType.node_added || 0,
      node_removed: changesByType.node_removed || 0,
      node_updated: changesByType.node_updated || 0,
      connection_added: changesByType.connection_added || 0,
      connection_removed: changesByType.connection_removed || 0,
      metadata_updated: changesByType.metadata_updated || 0,
      settings_updated: changesByType.settings_updated || 0
    }

    return {
      totalVersions: versions.length,
      oldestVersion: versions[0].timestamp,
      newestVersion: versions[versions.length - 1].timestamp,
      totalChanges: allChanges.length,
      changesByType: completeChangesByType
    }
  }

  /**
   * Clean up old versions
   */
  cleanupVersions(sessionId: string, keepCount: number = 50): void {
    const versions = this.versions.get(sessionId) || []
    
    if (versions.length > keepCount) {
      const keptVersions = versions.slice(-keepCount)
      this.versions.set(sessionId, keptVersions)
    }
  }

  /**
   * Export version history
   */
  exportVersionHistory(sessionId: string): {
    sessionId: string
    versions: SessionVersion[]
    exportedAt: Date
  } {
    return {
      sessionId,
      versions: this.versions.get(sessionId) || [],
      exportedAt: new Date()
    }
  }

  /**
   * Import version history
   */
  importVersionHistory(data: {
    sessionId: string
    versions: SessionVersion[]
  }): void {
    this.versions.set(data.sessionId, data.versions)
  }

  /**
   * Generate version number
   */
  private generateVersionNumber(sessionId: string): string {
    const versions = this.versions.get(sessionId) || []
    const versionNumber = versions.length + 1
    return `v${versionNumber.toString().padStart(3, '0')}`
  }

  /**
   * Compare two nodes and return changes
   */
  private compareNodes(oldNode: any, newNode: any): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = []

    // Compare basic properties
    const fieldsToCompare = ['title', 'description', 'status', 'position', 'size']
    
    for (const field of fieldsToCompare) {
      if (!this.deepEqual(oldNode[field], newNode[field])) {
        changes.push({
          field,
          oldValue: oldNode[field],
          newValue: newNode[field]
        })
      }
    }

    // Compare content
    if (!this.deepEqual(oldNode.content, newNode.content)) {
      changes.push({
        field: 'content',
        oldValue: oldNode.content,
        newValue: newNode.content
      })
    }

    // Compare metadata (excluding updatedAt)
    const oldMetadata = { ...oldNode.metadata }
    const newMetadata = { ...newNode.metadata }
    delete oldMetadata.updatedAt
    delete newMetadata.updatedAt

    if (!this.deepEqual(oldMetadata, newMetadata)) {
      changes.push({
        field: 'metadata',
        oldValue: oldMetadata,
        newValue: newMetadata
      })
    }

    return changes
  }

  /**
   * Compare two objects and return changes
   */
  private compareObjects(
    oldObj: any,
    newObj: any,
    prefix: string = ''
  ): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = []

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

    for (const key of allKeys) {
      const fieldName = prefix ? `${prefix}.${key}` : key
      
      if (!(key in oldObj)) {
        changes.push({
          field: fieldName,
          oldValue: undefined,
          newValue: newObj[key]
        })
      } else if (!(key in newObj)) {
        changes.push({
          field: fieldName,
          oldValue: oldObj[key],
          newValue: undefined
        })
      } else if (!this.deepEqual(oldObj[key], newObj[key])) {
        changes.push({
          field: fieldName,
          oldValue: oldObj[key],
          newValue: newObj[key]
        })
      }
    }

    return changes
  }

  /**
   * Deep clone an object
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T
    }

    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }

    return cloned
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime()
    }

    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
      return a === b
    }

    if (a === null || a === undefined || b === null || b === undefined) {
      return false
    }

    if (a.prototype !== b.prototype) return false

    let keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) {
      return false
    }

    return keys.every(k => this.deepEqual(a[k], b[k]))
  }

  /**
   * Clear all versions for a session
   */
  clearVersions(sessionId: string): void {
    this.versions.delete(sessionId)
  }

  /**
   * Clear all versions
   */
  clearAllVersions(): void {
    this.versions.clear()
  }
}

// Singleton instance
export const sessionVersionManager = new SessionVersionManager()