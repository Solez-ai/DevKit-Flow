import { useCallback, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type Connection,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  ConnectionMode,
  Panel,
  type ReactFlowInstance,
  ControlButton,
  SelectionMode,
  PanOnScrollMode
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useAppStore } from '@/store/app-store'
import { DevFlowNodeComponent } from './devflow-node'
import { DevFlowEdgeComponent } from './devflow-edge'
import { ConnectionDialog } from './connection-dialog'
import { ConnectionTypeSelector } from './connection-type-selector'
import { CanvasContextMenu } from './context-menu'
import { useSelectionSystem, SelectionInfo } from './selection-system'
import { Button } from '@/components/ui/button'
import { 
  Grid3X3, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  EyeOff,
  MousePointer,
  Square,
  Plus,

} from 'lucide-react'
import { cn } from '@/lib/utils'
import { validateConnection, createConnection } from '@/lib/connection-utils'
import type { DevFlowNode, NodeConnection, ConnectionType } from '@/types'

// Custom node types for React Flow
const nodeTypes: NodeTypes = {
  devflow: DevFlowNodeComponent
}

// Custom edge types for React Flow
const edgeTypes: EdgeTypes = {
  devflow: DevFlowEdgeComponent
}

interface FlowCanvasProps {
  sessionId: string
}

