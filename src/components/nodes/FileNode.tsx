import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  File, 
  Edit2, 
  Trash2, 
  Copy,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { DevFlowNode } from '../../types'
import { getFileTypeConfig } from '../../lib/file-structure-utils'

interface FileNodeProps {
  data: {
    node: DevFlowNode
    onUpdate: (updates: Partial<DevFlowNode>) => void
    onDelete: () => void
    onDuplicate: () => void
  }
  selected?: boolean
}

export function FileNode({ data, selected }: FileNodeProps) {
  const { node, onUpdate, onDelete, onDuplicate } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(node.title)

  const fileExtension = node.title.includes('.') 
    ? node.title.split('.').pop()?.toLowerCase() 
    : undefined
  
  const fileTypeConfig = fileExtension ? getFileTypeConfig(fileExtension) : undefined

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== node.title) {
      onUpdate({ title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(node.title)
      setIsEditing(false)
    }
  }

  const getStatusColor = () => {
    switch (node.status) {
      case 'completed': return 'bg-green-100 border-green-300'
      case 'active': return 'bg-blue-100 border-blue-300'
      case 'blocked': return 'bg-red-100 border-red-300'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadgeColor = () => {
    switch (node.status) {
      case 'completed': return 'bg-green-500'
      case 'active': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <Card className={`
        w-64 transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${getStatusColor()}
      `}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {fileTypeConfig ? (
                  <span className="text-lg">{fileTypeConfig.icon}</span>
                ) : (
                  <File className="w-4 h-4 text-gray-500" />
                )}
              </div>
              
              {/* File Name */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="h-6 text-sm font-medium"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="text-sm font-medium truncate cursor-pointer hover:text-blue-600"
                    onClick={() => setIsEditing(true)}
                    title={node.title}
                  >
                    {node.title}
                  </h3>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Status Indicator */}
              <div 
                className={`w-2 h-2 rounded-full ${getStatusBadgeColor()}`}
                title={`Status: ${node.status}`}
              />
              
              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* File Type Badge */}
            {fileTypeConfig && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: `${fileTypeConfig.color}20`, color: fileTypeConfig.color }}
                >
                  .{fileExtension}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {fileTypeConfig.description}
                </span>
              </div>
            )}

            {/* Description */}
            {node.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {node.description}
              </p>
            )}

            {/* File Path */}
            <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
              {node.metadata.tags.find(tag => tag.startsWith('/')) || `/${node.title}`}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Priority: {node.metadata.priority}</span>
              <span>{node.metadata.tags.length} tags</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Bottom} />
    </>
  )
}