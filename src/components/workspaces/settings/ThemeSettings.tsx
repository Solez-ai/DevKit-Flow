import React from 'react'
import { Palette, Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'

export const ThemeSettings: React.FC = () => {
  const { settings, updateSetting } = useSettingsStore()

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Selection
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {themes.map((theme) => {
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

      <Card>
        <CardHeader>
          <CardTitle>Custom Themes</CardTitle>
          <CardDescription>
            Create and manage custom color themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Custom theme creation will be available in a future update.</p>
            <Button variant="outline" className="mt-4" disabled>
              Create Custom Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}