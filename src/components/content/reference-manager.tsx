import React, { useState } from 'react'
import type { Reference } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  X, 
  ExternalLink, 
  Edit2, 
  Check, 
  Link2,
  BookOpen,
  FileText,
  Video,
  Star
} from 'lucide-react'
import { cn, validateUrl } from '@/lib/utils'

interface ReferenceManagerProps {
  references: Reference[]
  onAddReference?: (reference: Omit<Reference, 'id'>) => void
  onUpdateReference?: (referenceId: string, updates: Partial<Reference>) => void
  onDeleteReference?: (referenceId: string) => void
  className?: string
  maxHeight?: string
}

interface NewReference {
  title: string
  url: string
  type: Reference['type']
  description: string
  importance: Reference['importance']
}

const REFERENCE_TYPES: { value: Reference['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'documentation', label: 'Documentation', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'article', label: 'Article', icon: <FileText className="h-4 w-4" /> },
  { value: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
  { value: 'internal', label: 'Internal', icon: <Link2 className="h-4 w-4" /> }
]

const IMPORTANCE_LEVELS: { value: Reference['importance']; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' }
]

export function ReferenceManager({
  references,
  onAddReference,
  onUpdateReference,
  onDeleteReference,
  className,
  maxHeight = "400px"
}: ReferenceManagerProps) {
  const [isAddingReference, setIsAddingReference] = useState(false)
  const [editingReference, setEditingReference] = useState<string | null>(null)
  const [newReference, setNewReference] = useState<NewReference>({
    title: '',
    url: '',
    type: 'documentation',
    description: '',
    importance: 'medium'
  })
  const [editData, setEditData] = useState<Partial<Reference>>({})

  const handleAddReference = () => {
    if (newReference.title.trim() && (newReference.url.trim() || newReference.type === 'internal')) {
      const isValidUrl = !newReference.url || validateUrl(newReference.url)
      if (isValidUrl) {
        onAddReference?.({
          ...newReference,
          title: newReference.title.trim(),
          url: newReference.url.trim() || undefined,
          description: newReference.description.trim() || undefined
        })
        setNewReference({
          title: '',
          url: '',
          type: 'documentation',
          description: '',
          importance: 'medium'
        })
        setIsAddingReference(false)
      }
    }
  }

  const handleEditReference = (reference: Reference) => {
    setEditingReference(reference.id)
    setEditData(reference)
  }

  const handleSaveEdit = () => {
    if (editingReference && editData.title?.trim()) {
      const isValidUrl = !editData.url || validateUrl(editData.url)
      if (isValidUrl) {
        onUpdateReference?.(editingReference, {
          ...editData,
          title: editData.title.trim(),
          url: editData.url?.trim() || undefined,
          description: editData.description?.trim() || undefined
        })
        setEditingReference(null)
        setEditData({})
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingReference(null)
    setEditData({})
  }

  const handleOpenReference = (reference: Reference) => {
    if (reference.url) {
      window.open(reference.url, '_blank', 'noopener,noreferrer')
    }
  }

  const getTypeIcon = (type: Reference['type']) => {
    return REFERENCE_TYPES.find(t => t.value === type)?.icon || <Link2 className="h-4 w-4" />
  }

  const getImportanceColor = (importance: Reference['importance']) => {
    return IMPORTANCE_LEVELS.find(i => i.value === importance)?.color || 'text-gray-600'
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          <h3 className="text-sm font-medium">References</h3>
          <Badge variant="outline" className="text-xs">
            {references.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingReference(true)}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add new reference form */}
      {isAddingReference && (
        <div className="space-y-3 p-3 border rounded-md">
          <Input
            placeholder="Reference title"
            value={newReference.title}
            onChange={(e) => setNewReference(prev => ({ ...prev, title: e.target.value }))}
            className="h-8"
          />

          <Input
            placeholder="URL (optional for internal references)"
            value={newReference.url}
            onChange={(e) => setNewReference(prev => ({ ...prev, url: e.target.value }))}
            className="h-8"
          />

          <div className="flex gap-2">
            <select
              value={newReference.type}
              onChange={(e) => setNewReference(prev => ({ ...prev, type: e.target.value as Reference['type'] }))}
              className="flex-1 h-8 px-2 border rounded text-sm"
            >
              {REFERENCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={newReference.importance}
              onChange={(e) => setNewReference(prev => ({ ...prev, importance: e.target.value as Reference['importance'] }))}
              className="flex-1 h-8 px-2 border rounded text-sm"
            >
              {IMPORTANCE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <Textarea
            placeholder="Description (optional)"
            value={newReference.description}
            onChange={(e) => setNewReference(prev => ({ ...prev, description: e.target.value }))}
            className="h-16 text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingReference(false)}
              className="h-7"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddReference}
              disabled={!newReference.title.trim()}
              className="h-7"
            >
              Add Reference
            </Button>
          </div>
        </div>
      )}

      {/* References list */}
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight }}
      >
        {references.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No references yet. Click the + button to add one.
          </div>
        ) : (
          references.map((reference) => (
            <div
              key={reference.id}
              className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
            >
              {editingReference === reference.id ? (
                <div className="space-y-3">
                  <Input
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-8"
                  />

                  <Input
                    value={editData.url || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL (optional)"
                    className="h-8"
                  />

                  <div className="flex gap-2">
                    <select
                      value={editData.type || 'documentation'}
                      onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as Reference['type'] }))}
                      className="flex-1 h-8 px-2 border rounded text-sm"
                    >
                      {REFERENCE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>

                    <select
                      value={editData.importance || 'medium'}
                      onChange={(e) => setEditData(prev => ({ ...prev, importance: e.target.value as Reference['importance'] }))}
                      className="flex-1 h-8 px-2 border rounded text-sm"
                    >
                      {IMPORTANCE_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="h-16 text-sm"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-7"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-0.5">
                        {getTypeIcon(reference.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="text-sm font-medium leading-tight cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleOpenReference(reference)}
                          title={reference.title}
                        >
                          {reference.title}
                        </h4>
                        {reference.url && (
                          <p 
                            className="text-xs text-muted-foreground truncate mt-1 cursor-pointer hover:text-blue-600"
                            onClick={() => handleOpenReference(reference)}
                            title={reference.url}
                          >
                            {reference.url}
                          </p>
                        )}
                        {reference.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {reference.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <div className={`flex items-center gap-1 ${getImportanceColor(reference.importance)}`}>
                        <Star className="h-3 w-3" />
                        <span className="text-xs capitalize">{reference.importance}</span>
                      </div>
                      {reference.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenReference(reference)}
                          className="h-6 w-6 p-0"
                          title="Open link"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReference(reference)}
                        className="h-6 w-6 p-0"
                        title="Edit reference"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteReference?.(reference.id)}
                        className="h-6 w-6 p-0 text-red-600"
                        title="Delete reference"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {REFERENCE_TYPES.find(t => t.value === reference.type)?.label}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}