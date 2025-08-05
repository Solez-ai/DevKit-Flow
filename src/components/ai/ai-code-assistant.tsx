import { useState, useCallback } from 'react'
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
  Settings
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { useSessions } from '@/hooks/use-app-store'
import { AIStatusIcon } from './ai-status-indicator'
import type { DevFlowNode, CodeSnippet } from '@/types'

interface AICodeAssistantProps {
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

interface AIConversation {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    requestType?: string
    language?: string
    confidence?: number
  }
}

const AI_ASSISTANCE_TYPES = [
  {
    id: 'code-generation',
    label: 'Code Generation',
    icon: Code2,
    description: 'Generate code based on requirements',
    prompts: [
      'Create a function that...',
      'Implement a class for...',
      'Write a utility to...',
      'Generate boilerplate for...'
    ]
  },
  {
    id: 'code-review',
    label: 'Code Review',
    icon: FileText,
    description: 'Review and improve existing code',
    prompts: [
      'Review this code for improvements',
      'Check for potential bugs',
      'Suggest performance optimizations',
      'Improve code readability'
    ]
  },
  {
    id: 'debug-assistance',
    label: 'Debug Help',
    icon: Bug,
    description: 'Debug errors and issues',
    prompts: [
      'Help me debug this error',
      'Why is this code not working?',
      'Fix this performance issue',
      'Explain this error message'
    ]
  },
  {
    id: 'refactoring',
    label: 'Refactoring',
    icon: RefreshCw,
    description: 'Modernize and refactor code',
    prompts: [
      'Modernize this code to ES6+',
      'Refactor to use TypeScript',
      'Extract reusable functions',
      'Apply design patterns'
    ]
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Lightbulb,
    description: 'Plan system architecture',
    prompts: [
      'Design architecture for...',
      'Suggest project structure',
      'Plan component hierarchy',
      'Design database schema'
    ]
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: CheckCircle,
    description: 'Generate tests and improve coverage',
    prompts: [
      'Generate unit tests for this code',
      'Create integration tests',
      'Add edge case testing',
      'Improve test coverage'
    ]
  },
  {
    id: 'complexity-analysis',
    label: 'Complexity Analysis',
    icon: Zap,
    description: 'Analyze and reduce code complexity',
    prompts: [
      'Analyze code complexity',
      'Identify code smells',
      'Suggest simplifications',
      'Improve maintainability'
    ]
  }
]

/**
 * AI-Powered Code Assistant Component
 * Provides comprehensive AI assistance for code development tasks
 */
