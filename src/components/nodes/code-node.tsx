
import type { DevFlowNode, NodeStatus, Position, Size } from '../../types'
import { BaseNode } from './base-node'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Code2, Copy, ExternalLink, FileText } from 'lucide-react'
import { copyToClipboard } from '../../lib/utils'
import { AICodeAssistantButton } from '../ai'

interface CodeNodeProps {
  node: DevFlowNode
  isSelected?: boolean
  isResizing?: boolean
  onSelect?: (nodeId: string, multiSelect?: boolean) => void
  onStatusChange?: (nodeId: string, status: NodeStatus) => void
  onPositionChange?: (nodeId: string, position: Position) => void
  onSizeChange?: (nodeId: string, size: Size) => void
  onDelete?: (nodeId: string) => void
  onDuplicate?: (nodeId: string) => void
  onCodeEdit?: (nodeId: string, snippetId: string) => void
  onCodeGenerated?: (nodeId: string, code: string, language: string, title?: string) => void
  className?: string
}

export function CodeNode({
  node,
  isSelected,
  isResizing,
  onSelect,
  onStatusChange,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  onCodeEdit,
  onCodeGenerated,
  className
}: CodeNodeProps) {
  const codeSnippets = node.content.codeSnippets
  const primarySnippet = codeSnippets[0]

  const handleCopyCode = async (code: string) => {
    try {
      await copyToClipboard(code)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      csharp: 'bg-purple-100 text-purple-800',
      cpp: 'bg-gray-100 text-gray-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-pink-100 text-pink-800',
      sql: 'bg-indigo-100 text-indigo-800',
      json: 'bg-teal-100 text-teal-800',
      markdown: 'bg-slate-100 text-slate-800'
    }
    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const truncateCode = (code: string, maxLines: number = 6) => {
    const lines = code.split('\n')
    if (lines.length <= maxLines) return code
    return lines.slice(0, maxLines).join('\n') + '\n...'
  }

  const handleAICodeGenerated = (code: string, language: string, title?: string) => {
    onCodeGenerated?.(node.id, code, language, title)
  }

  return (
    <BaseNode
      node={node}
      isSelected={isSelected}
      isResizing={isResizing}
      onSelect={onSelect}
      onStatusChange={onStatusChange}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      className={className}
    >
      <div className="space-y-3 h-full flex flex-col">
        {/* Code snippets count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {codeSnippets.length} snippet{codeSnippets.length !== 1 ? 's' : ''}
            </span>
          </div>
          {primarySnippet && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getLanguageColor(primarySnippet.language)}`}
            >
              {primarySnippet.language}
            </Badge>
          )}
        </div>

        {/* Primary code snippet */}
        {primarySnippet ? (
          <div className="flex-1 overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium truncate" title={primarySnippet.title}>
                  {primarySnippet.title}
                </h4>
                <div className="flex items-center gap-1">
                  <AICodeAssistantButton
                    node={node}
                    currentSnippet={primarySnippet}
                    onCodeGenerated={handleAICodeGenerated}
                    className="h-6 w-6 p-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopyCode(primarySnippet.code)}
                    title="Copy code"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onCodeEdit?.(node.id, primarySnippet.id)}
                    title="Edit code"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <pre className="text-xs bg-muted/50 rounded p-2 overflow-hidden font-mono leading-relaxed">
                  <code>{truncateCode(primarySnippet.code)}</code>
                </pre>
              </div>

              {primarySnippet.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {primarySnippet.description}
                </p>
              )}

              {/* Tags */}
              {primarySnippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {primarySnippet.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0 h-4">
                      {tag}
                    </Badge>
                  ))}
                  {primarySnippet.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      +{primarySnippet.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Template indicator */}
              {primarySnippet.isTemplate && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">Template</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            No code snippets
          </div>
        )}

        {/* Additional snippets indicator */}
        {codeSnippets.length > 1 && (
          <div className="text-xs text-muted-foreground text-center py-1 border-t">
            +{codeSnippets.length - 1} more snippet{codeSnippets.length - 1 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </BaseNode>
  )
}