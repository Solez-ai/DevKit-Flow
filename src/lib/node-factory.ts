import type { DevFlowNode, NodeType, NodeStatus, Position, Size, NodeContent } from '../types'
import { generateId } from './utils'

/**
 * Factory functions for creating different types of DevFlow nodes
 */

interface CreateNodeOptions {
  title: string
  description?: string
  position?: Position
  size?: Size
  status?: NodeStatus
}

/**
 * Base node factory function
 */
export function createBaseNode(
  type: NodeType,
  options: CreateNodeOptions
): DevFlowNode {
  const now = new Date()
  
  return {
    id: generateId(),
    type,
    title: options.title,
    description: options.description,
    position: options.position || { x: 0, y: 0 },
    size: options.size || getDefaultSize(type),
    status: options.status || 'idle',
    content: createEmptyContent(),
    metadata: {
      createdAt: now,
      updatedAt: now,
      priority: 3,
      tags: []
    }
  }
}

/**
 * Create a task node with default todo structure
 */
export function createTaskNode(options: CreateNodeOptions): DevFlowNode {
  const node = createBaseNode('task', options)
  
  // Add a default todo item for task nodes
  node.content.todos = [
    {
      id: generateId(),
      text: 'New task',
      completed: false
    }
  ]
  
  return node
}

/**
 * Create a code node with default code snippet
 */
export function createCodeNode(options: CreateNodeOptions & { language?: string }): DevFlowNode {
  const node = createBaseNode('code', options)
  
  // Add a default code snippet
  node.content.codeSnippets = [
    {
      id: generateId(),
      title: 'Code snippet',
      language: options.language || 'javascript',
      code: '// Add your code here',
      isTemplate: false,
      tags: []
    }
  ]
  
  return node
}

/**
 * Create a reference node with default reference
 */
export function createReferenceNode(options: CreateNodeOptions & { url?: string }): DevFlowNode {
  const node = createBaseNode('reference', options)
  
  // Add a default reference
  node.content.references = [
    {
      id: generateId(),
      title: options.title,
      url: options.url,
      type: 'documentation',
      importance: 'medium'
    }
  ]
  
  return node
}

/**
 * Create a comment node with default comment
 */
export function createCommentNode(options: CreateNodeOptions): DevFlowNode {
  const node = createBaseNode('comment', options)
  
  // Add a default comment
  node.content.comments = [
    {
      id: generateId(),
      text: options.description || 'Add your comment here',
      createdAt: new Date()
    }
  ]
  
  return node
}

/**
 * Create a template node
 */
export function createTemplateNode(options: CreateNodeOptions): DevFlowNode {
  return createBaseNode('template', options)
}

/**
 * Create a file node with file structure data
 */
export function createFileNode(options: CreateNodeOptions & { 
  fileName?: string
  fileType?: string
  path?: string
}): DevFlowNode {
  const node = createBaseNode('file', options)
  
  // Add file-specific metadata
  node.metadata.tags = [options.fileType || 'file']
  
  return node
}

/**
 * Create a folder node with folder structure data
 */
export function createFolderNode(options: CreateNodeOptions & { 
  folderName?: string
  path?: string
}): DevFlowNode {
  const node = createBaseNode('folder', options)
  
  // Add folder-specific metadata
  node.metadata.tags = ['folder']
  
  return node
}

/**
 * Node factory function that creates the appropriate node type
 */
export function createNode(type: NodeType, options: CreateNodeOptions): DevFlowNode {
  switch (type) {
    case 'task':
      return createTaskNode(options)
    case 'code':
      return createCodeNode(options)
    case 'reference':
      return createReferenceNode(options)
    case 'comment':
      return createCommentNode(options)
    case 'template':
      return createTemplateNode(options)
    case 'file':
      return createFileNode(options)
    case 'folder':
      return createFolderNode(options)
    default:
      throw new Error(`Unknown node type: ${type}`)
  }
}

/**
 * Create empty node content structure
 */
function createEmptyContent(): NodeContent {
  return {
    todos: [],
    codeSnippets: [],
    references: [],
    comments: []
  }
}

/**
 * Get default size for different node types
 */
function getDefaultSize(type: NodeType): Size {
  const defaultSizes: Record<NodeType, Size> = {
    task: { width: 300, height: 200 },
    code: { width: 400, height: 300 },
    reference: { width: 280, height: 150 },
    comment: { width: 250, height: 120 },
    template: { width: 320, height: 180 },
    file: { width: 260, height: 140 },
    folder: { width: 280, height: 160 },
    component: { width: 350, height: 250 }
  }
  
  return defaultSizes[type]
}

/**
 * Clone a node with a new ID
 */
export function cloneNode(node: DevFlowNode, options?: Partial<CreateNodeOptions>): DevFlowNode {
  const cloned: DevFlowNode = {
    ...node,
    id: generateId(),
    title: options?.title || `${node.title} (Copy)`,
    description: options?.description || node.description,
    position: options?.position || { x: node.position.x + 20, y: node.position.y + 20 },
    size: options?.size || node.size,
    status: options?.status || 'idle',
    content: {
      todos: node.content.todos.map(todo => ({
        ...todo,
        id: generateId(),
        completed: false,
        completedAt: undefined
      })),
      codeSnippets: node.content.codeSnippets.map(snippet => ({
        ...snippet,
        id: generateId()
      })),
      references: node.content.references.map(ref => ({
        ...ref,
        id: generateId()
      })),
      comments: node.content.comments.map(comment => ({
        ...comment,
        id: generateId(),
        createdAt: new Date()
      }))
    },
    metadata: {
      ...node.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  return cloned
}

/**
 * Create multiple nodes from a template
 */
export function createNodesFromTemplate(
  template: { nodes: Partial<DevFlowNode>[], connections?: any[] },
  basePosition: Position = { x: 0, y: 0 }
): DevFlowNode[] {
  return template.nodes.map((nodeTemplate, index) => {
    const position = {
      x: basePosition.x + (index % 3) * 350,
      y: basePosition.y + Math.floor(index / 3) * 250
    }
    
    return createNode(nodeTemplate.type || 'task', {
      title: nodeTemplate.title || 'Untitled Node',
      description: nodeTemplate.description,
      position,
      size: nodeTemplate.size,
      status: nodeTemplate.status
    })
  })
}