import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  MessageSquare,
  Settings,
  Wand2,
  Brain,
  Target,
  Layers
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { useSessions } from '@/hooks/use-app-store'
import { AIStatusIcon } from './ai-status-indicator'
import type { DevFlowNode, CodeSnippet } from '@/types'

interface EnhancedCodeAssistantProps {
  /**
   * Current node context for AI assistance
   */
  node?: DevFlowNode
  
  /**
   * Current code snippet being worked on
   */
  currentSnippet?: CodeSnippet
  
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

interface SmartSuggestion {
  id: string
  type: 'code-generation' | 'architecture' | 'testing' | 'refactoring' | 'documentation'
  title: string
  description: string
  prompt: string
  confidence: number
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Enhanced AI-Powered Code Assistant Component
 * Provides intelligent, context-aware assistance based on the current node and session state
 */
export function EnhancedCodeAssistant({
  node,
  currentSnippet,
  onCodeGenerated,
  onSuggestionApplied,
  className
}: EnhancedCodeAssistantProps) {
  const { 
    isAvailable, 
    isFallbackMode, 
    isLoading, 
    error, 
    generateCode,
    reviewCode,
    generateDocumentation,
    debugError,
    modernizeCode,
    extractFunctions,
    planArchitecture,
    suggestComponentStructure,
    generateProjectScaffolding,
    analyzeCodeComplexity,
    generateUnitTests,
    sendRequest,
    clearError 
  } = useAIService()
  
  const { currentSession } = useSessions()
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('smart-suggestions')
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate smart suggestions based on context
  const generateSmartSuggestions = useCallback(() => {
    const suggestions: SmartSuggestion[] = []

    if (!node) return suggestions

    // Code generation suggestions
    if (node.type === 'task' && node.content.codeSnippets.length === 0) {
      suggestions.push({
        id: 'generate-implementation',
        type: 'code-generation',
        title: 'Generate Implementation',
        description: 'Create code implementation based on task requirements',
        prompt: `Generate code implementation for: ${node.title}\n\nDescription: ${node.description || 'No description provided'}\n\nRequirements from todos:\n${node.content.todos.map(t => `- ${t.text}`).join('\n')}`,
        confidence: 0.9,
        icon: Code2
      })
    }

    // Architecture suggestions for complex tasks
    if (node.type === 'task' && (
      node.title.toLowerCase().includes('architecture') ||
      node.title.toLowerCase().includes('design') ||
      node.title.toLowerCase().includes('structure')
    )) {
      suggestions.push({
        id: 'suggest-architecture',
        type: 'architecture',
        title: 'Suggest Architecture',
        description: 'Get architectural guidance for this component or system',
        prompt: `Suggest architecture for: ${node.title}\n\nContext: ${node.description || ''}\n\nConsider the session context: ${currentSession?.name}`,
        confidence: 0.85,
        icon: Layers
      })
    }

    // Code review suggestions for code nodes
    if (node.type === 'code' && node.content.codeSnippets.length > 0) {
      suggestions.push({
        id: 'review-code',
        type: 'refactoring',
        title: 'Review & Improve Code',
        description: 'Get suggestions to improve existing code quality',
        prompt: 'Review this code and suggest improvements for better quality, performance, and maintainability',
        confidence: 0.8,
        icon: FileText
      })
    }

    // Testing suggestions
    if (node.content.codeSnippets.length > 0 && !node.content.codeSnippets.some(s => s.title.toLowerCase().includes('test'))) {
      suggestions.push({
        id: 'generate-tests',
        type: 'testing',
        title: 'Generate Tests',
        description: 'Create comprehensive unit tests for the code',
        prompt: 'Generate comprehensive unit tests for the code in this node',
        confidence: 0.75,
        icon: CheckCircle
      })
    }

    // Documentation suggestions
    if (node.content.codeSnippets.length > 0 && !node.content.comments.length) {
      suggestions.push({
        id: 'generate-docs',
        type: 'documentation',
        title: 'Generate Documentation',
        description: 'Create detailed documentation for the code',
        prompt: 'Generate comprehensive documentation for the code in this node',
        confidence: 0.7,
        icon: FileText
      })
    }

    // Refactoring suggestions for older code
    if (currentSnippet && currentSnippet.code.length > 500) {
      suggestions.push({
        id: 'refactor-code',
        type: 'refactoring',
        title: 'Refactor Complex Code',
        description: 'Simplify and modernize complex code',
        prompt: 'Refactor this code to be more maintainable and follow modern best practices',
        confidence: 0.8,
        icon: RefreshCw
      })
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }, [node, currentSnippet, currentSession])

  // Update suggestions when context changes
  useEffect(() => {
    if (isOpen && isAvailable) {
      setSmartSuggestions(generateSmartSuggestions())
    }
  }, [isOpen, isAvailable, generateSmartSuggestions])

  // Get enhanced context information for AI
  const getEnhancedContext = useCallback(() => {
    const context: any = {
      sessionName: currentSession?.name,
      sessionDescription: currentSession?.description,
      sessionProgress: currentSession ? {
        totalNodes: currentSession.nodes.length,
        completedNodes: currentSession.nodes.filter(n => n.status === 'completed').length,
        activeNodes: currentSession.nodes.filter(n => n.status === 'active').length
      } : null
    }

    if (node) {
      context.nodeType = node.type
      context.nodeTitle = node.title
      context.nodeDescription = node.description
      context.nodeStatus = node.status
      context.nodeTags = node.metadata.tags
      context.nodePriority = node.metadata.priority

      // Enhanced todo context
      if (node.content.todos.length > 0) {
        context.todos = {
          total: node.content.todos.length,
          completed: node.content.todos.filter(t => t.completed).length,
          pending: node.content.todos.filter(t => !t.completed),
          completedItems: node.content.todos.filter(t => t.completed)
        }
      }

      // Enhanced code context
      if (node.content.codeSnippets.length > 0) {
        context.codeSnippets = node.content.codeSnippets.map(snippet => ({
          title: snippet.title,
          language: snippet.language,
          codeLength: snippet.code.length,
          tags: snippet.tags,
          isTemplate: snippet.isTemplate,
          // Include full code for current snippet, truncated for others
          code: snippet.id === currentSnippet?.id ? snippet.code : snippet.code.substring(0, 500)
        }))
      }

      // Related nodes context
      if (currentSession) {
        const relatedNodes = currentSession.connections
          .filter(c => c.sourceNodeId === node.id || c.targetNodeId === node.id)
          .map(c => {
            const relatedNodeId = c.sourceNodeId === node.id ? c.targetNodeId : c.sourceNodeId
            const relatedNode = currentSession.nodes.find(n => n.id === relatedNodeId)
            return relatedNode ? {
              title: relatedNode.title,
              type: relatedNode.type,
              status: relatedNode.status,
              connectionType: c.type
            } : null
          })
          .filter(Boolean)

        if (relatedNodes.length > 0) {
          context.relatedNodes = relatedNodes
        }
      }
    }

    return context
  }, [node, currentSnippet, currentSession])

  const handleSmartSuggestion = async (suggestion: SmartSuggestion) => {
    clearError()
    setResponse('')
    setActiveTab('response')

    try {
      const context = getEnhancedContext()
      let response

      // Route to appropriate AI method based on suggestion type
      switch (suggestion.type) {
        case 'code-generation':
          response = await generateCode(suggestion.prompt, context)
          break
        case 'architecture':
          if (suggestion.prompt.toLowerCase().includes('component')) {
            response = await suggestComponentStructure(suggestion.prompt, context)
          } else {
            response = await planArchitecture(suggestion.prompt, context)
          }
          break
        case 'testing':
          if (currentSnippet?.code) {
            response = await generateUnitTests(currentSnippet.code, context)
          } else {
            response = await sendRequest(suggestion.prompt, context, 'unit-test-generation')
          }
          break
        case 'refactoring':
          if (currentSnippet?.code && currentSnippet?.language) {
            response = await modernizeCode(currentSnippet.code, currentSnippet.language, context)
          } else {
            response = await sendRequest(suggestion.prompt, context, 'modernize-code')
          }
          break
        case 'documentation':
          if (currentSnippet?.code) {
            response = await generateDocumentation(currentSnippet.code, context)
          } else {
            response = await sendRequest(suggestion.prompt, context, 'function-documentation')
          }
          break
        default:
          response = await sendRequest(suggestion.prompt, context)
      }

      if (response) {
        const content = typeof response === 'string' ? response : (response as any).content
        setResponse(content)
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleCustomRequest = async () => {
    if (!customPrompt.trim()) return

    clearError()
    setResponse('')
    setActiveTab('response')

    try {
      const context = getEnhancedContext()
      const response = await sendRequest(customPrompt, context)
      
      if (response) {
        const content = typeof response === 'string' ? response : (response as any).content
        setResponse(content)
      }
    } catch (err) {
      // Error is handled by the hook
    }

    setCustomPrompt('')
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
        language || currentSnippet?.language || 'javascript',
        node?.title ? `${node.title} - AI Enhanced` : 'AI Generated Code'
      )
    } else {
      onSuggestionApplied?.(response)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      clearError()
      setResponse('')
      setCopied(false)
    }
  }

  // Don't render if AI is not available and we're not in fallback mode
  if (!isAvailable && !isFallbackMode) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={!isAvailable}
        >
          <AIStatusIcon className="mr-2" />
          <Brain className="h-4 w-4 mr-1" />
          Smart AI Assistant
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Enhanced AI Code Assistant</span>
            <AIStatusIcon />
            {node && (
              <Badge variant="outline" className="ml-2">
                {node.title}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Get intelligent, context-aware assistance tailored to your current development task
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="smart-suggestions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Smart Suggestions
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Custom Request
              </TabsTrigger>
              <TabsTrigger value="response" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Response
              </TabsTrigger>
              <TabsTrigger value="context" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Context
              </TabsTrigger>
            </TabsList>

            <TabsContent value="smart-suggestions" className="flex-1 flex flex-col space-y-4 mt-4">
              {/* Error Display */}
              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {/* Fallback Mode Notice */}
              {isFallbackMode && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    AI features are currently offline. Enable AI in settings to use this feature.
                  </AlertDescription>
                </Alert>
              )}

              {/* Smart Suggestions */}
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {smartSuggestions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        AI-powered suggestions based on your current context:
                      </div>
                      {smartSuggestions.map((suggestion) => {
                        const Icon = suggestion.icon
                        return (
                          <Card 
                            key={suggestion.id} 
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleSmartSuggestion(suggestion)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Icon className="h-5 w-5" />
                                {suggestion.title}
                                <Badge variant="outline" className="ml-auto">
                                  {Math.round(suggestion.confidence * 100)}% match
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">
                                {suggestion.description}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={!isAvailable || isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Apply Suggestion
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No smart suggestions available</p>
                      <p className="text-sm mt-2">
                        {node ? 'Try selecting a different node or adding more context' : 'Select a node to get contextual suggestions'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="flex-1 flex flex-col space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-prompt">Custom AI Request:</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Ask me anything about your code, architecture, or development process..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                    disabled={!isAvailable || isLoading}
                    className="mt-2"
                  />
                </div>
                
                <Button
                  onClick={handleCustomRequest}
                  disabled={!isAvailable || !customPrompt.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="response" className="flex-1 flex flex-col space-y-4 mt-4">
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">AI Response:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyResponse}
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleApplyResponse}
                      >
                        <Sparkles className="mr-2 h-3 w-3" />
                        Apply
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 border rounded-md p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {response}
                    </pre>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>AI response will appear here</p>
                  <p className="text-sm mt-2">Use smart suggestions or send a custom request</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="context" className="flex-1 space-y-4 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Context</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {node ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Node</Label>
                            <div className="text-sm text-muted-foreground">
                              {node.title} ({node.type})
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <Badge variant="outline" className="ml-2">
                              {node.status}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Progress</Label>
                            <div className="text-sm text-muted-foreground">
                              {node.content.todos.filter(t => t.completed).length} / {node.content.todos.length} todos completed
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Code Snippets</Label>
                            <div className="text-sm text-muted-foreground">
                              {node.content.codeSnippets.length} snippet(s)
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No node selected
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Context</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentSession ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Session</Label>
                            <div className="text-sm text-muted-foreground">
                              {currentSession.name}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Progress</Label>
                            <div className="text-sm text-muted-foreground">
                              {currentSession.nodes.filter(n => n.status === 'completed').length} / {currentSession.nodes.length} nodes completed
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No session active
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <AIStatusIcon />
                        <span className="text-sm">
                          {isAvailable ? 'Ready' : isFallbackMode ? 'Offline Mode' : 'Disabled'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}