export function AICodeAssistant({
  node,
  currentSnippet,
  onCodeGenerated,
  onSuggestionApplied,
  className
}: AICodeAssistantProps) {
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
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedAssistanceType, setSelectedAssistanceType] = useState('code-generation')
  const [prompt, setPrompt] = useState('')
  const [conversation, setConversation] = useState<AIConversation[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Get context information for AI
  const getAIContext = useCallback(() => {
    const context: any = {
      nodeType: node?.type,
      nodeTitle: node?.title,
      nodeDescription: node?.description,
      sessionName: currentSession?.name,
      sessionDescription: currentSession?.description
    }

    if (currentSnippet) {
      context.language = currentSnippet.language
      context.existingCode = currentSnippet.code
      context.codeTitle = currentSnippet.title
      context.codeDescription = currentSnippet.description
      context.tags = currentSnippet.tags
    }

    if (node?.content?.codeSnippets && node.content.codeSnippets.length > 0) {
      context.relatedCode = node.content.codeSnippets.map(snippet => ({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code.substring(0, 500) // Truncate for context
      }))
    }

    return context
  }, [node, currentSnippet, currentSession])

  const addToConversation = useCallback((type: 'user' | 'assistant', content: string, metadata?: any) => {
    const newMessage: AIConversation = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      metadata
    }
    setConversation(prev => [...prev, newMessage])
  }, [])

  const handleSendRequest = async () => {
    if (!prompt.trim()) return

    clearError()
    const userPrompt = prompt.trim()
    setPrompt('')
    
    // Add user message to conversation
    addToConversation('user', userPrompt)

    try {
      const context = getAIContext()
      let response

      // Route to appropriate AI method based on assistance type
      switch (selectedAssistanceType) {
        case 'code-generation':
          response = await generateCode(userPrompt, context)
          break
        case 'code-review':
          if (currentSnippet?.code) {
            response = await reviewCode(currentSnippet.code, { ...context, focus: userPrompt })
          } else {
            response = await sendRequest(userPrompt, context, 'code-review')
          }
          break
        case 'debug-assistance':
          if (currentSnippet?.code) {
            response = await debugError(userPrompt, currentSnippet.code, context)
          } else {
            response = await sendRequest(userPrompt, context, 'debug-error')
          }
          break
        case 'refactoring':
          if (currentSnippet?.code && currentSnippet?.language) {
            response = await modernizeCode(currentSnippet.code, currentSnippet.language, context)
          } else {
            response = await sendRequest(userPrompt, context, 'modernize-code')
          }
          break
        case 'architecture':
          // Enhanced architecture assistance with context-aware suggestions
          if (node?.type === 'task' && node.title.toLowerCase().includes('component')) {
            response = await suggestComponentStructure(userPrompt, context)
          } else if (userPrompt.toLowerCase().includes('project') || userPrompt.toLowerCase().includes('scaffold')) {
            response = await generateProjectScaffolding(userPrompt, context)
          } else {
            response = await planArchitecture(userPrompt, context)
          }
          break
        case 'testing':
          if (currentSnippet?.code) {
            response = await generateUnitTests(currentSnippet.code, context)
          } else {
            response = await sendRequest(userPrompt, context, 'unit-test-generation')
          }
          break
        case 'complexity-analysis':
          if (currentSnippet?.code) {
            response = await analyzeCodeComplexity(currentSnippet.code, context)
          } else {
            response = await sendRequest(userPrompt, context, 'complexity-analysis')
          }
          break
        default:
          response = await sendRequest(userPrompt, context)
      }

      if (response) {
        addToConversation('assistant', response.content, {
          requestType: selectedAssistanceType,
          language: context.language,
          confidence: response.confidence
        })
      }
    } catch (err) {
      // Error is handled by the hook
      addToConversation('assistant', 'I apologize, but I encountered an error processing your request. Please try again or check your AI configuration.', {
        requestType: selectedAssistanceType,
        error: true
      })
    }
  }

  const handleQuickPrompt = (promptText: string) => {
    setPrompt(promptText)
  }

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(messageId)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleApplySuggestion = (content: string) => {
    // Try to extract code from the AI response
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = [...content.matchAll(codeBlockRegex)]
    
    if (matches.length > 0) {
      const [, language, code] = matches[0]
      onCodeGenerated?.(code.trim(), language || currentSnippet?.language || 'javascript')
    } else {
      onSuggestionApplied?.(content)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      clearError()
    }
  }

  const selectedType = AI_ASSISTANCE_TYPES.find(type => type.id === selectedAssistanceType)

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
          <Sparkles className="h-4 w-4 mr-1" />
          AI Assistant
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Code Assistant</span>
            <AIStatusIcon />
            {node && (
              <Badge variant="outline" className="ml-2">
                {node.title}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Get AI-powered assistance with code generation, review, debugging, and architecture planning
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="quick-actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col space-y-4 mt-4">
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

              {/* Assistance Type Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assistance Type:</Label>
                <Select value={selectedAssistanceType} onValueChange={setSelectedAssistanceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_ASSISTANCE_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Prompts */}
              {selectedType && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick prompts:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedType.prompts.map((promptText, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleQuickPrompt(promptText)}
                      >
                        {promptText}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation */}
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full border rounded-md p-4">
                  {conversation.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation with your AI assistant</p>
                      <p className="text-sm mt-2">Ask about code generation, debugging, architecture, or any development questions</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversation.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <pre className="whitespace-pre-wrap text-sm font-sans">
                                  {message.content}
                                </pre>
                                {message.metadata?.confidence && (
                                  <div className="mt-2 text-xs opacity-70">
                                    Confidence: {Math.round(message.metadata.confidence * 100)}%
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleCopyMessage(message.id, message.content)}
                                >
                                  {copied === message.id ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                {message.type === 'assistant' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleApplySuggestion(message.content)}
                                    title="Apply suggestion"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <Textarea
                  placeholder={`Ask your AI assistant about ${selectedType?.label.toLowerCase() || 'development'}...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={!isAvailable || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleSendRequest()
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to send
                  </div>
                  <Button
                    onClick={handleSendRequest}
                    disabled={!isAvailable || !prompt.trim() || isLoading}
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
              </div>
            </TabsContent>

            <TabsContent value="quick-actions" className="flex-1 space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_ASSISTANCE_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <Card key={type.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="h-5 w-5" />
                          {type.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {type.description}
                        </p>
                        <div className="space-y-2">
                          {type.prompts.slice(0, 2).map((promptText, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left h-auto py-2"
                              onClick={() => {
                                setSelectedAssistanceType(type.id)
                                setActiveTab('chat')
                                handleQuickPrompt(promptText)
                              }}
                              disabled={!isAvailable}
                            >
                              {promptText}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Context Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {node && (
                    <div>
                      <Label className="text-sm font-medium">Current Node</Label>
                      <div className="text-sm text-muted-foreground">
                        {node.title} ({node.type})
                      </div>
                    </div>
                  )}
                  {currentSnippet && (
                    <div>
                      <Label className="text-sm font-medium">Current Code</Label>
                      <div className="text-sm text-muted-foreground">
                        {currentSnippet.title} ({currentSnippet.language})
                      </div>
                    </div>
                  )}
                  {currentSession && (
                    <div>
                      <Label className="text-sm font-medium">Session</Label>
                      <div className="text-sm text-muted-foreground">
                        {currentSession.name}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">AI Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <AIStatusIcon />
                      <span className="text-sm">
                        {isAvailable ? 'Ready' : isFallbackMode ? 'Offline Mode' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messages: {conversation.length}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConversation([])}
                      disabled={conversation.length === 0}
                    >
                      Clear History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Compact AI Code Assistant Button for toolbars
 */
export function AICodeAssistantButton({ 
  node, 
  currentSnippet, 
  onCodeGenerated, 
  onSuggestionApplied, 
  className 
}: AICodeAssistantProps) {
  return (
    <AICodeAssistant
      node={node}
      currentSnippet={currentSnippet}
      onCodeGenerated={onCodeGenerated}
      onSuggestionApplied={onSuggestionApplied}
      className={className}
    />
  )
}