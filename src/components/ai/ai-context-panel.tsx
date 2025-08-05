import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Bot, 
  Loader2, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  Code2, 
  FileText, 
  Bug, 
  Zap, 
  Lightbulb,
  RefreshCw,
  Sparkles,
  Send
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { useSessions } from '@/hooks/use-app-store'
import { AIStatusIcon } from './ai-status-indicator'
import type { DevFlowNode } from '@/types'

interface AIContextPanelProps {
  /**
   * Current selected node for context
   */
  selectedNode?: DevFlowNode
  
  /**
   * Callback when AI generates code
   */
  onCodeGenerated?: (code: string, language: string, title?: string) => void
  
  /**
   * Callback when AI provides suggestions
   */
  onSuggestionApplied?: (suggestion: string) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
  description: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'generate-code',
    label: 'Generate Code',
    icon: Code2,
    prompt: 'Generate code for this task based on the title and description',
    description: 'Create code implementation'
  },
  {
    id: 'review-code',
    label: 'Review Code',
    icon: FileText,
    prompt: 'Review the existing code and suggest improvements',
    description: 'Get code review suggestions'
  },
  {
    id: 'debug-help',
    label: 'Debug Help',
    icon: Bug,
    prompt: 'Help me debug any issues in this code',
    description: 'Debug assistance'
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: Zap,
    prompt: 'Optimize this code for better performance',
    description: 'Performance optimization'
  },
  {
    id: 'refactor',
    label: 'Refactor',
    icon: RefreshCw,
    prompt: 'Refactor this code to modern standards',
    description: 'Code modernization'
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Lightbulb,
    prompt: 'Suggest architecture improvements for this component',
    description: 'Architecture guidance'
  },
  {
    id: 'generate-tests',
    label: 'Generate Tests',
    icon: CheckCircle,
    prompt: 'Generate comprehensive unit tests for this code',
    description: 'Create test cases'
  },
  {
    id: 'analyze-complexity',
    label: 'Analyze Complexity',
    icon: Zap,
    prompt: 'Analyze the complexity of this code and suggest improvements',
    description: 'Complexity analysis'
  }
]

/**
 * AI Context Panel Component
 * Provides contextual AI assistance based on the selected node
 */
export function AIContextPanel({
  selectedNode,
  onCodeGenerated,
  onSuggestionApplied,
  className
}: AIContextPanelProps) {
  const { 
    isAvailable, 
    isFallbackMode, 
    isLoading, 
    error, 
    sendRequest,
    clearError 
  } = useAIService()
  
  const { currentSession } = useSessions()
  
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [copied, setCopied] = useState(false)

  // Get context information for AI
  const getAIContext = useCallback(() => {
    const context: any = {
      sessionName: currentSession?.name,
      sessionDescription: currentSession?.description
    }

    if (selectedNode) {
      context.nodeType = selectedNode.type
      context.nodeTitle = selectedNode.title
      context.nodeDescription = selectedNode.description
      context.nodeStatus = selectedNode.status
      
      // Add todos context
      if (selectedNode.content.todos.length > 0) {
        context.todos = selectedNode.content.todos.map(todo => ({
          text: todo.text,
          completed: todo.completed
        }))
      }

      // Add code snippets context
      if (selectedNode.content.codeSnippets.length > 0) {
        context.codeSnippets = selectedNode.content.codeSnippets.map(snippet => ({
          title: snippet.title,
          language: snippet.language,
          code: snippet.code.substring(0, 1000), // Truncate for context
          description: snippet.description
        }))
      }

      // Add references context
      if (selectedNode.content.references.length > 0) {
        context.references = selectedNode.content.references.map(ref => ({
          title: ref.title,
          url: ref.url,
          type: ref.type
        }))
      }

      // Add comments context
      if (selectedNode.content.comments.length > 0) {
        context.comments = selectedNode.content.comments.map(comment => comment.text)
      }
    }

    return context
  }, [selectedNode, currentSession])

  const handleSendRequest = async (requestPrompt?: string) => {
    const finalPrompt = requestPrompt || prompt.trim()
    if (!finalPrompt) return

    clearError()
    setResponse('')
    
    if (!requestPrompt) {
      setPrompt('')
    }

    try {
      const context = getAIContext()
      const result = await sendRequest(finalPrompt, context)
      
      if (result) {
        setResponse(result.content)
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendRequest(action.prompt)
  }

  const handleCopyResponse = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy response:', error)
      }
    }
  }

  const handleApplyResponse = () => {
    if (!response) return

    // Try to extract code from the AI response
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = [...response.matchAll(codeBlockRegex)]
    
    if (matches.length > 0) {
      const [, language, code] = matches[0]
      onCodeGenerated?.(
        code.trim(), 
        language || 'javascript',
        selectedNode?.title ? `${selectedNode.title} - AI Generated` : 'AI Generated Code'
      )
    } else {
      onSuggestionApplied?.(response)
    }
  }

  // Don't render if AI is not available and we're not in fallback mode
  if (!isAvailable && !isFallbackMode) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-4">
            AI features are not available. Enable AI in settings to use this feature.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          AI Assistant
          <AIStatusIcon />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Fallback Mode Notice */}
        {isFallbackMode && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              AI features are currently offline. Enable AI in settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Context Information */}
        {selectedNode && (
          <div className="space-y-2">
            <div className="text-xs font-medium">Context:</div>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                {selectedNode.type} node
              </Badge>
              <div className="text-xs text-muted-foreground">
                {selectedNode.title}
              </div>
              {selectedNode.content.codeSnippets.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {selectedNode.content.codeSnippets.length} code snippet(s)
                </div>
              )}
              {selectedNode.content.todos.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {selectedNode.content.todos.filter(t => !t.completed).length} pending todo(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Quick Actions:</div>
          <div className="grid grid-cols-2 gap-1">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs justify-start"
                  onClick={() => handleQuickAction(action)}
                  disabled={!isAvailable || isLoading}
                  title={action.description}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <div className="text-xs font-medium">Custom Request:</div>
          <Textarea
            placeholder="Ask me anything about your code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="text-xs"
            disabled={!isAvailable || isLoading}
          />
          <Button
            onClick={() => handleSendRequest()}
            disabled={!isAvailable || !prompt.trim() || isLoading}
            size="sm"
            className="w-full h-7 text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-1 h-3 w-3" />
                Send Request
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">AI Response:</div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyResponse}
                  disabled={copied}
                  className="h-6 w-6 p-0"
                >
                  {copied ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyResponse}
                  className="h-6 w-6 p-0"
                  title="Apply suggestion"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-32 border rounded p-2">
              <pre className="whitespace-pre-wrap text-xs font-mono">
                {response}
              </pre>
            </ScrollArea>
          </div>
        )}

        {/* No Context Message */}
        {!selectedNode && (
          <div className="text-center text-xs text-muted-foreground py-4">
            Select a node to get contextual AI assistance
          </div>
        )}
      </CardContent>
    </Card>
  )
}