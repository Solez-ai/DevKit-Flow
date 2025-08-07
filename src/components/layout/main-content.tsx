import { useWorkspace } from "@/hooks/use-app-store"
import { StudioWorkspace } from "@/components/workspaces/studio-workspace"
import { EnhancedRegexrWorkspace } from "@/components/workspaces/enhanced-regexr-workspace"
import { SettingsWorkspace } from "@/components/workspaces/SettingsWorkspace"

export function MainContent() {
  const { currentWorkspace } = useWorkspace()

  const getWorkspaceLabel = () => {
    switch (currentWorkspace) {
      case 'studio': return 'DevFlow Studio workspace'
      case 'regexr': return 'Regexr++ workspace'
      case 'settings': return 'Settings workspace'
      default: return 'Main workspace'
    }
  }

  return (
    <main 
      className="flex-1 flex flex-col overflow-hidden bg-background"
      role="main"
      aria-label={getWorkspaceLabel()}
      id="main-content"
      tabIndex={-1}
    >
      {currentWorkspace === 'studio' && <StudioWorkspace />}
      {currentWorkspace === 'regexr' && <EnhancedRegexrWorkspace />}
      {currentWorkspace === 'settings' && <SettingsWorkspace />}
    </main>
  )
}