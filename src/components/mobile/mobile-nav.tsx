import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useWorkspace, useUIState } from '@/hooks/use-app-store'
import { useMobile } from '@/hooks/use-mobile'
import { 
  Menu, 
  Home, 
  Regex, 
  Settings,
  X
} from 'lucide-react'
import { useState } from 'react'

export function MobileNav() {
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const { isMobile } = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  if (!isMobile) return null

  const workspaces = [
    {
      id: 'studio' as const,
      name: 'DevFlow Studio',
      icon: Home,
      description: 'Visual development planning'
    },
    {
      id: 'regexr' as const,
      name: 'Regexr++',
      icon: Regex,
      description: 'Visual regex builder'
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Settings,
      description: 'App configuration'
    }
  ]

  const handleWorkspaceChange = (workspaceId: typeof currentWorkspace) => {
    setCurrentWorkspace(workspaceId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="DevKit Flow" className="h-6 w-6" />
              <span className="font-bold text-lg">DevKit Flow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4" aria-label="Mobile navigation">
            <div className="space-y-2">
              {workspaces.map((workspace) => {
                const Icon = workspace.icon
                const isActive = currentWorkspace === workspace.id
                
                return (
                  <Button
                    key={workspace.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <div className="text-left">
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workspace.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              DevKit Flow v1.0.0
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}