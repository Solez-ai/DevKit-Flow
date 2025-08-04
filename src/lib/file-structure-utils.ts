import type { 
  FileStructureNode, 
  FileStructureTree, 
  FileTypeConfig, 
  PathValidationResult,
  FileStructureExportOptions 
} from '../types'
import { generateId } from './utils'

/**
 * File type configurations with icons and metadata
 */
export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  // JavaScript/TypeScript
  'js': {
    extension: 'js',
    icon: '📄',
    color: '#f7df1e',
    category: 'source',
    description: 'JavaScript file',
    commonNames: ['index.js', 'app.js', 'main.js', 'script.js']
  },
  'ts': {
    extension: 'ts',
    icon: '📘',
    color: '#3178c6',
    category: 'source',
    description: 'TypeScript file',
    commonNames: ['index.ts', 'app.ts', 'main.ts', 'types.ts']
  },
  'tsx': {
    extension: 'tsx',
    icon: '⚛️',
    color: '#61dafb',
    category: 'source',
    description: 'TypeScript React component',
    commonNames: ['App.tsx', 'Component.tsx', 'index.tsx']
  },
  'jsx': {
    extension: 'jsx',
    icon: '⚛️',
    color: '#61dafb',
    category: 'source',
    description: 'JavaScript React component',
    commonNames: ['App.jsx', 'Component.jsx', 'index.jsx']
  },
  
  // Styles
  'css': {
    extension: 'css',
    icon: '🎨',
    color: '#1572b6',
    category: 'source',
    description: 'CSS stylesheet',
    commonNames: ['style.css', 'main.css', 'index.css', 'global.css']
  },
  'scss': {
    extension: 'scss',
    icon: '🎨',
    color: '#cf649a',
    category: 'source',
    description: 'SCSS stylesheet',
    commonNames: ['style.scss', 'main.scss', '_variables.scss']
  },
  
  // Configuration
  'json': {
    extension: 'json',
    icon: '⚙️',
    color: '#000000',
    category: 'config',
    description: 'JSON configuration file',
    commonNames: ['package.json', 'tsconfig.json', 'config.json']
  },
  'yaml': {
    extension: 'yaml',
    icon: '⚙️',
    color: '#cb171e',
    category: 'config',
    description: 'YAML configuration file',
    commonNames: ['config.yaml', 'docker-compose.yaml', '.github/workflows/ci.yaml']
  },
  'yml': {
    extension: 'yml',
    icon: '⚙️',
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
    description: 'Markdown documentation',
    commonNames: ['README.md', 'CHANGELOG.md', 'docs.md']
  },
  'txt': {
    extension: 'txt',
    icon: '📄',
    color: '#000000',
    category: 'documentation',
    description: 'Plain text file',
    commonNames: ['README.txt', 'notes.txt', 'changelog.txt']
  },
  
  // Assets
  'png': {
    extension: 'png',
    icon: '🖼️',
    color: '#000000',
    category: 'asset',
    description: 'PNG image file',
    commonNames: ['logo.png', 'icon.png', 'banner.png']
  },
  'svg': {
    extension: 'svg',
    icon: '🎨',
    color: '#ffb13b',
    category: 'asset',
    description: 'SVG vector image',
    commonNames: ['icon.svg', 'logo.svg', 'graphic.svg']
  },
  
  // Other
  'env': {
    extension: 'env',
    icon: '🔐',
    color: '#4caf50',
    category: 'config',
    description: 'Environment variables file',
    commonNames: ['.env', '.env.local', '.env.production']
  },
  'gitignore': {
    extension: 'gitignore',
    icon: '🚫',
    color: '#f05032',
    category: 'config',
    description: 'Git ignore file',
    commonNames: ['.gitignore']
  }
}

/**
 * Create a new file structure node
 */
export function createFileStructureNode(
  name: string,
  type: 'file' | 'folder',
  parent?: string
): FileStructureNode {
  const id = generateId()
  const parentPath = parent ? getNodePath(parent) : ''
  const path = parentPath ? `${parentPath}/${name}` : name
  
  const node: FileStructureNode = {
    id,
    name,
    type,
    path,
    parent,
    children: type === 'folder' ? [] : undefined
  }
  
  if (type === 'file') {
    const extension = getFileExtension(name)
    if (extension && FILE_TYPE_CONFIGS[extension]) {
      node.fileType = extension
      node.icon = FILE_TYPE_CONFIGS[extension].icon
    } else {
      node.icon = '📄'
    }
  } else {
    node.icon = '📁'
  }
  
  return node
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string | undefined {
  if (filename.startsWith('.')) {
    // Handle special files like .gitignore, .env
    const specialName = filename.substring(1)
    if (FILE_TYPE_CONFIGS[specialName]) {
      return specialName
    }
  }
  
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === 0) return undefined
  
  return filename.substring(lastDot + 1).toLowerCase()
}

/**
 * Get the full path for a node (placeholder - would need tree context)
 */
function getNodePath(_nodeId: string): string {
  // This would need to be implemented with access to the full tree
  // For now, return empty string
  return ''
}

