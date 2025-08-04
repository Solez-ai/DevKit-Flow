import { useState, useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { ComponentPalette, ComponentParameterPanel, ComponentHelpPanel } from '../regexr'
import type { RegexComponent, PlacedComponent } from '../../types'
import { createPlacedComponent } from '../../lib/regex-component-factory'
import { getComponentById } from '../../lib/regex-components'

export function RegexrWorkspace() {
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null)
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([])
  const [helpComponent, setHelpComponent] = useState<RegexComponent | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const handleComponentSelect = useCallback((component: RegexComponent) => {
    // Create a placed component at a default position
    const placedComponent = createPlacedComponent(
      component.id,
      { x: 100 + placedComponents.length * 20, y: 100 + placedComponents.length * 20 }
    )

    if (placedComponent) {
      setPlacedComponents(prev => [...prev, placedComponent])
      setSelectedComponent(placedComponent)
    }
  }, [placedComponents.length])

  const handleUpdateComponent = useCallback((updatedComponent: PlacedComponent) => {
    setPlacedComponents(prev => 
      prev.map(comp => comp.id === updatedComponent.id ? updatedComponent : comp)
    )
    setSelectedComponent(updatedComponent)
  }, [])

  const handleCloseParameterPanel = useCallback(() => {
    setSelectedComponent(null)
  }, [])

  const handleShowHelp = useCallback((component: RegexComponent) => {
    setHelpComponent(component)
    setShowHelp(true)
  }, [])

  const handleCloseHelp = useCallback(() => {
    setShowHelp(false)
    setHelpComponent(null)
  }, [])

  return (
    <div className="flex-1 flex">
      {/* Component Palette */}
      <ComponentPalette
        onComponentSelect={handleComponentSelect}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 bg-background relative">
        {/* Help Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (selectedComponent) {
                const component = getComponentById(selectedComponent.componentId)
                if (component) {
                  handleShowHelp(component)
                }
              }
            }}
            disabled={!selectedComponent}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold mb-2">Visual Pattern Builder</h2>
            <p className="text-lg mb-4">Select components from the palette to start building</p>
            <div className="text-sm space-y-1">
              <p>• Drag components to create patterns</p>
              <p>• Configure parameters in the side panel</p>
              <p>• Test your patterns in real-time</p>
              <p>• Click Help for component documentation</p>
            </div>
          </div>
        </div>

        {/* Placed Components Display */}
        {placedComponents.length > 0 && (
          <div className="absolute top-4 left-4 right-20">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Current Pattern:</h3>
              <div className="flex flex-wrap gap-2">
                {placedComponents.map((component, index) => (
                  <div
                    key={component.id}
                    className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
                      selectedComponent?.id === component.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => setSelectedComponent(component)}
                  >
                    Component {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parameter Panel */}
      {!showHelp && (
        <ComponentParameterPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={handleUpdateComponent}
          onClose={handleCloseParameterPanel}
        />
      )}

      {/* Help Panel */}
      {showHelp && (
        <ComponentHelpPanel
          component={helpComponent}
          onClose={handleCloseHelp}
        />
      )}
    </div>
  )
}