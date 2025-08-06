import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Eye,
  EyeOff,
  Settings,
  TrendingUp,
  Activity,
  Target,
  Gauge,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import type { PlacedComponent, RegexComponent } from '../../types'

interface RealTimeRegexGeneratorProps {
  components: PlacedComponent[]
  testString: string
  onPatternChange: (pattern: string, isValid: boolean) => void
  onMatchesChange: (matches: MatchResult[]) => void
  onPerformanceUpdate: (metrics: PerformanceMetrics) => void
  className?: string
}

interface MatchResult {
  text: string
  startIndex: number
  endIndex: number
  groups: string[]
  componentId?: string
}

interface PerformanceMetrics {
  executionTime: number
  memoryUsage: number
  backtrackingRisk: 'low' | 'medium' | 'high'
  complexityScore: number
  optimizationSuggestions: string[]
  matchCount: number
  patternLength: number
}

interface PatternValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  message: string
  position?: number
  componentId?: string
  severity: 'error' | 'warning'
}

interface ValidationWarning {
  message: string
  suggestion: string
  componentId?: string
}

interface GenerationSettings {
  realTimeEnabled: boolean
  showMatches: boolean
  highlightGroups: boolean
  validateSyntax: boolean
  trackPerformance: boolean
  debounceMs: number
  maxExecutionTime: number
}

interface MatchHighlight {
  startIndex: number
  endIndex: number
  text: string
  groupIndex: number
  componentId?: string
}

