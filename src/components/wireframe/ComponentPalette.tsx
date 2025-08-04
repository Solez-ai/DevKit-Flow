import React, { useState, useMemo } from 'react'
import { Search, Plus, Grid3X3, Layers, Package, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import type { ComponentType } from '../../types'
import { getAllComponentTemplates, getComponentsByCategory } from '../../lib/component-wireframe-factory'
import { ComponentPaletteItem } from './ComponentPaletteItem'

interface ComponentPaletteProps {
  onComponentSelect: (componentType: ComponentType) => void
  onCreateCustomComponent: () => void
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onComponentSelect,
  onCreateCustomComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const componentsByCategory = useMemo(() => getComponentsByCategory(), [])
  const allComponents = useMemo(() => getAllComponentTemplates(), [])

  const filteredComponents = useMemo(() => {
    let components = selectedCategory === 'all' 
      ? allComponents 
      : componentsByCategory[selectedCategory] || []

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      components = components.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.category.toLowerCase().includes(query)
      )
    }

    return components
  }, [allComponents, componentsByCategory, selectedCategory, searchQuery])

  const categories = useMemo(() => {
    const cats = Object.keys(componentsByCategory)
    return [
      { id: 'all', name: 'All Components', icon: Grid3X3, count: allComponents.length },
      ...cats.map(cat => ({
        id: cat,
        name: cat,
        icon: getCategoryIcon(cat),
        count: componentsByCategory[cat].length
      }))
    ]
  }, [componentsByCategory, allComponents])

  const handleComponentDragStart = (e: React.DragEvent, componentType: ComponentType) => {
    e.dataTransfer.setData('application/component-type', componentType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Components</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={onCreateCustomComponent}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Custom
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="Layout" className="text-xs">Layout</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {/* Category buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.slice(0, 8).map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-auto p-2 flex flex-col items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                )
              })}
            </div>

            {/* Component list */}
            <div className="space-y-2">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No components found</p>
                  {searchQuery && (
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  )}
                </div>
              ) : (
                filteredComponents.map((component) => (
                  <ComponentPaletteItem
                    key={component.id}
                    component={component}
                    onSelect={() => onComponentSelect(component.componentType)}
                    onDragStart={(e) => handleComponentDragStart(e, component.componentType)}
                  />
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="text-xs text-muted-foreground text-center">
          <p>Drag components to canvas</p>
          <p className="mt-1">or click to add at center</p>
        </div>
      </div>
    </div>
  )
}

function getCategoryIcon(category: string) {
  const iconMap: Record<string, any> = {
    'Layout': Layers,
    'Form': Package,
    'Navigation': Grid3X3,
    'Data': Package,
    'Overlay': Layers,
    'Custom': Zap
  }
  return iconMap[category] || Package
}