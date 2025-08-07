import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Search, 
  Archive, 
  HelpCircle,
  Save,
  Database,
  AlertTriangle
} from 'lucide-react'
import { SettingsPanel } from './settings-panel'
import { SettingsSearch } from './settings-search'
import { SettingsBackup } from './settings-backup'
import { DataManagement } from './data-management'
import { useSettingsStore } from '@/store/settings-store'

export const SettingsWorkspace: React.FC = () => {
  const { panel, markUnsavedChanges } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('settings')
  const [highlightedSetting, setHighlightedSetting] = useState<string | null>(null)

  const handleSearchResultSelect = (categoryId: string, settingKey: string) => {
    setActiveTab('settings')
    setHighlightedSetting(settingKey)
    
    // Clear highlight after a delay
    setTimeout(() => {
      setHighlightedSetting(null)
    }, 3000)
  }

  const handleSaveSettings = () => {
    // Settings are automatically saved, but we can trigger any additional save logic here
    markUnsavedChanges(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-muted/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize DevKit Flow to match your workflow
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {panel.hasUnsavedChanges && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Auto-saved</span>
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveSettings}
              disabled={!panel.hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-muted/10">
            <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="settings" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger 
                value="backup" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Archive className="w-4 h-4 mr-2" />
                Backup & Restore
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Database className="w-4 h-4 mr-2" />
                Data
              </TabsTrigger>
              <TabsTrigger 
                value="help" 
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="settings" className="h-full m-0 overflow-hidden">
              <SettingsPanel />
            </TabsContent>

            <TabsContent value="search" className="h-full m-0 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Search Settings</h2>
                  <p className="text-muted-foreground">
                    Find specific settings quickly using search and filters
                  </p>
                </div>
                <SettingsSearch onResultSelect={handleSearchResultSelect} />
              </div>
            </TabsContent>

            <TabsContent value="backup" className="h-full m-0 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Backup & Restore</h2>
                  <p className="text-muted-foreground">
                    Create backups of your settings and data, or restore from previous backups
                  </p>
                </div>
                <SettingsBackup />
              </div>
            </TabsContent>

            <TabsContent value="data" className="h-full m-0 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Data Management</h2>
                  <p className="text-muted-foreground">
                    Monitor storage usage and manage your local data
                  </p>
                </div>
                <DataManagement />
              </div>
            </TabsContent>

            <TabsContent value="help" className="h-full m-0 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Settings Help</h2>
                  <p className="text-muted-foreground">
                    Learn about DevKit Flow settings and how to customize your experience
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Settings Categories Help */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Settings Categories</h3>
                      
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">General</h4>
                          <p className="text-sm text-muted-foreground">
                            Basic application preferences like default workspace, auto-save, and export formats.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">AI Assistant</h4>
                          <p className="text-sm text-muted-foreground">
                            Configure AI features, model selection, and rate limiting. All AI features are optional.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Appearance</h4>
                          <p className="text-sm text-muted-foreground">
                            Customize the visual appearance including themes, fonts, and UI preferences.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Behavior</h4>
                          <p className="text-sm text-muted-foreground">
                            Control application behavior like grid snapping, developer tools, and interaction preferences.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Data & Privacy</h4>
                          <p className="text-sm text-muted-foreground">
                            Manage data retention, analytics, and privacy settings. All data is stored locally.
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Advanced</h4>
                          <p className="text-sm text-muted-foreground">
                            Advanced configuration options for power users and debugging.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Common Tasks</h3>
                      
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Changing Theme</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Go to Appearance → Theme and select Light, Dark, or System.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('search')
                              // Trigger search for theme
                              setTimeout(() => {
                                const searchInput = document.querySelector('input[placeholder="Search settings..."]') as HTMLInputElement
                                if (searchInput) {
                                  searchInput.value = 'theme'
                                  searchInput.dispatchEvent(new Event('input', { bubbles: true }))
                                }
                              }, 100)
                            }}
                          >
                            Find Theme Settings
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Enabling AI Features</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Go to AI Assistant → Enable AI Features and configure your API key.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('search')
                              setTimeout(() => {
                                const searchInput = document.querySelector('input[placeholder="Search settings..."]') as HTMLInputElement
                                if (searchInput) {
                                  searchInput.value = 'ai'
                                  searchInput.dispatchEvent(new Event('input', { bubbles: true }))
                                }
                              }, 100)
                            }}
                          >
                            Find AI Settings
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Managing Data</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Use the Backup & Restore tab to export your data or reset settings.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('backup')}
                          >
                            Go to Backup
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Press Ctrl+? (or Cmd+? on Mac) to view all keyboard shortcuts.
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl</kbd> + 
                            <kbd className="px-1.5 py-0.5 bg-muted rounded ml-1">?</kbd>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy Information */}
                  <div className="border rounded-lg p-6 bg-muted/20">
                    <h3 className="text-lg font-medium mb-4">Privacy & Data</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Local Storage</h4>
                        <p className="text-sm text-muted-foreground">
                          All your data is stored locally in your browser. Nothing is sent to external servers 
                          unless you explicitly use AI features with your own API key.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">AI Features</h4>
                        <p className="text-sm text-muted-foreground">
                          AI features are completely optional. When enabled, only the specific content you're 
                          working with is sent to the AI service. Your API key is stored locally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}