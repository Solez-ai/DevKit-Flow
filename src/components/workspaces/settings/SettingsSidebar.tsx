import React from 'react'
import { 
  Settings, 
  Bot, 
  Palette, 
  Zap, 
  Database, 
  Cog,
  ChevronRight
} from 'lucide-react'
import { useSettingsStore } from '../../../store/settings-store'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'

const categoryIcons = {
  general: Settings,
  ai: Bot,
  appearance: Palette,
  behavior: Zap,
  data: Database,
  advanced: Cog
}

export const SettingsSidebar: React.FC = () => {
  const { panel, setActiveCategory, settings } = useSettingsStore()

  const getSettingsCount = (categoryId: string) => {
    const category = panel.categories.find(c => c.id === categoryId)
    return category?.settings.length || 0
  }

  const hasAIFeatures = settings.aiEnabled || settings.enhancedFeatures

  return (
    <div className="w-64 border-r bg-muted/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Configuration
        </h2>
      </div>
      
      {/* Categories */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {panel.categories.map((category) => {
            const Icon = categoryIcons[category.id as keyof typeof categoryIcons]
            const isActive = panel.activeCategory === category.id
            const settingsCount = getSettingsCount(category.id)
            
            return (
              <Button
                key={category.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto p-3',
                  isActive && 'bg-secondary'
                )}
                onClick={() => setActiveCategory(category.id as any)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium text-sm">
                        {category.name}
                        {category.id === 'ai' && hasAIFeatures && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {category.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {settingsCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {settingsCount}
                      </Badge>
                    )}
                    <ChevronRight className={cn(
                      'h-3 w-3 transition-transform',
                      isActive && 'rotate-90'
                    )} />
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div>DevKit Flow v1.0.0</div>
          <div className="mt-1">
            {panel.hasUnsavedChanges ? (
              <span className="text-amber-600">Unsaved changes</span>
            ) : (
              <span className="text-green-600">All changes saved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}