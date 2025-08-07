import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace, useSessions, useUIState, usePatterns } from "@/hooks/use-app-store"
import { useMobile } from "@/hooks/use-mobile"
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
  Brackets
} from "lucide-react"

export function Sidebar() {
  const { currentWorkspace } = useWorkspace()
  const { sidebarCollapsed } = useUIState()
  const { isMobile, isTablet } = useMobile()
  // const { sessions, currentSessionId } = useSessions()
  // const { patterns, currentPatternId } = usePatterns()

  if (sidebarCollapsed && !isMobile) {
    return null
  }

  // On mobile, sidebar is hidden by default and shown as overlay when needed
  if (isMobile && sidebarCollapsed) {
    return null
  }

  const sidebarWidth = isMobile ? "w-full" : isTablet ? "w-48" : "w-80"

  return (
    <aside 
      className={cn(
        "border-r bg-muted/50 flex flex-col",
        sidebarWidth,
        // Mobile overlay
        isMobile && "absolute top-0 left-0 h-full z-40 shadow-lg"
      )}
      role="navigation"
      aria-label="Sidebar navigation"
      id="sidebar-navigation"
    >
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

      {/* Templates */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            • New Feature Template
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            • Bug Fix Template
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            • API Integration Template
          </Button>
        </CardContent>
      </Card>

      {/* Session Info */}
      {currentSession && (
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(currentSession.metadata.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Nodes:</span>
              <span>{currentSession.nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span>{currentSession.nodes.filter(n => n.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Modified:</span>
              <span>{new Date(currentSession.metadata.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card className="m-4 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Recent Sessions
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {sessions.slice(0, 5).map((session) => (
            <Button
              key={session.id}
              variant={session.id === currentSessionId ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs"
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  session.nodes.every(n => n.status === 'completed') ? "bg-green-500" :
                  session.nodes.some(n => n.status === 'active') ? "bg-blue-500" :
                  session.nodes.some(n => n.status === 'blocked') ? "bg-red-500" :
                  "bg-gray-500"
                )} />
                <span className="truncate">{session.name}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
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
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Character Classes</h4>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Hash className="h-3 w-3 mr-2" />
                Word Characters
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Hash className="h-3 w-3 mr-2" />
                Digits
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Hash className="h-3 w-3 mr-2" />
                Whitespace
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Anchors</h4>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Anchor className="h-3 w-3 mr-2" />
                Start of String
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Anchor className="h-3 w-3 mr-2" />
                End of String
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Quantifiers</h4>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Repeat className="h-3 w-3 mr-2" />
                Optional (?)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Repeat className="h-3 w-3 mr-2" />
                One or More (+)
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Repeat className="h-3 w-3 mr-2" />
                Zero or More (*)
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Groups</h4>
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Brackets className="h-3 w-3 mr-2" />
                Capturing Group
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                <Brackets className="h-3 w-3 mr-2" />
                Character Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Library */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pattern Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            📧 Email Validation
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            📱 Phone Numbers
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            🔗 URLs & Links
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            📅 Dates & Times
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            🔒 Password Validation
          </Button>
        </CardContent>
      </Card>

      {/* Recent Patterns */}
      <Card className="m-4 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Recent Patterns
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Regex className="h-3 w-3 mr-2" />
            Email Pattern
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Regex className="h-3 w-3 mr-2" />
            URL Validator
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function SettingsSidebar() {
  return (
    <Card className="m-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Settings Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Appearance
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Behavior
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Keyboard Shortcuts
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          Data Management
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          About
        </Button>
      </CardContent>
    </Card>
  )
}