export function RealTimeRegexGenerator({
  components,
  testString,
  onPatternChange,
  onMatchesChange,
  onPerformanceUpdate,
  className = ''
}: RealTimeRegexGeneratorProps) {
  const [settings, setSettings] = useState<GenerationSettings>({
    realTimeEnabled: true,
    showMatches: true,
    highlightGroups: true,
    validateSyntax: true,
    trackPerformance: true,
    debounceMs: 300,
    maxExecutionTime: 1000
  })

  const [currentPattern, setCurrentPattern] = useState('')
  const [validation, setValidation] = useState<PatternValidation>({
    isValid: true,
    errors: [],
    warnings: []
  })
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    executionTime: 0,
    memoryUsage: 0,
    backtrackingRisk: 'low',
    complexityScore: 0,
    optimizationSuggestions: [],
    matchCount: 0,
    patternLength: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Generate regex pattern from components
  const generatePattern = useCallback(() => {
    if (components.length === 0) {
      setCurrentPattern('')
      return ''
    }

    try {
      const pattern = components
        .filter(comp => !comp.isHidden)
        .map(comp => {
          // Get the regex component data (this would come from a component registry)
          const regexComp = getRegexComponentById(comp.componentId)
          if (!regexComp) return ''
          
          // Apply parameters to the pattern
          let pattern = regexComp.regexPattern
          if (comp.parameters) {
            Object.entries(comp.parameters).forEach(([key, value]) => {
              pattern = pattern.replace(`{${key}}`, String(value))
            })
          }
          
          return pattern
        })
        .join('')

      setCurrentPattern(pattern)
      return pattern
    } catch (error) {
      console.error('Error generating pattern:', error)
      setCurrentPattern('')
      return ''
    }
  }, [components])

  // Validate pattern syntax
  const validatePattern = useCallback((pattern: string): PatternValidation => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!pattern) {
      return { isValid: true, errors, warnings }
    }

    try {
      new RegExp(pattern)
      
      // Check for common issues
      if (pattern.includes('.*.*')) {
        warnings.push({
          message: 'Nested quantifiers detected - may cause performance issues',
          suggestion: 'Consider using atomic groups or possessive quantifiers',
          componentId: undefined
        })
      }

      if (pattern.length > 100) {
        warnings.push({
          message: 'Pattern is very long - consider breaking into smaller components',
          suggestion: 'Use component composition for better maintainability'
        })
      }

      return { isValid: true, errors, warnings }
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : 'Invalid regex pattern',
        severity: 'error'
      })
      return { isValid: false, errors, warnings }
    }
  }, [])

  // Test pattern against string
  const testPattern = useCallback((pattern: string, testStr: string): MatchResult[] => {
    if (!pattern || !testStr) return []

    try {
      const startTime = window.performance.now()
      const regex = new RegExp(pattern, 'g')
      const matches: MatchResult[] = []
      
      let match
      while ((match = regex.exec(testStr)) !== null) {
        matches.push({
          text: match[0],
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
          groups: match.slice(1)
        })
        
        // Prevent infinite loops
        if (match[0].length === 0) {
          regex.lastIndex++
        }
        
        // Limit matches for performance
        if (matches.length > 1000) break
      }

      const executionTime = window.performance.now() - startTime
      
      // Update performance metrics
      const newPerformance: PerformanceMetrics = {
        executionTime,
        memoryUsage: 0, // Would need actual memory tracking
        backtrackingRisk: executionTime > 100 ? 'high' : executionTime > 50 ? 'medium' : 'low',
        complexityScore: Math.min(pattern.length / 10 + executionTime / 10, 100),
        optimizationSuggestions: getOptimizationSuggestions(pattern, executionTime),
        matchCount: matches.length,
        patternLength: pattern.length
      }
      
      setPerformance(newPerformance)
      onPerformanceUpdate(newPerformance)
      
      return matches
    } catch (error) {
      console.error('Error testing pattern:', error)
      return []
    }
  }, [onPerformanceUpdate])

  // Get optimization suggestions
  const getOptimizationSuggestions = useCallback((pattern: string, executionTime: number): string[] => {
    const suggestions: string[] = []
    
    if (executionTime > 100) {
      suggestions.push('Pattern execution is slow - consider optimizing quantifiers')
    }
    
    if (pattern.includes('.*.*')) {
      suggestions.push('Avoid nested quantifiers - use atomic groups instead')
    }
    
    if (pattern.includes('(.*)')) {
      suggestions.push('Use non-capturing groups (?:) when capture is not needed')
    }
    
    if (pattern.length > 50) {
      suggestions.push('Consider breaking long patterns into smaller components')
    }
    
    return suggestions
  }, [])

  // Debounced pattern generation and testing
  useEffect(() => {
    if (!settings.realTimeEnabled) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setIsGenerating(true)
      
      const pattern = generatePattern()
      const validation = validatePattern(pattern)
      const matches = testPattern(pattern, testString)
      
      setValidation(validation)
      setMatches(matches)
      
      onPatternChange(pattern, validation.isValid)
      onMatchesChange(matches)
      
      setIsGenerating(false)
    }, settings.debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [components, testString, settings, generatePattern, validatePattern, testPattern, onPatternChange, onMatchesChange])

  // Manual refresh
  const handleRefresh = useCallback(() => {
    setIsGenerating(true)
    
    const pattern = generatePattern()
    const validation = validatePattern(pattern)
    const matches = testPattern(pattern, testString)
    
    setValidation(validation)
    setMatches(matches)
    
    onPatternChange(pattern, validation.isValid)
    onMatchesChange(matches)
    
    setIsGenerating(false)
  }, [generatePattern, validatePattern, testPattern, testString, onPatternChange, onMatchesChange])

  // Toggle real-time generation
  const toggleRealTime = useCallback(() => {
    setSettings(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }))
  }, [])

  return (
    <TooltipProvider>
      <Card className={cn('h-full flex flex-col', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Real-time Generator</CardTitle>
              {isGenerating && (
                <Activity className="h-4 w-4 text-primary animate-spin" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={settings.realTimeEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleRealTime}
                  >
                    {settings.realTimeEnabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{settings.realTimeEnabled ? 'Pause' : 'Resume'} real-time generation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={cn('h-3 w-3', isGenerating && 'animate-spin')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh pattern</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generator settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.showMatches}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, showMatches: checked }))
                      }
                    />
                    <Label className="text-sm">Show matches</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.highlightGroups}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, highlightGroups: checked }))
                      }
                    />
                    <Label className="text-sm">Highlight groups</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.validateSyntax}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, validateSyntax: checked }))
                      }
                    />
                    <Label className="text-sm">Validate syntax</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.trackPerformance}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, trackPerformance: checked }))
                      }
                    />
                    <Label className="text-sm">Track performance</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Debounce delay: {settings.debounceMs}ms</Label>
                  <Slider
                    value={[settings.debounceMs]}
                    onValueChange={([value]) => 
                      setSettings(prev => ({ ...prev, debounceMs: value }))
                    }
                    min={100}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pattern Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Generated Pattern</Label>
              <div className="flex items-center space-x-2">
                {currentPattern && (
                  <Badge variant="outline" className="text-xs">
                    {currentPattern.length} chars
                  </Badge>
                )}
                {validation.isValid ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                )}
              </div>
            </div>
            
            <div className={cn(
              'p-3 rounded border font-mono text-sm min-h-[60px] transition-colors duration-200',
              validation.isValid 
                ? 'bg-green-50 border-green-200' 
                : validation.errors.length > 0 
                  ? 'bg-red-50 border-red-200'
                  : 'bg-muted'
            )}>
              {currentPattern || (
                <span className="text-muted-foreground italic">
                  Pattern will appear here as you add components
                </span>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="space-y-2">
              {validation.errors.map((error, index) => (
                <Alert key={`error-${index}`} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              ))}
              
              {validation.warnings.map((warning, index) => (
                <Alert key={`warning-${index}`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {warning.message}
                    {warning.suggestion && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        💡 {warning.suggestion}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Performance Metrics */}
          {settings.trackPerformance && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Performance Metrics</h4>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Execution Time</div>
                    <div className="font-mono">{performance.executionTime.toFixed(2)}ms</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Matches Found</div>
                    <div className="font-mono">{performance.matchCount}</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Complexity Score</div>
                    <div className="flex items-center space-x-2">
                      <Progress value={performance.complexityScore} className="flex-1 h-2" />
                      <span className="font-mono text-xs">{performance.complexityScore.toFixed(0)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Backtracking Risk</div>
                    <Badge 
                      variant={
                        performance.backtrackingRisk === 'high' ? 'destructive' :
                        performance.backtrackingRisk === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {performance.backtrackingRisk}
                    </Badge>
                  </div>
                </div>
                
                {performance.optimizationSuggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">Optimization Suggestions</span>
                    </div>
                    <ScrollArea className="h-20">
                      <div className="space-y-1">
                        {performance.optimizationSuggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Match Results */}
          {settings.showMatches && matches.length > 0 && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Match Results</h4>
                  <Badge variant="secondary" className="text-xs">
                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>
                
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {matches.slice(0, 10).map((match, index) => (
                      <div key={index} className="text-sm border rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono bg-muted px-1 rounded">
                            "{match.text}"
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {match.startIndex}-{match.endIndex}
                          </span>
                        </div>
                        {match.groups.length > 0 && settings.highlightGroups && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Groups: {match.groups.map((group, i) => (
                              <span key={i} className="font-mono bg-blue-100 px-1 rounded mr-1">
                                {group || '(empty)'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {matches.length > 10 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        ... and {matches.length - 10} more matches
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Helper function (would be implemented properly in a real app)
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