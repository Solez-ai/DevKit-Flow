import { useCallback, useEffect } from 'react'
import { useReactFlow, type Node, type Edge } from 'reactflow'
import { useAppStore } from '@/store/app-store'
import { createConnection } from '@/lib/connection-utils'
import type { DevFlowNode, NodeConnection, ConnectionType } from '@/types'

interface CanvasShortcutsProps {
  sessionId: string
  selectedNodes: Node[]
  selectedEdges: Edge[]
  onSelectAll?: () => void
  onClearSelection?: () => void
  onInvertSelection?: () => void
  onDeleteSelected?: () => void
  onDuplicateSelected?: () => void
  onCopySelected?: () => void
  onPasteNodes?: () => void
  onCreateNode?: (type: string) => void
}

export function useCanvasShortcuts({
  sessionId,
  selectedNodes,
  selectedEdges,
  onSelectAll,
  onClearSelection,
  onInvertSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onCopySelected,
  onPasteNodes,
  onCreateNode
}: CanvasShortcutsProps) {
  const reactFlowInstance = useReactFlow()
  const { sessions, updateSession } = useAppStore()
  const session = sessions.find(s => s.id === sessionId)

  // Handle zoom operations
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn({ duration: 300 })
  }, [reactFlowInstance])

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut({ duration: 300 })
  }, [reactFlowInstance])

  const handleResetZoom = useCallback(() => {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 })
  }, [reactFlowInstance])

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ 
      padding: 0.2,
      includeHiddenNodes: false,
      duration: 800
    })
  }, [reactFlowInstance])

  // Handle node operations
  const handleDeleteSelected = useCallback(() => {
    if (!session) return

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id))
    const selectedEdgeIds = new Set(selectedEdges.map(e => e.id))

    // Remove selected nodes and their connections
    const updatedNodes = session.nodes.filter(n => !selectedNodeIds.has(n.id))
    const updatedConnections = session.connections.filter(c => 
      !selectedEdgeIds.has(c.id) && 
      !selectedNodeIds.has(c.sourceNodeId) && 
      !selectedNodeIds.has(c.targetNodeId)
    )

    updateSession(sessionId, { 
      nodes: updatedNodes, 
      connections: updatedConnections 
    })

    onDeleteSelected?.()
  }, [session, sessionId, selectedNodes, selectedEdges, updateSession, onDeleteSelected])

  const handleDuplicateSelected = useCallback(() => {
    if (!session || selectedNodes.length === 0) return

    const duplicatedNodes: DevFlowNode[] = []
    const nodeIdMap = new Map<string, string>()

    // Create duplicated nodes
    selectedNodes.forEach(node => {
      const originalNode = session.nodes.find(n => n.id === node.id)
      if (!originalNode) return

      const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      nodeIdMap.set(node.id, newId)

      const duplicatedNode: DevFlowNode = {
        ...originalNode,
        id: newId,
        title: `${originalNode.title} (Copy)`,
        position: {
          x: originalNode.position.x + 50,
          y: originalNode.position.y + 50
        },
        metadata: {
          ...originalNode.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      duplicatedNodes.push(duplicatedNode)
    })

    // Create duplicated connections between duplicated nodes
    const duplicatedConnections: NodeConnection[] = []
    const selectedNodeIds = new Set(selectedNodes.map(n => n.id))

    session.connections.forEach(connection => {
      if (selectedNodeIds.has(connection.sourceNodeId) && 
          selectedNodeIds.has(connection.targetNodeId)) {
        const newSourceId = nodeIdMap.get(connection.sourceNodeId)
        const newTargetId = nodeIdMap.get(connection.targetNodeId)

        if (newSourceId && newTargetId) {
          const duplicatedConnection: NodeConnection = {
            ...connection,
            id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceNodeId: newSourceId,
            targetNodeId: newTargetId
          }

          duplicatedConnections.push(duplicatedConnection)
        }
      }
    })

    // Update session with duplicated items
    updateSession(sessionId, {
      nodes: [...session.nodes, ...duplicatedNodes],
      connections: [...session.connections, ...duplicatedConnections]
    })

    onDuplicateSelected?.()
  }, [session, sessionId, selectedNodes, updateSession, onDuplicateSelected])

  const handleCopySelected = useCallback(async () => {
    if (selectedNodes.length === 0) return

    const copyData = {
      nodes: selectedNodes.map(node => {
        const originalNode = session?.nodes.find(n => n.id === node.id)
        return originalNode
      }).filter(Boolean),
      connections: selectedEdges.map(edge => {
        const originalConnection = session?.connections.find(c => c.id === edge.id)
        return originalConnection
      }).filter(Boolean),
      timestamp: new Date().toISOString(),
      type: 'devkit-flow-selection'
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(copyData, null, 2))
      onCopySelected?.()
    } catch (error) {
      console.error('Failed to copy selection:', error)
    }
  }, [selectedNodes, selectedEdges, session, onCopySelected])

  const handlePasteNodes = useCallback(async () => {
    if (!session) return

    try {
      const clipboardText = await navigator.clipboard.readText()
      const copyData = JSON.parse(clipboardText)

      if (copyData.type !== 'devkit-flow-selection' || !copyData.nodes) {
        return
      }

      const pastedNodes: DevFlowNode[] = []
      const nodeIdMap = new Map<string, string>()

      // Create pasted nodes
      copyData.nodes.forEach((node: DevFlowNode) => {
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        nodeIdMap.set(node.id, newId)

        const pastedNode: DevFlowNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 100,
            y: node.position.y + 100
          },
          metadata: {
            ...node.metadata,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }

        pastedNodes.push(pastedNode)
      })

      // Create pasted connections
      const pastedConnections: NodeConnection[] = []
      if (copyData.connections) {
        copyData.connections.forEach((connection: NodeConnection) => {
          const newSourceId = nodeIdMap.get(connection.sourceNodeId)
          const newTargetId = nodeIdMap.get(connection.targetNodeId)

          if (newSourceId && newTargetId) {
            const pastedConnection: NodeConnection = {
              ...connection,
              id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sourceNodeId: newSourceId,
              targetNodeId: newTargetId
            }

            pastedConnections.push(pastedConnection)
          }
        })
      }

      // Update session with pasted items
      updateSession(sessionId, {
        nodes: [...session.nodes, ...pastedNodes],
        connections: [...session.connections, ...pastedConnections]
      })

      onPasteNodes?.()
    } catch (error) {
      console.error('Failed to paste nodes:', error)
    }
  }, [session, sessionId, updateSession, onPasteNodes])

  // Handle quick connections between selected nodes
  const handleQuickConnection = useCallback((connectionType: ConnectionType) => {
    if (!session || selectedNodes.length !== 2) return

    const [sourceNode, targetNode] = selectedNodes
    const connectionData = createConnection(sourceNode.id, targetNode.id, connectionType)
    
    const newConnection: NodeConnection = {
      id: `connection-${Date.now()}`,
      ...connectionData
    }

    const updatedConnections = [...session.connections, newConnection]
    updateSession(sessionId, { connections: updatedConnections })
  }, [session, sessionId, selectedNodes, updateSession])

  // Handle node creation shortcuts
  const handleCreateNodeShortcut = useCallback((type: string) => {
    onCreateNode?.(type)
  }, [onCreateNode])

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event
      const modifier = ctrlKey || metaKey

      // Skip if typing in input elements
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.contentEditable === 'true' ||
          target.closest('.monaco-editor')) {
        return
      }

      // Canvas navigation shortcuts
      if (modifier) {
        switch (key) {
          case '=':
          case '+':
            event.preventDefault()
            handleZoomIn()
            break
          case '-':
            event.preventDefault()
            handleZoomOut()
            break
          case '0':
            event.preventDefault()
            handleResetZoom()
            break
          case 'f':
            if (!shiftKey) {
              event.preventDefault()
              handleFitView()
            }
            break
          case 'a':
            event.preventDefault()
            onSelectAll?.()
            break
          case 'd':
            event.preventDefault()
            if (selectedNodes.length > 0) {
              handleDuplicateSelected()
            }
            break
          case 'c':
            event.preventDefault()
            if (selectedNodes.length > 0) {
              handleCopySelected()
            }
            break
          case 'v':
            event.preventDefault()
            handlePasteNodes()
            break
          case 'i':
            event.preventDefault()
            onInvertSelection?.()
            break
        }
      } else {
        switch (key) {
          case 'Delete':
          case 'Backspace':
            if (selectedNodes.length > 0 || selectedEdges.length > 0) {
              event.preventDefault()
              handleDeleteSelected()
            }
            break
          case 'Escape':
            event.preventDefault()
            onClearSelection?.()
            break
          // Quick connection shortcuts (when 2 nodes selected)
          case 'd':
            if (selectedNodes.length === 2) {
              event.preventDefault()
              handleQuickConnection('dependency')
            }
            break
          case 's':
            if (selectedNodes.length === 2) {
              event.preventDefault()
              handleQuickConnection('sequence')
            }
            break
          case 'r':
            if (selectedNodes.length === 2) {
              event.preventDefault()
              handleQuickConnection('reference')
            }
            break
          case 'b':
            if (selectedNodes.length === 2) {
              event.preventDefault()
              handleQuickConnection('blocks')
            }
            break
          // Node creation shortcuts
          case 't':
            if (altKey) {
              event.preventDefault()
              handleCreateNodeShortcut('task')
            }
            break
          case 'c':
            if (altKey) {
              event.preventDefault()
              handleCreateNodeShortcut('code')
            }
            break
          case 'n':
            if (altKey) {
              event.preventDefault()
              handleCreateNodeShortcut('comment')
            }
            break
          case 'l':
            if (altKey) {
              event.preventDefault()
              handleCreateNodeShortcut('reference')
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedNodes,
    selectedEdges,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitView,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleCopySelected,
    handlePasteNodes,
    handleQuickConnection,
    handleCreateNodeShortcut,
    onSelectAll,
    onClearSelection,
    onInvertSelection
  ])

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitView,
    handleDeleteSelected,
    handleDuplicateSelected,
    handleCopySelected,
    handlePasteNodes,
    handleQuickConnection,
    handleCreateNodeShortcut
  }
}

