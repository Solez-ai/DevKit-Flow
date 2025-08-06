import React from 'react'
import { Keyboard, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'

export const KeyboardShortcuts: React.FC = () => {
  const shortcuts = [
    { name: 'New Session', keys: ['Ctrl', 'N'], category: 'General' },
    { name: 'Save Session', keys: ['Ctrl', 'S'], category: 'General' },
    { name: 'Open Settings', keys: ['Ctrl', ','], category: 'General' },
    { name: 'Toggle Sidebar', keys: ['Ctrl', 'B'], category: 'Interface' },
    { name: 'Zoom In', keys: ['Ctrl', '+'], category: 'Canvas' },
    { name: 'Zoom Out', keys: ['Ctrl', '-'], category: 'Canvas' },
    { name: 'Fit to Screen', keys: ['Ctrl', '0'], category: 'Canvas' },
    { name: 'Add Node', keys: ['A'], category: 'Studio' },
    { name: 'Delete Selected', keys: ['Delete'], category: 'Studio' },
    { name: 'Test Pattern', keys: ['Ctrl', 'T'], category: 'Regexr' },
  ]

  const categories = [...new Set(shortcuts.map(s => s.category))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <CardDescription>
            Customize keyboard shortcuts for faster workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Click on any shortcut to customize it
            </div>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="font-medium mb-3">{category}</h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="font-medium">
                          {shortcut.name}
                        </div>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <Badge variant="outline" className="text-xs font-mono">
                                {key}
                              </Badge>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-muted-foreground">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shortcut Presets</CardTitle>
          <CardDescription>
            Choose from predefined shortcut configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Keyboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Shortcut presets will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}