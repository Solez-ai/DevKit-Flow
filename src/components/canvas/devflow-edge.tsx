import { memo, useCallback, useState, useMemo } from 'react'
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  MarkerType
} from 'reactflow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Edit3, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { ConnectionDialog } from './connection-dialog'
import { ConnectionContextMenu } from './context-menu'
import type { NodeConnection } from '@/types'

interface DevFlowEdgeData extends NodeConnection {
  sessionId: string
}

const connectionTypeStyles = {
  dependency: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    strokeDasharray: undefined,
    markerEnd: MarkerType.ArrowClosed
  },
  sequence: {
    stroke: '#10b981',
    strokeWidth: 2,
    strokeDasharray: '5,5',
    markerEnd: MarkerType.ArrowClosed
  },
  reference: {
    stroke: '#8b5cf6',
    strokeWidth: 1.5,
    strokeDasharray: '2,2',
    markerEnd: MarkerType.Arrow
  },
  blocks: {
    stroke: '#ef4444',
    strokeWidth: 2,
    strokeDasharray: undefined,
    markerEnd: MarkerType.ArrowClosed
  }
}

const connectionTypeLabels = {
  dependency: 'depends on',
  sequence: 'then',
  reference: 'references',
  blocks: 'blocks'
}

export const DevFlowEdgeComponent = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}: EdgeProps<DevFlowEdgeData>) => {
  const {
    type = 'dependency',
    label,
    sessionId = '',
    sourceNodeId = '',
    targetNodeId = ''
  } = data || {}

  const { sessions, updateSession, removeConnectionFromSession } = useAppStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const session = sessions.find(s => s.id === sessionId)
  const sourceNode = session?.nodes.find(n => n.id === sourceNodeId)
  const targetNode = session?.nodes.find(n => n.id === targetNodeId)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const edgeStyle = connectionTypeStyles[type]

  const handleDeleteEdge = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    if (sessionId) {
      removeConnectionFromSession(sessionId, id)
    }
  }, [id, sessionId, removeConnectionFromSession])

  const handleEditEdge = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    setEditDialogOpen(true)
  }, [])

  const handleSaveConnection = useCallback((connectionData: Partial<NodeConnection>) => {
    if (!session || !sessionId) return

    const updatedConnections = session.connections.map(conn =>
      conn.id === id ? { ...conn, ...connectionData } : conn
    )

    updateSession(sessionId, { connections: updatedConnections })
  }, [session, id, sessionId, updateSession])

  const handleDeleteConnection = useCallback(() => {
    if (sessionId) {
      removeConnectionFromSession(sessionId, id)
    }
  }, [id, sessionId, removeConnectionFromSession])

  // Check if connection might be problematic
  const hasWarning = useMemo(() => {
    if (!sourceNode || !targetNode) return false
    
    // Warn about blocking with completed nodes
    if (type === 'blocks' && sourceNode.status === 'completed') {
      return true
    }
    
    // Warn about depending on blocked nodes
    if (type === 'dependency' && sourceNode.status === 'blocked') {
      return true
    }
    
    return false
  }, [type, sourceNode?.status, targetNode?.status])

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...edgeStyle,
          strokeWidth: selected ? edgeStyle.strokeWidth + 1 : edgeStyle.strokeWidth,
          opacity: selected ? 1 : hasWarning ? 0.7 : 0.8
        }}
        markerEnd={edgeStyle.markerEnd}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className={cn(
            'flex items-center gap-1 transition-all duration-200',
            selected && 'scale-110'
          )}>
            {/* Warning indicator */}
            {hasWarning && (
              <div className="flex items-center justify-center w-5 h-5 bg-yellow-100 border border-yellow-200 rounded-full">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
              </div>
            )}

            {/* Connection type badge */}
            <ConnectionContextMenu
              connection={data || {} as NodeConnection}
              sessionId={sessionId}
              onEdit={() => handleEditEdge({} as React.MouseEvent)}
              onDelete={handleDeleteConnection}
            >
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs px-2 py-0.5 bg-background/90 backdrop-blur-sm border shadow-sm cursor-pointer hover:bg-background',
                  type === 'dependency' && 'border-blue-200 text-blue-700',
                  type === 'sequence' && 'border-green-200 text-green-700',
                  type === 'reference' && 'border-purple-200 text-purple-700',
                  type === 'blocks' && 'border-red-200 text-red-700',
                  hasWarning && 'border-yellow-200 bg-yellow-50'
                )}
                onClick={handleEditEdge}
              >
                {label || connectionTypeLabels[type]}
              </Badge>
            </ConnectionContextMenu>

            {/* Edge controls (shown on hover/selection) */}
            {selected && (
              <div className="flex items-center gap-1 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-background/90 backdrop-blur-sm"
                  onClick={handleEditEdge}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-background/90 backdrop-blur-sm hover:bg-red-50 hover:border-red-200"
                  onClick={handleDeleteEdge}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>

      {/* Connection Edit Dialog */}
      <ConnectionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        connection={data}
        sourceNodeTitle={sourceNode?.title}
        targetNodeTitle={targetNode?.title}
        onSave={handleSaveConnection}
        onDelete={handleDeleteConnection}
      />
    </>
  )
})

DevFlowEdgeComponent.displayName = 'DevFlowEdgeComponent'