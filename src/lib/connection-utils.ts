import type { NodeConnection, ConnectionType, DevFlowNode } from '@/types'

/**
 * Utility functions for managing node connections
 */

export interface ConnectionValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

/**
 * Validates if a connection can be created between two nodes
 */
export function validateConnection(
  sourceNodeId: string,
  targetNodeId: string,
  connectionType: ConnectionType,
  existingConnections: NodeConnection[],
  nodes: DevFlowNode[]
): ConnectionValidationResult {
  // Cannot connect node to itself
  if (sourceNodeId === targetNodeId) {
    return {
      isValid: false,
      error: 'Cannot connect a node to itself'
    }
  }

  // Check if connection already exists
  const existingConnection = existingConnections.find(
    conn => conn.sourceNodeId === sourceNodeId && conn.targetNodeId === targetNodeId
  )

  if (existingConnection) {
    return {
      isValid: false,
      error: `Connection already exists (${existingConnection.type})`
    }
  }

  // Check for reverse connection that might create conflicts
  const reverseConnection = existingConnections.find(
    conn => conn.sourceNodeId === targetNodeId && conn.targetNodeId === sourceNodeId
  )

  if (reverseConnection) {
    // Some connection types are incompatible in reverse
    if (
      (connectionType === 'dependency' && reverseConnection.type === 'dependency') ||
      (connectionType === 'blocks' && reverseConnection.type === 'blocks')
    ) {
      return {
        isValid: false,
        error: `Conflicting connection: ${reverseConnection.type} connection exists in reverse direction`
      }
    }

    if (connectionType === 'sequence' && reverseConnection.type === 'sequence') {
      return {
        isValid: false,
        error: 'Circular sequence detected: cannot create sequence in both directions'
      }
    }
  }

  // Check for circular dependencies
  if (connectionType === 'dependency' || connectionType === 'sequence') {
    const wouldCreateCycle = detectCycle(sourceNodeId, targetNodeId, connectionType, existingConnections)
    if (wouldCreateCycle) {
      return {
        isValid: false,
        error: `Would create circular ${connectionType}: ${wouldCreateCycle.path.join(' → ')}`
      }
    }
  }

  // Warnings for potentially problematic connections
  const sourceNode = nodes.find(n => n.id === sourceNodeId)
  const targetNode = nodes.find(n => n.id === targetNodeId)

  if (sourceNode && targetNode) {
    // Warn about blocking completed nodes
    if (connectionType === 'blocks' && sourceNode.status === 'completed') {
      return {
        isValid: true,
        warning: 'Blocking with a completed node may not be meaningful'
      }
    }

    // Warn about depending on blocked nodes
    if (connectionType === 'dependency' && sourceNode.status === 'blocked') {
      return {
        isValid: true,
        warning: 'Depending on a blocked node may cause delays'
      }
    }
  }

  return { isValid: true }
}

/**
 * Detects if adding a connection would create a cycle
 */
function detectCycle(
  sourceNodeId: string,
  targetNodeId: string,
  connectionType: ConnectionType,
  existingConnections: NodeConnection[]
): { hasCycle: boolean; path: string[] } | null {
  // Only check for cycles in dependency and sequence connections
  if (connectionType !== 'dependency' && connectionType !== 'sequence') {
    return null
  }

  // Build adjacency list for relevant connection types
  const adjacencyList = new Map<string, string[]>()
  
  existingConnections
    .filter(conn => conn.type === connectionType)
    .forEach(conn => {
      if (!adjacencyList.has(conn.sourceNodeId)) {
        adjacencyList.set(conn.sourceNodeId, [])
      }
      adjacencyList.get(conn.sourceNodeId)!.push(conn.targetNodeId)
    })

  // Add the proposed connection
  if (!adjacencyList.has(sourceNodeId)) {
    adjacencyList.set(sourceNodeId, [])
  }
  adjacencyList.get(sourceNodeId)!.push(targetNodeId)

  // DFS to detect cycle
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const path: string[] = []

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      // Found cycle, build path
      // const cycleStart = path.indexOf(nodeId)
      return true
    }

    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    path.pop()
    return false
  }

  // Check all nodes for cycles
  for (const nodeId of adjacencyList.keys()) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId)) {
        return { hasCycle: true, path: [...path] }
      }
    }
  }

  return null
}

/**
 * Creates a new connection with proper styling
 */
