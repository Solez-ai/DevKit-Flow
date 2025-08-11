import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Brain, 
  HelpCircle, 
  Loader2, 
  BookOpen, 
  AlertCircle, 
  Lightbulb,
  Eye,
  EyeOff,
  Layers,
  GitBranch,
  Target,
  Zap,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Progress } from '../ui/progress'
import { cn } from '../../lib/utils'
import { useAIService } from '../../hooks/use-ai-service'
import type { PlacedComponent, RegexComponent } from '../../types'

interface AdvancedPatternExplainerProps {
  pattern: string
  components: PlacedComponent[]
  flags?: string[]
  testString?: string
  onExplanationReceived?: (explanation: PatternExplanation) => void
  className?: string
}

interface PatternExplanation {
  summary: string
  breakdown: ComponentBreakdown[]
  complexity: 'simple' | 'moderate' | 'complex'
  performanceNotes: string[]
  commonUses: string[]
  examples: ExplanationExample[]
  railroadDiagram?: RailroadElement[]
  aiExplanation?: string
}

interface ComponentBreakdown {
  componentId: string
  componentName: string
  purpose: string
  regexPart: string
  examples: string[]
  relatedComponents: string[]
  position: number
  isOptional: boolean
  isRepeating: boolean
}

interface ExplanationExample {
  input: string
  matches: boolean
  explanation: string
  highlightRanges: HighlightRange[]
}

interface HighlightRange {
  start: number
  end: number
  type: 'match' | 'group' | 'component'
  componentId?: string
  description?: string
}

interface RailroadElement {
  type: 'literal' | 'group' | 'quantifier' | 'alternation' | 'anchor'
  content: string
  componentId?: string
  position: { x: number; y: number }
  connections: string[]
}

interface ComplexityAnalysis {
  score: number
  factors: ComplexityFactor[]
  recommendations: string[]
}

interface ComplexityFactor {
  name: string
  impact: 'low' | 'medium' | 'high'
  description: string
  weight: number
}

