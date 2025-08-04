import React, { useState, useCallback } from 'react'
import type { ComponentWireframe, ComponentType } from '../../types'
import { ComponentPalette } from './ComponentPalette'
import { ComponentWireframeCanvas } from './ComponentWireframeCanvas'
import { ComponentPropertiesPanel } from './ComponentPropertiesPanel'
import { createComponentWireframe } from '../../lib/component-wireframe-factory'
import { useToast } from '../../hooks/use-toast'

interface ComponentWireframeWorkspaceProps {
  sessionId: string
  components: ComponentWireframe[]
  onComponentsChange: (components: ComponentWireframe[]) => void
}

export const ComponentWireframeWorkspace: React.FC<ComponentWireframeWorkspaceProps> = ({
  sessionId,
  components,
  onComponentsChange
}) => {
  const { toast } = useToast()
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  const selectedComponent = selectedComponentId 
    ? components.find(c => c.id === selectedComponentId) || null
    : null

  const handleComponentSelect = useCallback((componentType: ComponentType) => {
    // Add component to center of canvas
    const newComponent = createComponentWireframe(
      componentType,
      { x: 300, y: 200 }, // Center position
      { width: 200, height: 150 }
    )
    
    const updatedComponents = [...components, newComponent]
    onComponentsChange(updatedComponents)
    setSelectedComponentId(newComponent.id)

    toast({
      title: "Component added",
      description: `${componentType} component has been added to the wireframe.`
    })
  }, [components, onComponentsChange, toast])

  const handleCreateCustomComponent = useCallback(() => {
    const customComponent = createComponentWireframe(
      'Custom',
      { x: 300, y: 200 },
      { width: 200, height: 150 },
      'Custom Component'
    )
    
    const updatedComponents = [...components, customComponent]
    onComponentsChange(updatedComponents)
    setSelectedComponentId(customComponent.id)

    toast({
      title: "Custom component created",
      description: "A new custom component has been added. Configure its properties in the panel."
    })
  }, [components, onComponentsChange, toast])

  const handleComponentUpdate = useCallback((componentId: string, updates: Partial<ComponentWireframe>) => {
    const updatedComponents = components.map(component =>
      component.id === componentId 
        ? { 
            ...component, 
            ...updates,
            metadata: {
              ...component.metadata,
              updatedAt: new Date()
            }
          }
        : component
    )
    onComponentsChange(updatedComponents)
  }, [components, onComponentsChange])

  const handleSelectedComponentUpdate = useCallback((updates: Partial<ComponentWireframe>) => {
    if (selectedComponentId) {
      handleComponentUpdate(selectedComponentId, updates)
    }
  }, [selectedComponentId, handleComponentUpdate])

  return (
    <div className="flex h-full bg-background">
      {/* Component Palette */}
      <ComponentPalette
        onComponentSelect={handleComponentSelect}
        onCreateCustomComponent={handleCreateCustomComponent}
      />

      {/* Canvas */}
      <ComponentWireframeCanvas
        sessionId={sessionId}
        components={components}
        onComponentsChange={onComponentsChange}
        onComponentSelect={setSelectedComponentId}
        selectedComponentId={selectedComponentId}
      />

      {/* Properties Panel */}
      <ComponentPropertiesPanel
        component={selectedComponent}
        onComponentUpdate={handleSelectedComponentUpdate}
      />
    </div>
  )
}