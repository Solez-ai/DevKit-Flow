import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { TaskNode } from './task-node'
import { CodeNode } from './code-node'
import { ReferenceNode } from './reference-node'
import { CommentNode } from './comment-node'
import { TemplateNode } from './template-node'

interface NodeRendererProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  onTodoToggle?: (nodeId: string, todoId: string) => void
  onCodeEdit?: (nodeId: string, snippetId: string) => void
  onReferenceOpen?: (nodeId: string, referenceId: string) => void
  onCommentEdit?: (nodeId: string, commentId: string) => void
  onTemplateApply?: (nodeId: string) => void
  onTemplateExport?: (nodeId: string) => void
  className?: string
}

export function NodeRenderer({
  node,
  isSelected,
  isResizing,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  onTodoToggle,
  onCodeEdit,
  onReferenceOpen,
  onCommentEdit,
  onTemplateApply,
  onTemplateExport,
  className
}: NodeRendererProps) {
  const commonProps = {
    node,
    isSelected,
    isResizing,
    onSelect,
    onStatusChange,
    onPositionChange,
    onSizeChange,
    onDelete,
    onDuplicate,
    className
  }

  switch (node.type) {
    case 'task':
      return (
        <TaskNode
          {...commonProps}
          onTodoToggle={onTodoToggle}
        />
      )
    
    case 'code':
      return (
        <CodeNode
          {...commonProps}
          onCodeEdit={onCodeEdit}
        />
      )
    
    case 'reference':
      return (
        <ReferenceNode
          {...commonProps}
          onReferenceOpen={onReferenceOpen}
        />
      )
    
    case 'comment':
      return (
        <CommentNode
          {...commonProps}
          onCommentEdit={onCommentEdit}
        />
      )
    
    case 'template':
      return (
        <TemplateNode
          {...commonProps}
          onTemplateApply={onTemplateApply}
          onTemplateExport={onTemplateExport}
        />
      )
    
    default:
      console.warn(`Unknown node type: ${node.type}`)
      return (
        <TaskNode
          {...commonProps}
          onTodoToggle={onTodoToggle}
        />
      )
  }
}