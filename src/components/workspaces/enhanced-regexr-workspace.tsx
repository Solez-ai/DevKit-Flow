import { useState, useCallback } from 'react'
import { Bot, Settings, HelpCircle, Zap, Brain } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { 
  ComponentPalette, 
  ComponentParameterPanel, 
  ComponentHelpPanel,
  AIRegexAssistant,
  AIPatternExplainer,
  AIDebugHelper,
  AIPatternOptimizer
} from '../regexr'
import { useAIServiceStatus } from '../../hooks/use-ai-service'
import type { RegexComponent, PlacedComponent } from '../../types'

interface EnhancedRegexrWorkspaceProps {
  className?: string
}

export function EnhancedRegexrWorkspace({ className = '' }: EnhancedRegexrWorkspaceProps) {
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null)
  const [helpComponent, setHelpComponent] = useState<RegexComponent | null>(null)
  const [currentPattern, setCurrentPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [activeAIPanel, setActiveAIPanel] = useState<'assistant' | 'explainer' | 'debug' | 'optimizer' | null>(null)
  const [showAIPanels, setShowAIPanels] = useState(false)
  
  const aiStatus = useAIServiceStatus()

  const handleComponentSelect = useCallback((component: RegexComponent) => {
    // Create a placed component from the selected component
    const placedComponent: PlacedComponent = {
      id: `placed-${Date.now()}`,
      componentId: component.id,
      position: { x: 0, y: 0 },
      parameters: {},
      isValid: true,
      validationErrors: []
    }
    setSelectedComponent(placedComponent)
    setHelpComponent(component)
  }, [])

  const handlePatternGenerated = useCallback((pattern: string, explanation: string) => {
    setCurrentPattern(pattern)
    // You could also show the explanation in a toast or modal
    console.log('Generated pattern:', pattern, 'Explanation:', explanation)
  }, [])

  const handleOptimizationSuggested = useCallback((optimizedPattern: string, explanation: string) => {
    setCurrentPattern(optimizedPattern)
    console.log('Optimized pattern:', optimizedPattern, 'Explanation:', explanation)
  }, [])

  const handleComponentUpdate = useCallback((updatedComponent: PlacedComponent) => {
    setSelectedComponent(updatedComponent)
    // Update the pattern based on the component
    // This would typically involve regenerating the regex pattern
  }, [])

  const toggleAIPanel = (panel: typeof activeAIPanel) => {
    if (activeAIPanel === panel) {
      setActiveAIPanel(null)
      setShowAIPanels(false)
    } else {
      setActiveAIPanel(panel)
      setShowAIPanels(true)
    }
  }

  return (
    <div className={`flex h-full ${className}`}>
      {/* Left Sidebar - Component Palette */}
      <ComponentPalette
        onComponentSelect={handleComponentSelect}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b bg-background flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">Regexr++</h1>
            <Badge variant="secondary" className="text-xs">Enhanced</Badge>
          </div>
          
          {/* AI Controls */}
          <div className="flex items-center space-x-2">
            {aiStatus.isAvailable && (
              <>
                <Button
                  variant={activeAIPanel === 'assistant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAIPanel('assistant')}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Assistant
                </Button>
                <Button
                  variant={activeAIPanel === 'explainer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAIPanel('explainer')}
                >
                  <Brain className="h-3 w-3 mr-1" />
                  Explain
                </Button>
                <Button
                  variant={activeAIPanel === 'debug' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAIPanel('debug')}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Debug
                </Button>
                <Button
                  variant={activeAIPanel === 'optimizer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleAIPanel('optimizer')}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </>
            )}
            
            {!aiStatus.isAvailable && (
              <Badge variant="outline" className="text-xs">
                {aiStatus.isFallbackMode ? 'Offline Mode' : 'AI Disabled'}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Pattern Builder Area */}
          <div className="flex-1 flex flex-col">
            {/* Pattern Display */}
            <Card className="m-4 mb-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded font-mono text-sm min-h-[40px] flex items-center">
                  {currentPattern || 'No pattern built yet'}
                </div>
              </CardContent>
            </Card>

            {/* Test Area */}
            <Card className="mx-4 mb-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Test String</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against your pattern..."
                  className="w-full p-2 border rounded text-sm"
                />
              </CardContent>
            </Card>

            {/* AI Panels */}
            {showAIPanels && (
              <div className="mx-4 mb-4 flex-1">
                <ScrollArea className="h-full">
                  {activeAIPanel === 'assistant' && (
                    <AIRegexAssistant
                      currentPattern={currentPattern}
                      onPatternGenerated={handlePatternGenerated}
                      onOptimizationSuggested={handleOptimizationSuggested}
                    />
                  )}
                  
                  {activeAIPanel === 'explainer' && (
                    <AIPatternExplainer
                      pattern={currentPattern}
                      flags={[]}
                    />
                  )}
                  
                  {activeAIPanel === 'debug' && (
                    <AIDebugHelper
                      pattern={currentPattern}
                      testString={testString}
                      onSuggestionApplied={(suggestion) => handlePatternGenerated(suggestion, '')}
                    />
                  )}
                  
                  {activeAIPanel === 'optimizer' && (
                    <AIPatternOptimizer
                      pattern={currentPattern}
                      testCases={testString ? [testString] : []}
                      onOptimizedPattern={handleOptimizationSuggested}
                    />
                  )}
                </ScrollArea>
              </div>
            )}

            {/* Default Content when no AI panel is active */}
            {!showAIPanels && (
              <div className="flex-1 flex items-center justify-center mx-4 mb-4">
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6 text-center">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Enhanced Regex Builder</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select components from the palette or use AI assistance to build powerful regex patterns.
                    </p>
                    {aiStatus.isAvailable && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">AI Features Available:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant="secondary" className="text-xs">Pattern Generation</Badge>
                          <Badge variant="secondary" className="text-xs">Smart Explanations</Badge>
                          <Badge variant="secondary" className="text-xs">Debug Assistance</Badge>
                          <Badge variant="secondary" className="text-xs">Optimization</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar - Configuration and Help */}
          <div className="w-80 border-l flex flex-col">
            <Tabs defaultValue="config" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4 mb-2">
                <TabsTrigger value="config">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="help">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="flex-1 m-0">
                <ComponentParameterPanel
                  selectedComponent={selectedComponent}
                  onUpdateComponent={handleComponentUpdate}
                  onClose={() => setSelectedComponent(null)}
                  className="border-0"
                />
              </TabsContent>

              <TabsContent value="help" className="flex-1 m-0">
                <ComponentHelpPanel
                  component={helpComponent}
                  onClose={() => setHelpComponent(null)}
                  className="border-0"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}