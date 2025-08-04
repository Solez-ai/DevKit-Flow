import { useState, useCallback } from 'react'
import { Bot, Wand2, Lightbulb, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { useAIService } from '../../hooks/use-ai-service'
import type { AIResponse } from '../../types'

interface AIRegexAssistantProps {
  currentPattern?: string
  onPatternGenerated: (pattern: string, explanation: string) => void
  onOptimizationSuggested: (optimizedPattern: string, explanation: string) => void
  className?: string
}

export function AIRegexAssistant({
  currentPattern = '',
  onPatternGenerated,
  onOptimizationSuggested,
  className = ''
}: AIRegexAssistantProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [description, setDescription] = useState('')
  const [examples, setExamples] = useState('')
  const [issues, setIssues] = useState('')
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null)
  
  const {
    generateRegex,
    optimizeRegex,
    isLoading,
    error,
    isAvailable,
    isFallbackMode,
    clearError
  } = useAIService()

  const handleGenerateRegex = useCallback(async () => {
    if (!description.trim()) return
    
    clearError()
    
    const exampleList = examples.split('\n').filter(ex => ex.trim()).map(ex => ex.trim())
    
    const response = await generateRegex(description, {
      examples: exampleList.length > 0 ? exampleList : undefined
    })
    
    if (response) {
      setLastResponse(response)
      // Extract pattern from response (assuming it's in the content)
      const patternMatch = response.content.match(/`([^`]+)`/)
      if (patternMatch) {
        onPatternGenerated(patternMatch[1], response.content)
      }
    }
  }, [description, examples, generateRegex, onPatternGenerated, clearError])

  const handleOptimizeRegex = useCallback(async () => {
    if (!currentPattern.trim()) return
    
    clearError()
    
    const issueList = issues.split('\n').filter(issue => issue.trim()).map(issue => issue.trim())
    
    const response = await optimizeRegex(currentPattern, {
      issues: issueList.length > 0 ? issueList : undefined
    })
    
    if (response) {
      setLastResponse(response)
      // Extract optimized pattern from response
      const patternMatch = response.content.match(/`([^`]+)`/)
      if (patternMatch) {
        onOptimizationSuggested(patternMatch[1], response.content)
      }
    }
  }, [currentPattern, issues, optimizeRegex, onOptimizationSuggested, clearError])

  if (!isAvailable) {
    return (
      <Card className={`w-96 ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            AI Regex Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isFallbackMode 
                ? 'AI features are currently unavailable. Working in offline mode.'
                : 'AI features are disabled. Enable them in settings to use the AI assistant.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-96 ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          AI Regex Assistant
          <Badge variant="secondary" className="ml-2 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Generate and optimize regex patterns with AI assistance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="optimize" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Optimize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Describe what you want to match
                </label>
                <Textarea
                  placeholder="e.g., Email addresses, phone numbers, URLs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Examples (optional)
                </label>
                <Textarea
                  placeholder="One example per line..."
                  value={examples}
                  onChange={(e) => setExamples(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              
              <Button
                onClick={handleGenerateRegex}
                disabled={!description.trim() || isLoading}
                className="w-full text-sm"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-2" />
                    Generate Pattern
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Current Pattern
                </label>
                <Input
                  value={currentPattern}
                  readOnly
                  className="text-sm font-mono bg-muted"
                  placeholder="No pattern selected"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Known Issues (optional)
                </label>
                <Textarea
                  placeholder="e.g., Too slow, doesn't match edge cases..."
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              
              <Button
                onClick={handleOptimizeRegex}
                disabled={!currentPattern.trim() || isLoading}
                className="w-full text-sm"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-3 w-3 mr-2" />
                    Optimize Pattern
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Response Display */}
        {lastResponse && !error && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                AI Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-48">
                <div className="text-xs whitespace-pre-wrap">
                  {lastResponse.content}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}