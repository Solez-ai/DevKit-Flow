import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Trash2, 
  Edit3, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Zap,
  RotateCcw,
  Play,
  Pause,
  Settings,
  ArrowUp,
  ArrowDown,
  Target,
  Activity,
  Layers,
  GitBranch
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { cn } from '../../lib/utils'
import type { 
  RegexComponent, 
  PlacedComponent, 
  Position,
  ValidationResult
} from '../../types'

interface PatternBuilderCanvasProps {
  components: PlacedComponent[]
  onComponentsChange: (components: PlacedComponent[]) => void
  onComponentSelect: (component: PlacedComponent | null) => void
  selectedComponent: PlacedComponent | null
  testString: string
  onPatternGenerated: (pattern: string) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  className?: string
}

interface DropZoneProps {
  children: React.ReactNode
  onDrop: (component: RegexComponent, insertIndex?: number) => void
  isEmpty: boolean
  insertIndex?: number
  showInsertIndicator?: boolean
}

interface ComponentBlockProps {
  component: PlacedComponent
  regexComponent: RegexComponent
  isSelected: boolean
  isHighlighted: boolean
  matchHighlight?: MatchHighlight
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
  onDuplicate: () => void
  onToggleVisibility: () => void
}

interface MatchHighlight {
  isMatching: boolean
  matchCount: number
  hasError: boolean
  errorMessage?: string
}

interface RailroadDiagramProps {
  pattern: string
  components: PlacedComponent[]
  onComponentClick?: (componentId: string) => void
  className?: string
}

interface InsertIndicatorProps {
  position: number
  isVisible: boolean
}

