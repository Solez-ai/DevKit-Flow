import { useState, useCallback, useEffect } from 'react'
import { Zap, TrendingUp, AlertTriangle, CheckCircle, Loader2, BarChart3, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { useAIService } from '../../hooks/use-ai-service'

interface OptimizationSuggestion {
  type: 'performance' | 'readability' | 'security' | 'compatibility'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  before: string
  after: string
  impact: string
}

interface AIPatternOptimizerProps {
  pattern: string
  testCases?: string[]
  performanceMetrics?: {
    executionTime: number
    backtrackingSteps: number
    memoryUsage: number
  }
  onOptimizedPattern?: (pattern: string, explanation: string) => void
  className?: string
}

export function AIPatternOptimizer({
  pattern,
  testCases = [],
  performanceMetrics,
  onOptimizedPattern,
  className = ''
}: AIPatternOptimizerProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [optimizationScore, setOptimizationScore] = useState<number>(0)
  const [lastAnalyzedPattern, setLastAnalyzedPattern] = useState('')
  
  const {
    sendRequest,
    isLoading,
    error,
    isAvailable,
    isFallbackMode,
    clearError
  } = useAIService()

  const analyzePattern = useCallback(async (patternToAnalyze: string) => {
    if (!patternToAnalyze.trim() || !isAvailable) return
    
    setIsAnalyzing(true)
    clearError()
    
    let prompt = `Analyze this regular expression for optimization opportunities:

Pattern: ${patternToAnalyze}
`

    if (testCases.length > 0) {
      prompt += `Test Cases:
${testCases.map((test, i) => `${i + 1}. "${test}"`).join('\n')}
`
    }

    if (performanceMetrics) {
      prompt += `Performance Metrics:
- Execution Time: ${performanceMetrics.executionTime}ms
- Backtracking Steps: ${performanceMetrics.backtrackingSteps}
- Memory Usage: ${performanceMetrics.memoryUsage}KB
`
    }

    prompt += `
Please provide a comprehensive analysis including:

1. **Performance Issues**: Identify potential bottlenecks, catastrophic backtracking, inefficient quantifiers
2. **Readability Improvements**: Suggest ways to make the pattern more maintainable
3. **Security Concerns**: Check for ReDoS vulnerabilities and other security issues
4. **Compatibility**: Note any compatibility issues across different regex engines
5. **Optimized Version**: Provide an improved version with explanations

Format your response as a structured analysis with specific suggestions and code examples.

Rate the current pattern's optimization level from 1-100 and explain the score.`

    try {
      const response = await sendRequest(prompt, {
        pattern: patternToAnalyze,
        testCases,
        performanceMetrics,
        analysisType: 'comprehensive-optimization'
      })
      
      if (response) {
        // Parse the response to extract suggestions and score
        const parsedSuggestions = parseOptimizationResponse(response.content)
        setSuggestions(parsedSuggestions)
        
        // Extract optimization score
        const scoreMatch = response.content.match(/(\d+)\/100|(\d+)%/)
        if (scoreMatch) {
          setOptimizationScore(parseInt(scoreMatch[1] || scoreMatch[2]))
        }
        
        setLastAnalyzedPattern(patternToAnalyze)
      }
    } catch (err) {
      console.error('Failed to analyze pattern:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [sendRequest, testCases, performanceMetrics, isAvailable, clearError])

  // Auto-analyze when pattern changes
  useEffect(() => {
    if (pattern && pattern !== lastAnalyzedPattern && pattern.length > 2) {
      const timeoutId = setTimeout(() => {
        analyzePattern(pattern)
      }, 2000) // Debounce for 2 seconds
      
      return () => clearTimeout(timeoutId)
    }
  }, [pattern, lastAnalyzedPattern, analyzePattern])

  const handleManualAnalyze = () => {
    if (pattern) {
      analyzePattern(pattern)
    }
  }

  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    if (onOptimizedPattern) {
      onOptimizedPattern(suggestion.after, suggestion.description)
    }
  }

  const parseOptimizationResponse = (content: string): OptimizationSuggestion[] => {
    // This is a simplified parser - in a real implementation, you'd want more robust parsing
    const suggestions: OptimizationSuggestion[] = []
    
    // Look for common optimization patterns in the response
    const lines = content.split('\n')
    let currentSuggestion: Partial<OptimizationSuggestion> = {}
    
    for (const line of lines) {
      if (line.includes('Performance') || line.includes('performance')) {
        currentSuggestion.type = 'performance'
        currentSuggestion.severity = 'high'
      } else if (line.includes('Readability') || line.includes('readability')) {
        currentSuggestion.type = 'readability'
        currentSuggestion.severity = 'medium'
      } else if (line.includes('Security') || line.includes('ReDoS')) {
        currentSuggestion.type = 'security'
        currentSuggestion.severity = 'high'
      }
      
      // Extract code patterns
      const codeMatch = line.match(/`([^`]+)`/)
      if (codeMatch && !currentSuggestion.before) {
        currentSuggestion.before = codeMatch[1]
      } else if (codeMatch && currentSuggestion.before && !currentSuggestion.after) {
        currentSuggestion.after = codeMatch[1]
      }
    }
    
    // Add a default suggestion if we found patterns
    if (currentSuggestion.type && currentSuggestion.before && currentSuggestion.after) {
      suggestions.push({
        type: currentSuggestion.type,
        severity: currentSuggestion.severity || 'medium',
        title: `${currentSuggestion.type} Optimization`,
        description: 'AI-suggested optimization',
        before: currentSuggestion.before,
        after: currentSuggestion.after,
        impact: 'Improved pattern efficiency'
      } as OptimizationSuggestion)
    }
    
    return suggestions
  }

  if (!isAvailable) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            AI Pattern Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isFallbackMode 
                ? 'AI optimization is currently unavailable. Working in offline mode.'
                : 'Enable AI features in settings to use intelligent pattern optimization.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: OptimizationSuggestion['severity']) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
    }
  }

  const getTypeIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'performance': return <Zap className="h-3 w-3" />
      case 'readability': return <BarChart3 className="h-3 w-3" />
      case 'security': return <AlertTriangle className="h-3 w-3" />
      case 'compatibility': return <CheckCircle className="h-3 w-3" />
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Pattern Optimizer
            </CardTitle>
            <CardDescription className="text-xs">
              Get intelligent optimization suggestions for your regex patterns
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualAnalyze}
            disabled={!pattern || isAnalyzing || isLoading}
          >
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!pattern ? (
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Build a pattern to get optimization suggestions</p>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing pattern for optimizations...</p>
          </div>
        ) : error ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Optimization Score */}
            {optimizationScore > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Optimization Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Progress value={optimizationScore} className="flex-1" />
                    <span className={`text-sm font-semibold ${getScoreColor(optimizationScore)}`}>
                      {optimizationScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {optimizationScore >= 80 ? 'Excellent optimization' :
                     optimizationScore >= 60 ? 'Good, with room for improvement' :
                     'Needs optimization'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Execution</p>
                      <p className="text-sm font-semibold">{performanceMetrics.executionTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Backtracking</p>
                      <p className="text-sm font-semibold">{performanceMetrics.backtrackingSteps}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Memory</p>
                      <p className="text-sm font-semibold">{performanceMetrics.memoryUsage}KB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimization Suggestions */}
            {suggestions.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(suggestion.type)}
                              <span className="text-sm font-medium">{suggestion.title}</span>
                              <Badge variant={getSeverityColor(suggestion.severity)} className="text-xs">
                                {suggestion.severity}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => applySuggestion(suggestion)}
                              className="text-xs"
                            >
                              Apply
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {suggestion.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-red-600">Before:</label>
                              <code className="text-xs bg-red-50 border border-red-200 px-2 py-1 rounded block font-mono">
                                {suggestion.before}
                              </code>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-green-600">After:</label>
                              <code className="text-xs bg-green-50 border border-green-200 px-2 py-1 rounded block font-mono">
                                {suggestion.after}
                              </code>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground italic">
                            Impact: {suggestion.impact}
                          </p>
                          
                          {index < suggestions.length - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : lastAnalyzedPattern === pattern ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No optimization suggestions found</p>
                    <p className="text-xs">Your pattern appears to be well-optimized!</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}