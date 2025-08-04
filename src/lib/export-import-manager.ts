/**
 * Session export/import system with multiple formats and conflict resolution
 */

import { sessionManager } from './session-manager'
import { templateManager } from './template-manager'
import { generateId } from './utils'
import type { 
  DevFlowSession, 
  SessionTemplate, 
  ExportOptions,
  ImportResult,
  DevFlowNode
} from '@/types'

export interface ExportData {
  sessions?: DevFlowSession[]
  templates?: SessionTemplate[]
  metadata: {
    exportedAt: string
    version: string
    format: string
    includeCompleted: boolean
    includeCodeSnippets: boolean
    includeTimestamps: boolean
    includeConnectionMetadata: boolean
  }
}

export interface ImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'skip'
  handleConflicts: 'auto' | 'prompt' | 'skip'
  preserveIds: boolean
  updateExisting: boolean
}

export interface ConflictResolution {
  type: 'session' | 'template'
  conflictId: string
  existingItem: DevFlowSession | SessionTemplate
  newItem: DevFlowSession | SessionTemplate
  resolution: 'keep_existing' | 'replace' | 'merge' | 'rename'
  newName?: string
}

class ExportImportManager {
  private initialized = false

  /**
   * Initialize the export/import manager
   */
  async init(): Promise<void> {
    if (this.initialized) return

    await sessionManager.init()
    await templateManager.init()
    
    this.initialized = true
  }

