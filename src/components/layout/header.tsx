import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace, useSessions, useUIState } from "@/hooks/use-app-store"
import { useTheme } from "@/components/theme-provider"
import { useMobile } from "@/hooks/use-mobile"
import { AIStatusIcon } from "@/components/ai"
import { MobileNav } from "@/components/mobile"
import { 
  Menu, 
  Settings, 
  Sun, 
  Moon, 
  Monitor, 
  Download, 
  Upload,
  Undo,
  Redo,
  HelpCircle
} from "lucide-react"

export function Header() {
  const { 
    currentWorkspace, 
    setCurrentWorkspace
  } = useWorkspace()
  
  const {
    sessions,
    currentSessionId
  } = useSessions()
  
  const {
    toggleSidebar,
    sidebarCollapsed: _sidebarCollapsed
  } = useUIState()
  
  const { setTheme } = useTheme()
  const { isMobile } = useMobile()
  
  const currentSession = sessions.find(s => s.id === currentSessionId)

  return (
    <header 
      className="h-14 border-b bg-background flex items-center px-4 gap-4"
      role="banner"
      aria-label="Main navigation"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {isMobile ? (
          <MobileNav />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar navigation"
            aria-expanded={!_sidebarCollapsed}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="DevKit Flow" className="h-6 w-6" />
            <span className="font-bold text-lg">DevKit Flow</span>
          </div>
          
          <nav className="hidden md:flex items-center ml-4" aria-label="Workspace navigation">
            <Button
              variant={currentWorkspace === 'studio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentWorkspace('studio')}
              aria-current={currentWorkspace === 'studio' ? 'page' : undefined}
            >
              Studio
            </Button>
            <Button
              variant={currentWorkspace === 'regexr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentWorkspace('regexr')}
              aria-current={currentWorkspace === 'regexr' ? 'page' : undefined}
            >
              Regexr++
            </Button>
          </nav>
        </div>
        
        {currentSession && (
          <div className="hidden lg:block text-sm text-muted-foreground">
            {currentSession.name}
          </div>
        )}
      </div>
      
      {/* Center section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <AIStatusIcon />
          <span className="text-sm text-muted-foreground">
            {currentWorkspace === 'studio' ? 'DevFlow Studio' : 'Regexr++'}
          </span>
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}