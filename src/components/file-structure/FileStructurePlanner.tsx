import { useState, useCallback } from 'react'
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  FolderPlus, 
  FilePlus, 
  Download, 
  Upload,
  Search
} from 'lucide-react'
import type { FileStructureNode, FileStructureTree, FileStructureExportOptions } from '../../types'
import { 
  createFileStructureNode, 
  createFileStructureTree,
  validatePath,
  exportFileStructure,
  FILE_TYPE_CONFIGS
} from '../../lib/file-structure-utils'
import { FileTreeItem } from './FileTreeItem'
import { FileStructureExportDialog } from './FileStructureExportDialog'
import { PathValidationDisplay } from './PathValidationDisplay'

interface FileStructurePlannerProps {
  onSave?: (tree: FileStructureTree) => void
  initialTree?: FileStructureTree
  className?: string
}

export function FileStructurePlanner({ 
  onSave, 
  initialTree,
  className = '' 
}: FileStructurePlannerProps) {
  const [tree, setTree] = useState<FileStructureTree>(
    initialTree || createFileStructureTree('New Project', 'Project file structure')
  )
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<FileStructureNode | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'file' | 'folder'>('all')
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [validationResult, setValidationResult] = useState<any>(null)

  // Get all nodes as flat array for easier manipulation
  const allNodes = tree.rootNodes

  // Filter nodes based on search and filter
  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || node.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleAddItem = useCallback((parentId?: string) => {
    if (!newItemName.trim()) return

    const existingPaths = allNodes.map(n => n.path)
    const validation = validatePath(newItemName, existingPaths)
    setValidationResult(validation)

    if (!validation.isValid) return

    const newNode = createFileStructureNode(newItemName, newItemType, parentId)
    
    setTree(prev => ({
      ...prev,
      rootNodes: [...prev.rootNodes, newNode],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }))

    setNewItemName('')
    setValidationResult(null)
  }, [newItemName, newItemType, allNodes])

  const handleDeleteNode = useCallback((nodeId: string) => {
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

  const handleRenameNode = useCallback((nodeId: string, newName: string) => {
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

  const handleDragStart = (event: DragStartEvent) => {
    const node = allNodes.find(n => n.id === event.active.id)
    setDraggedNode(node || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setDraggedNode(null)
      return
    }

    // Handle drag and drop logic here
    // This would involve updating parent-child relationships
    
    setDraggedNode(null)
  }

  const handleExport = (options: FileStructureExportOptions) => {
    try {
      const exported = exportFileStructure(tree, options)
      
      // Create and download file
      const blob = new Blob([exported], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tree.name}.${options.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setShowExportDialog(false)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleSave = () => {
    onSave?.(tree)
  }

  const getFileTypeStats = () => {
    const stats: Record<string, number> = {}
    allNodes.forEach(node => {
      if (node.type === 'file' && node.fileType) {
        stats[node.fileType] = (stats[node.fileType] || 0) + 1
      }
    })
    return stats
  }

  const fileTypeStats = getFileTypeStats()

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{tree.name}</h2>
          <p className="text-sm text-muted-foreground">{tree.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Structure
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b space-y-4">
        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('file')}
            >
              Files
            </Button>
            <Button
              variant={filterType === 'folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('folder')}
            >
              Folders
            </Button>
          </div>
        </div>

        {/* Add New Item */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={newItemType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewItemType('file')}
            >
              <FilePlus className="w-4 h-4 mr-1" />
              File
            </Button>
            <Button
              variant={newItemType === 'folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewItemType('folder')}
            >
              <FolderPlus className="w-4 h-4 mr-1" />
              Folder
            </Button>
          </div>
          <Input
            placeholder={`Enter ${newItemType} name...`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-1"
          />
          <Button onClick={() => handleAddItem()} disabled={!newItemName.trim()}>
            Add
          </Button>
        </div>

        {/* Path Validation */}
        {validationResult && (
          <PathValidationDisplay result={validationResult} />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File Tree */}
        <div className="flex-1 p-4">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredNodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {filteredNodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || filterType !== 'all' 
                      ? 'No items match your search criteria'
                      : 'No files or folders yet. Add some to get started!'
                    }
                  </div>
                ) : (
                  filteredNodes.map(node => (
                    <FileTreeItem
                      key={node.id}
                      node={node}
                      isSelected={selectedNode === node.id}
                      onSelect={setSelectedNode}
                      onDelete={handleDeleteNode}
                      onRename={handleRenameNode}
                    />
                  ))
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {draggedNode && (
                <FileTreeItem
                  node={draggedNode}
                  isSelected={false}
                  onSelect={() => {}}
                  onDelete={() => {}}
                  onRename={() => false}
                  isDragging
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l p-4 space-y-4">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Items:</span>
                <span>{allNodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Files:</span>
                <span>{allNodes.filter(n => n.type === 'file').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Folders:</span>
                <span>{allNodes.filter(n => n.type === 'folder').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* File Types */}
          {Object.keys(fileTypeStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">File Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(fileTypeStats).map(([type, count]) => {
                    const config = FILE_TYPE_CONFIGS[type]
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{config?.icon || '📄'}</span>
                          <span className="text-sm">.{type}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Node Details */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Item</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const node = allNodes.find(n => n.id === selectedNode)
                  if (!node) return null
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {node.name}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {node.type}
                      </div>
                      <div>
                        <span className="font-medium">Path:</span> {node.path}
                      </div>
                      {node.fileType && (
                        <div>
                          <span className="font-medium">File Type:</span> .{node.fileType}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <FileStructureExportDialog
          onExport={handleExport}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  )
}