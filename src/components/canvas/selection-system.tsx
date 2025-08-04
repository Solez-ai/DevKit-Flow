import { useCallback, useEffect, useRef, useState } from 'react'
import { useReactFlow, type Node, type Edge } from 'reactflow'
import { cn } from '@/lib/utils'

interface SelectionBoxProps {
  isSelecting: boolean
  startPosition: { x: number; y: number }
  currentPosition: { x: number; y: number }
}

export function SelectionBox({ isSelecting, startPosition, currentPosition }: SelectionBoxProps) {
  if (!isSelecting) return null

  const left = Math.min(startPosition.x, currentPosition.x)
  const top = Math.min(startPosition.y, currentPosition.y)
  const width = Math.abs(currentPosition.x - startPosition.x)
  const height = Math.abs(currentPosition.y - startPosition.y)

  return (
    <div
      className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10 z-50"
      style={{
        left,
        top,
        width,
        height,
        transform: 'none'
      }}
    />
  )
}

interface UseSelectionSystemProps {
  onSelectionChange?: (selectedNodes: Node[], selectedEdges: Edge[]) => void
  multiSelectKey?: string[]
  dragSelectKey?: string[]
}

export function useSelectionSystem({
  onSelectionChange,
  multiSelectKey = ['Control', 'Meta'],
  dragSelectKey = ['Shift']
}: UseSelectionSystemProps = {}) {
  const reactFlowInstance = useReactFlow()
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 })
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)

  // Handle mouse down for selection start
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    
    // Don't start selection if clicking on a node, edge, or control
    if (
      target.closest('.react-flow__node') ||
      target.closest('.react-flow__edge') ||
      target.closest('.react-flow__controls') ||
      target.closest('.react-flow__minimap') ||
      target.closest('[data-testid="rf__node"]') ||
      target.closest('[data-testid="rf__edge"]')
    ) {
      return
    }

    // Check if drag select key is pressed
    const isDragSelectActive = dragSelectKey.some(key => 
      key === 'Shift' ? event.shiftKey :
      key === 'Control' ? event.ctrlKey :
      key === 'Meta' ? event.metaKey :
      key === 'Alt' ? event.altKey :
      false
    )

    if (!isDragSelectActive) return

    event.preventDefault()
    event.stopPropagation()

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const startPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    setIsSelecting(true)
    setStartPosition(startPos)
    setCurrentPosition(startPos)
    selectionStartRef.current = startPos
    isDraggingRef.current = false
  }, [dragSelectKey])

  // Handle mouse move for selection update
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isSelecting || !selectionStartRef.current) return

    event.preventDefault()
    isDraggingRef.current = true

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const currentPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    setCurrentPosition(currentPos)

    // Calculate selection bounds
    const left = Math.min(selectionStartRef.current.x, currentPos.x)
    const top = Math.min(selectionStartRef.current.y, currentPos.y)
    const right = Math.max(selectionStartRef.current.x, currentPos.x)
    const bottom = Math.max(selectionStartRef.current.y, currentPos.y)

    // Convert screen coordinates to flow coordinates
    const flowBounds = reactFlowInstance.screenToFlowPosition({
      x: left,
      y: top
    })
    const flowBoundsEnd = reactFlowInstance.screenToFlowPosition({
      x: right,
      y: bottom
    })

    // Find nodes within selection bounds
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()
    
    const selectedNodeIds = new Set<string>()
    const selectedEdgeIds = new Set<string>()

    // Select nodes that intersect with selection box
    nodes.forEach(node => {
      const nodeLeft = node.position.x
      const nodeTop = node.position.y
      const nodeRight = node.position.x + (node.width || 200)
      const nodeBottom = node.position.y + (node.height || 100)

      const intersects = !(
        nodeRight < flowBounds.x ||
        nodeLeft > flowBoundsEnd.x ||
        nodeBottom < flowBounds.y ||
        nodeTop > flowBoundsEnd.y
      )

      if (intersects) {
        selectedNodeIds.add(node.id)
      }
    })

    // Select edges whose nodes are selected
    edges.forEach(edge => {
      if (selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)) {
        selectedEdgeIds.add(edge.id)
      }
    })

    // Update selection
    const newSelectedNodes = nodes.filter(node => selectedNodeIds.has(node.id))
    const newSelectedEdges = edges.filter(edge => selectedEdgeIds.has(edge.id))

    setSelectedNodes(newSelectedNodes)
    setSelectedEdges(newSelectedEdges)

    // Update React Flow selection
    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      selected: selectedNodeIds.has(node.id)
    })))

    reactFlowInstance.setEdges(edges.map(edge => ({
      ...edge,
      selected: selectedEdgeIds.has(edge.id)
    })))
  }, [isSelecting, reactFlowInstance])

  // Handle mouse up for selection end
  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isSelecting) return

    setIsSelecting(false)
    selectionStartRef.current = null

    // If we didn't drag, clear selection (unless multi-select key is pressed)
    if (!isDraggingRef.current) {
      const isMultiSelectActive = multiSelectKey.some(key => 
        key === 'Shift' ? event.shiftKey :
        key === 'Control' ? event.ctrlKey :
        key === 'Meta' ? event.metaKey :
        key === 'Alt' ? event.altKey :
        false
      )

      if (!isMultiSelectActive) {
        // Clear selection
        const nodes = reactFlowInstance.getNodes()
        const edges = reactFlowInstance.getEdges()

        reactFlowInstance.setNodes(nodes.map(node => ({
          ...node,
          selected: false
        })))

        reactFlowInstance.setEdges(edges.map(edge => ({
          ...edge,
          selected: false
        })))

        setSelectedNodes([])
        setSelectedEdges([])
        onSelectionChange?.([], [])
      }
    } else {
      // Notify about selection change
      onSelectionChange?.(selectedNodes, selectedEdges)
    }

    isDraggingRef.current = false
  }, [isSelecting, selectedNodes, selectedEdges, onSelectionChange, multiSelectKey, reactFlowInstance])

  // Handle escape key to clear selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSelecting) {
          setIsSelecting(false)
          selectionStartRef.current = null
          isDraggingRef.current = false
        } else {
          // Clear all selections
          const nodes = reactFlowInstance.getNodes()
          const edges = reactFlowInstance.getEdges()

          reactFlowInstance.setNodes(nodes.map(node => ({
            ...node,
            selected: false
          })))

          reactFlowInstance.setEdges(edges.map(edge => ({
            ...edge,
            selected: false
          })))

          setSelectedNodes([])
          setSelectedEdges([])
          onSelectionChange?.([], [])
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSelecting, onSelectionChange, reactFlowInstance])

  // Select all functionality
  const selectAll = useCallback(() => {
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()

    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      selected: true
    })))

    reactFlowInstance.setEdges(edges.map(edge => ({
      ...edge,
      selected: true
    })))

    setSelectedNodes(nodes)
    setSelectedEdges(edges)
    onSelectionChange?.(nodes, edges)
  }, [reactFlowInstance, onSelectionChange])

  // Clear selection functionality
  const clearSelection = useCallback(() => {
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()

    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      selected: false
    })))

    reactFlowInstance.setEdges(edges.map(edge => ({
      ...edge,
      selected: false
    })))

    setSelectedNodes([])
    setSelectedEdges([])
    onSelectionChange?.([], [])
  }, [reactFlowInstance, onSelectionChange])

  // Invert selection functionality
  const invertSelection = useCallback(() => {
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()

    const newSelectedNodes = nodes.filter(node => !node.selected)
    const newSelectedEdges = edges.filter(edge => !edge.selected)

    reactFlowInstance.setNodes(nodes.map(node => ({
      ...node,
      selected: !node.selected
    })))

    reactFlowInstance.setEdges(edges.map(edge => ({
      ...edge,
      selected: !edge.selected
    })))

    setSelectedNodes(newSelectedNodes)
    setSelectedEdges(newSelectedEdges)
    onSelectionChange?.(newSelectedNodes, newSelectedEdges)
  }, [reactFlowInstance, onSelectionChange])

  return {
    // Selection state
    isSelecting,
    startPosition,
    currentPosition,
    selectedNodes,
    selectedEdges,
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Selection actions
    selectAll,
    clearSelection,
    invertSelection,
    
    // Selection box component
    SelectionBox: () => (
      <SelectionBox
        isSelecting={isSelecting}
        startPosition={startPosition}
        currentPosition={currentPosition}
      />
    )
  }
}

interface SelectionInfoProps {
  selectedNodes: Node[]
  selectedEdges: Edge[]
  className?: string
}

export function SelectionInfo({ selectedNodes, selectedEdges, className }: SelectionInfoProps) {
  const totalSelected = selectedNodes.length + selectedEdges.length

  if (totalSelected === 0) return null

  return (
    <div className={cn(
      "bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-sm text-muted-foreground",
      className
    )}>
      {selectedNodes.length > 0 && (
        <span>{selectedNodes.length} node{selectedNodes.length !== 1 ? 's' : ''}</span>
      )}
      {selectedNodes.length > 0 && selectedEdges.length > 0 && <span>, </span>}
      {selectedEdges.length > 0 && (
        <span>{selectedEdges.length} connection{selectedEdges.length !== 1 ? 's' : ''}</span>
      )}
      <span> selected</span>
    </div>
  )
}