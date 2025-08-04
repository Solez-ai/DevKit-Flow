import type { DevFlowNode, NodeStatus, Position, Size, TodoItem, CodeSnippet, Reference, Comment } from '../types'
import { generateId } from './utils'

/**
 * Utility functions for node manipulation
 */

/**
 * Update node position
 */
export function updateNodePosition(node: DevFlowNode, position: Position): DevFlowNode {
  return {
    ...node,
    position,
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update node size
 */
export function updateNodeSize(node: DevFlowNode, size: Size): DevFlowNode {
  return {
    ...node,
    size,
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update node status
 */
export function updateNodeStatus(node: DevFlowNode, status: NodeStatus): DevFlowNode {
  return {
    ...node,
    status,
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update node title
 */
export function updateNodeTitle(node: DevFlowNode, title: string): DevFlowNode {
  return {
    ...node,
    title: title.trim(),
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update node description
 */
export function updateNodeDescription(node: DevFlowNode, description: string): DevFlowNode {
  return {
    ...node,
    description: description.trim(),
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Add todo item to node
 */
export function addTodoToNode(node: DevFlowNode, text: string): DevFlowNode {
  const newTodo: TodoItem = {
    id: generateId(),
    text: text.trim(),
    completed: false
  }
  
  return {
    ...node,
    content: {
      ...node.content,
      todos: [...node.content.todos, newTodo]
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update todo item in node
 */
export function updateTodoInNode(node: DevFlowNode, todoId: string, updates: Partial<TodoItem>): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      todos: node.content.todos.map(todo =>
        todo.id === todoId
          ? { ...todo, ...updates }
          : todo
      )
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Remove todo item from node
 */
export function removeTodoFromNode(node: DevFlowNode, todoId: string): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      todos: node.content.todos.filter(todo => todo.id !== todoId)
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Toggle todo completion
 */
export function toggleTodoCompletion(node: DevFlowNode, todoId: string): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      todos: node.content.todos.map(todo =>
        todo.id === todoId
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date() : undefined
            }
          : todo
      )
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Add code snippet to node
 */
export function addCodeSnippetToNode(
  node: DevFlowNode,
  title: string,
  language: string,
  code: string
): DevFlowNode {
  const newSnippet: CodeSnippet = {
    id: generateId(),
    title: title.trim(),
    language: language.trim(),
    code: code.trim(),
    isTemplate: false,
    tags: []
  }
  
  return {
    ...node,
    content: {
      ...node.content,
      codeSnippets: [...node.content.codeSnippets, newSnippet]
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update code snippet in node
 */
export function updateCodeSnippetInNode(
  node: DevFlowNode,
  snippetId: string,
  updates: Partial<CodeSnippet>
): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      codeSnippets: node.content.codeSnippets.map(snippet =>
        snippet.id === snippetId
          ? { ...snippet, ...updates }
          : snippet
      )
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Remove code snippet from node
 */
export function removeCodeSnippetFromNode(node: DevFlowNode, snippetId: string): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      codeSnippets: node.content.codeSnippets.filter(snippet => snippet.id !== snippetId)
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Add reference to node
 */
export function addReferenceToNode(
  node: DevFlowNode,
  title: string,
  url?: string,
  type: Reference['type'] = 'documentation'
): DevFlowNode {
  const newReference: Reference = {
    id: generateId(),
    title: title.trim(),
    url: url?.trim(),
    type,
    importance: 'medium'
  }
  
  return {
    ...node,
    content: {
      ...node.content,
      references: [...node.content.references, newReference]
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update reference in node
 */
export function updateReferenceInNode(
  node: DevFlowNode,
  referenceId: string,
  updates: Partial<Reference>
): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      references: node.content.references.map(ref =>
        ref.id === referenceId
          ? { ...ref, ...updates }
          : ref
      )
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Remove reference from node
 */
export function removeReferenceFromNode(node: DevFlowNode, referenceId: string): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      references: node.content.references.filter(ref => ref.id !== referenceId)
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Add comment to node
 */
export function addCommentToNode(node: DevFlowNode, text: string, author?: string): DevFlowNode {
  const newComment: Comment = {
    id: generateId(),
    text: text.trim(),
    author,
    createdAt: new Date()
  }
  
  return {
    ...node,
    content: {
      ...node.content,
      comments: [...node.content.comments, newComment]
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Update comment in node
 */
export function updateCommentInNode(
  node: DevFlowNode,
  commentId: string,
  text: string
): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      comments: node.content.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, text: text.trim(), updatedAt: new Date() }
          : comment
      )
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Remove comment from node
 */
export function removeCommentFromNode(node: DevFlowNode, commentId: string): DevFlowNode {
  return {
    ...node,
    content: {
      ...node.content,
      comments: node.content.comments.filter(comment => comment.id !== commentId)
    },
    metadata: {
      ...node.metadata,
      updatedAt: new Date()
    }
  }
}

/**
 * Add tag to node
 */
export function addTagToNode(node: DevFlowNode, tag: string): DevFlowNode {
  const trimmedTag = tag.trim().toLowerCase()
  if (node.metadata.tags.includes(trimmedTag)) {
    return node
  }
  
  return {
    ...node,
    metadata: {
      ...node.metadata,
      tags: [...node.metadata.tags, trimmedTag],
      updatedAt: new Date()
    }
  }
}

/**
 * Remove tag from node
 */
export function removeTagFromNode(node: DevFlowNode, tag: string): DevFlowNode {
  return {
    ...node,
    metadata: {
      ...node.metadata,
      tags: node.metadata.tags.filter(t => t !== tag.trim().toLowerCase()),
      updatedAt: new Date()
    }
  }
}

/**
 * Update node priority
 */
export function updateNodePriority(node: DevFlowNode, priority: 1 | 2 | 3 | 4 | 5): DevFlowNode {
  return {
    ...node,
    metadata: {
      ...node.metadata,
      priority,
      updatedAt: new Date()
    }
  }
}

/**
 * Calculate node completion percentage
 */
export function calculateNodeCompletion(node: DevFlowNode): number {
  const todos = node.content.todos
  if (todos.length === 0) {
    return node.status === 'completed' ? 100 : 0
  }
  
  const completedTodos = todos.filter(todo => todo.completed).length
  return Math.round((completedTodos / todos.length) * 100)
}

/**
 * Check if node is empty (has no meaningful content)
 */
export function isNodeEmpty(node: DevFlowNode): boolean {
  const { todos, codeSnippets, references, comments } = node.content
  
  return (
    todos.length === 0 &&
    codeSnippets.length === 0 &&
    references.length === 0 &&
    comments.length === 0 &&
    (!node.description || node.description.trim() === '')
  )
}

/**
 * Get node content summary
 */
export function getNodeContentSummary(node: DevFlowNode): string {
  const parts: string[] = []
  
  if (node.content.todos.length > 0) {
    const completed = node.content.todos.filter(t => t.completed).length
    parts.push(`${completed}/${node.content.todos.length} todos`)
  }
  
  if (node.content.codeSnippets.length > 0) {
    parts.push(`${node.content.codeSnippets.length} code snippets`)
  }
  
  if (node.content.references.length > 0) {
    parts.push(`${node.content.references.length} references`)
  }
  
  if (node.content.comments.length > 0) {
    parts.push(`${node.content.comments.length} comments`)
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No content'
}

/**
 * Search within node content
 */
export function searchNodeContent(node: DevFlowNode, query: string): boolean {
  const searchText = query.toLowerCase()
  
  // Search in title and description
  if (node.title.toLowerCase().includes(searchText) ||
      node.description?.toLowerCase().includes(searchText)) {
    return true
  }
  
  // Search in todos
  if (node.content.todos.some(todo => todo.text.toLowerCase().includes(searchText))) {
    return true
  }
  
  // Search in code snippets
  if (node.content.codeSnippets.some(snippet =>
    snippet.title.toLowerCase().includes(searchText) ||
    snippet.code.toLowerCase().includes(searchText) ||
    snippet.description?.toLowerCase().includes(searchText)
  )) {
    return true
  }
  
  // Search in references
  if (node.content.references.some(ref =>
    ref.title.toLowerCase().includes(searchText) ||
    ref.description?.toLowerCase().includes(searchText)
  )) {
    return true
  }
  
  // Search in comments
  if (node.content.comments.some(comment =>
    comment.text.toLowerCase().includes(searchText)
  )) {
    return true
  }
  
  // Search in tags
  if (node.metadata.tags.some(tag => tag.includes(searchText))) {
    return true
  }
  
  return false
}

/**
 * Get nodes by status
 */
export function getNodesByStatus(nodes: DevFlowNode[], status: NodeStatus): DevFlowNode[] {
  return nodes.filter(node => node.status === status)
}

/**
 * Get nodes by type
 */
export function getNodesByType(nodes: DevFlowNode[], type: string): DevFlowNode[] {
  return nodes.filter(node => node.type === type)
}

/**
 * Sort nodes by priority
 */
export function sortNodesByPriority(nodes: DevFlowNode[]): DevFlowNode[] {
  return [...nodes].sort((a, b) => a.metadata.priority - b.metadata.priority)
}

/**
 * Sort nodes by creation date
 */
export function sortNodesByCreationDate(nodes: DevFlowNode[], ascending = true): DevFlowNode[] {
  return [...nodes].sort((a, b) => {
    const dateA = a.metadata.createdAt.getTime()
    const dateB = b.metadata.createdAt.getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

/**
 * Sort nodes by update date
 */
export function sortNodesByUpdateDate(nodes: DevFlowNode[], ascending = false): DevFlowNode[] {
  return [...nodes].sort((a, b) => {
    const dateA = a.metadata.updatedAt.getTime()
    const dateB = b.metadata.updatedAt.getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}