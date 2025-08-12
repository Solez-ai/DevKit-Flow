import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace, useSessions, useUIState, usePatterns } from "@/hooks/use-app-store"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { 
  Plus, 
  FileText, 
  Code, 
  Link, 
  MessageSquare, 
  File,
  Regex,
  Hash,
  Anchor,
  Repeat,
  Brackets,
  Terminal,
  Undo,
  Redo,
  Upload,
  Download,
  Sun,
  Moon,
  HelpCircle,
  Settings,
  XCircle
} from "lucide-react"

export function Sidebar() {
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const { sidebarCollapsed } = useUIState()
  const { isMobile, isTablet } = useMobile()
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    console.log('Switching theme to:', newTheme)
    setTheme(newTheme)
  }

  const handleUndo = () => {
    console.log('Undo clicked')
    // TODO: Implement undo functionality
  }

  const handleRedo = () => {
    console.log('Redo clicked')
    // TODO: Implement redo functionality
  }

  const handleUpload = () => {
    console.log('Upload clicked')
    // TODO: Implement upload functionality
  }

  const handleDownload = () => {
    console.log('Download clicked')
    // TODO: Implement download functionality
  }

  const handleHelp = () => {
    console.log('Help clicked')
    // TODO: Implement help functionality
  }

  const handleSettings = () => {
    console.log('Settings clicked')
    setCurrentWorkspace('settings')
  }

  if (sidebarCollapsed && !isMobile) {
    return null
  }

  if (isMobile && sidebarCollapsed) {
    return null
  }

  const sidebarWidth = isMobile ? "w-full" : isTablet ? "w-48" : "w-80"

  return (
    <aside 
      className={cn(
        "sidebar",
        sidebarWidth,
        isMobile && "absolute top-0 left-0 h-full z-40 shadow-lg"
      )}
      role="navigation"
      aria-label="Sidebar navigation"
      id="sidebar-navigation"
    >
      {/* Branding and Workspace Selection */}
      <div className="sidebar-branding">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="app-logo">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="app-brand">DevKit Flow</h1>
          </div>
        </div>
        
        {/* Workspace Toggle */}
        <div className="workspace-toggle">
          <button
            className={cn(
              "workspace-toggle-item",
              currentWorkspace === 'studio' ? 'active' : 'inactive'
            )}
            onClick={() => setCurrentWorkspace('studio')}
          >
            Studio
          </button>
          <button
            className={cn(
              "workspace-toggle-item",
              currentWorkspace === 'regexr' ? 'active' : 'inactive'
            )}
            onClick={() => setCurrentWorkspace('regexr')}
          >
            Regexr++
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="utility-buttons">
          <div className="utility-button-row">
            <button className="utility-button" onClick={handleUndo}>
              <Undo className="h-4 w-4" />
            </button>
            <button className="utility-button" onClick={handleRedo}>
              <Redo className="h-4 w-4" />
            </button>
          </div>
          
          <div className="utility-button-row">
            <button className="utility-button" onClick={handleUpload}>
              <Upload className="h-4 w-4" />
            </button>
            <button className="utility-button" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </button>
          </div>
          
          <div className="utility-button-row">
            <button 
              className="utility-button" 
              onClick={handleThemeToggle}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="utility-button">
              <Moon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="utility-button-row">
            <button className="utility-button" onClick={handleHelp}>
              <HelpCircle className="h-4 w-4" />
            </button>
            <button className="utility-button" onClick={handleSettings}>
              <Settings className="h-4 w-4" />
            </button>
          </div>
          
          {/* Status Indicator */}
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      {currentWorkspace === 'studio' && <StudioSidebar />}
      {currentWorkspace === 'regexr' && <RegexrSidebar />}
      {currentWorkspace === 'settings' && <SettingsSidebar />}
    </aside>
  )
}

function StudioSidebar() {
  const { sessions, currentSessionId } = useSessions()
  const currentSession = sessions.find(s => s.id === currentSessionId)

  return (
    <>
      {/* Node Palette */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Node Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2" role="group" aria-label="Node creation tools">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            aria-label="Create task node"
          >
            <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
            Task Node
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            aria-label="Create code node"
          >
            <Code className="h-4 w-4 mr-2" aria-hidden="true" />
            Code Node
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            aria-label="Create reference node"
          >
            <Link className="h-4 w-4 mr-2" aria-hidden="true" />
            Reference Node
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            aria-label="Create comment node"
          >
            <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
            Comment Node
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            aria-label="Create template node"
          >
            <File className="h-4 w-4 mr-2" aria-hidden="true" />
            Template Node
          </Button>
        </CardContent>
      </Card>

      {/* Session Info */}
      {currentSession && (
        <Card className="m-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(currentSession.metadata.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nodes:</span>
              <span>{currentSession.nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed:</span>
              <span>{currentSession.nodes.filter(n => n.status === 'completed').length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function RegexrSidebar() {
  return (
    <>
      {/* Component Palette */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Component Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs text-muted-foreground mb-2">Text Matching</div>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Hash className="h-4 w-4 mr-2" />
            Any Character
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Word Characters
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Hash className="h-4 w-4 mr-2" />
            Digits
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Hash className="h-4 w-4 mr-2" />
            Whitespace
          </Button>
          
          <div className="text-xs text-muted-foreground mb-2 mt-4">Anchors</div>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Anchor className="h-4 w-4 mr-2" />
            Start of String
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Anchor className="h-4 w-4 mr-2" />
            End of String
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Anchor className="h-4 w-4 mr-2" />
            Word Boundary
          </Button>
          
          <div className="text-xs text-muted-foreground mb-2 mt-4">Quantifiers</div>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Repeat className="h-4 w-4 mr-2" />
            Optional (?)
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Repeat className="h-4 w-4 mr-2" />
            One or More (+)
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Repeat className="h-4 w-4 mr-2" />
            Zero or More (*)
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function SettingsSidebar() {
  return (
    <>
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="text-sm">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            General
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Sun className="h-4 w-4 mr-2" />
            Appearance
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Data Management
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </Button>
        </CardContent>
      </Card>
    </>
  )
}