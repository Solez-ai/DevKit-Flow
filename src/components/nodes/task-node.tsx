import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { BaseNode } from './base-node'
import { Checkbox } from '../ui/checkbox'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Clock, CheckCircle2 } from 'lucide-react'
import { calculateNodeCompletion } from '../../lib/node-utils'

interface TaskNodeProps {
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
  className?: string
}

export function TaskNode({
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
  className
}: TaskNodeProps) {
  const completion = calculateNodeCompletion(node)
  const todos = node.content.todos
  const completedTodos = todos.filter(todo => todo.completed)
  
  // Calculate estimated vs actual time
  const totalEstimated = todos.reduce((sum, todo) => sum + (todo.estimatedMinutes || 0), 0)
  const totalActual = todos.reduce((sum, todo) => sum + (todo.actualMinutes || 0), 0)

  const handleTodoToggle = (todoId: string) => {
    onTodoToggle?.(node.id, todoId)
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
        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedTodos.length}/{todos.length} completed
            </span>
            <span className="font-medium">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1" />
        </div>

        {/* Time tracking */}
        {(totalEstimated > 0 || totalActual > 0) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {totalEstimated > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Est: {totalEstimated}m</span>
              </div>
            )}
            {totalActual > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Actual: {totalActual}m</span>
              </div>
            )}
          </div>
        )}

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {todos.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              No todos yet
            </div>
          ) : (
            todos.slice(0, 5).map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleTodoToggle(todo.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-relaxed ${
                      todo.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {todo.text}
                  </p>
                  {(todo.estimatedMinutes || todo.actualMinutes) && (
                    <div className="flex items-center gap-2 mt-1">
                      {todo.estimatedMinutes && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {todo.estimatedMinutes}m est
                        </Badge>
                      )}
                      {todo.actualMinutes && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {todo.actualMinutes}m actual
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {todos.length > 5 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              +{todos.length - 5} more todos
            </div>
          )}
        </div>

        {/* Priority indicator */}
        {node.metadata.priority !== 3 && (
          <div className="flex justify-end">
            <Badge
              variant={node.metadata.priority <= 2 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              P{node.metadata.priority}
            </Badge>
          </div>
        )}
      </div>
    </BaseNode>
  )
}