  /**
   * Export sessions to JSON
   */
  async exportSessionsToJSON(
    sessionIds: string[],
    options: Partial<ExportOptions> = {}
  ): Promise<string> {
    await this.ensureInitialized()

    const {
      includeCompleted = true,
      includeCodeSnippets = true,
      includeTimestamps = true,
      includeConnectionMetadata = true
    } = options

    const sessions: DevFlowSession[] = []

    for (const sessionId of sessionIds) {
      const session = await sessionManager.loadSession(sessionId)
      if (session) {
        const processedSession = this.processSessionForExport(session, {
          includeCompleted,
          includeCodeSnippets,
          includeTimestamps,
          includeConnectionMetadata
        })
        sessions.push(processedSession)
      }
    }

    const exportData: ExportData = {
      sessions,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: 'json',
        includeCompleted,
        includeCodeSnippets,
        includeTimestamps,
        includeConnectionMetadata
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export session to Markdown
   */
  async exportSessionToMarkdown(sessionId: string): Promise<string> {
    await this.ensureInitialized()

    const session = await sessionManager.loadSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    let markdown = `# ${session.name}\n\n`
    
    if (session.description) {
      markdown += `${session.description}\n\n`
    }

    markdown += `**Created:** ${session.metadata.createdAt.toLocaleDateString()}\n`
    markdown += `**Last Updated:** ${session.metadata.updatedAt.toLocaleDateString()}\n`
    
    if (session.metadata.tags.length > 0) {
      markdown += `**Tags:** ${session.metadata.tags.join(', ')}\n`
    }
    
    markdown += '\n---\n\n'

    // Export nodes by type
    const nodesByType = this.groupNodesByType(session.nodes)

    for (const [nodeType, nodes] of Object.entries(nodesByType)) {
      if (nodes.length === 0) continue

      markdown += `## ${this.capitalizeFirst(nodeType)} Nodes\n\n`

      for (const node of nodes) {
        markdown += `### ${node.title}\n\n`
        
        if (node.description) {
          markdown += `${node.description}\n\n`
        }

        markdown += `**Status:** ${this.capitalizeFirst(node.status)}\n`
        markdown += `**Priority:** ${node.metadata.priority}/5\n\n`

        // Export content based on node type
        if (node.content.todos.length > 0) {
          markdown += '**Tasks:**\n\n'
          for (const todo of node.content.todos) {
            const checkbox = todo.completed ? '[x]' : '[ ]'
            markdown += `- ${checkbox} ${todo.text}\n`
          }
          markdown += '\n'
        }

        if (node.content.codeSnippets.length > 0) {
          markdown += '**Code Snippets:**\n\n'
          for (const snippet of node.content.codeSnippets) {
            markdown += `**${snippet.title}** (${snippet.language}):\n\n`
            markdown += '```' + snippet.language + '\n'
            markdown += snippet.code + '\n'
            markdown += '```\n\n'
          }
        }

        if (node.content.references.length > 0) {
          markdown += '**References:**\n\n'
          for (const ref of node.content.references) {
            if (ref.url) {
              markdown += `- [${ref.title}](${ref.url})`
            } else {
              markdown += `- ${ref.title}`
            }
            if (ref.description) {
              markdown += ` - ${ref.description}`
            }
            markdown += '\n'
          }
          markdown += '\n'
        }

        if (node.content.comments.length > 0) {
          markdown += '**Comments:**\n\n'
          for (const comment of node.content.comments) {
            markdown += `> ${comment.text}\n`
            if (comment.author) {
              markdown += `> \n> — ${comment.author}\n`
            }
            markdown += '\n'
          }
        }

        markdown += '---\n\n'
      }
    }

    // Export connections
    if (session.connections.length > 0) {
      markdown += '## Connections\n\n'
      
      for (const connection of session.connections) {
        const sourceNode = session.nodes.find(n => n.id === connection.sourceNodeId)
        const targetNode = session.nodes.find(n => n.id === connection.targetNodeId)
        
        if (sourceNode && targetNode) {
          const relationshipText = this.getConnectionDescription(connection.type)
          markdown += `- **${sourceNode.title}** ${relationshipText} **${targetNode.title}**`
          if (connection.label) {
            markdown += ` (${connection.label})`
          }
          markdown += '\n'
        }
      }
      markdown += '\n'
    }

    // Export timeline
    if (session.timeline.length > 0) {
      markdown += '## Timeline\n\n'
      
      const sortedTimeline = [...session.timeline].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )

      for (const event of sortedTimeline.slice(0, 10)) { // Show last 10 events
        const date = event.timestamp.toLocaleDateString()
        const time = event.timestamp.toLocaleTimeString()
        markdown += `- **${date} ${time}:** ${event.description}\n`
      }
    }

    return markdown
  }

  /**
   * Export templates to JSON
   */
  async exportTemplatesToJSON(templateIds: string[]): Promise<string> {
    await this.ensureInitialized()

    const templates: SessionTemplate[] = []

    for (const templateId of templateIds) {
      const template = await templateManager.getTemplate(templateId)
      if (template) {
        templates.push(template)
      }
    }

    const exportData: ExportData = {
      templates,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format: 'json',
        includeCompleted: true,
        includeCodeSnippets: true,
        includeTimestamps: true,
        includeConnectionMetadata: true
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import data from JSON
   */
  async importFromJSON(
    jsonData: string,
    options: ImportOptions = {
      mergeStrategy: 'merge',
      handleConflicts: 'auto',
      preserveIds: false,
      updateExisting: false
    }
  ): Promise<ImportResult> {
    await this.ensureInitialized()

    try {
      const data: ExportData = JSON.parse(jsonData)
      
      if (!data.metadata || !data.metadata.version) {
        throw new Error('Invalid export format: missing metadata')
      }

      const result: ImportResult = {
        success: true,
        errors: [],
        warnings: []
      }

      // Import sessions
      if (data.sessions && data.sessions.length > 0) {
        const sessionResult = await this.importSessions(data.sessions, options)
        result.errors?.push(...(sessionResult.errors || []))
        result.warnings?.push(...(sessionResult.warnings || []))
      }

      // Import templates
      if (data.templates && data.templates.length > 0) {
        const templateResult = await this.importTemplates(data.templates, options)
        result.errors?.push(...(templateResult.errors || []))
        result.warnings?.push(...(templateResult.warnings || []))
      }

      result.success = (result.errors?.length || 0) === 0

      return result
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  /**
   * Import sessions with conflict resolution
   */
  private async importSessions(
    sessions: DevFlowSession[],
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      errors: [],
      warnings: []
    }

    for (const session of sessions) {
      try {
        // Check for existing session
        const existingSession = await sessionManager.loadSession(session.id)
        
        if (existingSession) {
          switch (options.mergeStrategy) {
            case 'skip':
              result.warnings?.push(`Skipped existing session: ${session.name}`)
              continue
              
            case 'replace':
              if (options.updateExisting) {
                await sessionManager.updateSession(session.id, session)
                result.warnings?.push(`Replaced existing session: ${session.name}`)
              } else {
                result.warnings?.push(`Skipped existing session (update disabled): ${session.name}`)
              }
              continue
              
            case 'merge':
              const mergedSession = this.mergeSessions(existingSession, session)
              await sessionManager.updateSession(session.id, mergedSession)
              result.warnings?.push(`Merged with existing session: ${session.name}`)
              continue
          }
        }

        // Create new session
        let sessionToImport = session
        
        if (!options.preserveIds) {
          sessionToImport = this.generateNewSessionIds(session)
        }

        // Validate session before import
        const validation = await sessionManager.validateSession(sessionToImport)
        if (!validation.isValid) {
          result.errors?.push(`Invalid session ${session.name}: ${validation.errors.map(e => e.message).join(', ')}`)
          continue
        }

        // Create the session
        await sessionManager.createSession(
          sessionToImport.name,
          sessionToImport.description,
          sessionToImport.settings
        )

        // Update with full session data
        await sessionManager.updateSession(sessionToImport.id, sessionToImport)

      } catch (error) {
        result.errors?.push(`Failed to import session ${session.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    result.success = (result.errors?.length || 0) === 0
    return result
  }

  /**
   * Import templates with conflict resolution
   */
  private async importTemplates(
    templates: SessionTemplate[],
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      errors: [],
      warnings: []
    }

    for (const template of templates) {
      try {
        // Check for existing template
        const existingTemplate = await templateManager.getTemplate(template.id)
        
        if (existingTemplate) {
          switch (options.mergeStrategy) {
            case 'skip':
              result.warnings?.push(`Skipped existing template: ${template.name}`)
              continue
              
            case 'replace':
              if (options.updateExisting) {
                await templateManager.updateTemplate(template.id, template)
                result.warnings?.push(`Replaced existing template: ${template.name}`)
              } else {
                result.warnings?.push(`Skipped existing template (update disabled): ${template.name}`)
              }
              continue
              
            case 'merge':
              // For templates, merge means updating metadata but keeping structure
              await templateManager.updateTemplate(template.id, {
                description: template.description,
                tags: [...new Set([...existingTemplate.tags, ...template.tags])],
                updatedAt: new Date()
              })
              result.warnings?.push(`Merged with existing template: ${template.name}`)
              continue
          }
        }

        // Create new template
        let templateToImport = template
        
        if (!options.preserveIds) {
          templateToImport = {
            ...template,
            id: generateId()
          }
        }

        // Validate template before import
        const validation = templateManager.validateTemplate(templateToImport)
        if (!validation.isValid) {
          result.errors?.push(`Invalid template ${template.name}: ${validation.errors.join(', ')}`)
          continue
        }

        // Import the template using the template manager's import method
        const jsonData = JSON.stringify({
          template: templateToImport,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        })

        await templateManager.importTemplate(jsonData)

      } catch (error) {
        result.errors?.push(`Failed to import template ${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    result.success = (result.errors?.length || 0) === 0
    return result
  }

  /**
   * Handle drag and drop import
   */
  async handleFileImport(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string
          const result = await this.importFromJSON(content)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Process session for export based on options
   */
  private processSessionForExport(
    session: DevFlowSession,
    options: {
      includeCompleted: boolean
      includeCodeSnippets: boolean
      includeTimestamps: boolean
      includeConnectionMetadata: boolean
    }
  ): DevFlowSession {
    const processedSession = { ...session }

    // Filter nodes based on completion status
    if (!options.includeCompleted) {
      processedSession.nodes = session.nodes.filter(node => node.status !== 'completed')
      
      // Remove connections to filtered nodes
      const nodeIds = new Set(processedSession.nodes.map(n => n.id))
      processedSession.connections = session.connections.filter(
        c => nodeIds.has(c.sourceNodeId) && nodeIds.has(c.targetNodeId)
      )
    }

    // Filter code snippets
    if (!options.includeCodeSnippets) {
      processedSession.nodes = processedSession.nodes.map(node => ({
        ...node,
        content: {
          ...node.content,
          codeSnippets: []
        }
      }))
    }

    // Remove timestamps
    if (!options.includeTimestamps) {
      processedSession.timeline = []
      processedSession.nodes = processedSession.nodes.map(node => ({
        ...node,
        metadata: {
          ...node.metadata,
          createdAt: new Date(0),
          updatedAt: new Date(0),
          timeSpent: undefined
        }
      }))
    }

    // Remove connection metadata
    if (!options.includeConnectionMetadata) {
      processedSession.connections = processedSession.connections.map(connection => ({
        id: connection.id,
        sourceNodeId: connection.sourceNodeId,
        targetNodeId: connection.targetNodeId,
        type: connection.type,
        label: connection.label,
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      }))
    }

    return processedSession
  }

  /**
   * Group nodes by type for markdown export
   */
  private groupNodesByType(nodes: DevFlowNode[]): Record<string, DevFlowNode[]> {
    return nodes.reduce((groups, node) => {
      if (!groups[node.type]) {
        groups[node.type] = []
      }
      groups[node.type].push(node)
      return groups
    }, {} as Record<string, DevFlowNode[]>)
  }

  /**
   * Get connection description for markdown
   */
  private getConnectionDescription(type: string): string {
    switch (type) {
      case 'dependency': return 'depends on'
      case 'sequence': return 'leads to'
      case 'reference': return 'references'
      case 'blocks': return 'blocks'
      default: return 'connects to'
    }
  }

  /**
   * Merge two sessions
   */
  private mergeSessions(existing: DevFlowSession, incoming: DevFlowSession): Partial<DevFlowSession> {
    // Merge nodes (add new ones, update existing ones)
    const existingNodeIds = new Set(existing.nodes.map(n => n.id))
    const newNodes = incoming.nodes.filter(n => !existingNodeIds.has(n.id))
    
    const updatedNodes = existing.nodes.map(existingNode => {
      const incomingNode = incoming.nodes.find(n => n.id === existingNode.id)
      if (incomingNode) {
        // Merge node content
        return {
          ...existingNode,
          ...incomingNode,
          content: {
            todos: [...existingNode.content.todos, ...incomingNode.content.todos],
            codeSnippets: [...existingNode.content.codeSnippets, ...incomingNode.content.codeSnippets],
            references: [...existingNode.content.references, ...incomingNode.content.references],
            comments: [...existingNode.content.comments, ...incomingNode.content.comments]
          },
          metadata: {
            ...existingNode.metadata,
            ...incomingNode.metadata,
            tags: [...new Set([...existingNode.metadata.tags, ...incomingNode.metadata.tags])],
            updatedAt: new Date()
          }
        }
      }
      return existingNode
    })

    // Merge connections (add new ones)
    const existingConnectionIds = new Set(existing.connections.map(c => c.id))
    const newConnections = incoming.connections.filter(c => !existingConnectionIds.has(c.id))

    return {
      nodes: [...updatedNodes, ...newNodes],
      connections: [...existing.connections, ...newConnections],
      timeline: [...existing.timeline, ...incoming.timeline],
      metadata: {
        ...existing.metadata,
        tags: [...new Set([...existing.metadata.tags, ...incoming.metadata.tags])],
        updatedAt: new Date()
      }
    }
  }

  /**
   * Generate new IDs for session and its components
   */
  private generateNewSessionIds(session: DevFlowSession): DevFlowSession {
    const newSessionId = generateId()
    const nodeIdMap = new Map<string, string>()

    // Generate new node IDs
    const newNodes = session.nodes.map(node => {
      const newNodeId = generateId()
      nodeIdMap.set(node.id, newNodeId)
      
      return {
        ...node,
        id: newNodeId,
        metadata: {
          ...node.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    })

    // Update connection IDs
    const newConnections = session.connections.map(connection => ({
      ...connection,
      id: generateId(),
      sourceNodeId: nodeIdMap.get(connection.sourceNodeId) || connection.sourceNodeId,
      targetNodeId: nodeIdMap.get(connection.targetNodeId) || connection.targetNodeId
    }))

    // Update timeline events
    const newTimeline = session.timeline.map(event => ({
      ...event,
      id: generateId(),
      nodeId: event.nodeId ? nodeIdMap.get(event.nodeId) || event.nodeId : undefined
    }))

    return {
      ...session,
      id: newSessionId,
      nodes: newNodes,
      connections: newConnections,
      timeline: newTimeline,
      metadata: {
        ...session.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Ensure manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }
}

// Singleton instance
export const exportImportManager = new ExportImportManager()
