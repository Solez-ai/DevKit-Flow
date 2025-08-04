import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  GripVertical,
  File,
  Folder
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { FileStructureNode } from '../../types'
import { getFileTypeConfig } from '../../lib/file-structure-utils'

interface FileTreeItemProps {
  node: FileStructureNode
  isSelected: boolean
  onSelect: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  onRename: (nodeId: string, newName: string) => boolean
  isDragging?: boolean
}

export function FileTreeItem({
  node,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  isDragging = false
}: FileTreeItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(node.name)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      const success = onRename(node.id, editName.trim())
      if (success) {
        setIsEditing(false)
      }
    } else {
      setEditName(node.name)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditName(node.name)
      setIsEditing(false)
    }
  }

  const getIcon = () => {
    if (node.type === 'folder') {
      return <Folder className="w-4 h-4 text-blue-500" />
    }
    
    if (node.fileType) {
      const config = getFileTypeConfig(node.fileType)
      if (config) {
        return <span className="text-sm">{config.icon}</span>
      }
    }
    
    return <File className="w-4 h-4 text-gray-500" />
  }

  const getFileTypeInfo = () => {
    if (node.type === 'file' && node.fileType) {
      const config = getFileTypeConfig(node.fileType)
      return config?.description || `${node.fileType} file`
    }
    return node.type === 'folder' ? 'Folder' : 'File'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 rounded-md border transition-colors
        ${isSelected ? 'bg-accent border-accent-foreground/20' : 'hover:bg-muted/50'}
        ${isDragging || isSortableDragging ? 'shadow-lg' : ''}
      `}
      onClick={() => !isEditing && onSelect(node.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">
        {getIcon()}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="truncate">
            <div className="text-sm font-medium truncate">{node.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {getFileTypeInfo()}
            </div>
          </div>
        )}
      </div>

      {/* File Type Badge */}
      {node.type === 'file' && node.fileType && !isEditing && (
        <div className="flex-shrink-0">
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
            .{node.fileType}
          </span>
        </div>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(node.id)
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}