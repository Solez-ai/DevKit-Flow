import React from 'react'
import { useSettingsStore } from '../../../store/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Input } from '../../ui/input'
import { Slider } from '../../ui/slider'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'

interface SettingsCategoryProps {
  category: string
}

export const SettingsCategory: React.FC<SettingsCategoryProps> = ({ category }) => {
  const { panel, settings, updateSetting } = useSettingsStore()
  
  const categoryData = panel.categories.find(c => c.id === category)
  
  if (!categoryData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Category not found
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSettingControl = (setting: any) => {
    const value = settings[setting.key as keyof typeof settings]
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={setting.key}>{setting.label}</Label>
              <div className="text-sm text-muted-foreground">
                {setting.description}
              </div>
            </div>
            <Switch
              id={setting.key}
              checked={value as boolean}
              onCheckedChange={(checked) => updateSetting(setting.key, checked)}
            />
          </div>
        )
        
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Select
              value={value as string}
              onValueChange={(newValue) => updateSetting(setting.key, newValue)}
            >
              <SelectTrigger>
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
            <div className="text-sm text-muted-foreground">
              {setting.description}
            </div>
          </div>
        )
        
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="flex items-center gap-4">
              <Input
                id={setting.key}
                type="number"
                value={value as number}
                onChange={(e) => updateSetting(setting.key, parseInt(e.target.value))}
                min={setting.validation?.min}
                max={setting.validation?.max}
                className="w-24"
              />
              {setting.validation && (
                <div className="text-sm text-muted-foreground">
                  {setting.validation.min} - {setting.validation.max}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {setting.description}
            </div>
          </div>
        )
        
      case 'string':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Input
              id={setting.key}
              value={value as string}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              placeholder={setting.placeholder}
            />
            <div className="text-sm text-muted-foreground">
              {setting.description}
            </div>
          </div>
        )
        
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unsupported setting type: {setting.type}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {categoryData.name}
            <Badge variant="outline" className="text-xs">
              {categoryData.settings.length} settings
            </Badge>
          </CardTitle>
          <CardDescription>
            {categoryData.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categoryData.settings.map((setting, index) => (
            <div key={setting.key}>
              {renderSettingControl(setting)}
              {setting.requiresRestart && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Requires restart
                  </Badge>
                </div>
              )}
              {index < categoryData.settings.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
          
          {categoryData.settings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No settings available in this category
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Category-specific additional content */}
      {category === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Preferences</CardTitle>
            <CardDescription>
              Customize your workspace layout and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Canvas Zoom Level</Label>
              <div className="px-3">
                <Slider
                  value={[settings.canvasZoomLevel]}
                  onValueChange={([value]) => updateSetting('canvasZoomLevel', value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>50%</span>
                <span>{Math.round(settings.canvasZoomLevel * 100)}%</span>
                <span>200%</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Sidebar Width</Label>
              <div className="px-3">
                <Slider
                  value={[settings.sidebarWidth]}
                  onValueChange={([value]) => updateSetting('sidebarWidth', value)}
                  min={240}
                  max={480}
                  step={20}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>240px</span>
                <span>{settings.sidebarWidth}px</span>
                <span>480px</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}