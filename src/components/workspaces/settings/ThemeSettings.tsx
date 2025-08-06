import React, { useState } from 'react'
import { Palette, Sun, Moon, Monitor, Plus, Download, Upload, Eye, Sparkles, Save, X } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Input } from '../../ui/input'
import { Separator } from '../../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { useToast } from '../../../hooks/use-toast'

export const ThemeSettings: React.FC = () => {
  const { settings, updateSetting, themes, addCustomTheme, removeCustomTheme, applyTheme } = useSettingsStore()
  const { toast } = useToast()
  const [showCustomThemeDialog, setShowCustomThemeDialog] = useState(false)
  const [customTheme, setCustomTheme] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      border: '#e2e8f0',
      input: '#ffffff',
      ring: '#3b82f6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      success: '#10b981',
      successForeground: '#ffffff'
    }
  })

  const builtInThemes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200',
      isBuiltIn: true
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700',
      isBuiltIn: true
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400',
      isBuiltIn: true
    }
  ]

  const aiSuggestedThemes = [
    {
      id: 'ai-ocean',
      name: 'Ocean Breeze',
      description: 'AI-suggested calming blue theme',
      icon: Sparkles,
      preview: 'bg-gradient-to-r from-blue-50 to-cyan-100 border-blue-200',
      colors: {
        primary: '#0ea5e9',
        secondary: '#0891b2',
        accent: '#06b6d4',
        background: '#f0f9ff',
        foreground: '#0c4a6e'
      },
      isAISuggested: true
    },
    {
      id: 'ai-forest',
      name: 'Forest Code',
      description: 'AI-suggested nature-inspired theme',
      icon: Sparkles,
      preview: 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200',
      colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        background: '#f0fdf4',
        foreground: '#064e3b'
      },
      isAISuggested: true
    },
    {
      id: 'ai-sunset',
      name: 'Sunset Glow',
      description: 'AI-suggested warm evening theme',
      icon: Sparkles,
      preview: 'bg-gradient-to-r from-orange-50 to-red-100 border-orange-200',
      colors: {
        primary: '#ea580c',
        secondary: '#dc2626',
        accent: '#f97316',
        background: '#fff7ed',
        foreground: '#9a3412'
      },
      isAISuggested: true
    }
  ]

  const allThemes = [...builtInThemes, ...aiSuggestedThemes, ...themes]

  const handleCreateCustomTheme = () => {
    if (!customTheme.name.trim()) {
      toast({
        title: 'Theme Name Required',
        description: 'Please enter a name for your custom theme.',
        variant: 'destructive'
      })
      return
    }

    const newTheme = {
      id: `custom-${Date.now()}`,
      name: customTheme.name,
      description: customTheme.description || 'Custom theme',
      colors: customTheme.colors,
      fonts: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem'
      },
      isCustom: true,
      author: 'You',
      createdAt: new Date()
    }

    addCustomTheme(newTheme)
    setShowCustomThemeDialog(false)
    setCustomTheme({
      name: '',
      description: '',
      colors: customTheme.colors
    })

    toast({
      title: 'Theme Created',
      description: `"${newTheme.name}" has been added to your themes.`
    })
  }

  const handleExportTheme = (theme: any) => {
    const exportData = {
      ...theme,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Theme Exported',
      description: `"${theme.name}" has been exported successfully.`
    })
  }

  const handleImportTheme = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const themeData = JSON.parse(e.target?.result as string)
            if (themeData.colors && themeData.name) {
              const importedTheme = {
                ...themeData,
                id: `imported-${Date.now()}`,
                isCustom: true,
                importedAt: new Date()
              }
              addCustomTheme(importedTheme)
              toast({
                title: 'Theme Imported',
                description: `"${importedTheme.name}" has been imported successfully.`
              })
            } else {
              throw new Error('Invalid theme format')
            }
          } catch (error) {
            toast({
              title: 'Import Failed',
              description: 'Invalid theme file format. Please check the file.',
              variant: 'destructive'
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handlePreviewTheme = (theme: any) => {
    if (theme.colors) {
      // Apply theme temporarily for preview
      const root = document.documentElement
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value as string)
      })
      
      toast({
        title: 'Theme Preview',
        description: `Previewing "${theme.name}". Changes are temporary.`
      })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes" className="space-y-6">
          {/* Built-in Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Built-in Themes
              </CardTitle>
              <CardDescription>
                Choose from our carefully crafted themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {builtInThemes.map((theme) => {
                  const Icon = theme.icon
                  const isSelected = settings.theme === theme.id
                  
                  return (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateSetting('theme', theme.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded border-2 ${theme.preview}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{theme.name}</span>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI-Suggested Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI-Suggested Themes
              </CardTitle>
              <CardDescription>
                Themes recommended by AI based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {aiSuggestedThemes.map((theme) => {
                  const Icon = theme.icon
                  const isSelected = settings.theme === theme.id
                  
                  return (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateSetting('theme', theme.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded border-2 ${theme.preview}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">{theme.name}</span>
                              <Badge variant="outline" className="text-xs">
                                AI Suggested
                              </Badge>
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewTheme(theme)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isSelected && (
                            <div className="h-4 w-4 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Custom Theme Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Custom Themes
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleImportTheme}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Dialog open={showCustomThemeDialog} onOpenChange={setShowCustomThemeDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Theme
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Custom Theme</DialogTitle>
                        <DialogDescription>
                          Design your own color theme with live preview
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Theme Name</Label>
                            <Input
                              value={customTheme.name}
                              onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="My Custom Theme"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              value={customTheme.description}
                              onChange={(e) => setCustomTheme(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="A beautiful custom theme"
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(customTheme.colors).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={value}
                                  onChange={(e) => setCustomTheme(prev => ({
                                    ...prev,
                                    colors: { ...prev.colors, [key]: e.target.value }
                                  }))}
                                  className="w-16 h-10 p-1"
                                />
                                <Input
                                  value={value}
                                  onChange={(e) => setCustomTheme(prev => ({
                                    ...prev,
                                    colors: { ...prev.colors, [key]: e.target.value }
                                  }))}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCustomThemeDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateCustomTheme}>
                            <Save className="h-4 w-4 mr-2" />
                            Create Theme
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <CardDescription>
                Create and manage your custom color themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {themes.length > 0 ? (
                <div className="grid gap-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded border-2"
                            style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{theme.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Custom
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {theme.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewTheme(theme)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportTheme(theme)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomTheme(theme.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom themes yet. Create your first theme!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Theme Marketplace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Theme Marketplace
              </CardTitle>
              <CardDescription>
                Discover and share themes with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Theme marketplace will be available in a future update.</p>
                <p className="text-sm mt-2">Share your themes and discover community creations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}