export function FlowCanvas({ sessionId }: FlowCanvasProps) {
  const { 
    sessions, 
    updateSession,
    userPreferences
  } = useAppStore()

  const session = sessions.find(s => s.id === sessionId)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  
  // Local canvas state
  const [gridVisible, setGridVisible] = useState(userPreferences.behavior.gridVisible)
  const [snapToGrid] = useState(userPreferences.behavior.snapToGrid)
  const [minimapVisible, setMinimapVisible] = useState(true)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(SelectionMode.Partial)
  const [panMode] = useState<PanOnScrollMode>(PanOnScrollMode.Free)
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)
  
  // Connection creation state
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [pendingConnection, setPendingConnection] = useState<{
    source: string
    target: string
  } | null>(null)
  
  // Convert DevFlow nodes to React Flow nodes
  const reactFlowNodes = useMemo(() => {
    if (!session) return []
    
    return session.nodes.map((node: DevFlowNode): Node => ({
      id: node.id,
      type: 'devflow',
      position: node.position,
      data: {
        ...node,
        sessionId
      },
      style: {
        width: node.size.width,
        height: node.size.height
      }
    }))
  }, [session?.nodes, sessionId])

  // Convert DevFlow connections to React Flow edges
  const reactFlowEdges = useMemo(() => {
    if (!session) return []
    
    return session.connections.map((connection: NodeConnection): Edge => ({
      id: connection.id,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      type: 'devflow',
      data: {
        ...connection,
        sessionId
      },
      style: {
        stroke: connection.style.strokeColor,
        strokeWidth: connection.style.strokeWidth,
        strokeDasharray: connection.style.strokeDasharray
      },
      label: connection.label,
      animated: connection.type === 'sequence'
    }))
  }, [session?.connections, sessionId])

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges)

  // Update nodes when session changes
  useMemo(() => {
    setNodes(reactFlowNodes)
  }, [reactFlowNodes, setNodes])

  // Update edges when session changes
  useMemo(() => {
    setEdges(reactFlowEdges)
  }, [reactFlowEdges, setEdges])

  // Selection system
  const {
    // isSelecting,
    // startPosition,
    // currentPosition,
    // selectedNodes: selectionNodes,
    // selectedEdges: selectionEdges,
    handleMouseDown: handleSelectionMouseDown,
    handleMouseMove: handleSelectionMouseMove,
    handleMouseUp: handleSelectionMouseUp,
    clearSelection,
    SelectionBox
  } = useSelectionSystem({
    onSelectionChange: (selectedNodes, selectedEdges) => {
      console.log('Selection changed:', selectedNodes.length, selectedEdges.length)
    }
  })

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!session || !params.source || !params.target) return

      // Store pending connection and open dialog for type selection
      setPendingConnection({
        source: params.source,
        target: params.target
      })
      setConnectionDialogOpen(true)
    },
    [session]
  )

  // Handle connection creation with specific type
  const handleCreateConnection = useCallback(
    (type: ConnectionType, source?: string, target?: string) => {
      if (!session) return

      const sourceId = source || pendingConnection?.source
      const targetId = target || pendingConnection?.target

      if (!sourceId || !targetId) return

      // Validate connection
      const validation = validateConnection(
        sourceId,
        targetId,
        type,
        session.connections,
        session.nodes
      )

      if (!validation.isValid) {
        console.error('Connection validation failed:', validation.error)
        // You could show a toast notification here
        return
      }

      // Create connection
      const connectionData = createConnection(sourceId, targetId, type)
      const newConnection: NodeConnection = {
        id: `connection-${Date.now()}`,
        ...connectionData
      }

      const updatedConnections = [...session.connections, newConnection]
      updateSession(sessionId, { connections: updatedConnections })

      // Clear pending connection
      setPendingConnection(null)
    },
    [session, sessionId, updateSession, pendingConnection]
  )

  // Handle connection dialog save
  const handleSaveConnection = useCallback(
    (connectionData: Partial<NodeConnection>) => {
      if (!pendingConnection) return

      handleCreateConnection(
        connectionData.type || 'dependency',
        pendingConnection.source,
        pendingConnection.target
      )
    },
    [pendingConnection, handleCreateConnection]
  )

  // Handle node position changes
  const handleNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      if (!session) return

      const updatedNodes = session.nodes.map(n => 
        n.id === node.id 
          ? { ...n, position: node.position }
          : n
      )

      updateSession(sessionId, { nodes: updatedNodes })
    },
    [session, sessionId, updateSession]
  )

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      // Store selected node IDs for context menus and actions
      const selectedNodeIds = selectedNodes.map(n => n.id)
      const selectedEdgeIds = selectedEdges.map(e => e.id)
      console.log('Selected nodes:', selectedNodeIds, 'Selected edges:', selectedEdgeIds)
    },
    []
  )

  // Create node at position
  const handleCreateNode = useCallback((type: string, position?: { x: number; y: number }) => {
    if (!session) return

    const canvasPosition = position || { x: 100, y: 100 }
    
    const newNode: DevFlowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: canvasPosition,
      size: { width: 256, height: 200 },
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

    const updatedNodes = [...session.nodes, newNode]
    updateSession(sessionId, { nodes: updatedNodes })
  }, [session, sessionId, updateSession])

  // Canvas shortcuts
  // const canvasShortcuts = useCanvasShortcuts({
  //   sessionId,
  //   selectedNodes: nodes.filter(n => n.selected),
  //   selectedEdges: edges.filter(e => e.selected),
  //   onSelectAll: selectAll,
  //   onClearSelection: clearSelection,
  //   onInvertSelection: invertSelection,
  //   onCreateNode: handleCreateNode,
  //   onDeleteSelected: () => {
  //     const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id)
  //     const selectedEdgeIds = edges.filter(e => e.selected).map(e => e.id)
  //     
  //     if (selectedNodeIds.length > 0) {
  //       handleDeleteNodes(selectedNodeIds)
  //     }
  //     if (selectedEdgeIds.length > 0) {
  //       handleDeleteConnections(selectedEdgeIds)
  //     }
  //   }
  // })

  // Handle React Flow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  // Canvas control functions
  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ 
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 800
      })
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomIn({ duration: 300 })
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.zoomOut({ duration: 300 })
    }
  }, [])

  const handleResetView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 })
    }
  }, [])

  const toggleGrid = useCallback(() => {
    setGridVisible(prev => !prev)
  }, [])

  // const toggleSnapToGrid = useCallback(() => {
  //   setSnapToGrid(prev => !prev)
  // }, [])

  const toggleMinimap = useCallback(() => {
    setMinimapVisible(prev => !prev)
  }, [])

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => 
      prev === SelectionMode.Partial ? SelectionMode.Full : SelectionMode.Partial
    )
  }, [])

  const toggleBackgroundVariant = useCallback(() => {
    setBackgroundVariant(prev => {
      switch (prev) {
        case BackgroundVariant.Dots:
          return BackgroundVariant.Lines
        case BackgroundVariant.Lines:
          return BackgroundVariant.Cross
        case BackgroundVariant.Cross:
          return BackgroundVariant.Dots
        default:
          return BackgroundVariant.Dots
      }
    })
  }, [])

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Clear selection when clicking on empty canvas
    if (event.target === event.currentTarget) {
      clearSelection()
    }
  }, [clearSelection])

  const handleCanvasContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    
    const rect = reactFlowWrapper.current?.getBoundingClientRect()
    if (!rect || !reactFlowInstance.current) return

    const position = reactFlowInstance.current.project({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })

    setContextMenuPosition(position)
  }, [])

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    setContextMenuPosition(null)
    handleSelectionMouseDown(event)
  }, [handleSelectionMouseDown])

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent) => {
    handleSelectionMouseMove(event)
  }, [handleSelectionMouseMove])

  const handleCanvasMouseUp = useCallback((event: React.MouseEvent) => {
    handleSelectionMouseUp(event)
  }, [handleSelectionMouseUp])

  // Node and connection deletion functions removed (unused)



  // Handle drag over for node creation
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop for node creation
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance.current || !session) return

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = reactFlowInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // Create new node at drop position
      const newNode: DevFlowNode = {
        id: `node-${Date.now()}`,
        type: type as any,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        position,
        size: { width: 256, height: 200 },
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

      const updatedNodes = [...session.nodes, newNode]
      updateSession(sessionId, { nodes: updatedNodes })
    },
    [session, sessionId, updateSession]
  )

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Session not found</div>
      </div>
    )
  }

  return (
    <CanvasContextMenu
      sessionId={sessionId}
      position={contextMenuPosition || undefined}
      onCreateNode={handleCreateNode}
    >
      <div 
        className="flex-1 h-full" 
        ref={reactFlowWrapper}
        onContextMenu={handleCanvasContextMenu}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          onSelectionChange={onSelectionChange}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={handleCanvasClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={3}
          snapToGrid={snapToGrid}
          snapGrid={[session.settings.gridSize || 20, session.settings.gridSize || 20]}
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode={['Meta', 'Control']}
          selectionKeyCode={['Shift']}
          panOnScroll={panMode === PanOnScrollMode.Free}
          selectionOnDrag
          panOnDrag={[1, 2]} // Left and middle mouse button
          selectNodesOnDrag={false}
          selectionMode={selectionMode}
          elevateNodesOnSelect
          proOptions={{ hideAttribution: true }}
          attributionPosition="bottom-center"
        >
        <Background 
          variant={gridVisible ? backgroundVariant : BackgroundVariant.Lines}
          gap={session.settings.gridSize || 20}
          size={gridVisible ? (backgroundVariant === BackgroundVariant.Dots ? 1 : 0.8) : 0.3}
          color={userPreferences.theme === 'dark' ? '#374151' : '#e2e8f0'}
          style={{
            opacity: gridVisible ? 0.6 : 0.2
          }}
        />
        
        <Controls 
          position="bottom-left"
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          style={{
            backgroundColor: userPreferences.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${userPreferences.theme === 'dark' ? '#374151' : '#e2e8f0'}`,
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <ControlButton onClick={handleZoomIn} title="Zoom In (Ctrl + +)">
            <ZoomIn className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} title="Zoom Out (Ctrl + -)">
            <ZoomOut className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={handleFitView} title="Fit to Screen (Ctrl + 0)">
            <Maximize2 className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={handleResetView} title="Reset View (Ctrl + R)">
            <RotateCcw className="h-4 w-4" />
          </ControlButton>
          <ControlButton 
            onClick={toggleGrid} 
            title={`${gridVisible ? "Hide" : "Show"} Grid (Ctrl + G)`}
            className={cn(gridVisible && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300")}
          >
            <Grid3X3 className="h-4 w-4" />
          </ControlButton>
          <ControlButton 
            onClick={toggleBackgroundVariant} 
            title="Change Grid Style"
            className={cn(gridVisible && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300")}
          >
            <Square className="h-4 w-4" />
          </ControlButton>
          <ControlButton 
            onClick={toggleSelectionMode} 
            title={`Selection Mode: ${selectionMode === SelectionMode.Partial ? 'Partial' : 'Full'}`}
            className={cn(selectionMode === SelectionMode.Full && "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300")}
          >
            <MousePointer className="h-4 w-4" />
          </ControlButton>
          <ControlButton 
            onClick={toggleMinimap} 
            title={`${minimapVisible ? "Hide" : "Show"} Minimap (Ctrl + M)`}
            className={cn(minimapVisible && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300")}
          >
            {minimapVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </ControlButton>
        </Controls>
        
        {minimapVisible && (
          <MiniMap 
            position="bottom-right"
            nodeColor={(node) => {
              const nodeData = node.data as DevFlowNode
              switch (nodeData.status) {
                case 'completed': return '#22c55e'
                case 'active': return '#3b82f6'
                case 'blocked': return '#ef4444'
                default: return '#64748b'
              }
            }}
            nodeStrokeColor={(node) => {
              const nodeData = node.data as DevFlowNode
              switch (nodeData.type) {
                case 'task': return '#3b82f6'
                case 'code': return '#10b981'
                case 'reference': return '#8b5cf6'
                case 'comment': return '#f59e0b'
                case 'template': return '#f97316'
                default: return '#64748b'
              }
            }}
            nodeStrokeWidth={2}
            maskColor={userPreferences.theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
            pannable
            zoomable
            ariaLabel="Canvas minimap for navigation"
            style={{
              backgroundColor: userPreferences.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${userPreferences.theme === 'dark' ? '#374151' : '#e2e8f0'}`,
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        )}

        <Panel position="top-center">
          <div className="flex items-center gap-4">
            <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-sm text-muted-foreground">
              {session.name} • {nodes.length} nodes • {edges.length} connections
            </div>
            <SelectionInfo
              selectedNodes={nodes.filter(n => n.selected)}
              selectedEdges={edges.filter(e => e.selected)}
            />
          </div>
        </Panel>

        <Panel position="top-right">
          <div className="flex items-center gap-2">
            <ConnectionTypeSelector
              onSelectType={(type) => {
                const selectedNodes = nodes.filter(node => node.selected)
                if (selectedNodes.length === 2) {
                  handleCreateConnection(type, selectedNodes[0].id, selectedNodes[1].id)
                }
              }}
              onOpenAdvanced={() => {
                const selectedNodes = nodes.filter(node => node.selected)
                if (selectedNodes.length === 2) {
                  setPendingConnection({
                    source: selectedNodes[0].id,
                    target: selectedNodes[1].id
                  })
                  setConnectionDialogOpen(true)
                }
              }}
              disabled={nodes.filter(node => node.selected).length !== 2}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={nodes.filter(node => node.selected).length !== 2}
                  className="gap-2 bg-background/90 backdrop-blur-sm"
                >
                  <Plus className="h-4 w-4" />
                  Connect ({nodes.filter(node => node.selected).length}/2)
                </Button>
              }
            />
          </div>
        </Panel>
      </ReactFlow>

      {/* Selection Box */}
      <SelectionBox />

      {/* Connection Creation Dialog */}
      <ConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        sourceNodeTitle={
          pendingConnection ? session.nodes.find(n => n.id === pendingConnection.source)?.title : undefined
        }
        targetNodeTitle={
          pendingConnection ? session.nodes.find(n => n.id === pendingConnection.target)?.title : undefined
        }
        onSave={handleSaveConnection}
      />
      </div>
    </CanvasContextMenu>
  )
}