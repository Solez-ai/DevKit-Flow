import React, { useEffect } from 'react'
import { Search, Save, RotateCcw, Download, Upload } from 'lucide-react'
import { useSettingsStore } from '../../store/settings-store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { SettingsCategory } from './settings/SettingsCategory'
import { SettingsSidebar } from './settings/SettingsSidebar'
import { AIModelSettings } from './settings/AIModelSettings'
import { ThemeSettings } from './settings/ThemeSettings'
import { KeyboardShortcuts } from './settings/KeyboardShortcuts'
import { DataManagement } from './settings/DataManagement'
import { useToast } from '../../hooks/use-toast'

export const SettingsWorkspace: React.FC = () => {
  const {
    panel,
    settings,
    setSearchQuery,
    markUnsavedChanges,
    exportSettings,
    importSettings,
    resetSettings,
    updateDataInfo
  } = useSettingsStore()
  
  const { toast } = useToast()

  useEffect(() => {
    updateDataInfo()
  }, [updateDataInfo])

  const handleExportSettings = () => {
    try {
      const data = exportSettings()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devkit-flow-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Settings Exported',
        description: 'Your settings have been exported successfully.'
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export settings. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string
            const success = importSettings(data)
            if (success) {
              toast({
                title: 'Settings Imported',
                description: 'Your settings have been imported successfully.'
              })
            } else {
              throw new Error('Invalid settings file')
            }
          } catch (error) {
            toast({
              title: 'Import Failed',
              description: 'Failed to import settings. Please check the file format.',
              variant: 'destructive'
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings()
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to their default values.'
      })
    }
  }

  const renderActiveCategory = () => {
    switch (panel.activeCategory) {
      case 'ai':
        return <AIModelSettings />
      case 'appearance':
        return <ThemeSettings />
      case 'behavior':
        return <KeyboardShortcuts />
      case 'data':
        return <DataManagement />
      case 'advanced':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced configuration options for power users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced settings will be available in a future update.
              </div>
            </CardContent>
          </Card>
        )
      default:
        return <SettingsCategory category={panel.activeCategory} />
    }
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <SettingsSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Settings</h1>
              {panel.hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search settings..."
                  value={panel.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-8"
                />
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportSettings}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSettings}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSettings}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              {panel.hasUnsavedChanges && (
                <Button
                  size="sm"
                  onClick={() => markUnsavedChanges(false)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {renderActiveCategory()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsWorkspace