import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Settings, 
  Check, 
  X, 
  RotateCcw, 
  Bookmark, 
  Zap, 
  Sparkles,
  AlertTriangle,
  Info,
  HelpCircle,
  Copy,
  Save,
  Share,
  History,
  Lightbulb,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { Alert, AlertDescription } from '../ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { Textarea } from '../ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Progress } from '../ui/progress'
import type { 
  PlacedComponent, 
  ComponentParameter
} from '../../types'
import { getComponentById, validateComponentParameters, generateComponentPattern } from '../../lib/regex-components'
import { updatePlacedComponentParameters } from '../../lib/regex-component-factory'
import { getPresetsForComponent } from '../../lib/regex-parameter-presets'
import { enhancedComponentFactory } from '../../lib/enhanced-regex-component-factory'
import { useAIService } from '../../hooks/use-ai-service'
import { useEnhancedComponentUsage } from '../../hooks/use-enhanced-component-usage'

interface ComponentParameterPanelProps {
  selectedComponent: PlacedComponent | null
  onUpdateComponent: (updatedComponent: PlacedComponent) => void
  onClose: () => void
  className?: string
}

type ParameterPreset = {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  usageExample: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  popularity: number
}

type ValidationState = {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export function ComponentParameterPanel({
  selectedComponent,
  onUpdateComponent,
  onClose,
  className = ''
}: ComponentParameterPanelProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [validation, setValidation] = useState<ValidationState>({ isValid: true, errors: [], warnings: [], suggestions: [] })
  const [previewPattern, setPreviewPattern] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [parameterHistory, setParameterHistory] = useState<Record<string, any>[]>([])
  const [aiSuggestions, setAISuggestions] = useState<any[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [customPresets, setCustomPresets] = useState<ParameterPreset[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['parameters']))

  const component = selectedComponent ? getComponentById(selectedComponent.componentId) : null
  const availablePresets = component ? getPresetsForComponent(component.id) : []
  const { isAvailable: isAIEnabled } = useAIService()
  const { recordUsage } = useEnhancedComponentUsage()

  // Enhanced component if available
  const enhancedComponent = useMemo(() => {
    if (!component) return null
    try {
      return enhancedComponentFactory.createComponent({
        name: component.name,
        description: component.description,
        category: component.category,
        regexPattern: component.regexPattern,
        visualRepresentation: component.visualRepresentation,
        parameters: component.parameters,
        examples: component.examples,
        commonUses: component.commonUses
      })
    } catch {
      return null
    }
  }, [component])

  // Get component analytics for insights
  // Component analytics disabled for now
  const componentAnalytics = null

  // Initialize parameters when component changes
  useEffect(() => {
    if (selectedComponent && component) {
      const initialParams = { ...selectedComponent.parameters }
      setParameters(initialParams)
      updatePreview(initialParams)
      
      // Add to history
      setParameterHistory(prev => [initialParams, ...prev.slice(0, 9)])
      
      // Generate AI suggestions if enabled
      if (isAIEnabled && enhancedComponent) {
        generateAISuggestions(initialParams)
      }
    }
  }, [selectedComponent, component, isAIEnabled, enhancedComponent])

  const updatePreview = useCallback((newParameters: Record<string, any>) => {
    if (!component) return
    
    try {
      const pattern = generateComponentPattern(component, newParameters)
      setPreviewPattern(pattern)
      
      // Enhanced validation
      const validationErrors = validateComponentParameters(component, newParameters)
      const enhancedValidation = enhancedComponent 
        ? enhancedComponentFactory.validateComponent({
            ...enhancedComponent,
            parameters: component.parameters?.map(p => ({
              ...p,
              value: newParameters[p.name]
            }))
          })
        : null

      setValidation({
        isValid: validationErrors.length === 0 && (enhancedValidation?.isValid ?? true),
        errors: validationErrors,
        warnings: enhancedValidation?.warnings.map(w => w.message) || [],
        suggestions: enhancedValidation?.suggestions.map(s => s.message) || []
      })
    } catch (error) {
      setPreviewPattern('Invalid pattern')
      setValidation({
        isValid: false,
        errors: ['Failed to generate pattern'],
        warnings: [],
        suggestions: []
      })
    }
  }, [component, enhancedComponent])

  const generateAISuggestions = useCallback(async (currentParams: Record<string, any>) => {
    if (!isAIEnabled || !component) return
    
    setIsGeneratingAI(true)
    try {
      // This would call the AI service to get parameter suggestions
      // For now, we'll simulate some suggestions
      const suggestions: any[] = [
        {
          id: 'ai-1',
          type: 'parameter',
          title: 'Optimize for performance',
          description: 'Adjust quantifiers to reduce backtracking',
          confidence: 0.8,
          reasoning: 'Based on common performance patterns',
          implementation: { /* suggested parameter values */ }
        },
        {
          id: 'ai-2',
          type: 'usage',
          title: 'Common configuration',
          description: 'Most users configure this component with these settings',
          confidence: 0.9,
          reasoning: 'Based on usage analytics',
          implementation: {}
        }
      ]
      
      setAISuggestions(suggestions)
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }, [isAIEnabled, component, componentAnalytics])

  const handleParameterChange = useCallback((paramName: string, value: any) => {
    const newParameters = { ...parameters, [paramName]: value }
    setParameters(newParameters)
    updatePreview(newParameters)
    
    // Record usage for analytics
    if (component) {
      recordUsage(component.id)
    }
  }, [parameters, updatePreview, component, recordUsage])

  const handleApply = useCallback(() => {
    if (!selectedComponent || !validation.isValid) return
    
    const updatedComponent = updatePlacedComponentParameters(selectedComponent, parameters)
    
    // Add to history
    setParameterHistory(prev => [parameters, ...prev.slice(0, 9)])
    
    onUpdateComponent(updatedComponent)
  }, [selectedComponent, validation.isValid, parameters, onUpdateComponent])

  const handleReset = useCallback(() => {
    if (!component || !selectedComponent) return
    
    const defaultParameters: Record<string, any> = {}
    if (component.parameters) {
      for (const param of component.parameters) {
        defaultParameters[param.name] = param.default
      }
    }
    
    setParameters(defaultParameters)
    updatePreview(defaultParameters)
    setSelectedPreset('')
  }, [component, selectedComponent, updatePreview])

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = [...availablePresets, ...customPresets].find(p => p.id === presetId)
    if (preset) {
      setParameters(preset.parameters)
      updatePreview(preset.parameters)
      setSelectedPreset(presetId)
      
      // Add to history
      setParameterHistory(prev => [preset.parameters, ...prev.slice(0, 9)])
    }
  }, [availablePresets, customPresets, updatePreview])

  const handleHistorySelect = useCallback((historyParams: Record<string, any>) => {
    setParameters(historyParams)
    updatePreview(historyParams)
    setSelectedPreset('')
  }, [updatePreview])

  const handleAISuggestionApply = useCallback((suggestion: any) => {
    if (suggestion.implementation) {
      const newParameters = { ...parameters, ...suggestion.implementation }
      setParameters(newParameters)
      updatePreview(newParameters)
      setSelectedPreset('')
    }
  }, [parameters, updatePreview])

  const handleSaveAsPreset = useCallback(() => {
    if (!component) return
    
    const newPreset: ParameterPreset = {
      id: `custom-${Date.now()}`,
      name: `Custom ${component.name} Config`,
      description: 'User-created configuration',
      parameters: { ...parameters },
      usageExample: 'Custom configuration',
      difficulty: 'intermediate',
      tags: ['custom'],
      popularity: 0
    }
    
    setCustomPresets(prev => [...prev, newPreset])
  }, [component, parameters])

  const handleCopyPattern = useCallback(() => {
    if (previewPattern) {
      navigator.clipboard.writeText(previewPattern)
    }
  }, [previewPattern])

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  if (!selectedComponent || !component) {
    return (
      <div className={`w-80 border-l bg-background flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a component to configure</p>
          <p className="text-xs mt-1">Choose a component from the palette to see its parameters</p>
        </div>
      </div>
    )
  }

  const hasParameters = component.parameters && component.parameters.length > 0
  const hasChanges = JSON.stringify(parameters) !== JSON.stringify(selectedComponent.parameters)
  const allPresets = [...availablePresets, ...customPresets]

  return (
    <TooltipProvider>
      <div className={`w-80 border-l bg-background flex flex-col ${className}`}>
        {/* Enhanced Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Configure Component</h3>
            <div className="flex items-center space-x-1">
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyPattern}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy Pattern
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAsPreset}>
                    <Save className="h-3 w-3 mr-2" />
                    Save as Preset
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="h-3 w-3 mr-2" />
                    Share Configuration
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowDocumentation(!showDocumentation)}>
                    <HelpCircle className="h-3 w-3 mr-2" />
                    {showDocumentation ? 'Hide' : 'Show'} Documentation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-mono"
              style={{ backgroundColor: component.visualRepresentation.color }}
            >
              {component.visualRepresentation.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{component.name}</p>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
            {enhancedComponent && (
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  {enhancedComponent.metadata.difficulty}
                </Badge>
                {enhancedComponent.aiAssistance.enabled && isAIEnabled && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Sparkles className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI assistance available</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {/* Validation Status */}
          {!validation.isValid && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Configuration has {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Enhanced Pattern Preview */}
            <Collapsible
              open={expandedSections.has('preview')}
              onOpenChange={() => toggleSection('preview')}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        {showPreview ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                        Pattern Preview
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyPattern()
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {expandedSections.has('preview') ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-4">
                    <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                      {previewPattern || 'No pattern'}
                    </div>
                    
                    {/* Validation Results */}
                    {validation.errors.length > 0 && (
                      <Alert className="mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.errors.map((error, index) => (
                              <li key={index} className="text-sm">{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.warnings.length > 0 && (
                      <Alert className="mb-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <div className="text-sm font-medium mb-1">Warnings:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.warnings.map((warning, index) => (
                              <li key={index} className="text-sm">{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {validation.suggestions.length > 0 && (
                      <Alert className="mb-2">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <div className="text-sm font-medium mb-1">Suggestions:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {validation.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm">{suggestion}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Performance Metrics */}
                    {enhancedComponent && (
                      <div className="mt-3 p-2 bg-muted/50 rounded">
                        <div className="text-xs font-medium mb-2">Performance Metrics</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Complexity Score:</span>
                            <span>{enhancedComponent.statistics.performanceMetrics.complexityScore}/10</span>
                          </div>
                          <Progress 
                            value={enhancedComponent.statistics.performanceMetrics.complexityScore * 10} 
                            className="h-1"
                          />
                          <div className="flex justify-between text-xs">
                            <span>Backtracking Risk:</span>
                            <Badge 
                              variant={
                                enhancedComponent.statistics.performanceMetrics.backtrackingRisk === 'low' 
                                  ? 'default' 
                                  : enhancedComponent.statistics.performanceMetrics.backtrackingRisk === 'medium'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {enhancedComponent.statistics.performanceMetrics.backtrackingRisk}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Presets and AI Suggestions */}
            {(hasParameters && allPresets.length > 0) || (isAIEnabled && aiSuggestions.length > 0) && (
              <Collapsible
                open={expandedSections.has('presets')}
                onOpenChange={() => toggleSection('presets')}
              >
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Presets & Suggestions
                        </CardTitle>
                        {expandedSections.has('presets') ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        Quick configurations and AI-powered suggestions
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      {/* AI Suggestions */}
                      {isAIEnabled && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium flex items-center">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Suggestions
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateAISuggestions(parameters)}
                              disabled={isGeneratingAI}
                              className="h-6 text-xs"
                            >
                              {isGeneratingAI ? (
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              {isGeneratingAI ? 'Generating...' : 'Refresh'}
                            </Button>
                          </div>
                          
                          {aiSuggestions.length > 0 ? (
                            <div className="space-y-2">
                              {aiSuggestions.map((suggestion) => (
                                <div key={suggestion.id} className="p-2 border rounded">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{suggestion.title}</div>
                                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Badge variant="outline" className="text-xs">
                                        {Math.round(suggestion.confidence * 100)}%
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAISuggestionApply(suggestion)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {suggestion.reasoning}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              <Lightbulb className="h-6 w-6 mx-auto mb-1 opacity-50" />
                              <p className="text-xs">No AI suggestions available</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Presets */}
                      {allPresets.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Parameter Presets</Label>
                          <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Choose a preset..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePresets.length > 0 && (
                                <>
                                  <DropdownMenuLabel>Built-in Presets</DropdownMenuLabel>
                                  {availablePresets.map((preset) => (
                                    <SelectItem key={preset.id} value={preset.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{preset.name}</span>
                                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              
                              {customPresets.length > 0 && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Custom Presets</DropdownMenuLabel>
                                  {customPresets.map((preset) => (
                                    <SelectItem key={preset.id} value={preset.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{preset.name}</span>
                                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          
                          {selectedPreset && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <div className="flex items-center mb-1">
                                <Zap className="h-3 w-3 mr-1" />
                                <span className="font-medium">Usage Example:</span>
                              </div>
                              <p className="text-muted-foreground">
                                {allPresets.find(p => p.id === selectedPreset)?.usageExample}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Parameter History */}
                      {parameterHistory.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block flex items-center">
                            <History className="h-3 w-3 mr-1" />
                            Recent Configurations
                          </Label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {parameterHistory.slice(0, 5).map((historyParams, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHistorySelect(historyParams)}
                                className="w-full justify-start text-xs h-auto p-2"
                              >
                                <div className="flex flex-col items-start">
                                  <span>Configuration {index + 1}</span>
                                  <span className="text-muted-foreground">
                                    {Object.keys(historyParams).length} parameter{Object.keys(historyParams).length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Enhanced Parameters */}
            <Collapsible
              open={expandedSections.has('parameters')}
              onOpenChange={() => toggleSection('parameters')}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <Settings className="h-3 w-3 mr-1" />
                        Parameters
                        {hasParameters && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {component.parameters!.length}
                          </Badge>
                        )}
                      </CardTitle>
                      {expandedSections.has('parameters') ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Configure the component behavior with real-time validation
                    </CardDescription>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-4">
                    {hasParameters ? (
                      <div className="space-y-4">
                        {component.parameters!.map((param) => (
                          <EnhancedParameterInput
                            key={param.name}
                            parameter={param}
                            value={parameters[param.name]}
                            onChange={(value) => handleParameterChange(param.name, value)}
                            validation={validation}
                            componentAnalytics={componentAnalytics}
                            isAIEnabled={isAIEnabled}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">This component has no configurable parameters</p>
                        <p className="text-xs mt-1">The pattern is fixed and ready to use</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Component Documentation */}
            <Collapsible
              open={expandedSections.has('documentation')}
              onOpenChange={() => toggleSection('documentation')}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Documentation
                      </CardTitle>
                      {expandedSections.has('documentation') ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Examples, usage patterns, and component information
                    </CardDescription>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    {/* Examples */}
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">Examples</Label>
                      <div className="space-y-2">
                        {component.examples.map((example, index) => (
                          <div key={index} className="p-2 bg-muted/50 rounded">
                            <code className="text-xs font-mono block mb-1">{example}</code>
                            <div className="text-xs text-muted-foreground">
                              Example {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Common Uses */}
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">Common Uses</Label>
                      <div className="flex flex-wrap gap-1">
                        {component.commonUses.map((use, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Documentation */}
                    {enhancedComponent && (
                      <>
                        <Separator />
                        
                        {/* Performance Notes */}
                        {enhancedComponent.documentation.performanceNotes.length > 0 && (
                          <div>
                            <Label className="text-xs font-semibold mb-2 block flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Performance Notes
                            </Label>
                            <div className="space-y-1">
                              {enhancedComponent.documentation.performanceNotes.map((note, index) => (
                                <div key={index} className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Browser Support */}
                        <div>
                          <Label className="text-xs font-semibold mb-2 block">Browser Support</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(enhancedComponent.documentation.browserSupport).map(([browser, supported]) => (
                              <div key={browser} className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${supported ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs capitalize">{browser}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Usage Analytics */}
                        {componentAnalytics && (
                          <>
                            <Separator />
                            <div>
                              <Label className="text-xs font-semibold mb-2 block flex items-center">
                                <Target className="h-3 w-3 mr-1" />
                                Usage Analytics
                              </Label>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Total Usage:</span>
                                  <span>0</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Average Rating:</span>
                                  <span>0.0/5</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        {/* Enhanced Footer Actions */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              
              {hasParameters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleSaveAsPreset}>
                      <Save className="h-3 w-3 mr-2" />
                      Save as Preset
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyPattern}>
                      <Copy className="h-3 w-3 mr-2" />
                      Copy Pattern
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAdvanced(!showAdvanced)}>
                      <Settings className="h-3 w-3 mr-2" />
                      {showAdvanced ? 'Hide' : 'Show'} Advanced
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!validation.isValid || !hasChanges}
              >
                <Check className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
          
          {/* Status Information */}
          <div className="space-y-1">
            {hasChanges && (
              <p className="text-xs text-muted-foreground text-center">
                You have unsaved changes
              </p>
            )}
            
            {!validation.isValid && (
              <p className="text-xs text-red-500 text-center">
                Fix {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} to apply changes
              </p>
            )}
            
            {validation.warnings.length > 0 && (
              <p className="text-xs text-orange-500 text-center">
                {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface EnhancedParameterInputProps {
  parameter: ComponentParameter
  value: any
  onChange: (value: any) => void
  validation: ValidationState
  componentAnalytics: any
  isAIEnabled: boolean
}

function EnhancedParameterInput({ 
  parameter, 
  value, 
  onChange, 
  validation, 
  componentAnalytics,
  isAIEnabled 
}: EnhancedParameterInputProps) {
  const [localValue, setLocalValue] = useState(value ?? parameter.default ?? '')
  const [showHelp, setShowHelp] = useState(false)
  const [aiSuggestion, setAISuggestion] = useState<string | null>(null)

  useEffect(() => {
    setLocalValue(value ?? parameter.default ?? '')
  }, [value, parameter.default])

  const handleChange = useCallback((newValue: any) => {
    setLocalValue(newValue)
    onChange(newValue)
  }, [onChange])

  // Get popular value for this parameter from analytics
  const popularValue = useMemo(() => {
    if (!componentAnalytics?.popularParameters) return null
    return componentAnalytics.popularParameters[parameter.name]
  }, [componentAnalytics, parameter.name])

  const renderInput = () => {
    switch (parameter.type) {
      case 'string':
        return (
          <div className="space-y-2">
            <div className="relative">
              <Input
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={Array.isArray(parameter.placeholder) ? parameter.placeholder[0] : parameter.placeholder}
                className="text-sm pr-8"
              />
              {isAIEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    // Generate AI suggestion for this parameter
                    setAISuggestion('AI suggested value')
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              )}
            </div>
            {aiSuggestion && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">AI Suggestion:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange(aiSuggestion)}
                    className="h-5 text-xs"
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-muted-foreground">{aiSuggestion}</div>
              </div>
            )}
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                type="number"
                value={localValue}
                onChange={(e) => handleChange(Number(e.target.value))}
                min={parameter.min}
                max={parameter.max}
                className="text-sm flex-1"
              />
              {parameter.min !== undefined && parameter.max !== undefined && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange(Math.max(parameter.min!, localValue - 1))}
                    disabled={localValue <= parameter.min!}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChange(Math.min(parameter.max!, localValue + 1))}
                    disabled={localValue >= parameter.max!}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {parameter.min !== undefined && parameter.max !== undefined && (
              <div className="space-y-1">
                <Slider
                  value={[localValue]}
                  onValueChange={([newValue]) => handleChange(newValue)}
                  min={parameter.min}
                  max={parameter.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{parameter.min}</span>
                  <span>{parameter.max}</span>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={localValue}
                onCheckedChange={handleChange}
              />
              <Label className="text-sm">
                {localValue ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
            {popularValue !== undefined && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    {popularValue ? 'Usually On' : 'Usually Off'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Most users set this to {popularValue ? 'enabled' : 'disabled'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )
      
      case 'string[]':
        return (
          <div className="space-y-2">
            <Textarea
              value={Array.isArray(localValue) ? localValue.join('\n') : localValue}
              onChange={(e) => handleChange(e.target.value.split('\n').filter(s => s.trim()))}
              placeholder="Enter one value per line"
              className="text-sm min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Enter one value per line
            </p>
          </div>
        )
      
      // Select case removed - not supported in base ComponentParameter type
      
      default:
        return (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm"
          />
        )
    }
  }

  // Check for parameter-specific validation errors
  const parameterErrors = validation.errors.filter(error => 
    error.toLowerCase().includes(parameter.name.toLowerCase())
  )
  const parameterWarnings = validation.warnings.filter(warning => 
    warning.toLowerCase().includes(parameter.name.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">{parameter.name}</Label>
          {parameter.type !== 'boolean' && (
            <Badge variant="outline" className="text-xs">
              {parameter.type}
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="h-4 w-4 p-0"
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click for parameter help</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {popularValue !== undefined && parameter.type !== 'boolean' && (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleChange(popularValue)}
                className="text-xs h-6"
              >
                Popular: {String(popularValue)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use the most popular value for this parameter</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {renderInput()}
      
      {/* Parameter Description */}
      <div className="text-xs text-muted-foreground">
        {parameter.description}
      </div>
      
      {/* Parameter Constraints */}
      {(parameter.min !== undefined || parameter.max !== undefined) && (
        <div className="text-xs text-muted-foreground">
          {parameter.min !== undefined && parameter.max !== undefined
            ? `Range: ${parameter.min} - ${parameter.max}`
            : parameter.min !== undefined
            ? `Minimum: ${parameter.min}`
            : `Maximum: ${parameter.max}`
          }
        </div>
      )}
      
      {/* Parameter-specific Validation */}
      {parameterErrors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {parameterErrors.join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {parameterWarnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {parameterWarnings.join(', ')}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Extended Help */}
      {showHelp && (
        <div className="p-3 bg-muted/50 rounded text-xs space-y-2">
          <div>
            <span className="font-medium">Parameter Details:</span>
          </div>
          <div>
            <span className="font-medium">Type:</span> {parameter.type}
          </div>
          {parameter.default !== undefined && (
            <div>
              <span className="font-medium">Default:</span> {String(parameter.default)}
            </div>
          )}
          {/* Options display removed - not supported in base ComponentParameter type */}
          {componentAnalytics?.popularParameters?.[parameter.name] && (
            <div>
              <span className="font-medium">Popular Value:</span> {String(componentAnalytics.popularParameters[parameter.name])}
            </div>
          )}
        </div>
      )}
    </div>
  )
}