export function AdvancedPatternExplainer({
  pattern,
  components,
  flags = [],
  testString = '',
  onExplanationReceived,
  className = ''
}: AdvancedPatternExplainerProps) {
  const [explanation, setExplanation] = useState<PatternExplanation | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [lastPattern, setLastPattern] = useState('')
  const [activeTab, setActiveTab] = useState('breakdown')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))
  const [showAIExplanation, setShowAIExplanation] = useState(false)
  
  const {
    sendRequest,
    isLoading,
    error,
    isAvailable,
    isFallbackMode,
    clearError
  } = useAIService()

  // Generate built-in explanation
  const generateBuiltInExplanation = useCallback((patternToExplain: string): PatternExplanation => {
    const breakdown: ComponentBreakdown[] = components.map((comp, index) => {
      const regexComp = getRegexComponentById(comp.componentId)
      if (!regexComp) {
        return {
          componentId: comp.id,
          componentName: 'Unknown Component',
          purpose: 'Unknown purpose',
          regexPart: '',
          examples: [],
          relatedComponents: [],
          position: index,
          isOptional: false,
          isRepeating: false
        }
      }

      return {
        componentId: comp.id,
        componentName: regexComp.name,
        purpose: regexComp.description,
        regexPart: regexComp.regexPattern,
        examples: regexComp.examples,
        relatedComponents: [],
        position: index,
        isOptional: regexComp.regexPattern.includes('?'),
        isRepeating: regexComp.regexPattern.includes('*') || regexComp.regexPattern.includes('+')
      }
    })

    const complexity = calculateComplexity(patternToExplain, components)
    
    const summary = generateSummary(patternToExplain, breakdown, complexity)
    
    const examples = generateExamples(patternToExplain, testString)
    
    const performanceNotes = generatePerformanceNotes(patternToExplain, complexity)
    
    const commonUses = generateCommonUses(breakdown)

    return {
      summary,
      breakdown,
      complexity: complexity.score > 70 ? 'complex' : complexity.score > 40 ? 'moderate' : 'simple',
      performanceNotes,
      commonUses,
      examples,
      railroadDiagram: generateRailroadDiagram(breakdown)
    }
  }, [components, testString])

  // Calculate pattern complexity
  const calculateComplexity = useCallback((patternStr: string, comps: PlacedComponent[]): ComplexityAnalysis => {
    const factors: ComplexityFactor[] = []
    let score = 0

    // Length factor
    if (patternStr.length > 50) {
      factors.push({
        name: 'Pattern Length',
        impact: 'medium',
        description: 'Long patterns can be harder to understand and maintain',
        weight: 0.2
      })
      score += 20
    }

    // Nested quantifiers
    if (patternStr.includes('.*.*') || patternStr.includes('.+.+')) {
      factors.push({
        name: 'Nested Quantifiers',
        impact: 'high',
        description: 'Can cause exponential backtracking and poor performance',
        weight: 0.3
      })
      score += 30
    }

    // Lookarounds
    if (patternStr.includes('(?=') || patternStr.includes('(?!') || patternStr.includes('(?<=') || patternStr.includes('(?<!')) {
      factors.push({
        name: 'Lookarounds',
        impact: 'medium',
        description: 'Advanced feature that can be complex to understand',
        weight: 0.25
      })
      score += 25
    }

    // Multiple alternations
    const alternations = (patternStr.match(/\|/g) || []).length
    if (alternations > 3) {
      factors.push({
        name: 'Multiple Alternations',
        impact: 'medium',
        description: 'Many alternatives can make patterns hard to follow',
        weight: 0.15
      })
      score += 15
    }

    // Component count
    if (comps.length > 10) {
      factors.push({
        name: 'Component Count',
        impact: 'low',
        description: 'Many components increase cognitive load',
        weight: 0.1
      })
      score += 10
    }

    const recommendations: string[] = []
    if (score > 50) {
      recommendations.push('Consider breaking this pattern into smaller, reusable components')
    }
    if (factors.some(f => f.name === 'Nested Quantifiers')) {
      recommendations.push('Use atomic groups or possessive quantifiers to prevent backtracking')
    }
    if (factors.some(f => f.name === 'Multiple Alternations')) {
      recommendations.push('Consider using character classes instead of alternations where possible')
    }

    return { score: Math.min(score, 100), factors, recommendations }
  }, [])

  // Generate summary
  const generateSummary = useCallback((patternStr: string, breakdown: ComponentBreakdown[], complexity: ComplexityAnalysis): string => {
    if (breakdown.length === 0) {
      return 'Empty pattern - will match empty strings'
    }

    const componentNames = breakdown.map(b => b.componentName.toLowerCase())
    const hasOptional = breakdown.some(b => b.isOptional)
    const hasRepeating = breakdown.some(b => b.isRepeating)

    let summary = `This ${complexity.score > 50 ? 'complex' : 'simple'} pattern matches text that contains `
    
    if (breakdown.length === 1) {
      summary += `${componentNames[0]}`
    } else if (breakdown.length === 2) {
      summary += `${componentNames[0]} followed by ${componentNames[1]}`
    } else {
      summary += `a sequence of ${breakdown.length} components: ${componentNames.slice(0, -1).join(', ')}, and ${componentNames[componentNames.length - 1]}`
    }

    if (hasOptional) {
      summary += '. Some parts are optional'
    }
    
    if (hasRepeating) {
      summary += '. Some parts can repeat'
    }

    summary += '.'

    return summary
  }, [])

  // Generate examples
  const generateExamples = useCallback((patternStr: string, testStr: string): ExplanationExample[] => {
    const examples: ExplanationExample[] = []
    
    if (!patternStr) return examples

    try {
      const regex = new RegExp(patternStr, 'g')
      
      // Test with provided test string
      if (testStr) {
        const matches = Array.from(testStr.matchAll(regex))
        examples.push({
          input: testStr,
          matches: matches.length > 0,
          explanation: matches.length > 0 
            ? `Matches found: ${matches.map(m => `"${m[0]}"`).join(', ')}`
            : 'No matches found in this text',
          highlightRanges: matches.map(m => ({
            start: m.index!,
            end: m.index! + m[0].length,
            type: 'match' as const,
            description: `Match: "${m[0]}"`
          }))
        })
      }

      // Generate some common test cases
      const testCases = [
        'hello world',
        'test123',
        'user@example.com',
        '2023-12-25',
        'Hello, World!'
      ]

      testCases.forEach(testCase => {
        if (testCase === testStr) return // Skip if already tested
        
        const matches = Array.from(testCase.matchAll(new RegExp(patternStr, 'g')))
        examples.push({
          input: testCase,
          matches: matches.length > 0,
          explanation: matches.length > 0 
            ? `Matches: ${matches.map(m => `"${m[0]}"`).join(', ')}`
            : 'No matches',
          highlightRanges: matches.map(m => ({
            start: m.index!,
            end: m.index! + m[0].length,
            type: 'match' as const,
            description: `Match: "${m[0]}"`
          }))
        })
      })

    } catch (error) {
      examples.push({
        input: 'Invalid pattern',
        matches: false,
        explanation: 'Pattern contains syntax errors',
        highlightRanges: []
      })
    }

    return examples.slice(0, 5) // Limit to 5 examples
  }, [])

  // Generate performance notes
  const generatePerformanceNotes = useCallback((patternStr: string, complexity: ComplexityAnalysis): string[] => {
    const notes: string[] = []
    
    if (complexity.score > 70) {
      notes.push('⚠️ High complexity pattern - may have performance implications')
    }
    
    if (patternStr.includes('.*.*')) {
      notes.push('🐌 Nested quantifiers detected - risk of catastrophic backtracking')
    }
    
    if (patternStr.length > 100) {
      notes.push('📏 Very long pattern - consider breaking into components')
    }
    
    if ((patternStr.match(/\(/g) || []).length > 5) {
      notes.push('🔍 Many capture groups - consider using non-capturing groups (?:) where possible')
    }

    if (notes.length === 0) {
      notes.push('✅ Pattern appears to be well-optimized')
    }

    return notes
  }, [])

  // Generate common uses
  const generateCommonUses = useCallback((breakdown: ComponentBreakdown[]): string[] => {
    const uses = new Set<string>()
    
    breakdown.forEach(comp => {
      const regexComp = getRegexComponentById(comp.componentId)
      if (regexComp) {
        regexComp.commonUses.forEach(use => uses.add(use))
      }
    })

    return Array.from(uses).slice(0, 5)
  }, [])

  // Generate railroad diagram elements
  const generateRailroadDiagram = useCallback((breakdown: ComponentBreakdown[]): RailroadElement[] => {
    return breakdown.map((comp, index) => ({
      type: 'literal' as const,
      content: comp.componentName,
      componentId: comp.componentId,
      position: { x: index * 120 + 50, y: 50 },
      connections: index < breakdown.length - 1 ? [breakdown[index + 1].componentId] : []
    }))
  }, [])

  // Get AI explanation
  const getAIExplanation = useCallback(async (patternToExplain: string) => {
    if (!patternToExplain.trim() || !isAvailable) return null
    
    const prompt = `Provide a detailed, educational explanation of this regular expression:

Pattern: ${patternToExplain}
${flags.length > 0 ? `Flags: ${flags.join(', ')}` : ''}

Please explain:
1. What this pattern matches in plain English
2. Break down each part step by step
3. Provide practical examples
4. Mention any performance considerations
5. Suggest improvements if applicable

Keep the explanation clear and educational.`

    try {
      const response = await sendRequest(prompt, {
        pattern: patternToExplain,
        flags,
        components: components.length
      })
      
      return (response as any) || null
    } catch (err) {
      console.error('Failed to get AI explanation:', err)
      return null
    }
  }, [sendRequest, flags, isAvailable, components.length])

  // Main explanation function
  const explainPattern = useCallback(async (patternToExplain: string) => {
    if (!patternToExplain.trim()) return
    
    setIsExplaining(true)
    clearError()
    
    // Generate built-in explanation
    const builtInExplanation = generateBuiltInExplanation(patternToExplain)
    
    // Get AI explanation if available
    let aiExplanation: string | null = null
    if (isAvailable && showAIExplanation) {
      aiExplanation = await getAIExplanation(patternToExplain)
    }
    
    const finalExplanation: PatternExplanation = {
      ...builtInExplanation,
      aiExplanation: aiExplanation || undefined
    }
    
    setExplanation(finalExplanation)
    setLastPattern(patternToExplain)
    onExplanationReceived?.(finalExplanation)
    setIsExplaining(false)
  }, [generateBuiltInExplanation, getAIExplanation, isAvailable, showAIExplanation, clearError, onExplanationReceived])

  // Auto-explain when pattern changes
  useEffect(() => {
    if (pattern && pattern !== lastPattern && pattern.length > 0) {
      const timeoutId = setTimeout(() => {
        explainPattern(pattern)
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [pattern, lastPattern, explainPattern])

  const handleManualExplain = () => {
    if (pattern) {
      explainPattern(pattern)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const complexityAnalysis = useMemo(() => {
    if (!pattern) return null
    return calculateComplexity(pattern, components)
  }, [pattern, components, calculateComplexity])

  return (
    <TooltipProvider>
      <Card className={cn('h-full flex flex-col', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Pattern Explanation
                {isExplaining && (
                  <Loader2 className="h-3 w-3 ml-2 animate-spin" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                Detailed breakdown and analysis of your regex pattern
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAvailable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showAIExplanation ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowAIExplanation(!showAIExplanation)}
                    >
                      <Brain className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showAIExplanation ? 'Disable' : 'Enable'} AI explanations</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualExplain}
                disabled={!pattern || isExplaining}
              >
                {isExplaining ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {!pattern ? (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Build a pattern to see detailed explanations</p>
                <p className="text-xs mt-1">Components will be analyzed automatically</p>
              </div>
            </div>
          ) : isExplaining ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing pattern...</p>
              </div>
            </div>
          ) : error ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : explanation ? (
            <div className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {/* Summary */}
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          <span className="font-medium">Summary</span>
                        </div>
                        <Badge 
                          variant={
                            explanation.complexity === 'complex' ? 'destructive' :
                            explanation.complexity === 'moderate' ? 'secondary' : 'outline'
                          }
                        >
                          {explanation.complexity} pattern
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{explanation.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Component Breakdown */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          <span className="font-medium">Components ({explanation.breakdown.length})</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {explanation.breakdown.map((comp, index) => (
                          <Card key={comp.componentId} className="border-l-4" style={{
                            borderLeftColor: getComponentColor(comp.componentId)
                          }}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm">{comp.componentName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      #{index + 1}
                                    </Badge>
                                    {comp.isOptional && (
                                      <Badge variant="secondary" className="text-xs">optional</Badge>
                                    )}
                                    {comp.isRepeating && (
                                      <Badge variant="secondary" className="text-xs">repeating</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{comp.purpose}</p>
                                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {comp.regexPart}
                                  </code>
                                  {comp.examples.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium">Examples: </span>
                                      <span className="text-xs text-muted-foreground">
                                        {comp.examples.slice(0, 3).join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Analysis */}
                  {complexityAnalysis && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            <span className="font-medium">Performance Analysis</span>
                          </div>
                          <Badge variant={
                            complexityAnalysis.score > 70 ? 'destructive' :
                            complexityAnalysis.score > 40 ? 'secondary' : 'outline'
                          }>
                            {complexityAnalysis.score}/100
                          </Badge>
                        </div>
                        <Progress value={complexityAnalysis.score} className="mb-3" />
                        
                        <div className="space-y-2">
                          {explanation.performanceNotes.map((note, index) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded">
                              {note}
                            </div>
                          ))}
                        </div>

                        {complexityAnalysis.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center mb-2">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              <span className="text-xs font-medium">Recommendations</span>
                            </div>
                            <div className="space-y-1">
                              {complexityAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                                  💡 {rec}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Examples */}
                  {explanation.examples.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <Target className="h-4 w-4 mr-2" />
                          <span className="font-medium">Examples</span>
                        </div>
                        
                        <div className="space-y-2">
                          {explanation.examples.slice(0, 3).map((example, index) => (
                            <Card key={index} className={cn(
                              'border-l-4',
                              example.matches ? 'border-green-500 bg-green-50/50' : 'border-gray-300'
                            )}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">
                                    {example.matches ? '✅ Match' : '❌ No Match'}
                                  </span>
                                </div>
                                
                                <div className="font-mono text-sm bg-white border rounded p-2 mb-2">
                                  {example.input}
                                </div>
                                
                                <p className="text-xs text-muted-foreground">{example.explanation}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Explanation */}
                  {explanation.aiExplanation && (
                    <Card className="border-dashed bg-blue-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <Brain className="h-4 w-4 mr-2" />
                          <span className="font-medium">AI Analysis</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {explanation.aiExplanation}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click refresh to generate explanation</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Helper functions
function getRegexComponentById(id: string): RegexComponent | null {
  // This would fetch from a component registry
  return {
    id,
    name: 'Mock Component',
    description: 'Mock component for testing',
    category: 'character-classes',
    regexPattern: '[a-z]',
    visualRepresentation: {
      icon: 'A',
      color: '#3B82F6',
      label: 'Mock'
    },
    examples: ['example'],
    commonUses: ['testing']
  }
}

function getComponentColor(componentId: string): string {
  // This would return the actual component color
  return '#3B82F6'
}