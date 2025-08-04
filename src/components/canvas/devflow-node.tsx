import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NodeContextMenu } from './context-menu'
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  AlertCircle,
  FileText,
  Code,
  Link,
  MessageSquare,
  File,
  Folder,
  Package,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { createConnection } from '@/lib/connection-utils'
import type { DevFlowNode, NodeConnection, ConnectionType } from '@/types'

interface DevFlowNodeData extends DevFlowNode {
  sessionId: string
}

const nodeIcons = {
  task: FileText,
  code: Code,
  reference: Link,
  comment: MessageSquare,
  template: File,
  file: File,
  folder: Folder,
  component: Package
}

const statusIcons = {
  idle: Circle,
  active: Play,
  completed: CheckCircle2,
  blocked: AlertCircle
}

const statusColors = {
  idle: 'text-muted-foreground',
  active: 'text-blue-500',
  completed: 'text-green-500',
  blocked: 'text-red-500'
}

const nodeTypeColors = {
  task: 'border-blue-200 bg-blue-50/50',
  code: 'border-green-200 bg-green-50/50',
  reference: 'border-purple-200 bg-purple-50/50',
  comment: 'border-yellow-200 bg-yellow-50/50',
  template: 'border-orange-200 bg-orange-50/50',
  file: 'border-gray-200 bg-gray-50/50',
  folder: 'border-indigo-200 bg-indigo-50/50',
  component: 'border-pink-200 bg-pink-50/50'
}

export const DevFlowNodeComponent = memo(({ data, selected }: NodeProps<DevFlowNodeData>) => {
  const {
    id,
    type,
    title,
    description,
    status,
    content,
    metadata,
    sessionId
  } = data

  const { sessions, updateSession } = useAppStore()
  const session = sessions.find(s => s.id === sessionId)

  const NodeIcon = nodeIcons[type]
  const StatusIcon = statusIcons[status]
  
  const completedTodos = content.todos.filter(todo => todo.completed).length
  const totalTodos = content.todos.length
  const hasCodeSnippets = content.codeSnippets.length > 0
  const hasReferences = content.references.length > 0
  const hasComments = content.comments.length > 0

  const handleNodeClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // Handle node selection/editing
    console.log('Node clicked:', id)
  }, [id])

  const handleEdit = useCallback(() => {
    console.log('Edit node:', id)
    // TODO: Open node editor
  }, [id])

  const handleDuplicate = useCallback(() => {
    if (!session) return

    const originalNode = session.nodes.find(n => n.id === id)
    if (!originalNode) return

    const newNode: DevFlowNode = {
      ...originalNode,
      id: `node-${Date.now()}`,
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

    const updatedNodes = [...session.nodes, newNode]
    updateSession(sessionId, { nodes: updatedNodes })
  }, [session, sessionId, id, updateSession])

  const handleDelete = useCallback(() => {
    if (!session) return

    const updatedNodes = session.nodes.filter(n => n.id !== id)
    const updatedConnections = session.connections.filter(c => 
      c.sourceNodeId !== id && c.targetNodeId !== id
    )

    updateSession(sessionId, { 
      nodes: updatedNodes, 
      connections: updatedConnections 
    })
  }, [session, sessionId, id, updateSession])

  const handleConnect = useCallback((targetNodeId: string, connectionType: ConnectionType) => {
    if (!session) return

    const connectionData = createConnection(id, targetNodeId, connectionType)
    const newConnection: NodeConnection = {
      id: `connection-${Date.now()}`,
      ...connectionData
    }

    const updatedConnections = [...session.connections, newConnection]
    updateSession(sessionId, { connections: updatedConnections })
  }, [session, sessionId, id, updateSession])

  const handleMoreClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // Context menu will handle this
  }, [id])

  return (
    <NodeContextMenu
      node={data}
      sessionId={sessionId}
      onEdit={handleEdit}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onConnect={handleConnect}
    >
      <div className="relative">
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ top: -6 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ bottom: -6 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-muted-foreground border-2 border-background"
          style={{ right: -6 }}
        />

        {/* Node content */}
        <Card 
          className={cn(
            'w-64 cursor-pointer transition-all duration-200 hover:shadow-md',
            nodeTypeColors[type],
            selected && 'ring-2 ring-blue-500 ring-offset-2'
          )}
          onClick={handleNodeClick}
        >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <NodeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-tight truncate">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 overflow-hidden">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <StatusIcon className={cn('h-4 w-4', statusColors[status])} />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleMoreClick}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {/* Progress indicators */}
          <div className="flex flex-wrap gap-1">
            {totalTodos > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {completedTodos}/{totalTodos} todos
              </Badge>
            )}
            {hasCodeSnippets && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <Code className="h-3 w-3 mr-1" />
                {content.codeSnippets.length}
              </Badge>
            )}
            {hasReferences && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <Link className="h-3 w-3 mr-1" />
                {content.references.length}
              </Badge>
            )}
            {hasComments && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <MessageSquare className="h-3 w-3 mr-1" />
                {content.comments.length}
              </Badge>
            )}
          </div>

          {/* Priority indicator */}
          {metadata.priority > 3 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: metadata.priority }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mr-0.5',
                      metadata.priority === 5 ? 'bg-red-500' :
                      metadata.priority === 4 ? 'bg-orange-500' :
                      'bg-yellow-500'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Priority {metadata.priority}
              </span>
            </div>
          )}

          {/* Tags */}
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metadata.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {metadata.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{metadata.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Time tracking */}
          {metadata.timeSpent && metadata.timeSpent > 0 && (
            <div className="text-xs text-muted-foreground">
              {Math.round(metadata.timeSpent / 60)}m spent
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </NodeContextMenu>
  )
})

DevFlowNodeComponent.displayName = 'DevFlowNodeComponent'