export function PatternBuilderCanvas({
  components,
  onComponentsChange,
  onComponentSelect,
  selectedComponent,
  testString,
  onPatternGenerated,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className = ''
}: PatternBuilderCanvasProps) {
  const [draggedComponent, setDraggedComponent] = useState<RegexComponent | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [showRailroadDiagram, setShowRailroadDiagram] = useState(true)
  const [realTimeMatching, setRealTimeMatching] = useState(true)
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Generate the current regex pattern from components
  const currentPattern = useMemo(() => {
    if (components.length === 0) return ''
    
    try {
      // This is a simplified pattern generation - in a real implementation,
      // you'd have more sophisticated logic based on component types and parameters
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
      
      return pattern
    } catch (error) {
      console.error('Error generating pattern:', error)
      return ''
    }
  }, [components])

  // Real-time match highlighting
  const matchResults = useMemo(() => {
    if (!realTimeMatching || !currentPattern || !testString) {
      return {}
    }

    try {
      const regex = new RegExp(currentPattern, 'g')
      const matches = Array.from(testString.matchAll(regex))
      
      return components.reduce((acc, comp, index) => {
        acc[comp.id] = {
          isMatching: matches.length > 0,
          matchCount: matches.length,
          hasError: false
        }
        return acc
      }, {} as Record<string, MatchHighlight>)
    } catch (error) {
      return components.reduce((acc, comp) => {
        acc[comp.id] = {
          isMatching: false,
          matchCount: 0,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : 'Invalid pattern'
        }
        return acc
      }, {} as Record<string, MatchHighlight>)
    }
  }, [currentPattern, testString, realTimeMatching, components])

  // Update pattern when components change
  useEffect(() => {
    onPatternGenerated(currentPattern)
  }, [currentPattern, onPatternGenerated])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'component') {
      setDraggedComponent(active.data.current.component)
    }
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) {
      setDragOverIndex(null)
      setInsertIndex(null)
      return
    }

    // Handle drag over for insertion between components
    if (active.data.current?.type === 'component' && over.id === 'canvas-drop-zone') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const y = (event.activatorEvent as MouseEvent).clientY - rect.top
        const componentHeight = 80 // Approximate height of each component
        const newInsertIndex = Math.floor(y / componentHeight)
        setInsertIndex(Math.min(newInsertIndex, components.length))
      }
    } else if (active.data.current?.type === 'placed-component') {
      const activeIndex = components.findIndex(c => c.id === active.id)
      const overIndex = components.findIndex(c => c.id === over.id)
      
      if (activeIndex !== -1 && overIndex !== -1) {
        setDragOverIndex(overIndex)
      }
    }
  }, [components])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setDraggedComponent(null)
    setHighlightedIndex(null)
    setDragOverIndex(null)
    setInsertIndex(null)

    if (!over) return

    if (active.data.current?.type === 'component' && over.id === 'canvas-drop-zone') {
      // Add new component from palette
      const component = active.data.current.component as RegexComponent
      const newPlacedComponent: PlacedComponent = {
        id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        componentId: component.id,
        position: { x: 0, y: 0 }, // Position will be determined by order in array
        parameters: getDefaultParameters(component),
        isValid: true,
        validationErrors: [],
        isHidden: false
      }
      
      // Insert at the calculated position
      const targetIndex = insertIndex !== null ? insertIndex : components.length
      const newComponents = [...components]
      newComponents.splice(targetIndex, 0, newPlacedComponent)
      onComponentsChange(newComponents)
    } else if (active.data.current?.type === 'placed-component') {
      // Reorder existing components
      const activeIndex = components.findIndex(c => c.id === active.id)
      const overIndex = components.findIndex(c => c.id === over.id)
      
      if (activeIndex !== -1 && overIndex !== -1) {
        onComponentsChange(arrayMove(components, activeIndex, overIndex))
      }
    }
  }, [components, onComponentsChange, insertIndex])

  const handleComponentSelect = useCallback((component: PlacedComponent) => {
    onComponentSelect(component)
  }, [onComponentSelect])

  const handleComponentDelete = useCallback((componentId: string) => {
    onComponentsChange(components.filter(c => c.id !== componentId))
    if (selectedComponent?.id === componentId) {
      onComponentSelect(null)
    }
  }, [components, onComponentsChange, selectedComponent, onComponentSelect])

  const handleComponentDuplicate = useCallback((component: PlacedComponent) => {
    const duplicated: PlacedComponent = {
      ...component,
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    onComponentsChange([...components, duplicated])
  }, [components, onComponentsChange])

  const handleComponentToggleVisibility = useCallback((componentId: string) => {
    onComponentsChange(components.map(c => 
      c.id === componentId 
        ? { ...c, isHidden: !c.isHidden }
        : c
    ))
  }, [components, onComponentsChange])

  const handleClearAll = useCallback(() => {
    onComponentsChange([])
    onComponentSelect(null)
  }, [onComponentsChange, onComponentSelect])

  const handleUndo = useCallback(() => {
    if (onUndo && canUndo) {
      onUndo()
    }
  }, [onUndo, canUndo])

  const handleRedo = useCallback(() => {
    if (onRedo && canRedo) {
      onRedo()
    }
  }, [onRedo, canRedo])

  return (
    <TooltipProvider>
      <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className={cn('flex flex-col h-full bg-background', className)}>
          {/* Canvas Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Pattern Builder</h3>
              <Badge variant="secondary" className="text-xs">
                {components.length} component{components.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={realTimeMatching ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRealTimeMatching(!realTimeMatching)}
                  >
                    {realTimeMatching ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{realTimeMatching ? 'Pause' : 'Resume'} real-time matching</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showRailroadDiagram ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowRailroadDiagram(!showRailroadDiagram)}
                  >
                    {showRailroadDiagram ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showRailroadDiagram ? 'Hide' : 'Show'} railroad diagram</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={!canUndo}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo last action</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={!canRedo}
                  >
                    <RotateCcw className="h-3 w-3 scale-x-[-1]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo last action</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={components.length === 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all components</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Drop Zone */}
            <DropZone
              onDrop={(component, targetIndex) => {
                const newPlacedComponent: PlacedComponent = {
                  id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  componentId: component.id,
                  position: { x: 0, y: 0 },
                  parameters: getDefaultParameters(component),
                  isValid: true,
                  validationErrors: [],
                  isHidden: false
                }
                
                const newComponents = [...components]
                const index = targetIndex !== undefined ? targetIndex : components.length
                newComponents.splice(index, 0, newPlacedComponent)
                onComponentsChange(newComponents)
              }}
              isEmpty={components.length === 0}
              insertIndex={insertIndex ?? undefined}
              showInsertIndicator={insertIndex !== null}
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2" ref={canvasRef}>
                  <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {components.map((component, index) => (
                      <SortableComponentBlock
                        key={component.id}
                        component={component}
                        isSelected={selectedComponent?.id === component.id}
                        isHighlighted={highlightedIndex === index}
                        matchHighlight={matchResults[component.id]}
                        onSelect={() => handleComponentSelect(component)}
                        onDelete={() => handleComponentDelete(component.id)}
                        onEdit={() => handleComponentSelect(component)}
                        onDuplicate={() => handleComponentDuplicate(component)}
                        onToggleVisibility={() => handleComponentToggleVisibility(component.id)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </ScrollArea>
            </DropZone>

            {/* Railroad Diagram */}
            {showRailroadDiagram && (
              <div className="border-t">
                <RailroadDiagram
                  pattern={currentPattern}
                  components={components}
                  onComponentClick={(componentId) => {
                    const component = components.find(c => c.componentId === componentId)
                    if (component) {
                      handleComponentSelect(component)
                    }
                  }}
                  className="h-32"
                />
              </div>
            )}
          </div>

          {/* Pattern Output */}
          <div className="border-t p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Generated Pattern</label>
                <div className="flex items-center space-x-2">
                  {currentPattern && (
                    <Badge variant="outline" className="text-xs">
                      {currentPattern.length} chars
                    </Badge>
                  )}
                  {testString && realTimeMatching && (
                    <Badge 
                      variant={Object.values(matchResults).some(r => r.isMatching) ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {Object.values(matchResults).reduce((sum, r) => sum + r.matchCount, 0)} matches
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded font-mono text-sm min-h-[40px] flex items-center">
                {currentPattern || (
                  <span className="text-muted-foreground italic">
                    Drag components here to build your pattern
                  </span>
                )}
              </div>

              {/* Validation Errors */}
              {Object.values(matchResults).some(r => r.hasError) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Pattern contains errors. Check component configuration.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedComponent && (
            <Card className="w-64 opacity-90 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: draggedComponent.visualRepresentation.color }}
                  >
                    {draggedComponent.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{draggedComponent.name}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>
  )
}

// Drop Zone Component
function DropZone({ children, onDrop, isEmpty, insertIndex, showInsertIndicator }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
    data: {
      type: 'canvas'
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 relative transition-colors',
        isOver && 'bg-primary/5 border-primary/20',
        isEmpty && 'border-2 border-dashed border-muted-foreground/20'
      )}
    >
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-lg mb-2">🎯</div>
            <div className="text-sm font-medium">Drop components here</div>
            <div className="text-xs">Drag regex components from the palette to build your pattern</div>
          </div>
        </div>
      )}
      
      {/* Insert Indicator */}
      {showInsertIndicator && insertIndex !== null && (
        <InsertIndicator position={insertIndex!} isVisible={true} />
      )}
      
      {children}
    </div>
  )
}

// Insert Indicator Component
function InsertIndicator({ position, isVisible }: InsertIndicatorProps) {
  if (!isVisible) return null

  return (
    <div 
      className="absolute left-0 right-0 h-0.5 bg-primary z-10 transition-all duration-200"
      style={{ 
        top: `${position * 80}px`, // 80px is approximate component height
        boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
      }}
    >
      <div className="absolute left-2 top-[-4px] w-2 h-2 bg-primary rounded-full" />
      <div className="absolute right-2 top-[-4px] w-2 h-2 bg-primary rounded-full" />
    </div>
  )
}

// Sortable Component Block
function SortableComponentBlock(props: Omit<ComponentBlockProps, 'regexComponent'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: props.component.id,
    data: {
      type: 'placed-component',
      component: props.component
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  // Get the regex component data (this would come from a component registry)
  const regexComponent = getRegexComponentById(props.component.componentId)
  if (!regexComponent) return null

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ComponentBlock {...props} regexComponent={regexComponent} />
    </div>
  )
}

// Component Block
function ComponentBlock({
  component,
  regexComponent,
  isSelected,
  isHighlighted,
  matchHighlight,
  onSelect,
  onDelete,
  onEdit,
  onDuplicate,
  onToggleVisibility
}: ComponentBlockProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 border-l-4 group',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isHighlighted && 'bg-muted/50',
        component.isHidden && 'opacity-50',
        matchHighlight?.hasError && 'border-destructive bg-destructive/5',
        matchHighlight?.isMatching && !matchHighlight.hasError && 'border-green-500 bg-green-50',
        isHovered && 'shadow-md scale-[1.02]'
      )}
      style={{ borderLeftColor: regexComponent.visualRepresentation.color }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: regexComponent.visualRepresentation.color }}
            >
              {regexComponent.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate">{regexComponent.name}</span>
                {component.isHidden && (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
                {matchHighlight && (
                  <div className="flex items-center space-x-1">
                    {matchHighlight.hasError ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pattern error: {matchHighlight.errorMessage}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : matchHighlight.isMatching ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pattern matches test string</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger>
                          <Target className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>No matches found</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {matchHighlight.matchCount > 0 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {matchHighlight.matchCount} match{matchHighlight.matchCount !== 1 ? 'es' : ''}
                      </Badge>
                    )}
                    {matchHighlight.isMatching && (
                      <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground truncate">
                {regexComponent.description}
              </div>
              
              <div className={cn(
                'rounded px-2 py-1 font-mono text-xs mt-1 transition-colors duration-200',
                matchHighlight?.isMatching && !matchHighlight.hasError 
                  ? 'bg-green-100 border border-green-200' 
                  : matchHighlight?.hasError 
                    ? 'bg-red-100 border border-red-200'
                    : 'bg-muted/50'
              )}>
                {regexComponent.regexPattern}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Ordering controls - only show on hover */}
            <div className={cn(
              'flex items-center space-x-1 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Move up logic would be handled by parent
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Move up</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Move down logic would be handled by parent
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Move down</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleVisibility()
                  }}
                  className="h-6 w-6 p-0"
                >
                  {component.isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{component.isHidden ? 'Show' : 'Hide'} component</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit component</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate component</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete component</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Parameter Display */}
        {Object.keys(component.parameters || {}).length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {Object.entries(component.parameters || {}).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {matchHighlight?.hasError && matchHighlight.errorMessage && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-destructive">
              {matchHighlight.errorMessage}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Railroad Diagram Component (enhanced implementation)
function RailroadDiagram({ pattern, components, onComponentClick, className = '' }: RailroadDiagramProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  const renderDiagramElements = () => {
    if (!pattern || components.length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center">
          Railroad diagram will appear here
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2 overflow-x-auto">
        {/* Start indicator */}
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div className="w-4 h-0.5 bg-gray-400" />
        </div>

        {/* Component blocks */}
        {components.filter(c => !c.isHidden).map((component, index) => {
          const regexComponent = getRegexComponentById(component.componentId)
          if (!regexComponent) return null

          return (
            <div key={component.id} className="flex items-center">
              <div
                className={cn(
                  'px-3 py-2 rounded border cursor-pointer transition-all duration-200',
                  'hover:shadow-md hover:scale-105',
                  hoveredComponent === component.id && 'ring-2 ring-primary ring-offset-1',
                  'bg-white border-gray-300'
                )}
                style={{ 
                  borderLeftColor: regexComponent.visualRepresentation.color,
                  borderLeftWidth: '3px'
                }}
                onClick={() => onComponentClick?.(component.componentId)}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: regexComponent.visualRepresentation.color }}
                  >
                    {regexComponent.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{regexComponent.name}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {regexComponent.regexPattern}
                </div>
              </div>
              
              {/* Connection line */}
              {index < components.filter(c => !c.isHidden).length - 1 && (
                <div className="w-4 h-0.5 bg-gray-400" />
              )}
            </div>
          )
        })}

        {/* End indicator */}
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-gray-400" />
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-muted/30 p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium">Railroad Diagram</h4>
          <GitBranch className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">Interactive</Badge>
          {components.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {components.filter(c => !c.isHidden).length} components
            </Badge>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded border p-4 min-h-[80px] flex items-center">
        {renderDiagramElements()}
      </div>
      
      {hoveredComponent && (
        <div className="mt-2 text-xs text-muted-foreground">
          Click components to select and edit them
        </div>
      )}
    </div>
  )
}

// Helper functions (these would be implemented properly in a real app)
function getRegexComponentById(id: string): RegexComponent | null {
  // This would fetch from a component registry
  // For now, return a mock component
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

function getDefaultParameters(component: RegexComponent): Record<string, any> {
  // Return default parameters based on component definition
  const defaults: Record<string, any> = {}
  
  if (component.parameters) {
    component.parameters.forEach(param => {
      if (param.default !== undefined) {
        defaults[param.name] = param.default
      }
    })
  }
  
  return defaults
}

// Add isHidden property to PlacedComponent interface extension
declare module '../../types' {
  interface PlacedComponent {
    isHidden?: boolean
  }
}