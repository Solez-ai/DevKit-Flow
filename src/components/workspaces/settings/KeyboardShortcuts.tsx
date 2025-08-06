import React, { useState } from 'react'
import { Keyboard, RotateCcw, AlertTriangle, Sparkles, Download, Upload, Edit, Save, X, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Alert, AlertDescription } from '../../ui/alert'
import { Separator } from '../../ui/separator'
import { useSettingsStore } from '../../../store/settings-store'
import { useToast } from '../../../hooks/use-toast'

export const KeyboardShortcuts: React.FC = () => {
  const { shortcuts, updateShortcut, resetShortcuts } = useSettingsStore()
  const { toast } = useToast()
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null)
  const [newKeys, setNewKeys] = useState<string[]>([])
  const [recordingKeys, setRecordingKeys] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)

  const defaultShortcuts = [
    { 
      id: 'new-session', 
      name: 'New Session', 
      defaultKeys: ['Ctrl', 'N'], 
      currentKeys: ['Ctrl', 'N'],
      category: 'General',
      description: 'Create a new development session',
      context: 'global',
      action: 'newSession',
      isCustom: false
    },
    { 
      id: 'save-session', 
      name: 'Save Session', 
      defaultKeys: ['Ctrl', 'S'], 
      currentKeys: ['Ctrl', 'S'],
      category: 'General',
      description: 'Save the current session',
      context: 'global',
      action: 'saveSession',
      isCustom: false
    },
    { 
      id: 'open-settings', 
      name: 'Open Settings', 
      defaultKeys: ['Ctrl', ','], 
      currentKeys: ['Ctrl', ','],
      category: 'General',
      description: 'Open application settings',
      context: 'global',
      action: 'openSettings',
      isCustom: false
    },
    { 
      id: 'toggle-sidebar', 
      name: 'Toggle Sidebar', 
      defaultKeys: ['Ctrl', 'B'], 
      currentKeys: ['Ctrl', 'B'],
      category: 'Interface',
      description: 'Show or hide the sidebar',
      context: 'global',
      action: 'toggleSidebar',
      isCustom: false
    },
    { 
      id: 'zoom-in', 
      name: 'Zoom In', 
      defaultKeys: ['Ctrl', '+'], 
      currentKeys: ['Ctrl', '+'],
      category: 'Canvas',
      description: 'Zoom into the canvas',
      context: 'studio',
      action: 'zoomIn',
      isCustom: false
    },
    { 
      id: 'zoom-out', 
      name: 'Zoom Out', 
      defaultKeys: ['Ctrl', '-'], 
      currentKeys: ['Ctrl', '-'],
      category: 'Canvas',
      description: 'Zoom out of the canvas',
      context: 'studio',
      action: 'zoomOut',
      isCustom: false
    },
    { 
      id: 'fit-screen', 
      name: 'Fit to Screen', 
      defaultKeys: ['Ctrl', '0'], 
      currentKeys: ['Ctrl', '0'],
      category: 'Canvas',
      description: 'Fit all nodes to screen',
      context: 'studio',
      action: 'fitToScreen',
      isCustom: false
    },
    { 
      id: 'add-node', 
      name: 'Add Node', 
      defaultKeys: ['A'], 
      currentKeys: ['A'],
      category: 'Studio',
      description: 'Add a new node to the canvas',
      context: 'studio',
      action: 'addNode',
      isCustom: false
    },
    { 
      id: 'delete-selected', 
      name: 'Delete Selected', 
      defaultKeys: ['Delete'], 
      currentKeys: ['Delete'],
      category: 'Studio',
      description: 'Delete selected nodes',
      context: 'studio',
      action: 'deleteSelected',
      isCustom: false
    },
    { 
      id: 'test-pattern', 
      name: 'Test Pattern', 
      defaultKeys: ['Ctrl', 'T'], 
      currentKeys: ['Ctrl', 'T'],
      category: 'Regexr',
      description: 'Test the current regex pattern',
      context: 'regexr',
      action: 'testPattern',
      isCustom: false
    }
  ]

  const aiSuggestedWorkflows = [
    {
      name: 'Developer Workflow',
      description: 'Optimized for rapid development cycles',
      shortcuts: {
        'quick-save': ['Ctrl', 'Shift', 'S'],
        'quick-test': ['F5'],
        'debug-mode': ['F12'],
        'ai-assist': ['Ctrl', 'Shift', 'A']
      }
    },
    {
      name: 'Designer Workflow',
      description: 'Focused on visual design and layout',
      shortcuts: {
        'grid-toggle': ['G'],
        'align-nodes': ['Ctrl', 'Shift', 'L'],
        'color-picker': ['C'],
        'preview-mode': ['P']
      }
    },
    {
      name: 'Power User Workflow',
      description: 'Advanced shortcuts for experienced users',
      shortcuts: {
        'multi-select': ['Ctrl', 'Shift', 'Click'],
        'bulk-edit': ['Ctrl', 'E'],
        'macro-record': ['Ctrl', 'Shift', 'R'],
        'command-palette': ['Ctrl', 'Shift', 'P']
      }
    }
  ]

  const shortcutPresets = [
    {
      id: 'vscode',
      name: 'VS Code Style',
      description: 'Familiar shortcuts for VS Code users',
      shortcuts: {
        'new-session': ['Ctrl', 'N'],
        'save-session': ['Ctrl', 'S'],
        'open-settings': ['Ctrl', ','],
        'toggle-sidebar': ['Ctrl', 'B'],
        'command-palette': ['Ctrl', 'Shift', 'P']
      }
    },
    {
      id: 'jetbrains',
      name: 'JetBrains Style',
      description: 'IntelliJ IDEA and WebStorm shortcuts',
      shortcuts: {
        'new-session': ['Ctrl', 'Alt', 'N'],
        'save-session': ['Ctrl', 'S'],
        'open-settings': ['Ctrl', 'Alt', 'S'],
        'toggle-sidebar': ['Alt', '1'],
        'search-everywhere': ['Shift', 'Shift']
      }
    },
    {
      id: 'vim',
      name: 'Vim Style',
      description: 'Modal editing inspired shortcuts',
      shortcuts: {
        'new-session': [':', 'n', 'e', 'w'],
        'save-session': [':', 'w'],
        'quit': [':', 'q'],
        'visual-mode': ['v'],
        'insert-mode': ['i']
      }
    }
  ]

  const allShortcuts = shortcuts.length > 0 ? shortcuts : defaultShortcuts
  const categories = [...new Set(allShortcuts.map(s => s.category))]

  const detectConflicts = (shortcutId: string, keys: string[]) => {
    const conflicts = allShortcuts.filter(s => 
      s.id !== shortcutId && 
      JSON.stringify(s.currentKeys) === JSON.stringify(keys)
    )
    return conflicts
  }

  const handleShortcutEdit = (shortcutId: string) => {
    const shortcut = allShortcuts.find(s => s.id === shortcutId)
    if (shortcut) {
      setEditingShortcut(shortcutId)
      setNewKeys([...shortcut.currentKeys])
    }
  }

  const handleShortcutSave = (shortcutId: string) => {
    const conflicts = detectConflicts(shortcutId, newKeys)
    
    if (conflicts.length > 0) {
      toast({
        title: 'Shortcut Conflict',
        description: `This shortcut conflicts with "${conflicts[0].name}". Please choose different keys.`,
        variant: 'destructive'
      })
      return
    }

    updateShortcut(shortcutId, newKeys)
    setEditingShortcut(null)
    setNewKeys([])
    
    toast({
      title: 'Shortcut Updated',
      description: 'Keyboard shortcut has been updated successfully.'
    })
  }

  const handleKeyRecord = (e: React.KeyboardEvent) => {
    if (!recordingKeys) return
    
    e.preventDefault()
    const keys: string[] = []
    
    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    if (e.metaKey) keys.push('Cmd')
    
    if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
      keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key)
    }
    
    if (keys.length > 0) {
      setNewKeys(keys)
      setRecordingKeys(false)
    }
  }

  const applyPreset = (presetId: string) => {
    const preset = shortcutPresets.find(p => p.id === presetId)
    if (preset) {
      Object.entries(preset.shortcuts).forEach(([shortcutId, keys]) => {
        updateShortcut(shortcutId, keys)
      })
      
      toast({
        title: 'Preset Applied',
        description: `"${preset.name}" shortcuts have been applied.`
      })
    }
  }

  const exportShortcuts = () => {
    const exportData = {
      shortcuts: allShortcuts.filter(s => s.isCustom),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyboard-shortcuts.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Shortcuts Exported',
      description: 'Your custom shortcuts have been exported.'
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="shortcuts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="ai-workflows">AI Workflows</TabsTrigger>
          <TabsTrigger value="documentation">Help</TabsTrigger>
        </TabsList>

        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportShortcuts}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetShortcuts}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Customize keyboard shortcuts for faster workflow. Click on any shortcut to edit it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      {category}
                      <Badge variant="secondary" className="text-xs">
                        {allShortcuts.filter(s => s.category === category).length}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {allShortcuts
                        .filter(s => s.category === category)
                        .map((shortcut) => {
                          const conflicts = detectConflicts(shortcut.id, shortcut.currentKeys)
                          const isEditing = editingShortcut === shortcut.id
                          
                          return (
                            <div
                              key={shortcut.id}
                              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                isEditing ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{shortcut.name}</span>
                                  {shortcut.isCustom && (
                                    <Badge variant="outline" className="text-xs">
                                      Custom
                                    </Badge>
                                  )}
                                  {conflicts.length > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Conflict
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {shortcut.description}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="flex items-center gap-1 p-2 border rounded cursor-pointer"
                                      onClick={() => setRecordingKeys(true)}
                                      onKeyDown={handleKeyRecord}
                                      tabIndex={0}
                                    >
                                      {recordingKeys ? (
                                        <span className="text-muted-foreground text-sm">Press keys...</span>
                                      ) : (
                                        newKeys.map((key, keyIndex) => (
                                          <React.Fragment key={keyIndex}>
                                            <Badge variant="outline" className="text-xs font-mono">
                                              {key}
                                            </Badge>
                                            {keyIndex < newKeys.length - 1 && (
                                              <span className="text-muted-foreground">+</span>
                                            )}
                                          </React.Fragment>
                                        ))
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleShortcutSave(shortcut.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingShortcut(null)
                                        setNewKeys([])
                                        setRecordingKeys(false)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {shortcut.currentKeys.map((key, keyIndex) => (
                                        <React.Fragment key={keyIndex}>
                                          <Badge variant="outline" className="text-xs font-mono">
                                            {key}
                                          </Badge>
                                          {keyIndex < shortcut.currentKeys.length - 1 && (
                                            <span className="text-muted-foreground">+</span>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleShortcutEdit(shortcut.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shortcut Presets</CardTitle>
              <CardDescription>
                Choose from predefined shortcut configurations for different development styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {shortcutPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{preset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => applyPreset(preset.id)}
                      >
                        Apply Preset
                      </Button>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(preset.shortcuts).slice(0, 4).map(([action, keys]) => (
                        <div key={action} className="flex justify-between">
                          <span className="capitalize">{action.replace('-', ' ')}</span>
                          <div className="flex items-center gap-1">
                            {keys.map((key, index) => (
                              <React.Fragment key={index}>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {key}
                                </Badge>
                                {index < keys.length - 1 && (
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
        </TabsContent>

        <TabsContent value="ai-workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI-Suggested Workflows
              </CardTitle>
              <CardDescription>
                Intelligent shortcut recommendations based on your usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {aiSuggestedWorkflows.map((workflow, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {workflow.name}
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Suggested
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Apply Workflow
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(workflow.shortcuts).map(([action, keys]) => (
                        <div key={action} className="flex justify-between">
                          <span className="capitalize">{action.replace('-', ' ')}</span>
                          <div className="flex items-center gap-1">
                            {keys.map((key, index) => (
                              <React.Fragment key={index}>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {key}
                                </Badge>
                                {index < keys.length - 1 && (
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
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Interactive Shortcut Documentation
              </CardTitle>
              <CardDescription>
                Learn about keyboard shortcuts and best practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Use Ctrl+Shift+? to open the quick reference guide anytime.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Shortcut Conventions</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>Ctrl</strong> - Primary modifier for most actions</p>
                    <p>• <strong>Ctrl+Shift</strong> - Advanced or alternative actions</p>
                    <p>• <strong>Alt</strong> - Interface and navigation shortcuts</p>
                    <p>• <strong>Single keys</strong> - Quick actions in specific contexts</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Context-Specific Shortcuts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-primary">DevFlow Studio</h4>
                      <div className="text-muted-foreground space-y-1">
                        <p>• A - Add new node</p>
                        <p>• Delete - Remove selected</p>
                        <p>• Ctrl+D - Duplicate node</p>
                        <p>• Ctrl+G - Group selection</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">Regexr++</h4>
                      <div className="text-muted-foreground space-y-1">
                        <p>• Ctrl+T - Test pattern</p>
                        <p>• Ctrl+R - Generate code</p>
                        <p>• F1 - Pattern help</p>
                        <p>• Ctrl+/ - Toggle explanation</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Conflict Resolution</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>When shortcuts conflict, the system will:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Warn you about conflicts when editing</li>
                      <li>Prioritize context-specific shortcuts</li>
                      <li>Suggest alternative key combinations</li>
                      <li>Allow you to override with confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}