interface ShortcutHelpProps {
  className?: string
}

export function ShortcutHelp({ className }: ShortcutHelpProps) {
  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: 'Ctrl + +', description: 'Zoom in' },
      { keys: 'Ctrl + -', description: 'Zoom out' },
      { keys: 'Ctrl + 0', description: 'Reset zoom' },
      { keys: 'Ctrl + F', description: 'Fit to view' },
    ]},
    { category: 'Selection', items: [
      { keys: 'Ctrl + A', description: 'Select all' },
      { keys: 'Ctrl + I', description: 'Invert selection' },
      { keys: 'Escape', description: 'Clear selection' },
      { keys: 'Shift + Drag', description: 'Drag select' },
    ]},
    { category: 'Editing', items: [
      { keys: 'Delete', description: 'Delete selected' },
      { keys: 'Ctrl + D', description: 'Duplicate selected' },
      { keys: 'Ctrl + C', description: 'Copy selected' },
      { keys: 'Ctrl + V', description: 'Paste' },
    ]},
    { category: 'Connections (2 nodes selected)', items: [
      { keys: 'D', description: 'Create dependency' },
      { keys: 'S', description: 'Create sequence' },
      { keys: 'R', description: 'Create reference' },
      { keys: 'B', description: 'Create blocks' },
    ]},
    { category: 'Node Creation', items: [
      { keys: 'Alt + T', description: 'Create task node' },
      { keys: 'Alt + C', description: 'Create code node' },
      { keys: 'Alt + N', description: 'Create comment node' },
      { keys: 'Alt + L', description: 'Create reference node' },
    ]},
  ]

  return (
    <div className={className}>
      <h3 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-3">
        {shortcuts.map((category) => (
          <div key={category.category}>
            <h4 className="font-medium text-xs text-muted-foreground mb-1">
              {category.category}
            </h4>
            <div className="space-y-1">
              {category.items.map((shortcut) => (
                <div key={shortcut.keys} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{shortcut.description}</span>
                  <code className="bg-muted px-1 rounded text-xs">
                    {shortcut.keys}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}