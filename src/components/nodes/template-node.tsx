import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { BaseNode } from './base-node'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { File, Copy, Download, Star } from 'lucide-react'

interface TemplateNodeProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  onTemplateApply?: (nodeId: string) => void
  onTemplateExport?: (nodeId: string) => void
  className?: string
}

export function TemplateNode({
  node,
  isSelected,
  isResizing,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  onTemplateApply,
  onTemplateExport,
  className
}: TemplateNodeProps) {
  const { todos, codeSnippets, references, comments } = node.content
  
  // Calculate template content summary
  const contentSummary = [
    todos.length > 0 && `${todos.length} todo${todos.length !== 1 ? 's' : ''}`,
    codeSnippets.length > 0 && `${codeSnippets.length} code snippet${codeSnippets.length !== 1 ? 's' : ''}`,
    references.length > 0 && `${references.length} reference${references.length !== 1 ? 's' : ''}`,
    comments.length > 0 && `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
  ].filter(Boolean)

  const handleApplyTemplate = () => {
    onTemplateApply?.(node.id)
  }

  const handleExportTemplate = () => {
    onTemplateExport?.(node.id)
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
        {/* Template header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Template</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              P{node.metadata.priority}
            </span>
          </div>
        </div>

        {/* Template content summary */}
        <div className="flex-1 space-y-3">
          {contentSummary.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Contains:</h4>
              <div className="space-y-1">
                {contentSummary.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                    <span className="text-xs text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-4">
              Empty template
            </div>
          )}

          {/* Template tags */}
          {node.metadata.tags.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {node.metadata.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
                {node.metadata.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    +{node.metadata.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Template description */}
          {node.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground">Description:</h4>
              <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                {node.description}
              </p>
            </div>
          )}
        </div>

        {/* Template actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={handleApplyTemplate}
            disabled={contentSummary.length === 0}
          >
            <Copy className="h-3 w-3 mr-1" />
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={handleExportTemplate}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>

        {/* Template metadata */}
        <div className="text-xs text-muted-foreground text-center">
          Created {new Date(node.metadata.createdAt).toLocaleDateString()}
        </div>
      </div>
    </BaseNode>
  )
}