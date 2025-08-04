import type { DevFlowNode, NodeType, NodeStatus, TodoItem, CodeSnippet, Reference, Comment } from '../types'

/**
 * Validation schemas and functions for DevFlow nodes
 */

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

/**
 * Validate a DevFlow node
 */
export function validateNode(node: DevFlowNode): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // Validate required fields
  if (!node.id || node.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Node ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!node.title || node.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Node title is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  // Validate node type
  if (!isValidNodeType(node.type)) {
    errors.push({
      field: 'type',
      message: `Invalid node type: ${node.type}`,
      code: 'INVALID_TYPE'
    })
  }
  
  // Validate node status
  if (!isValidNodeStatus(node.status)) {
    errors.push({
      field: 'status',
      message: `Invalid node status: ${node.status}`,
      code: 'INVALID_STATUS'
    })
  }
  
  // Validate position
  if (!isValidPosition(node.position)) {
    errors.push({
      field: 'position',
      message: 'Invalid position coordinates',
      code: 'INVALID_POSITION'
    })
  }
  
  // Validate size
  if (!isValidSize(node.size)) {
    errors.push({
      field: 'size',
      message: 'Invalid size dimensions',
      code: 'INVALID_SIZE'
    })
  }
  
  // Validate content based on node type
  const contentValidation = validateNodeContent(node.type, node.content)
  errors.push(...contentValidation.errors)
  warnings.push(...contentValidation.warnings)
  
  // Validate metadata
  const metadataValidation = validateNodeMetadata(node.metadata)
  errors.push(...metadataValidation.errors)
  warnings.push(...metadataValidation.warnings)
  
  // Type-specific validations
  const typeValidation = validateNodeByType(node)
  errors.push(...typeValidation.errors)
  warnings.push(...typeValidation.warnings)
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate node content based on type
 */
function validateNodeContent(_type: NodeType, content: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!content) {
    errors.push({
      field: 'content',
      message: 'Node content is required',
      code: 'REQUIRED_FIELD'
    })
    return { isValid: false, errors, warnings }
  }
  
  // Validate todos
  if (content.todos) {
    content.todos.forEach((todo: TodoItem, index: number) => {
      const todoValidation = validateTodoItem(todo)
      todoValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `content.todos[${index}].${error.field}`
        })
      })
    })
  }
  
  // Validate code snippets
  if (content.codeSnippets) {
    content.codeSnippets.forEach((snippet: CodeSnippet, index: number) => {
      const snippetValidation = validateCodeSnippet(snippet)
      snippetValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `content.codeSnippets[${index}].${error.field}`
        })
      })
    })
  }
  
  // Validate references
  if (content.references) {
    content.references.forEach((reference: Reference, index: number) => {
      const refValidation = validateReference(reference)
      refValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `content.references[${index}].${error.field}`
        })
      })
    })
  }
  
  // Validate comments
  if (content.comments) {
    content.comments.forEach((comment: Comment, index: number) => {
      const commentValidation = validateComment(comment)
      commentValidation.errors.forEach(error => {
        errors.push({
          ...error,
          field: `content.comments[${index}].${error.field}`
        })
      })
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validate todo item
 */
function validateTodoItem(todo: TodoItem): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!todo.id) {
    errors.push({
      field: 'id',
      message: 'Todo ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!todo.text || todo.text.trim() === '') {
    errors.push({
      field: 'text',
      message: 'Todo text is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (typeof todo.completed !== 'boolean') {
    errors.push({
      field: 'completed',
      message: 'Todo completed must be a boolean',
      code: 'INVALID_TYPE'
    })
  }
  
  if (todo.estimatedMinutes !== undefined && (todo.estimatedMinutes < 0 || !Number.isInteger(todo.estimatedMinutes))) {
    errors.push({
      field: 'estimatedMinutes',
      message: 'Estimated minutes must be a positive integer',
      code: 'INVALID_VALUE'
    })
  }
  
  if (todo.actualMinutes !== undefined && (todo.actualMinutes < 0 || !Number.isInteger(todo.actualMinutes))) {
    errors.push({
      field: 'actualMinutes',
      message: 'Actual minutes must be a positive integer',
      code: 'INVALID_VALUE'
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validate code snippet
 */
function validateCodeSnippet(snippet: CodeSnippet): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!snippet.id) {
    errors.push({
      field: 'id',
      message: 'Code snippet ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!snippet.title || snippet.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Code snippet title is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!snippet.language || snippet.language.trim() === '') {
    warnings.push({
      field: 'language',
      message: 'Code snippet language is recommended',
      code: 'MISSING_RECOMMENDED'
    })
  }
  
  if (!snippet.code || snippet.code.trim() === '') {
    warnings.push({
      field: 'code',
      message: 'Code snippet is empty',
      code: 'EMPTY_CONTENT'
    })
  }
  
  if (typeof snippet.isTemplate !== 'boolean') {
    errors.push({
      field: 'isTemplate',
      message: 'isTemplate must be a boolean',
      code: 'INVALID_TYPE'
    })
  }
  
  if (!Array.isArray(snippet.tags)) {
    errors.push({
      field: 'tags',
      message: 'Tags must be an array',
      code: 'INVALID_TYPE'
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validate reference
 */
function validateReference(reference: Reference): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!reference.id) {
    errors.push({
      field: 'id',
      message: 'Reference ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!reference.title || reference.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Reference title is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (reference.url && !isValidUrl(reference.url)) {
    errors.push({
      field: 'url',
      message: 'Invalid URL format',
      code: 'INVALID_URL'
    })
  }
  
  const validTypes = ['documentation', 'article', 'video', 'internal']
  if (!validTypes.includes(reference.type)) {
    errors.push({
      field: 'type',
      message: `Invalid reference type: ${reference.type}`,
      code: 'INVALID_TYPE'
    })
  }
  
  const validImportance = ['low', 'medium', 'high']
  if (!validImportance.includes(reference.importance)) {
    errors.push({
      field: 'importance',
      message: `Invalid importance level: ${reference.importance}`,
      code: 'INVALID_VALUE'
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validate comment
 */
function validateComment(comment: Comment): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!comment.id) {
    errors.push({
      field: 'id',
      message: 'Comment ID is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!comment.text || comment.text.trim() === '') {
    errors.push({
      field: 'text',
      message: 'Comment text is required',
      code: 'REQUIRED_FIELD'
    })
  }
  
  if (!comment.createdAt || !(comment.createdAt instanceof Date)) {
    errors.push({
      field: 'createdAt',
      message: 'Comment createdAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }
  
  if (comment.updatedAt && !(comment.updatedAt instanceof Date)) {
    errors.push({
      field: 'updatedAt',
      message: 'Comment updatedAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Validate node metadata
 */
function validateNodeMetadata(metadata: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  if (!metadata) {
    errors.push({
      field: 'metadata',
      message: 'Node metadata is required',
      code: 'REQUIRED_FIELD'
    })
    return { isValid: false, errors, warnings }
  }
  
  if (!metadata.createdAt || !(metadata.createdAt instanceof Date)) {
    errors.push({
      field: 'metadata.createdAt',
      message: 'createdAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }
  
  if (!metadata.updatedAt || !(metadata.updatedAt instanceof Date)) {
    errors.push({
      field: 'metadata.updatedAt',
      message: 'updatedAt must be a valid Date',
      code: 'INVALID_DATE'
    })
  }
  
  if (metadata.priority !== undefined && (metadata.priority < 1 || metadata.priority > 5 || !Number.isInteger(metadata.priority))) {
    errors.push({
      field: 'metadata.priority',
      message: 'Priority must be an integer between 1 and 5',
      code: 'INVALID_VALUE'
    })
  }
  
  if (!Array.isArray(metadata.tags)) {
    errors.push({
      field: 'metadata.tags',
      message: 'Tags must be an array',
      code: 'INVALID_TYPE'
    })
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Type-specific node validation
 */
function validateNodeByType(node: DevFlowNode): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  switch (node.type) {
    case 'task':
      if (!node.content.todos || node.content.todos.length === 0) {
        warnings.push({
          field: 'content.todos',
          message: 'Task nodes should have at least one todo item',
          code: 'MISSING_CONTENT'
        })
      }
      break
      
    case 'code':
      if (!node.content.codeSnippets || node.content.codeSnippets.length === 0) {
        warnings.push({
          field: 'content.codeSnippets',
          message: 'Code nodes should have at least one code snippet',
          code: 'MISSING_CONTENT'
        })
      }
      break
      
    case 'reference':
      if (!node.content.references || node.content.references.length === 0) {
        warnings.push({
          field: 'content.references',
          message: 'Reference nodes should have at least one reference',
          code: 'MISSING_CONTENT'
        })
      }
      break
      
    case 'comment':
      if (!node.content.comments || node.content.comments.length === 0) {
        warnings.push({
          field: 'content.comments',
          message: 'Comment nodes should have at least one comment',
          code: 'MISSING_CONTENT'
        })
      }
      break
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Helper validation functions
 */
function isValidNodeType(type: any): type is NodeType {
  return ['task', 'code', 'reference', 'comment', 'template'].includes(type)
}

function isValidNodeStatus(status: any): status is NodeStatus {
  return ['idle', 'active', 'completed', 'blocked'].includes(status)
}

function isValidPosition(position: any): boolean {
  return position && 
         typeof position.x === 'number' && 
         typeof position.y === 'number' &&
         !isNaN(position.x) && 
         !isNaN(position.y)
}

function isValidSize(size: any): boolean {
  return size && 
         typeof size.width === 'number' && 
         typeof size.height === 'number' &&
         size.width > 0 && 
         size.height > 0 &&
         !isNaN(size.width) && 
         !isNaN(size.height)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize node data
 */
export function sanitizeNode(node: DevFlowNode): DevFlowNode {
  return {
    ...node,
    title: node.title.trim(),
    description: node.description?.trim(),
    content: {
      todos: node.content.todos.map(todo => ({
        ...todo,
        text: todo.text.trim()
      })),
      codeSnippets: node.content.codeSnippets.map(snippet => ({
        ...snippet,
        title: snippet.title.trim(),
        code: snippet.code.trim(),
        language: snippet.language.trim()
      })),
      references: node.content.references.map(ref => ({
        ...ref,
        title: ref.title.trim(),
        url: ref.url?.trim()
      })),
      comments: node.content.comments.map(comment => ({
        ...comment,
        text: comment.text.trim()
      }))
    }
  }
}