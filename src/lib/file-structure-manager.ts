import type { 
  FileStructureNode, 
  FileStructureTree, 
  FileTypeConfig, 
  PathValidationResult,
  FileStructureExportOptions
} from '../types'
import { generateId } from './utils'

/**
 * File Structure Manager - handles file tree operations and validation
 */

// Common file type configurations
export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  // Source files
  'js': {
    extension: 'js',
    icon: '📄',
    color: '#f7df1e',
    category: 'source',
    description: 'JavaScript file',
    commonNames: ['index.js', 'app.js', 'main.js']
  },
  'ts': {
    extension: 'ts',
    icon: '📘',
    color: '#3178c6',
    category: 'source',
    description: 'TypeScript file',
    commonNames: ['index.ts', 'app.ts', 'main.ts']
  },
  'tsx': {
    extension: 'tsx',
    icon: '⚛️',
    color: '#61dafb',
    category: 'source',
    description: 'TypeScript React component',
    commonNames: ['App.tsx', 'Component.tsx']
  },
  'jsx': {
    extension: 'jsx',
    icon: '⚛️',
    color: '#61dafb',
    category: 'source',
    description: 'JavaScript React component',
    commonNames: ['App.jsx', 'Component.jsx']
  },
  'py': {
    extension: 'py',
    icon: '🐍',
    color: '#3776ab',
    category: 'source',
    description: 'Python file',
    commonNames: ['main.py', 'app.py', '__init__.py']
  },
  'java': {
    extension: 'java',
    icon: '☕',
    color: '#ed8b00',
    category: 'source',
    description: 'Java file',
    commonNames: ['Main.java', 'App.java']
  },
  'go': {
    extension: 'go',
    icon: '🐹',
    color: '#00add8',
    category: 'source',
    description: 'Go file',
    commonNames: ['main.go', 'app.go']
  },
  
  // Config files
  'json': {
    extension: 'json',
    icon: '📋',
    color: '#000000',
    category: 'config',
    description: 'JSON configuration file',
    commonNames: ['package.json', 'tsconfig.json', 'config.json']
  },
  'yaml': {
    extension: 'yaml',
    icon: '📋',
    color: '#cb171e',
    category: 'config',
    description: 'YAML configuration file',
    commonNames: ['config.yaml', 'docker-compose.yaml']
  },
  'yml': {
    extension: 'yml',
    icon: '📋',
    color: '#cb171e',
    category: 'config',
    description: 'YAML configuration file',
    commonNames: ['config.yml', 'docker-compose.yml']
  },
  
  // Documentation
  'md': {
    extension: 'md',
    icon: '📝',
    color: '#083fa1',
    category: 'documentation',
    description: 'Markdown file',
    commonNames: ['README.md', 'CHANGELOG.md', 'docs.md']
  },
  'txt': {
    extension: 'txt',
    icon: '📄',
    color: '#000000',
    category: 'documentation',
    description: 'Text file',
    commonNames: ['README.txt', 'notes.txt']
  }
}
/**
 *
 File Structure Manager class for handling file tree operations
 */
export class FileStructureManager {
  private tree: FileStructureTree | null = null

  constructor(tree?: FileStructureTree) {
    this.tree = tree || null
  }

