import React, { useState } from 'react'
import type { ComponentWireframe, ComponentProperty, ComponentState, ComponentMethod } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'

import { Plus, Trash2, Edit3, Settings, Code, Zap, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ComponentPropertiesPanelProps {
  component: ComponentWireframe | null
  onComponentUpdate: (updates: Partial<ComponentWireframe>) => void
}

export const ComponentPropertiesPanel: React.FC<ComponentPropertiesPanelProps> = ({
  component,
  onComponentUpdate
}) => {
  const [activeTab, setActiveTab] = useState('properties')

  if (!component) {
    return (
      <div className="w-80 border-l bg-background p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    )
  }

  const handleNameChange = (name: string) => {
    onComponentUpdate({ name })
  }

  // const handleDescriptionChange = (description: string) => {
  //   onComponentUpdate({ 
  //     metadata: { 
  //       ...component.metadata, 
  //       updatedAt: new Date() 
  //     } 
  //   })
  // }

  const handlePropAdd = () => {
    const newProp: ComponentProperty = {
      id: `prop-${Date.now()}`,
      name: 'newProp',
      type: 'string',
      required: false,
      description: ''
    }
    onComponentUpdate({
      props: [...component.props, newProp]
    })
  }

  const handlePropUpdate = (propId: string, updates: Partial<ComponentProperty>) => {
    const updatedProps = component.props.map(prop =>
      prop.id === propId ? { ...prop, ...updates } : prop
    )
    onComponentUpdate({ props: updatedProps })
  }

  const handlePropDelete = (propId: string) => {
    const updatedProps = component.props.filter(prop => prop.id !== propId)
    onComponentUpdate({ props: updatedProps })
  }

  const handleStateAdd = () => {
    const newState: ComponentState = {
      id: `state-${Date.now()}`,
      name: 'newState',
      type: 'string',
      initialValue: '',
      description: ''
    }
    onComponentUpdate({
      state: [...component.state, newState]
    })
  }

  const handleStateUpdate = (stateId: string, updates: Partial<ComponentState>) => {
    const updatedState = component.state.map(state =>
      state.id === stateId ? { ...state, ...updates } : state
    )
    onComponentUpdate({ state: updatedState })
  }

  const handleStateDelete = (stateId: string) => {
    const updatedState = component.state.filter(state => state.id !== stateId)
    onComponentUpdate({ state: updatedState })
  }

  const handleMethodAdd = () => {
    const newMethod: ComponentMethod = {
      id: `method-${Date.now()}`,
      name: 'newMethod',
      parameters: [],
      returnType: 'void',
      description: '',
      visibility: 'public'
    }
    onComponentUpdate({
      methods: [...component.methods, newMethod]
    })
  }

  const handleMethodUpdate = (methodId: string, updates: Partial<ComponentMethod>) => {
    const updatedMethods = component.methods.map(method =>
      method.id === methodId ? { ...method, ...updates } : method
    )
    onComponentUpdate({ methods: updatedMethods })
  }

  const handleMethodDelete = (methodId: string) => {
    const updatedMethods = component.methods.filter(method => method.id !== methodId)
    onComponentUpdate({ methods: updatedMethods })
  }

  const handleStyleUpdate = (styleUpdates: Partial<ComponentWireframe['style']>) => {
    onComponentUpdate({
      style: { ...component.style, ...styleUpdates }
    })
  }

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Properties</h2>
        </div>
        
        {/* Component name */}
        <div className="space-y-2">
          <Label htmlFor="component-name">Component Name</Label>
          <Input
            id="component-name"
            value={component.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Component name"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="properties" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Props
            </TabsTrigger>
            <TabsTrigger value="state" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              State
            </TabsTrigger>
            <TabsTrigger value="methods" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Methods
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Properties Tab */}
            <TabsContent value="properties" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Component Properties</h3>
                <Button size="sm" onClick={handlePropAdd}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Prop
                </Button>
              </div>

              {component.props.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No properties defined</p>
                  <p className="text-xs mt-1">Add props to make the component configurable</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {component.props.map((prop) => (
                    <Card key={prop.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{prop.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePropDelete(prop.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`prop-name-${prop.id}`}>Name</Label>
                            <Input
                              id={`prop-name-${prop.id}`}
                              value={prop.name}
                              onChange={(e) => handlePropUpdate(prop.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`prop-type-${prop.id}`}>Type</Label>
                            <Input
                              id={`prop-type-${prop.id}`}
                              value={prop.type}
                              onChange={(e) => handlePropUpdate(prop.id, { type: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`prop-description-${prop.id}`}>Description</Label>
                          <Textarea
                            id={`prop-description-${prop.id}`}
                            value={prop.description || ''}
                            onChange={(e) => handlePropUpdate(prop.id, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`prop-required-${prop.id}`}
                              checked={prop.required}
                              onCheckedChange={(checked) => handlePropUpdate(prop.id, { required: checked })}
                            />
                            <Label htmlFor={`prop-required-${prop.id}`}>Required</Label>
                          </div>
                          
                          {prop.defaultValue !== undefined && (
                            <Badge variant="secondary">
                              Default: {String(prop.defaultValue)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* State Tab */}
            <TabsContent value="state" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Component State</h3>
                <Button size="sm" onClick={handleStateAdd}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add State
                </Button>
              </div>

              {component.state.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No state defined</p>
                  <p className="text-xs mt-1">Add state to manage component data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {component.state.map((state) => (
                    <Card key={state.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{state.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStateDelete(state.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`state-name-${state.id}`}>Name</Label>
                            <Input
                              id={`state-name-${state.id}`}
                              value={state.name}
                              onChange={(e) => handleStateUpdate(state.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`state-type-${state.id}`}>Type</Label>
                            <Input
                              id={`state-type-${state.id}`}
                              value={state.type}
                              onChange={(e) => handleStateUpdate(state.id, { type: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`state-description-${state.id}`}>Description</Label>
                          <Textarea
                            id={`state-description-${state.id}`}
                            value={state.description || ''}
                            onChange={(e) => handleStateUpdate(state.id, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`state-private-${state.id}`}
                            checked={state.isPrivate || false}
                            onCheckedChange={(checked) => handleStateUpdate(state.id, { isPrivate: checked })}
                          />
                          <Label htmlFor={`state-private-${state.id}`}>Private</Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Methods Tab */}
            <TabsContent value="methods" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Component Methods</h3>
                <Button size="sm" onClick={handleMethodAdd}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Method
                </Button>
              </div>

              {component.methods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No methods defined</p>
                  <p className="text-xs mt-1">Add methods to define component behavior</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {component.methods.map((method) => (
                    <Card key={method.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{method.name}()</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMethodDelete(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`method-name-${method.id}`}>Name</Label>
                            <Input
                              id={`method-name-${method.id}`}
                              value={method.name}
                              onChange={(e) => handleMethodUpdate(method.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`method-return-${method.id}`}>Return Type</Label>
                            <Input
                              id={`method-return-${method.id}`}
                              value={method.returnType}
                              onChange={(e) => handleMethodUpdate(method.id, { returnType: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`method-description-${method.id}`}>Description</Label>
                          <Textarea
                            id={`method-description-${method.id}`}
                            value={method.description || ''}
                            onChange={(e) => handleMethodUpdate(method.id, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`method-async-${method.id}`}
                              checked={method.isAsync || false}
                              onCheckedChange={(checked) => handleMethodUpdate(method.id, { isAsync: checked })}
                            />
                            <Label htmlFor={`method-async-${method.id}`}>Async</Label>
                          </div>
                          
                          <Select
                            value={method.visibility}
                            onValueChange={(value: any) => handleMethodUpdate(method.id, { visibility: value })}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="protected">Protected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="mt-0 space-y-4">
              <h3 className="text-sm font-medium">Component Styling</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="bg-color">Background</Label>
                    <Input
                      id="bg-color"
                      type="color"
                      value={component.style.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="border-color">Border</Label>
                    <Input
                      id="border-color"
                      type="color"
                      value={component.style.borderColor || '#e5e7eb'}
                      onChange={(e) => handleStyleUpdate({ borderColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="border-width">Border Width</Label>
                    <Input
                      id="border-width"
                      type="number"
                      min="0"
                      value={component.style.borderWidth || 1}
                      onChange={(e) => handleStyleUpdate({ borderWidth: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <Input
                      id="border-radius"
                      type="number"
                      min="0"
                      value={component.style.borderRadius || 4}
                      onChange={(e) => handleStyleUpdate({ borderRadius: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="padding">Padding</Label>
                    <Input
                      id="padding"
                      type="number"
                      min="0"
                      value={component.style.padding || 16}
                      onChange={(e) => handleStyleUpdate({ padding: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opacity">Opacity</Label>
                    <Input
                      id="opacity"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={component.style.opacity || 1}
                      onChange={(e) => handleStyleUpdate({ opacity: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}