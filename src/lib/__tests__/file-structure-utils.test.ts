import { describe, it, expect } from 'vitest'
import {
  createFileStructureNode,
  createFileStructureTree,
  getFileExtension,
  validatePath,
  getSuggestedFileNames,
  getFileTypeConfig,
  exportFileStructure,
  FILE_TYPE_CONFIGS
} from '../file-structure-utils'

describe('file-structure-utils', () => {
  describe('createFileStructureNode', () => {
    it('should create a file node with correct properties', () => {
      const node = createFileStructureNode('test.js', 'file')
      
      expect(node.name).toBe('test.js')
      expect(node.type).toBe('file')
      expect(node.path).toBe('test.js')
      expect(node.fileType).toBe('js')
      expect(node.icon).toBe('📄')
      expect(node.id).toBeDefined()
    })

    it('should create a folder node with correct properties', () => {
      const node = createFileStructureNode('src', 'folder')
      
      expect(node.name).toBe('src')
      expect(node.type).toBe('folder')
      expect(node.path).toBe('src')
      expect(node.icon).toBe('📁')
      expect(node.children).toEqual([])
    })

    it('should handle parent relationships', () => {
      const node = createFileStructureNode('component.tsx', 'file', 'parent-id')
      
      expect(node.parent).toBe('parent-id')
    })
  })

  describe('createFileStructureTree', () => {
    it('should create a tree with correct metadata', () => {
      const tree = createFileStructureTree('Test Project', 'A test project')
      
      expect(tree.name).toBe('Test Project')
      expect(tree.description).toBe('A test project')
      expect(tree.rootNodes).toEqual([])
      expect(tree.metadata.version).toBe('1.0.0')
      expect(tree.metadata.createdAt).toBeInstanceOf(Date)
      expect(tree.metadata.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('test.js')).toBe('js')
      expect(getFileExtension('component.tsx')).toBe('tsx')
      expect(getFileExtension('style.css')).toBe('css')
      expect(getFileExtension('package.json')).toBe('json')
    })

    it('should handle special files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore')
      expect(getFileExtension('.env')).toBe('env')
    })

    it('should return undefined for files without extensions', () => {
      expect(getFileExtension('README')).toBeUndefined()
      expect(getFileExtension('Dockerfile')).toBeUndefined()
    })

    it('should handle edge cases', () => {
      expect(getFileExtension('')).toBeUndefined()
      expect(getFileExtension('.')).toBeUndefined()
      expect(getFileExtension('..')).toBeUndefined()
    })
  })

  describe('validatePath', () => {
    it('should validate correct paths', () => {
      const result = validatePath('src/components/Button.tsx')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty paths', () => {
      const result = validatePath('')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Path cannot be empty')
    })

    it('should reject paths with invalid characters', () => {
      const result = validatePath('src/comp<>onents')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Path contains invalid characters')
    })

    it('should reject reserved names', () => {
      const result = validatePath('CON.txt')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('"CON" is a reserved name')
    })

    it('should detect duplicate paths', () => {
      const existingPaths = ['src/App.tsx', 'src/main.tsx']
      const result = validatePath('src/App.tsx', existingPaths)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Path already exists')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should warn about long paths', () => {
      const longPath = 'a'.repeat(300)
      const result = validatePath(longPath)
      
      expect(result.warnings).toContain('Path is very long and may cause issues on some systems')
    })

    it('should suggest naming conventions for paths with spaces', () => {
      const result = validatePath('my component.tsx')
      
      expect(result.suggestions.some(s => s.includes('kebab-case'))).toBe(true)
      expect(result.suggestions.some(s => s.includes('snake_case'))).toBe(true)
    })
  })

  describe('getSuggestedFileNames', () => {
    it('should return common names for known file types', () => {
      const suggestions = getSuggestedFileNames('js')
      
      expect(suggestions).toContain('index.js')
      expect(suggestions).toContain('app.js')
      expect(suggestions).toContain('main.js')
    })

    it('should return default for unknown file types', () => {
      const suggestions = getSuggestedFileNames('unknown')
      
      expect(suggestions).toEqual(['new-file'])
    })

    it('should handle undefined file type', () => {
      const suggestions = getSuggestedFileNames()
      
      expect(suggestions).toEqual(['new-file'])
    })
  })

  describe('getFileTypeConfig', () => {
    it('should return config for known file types', () => {
      const config = getFileTypeConfig('js')
      
      expect(config).toBeDefined()
      expect(config?.extension).toBe('js')
      expect(config?.icon).toBe('📄')
      expect(config?.category).toBe('source')
    })

    it('should return undefined for unknown file types', () => {
      const config = getFileTypeConfig('unknown')
      
      expect(config).toBeUndefined()
    })

    it('should be case insensitive', () => {
      const config = getFileTypeConfig('JS')
      
      expect(config).toBeDefined()
      expect(config?.extension).toBe('js')
    })
  })

  describe('exportFileStructure', () => {
    const sampleTree = createFileStructureTree('Test Project')
    sampleTree.rootNodes = [
      createFileStructureNode('src', 'folder'),
      createFileStructureNode('package.json', 'file')
    ]

    it('should export as JSON', () => {
      const result = exportFileStructure(sampleTree, { 
        format: 'json',
        includeContent: false,
        includeTemplates: false,
        includeMetadata: true
      })
      
      expect(() => JSON.parse(result)).not.toThrow()
      const parsed = JSON.parse(result)
      expect(parsed.name).toBe('Test Project')
      expect(parsed.rootNodes).toHaveLength(2)
    })

    it('should export as markdown', () => {
      const result = exportFileStructure(sampleTree, { 
        format: 'markdown',
        includeContent: false,
        includeTemplates: false,
        includeMetadata: true
      })
      
      expect(result).toContain('📁 src')
      expect(result).toContain('⚙️ package.json')
    })

    it('should export as bash script', () => {
      const result = exportFileStructure(sampleTree, { 
        format: 'bash',
        includeContent: false,
        includeTemplates: false,
        includeMetadata: true,
        targetPlatform: 'unix'
      })
      
      expect(result).toContain('#!/bin/bash')
      expect(result).toContain('mkdir -p')
      expect(result).toContain('touch')
    })

    it('should throw error for unsupported format', () => {
      expect(() => {
        exportFileStructure(sampleTree, { 
          format: 'unsupported' as any,
          includeContent: false,
          includeTemplates: false,
          includeMetadata: true
        })
      }).toThrow('Unsupported export format: unsupported')
    })
  })

  describe('FILE_TYPE_CONFIGS', () => {
    it('should have configurations for common file types', () => {
      const expectedTypes = ['js', 'ts', 'tsx', 'jsx', 'css', 'scss', 'json', 'md', 'png', 'svg']
      
      expectedTypes.forEach(type => {
        expect(FILE_TYPE_CONFIGS[type]).toBeDefined()
        expect(FILE_TYPE_CONFIGS[type].extension).toBe(type)
        expect(FILE_TYPE_CONFIGS[type].icon).toBeDefined()
        expect(FILE_TYPE_CONFIGS[type].category).toBeDefined()
        expect(FILE_TYPE_CONFIGS[type].description).toBeDefined()
      })
    })

    it('should have valid categories', () => {
      const validCategories = ['source', 'config', 'documentation', 'asset', 'data', 'other']
      
      Object.values(FILE_TYPE_CONFIGS).forEach(config => {
        expect(validCategories).toContain(config.category)
      })
    })
  })
})