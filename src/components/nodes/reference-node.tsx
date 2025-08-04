import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { BaseNode } from './base-node'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ExternalLink, FileText, Video, BookOpen, Link2, Star } from 'lucide-react'

interface ReferenceNodeProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  onReferenceOpen?: (nodeId: string, referenceId: string) => void
  className?: string
}

export function ReferenceNode({
  node,
  isSelected,
  isResizing,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  onReferenceOpen,
  className
}: ReferenceNodeProps) {
  const references = node.content.references
  const primaryReference = references[0]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return <BookOpen className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'internal':
        return <Link2 className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'documentation':
        return 'bg-blue-100 text-blue-800'
      case 'article':
        return 'bg-green-100 text-green-800'
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'internal':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleReferenceClick = (referenceId: string, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    onReferenceOpen?.(node.id, referenceId)
  }

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      isResizing={isResizing}
      onSelect={onSelect}
      onStatusChange={onStatusChange}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      className={className}
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* References count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {references.length} reference{references.length !== 1 ? 's' : ''}
            </span>
          </div>
          {primaryReference && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getTypeColor(primaryReference.type)}`}
            >
              {primaryReference.type}
            </Badge>
          )}
        </div>

        {/* Primary reference */}
        {primaryReference ? (
          <div className="flex-1 overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getTypeIcon(primaryReference.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="text-sm font-medium leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                    title={primaryReference.title}
                    onClick={() => handleReferenceClick(primaryReference.id, primaryReference.url)}
                  >
                    {primaryReference.title}
                  </h4>
                  
                  {primaryReference.url && (
                    <p className="text-xs text-muted-foreground truncate mt-1" title={primaryReference.url}>
                      {primaryReference.url}
                    </p>
                  )}
                  
                  {primaryReference.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                      {primaryReference.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`flex items-center gap-1 ${getImportanceColor(primaryReference.importance)}`}>
                    <Star className="h-3 w-3" />
                    <span className="text-xs capitalize">{primaryReference.importance}</span>
                  </div>
                  {primaryReference.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleReferenceClick(primaryReference.id, primaryReference.url)}
                      title="Open link"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            No references
          </div>
        )}

        {/* Additional references */}
        {references.length > 1 && (
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {references.slice(1, 3).map((ref) => (
              <div 
                key={ref.id} 
                className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleReferenceClick(ref.id, ref.url)}
              >
                <div className="text-muted-foreground">
                  {getTypeIcon(ref.type)}
                </div>
                <span className="text-xs truncate flex-1" title={ref.title}>
                  {ref.title}
                </span>
                <div className={`${getImportanceColor(ref.importance)}`}>
                  <Star className="h-2 w-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional references indicator */}
        {references.length > 3 && (
          <div className="text-xs text-muted-foreground text-center py-1 border-t">
            +{references.length - 3} more reference{references.length - 3 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </BaseNode>
  )
}