import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAccessibility } from '@/hooks/use-accessibility'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { 
  Eye, 
  MousePointer, 
  Type, 
  Volume2, 
  Keyboard,
  Monitor,
  Zap,
  Info
} from 'lucide-react'

export function AccessibilitySettings() {
  const {
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    toggleScreenReaderOptimization
  } = useAccessibility()

  const { shortcuts } = useKeyboardNavigation()

  const accessibilityFeatures = [
    {
      id: 'highContrast',
      title: 'High Contrast Mode',
      description: 'Increases contrast for better visibility',
      icon: Eye,
      enabled: settings.highContrast,
      toggle: toggleHighContrast
    },
    {
      id: 'reducedMotion',
      title: 'Reduced Motion',
      description: 'Minimizes animations and transitions',
      icon: Zap,
      enabled: settings.reducedMotion,
      toggle: toggleReducedMotion
    },
    {
      id: 'largeText',
      title: 'Large Text',
      description: 'Increases text size for better readability',
      icon: Type,
      enabled: settings.largeText,
      toggle: toggleLargeText
    },
    {
      id: 'screenReaderOptimized',
      title: 'Screen Reader Optimization',
      description: 'Optimizes interface for screen readers',
      icon: Volume2,
      enabled: settings.screenReaderOptimized,
      toggle: toggleScreenReaderOptimization
    }
  ]

  const keyboardShortcutCategories = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, typeof shortcuts>)

  const formatShortcut = (shortcut: typeof shortcuts[0]) => {
    const keys = []
    if (shortcut.ctrlKey) keys.push('Ctrl')
    if (shortcut.altKey) keys.push('Alt')
    if (shortcut.shiftKey) keys.push('Shift')
    if (shortcut.metaKey) keys.push('Cmd')
    keys.push(shortcut.key)
    return keys.join(' + ')
  }

  return (
    <div className="space-y-6">
      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Accessibility Features
          </CardTitle>
          <CardDescription>
            Customize the interface to meet your accessibility needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accessibilityFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor={feature.id} className="text-sm font-medium">
                      {feature.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={feature.id}
                  checked={feature.enabled}
                  onCheckedChange={feature.toggle}
                  aria-describedby={`${feature.id}-description`}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>
            Available keyboard shortcuts for navigation and accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(keyboardShortcutCategories).map(([category, shortcuts]) => (
            <div key={category}>
              <h4 className="text-sm font-medium capitalize mb-2 text-muted-foreground">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{shortcut.description}</span>
                    <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {formatShortcut(shortcut)}
                    </code>
                  </div>
                ))}
              </div>
              {category !== Object.keys(keyboardShortcutCategories).slice(-1)[0] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Accessibility Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Accessibility Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              DevKit Flow is designed to be accessible to all users. We follow WCAG 2.1 
              guidelines and continuously improve our accessibility features.
            </p>
            <p>
              If you encounter any accessibility issues or have suggestions for improvement, 
              please let us know through our feedback system.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Report Accessibility Issue
            </Button>
            <Button variant="outline" size="sm">
              View Full Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}