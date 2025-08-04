import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { ComponentWireframe } from '../../types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MoreHorizontal, Trash2, Edit3 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import * as LucideIcons from 'lucide-react'

interface ComponentWireframeNodeData {
  component: ComponentWireframe
  isSelected: boolean
  onUpdate: (updates: Partial<ComponentWireframe>) => void
  onDelete: () => void
}

export const ComponentWireframeNode = memo<NodeProps<ComponentWireframeNodeData>>(({ data, selected }) => {
  const { component, isSelected, onUpdate, onDelete } = data
  
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[getComponentIcon(component.componentType)] || LucideIcons.Square

  // const handleNameChange = (newName: string) => {
  //   onUpdate({ name: newName })
  // }

  return (
    <div 
      className={`
        bg-white border-2 rounded-lg shadow-sm min-w-[200px] max-w-[300px]
        ${selected || isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
        hover:shadow-md transition-shadow
      `}
      style={{
        backgroundColor: component.style.backgroundColor,
        borderColor: selected || isSelected ? undefined : component.style.borderColor,
        borderWidth: component.style.borderWidth,
        borderRadius: component.style.borderRadius,
      }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <IconComponent className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{component.name}</h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {component.componentType}
            </Badge>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Properties
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Props */}
        {component.props.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Props</h4>
            <div className="space-y-1">
              {component.props.slice(0, 3).map((prop) => (
                <div key={prop.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{prop.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {prop.type.split('|')[0].trim()}
                  </Badge>
                </div>
              ))}
              {component.props.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{component.props.length - 3} more props
                </div>
              )}
            </div>
          </div>
        )}

        {/* State */}
        {component.state.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">State</h4>
            <div className="space-y-1">
              {component.state.slice(0, 2).map((state) => (
                <div key={state.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{state.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {state.type}
                  </Badge>
                </div>
              ))}
              {component.state.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{component.state.length - 2} more state
                </div>
              )}
            </div>
          </div>
        )}

        {/* Methods */}
        {component.methods.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Methods</h4>
            <div className="space-y-1">
              {component.methods.slice(0, 2).map((method) => (
                <div key={method.id} className="text-xs">
                  <span className="font-mono">{method.name}()</span>
                  <span className="text-muted-foreground ml-1">
                    → {method.returnType}
                  </span>
                </div>
              ))}
              {component.methods.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{component.methods.length - 2} more methods
                </div>
              )}
            </div>
          </div>
        )}

        {/* Children indicator */}
        {component.children && component.children.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Contains {component.children.length} child component{component.children.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Footer with complexity indicator */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <Badge 
            variant={component.metadata.complexity === 'simple' ? 'default' : 
                    component.metadata.complexity === 'moderate' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {component.metadata.complexity}
          </Badge>
          <span className="text-muted-foreground">
            {component.metadata.framework}
          </span>
        </div>
      </div>
    </div>
  )
})

ComponentWireframeNode.displayName = 'ComponentWireframeNode'

function getComponentIcon(componentType: string): string {
  const iconMap: Record<string, string> = {
    'Navbar': 'Menu',
    'Button': 'Square',
    'Modal': 'Square',
    'Card': 'Square',
    'Form': 'FileText',
    'Input': 'Type',
    'Select': 'ChevronDown',
    'Checkbox': 'Square',
    'Radio': 'Circle',
    'Table': 'Table',
    'List': 'List',
    'Grid': 'Grid3X3',
    'Sidebar': 'PanelLeft',
    'Header': 'Layout',
    'Footer': 'Layout',
    'Container': 'Square',
    'Custom': 'Component'
  }
  return iconMap[componentType] || 'Square'
}