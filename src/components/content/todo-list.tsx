import React, { useState } from 'react'
import type { TodoItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Clock, Edit2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TodoListProps {
  todos: TodoItem[]
  onAddTodo?: (text: string) => void
  onUpdateTodo?: (todoId: string, updates: Partial<TodoItem>) => void
  onDeleteTodo?: (todoId: string) => void
  onToggleTodo?: (todoId: string) => void
  className?: string
  maxHeight?: string
}

export function TodoList({
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleTodo,
  className,
  maxHeight = "300px"
}: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState('')
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isAddingTodo, setIsAddingTodo] = useState(false)

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo?.(newTodoText.trim())
      setNewTodoText('')
      setIsAddingTodo(false)
    }
  }

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo.id)
    setEditText(todo.text)
  }

  const handleSaveEdit = () => {
    if (editingTodo && editText.trim()) {
      onUpdateTodo?.(editingTodo, { text: editText.trim() })
      setEditingTodo(null)
      setEditText('')
    }
  }

  const handleCancelEdit = () => {
    setEditingTodo(null)
    setEditText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    } else if (e.key === 'Escape') {
      if (editingTodo) {
        handleCancelEdit()
      } else {
        setIsAddingTodo(false)
        setNewTodoText('')
      }
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalEstimated = todos.reduce((sum, todo) => sum + (todo.estimatedMinutes || 0), 0)
  const totalActual = todos.reduce((sum, todo) => sum + (todo.actualMinutes || 0), 0)

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Todo List</h3>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{todos.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingTodo(true)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Time tracking summary */}
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
              <Check className="h-3 w-3" />
              <span>Actual: {totalActual}m</span>
            </div>
          )}
        </div>
      )}

      {/* Add new todo */}
      {isAddingTodo && (
        <div className="flex items-center gap-2 p-2 border rounded-md">
          <Input
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Enter todo text..."
            className="flex-1 h-8"
            onKeyDown={(e) => handleKeyPress(e, handleAddTodo)}
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTodo}
            className="h-6 w-6 p-0"
            disabled={!newTodoText.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddingTodo(false)
              setNewTodoText('')
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Todo list */}
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight }}
      >
        {todos.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No todos yet. Click the + button to add one.
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-start gap-2 p-2 rounded-md border transition-colors",
                todo.completed ? "bg-muted/50" : "hover:bg-muted/50"
              )}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggleTodo?.(todo.id)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                {editingTodo === todo.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 h-7 text-sm"
                      onKeyDown={(e) => handleKeyPress(e, handleSaveEdit)}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p
                      className={cn(
                        "text-sm leading-relaxed cursor-pointer",
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      )}
                      onClick={() => handleEditTodo(todo)}
                    >
                      {todo.text}
                    </p>
                    
                    {/* Time tracking and completion info */}
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
                      {todo.completedAt && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          Completed {new Date(todo.completedAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {editingTodo !== todo.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTodo(todo)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTodo?.(todo.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}