import { useState } from 'react'
import type { Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  X, 
  Edit2, 
  Check, 
  MessageSquare,
  User,
  Clock,
  Reply
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface CommentSystemProps {
  comments: Comment[]
  onAddComment?: (text: string, author?: string) => void
  onUpdateComment?: (commentId: string, text: string) => void
  onDeleteComment?: (commentId: string) => void
  className?: string
  maxHeight?: string
  currentUser?: string
}

export function CommentSystem({
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  className,
  maxHeight = "400px",
  currentUser
}: CommentSystemProps) {
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [newCommentAuthor, setNewCommentAuthor] = useState(currentUser || '')
  const [editText, setEditText] = useState('')

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment?.(newCommentText.trim(), newCommentAuthor.trim() || undefined)
      setNewCommentText('')
      setNewCommentAuthor(currentUser || '')
      setIsAddingComment(false)
    }
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditText(comment.text)
  }

  const handleSaveEdit = () => {
    if (editingComment && editText.trim()) {
      onUpdateComment?.(editingComment, editText.trim())
      setEditingComment(null)
      setEditText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditText('')
  }

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

  const formatCommentText = (text: string) => {
    // Simple rich text formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>') // Inline code
      .replace(/\n/g, '<br>') // Line breaks
  }

  // Sort comments by creation date (newest first)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="text-sm font-medium">Comments</h3>
          <Badge variant="outline" className="text-xs">
            {comments.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingComment(true)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add new comment form */}
      {isAddingComment && (
        <div className="space-y-3 p-3 border rounded-md">
          <div className="flex gap-2">
            <Input
              placeholder="Your name (optional)"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              className="w-32 h-8 text-sm"
            />
            <div className="text-xs text-muted-foreground self-center">
              Use **bold**, *italic*, `code` for formatting
            </div>
          </div>

          <Textarea
            placeholder="Write your comment... (supports **bold**, *italic*, `code`)"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="min-h-20 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleAddComment()
              }
            }}
          />

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Ctrl+Enter to submit
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingComment(false)
                  setNewCommentText('')
                  setNewCommentAuthor(currentUser || '')
                }}
                className="h-7"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="h-7"
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div 
        className="space-y-3 overflow-y-auto"
        style={{ maxHeight }}
      >
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet. Click the + button to add one.
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
            >
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-20 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        handleSaveEdit()
                      } else if (e.key === 'Escape') {
                        handleCancelEdit()
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Ctrl+Enter to save, Esc to cancel
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editText.trim()}
                        className="h-7"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Comment header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comment.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{comment.author}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs" title={formatDate(comment.createdAt)}>
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {comment.updatedAt && comment.updatedAt > comment.createdAt && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          edited
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditComment(comment)}
                        className="h-6 w-6 p-0"
                        title="Edit comment"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteComment?.(comment.id)}
                        className="h-6 w-6 p-0 text-red-600"
                        title="Delete comment"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Comment content */}
                  <div 
                    className="text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatCommentText(comment.text) 
                    }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formatting help */}
      {(isAddingComment || editingComment) && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border">
          <strong>Formatting:</strong> **bold**, *italic*, `code`
        </div>
      )}
    </div>
  )
}