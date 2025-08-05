import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Bot, Loader2, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { AIStatusIcon } from './ai-status-indicator'

interface AIAssistantButtonProps {
  /**
   * The context for the AI request (e.g., current node, code, etc.)
   */
  context?: any
  
  /**
   * Suggested prompt templates to show
   */
  suggestedPrompts?: Array<{
    label: string
    prompt: string
    templateId?: string
  }>
  
  /**
   * Button variant
   */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  
  /**
   * Button size
   */
  size?: 'sm' | 'default' | 'lg'
  
  /**
   * Custom button text
   */
  buttonText?: string
  
  /**
   * Callback when AI response is received
   */
  onResponse?: (response: string) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * AI Assistant Button Component
 * Provides a quick way to access AI assistance from anywhere in the app
 */
export function AIAssistantButton({
  context,
  suggestedPrompts = [],
  variant = 'outline',
  size = 'sm',
  buttonText = 'AI Assist',
  onResponse,
  className
}: AIAssistantButtonProps) {
  const { 
    isAvailable, 
    isFallbackMode, 
    isLoading, 
    error, 
    sendRequest, 
    clearError 
  } = useAIService()
  
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSendRequest = async () => {
    if (!prompt.trim()) return

    clearError()
    setResponse('')

    try {
      const result = await sendRequest(prompt, context)
      if (result) {
        setResponse(result.content)
        if (onResponse) {
          onResponse(result.content)
        }
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleSuggestedPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt)
  }

  const handleCopyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset state when closing
      setPrompt('')
      setResponse('')
      setCopied(false)
      clearError()
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
          variant={variant} 
          size={size} 
          className={className}
          disabled={!isAvailable}
        >
          <AIStatusIcon className="mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Assistant</span>
            <AIStatusIcon />
          </DialogTitle>
          <DialogDescription>
            Get AI-powered help with your development tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Suggested Prompts */}
          {suggestedPrompts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggested prompts:</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                  >
                    {suggestion.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Your request:</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Ask me anything about your code, architecture, debugging, or development..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={!isAvailable || isLoading}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendRequest}
            disabled={!isAvailable || !prompt.trim() || isLoading}
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

          {/* Response Display */}
          {response && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">AI Response:</Label>
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
              </div>
              
              <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {/* Context Info */}
          {context && (
            <div className="text-xs text-muted-foreground">
              <p>Context: {context.nodeType || 'General'}</p>
              {context.language && <p>Language: {context.language}</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Specialized AI Assistant for Code
 */
export function CodeAIAssistant({ 
  code, 
  language, 
  onResponse, 
  className 
}: {
  code?: string
  language?: string
  onResponse?: (response: string) => void
  className?: string
}) {
  const context = { existingCode: code, language, nodeType: 'code' }
  
  const suggestedPrompts = [
    { label: 'Review this code', prompt: 'Please review this code and suggest improvements' },
    { label: 'Add documentation', prompt: 'Generate comprehensive documentation for this code' },
    { label: 'Optimize performance', prompt: 'How can I optimize this code for better performance?' },
    { label: 'Find bugs', prompt: 'Are there any potential bugs or issues in this code?' }
  ]

  return (
    <AIAssistantButton
      context={context}
      suggestedPrompts={suggestedPrompts}
      buttonText="Code AI"
      onResponse={onResponse}
      className={className}
    />
  )
}

/**
 * Specialized AI Assistant for Regex
 */
export function RegexAIAssistant({ 
  pattern, 
  description, 
  onResponse, 
  className 
}: {
  pattern?: string
  description?: string
  onResponse?: (response: string) => void
  className?: string
}) {
  const context = { pattern, description, nodeType: 'regex' }
  
  const suggestedPrompts = [
    { label: 'Explain pattern', prompt: 'Explain what this regex pattern does in plain English' },
    { label: 'Optimize pattern', prompt: 'How can I optimize this regex pattern for better performance?' },
    { label: 'Generate pattern', prompt: 'Generate a regex pattern for: ' + (description || 'my requirements') },
    { label: 'Find issues', prompt: 'Are there any issues or potential problems with this regex?' }
  ]

  return (
    <AIAssistantButton
      context={context}
      suggestedPrompts={suggestedPrompts}
      buttonText="Regex AI"
      onResponse={onResponse}
      className={className}
    />
  )
}