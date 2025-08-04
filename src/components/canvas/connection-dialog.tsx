import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  GitBranch, 
  Link, 
  Ban,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConnectionType, NodeConnection } from '@/types'

interface ConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connection?: NodeConnection | null
  sourceNodeTitle?: string
  targetNodeTitle?: string
  onSave: (connectionData: Partial<NodeConnection>) => void
  onDelete?: () => void
}

const connectionTypeConfig = {
  dependency: {
    icon: ArrowRight,
    label: 'Dependency',
    description: 'Target depends on source completion',
    color: 'blue',
    defaultLabel: 'depends on'
  },
  sequence: {
    icon: GitBranch,
    label: 'Sequence',
    description: 'Target follows source in order',
    color: 'green',
    defaultLabel: 'then'
  },
  reference: {
    icon: Link,
    label: 'Reference',
    description: 'Target references source information',
    color: 'purple',
    defaultLabel: 'references'
  },
  blocks: {
    icon: Ban,
    label: 'Blocks',
    description: 'Source blocks target from proceeding',
    color: 'red',
    defaultLabel: 'blocks'
  }
}

export function ConnectionDialog({
  open,
  onOpenChange,
  connection,
  sourceNodeTitle,
  targetNodeTitle,
  onSave,
  onDelete
}: ConnectionDialogProps) {
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    connection?.type || 'dependency'
  )
  const [label, setLabel] = useState(
    connection?.label || connectionTypeConfig[connection?.type || 'dependency'].defaultLabel
  )


  const isEditing = !!connection

  const handleSave = useCallback(() => {
    const connectionData: Partial<NodeConnection> = {
      type: connectionType,
      label: label.trim() || connectionTypeConfig[connectionType].defaultLabel,
      style: {
        strokeColor: getConnectionColor(connectionType),
        strokeWidth: connectionType === 'reference' ? 1.5 : 2,
        strokeDasharray: getConnectionDashArray(connectionType)
      }
    }

    onSave(connectionData)
    onOpenChange(false)
  }, [connectionType, label, onSave, onOpenChange])

  const handleTypeChange = useCallback((newType: ConnectionType) => {
    setConnectionType(newType)
    // Update label to default if it matches the previous type's default
    if (label === connectionTypeConfig[connectionType].defaultLabel) {
      setLabel(connectionTypeConfig[newType].defaultLabel)
    }
  }, [connectionType, label])

  const getConnectionColor = (type: ConnectionType): string => {
    const colors = {
      dependency: '#3b82f6',
      sequence: '#10b981',
      reference: '#8b5cf6',
      blocks: '#ef4444'
    }
    return colors[type]
  }

  const getConnectionDashArray = (type: ConnectionType): string | undefined => {
    return type === 'sequence' ? '5,5' : type === 'reference' ? '2,2' : undefined
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Connection' : 'Create Connection'}
          </DialogTitle>
          <DialogDescription>
            {sourceNodeTitle && targetNodeTitle && (
              <span className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{sourceNodeTitle}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{targetNodeTitle}</Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="connection-type">Connection Type</Label>
            <Select value={connectionType} onValueChange={handleTypeChange}>
              <SelectTrigger id="connection-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(connectionTypeConfig).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            
            {/* Type Description */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {connectionTypeConfig[connectionType].description}
              </p>
            </div>
          </div>

          {/* Connection Label */}
          <div className="space-y-2">
            <Label htmlFor="connection-label">Label (optional)</Label>
            <Input
              id="connection-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={connectionTypeConfig[connectionType].defaultLabel}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default label for this connection type
            </p>
          </div>

          {/* Visual Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center justify-center p-4 border rounded-md bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center text-xs">
                  Source
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-0.5 rounded"
                    style={{
                      backgroundColor: getConnectionColor(connectionType),
                      backgroundImage: getConnectionDashArray(connectionType) 
                        ? `repeating-linear-gradient(to right, ${getConnectionColor(connectionType)} 0, ${getConnectionColor(connectionType)} 3px, transparent 3px, transparent 6px)`
                        : undefined
                    }}
                  />
                  <ArrowRight 
                    className="h-3 w-3" 
                    style={{ color: getConnectionColor(connectionType) }}
                  />
                </div>
                <div className="w-16 h-8 bg-green-100 border border-green-200 rounded flex items-center justify-center text-xs">
                  Target
                </div>
              </div>
            </div>
            <div className="text-center">
              <Badge 
                variant="secondary"
                className={cn(
                  'text-xs',
                  connectionType === 'dependency' && 'border-blue-200 text-blue-700',
                  connectionType === 'sequence' && 'border-green-200 text-green-700',
                  connectionType === 'reference' && 'border-purple-200 text-purple-700',
                  connectionType === 'blocks' && 'border-red-200 text-red-700'
                )}
              >
                {label || connectionTypeConfig[connectionType].defaultLabel}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {isEditing && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete()
                  onOpenChange(false)
                }}
              >
                Delete Connection
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditing ? 'Update' : 'Create'} Connection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}