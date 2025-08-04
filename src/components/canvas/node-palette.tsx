import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Code, 
  Link, 
  MessageSquare, 
  File,
  Plus,
  Grip
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NodeType } from '@/types'

interface NodePaletteItem {
  type: NodeType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const nodeTypes: NodePaletteItem[] = [
  {
    type: 'task',
    label: 'Task Node',
    description: 'Track todos and progress',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    type: 'code',
    label: 'Code Node',
    description: 'Store code snippets',
    icon: Code,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  {
    type: 'reference',
    label: 'Reference Node',
    description: 'External links and docs',
    icon: Link,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  },
  {
    type: 'comment',
    label: 'Comment Node',
    description: 'Notes and observations',
    icon: MessageSquare,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
  },
  {
    type: 'template',
    label: 'Template Node',
    description: 'Reusable patterns',
    icon: File,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
  }
]

interface NodePaletteProps {
  className?: string
}

export function NodePalette({ className }: NodePaletteProps) {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleAddNode = useCallback((nodeType: NodeType) => {
    // This could trigger a different method for adding nodes programmatically
    console.log('Add node:', nodeType)
  }, [])

  return (
    <Card className={cn('w-80 h-fit', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Node Palette
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag nodes onto the canvas or click to add
        </p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon
          
          return (
            <div
              key={nodeType.type}
              className={cn(
                'group relative p-3 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing transition-all duration-200',
                nodeType.bgColor
              )}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType.type)}
              onClick={() => handleAddNode(nodeType.type)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-md bg-white/80 border',
                  nodeType.color
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{nodeType.label}</h3>
                    <Badge variant="outline" className="text-xs">
                      {nodeType.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {nodeType.description}
                  </p>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Grip className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )
        })}
        
        <Separator className="my-4" />
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tip:</strong> Drag nodes from here to the canvas</p>
          <p>⌨️ <strong>Shortcut:</strong> Ctrl+N for quick node creation</p>
        </div>
      </CardContent>
    </Card>
  )
}