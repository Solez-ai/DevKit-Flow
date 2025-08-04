import React from 'react'
import type { ComponentTemplate } from '../../types'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import * as LucideIcons from 'lucide-react'

interface ComponentPaletteItemProps {
  component: ComponentTemplate
  onSelect: () => void
  onDragStart: (e: React.DragEvent) => void
}

export const ComponentPaletteItem: React.FC<ComponentPaletteItemProps> = ({
  component,
  onSelect,
  onDragStart
}) => {
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[component.icon] || LucideIcons.Square

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-3 flex items-start gap-3 hover:bg-accent/50 cursor-grab active:cursor-grabbing"
            onClick={onSelect}
            draggable
            onDragStart={onDragStart}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{component.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {component.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {component.description}
              </p>
              
              {/* Component stats */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{component.defaultProps.length} props</span>
                <span>{component.defaultState.length} state</span>
                <span>{component.defaultMethods.length} methods</span>
              </div>
            </div>
          </Button>
        </TooltipTrigger>
        
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div>
              <h4 className="font-medium">{component.name}</h4>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
            
            {component.defaultProps.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">Props:</h5>
                <ul className="text-xs space-y-1">
                  {component.defaultProps.slice(0, 3).map((prop) => (
                    <li key={prop.id} className="flex items-center gap-2">
                      <code className="bg-muted px-1 rounded">{prop.name}</code>
                      <span className="text-muted-foreground">({prop.type})</span>
                      {prop.required && <Badge variant="outline" className="text-xs">required</Badge>}
                    </li>
                  ))}
                  {component.defaultProps.length > 3 && (
                    <li className="text-muted-foreground">
                      +{component.defaultProps.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {component.defaultMethods.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">Methods:</h5>
                <ul className="text-xs space-y-1">
                  {component.defaultMethods.slice(0, 2).map((method) => (
                    <li key={method.id}>
                      <code className="bg-muted px-1 rounded">{method.name}()</code>
                    </li>
                  ))}
                  {component.defaultMethods.length > 2 && (
                    <li className="text-muted-foreground">
                      +{component.defaultMethods.length - 2} more...
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Drag to canvas or click to add
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}