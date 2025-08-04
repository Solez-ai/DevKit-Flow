import React, { useState, useRef, useEffect } from 'react'
import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  MoreHorizontal, 
  GripVertical,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface BaseNodeProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  children?: React.ReactNode
  className?: string
}

export function BaseNode({
  node,
  isSelected = false,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  children,
  className
}: BaseNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [isResizingState, setIsResizingState] = useState(false)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Handle node selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(node.id, e.ctrlKey || e.metaKey)
  }

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.drag-handle')) {
      return
    }
    
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - node.position.x, y: e.clientY - node.position.y })
  }

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizingState(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: node.size.width,
      height: node.size.height
    })
  }

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart) {
        const newPosition = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
        onPositionChange?.(node.id, newPosition)
      }
      
      if (isResizingState && resizeStart) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        const newSize = {
          width: Math.max(200, resizeStart.width + deltaX),
          height: Math.max(120, resizeStart.height + deltaY)
        }
        onSizeChange?.(node.id, newSize)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStart(null)
      setIsResizingState(false)
      setResizeStart(null)
    }

    if (isDragging || isResizingState) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizingState, dragStart, resizeStart, node.id, onPositionChange, onSizeChange])

  // Get status icon and color
  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'idle':
        return <Circle className="h-4 w-4 text-gray-400" />
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'idle':
        return 'border-gray-200 bg-white'
      case 'active':
        return 'border-blue-200 bg-blue-50'
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'blocked':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800'
      case 'code':
        return 'bg-purple-100 text-purple-800'
      case 'reference':
        return 'bg-green-100 text-green-800'
      case 'comment':
        return 'bg-yellow-100 text-yellow-800'
      case 'template':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card
      ref={nodeRef}
      className={cn(
        'absolute cursor-move transition-all duration-200',
        getStatusColor(node.status),
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'shadow-lg scale-105',
        isResizingState && 'select-none',
        className
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
        minWidth: 200,
        minHeight: 120
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <CardHeader className="pb-2 px-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="drag-handle cursor-move">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getStatusIcon(node.status)}
              <Badge variant="secondary" className={cn('text-xs', getTypeColor(node.type))}>
                {node.type}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange?.(node.id, 'idle')}>
                <Circle className="h-4 w-4 mr-2" />
                Set Idle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.(node.id, 'active')}>
                <Clock className="h-4 w-4 mr-2" />
                Set Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.(node.id, 'completed')}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Set Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.(node.id, 'blocked')}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Set Blocked
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate?.(node.id)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(node.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-1">
          <h3 className="font-medium text-sm leading-tight truncate" title={node.title}>
            {node.title}
          </h3>
          {node.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={node.description}>
              {node.description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-3 pb-3 pt-0 flex-1 overflow-hidden">
        {children}
      </CardContent>
      
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded-sm" />
      </div>
      
      {/* Tags */}
      {node.metadata.tags.length > 0 && (
        <div className="absolute -top-2 left-2 flex gap-1">
          {node.metadata.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0 h-4 bg-white">
              {tag}
            </Badge>
          ))}
          {node.metadata.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-white">
              +{node.metadata.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  )
}