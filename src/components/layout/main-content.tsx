import { useWorkspace } from "@/hooks/use-app-store"
import { StudioWorkspace } from "@/components/workspaces/studio-workspace"
import { EnhancedRegexrWorkspace } from "@/components/workspaces/enhanced-regexr-workspace"
import { SettingsWorkspace } from "@/components/workspaces/settings-workspace"

export function MainContent() {
  const { currentWorkspace } = useWorkspace()

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      {currentWorkspace === 'studio' && <StudioWorkspace />}
      {currentWorkspace === 'regexr' && <EnhancedRegexrWorkspace />}
      {currentWorkspace === 'settings' && <SettingsWorkspace />}
    </main>
  )
}