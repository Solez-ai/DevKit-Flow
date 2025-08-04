import React, { useCallback, useRef, useState } from 'react'
import { ReactFlow, type Node, type Edge, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, type Connection, type NodeChange, type EdgeChange } from 'reactflow'
import 'reactflow/dist/style.css'
import type { ComponentWireframe, ComponentType } from '../../types'
import { createComponentWireframe } from '../../lib/component-wireframe-factory'
import { ComponentWireframeManager } from '../../lib/component-wireframe-manager'
import { ComponentWireframeNode } from './ComponentWireframeNode'
import { useToast } from '../../hooks/use-toast'

interface ComponentWireframeCanvasProps {
  sessionId: string
  components: ComponentWireframe[]
  onComponentsChange: (components: ComponentWireframe[]) => void
  onComponentSelect: (componentId: string | null) => void
  selectedComponentId: string | null
}

const nodeTypes = {
  componentWireframe: ComponentWireframeNode
}

export const ComponentWireframeCanvas: React.FC<ComponentWireframeCanvasProps> = ({
  sessionId,
  components,
  onComponentsChange,
  onComponentSelect,
  selectedComponentId
}) => {
  const { toast } = useToast()
  const managerRef = useRef<ComponentWireframeManager | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // Initialize manager
  if (!managerRef.current) {
    managerRef.current = new ComponentWireframeManager(sessionId)
    components.forEach(component => {
      managerRef.current!.addComponent(component)
    })
  }

  // Convert components to React Flow nodes
  const nodes: Node[] = components.map(component => ({
    id: component.id,
    type: 'componentWireframe',
    position: component.position,
    data: {
      component,
      isSelected: component.id === selectedComponentId,
      onUpdate: (updates: Partial<ComponentWireframe>) => {
        handleComponentUpdate(component.id, updates)
      },
      onDelete: () => handleComponentDelete(component.id)
    },
    selected: component.id === selectedComponentId
  }))

  // Convert relationships to React Flow edges
  const edges: Edge[] = managerRef.current?.exportHierarchy().relationships.map(rel => ({
    id: rel.id,
    source: rel.parentId,
    target: rel.childId,
    type: 'smoothstep',
    label: rel.type,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    labelStyle: { fontSize: 12, fontWeight: 500 }
  })) || []

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges)

  // Update nodes when components change
  React.useEffect(() => {
    const newNodes = components.map(component => ({
      id: component.id,
      type: 'componentWireframe',
      position: component.position,
      data: {
        component,
        isSelected: component.id === selectedComponentId,
        onUpdate: (updates: Partial<ComponentWireframe>) => {
          handleComponentUpdate(component.id, updates)
        },
        onDelete: () => handleComponentDelete(component.id)
      },
      selected: component.id === selectedComponentId
    }))
    setNodes(newNodes)
  }, [components, selectedComponentId, setNodes])

  const handleComponentUpdate = useCallback((componentId: string, updates: Partial<ComponentWireframe>) => {
    if (!managerRef.current) return

    managerRef.current.updateComponent(componentId, updates)
    const updatedComponents = managerRef.current.getAllComponents()
    onComponentsChange(updatedComponents)
  }, [onComponentsChange])

  const handleComponentDelete = useCallback((componentId: string) => {
    if (!managerRef.current) return

    managerRef.current.removeComponent(componentId)
    const updatedComponents = managerRef.current.getAllComponents()
    onComponentsChange(updatedComponents)
    
    if (selectedComponentId === componentId) {
      onComponentSelect(null)
    }

    toast({
      title: "Component deleted",
      description: "The component has been removed from the wireframe."
    })
  }, [onComponentsChange, onComponentSelect, selectedComponentId, toast])

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    
    // Handle position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && managerRef.current) {
        managerRef.current.updatePosition(change.id, change.position)
        const updatedComponents = managerRef.current.getAllComponents()
        onComponentsChange(updatedComponents)
      }
    })
  }, [onNodesChange, onComponentsChange])

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes)
  }, [onEdgesChange])

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !managerRef.current) return

    // Create parent-child relationship
    managerRef.current.setParentChild(connection.source, connection.target)
    
    // Update edges
    const newEdge = {
      id: `${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      label: 'contains',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      labelStyle: { fontSize: 12, fontWeight: 500 }
    }
    
    setEdges(eds => addEdge(newEdge, eds))
    
    const updatedComponents = managerRef.current.getAllComponents()
    onComponentsChange(updatedComponents)

    toast({
      title: "Relationship created",
      description: "Parent-child relationship has been established."
    })
  }, [setEdges, onComponentsChange, toast])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
    const componentType = event.dataTransfer.getData('application/component-type') as ComponentType
    
    if (!componentType || !reactFlowBounds || !reactFlowInstance) return

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    })

    const newComponent = createComponentWireframe(componentType, position)
    
    if (managerRef.current) {
      managerRef.current.addComponent(newComponent)
      const updatedComponents = managerRef.current.getAllComponents()
      onComponentsChange(updatedComponents)
    }

    toast({
      title: "Component added",
      description: `${componentType} component has been added to the wireframe.`
    })
  }, [reactFlowInstance, onComponentsChange, toast])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onComponentSelect(node.id)
  }, [onComponentSelect])

  const handlePaneClick = useCallback(() => {
    onComponentSelect(null)
  }, [onComponentSelect])

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const component = components.find(c => c.id === node.id)
            return component?.style.backgroundColor || '#ffffff'
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}