import { useState, useCallback } from 'react'
import { Bug, Search, Zap, AlertTriangle, CheckCircle, Loader2, Target } from 'lucide-react'
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

interface AIDebugHelperProps {
  pattern: string
  testString: string
  expectedResult?: boolean
  actualResult?: boolean
  onSuggestionApplied?: (suggestion: string) => void
  className?: string
}

export function AIDebugHelper({
  pattern,
  testString,
  expectedResult,
  actualResult,
  onSuggestionApplied,
  className = ''
}: AIDebugHelperProps) {
  const [activeTab, setActiveTab] = useState('debug')
  const [customIssue, setCustomIssue] = useState('')
  const [performanceIssue, setPerformanceIssue] = useState('')
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null)
  
  const {
    sendRequest,
    isLoading,
    error,
    isAvailable,
    isFallbackMode,
    clearError
  } = useAIService()

  const debugPattern = useCallback(async () => {
    if (!pattern.trim()) return
    
    clearError()
    
    let prompt = `Debug this regular expression pattern:

Pattern: ${pattern}
Test String: "${testString}"
`

    if (expectedResult !== undefined && actualResult !== undefined) {
      prompt += `Expected Match: ${expectedResult ? 'Yes' : 'No'}
Actual Match: ${actualResult ? 'Yes' : 'No'}
`
    }

    if (customIssue.trim()) {
      prompt += `Reported Issue: ${customIssue}
`
    }

    prompt += `
Please analyze the pattern and provide:
1. Identify what might be wrong with the pattern
2. Explain why it's not working as expected
3. Provide a corrected version if needed
4. Suggest test cases to validate the fix
5. Explain the debugging process

Be specific and educational in your response.`

    const response = await sendRequest(prompt, {
      pattern,
      testString,
      expectedResult,
      actualResult,
      issue: customIssue
    })
    
    if (response) {
      const aiResponse: AIResponse = {
        id: `debug_${Date.now()}`,
        requestId: `req_${Date.now()}`,
        content: (response as any),
        timestamp: new Date(),
        processingTime: 0
      }
      setLastResponse(aiResponse)
    }
  }, [pattern, testString, expectedResult, actualResult, customIssue, sendRequest, clearError])

  const debugPerformance = useCallback(async () => {
    if (!pattern.trim()) return
    
    clearError()
    
    const prompt = `Analyze this regular expression for performance issues:

Pattern: ${pattern}
${performanceIssue.trim() ? `Reported Issue: ${performanceIssue}` : ''}

Please provide:
1. Performance analysis of the pattern
2. Identify potential bottlenecks (backtracking, catastrophic backtracking, etc.)
3. Suggest optimizations
4. Provide an improved version if possible
5. Explain the performance implications

Focus on practical improvements and explain the reasoning.`

    const response = await sendRequest(prompt, {
      pattern,
      issue: performanceIssue,
      analysisType: 'performance'
    })
    
    if (response) {
      const aiResponse: AIResponse = {
        id: `perf_${Date.now()}`,
        requestId: `req_${Date.now()}`,
        content: (response as any),
        timestamp: new Date(),
        processingTime: 0
      }
      setLastResponse(aiResponse)
    }
  }, [pattern, performanceIssue, sendRequest, clearError])

  const findAlternatives = useCallback(async () => {
    if (!pattern.trim()) return
    
    clearError()
    
    const prompt = `Suggest alternative approaches for this regular expression:

Pattern: ${pattern}
Test Context: "${testString}"

Please provide:
1. Alternative regex patterns that achieve the same goal
2. Different approaches (more readable, more efficient, more specific)
3. Pros and cons of each alternative
4. When to use each approach
5. Non-regex alternatives if applicable

Focus on practical alternatives with clear explanations.`

    const response = await sendRequest(prompt, {
      pattern,
      testString,
      analysisType: 'alternatives'
    })
    
    if (response) {
      const aiResponse: AIResponse = {
        id: `alt_${Date.now()}`,
        requestId: `req_${Date.now()}`,
        content: (response as any),
        timestamp: new Date(),
        processingTime: 0
      }
      setLastResponse(aiResponse)
    }
  }, [pattern, testString, sendRequest, clearError])

  const applySuggestion = useCallback((suggestion: string) => {
    // Extract pattern from suggestion (look for code blocks or patterns)
    const patternMatch = suggestion.match(/`([^`]+)`/) || suggestion.match(/\/([^\/]+)\//)
    if (patternMatch && onSuggestionApplied) {
      onSuggestionApplied(patternMatch[1])
    }
  }, [onSuggestionApplied])

  if (!isAvailable) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            AI Debug Helper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isFallbackMode 
                ? 'AI debugging is currently unavailable. Working in offline mode.'
                : 'Enable AI features in settings to use intelligent debugging assistance.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const hasIssue = expectedResult !== undefined && actualResult !== undefined && expectedResult !== actualResult

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          AI Debug Helper
          {hasIssue && (
            <Badge variant="destructive" className="ml-2 text-xs">
              Issue Detected
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          Get AI assistance for debugging regex patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="debug" className="text-xs">
              <Bug className="h-3 w-3 mr-1" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="alternatives" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Alternatives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="debug" className="space-y-4 mt-4">
            {/* Current Context */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Current Pattern</label>
                <Input
                  value={pattern}
                  readOnly
                  className="text-sm font-mono bg-muted"
                  placeholder="No pattern to debug"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">Test String</label>
                <Input
                  value={testString}
                  readOnly
                  className="text-sm bg-muted"
                  placeholder="No test string"
                />
              </div>
              
              {hasIssue && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Expected {expectedResult ? 'match' : 'no match'}, but got {actualResult ? 'match' : 'no match'}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Describe the Issue (optional)
                </label>
                <Textarea
                  placeholder="e.g., Pattern doesn't match email addresses with dots..."
                  value={customIssue}
                  onChange={(e) => setCustomIssue(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              
              <Button
                onClick={debugPattern}
                disabled={!pattern.trim() || isLoading}
                className="w-full text-sm"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Debugging...
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 mr-2" />
                    Debug Pattern
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Pattern to Analyze</label>
                <Input
                  value={pattern}
                  readOnly
                  className="text-sm font-mono bg-muted"
                  placeholder="No pattern to analyze"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Performance Issue (optional)
                </label>
                <Textarea
                  placeholder="e.g., Pattern is very slow, causes browser to freeze..."
                  value={performanceIssue}
                  onChange={(e) => setPerformanceIssue(e.target.value)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              
              <Button
                onClick={debugPerformance}
                disabled={!pattern.trim() || isLoading}
                className="w-full text-sm"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-2" />
                    Analyze Performance
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Current Pattern</label>
                <Input
                  value={pattern}
                  readOnly
                  className="text-sm font-mono bg-muted"
                  placeholder="No pattern to analyze"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">Context</label>
                <Input
                  value={testString}
                  readOnly
                  className="text-sm bg-muted"
                  placeholder="No context available"
                />
              </div>
              
              <Button
                onClick={findAlternatives}
                disabled={!pattern.trim() || isLoading}
                className="w-full text-sm"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    <Target className="h-3 w-3 mr-2" />
                    Find Alternatives
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  AI Analysis
                </CardTitle>
                {onSuggestionApplied && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion(lastResponse.content)}
                    className="text-xs"
                  >
                    Apply Fix
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64">
                <div className="text-xs whitespace-pre-wrap leading-relaxed">
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