  /**
   * Create a new file structure tree
   */
  createTree(name: string, description?: string): FileStructureTree {
    this.tree = {
      id: generateId(),
      name,
      description,
      rootNodes: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: []
      }
    }
    return this.tree
  }

  /**
   * Add a node to the tree
   */
  addNode(node: Omit<FileStructureNode, 'id'>): FileStructureNode {
    if (!this.tree) {
      throw new Error('No tree initialized')
    }

    const newNode: FileStructureNode = {
      ...node,
      id: generateId()
    }

    if (node.parent) {
      // Add to parent's children
      const parentNode = this.findNode(node.parent)
      if (parentNode) {
        parentNode.children = parentNode.children || []
        parentNode.children.push(newNode.id)
      }
    } else {
      // Add to root nodes
      this.tree.rootNodes.push(newNode)
    }

    this.tree.metadata.updatedAt = new Date()
    return newNode
  }

  /**
   * Find a node by ID
   */
  findNode(nodeId: string): FileStructureNode | null {
    if (!this.tree) return null

    const searchNodes = (nodes: FileStructureNode[]): FileStructureNode | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return node
        if (node.children) {
          const childNodes = node.children.map(id => this.findNode(id)).filter(Boolean) as FileStructureNode[]
          const found = searchNodes(childNodes)
          if (found) return found
        }
      }
      return null
    }

    return searchNodes(this.tree.rootNodes)
  }

  /**
   * Remove a node from the tree
   */
  removeNode(nodeId: string): boolean {
    if (!this.tree) return false

    const removeFromNodes = (nodes: FileStructureNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children) {
          const childNodes = nodes[i].children!.map(id => this.findNode(id)).filter(Boolean) as FileStructureNode[]
          if (removeFromNodes(childNodes)) {
            // Remove from parent's children array
            nodes[i].children = nodes[i].children!.filter(id => id !== nodeId)
            return true
          }
        }
      }
      return false
    }

    const removed = removeFromNodes(this.tree.rootNodes)
    if (removed) {
      this.tree.metadata.updatedAt = new Date()
    }
    return removed
  }

  /**
   * Validate a file path
   */
  validatePath(path: string): PathValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/
    if (invalidChars.test(path)) {
      errors.push('Path contains invalid characters: < > : " | ? *')
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    const fileName = path.split('/').pop() || ''
    const baseName = fileName.split('.')[0].toUpperCase()
    if (reservedNames.includes(baseName)) {
      errors.push(`"${baseName}" is a reserved name`)
    }

    // Check path length
    if (path.length > 260) {
      warnings.push('Path is very long and may cause issues on some systems')
    }

    // Check for spaces at beginning/end
    if (fileName.startsWith(' ') || fileName.endsWith(' ')) {
      warnings.push('File name starts or ends with a space')
    }

    // Suggest file extensions
    if (!fileName.includes('.') && !path.endsWith('/')) {
      suggestions.push('Consider adding a file extension')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Get file type configuration
   */
  getFileTypeConfig(fileName: string): FileTypeConfig | null {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension ? FILE_TYPE_CONFIGS[extension] || null : null
  }

  /**
   * Export the tree structure
   */
  export(options: FileStructureExportOptions): string | Blob {
    if (!this.tree) {
      throw new Error('No tree to export')
    }

    switch (options.format) {
      case 'json':
        return JSON.stringify(this.tree, null, 2)
      
      case 'markdown':
        return this.exportToMarkdown(this.tree, options)
      
      case 'bash':
        return this.exportToBashScript(this.tree, options)
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  private exportToMarkdown(tree: FileStructureTree, _options: FileStructureExportOptions): string {
    let markdown = `# ${tree.name}\n\n`
    
    if (tree.description) {
      markdown += `${tree.description}\n\n`
    }

    markdown += '## File Structure\n\n```\n'
    
    const renderNode = (node: FileStructureNode, indent: string = ''): string => {
      let result = `${indent}${node.type === 'folder' ? '📁' : '📄'} ${node.name}\n`
      
      if (node.children) {
        const childNodes = node.children.map(id => this.findNode(id)).filter(Boolean) as FileStructureNode[]
        childNodes.forEach(child => {
          result += renderNode(child, indent + '  ')
        })
      }
      
      return result
    }

    tree.rootNodes.forEach(node => {
      markdown += renderNode(node)
    })

    markdown += '```\n'
    return markdown
  }

  private exportToBashScript(tree: FileStructureTree, _options: FileStructureExportOptions): string {
    let script = '#!/bin/bash\n\n'
    script += `# Generated file structure for: ${tree.name}\n`
    script += `# Created: ${new Date().toISOString()}\n\n`

    const createCommands: string[] = []
    
    const processNode = (node: FileStructureNode, basePath: string = ''): void => {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name
      
      if (node.type === 'folder') {
        createCommands.push(`mkdir -p "${fullPath}"`)
        
        if (node.children) {
          const childNodes = node.children.map(id => this.findNode(id)).filter(Boolean) as FileStructureNode[]
          childNodes.forEach(child => processNode(child, fullPath))
        }
      } else {
        createCommands.push(`touch "${fullPath}"`)
      }
    }

    tree.rootNodes.forEach(node => processNode(node))
    
    script += createCommands.join('\n')
    script += '\n\necho "File structure created successfully!"\n'
    
    return script
  }

  /**
   * Get the current tree
   */
  getTree(): FileStructureTree | null {
    return this.tree
  }

  /**
   * Set the current tree
   */
  setTree(tree: FileStructureTree): void {
    this.tree = tree
  }
}

/**
 * Create a new file structure manager instance
 */
export function createFileStructureManager(tree?: FileStructureTree): FileStructureManager {
  return new FileStructureManager(tree)
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const config = extension ? FILE_TYPE_CONFIGS[extension] : null
  return config?.icon || '📄'
}

/**
 * Get file color based on file type
 */
export function getFileColor(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const config = extension ? FILE_TYPE_CONFIGS[extension] : null
  return config?.color || '#000000'
}