export function createConnection(
  sourceNodeId: string,
  targetNodeId: string,
  type: ConnectionType,
  label?: string
): Omit<NodeConnection, 'id'> {
  const connectionStyles = {
    dependency: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      strokeDasharray: undefined
    },
    sequence: {
      strokeColor: '#10b981',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    },
    reference: {
      strokeColor: '#8b5cf6',
      strokeWidth: 1.5,
      strokeDasharray: '2,2'
    },
    blocks: {
      strokeColor: '#ef4444',
      strokeWidth: 2,
      strokeDasharray: undefined
    }
  }

  const defaultLabels = {
    dependency: 'depends on',
    sequence: 'then',
    reference: 'references',
    blocks: 'blocks'
  }

  return {
    sourceNodeId,
    targetNodeId,
    type,
    label: label || defaultLabels[type],
    style: connectionStyles[type]
  }
}

/**
 * Gets all connections involving a specific node
 */
export function getNodeConnections(
  nodeId: string,
  connections: NodeConnection[]
): {
  incoming: NodeConnection[]
  outgoing: NodeConnection[]
  all: NodeConnection[]
} {
  const incoming = connections.filter(conn => conn.targetNodeId === nodeId)
  const outgoing = connections.filter(conn => conn.sourceNodeId === nodeId)
  
  return {
    incoming,
    outgoing,
    all: [...incoming, ...outgoing]
  }
}

/**
 * Finds nodes that are blocked by dependencies
 */
export function findBlockedNodes(
  nodes: DevFlowNode[],
  connections: NodeConnection[]
): DevFlowNode[] {
  const blockedNodes: DevFlowNode[] = []

  for (const node of nodes) {
    if (node.status === 'blocked') continue

    const { incoming } = getNodeConnections(node.id, connections)
    
    // Check dependency connections
    const dependencyConnections = incoming.filter(conn => conn.type === 'dependency')
    const hasUncompletedDependencies = dependencyConnections.some(conn => {
      const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
      return sourceNode && sourceNode.status !== 'completed'
    })

    // Check blocking connections
    const blockingConnections = incoming.filter(conn => conn.type === 'blocks')
    const isBlocked = blockingConnections.some(conn => {
      const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
      return sourceNode && sourceNode.status !== 'completed'
    })

    if (hasUncompletedDependencies || isBlocked) {
      blockedNodes.push(node)
    }
  }

  return blockedNodes
}

/**
 * Gets the next available nodes that can be worked on
 */
export function getAvailableNodes(
  nodes: DevFlowNode[],
  connections: NodeConnection[]
): DevFlowNode[] {
  const blockedNodeIds = new Set(
    findBlockedNodes(nodes, connections).map(node => node.id)
  )

  return nodes.filter(node => 
    node.status === 'idle' && !blockedNodeIds.has(node.id)
  )
}

/**
 * Calculates connection statistics for a session
 */
export function getConnectionStats(connections: NodeConnection[]): {
  total: number
  byType: Record<ConnectionType, number>
  averageConnectionsPerNode: number
  mostConnectedNodes: Array<{ nodeId: string; connectionCount: number }>
} {
  const byType: Record<ConnectionType, number> = {
    dependency: 0,
    sequence: 0,
    reference: 0,
    blocks: 0
  }

  connections.forEach(conn => {
    byType[conn.type]++
  })

  // Calculate node connection counts
  const nodeConnectionCounts = new Map<string, number>()
  connections.forEach(conn => {
    nodeConnectionCounts.set(
      conn.sourceNodeId,
      (nodeConnectionCounts.get(conn.sourceNodeId) || 0) + 1
    )
    nodeConnectionCounts.set(
      conn.targetNodeId,
      (nodeConnectionCounts.get(conn.targetNodeId) || 0) + 1
    )
  })

  const mostConnectedNodes = Array.from(nodeConnectionCounts.entries())
    .map(([nodeId, connectionCount]) => ({ nodeId, connectionCount }))
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, 5)

  const uniqueNodes = new Set([
    ...connections.map(c => c.sourceNodeId),
    ...connections.map(c => c.targetNodeId)
  ])

  return {
    total: connections.length,
    byType,
    averageConnectionsPerNode: uniqueNodes.size > 0 ? connections.length * 2 / uniqueNodes.size : 0,
    mostConnectedNodes
  }
}