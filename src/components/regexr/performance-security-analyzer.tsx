import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  Target,
  Activity,
  BarChart3
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface PerformanceMetrics {
  executionTime: number
  backtrackingSteps: number
  memoryUsage: number
  complexityScore: number
  optimizationScore: number
}

interface SecurityIssue {
  type: 'redos' | 'catastrophic-backtracking' | 'memory-exhaustion' | 'injection'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
  pattern?: string
  example?: string
}

interface OptimizationSuggestion {
  type: 'quantifier' | 'alternation' | 'character-class' | 'anchoring' | 'atomic-group'
  description: string
  before: string
  after: string
  impact: 'low' | 'medium' | 'high'
  explanation: string
}

interface PerformanceSecurityAnalyzerProps {
  pattern: string
  flags: string[]
  testInput?: string
  onOptimizedPattern?: (pattern: string) => void
  className?: string
}

export function PerformanceSecurityAnalyzer({
  pattern,
  flags = ['g'],
  testInput = '',
  onOptimizedPattern,
  className
}: PerformanceSecurityAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    performance: PerformanceMetrics | null
    security: SecurityIssue[]
    optimizations: OptimizationSuggestion[]
  }>({
    performance: null,
    security: [],
    optimizations: []
  })

  // Analyze pattern performance
  const analyzePerformance = useCallback((regex: string, input: string): PerformanceMetrics => {
    const startTime = performance.now()
    let backtrackingSteps = 0
    let memoryUsage = 0

    try {
      const regexObj = new RegExp(regex, flags.join(''))
      
      // Simulate performance testing
      const iterations = Math.min(1000, input.length * 10)
      for (let i = 0; i < iterations; i++) {
        regexObj.test(input)
      }

      const executionTime = (performance.now() - startTime) / iterations

      // Estimate complexity based on pattern structure
      const complexityFactors = [
        (regex.match(/\*|\+|\{.*\}/g) || []).length * 2, // Quantifiers
        (regex.match(/\(.*\)/g) || []).length * 1.5, // Groups
        (regex.match(/\|/g) || []).length * 3, // Alternations
        (regex.match(/\[.*\]/g) || []).length * 1, // Character classes
        (regex.match(/\.\*|\.\+/g) || []).length * 4, // Greedy wildcards
      ]

      const complexityScore = Math.min(100, complexityFactors.reduce((sum, factor) => sum + factor, 0))
      
      // Estimate backtracking potential
      const backtrackingPatterns = [
        /\(\?\!\.\*\)/g, // Negative lookahead
        /\(\?\<\=\.\*\)/g, // Positive lookbehind
        /\(\.\*\)\+/g, // Nested quantifiers
        /\(\.\*\)\*/g, // Nested quantifiers
      ]

      backtrackingSteps = backtrackingPatterns.reduce((sum, pattern) => {
        return sum + (regex.match(pattern) || []).length * 10
      }, 0)

      // Estimate memory usage (simplified)
      memoryUsage = regex.length + (input.length * 0.1)

      // Calculate optimization score (inverse of complexity)
      const optimizationScore = Math.max(0, 100 - complexityScore)

      return {
        executionTime,
        backtrackingSteps,
        memoryUsage,
        complexityScore,
        optimizationScore
      }
    } catch (error) {
      return {
        executionTime: 0,
        backtrackingSteps: 0,
        memoryUsage: 0,
        complexityScore: 100,
        optimizationScore: 0
      }
    }
  }, [flags])

  // Analyze security vulnerabilities
  const analyzeSecurityIssues = useCallback((regex: string): SecurityIssue[] => {
    const issues: SecurityIssue[] = []

    // Check for ReDoS vulnerabilities
    const redosPatterns = [
      {
        pattern: /\(\.\*\)\+/,
        description: 'Nested quantifiers can cause exponential backtracking',
        example: '(a*)*b'
      },
      {
        pattern: /\(\.\*\)\*/,
        description: 'Nested quantifiers with star quantifier',
        example: '(a*)*'
      },
      {
        pattern: /\(\.\+\)\+/,
        description: 'Nested plus quantifiers',
        example: '(a+)+'
      },
      {
        pattern: /\(\[.*\]\*\)\+/,
        description: 'Nested quantifiers with character classes',
        example: '([a-z]*)*'
      }
    ]

    redosPatterns.forEach(({ pattern: redosPattern, description, example }) => {
      if (redosPattern.test(regex)) {
        issues.push({
          type: 'redos',
          severity: 'high',
          description,
          recommendation: 'Use atomic groups or possessive quantifiers to prevent backtracking',
          pattern: example
        })
      }
    })

    // Check for catastrophic backtracking patterns
    if (/\(\?\!\.\*\)/.test(regex) || /\(\?\<\=\.\*\)/.test(regex)) {
      issues.push({
        type: 'catastrophic-backtracking',
        severity: 'medium',
        description: 'Lookahead/lookbehind with .* can cause performance issues',
        recommendation: 'Limit the scope of lookahead/lookbehind assertions'
      })
    }

    // Check for potential memory exhaustion
    if (regex.length > 1000) {
      issues.push({
        type: 'memory-exhaustion',
        severity: 'medium',
        description: 'Very long regex patterns can consume excessive memory',
        recommendation: 'Consider breaking down the pattern into smaller parts'
      })
    }

    // Check for injection vulnerabilities (basic check)
    if (/\$\{|\$\(/.test(regex)) {
      issues.push({
        type: 'injection',
        severity: 'critical',
        description: 'Pattern contains potential injection vectors',
        recommendation: 'Sanitize input and avoid dynamic pattern construction'
      })
    }

    return issues
  }, [])

  // Generate optimization suggestions
  const generateOptimizations = useCallback((regex: string): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = []

    // Suggest atomic groups for nested quantifiers
    if (/\(\.\*\)\+/.test(regex)) {
      suggestions.push({
        type: 'atomic-group',
        description: 'Use atomic groups to prevent backtracking',
        before: '(.*)+',
        after: '(?>.*)+',
        impact: 'high',
        explanation: 'Atomic groups prevent the regex engine from backtracking, improving performance'
      })
    }

    // Suggest character classes instead of alternation
    const alternationMatch = regex.match(/\(([a-z])\|([a-z])\|([a-z])\)/i)
    if (alternationMatch) {
      suggestions.push({
        type: 'character-class',
        description: 'Use character classes instead of alternation for single characters',
        before: alternationMatch[0],
        after: `[${alternationMatch[1]}${alternationMatch[2]}${alternationMatch[3]}]`,
        impact: 'medium',
        explanation: 'Character classes are more efficient than alternation for single characters'
      })
    }

    // Suggest anchoring for better performance
    if (!/^\^/.test(regex) && !/\$$/.test(regex)) {
      suggestions.push({
        type: 'anchoring',
        description: 'Consider anchoring the pattern if you need full string matches',
        before: regex,
        after: `^${regex}$`,
        impact: 'medium',
        explanation: 'Anchoring prevents unnecessary searching through the entire string'
      })
    }

    // Suggest more specific quantifiers
    if (/\.\*/.test(regex)) {
      suggestions.push({
        type: 'quantifier',
        description: 'Consider using more specific quantifiers instead of .*',
        before: '.*',
        after: '[^\\n]*',
        impact: 'low',
        explanation: 'More specific quantifiers can improve performance and accuracy'
      })
    }

    return suggestions
  }, [])

  // Run comprehensive analysis
  const runAnalysis = useCallback(async () => {
    if (!pattern) return

    setIsAnalyzing(true)

    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const performance = analyzePerformance(pattern, testInput)
      const security = analyzeSecurityIssues(pattern)
      const optimizations = generateOptimizations(pattern)

      setAnalysisResults({
        performance,
        security,
        optimizations
      })
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [pattern, testInput, analyzePerformance, analyzeSecurityIssues, generateOptimizations])

  // Auto-run analysis when pattern changes
  useEffect(() => {
    if (pattern) {
      runAnalysis()
    }
  }, [pattern, runAnalysis])

  // Apply optimization
  const applyOptimization = useCallback((suggestion: OptimizationSuggestion) => {
    const optimizedPattern = pattern.replace(suggestion.before, suggestion.after)
    onOptimizedPattern?.(optimizedPattern)
  }, [pattern, onOptimizedPattern])

  const { performance, security, optimizations } = analysisResults

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Performance & Security Analysis
            </CardTitle>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing || !pattern}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
                {security.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {security.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="optimizations" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Optimize
                {optimizations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {optimizations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              {performance ? (
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Execution Time</p>
                            <p className="text-2xl font-bold">{performance.executionTime.toFixed(3)}ms</p>
                          </div>
                          <Clock className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Complexity Score</p>
                            <p className="text-2xl font-bold">{performance.complexityScore}/100</p>
                          </div>
                          <Target className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Bars */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Optimization Score</span>
                        <span className="font-medium">{performance.optimizationScore}%</span>
                      </div>
                      <Progress 
                        value={performance.optimizationScore} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Backtracking Risk</span>
                        <span className="font-medium">{Math.min(100, performance.backtrackingSteps)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, performance.backtrackingSteps)} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Memory Usage</span>
                        <span className="font-medium">{performance.memoryUsage.toFixed(1)} KB</span>
                      </div>
                      <Progress 
                        value={Math.min(100, performance.memoryUsage / 10)} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Performance Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Performance Assessment</h4>
                    {performance.executionTime < 1 ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Excellent performance! Your pattern executes quickly.
                        </AlertDescription>
                      </Alert>
                    ) : performance.executionTime < 10 ? (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Good performance. Consider optimizations for better speed.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Slow performance detected. Review the optimization suggestions.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No performance data available</p>
                  <p className="text-sm">Run analysis to see performance metrics</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              {security.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {security.map((issue, index) => (
                      <Alert 
                        key={index} 
                        variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'default'}
                      >
                        <div className="flex items-start gap-3">
                          {issue.severity === 'critical' ? (
                            <XCircle className="h-5 w-5 mt-0.5" />
                          ) : issue.severity === 'high' ? (
                            <AlertTriangle className="h-5 w-5 mt-0.5" />
                          ) : (
                            <Info className="h-5 w-5 mt-0.5" />
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium capitalize">{issue.type.replace('-', ' ')}</h4>
                              <Badge 
                                variant={
                                  issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'destructive' :
                                  issue.severity === 'medium' ? 'secondary' : 'outline'
                                }
                              >
                                {issue.severity}
                              </Badge>
                            </div>
                            <AlertDescription className="text-sm">
                              {issue.description}
                            </AlertDescription>
                            <div className="text-sm">
                              <strong>Recommendation:</strong> {issue.recommendation}
                            </div>
                            {issue.pattern && (
                              <div className="text-sm font-mono bg-muted p-2 rounded">
                                Example: {issue.pattern}
                              </div>
                            )}
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p className="text-green-600 font-medium">No security issues detected</p>
                  <p className="text-sm">Your pattern appears to be secure</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="optimizations" className="space-y-4">
              {optimizations.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {optimizations.map((suggestion, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{suggestion.description}</h4>
                                <Badge 
                                  variant={
                                    suggestion.impact === 'high' ? 'default' :
                                    suggestion.impact === 'medium' ? 'secondary' : 'outline'
                                  }
                                >
                                  {suggestion.impact} impact
                                </Badge>
                              </div>
                              <Button
                                onClick={() => applyOptimization(suggestion)}
                                size="sm"
                                variant="outline"
                              >
                                Apply
                              </Button>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {suggestion.explanation}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium">Before</span>
                                </div>
                                <div className="font-mono text-sm bg-red-50 dark:bg-red-950/20 p-2 rounded border">
                                  {suggestion.before}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium">After</span>
                                </div>
                                <div className="font-mono text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded border">
                                  {suggestion.after}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p className="text-green-600 font-medium">No optimizations needed</p>
                  <p className="text-sm">Your pattern is already well-optimized</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}