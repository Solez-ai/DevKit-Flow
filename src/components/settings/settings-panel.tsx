import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Bot, 
  Palette, 
  Zap, 
  Database, 
  Cog, 
  Search,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    panel,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    setActiveCategory,
    setSearchQuery,
    markUnsavedChanges
  } = useSettingsStore()

  const [searchValue, setSearchValue] = useState(panel.searchQuery || '')
  const [importData, setImportData] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    setSearchQuery(value)
  }

  const handleExport = () => {
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
  }

  const handleImport = () => {
    try {
      const success = importSettings(importData)
      if (success) {
        setShowImportDialog(false)
        setImportData('')
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      // Show error message
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings()
    }
  }

  const filteredCategories = panel.categories.filter(category => {
    if (!searchValue) return true
    
    const searchLower = searchValue.toLowerCase()
    return (
      category.name.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower) ||
      category.settings.some(setting => 
        setting.label.toLowerCase().includes(searchLower) ||
        setting.description.toLowerCase().includes(searchLower)
      )
    )
  })

  const renderSettingControl = (setting: any) => {
    const value = settings[setting.key as keyof typeof settings]

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={value as boolean}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={(newValue) => updateSetting(setting.key, newValue)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className="w-32"
          />
        )
      
      case 'string':
        return (
          <Input
            type="text"
            value={value as string}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-64"
          />
        )
      
      default:
        return <span className="text-muted-foreground">Unsupported setting type</span>
    }
  }

  const getCategoryIcon = (iconName: string) => {
    const icons = {
      Settings,
      Bot,
      Palette,
      Zap,
      Database,
      Cog
    }
    const Icon = icons[iconName as keyof typeof icons] || Settings
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Customize DevKit Flow to match your preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Unsaved changes indicator */}
        {panel.hasUnsavedChanges && (
          <Alert className="mt-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You have unsaved changes. Settings are automatically saved.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20">
          <div className="p-4">
            <nav className="space-y-1">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    panel.activeCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {getCategoryIcon(category.icon)}
                  <div className="flex-1">
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs opacity-70">{category.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredCategories.map((category) => (
            panel.activeCategory === category.id && (
              <div key={category.id} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                  {category.description && (
                    <p className="text-muted-foreground mb-6">{category.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {category.settings.map((setting) => (
                    <Card key={setting.key}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Label className="text-base font-medium">
                                {setting.label}
                              </Label>
                              {setting.requiresRestart && (
                                <Badge variant="secondary" className="text-xs">
                                  Requires restart
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {setting.description}
                            </p>
                          </div>
                          <div className="ml-4">
                            {renderSettingControl(setting)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Category-specific content */}
                {category.id === 'ai' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Info className="w-5 h-5" />
                        <span>AI Features Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <p>
                          AI features are optional and require an API key. All core functionality 
                          works without AI assistance.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <h4 className="font-medium mb-2">What AI features provide:</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Intelligent code generation and suggestions</li>
                            <li>• Regex pattern creation and optimization</li>
                            <li>• Architecture planning assistance</li>
                            <li>• Debugging help and error analysis</li>
                          </ul>
                        </div>
                        <p className="text-muted-foreground">
                          Your API key is stored locally and never shared. You can disable 
                          AI features at any time.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {category.id === 'data' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="w-5 h-5" />
                        <span>Data Storage Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <p>
                          All your data is stored locally in your browser. Nothing is sent to 
                          external servers unless you explicitly use AI features.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="font-medium mb-2">Stored Locally:</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Your sessions and projects</li>
                              <li>• Regex patterns and templates</li>
                              <li>• Settings and preferences</li>
                              <li>• Usage analytics (if enabled)</li>
                            </ul>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="font-medium mb-2">Privacy Features:</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• No tracking or telemetry</li>
                              <li>• Offline-first design</li>
                              <li>• Data export/import</li>
                              <li>• Selective data clearing</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Paste your exported settings JSON data below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-32 p-3 border rounded-md resize-none"
                placeholder="Paste settings JSON here..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportDialog(false)
                    setImportData('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importData.trim()}>
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}