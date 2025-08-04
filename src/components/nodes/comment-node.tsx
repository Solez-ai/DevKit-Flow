import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { BaseNode } from './base-node'
import { Badge } from '../ui/badge'
import { MessageSquare, User, Clock } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface CommentNodeProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  onCommentEdit?: (nodeId: string, commentId: string) => void
  className?: string
}

export function CommentNode({
  node,
  isSelected,
  isResizing,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  onCommentEdit,
  className
}: CommentNodeProps) {
  const comments = node.content.comments
  const primaryComment = comments[0]

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return formatDate(date)
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
        {/* Comments count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>
          {primaryComment && (
            <Badge variant="outline" className="text-xs">
              {getTimeAgo(primaryComment.createdAt)}
            </Badge>
          )}
        </div>

        {/* Primary comment */}
        {primaryComment ? (
          <div className="flex-1 overflow-hidden">
            <div className="space-y-2">
              {/* Comment header */}
              <div className="flex items-center gap-2">
                {primaryComment.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{primaryComment.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{getTimeAgo(primaryComment.createdAt)}</span>
                </div>
                {primaryComment.updatedAt && primaryComment.updatedAt > primaryComment.createdAt && (
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                    edited
                  </Badge>
                )}
              </div>

              {/* Comment content */}
              <div 
                className="text-xs leading-relaxed text-foreground cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                onClick={() => onCommentEdit?.(node.id, primaryComment.id)}
                title="Click to edit"
              >
                <div className="whitespace-pre-wrap line-clamp-6">
                  {primaryComment.text}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            No comments
          </div>
        )}

        {/* Additional comments */}
        {comments.length > 1 && (
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {comments.slice(1, 3).map((comment) => (
              <div 
                key={comment.id} 
                className="p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors border-l-2 border-muted"
                onClick={() => onCommentEdit?.(node.id, comment.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {comment.author && (
                    <span className="text-xs font-medium">{comment.author}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Additional comments indicator */}
        {comments.length > 3 && (
          <div className="text-xs text-muted-foreground text-center py-1 border-t">
            +{comments.length - 3} more comment{comments.length - 3 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </BaseNode>
  )
}