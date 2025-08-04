import { useCallback, useEffect, useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Edit, 
  Files,
  ArrowRight,
  ArrowDown,
  Link,
  Unlink,
  Play,

  CheckCircle2,
  AlertCircle,
  Circle,
  Settings,
  Tag,
  Clock,
  FileText,
  Code,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import type { DevFlowNode, NodeConnection, ConnectionType, NodeStatus } from '@/types'

interface NodeContextMenuProps {
  children: React.ReactNode
  node: DevFlowNode
  sessionId: string
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onConnect?: (targetNodeId: string, connectionType: ConnectionType) => void
}

export function NodeContextMenu({ 
  children, 
  node, 
  sessionId, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onConnect 
}: NodeContextMenuProps) {
  const { sessions, updateSession } = useAppStore()
  const session = sessions.find(s => s.id === sessionId)
  
  const handleStatusChange = useCallback((status: NodeStatus) => {
    if (!session) return
    
    const updatedNodes = session.nodes.map(n => 
      n.id === node.id 
        ? { ...n, status, metadata: { ...n.metadata, updatedAt: new Date() } }
        : n
    )
    
    updateSession(sessionId, { nodes: updatedNodes })
  }, [session, sessionId, updateSession, node.id])

  const handlePriorityChange = useCallback((priority: 1 | 2 | 3 | 4 | 5) => {
    if (!session) return
    
    const updatedNodes = session.nodes.map(n => 
      n.id === node.id 
        ? { ...n, metadata: { ...n.metadata, priority, updatedAt: new Date() } }
        : n
    )
    
    updateSession(sessionId, { nodes: updatedNodes })
  }, [session, sessionId, updateSession, node.id])

  const handleCopy = useCallback(() => {
    const nodeData = JSON.stringify(node, null, 2)
    navigator.clipboard.writeText(nodeData)
  }, [node])

  const handleCut = useCallback(() => {
    handleCopy()
    onDelete?.()
  }, [handleCopy, onDelete])

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      const nodeData = JSON.parse(clipboardText)
      
      // Create new node with pasted data
      const newNode: DevFlowNode = {
        ...nodeData,
        id: `node-${Date.now()}`,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50
        },
        metadata: {
          ...nodeData.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
      
      if (session) {
        const updatedNodes = [...session.nodes, newNode]
        updateSession(sessionId, { nodes: updatedNodes })
      }
    } catch (error) {
      console.error('Failed to paste node:', error)
    }
  }, [node.position, session, sessionId, updateSession])

  const otherNodes = session?.nodes.filter(n => n.id !== node.id) || []

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Node
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onDuplicate}>
          <Files className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleCut}>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handlePaste}>
          <Clipboard className="mr-2 h-4 w-4" />
          Paste
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Circle className="mr-2 h-4 w-4" />
            Change Status
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleStatusChange('idle')}>
              <Circle className="mr-2 h-4 w-4 text-muted-foreground" />
              Idle
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusChange('active')}>
              <Play className="mr-2 h-4 w-4 text-blue-500" />
              Active
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusChange('completed')}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Completed
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleStatusChange('blocked')}>
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Blocked
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Tag className="mr-2 h-4 w-4" />
            Set Priority
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {[1, 2, 3, 4, 5].map((priority) => (
              <ContextMenuItem 
                key={priority} 
                onClick={() => handlePriorityChange(priority as 1 | 2 | 3 | 4 | 5)}
              >
                <div className="mr-2 flex">
                  {Array.from({ length: priority }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full mr-0.5 ${
                        priority === 5 ? 'bg-red-500' :
                        priority === 4 ? 'bg-orange-500' :
                        priority === 3 ? 'bg-yellow-500' :
                        priority === 2 ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
                Priority {priority}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {otherNodes.length > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Link className="mr-2 h-4 w-4" />
                Connect To
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                {otherNodes.slice(0, 10).map((targetNode) => (
                  <ContextMenuSub key={targetNode.id}>
                    <ContextMenuSubTrigger>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {targetNode.type === 'task' && <FileText className="h-3 w-3" />}
                        {targetNode.type === 'code' && <Code className="h-3 w-3" />}
                        {targetNode.type === 'comment' && <MessageSquare className="h-3 w-3" />}
                        {targetNode.type === 'reference' && <ExternalLink className="h-3 w-3" />}
                        <span className="truncate text-sm">{targetNode.title}</span>
                      </div>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem onClick={() => onConnect?.(targetNode.id, 'dependency')}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Dependency
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => onConnect?.(targetNode.id, 'sequence')}>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Sequence
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => onConnect?.(targetNode.id, 'reference')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Reference
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => onConnect?.(targetNode.id, 'blocks')}>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Blocks
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                ))}
                {otherNodes.length > 10 && (
                  <ContextMenuItem disabled>
                    ... and {otherNodes.length - 10} more
                  </ContextMenuItem>
                )}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Properties
        </ContextMenuItem>
        
        <ContextMenuItem>
          <Clock className="mr-2 h-4 w-4" />
          Time Tracking
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface ConnectionContextMenuProps {
  children: React.ReactNode
  connection: NodeConnection
  sessionId: string
  onEdit?: () => void
  onDelete?: () => void
}

export function ConnectionContextMenu({ 
  children, 
  connection, 
  sessionId, 
  onEdit, 
  onDelete 
}: ConnectionContextMenuProps) {
  const { sessions, updateSession } = useAppStore()
  const session = sessions.find(s => s.id === sessionId)
  
  const handleTypeChange = useCallback((type: ConnectionType) => {
    if (!session) return
    
    const updatedConnections = session.connections.map(c => 
      c.id === connection.id 
        ? { ...c, type }
        : c
    )
    
    updateSession(sessionId, { connections: updatedConnections })
  }, [session, sessionId, updateSession, connection.id])

  const sourceNode = session?.nodes.find(n => n.id === connection.sourceNodeId)
  const targetNode = session?.nodes.find(n => n.id === connection.targetNodeId)

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          {sourceNode?.title} → {targetNode?.title}
        </div>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Connection
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Link className="mr-2 h-4 w-4" />
            Change Type
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleTypeChange('dependency')}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Dependency
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleTypeChange('sequence')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Sequence
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleTypeChange('reference')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Reference
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleTypeChange('blocks')}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Blocks
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="text-red-600">
          <Unlink className="mr-2 h-4 w-4" />
          Delete Connection
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

interface CanvasContextMenuProps {
  children: React.ReactNode
  sessionId: string
  position?: { x: number; y: number }
  onCreateNode?: (type: string, position: { x: number; y: number }) => void
  onPaste?: (position: { x: number; y: number }) => void
}

export function CanvasContextMenu({ 
  children, 
  sessionId: _sessionId, 
  position,
  onCreateNode,
  onPaste 
}: CanvasContextMenuProps) {
  const [hasClipboardData, setHasClipboardData] = useState(false)

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        const isNodeData = text.includes('"type":') && text.includes('"id":')
        setHasClipboardData(isNodeData)
      } catch {
        setHasClipboardData(false)
      }
    }
    
    checkClipboard()
  }, [])

  const handleCreateNode = useCallback((type: string) => {
    if (position && onCreateNode) {
      onCreateNode(type, position)
    }
  }, [position, onCreateNode])

  const handlePaste = useCallback(() => {
    if (position && onPaste) {
      onPaste(position)
    }
  }, [position, onPaste])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FileText className="mr-2 h-4 w-4" />
            Create Node
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleCreateNode('task')}>
              <FileText className="mr-2 h-4 w-4" />
              Task Node
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCreateNode('code')}>
              <Code className="mr-2 h-4 w-4" />
              Code Node
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCreateNode('reference')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Reference Node
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleCreateNode('comment')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Comment Node
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        {hasClipboardData && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handlePaste}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste Node
            </ContextMenuItem>
          </>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Canvas Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}