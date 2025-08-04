import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw,
  Save,
  AlertCircle,
  Info
} from 'lucide-react'
import type { CommitGenerationRules, CommitFormatConfig, CustomPattern } from '@/lib/commit-generator'

interface CommitSettingsProps {
  rules: CommitGenerationRules
  onRulesChange: (rules: CommitGenerationRules) => void
  onClose: () => void
  className?: string
}

export const CommitSettings: React.FC<CommitSettingsProps> = ({
  rules,
  onRulesChange,
  onClose,
  className = ''
}) => {
  const [localRules, setLocalRules] = useState<CommitGenerationRules>(rules)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Handle rule updates
  const updateRules = useCallback((updates: Partial<CommitGenerationRules>) => {
    const newRules = { ...localRules, ...updates }
    setLocalRules(newRules)
    setHasChanges(true)
  }, [localRules])

  // Handle format config updates
  const updateFormatConfig = useCallback((updates: Partial<CommitFormatConfig>) => {
    const newFormat = { ...localRules.format, ...updates }
    updateRules({ format: newFormat })
  }, [localRules.format, updateRules])

  // Handle template updates
  const updateTemplate = useCallback((type: string, template: string) => {
    const newTemplates = { ...localRules.templates, [type]: template }
    updateRules({ templates: newTemplates })
  }, [localRules.templates, updateRules])

  // Handle custom pattern updates
  const addCustomPattern = useCallback(() => {
    const newPattern: CustomPattern = {
      id: Date.now().toString(),
      name: 'New Pattern',
      pattern: /example/i,
      replacement: 'replacement',
      type: 'feat',
      description: 'Description of the pattern',
      enabled: true
    }
    
    const newPatterns = [...localRules.customPatterns, newPattern]
    updateRules({ customPatterns: newPatterns })
  }, [localRules.customPatterns, updateRules])

  const updateCustomPattern = useCallback((id: string, updates: Partial<CustomPattern>) => {
    const newPatterns = localRules.customPatterns.map(pattern =>
      pattern.id === id ? { ...pattern, ...updates } : pattern
    )
    updateRules({ customPatterns: newPatterns })
  }, [localRules.customPatterns, updateRules])

  const removeCustomPattern = useCallback((id: string) => {
    const newPatterns = localRules.customPatterns.filter(pattern => pattern.id !== id)
    updateRules({ customPatterns: newPatterns })
  }, [localRules.customPatterns, updateRules])

  // Handle save
  const handleSave = useCallback(() => {
    onRulesChange(localRules)
    setHasChanges(false)
    toast({
      title: 'Settings saved',
      description: 'Commit generation rules have been updated.',
    })
  }, [localRules, onRulesChange, toast])

  // Handle reset
  const handleReset = useCallback(() => {
    setLocalRules(rules)
    setHasChanges(false)
    toast({
      title: 'Settings reset',
      description: 'Changes have been discarded.',
    })
  }, [rules, toast])

  // Handle export
  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(localRules, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'commit-rules.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Rules exported',
        description: 'Commit generation rules have been exported.',
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export commit generation rules.',
        variant: 'destructive'
      })
    }
  }, [localRules, toast])

  // Handle import
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedRules = JSON.parse(e.target?.result as string) as CommitGenerationRules
        setLocalRules(importedRules)
        setHasChanges(true)
        toast({
          title: 'Rules imported',
          description: 'Commit generation rules have been imported.',
        })
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Failed to parse imported rules file.',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }, [toast])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Commit Generation Settings
          </CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="format" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxSubjectLength">Max Subject Length</Label>
                <Input
                  id="maxSubjectLength"
                  type="number"
                  value={localRules.format.maxSubjectLength}
                  onChange={(e) => updateFormatConfig({ maxSubjectLength: parseInt(e.target.value) })}
                  min={20}
                  max={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxBodyLineLength">Max Body Line Length</Label>
                <Input
                  id="maxBodyLineLength"
                  type="number"
                  value={localRules.format.maxBodyLineLength}
                  onChange={(e) => updateFormatConfig({ maxBodyLineLength: parseInt(e.target.value) })}
                  min={50}
                  max={120}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeCase">Type Case</Label>
                <Select
                  value={localRules.format.enforceTypeCase}
                  onValueChange={(value: 'lower' | 'upper' | 'title') => 
                    updateFormatConfig({ enforceTypeCase: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lower">lowercase</SelectItem>
                    <SelectItem value="upper">UPPERCASE</SelectItem>
                    <SelectItem value="title">Title Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scopeCase">Scope Case</Label>
                <Select
                  value={localRules.format.enforceScopeCase}
                  onValueChange={(value: 'lower' | 'upper' | 'title') => 
                    updateFormatConfig({ enforceScopeCase: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lower">lowercase</SelectItem>
                    <SelectItem value="upper">UPPERCASE</SelectItem>
                    <SelectItem value="title">Title Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeBody"
                  checked={localRules.format.includeBody}
                  onCheckedChange={(checked) => updateFormatConfig({ includeBody: checked })}
                />
                <Label htmlFor="includeBody">Include body in generated messages</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="scopeRequired"
                  checked={localRules.format.scopeRequired}
                  onCheckedChange={(checked) => updateFormatConfig({ scopeRequired: checked })}
                />
                <Label htmlFor="scopeRequired">Require scope in commit messages</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="bodyRequired"
                  checked={localRules.format.bodyRequired}
                  onCheckedChange={(checked) => updateFormatConfig({ bodyRequired: checked })}
                />
                <Label htmlFor="bodyRequired">Require body in commit messages</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Allowed Commit Types</Label>
              <div className="flex flex-wrap gap-2">
                {localRules.format.allowedTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                These are the standard conventional commit types that will be recognized.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Customize templates for different commit types. Use {'{type}'}, {'{scope}'}, {'{description}'}, and {'{body}'} as placeholders.
              </p>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(localRules.templates).map(([type, template]) => (
                  <div key={type} className="space-y-2">
                    <Label htmlFor={`template-${type}`} className="flex items-center gap-2">
                      <Badge variant="outline">{type}</Badge>
                      Template
                    </Label>
                    <Textarea
                      id={`template-${type}`}
                      value={template}
                      onChange={(e) => updateTemplate(type, e.target.value)}
                      placeholder={`Template for ${type} commits...`}
                      className="font-mono text-sm"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="patterns" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Custom patterns to automatically transform commit descriptions.
                </p>
              </div>
              <Button onClick={addCustomPattern} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Pattern
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {localRules.customPatterns.map((pattern) => (
                  <Card key={pattern.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pattern.enabled}
                            onCheckedChange={(checked) => 
                              updateCustomPattern(pattern.id, { enabled: checked })
                            }
                          />
                          <Input
                            value={pattern.name}
                            onChange={(e) => 
                              updateCustomPattern(pattern.id, { name: e.target.value })
                            }
                            className="font-medium"
                            placeholder="Pattern name"
                          />
                        </div>
                        <Button
                          onClick={() => removeCustomPattern(pattern.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Pattern (RegExp)</Label>
                          <Input
                            value={pattern.pattern.source}
                            onChange={(e) => {
                              try {
                                const newPattern = new RegExp(e.target.value, 'i')
                                updateCustomPattern(pattern.id, { pattern: newPattern })
                              } catch {
                                // Invalid regex, ignore
                              }
                            }}
                            placeholder="example.*pattern"
                            className="font-mono text-sm"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Replacement</Label>
                          <Input
                            value={pattern.replacement}
                            onChange={(e) => 
                              updateCustomPattern(pattern.id, { replacement: e.target.value })
                            }
                            placeholder="replacement text"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Override Type</Label>
                          <Select
                            value={pattern.type}
                            onValueChange={(value) => 
                              updateCustomPattern(pattern.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {localRules.format.allowedTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Override Scope</Label>
                          <Input
                            value={pattern.scope || ''}
                            onChange={(e) => 
                              updateCustomPattern(pattern.id, { scope: e.target.value || undefined })
                            }
                            placeholder="optional scope"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={pattern.description}
                          onChange={(e) => 
                            updateCustomPattern(pattern.id, { description: e.target.value })
                          }
                          placeholder="Describe what this pattern does..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {localRules.customPatterns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No custom patterns defined</p>
                    <p className="text-sm">Add patterns to automatically transform commit descriptions</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoGenerate"
                  checked={localRules.autoGenerate}
                  onCheckedChange={(checked) => updateRules({ autoGenerate: checked })}
                />
                <Label htmlFor="autoGenerate">Auto-generate commit messages</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeTimestamp"
                  checked={localRules.includeTimestamp}
                  onCheckedChange={(checked) => updateRules({ includeTimestamp: checked })}
                />
                <Label htmlFor="includeTimestamp">Include timestamp in commit messages</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeAuthor"
                  checked={localRules.includeAuthor}
                  onCheckedChange={(checked) => updateRules({ includeAuthor: checked })}
                />
                <Label htmlFor="includeAuthor">Include author in commit messages</Label>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Import/Export Settings</h3>
              
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Rules
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Rules
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="flex justify-between">
          <Button onClick={handleReset} variant="outline" disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Changes
          </Button>
          
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CommitSettings