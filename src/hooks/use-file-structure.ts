import { useState, useCallback } from 'react'
import type { 
  FileStructureNode, 
  FileStructureTree, 
  PathValidationResult,
  FileStructureExportOptions 
} from '../types'
import { 
  createFileStructureNode, 
  createFileStructureTree,
  validatePath,
  exportFileStructure,
  buildFileTree
} from '../lib/file-structure-utils'

interface UseFileStructureOptions {
  initialTree?: FileStructureTree
  onSave?: (tree: FileStructureTree) => void
}

export function useFileStructure({ initialTree, onSave }: UseFileStructureOptions = {}) {
  const [tree, setTree] = useState<FileStructureTree>(
    initialTree || createFileStructureTree('New Project', 'Project file structure')
  )
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Get all nodes as flat array
  const allNodes = tree.rootNodes

  // Get selected node
  const selectedNodeData = selectedNode 
    ? allNodes.find(n => n.id === selectedNode) 
    : null

  // Add a new file or folder
  const addNode = useCallback((
    name: string, 
    type: 'file' | 'folder', 
    parentId?: string
  ): { success: boolean; validation?: PathValidationResult } => {
    const existingPaths = allNodes.map(n => n.path)
    const validation = validatePath(name, existingPaths)

    if (!validation.isValid) {
      return { success: false, validation }
    }

    const newNode = createFileStructureNode(name, type, parentId)
    
    setTree(prev => ({
      ...prev,
      rootNodes: [...prev.rootNodes, newNode],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))

    return { success: true }
  }, [allNodes])

  // Delete a node
  const deleteNode = useCallback((nodeId: string) => {
    setTree(prev => ({
      ...prev,
      rootNodes: prev.rootNodes.filter(n => n.id !== nodeId),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))
    
    if (selectedNode === nodeId) {
      setSelectedNode(null)
    }
  }, [selectedNode])

  // Rename a node
  const renameNode = useCallback((nodeId: string, newName: string): boolean => {
    const existingPaths = allNodes.filter(n => n.id !== nodeId).map(n => n.path)
    const validation = validatePath(newName, existingPaths)
    
    if (!validation.isValid) return false

    setTree(prev => ({
      ...prev,
      rootNodes: prev.rootNodes.map(node => 
        node.id === nodeId 
          ? { ...node, name: newName, path: newName }
          : node
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))

    return true
  }, [allNodes])

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<FileStructureNode>) => {
    setTree(prev => ({
      ...prev,
      rootNodes: prev.rootNodes.map(node => 
        node.id === nodeId 
          ? { ...node, ...updates }
          : node
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))
  }, [])

  // Move node (change parent)
  const moveNode = useCallback((nodeId: string, newParentId?: string) => {
    setTree(prev => ({
      ...prev,
      rootNodes: prev.rootNodes.map(node => 
        node.id === nodeId 
          ? { ...node, parent: newParentId }
          : node
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))
  }, [])

  // Duplicate node
  const duplicateNode = useCallback((nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId)
    if (!node) return

    const baseName = node.name
    const extension = node.type === 'file' && baseName.includes('.') 
      ? `.${baseName.split('.').pop()}` 
      : ''
    const nameWithoutExt = extension 
      ? baseName.substring(0, baseName.lastIndexOf('.'))
      : baseName

    let copyName = `${nameWithoutExt}_copy${extension}`
    let counter = 1
    
    while (allNodes.some(n => n.name === copyName)) {
      copyName = `${nameWithoutExt}_copy${counter}${extension}`
      counter++
    }

    const newNode = createFileStructureNode(copyName, node.type, node.parent)
    
    setTree(prev => ({
      ...prev,
      rootNodes: [...prev.rootNodes, newNode],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))
  }, [allNodes])

  // Export tree
  const exportTree = useCallback((options: FileStructureExportOptions): string => {
    return exportFileStructure(tree, options)
  }, [tree])

  // Save tree
  const saveTree = useCallback(() => {
    onSave?.(tree)
  }, [tree, onSave])

  // Update tree metadata
  const updateTreeMetadata = useCallback((updates: Partial<FileStructureTree>) => {
    setTree(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }))
  }, [])

  // Get tree statistics
  const getStatistics = useCallback(() => {
    const totalNodes = allNodes.length
    const fileCount = allNodes.filter(n => n.type === 'file').length
    const folderCount = allNodes.filter(n => n.type === 'folder').length
    
    const fileTypes: Record<string, number> = {}
    allNodes.forEach(node => {
      if (node.type === 'file' && node.fileType) {
        fileTypes[node.fileType] = (fileTypes[node.fileType] || 0) + 1
      }
    })

    return {
      totalNodes,
      fileCount,
      folderCount,
      fileTypes
    }
  }, [allNodes])

  // Build hierarchical tree structure
  const getHierarchicalTree = useCallback(() => {
    return buildFileTree(allNodes)
  }, [allNodes])

  // Filter nodes
  const filterNodes = useCallback((
    query: string = '', 
    type: 'all' | 'file' | 'folder' = 'all'
  ) => {
    return allNodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(query.toLowerCase())
      const matchesType = type === 'all' || node.type === type
      return matchesSearch && matchesType
    })
  }, [allNodes])

  return {
    // State
    tree,
    allNodes,
    selectedNode,
    selectedNodeData,
    
    // Actions
    addNode,
    deleteNode,
    renameNode,
    updateNode,
    moveNode,
    duplicateNode,
    setSelectedNode,
    
    // Tree operations
    exportTree,
    saveTree,
    updateTreeMetadata,
    
    // Utilities
    getStatistics,
    getHierarchicalTree,
    filterNodes
  }
}