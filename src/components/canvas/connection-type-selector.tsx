import { useCallback } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  GitBranch, 
  Link, 
  Ban,
  Plus,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConnectionType } from '@/types'

interface ConnectionTypeSelectorProps {
  onSelectType: (type: ConnectionType) => void
  onOpenAdvanced: () => void
  trigger?: React.ReactNode
  disabled?: boolean
}

const connectionTypes: Array<{
  type: ConnectionType
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  color: string
  shortcut: string
}> = [
  {
    type: 'dependency',
    icon: ArrowRight,
    label: 'Dependency',
    description: 'Target depends on source',
    color: 'blue',
    shortcut: 'D'
  },
  {
    type: 'sequence',
    icon: GitBranch,
    label: 'Sequence',
    description: 'Target follows source',
    color: 'green',
    shortcut: 'S'
  },
  {
    type: 'reference',
    icon: Link,
    label: 'Reference',
    description: 'Target references source',
    color: 'purple',
    shortcut: 'R'
  },
  {
    type: 'blocks',
    icon: Ban,
    label: 'Blocks',
    description: 'Source blocks target',
    color: 'red',
    shortcut: 'B'
  }
]

export function ConnectionTypeSelector({
  onSelectType,
  onOpenAdvanced,
  trigger,
  disabled = false
}: ConnectionTypeSelectorProps) {
  const handleSelectType = useCallback((type: ConnectionType) => {
    onSelectType(type)
  }, [onSelectType])

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Connection
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Connection Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {connectionTypes.map(({ type, icon: Icon, label, description, color, shortcut }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleSelectType(type)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md',
              color === 'blue' && 'bg-blue-100 text-blue-600',
              color === 'green' && 'bg-green-100 text-green-600',
              color === 'purple' && 'bg-purple-100 text-purple-600',
              color === 'red' && 'bg-red-100 text-red-600'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{label}</span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {shortcut}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onOpenAdvanced}
          className="flex items-center gap-3 p-3 cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
            <Settings className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-sm">Advanced Options</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Custom labels and settings
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}