/**
 * Validate a file/folder path
 */
export function validatePath(path: string, existingPaths: string[] = []): PathValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // Check for empty path
  if (!path.trim()) {
    errors.push('Path cannot be empty')
    return { isValid: false, errors, warnings, suggestions }
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/
  if (invalidChars.test(path)) {
    errors.push('Path contains invalid characters')
  }
  
  // Check for reserved names (Windows)
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  const pathParts = path.split('/').map(part => part.split('.')[0].toUpperCase())
  
  for (const part of pathParts) {
    if (reservedNames.includes(part)) {
      errors.push(`"${part}" is a reserved name`)
    }
  }
  
  // Check for duplicate paths
  if (existingPaths.includes(path)) {
    errors.push('Path already exists')
    suggestions.push(`Try: ${path}_copy`, `Try: ${path}_new`)
  }
  
  // Check path length
  if (path.length > 260) {
    warnings.push('Path is very long and may cause issues on some systems')
  }
  
  // Check for spaces at beginning/end of path segments
  const segments = path.split('/')
  for (const segment of segments) {
    if (segment !== segment.trim()) {
      warnings.push('Path segments should not start or end with spaces')
      break
    }
  }
  
  // Suggest common naming conventions
  const filename = path.split('/').pop() || ''
  if (filename.includes(' ')) {
    suggestions.push(`Consider using kebab-case: ${filename.replace(/\s+/g, '-').toLowerCase()}`)
    suggestions.push(`Consider using snake_case: ${filename.replace(/\s+/g, '_').toLowerCase()}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Build a file tree structure from flat nodes
 */
export function buildFileTree(nodes: FileStructureNode[]): FileStructureNode[] {
  const nodeMap = new Map<string, FileStructureNode>()
  const rootNodes: FileStructureNode[] = []
  
  // Create a map of all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: node.type === 'folder' ? [] : undefined })
  })
  
  // Build the tree structure
  nodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    
    if (node.parent) {
      const parent = nodeMap.get(node.parent)
      if (parent && parent.children) {
        parent.children.push(node.id)
      }
    } else {
      rootNodes.push(treeNode)
    }
  })
  
  return rootNodes
}

/**
 * Generate file structure export in different formats
 */
export function exportFileStructure(
  tree: FileStructureTree,
  options: FileStructureExportOptions
): string {
  switch (options.format) {
    case 'json':
      return JSON.stringify(tree, null, 2)
    
    case 'markdown':
      return generateMarkdownStructure(tree.rootNodes)
    
    case 'bash':
      return generateBashScript(tree.rootNodes, options.targetPlatform || 'unix')
    
    case 'zip':
      // This would require a zip library - return placeholder
      return 'ZIP export requires additional implementation'
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

/**
 * Generate markdown representation of file structure
 */
function generateMarkdownStructure(nodes: FileStructureNode[], depth = 0): string {
  let result = ''
  const indent = '  '.repeat(depth)
  
  for (const node of nodes) {
    const icon = node.icon || (node.type === 'folder' ? '📁' : '📄')
    result += `${indent}- ${icon} ${node.name}\n`
    
    if (node.children && node.children.length > 0) {
      // This would need the full tree context to resolve children
      // For now, just add a placeholder
      result += `${indent}  - (children would be listed here)\n`
    }
  }
  
  return result
}

/**
 * Generate bash script to create file structure
 */
function generateBashScript(nodes: FileStructureNode[], platform: string): string {
  let script = '#!/bin/bash\n\n'
  script += '# Generated file structure creation script\n'
  script += '# Run this script to create the file and folder structure\n\n'
  
  const mkdir = platform === 'windows' ? 'mkdir' : 'mkdir -p'
  const touch = platform === 'windows' ? 'type nul >' : 'touch'
  
  // Sort nodes to create folders first
  const folders = nodes.filter(n => n.type === 'folder')
  const files = nodes.filter(n => n.type === 'file')
  
  if (folders.length > 0) {
    script += '# Create directories\n'
    folders.forEach(folder => {
      script += `${mkdir} "${folder.path}"\n`
    })
    script += '\n'
  }
  
  if (files.length > 0) {
    script += '# Create files\n'
    files.forEach(file => {
      script += `${touch} "${file.path}"\n`
    })
  }
  
  script += '\necho "File structure created successfully!"\n'
  
  return script
}

/**
 * Get suggested file names based on file type
 */
export function getSuggestedFileNames(fileType?: string): string[] {
  if (!fileType || !FILE_TYPE_CONFIGS[fileType]) {
    return ['new-file']
  }
  
  return FILE_TYPE_CONFIGS[fileType].commonNames || [`new-file.${fileType}`]
}

/**
 * Get file type configuration
 */
export function getFileTypeConfig(extension: string): FileTypeConfig | undefined {
  return FILE_TYPE_CONFIGS[extension.toLowerCase()]
}

/**
 * Create a new file structure tree
 */
export function createFileStructureTree(name: string, description?: string): FileStructureTree {
  return {
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
}