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

      {/* Center section - Workspace specific controls */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {currentWorkspace === 'studio' && (
          <>
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </>
        )}
        
        {currentWorkspace === 'regexr' && (
          <div className="text-sm text-muted-foreground">
            Visual Regex Builder
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2" id="header-actions">
        <AIStatusIcon />
        
        <Button variant="ghost" size="icon" aria-label="Import data">
          <Upload className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" aria-label="Export data">
          <Download className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCurrentWorkspace('settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}