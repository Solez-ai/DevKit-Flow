import { useState, useEffect, useCallback } from 'react'
import { Brain, HelpCircle, Loader2, BookOpen, AlertCircle, Lightbulb } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { useAIService } from '../../hooks/use-ai-service'

interface AIPatternExplainerProps {
  pattern: string
  flags?: string[]
  onExplanationReceived?: (explanation: string) => void
  className?: string
}

export function AIPatternExplainer({
  pattern,
  flags = [],
  onExplanationReceived,
  className = ''
}: AIPatternExplainerProps) {
  const [explanation, setExplanation] = useState<string>('')
  const [isExplaining, setIsExplaining] = useState(false)
  const [lastPattern, setLastPattern] = useState('')
  
  const {
    sendRequest,
    isLoading,
    error,
    isAvailable,
    isFallbackMode,
    clearError
  } = useAIService()

  const explainPattern = useCallback(async (patternToExplain: string) => {
    if (!patternToExplain.trim() || !isAvailable) return
    
    setIsExplaining(true)
    clearError()
    
    const prompt = `Explain this regular expression pattern in detail:

Pattern: ${patternToExplain}
${flags.length > 0 ? `Flags: ${flags.join(', ')}` : ''}

Please provide:
1. A plain English explanation of what this pattern matches
2. Break down each part of the pattern
3. Provide examples of strings that would match
4. Mention any potential issues or edge cases
5. Suggest improvements if applicable

Format your response in a clear, educational way.`

    try {
      const response = await sendRequest(prompt, {
        pattern: patternToExplain,
        flags
      })
      
      if (response) {
        const content = (response as any)
        setExplanation(content)
        setLastPattern(patternToExplain)
        onExplanationReceived?.(content)
      }
    } catch (err) {
      console.error('Failed to explain pattern:', err)
    } finally {
      setIsExplaining(false)
    }
  }, [sendRequest, flags, isAvailable, clearError, onExplanationReceived])

  // Auto-explain when pattern changes
  useEffect(() => {
    if (pattern && pattern !== lastPattern && pattern.length > 0) {
      const timeoutId = setTimeout(() => {
        explainPattern(pattern)
      }, 1000) // Debounce for 1 second
      
      return () => clearTimeout(timeoutId)
    }
  }, [pattern, lastPattern, explainPattern])

  const handleManualExplain = () => {
    if (pattern) {
      explainPattern(pattern)
    }
  }

  if (!isAvailable) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            AI Pattern Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isFallbackMode 
                ? 'AI explanations are currently unavailable. Working in offline mode.'
                : 'Enable AI features in settings to get intelligent pattern explanations.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Pattern Explanation
            </CardTitle>
            <CardDescription className="text-xs">
              Get intelligent explanations of regex patterns
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualExplain}
            disabled={!pattern || isExplaining || isLoading}
          >
            {isExplaining ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <HelpCircle className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!pattern ? (
          <div className="text-center text-muted-foreground py-8">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Build a pattern to get AI explanation</p>
          </div>
        ) : isExplaining ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing pattern...</p>
          </div>
        ) : error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error.message}
            </AlertDescription>
          </Alert>
        ) : explanation ? (
          <div className="space-y-4">
            {/* Current Pattern */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold">Current Pattern</label>
                {flags.length > 0 && (
                  <div className="flex gap-1">
                    {flags.map(flag => (
                      <Badge key={flag} variant="secondary" className="text-xs">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <code className="text-sm bg-muted px-3 py-2 rounded block font-mono break-all">
                {pattern}
              </code>
            </div>
            
            <Separator />
            
            {/* AI Explanation */}
            <div>
              <div className="flex items-center mb-2">
                <Lightbulb className="h-3 w-3 mr-1" />
                <label className="text-xs font-semibold">AI Explanation</label>
              </div>
              <ScrollArea className="max-h-96">
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">Click the help button to get an AI explanation</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}