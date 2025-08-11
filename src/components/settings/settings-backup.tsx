import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  FileText, 
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import type { BackupOptions, ImportOptions } from '@/types/settings'

interface BackupData {
  version: string
  timestamp: string
  settings: any
  aiConfig: any
  shortcuts: any[]
  metadata: {
    appVersion: string
    platform: string
    totalSize: number
  }
}

export const SettingsBackup: React.FC = () => {
  const { 
    settings, 
    aiConfig, 
    shortcuts, 
    exportSettings, 
    importSettings,
    resetSettings,
    dataInfo,
    updateDataInfo
  } = useSettingsStore()

  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeSessions: true,
    includePatterns: true,
    includeTemplates: true,
    includeSettings: true,
    format: 'json',
    encryption: false
  })

  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mergeStrategy: 'merge',
    validateData: true,
    createBackup: true
  })

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupData[]>([])

  const createBackup = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress
      const steps = [
        { name: 'Collecting settings...', progress: 20 },
        { name: 'Gathering user data...', progress: 40 },
        { name: 'Compressing data...', progress: 60 },
        { name: 'Generating backup...', progress: 80 },
        { name: 'Finalizing...', progress: 100 }
      ]

      for (const step of steps) {
        setExportProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings: backupOptions.includeSettings ? settings : null,
        aiConfig: backupOptions.includeSettings ? aiConfig : null,
        shortcuts: backupOptions.includeSettings ? shortcuts : [],
        metadata: {
          appVersion: '1.0.0',
          platform: navigator.platform,
          totalSize: dataInfo.totalSize
        }
      }

      // Add session data if requested
      if (backupOptions.includeSessions) {
        const sessionData = localStorage.getItem('df_workspace_state')
        if (sessionData) {
          ;(backupData as any).sessions = JSON.parse(sessionData)
        }
      }

      // Add pattern data if requested
      if (backupOptions.includePatterns) {
        const patternData = localStorage.getItem('df_regex_library')
        if (patternData) {
          ;(backupData as any).patterns = JSON.parse(patternData)
        }
      }

      // Add template data if requested
      if (backupOptions.includeTemplates) {
        const templateData = localStorage.getItem('df_templates')
        if (templateData) {
          ;(backupData as any).templates = JSON.parse(templateData)
        }
      }

      const dataStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `devkit-flow-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Add to backup history
      setBackupHistory(prev => [backupData, ...prev.slice(0, 9)]) // Keep last 10 backups

    } catch (error) {
      console.error('Backup failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const restoreBackup = async () => {
    if (!importFile) return

    setIsImporting(true)

    try {
      const text = await importFile.text()
      const backupData: BackupData = JSON.parse(text)

      // Validate backup data
      if (importOptions.validateData) {
        if (!backupData.version || !backupData.timestamp) {
          throw new Error('Invalid backup file format')
        }
      }

      // Create backup of current settings if requested
      if (importOptions.createBackup) {
        await createBackup()
      }

      // Restore settings based on merge strategy
      if (backupData.settings) {
        if (importOptions.mergeStrategy === 'replace') {
          // Replace all settings
          Object.keys(backupData.settings).forEach(key => {
            localStorage.setItem(`df_${key}`, JSON.stringify(backupData.settings[key]))
          })
        } else if (importOptions.mergeStrategy === 'merge') {
          // Merge settings
          const success = importSettings(JSON.stringify({
            settings: backupData.settings,
            aiConfig: backupData.aiConfig,
            shortcuts: backupData.shortcuts
          }))
          
          if (!success) {
            throw new Error('Failed to import settings')
          }
        }
      }

      // Restore other data
      if (backupData.sessions && (backupData as any).sessions) {
        localStorage.setItem('df_workspace_state', JSON.stringify((backupData as any).sessions))
      }

      if (backupData.patterns && (backupData as any).patterns) {
        localStorage.setItem('df_regex_library', JSON.stringify((backupData as any).patterns))
      }

      if (backupData.templates && (backupData as any).templates) {
        localStorage.setItem('df_templates', JSON.stringify((backupData as any).templates))
      }

      // Refresh data info
      await updateDataInfo()

      alert('Backup restored successfully! Please refresh the page to see changes.')

    } catch (error) {
      console.error('Restore failed:', error)
      alert('Failed to restore backup: ' + (error as Error).message)
    } finally {
      setIsImporting(false)
      setImportFile(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      setImportFile(file)
    } else {
      alert('Please select a valid JSON backup file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Backup Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Save className="w-5 h-5" />
            <span>Create Backup</span>
          </CardTitle>
          <CardDescription>
            Export your settings and data for safekeeping or transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Include in backup:</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-settings">Settings & Preferences</Label>
                <Switch
                  id="include-settings"
                  checked={backupOptions.includeSettings}
                  onCheckedChange={(checked) => 
                    setBackupOptions(prev => ({ ...prev, includeSettings: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-sessions">Sessions & Projects</Label>
                <Switch
                  id="include-sessions"
                  checked={backupOptions.includeSessions}
                  onCheckedChange={(checked) => 
                    setBackupOptions(prev => ({ ...prev, includeSessions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-patterns">Regex Patterns</Label>
                <Switch
                  id="include-patterns"
                  checked={backupOptions.includePatterns}
                  onCheckedChange={(checked) => 
                    setBackupOptions(prev => ({ ...prev, includePatterns: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-templates">Templates</Label>
                <Switch
                  id="include-templates"
                  checked={backupOptions.includeTemplates}
                  onCheckedChange={(checked) => 
                    setBackupOptions(prev => ({ ...prev, includeTemplates: checked }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Current data size:</Label>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Settings:</span>
                  <span>{formatFileSize(dataInfo.breakdown.settings)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sessions:</span>
                  <span>{formatFileSize(dataInfo.breakdown.sessions)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Patterns:</span>
                  <span>{formatFileSize(dataInfo.breakdown.patterns)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Templates:</span>
                  <span>{formatFileSize(dataInfo.breakdown.templates)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatFileSize(dataInfo.totalSize)}</span>
                </div>
              </div>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating backup...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}

          <Button 
            onClick={createBackup} 
            disabled={isExporting}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Creating Backup...' : 'Create Backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Backup Restoration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Restore Backup</span>
          </CardTitle>
          <CardDescription>
            Import settings and data from a backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="backup-file">Select backup file:</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
            />
          </div>

          {importFile && (
            <Alert>
              <FileText className="w-4 h-4" />
              <AlertDescription>
                Selected: {importFile.name} ({formatFileSize(importFile.size)})
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">Import options:</Label>
            
            <div className="space-y-2">
              <Label htmlFor="merge-strategy">Merge strategy:</Label>
              <select
                id="merge-strategy"
                className="w-full p-2 border rounded-md"
                value={importOptions.mergeStrategy}
                onChange={(e) => 
                  setImportOptions(prev => ({ 
                    ...prev, 
                    mergeStrategy: e.target.value as 'replace' | 'merge' | 'skip'
                  }))
                }
              >
                <option value="merge">Merge with existing settings</option>
                <option value="replace">Replace all settings</option>
                <option value="skip">Skip conflicting settings</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="validate-data">Validate backup data</Label>
              <Switch
                id="validate-data"
                checked={importOptions.validateData}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, validateData: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="create-backup">Create backup before restore</Label>
              <Switch
                id="create-backup"
                checked={importOptions.createBackup}
                onCheckedChange={(checked) => 
                  setImportOptions(prev => ({ ...prev, createBackup: checked }))
                }
              />
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Restoring a backup will modify your current settings and data. 
              Make sure to create a backup first if you want to preserve your current state.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={restoreBackup} 
            disabled={!importFile || isImporting}
            className="w-full"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? 'Restoring...' : 'Restore Backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5" />
            <span>Reset Settings</span>
          </CardTitle>
          <CardDescription>
            Restore all settings to their default values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              This will permanently reset all your settings to defaults. 
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                resetSettings()
                alert('Settings have been reset to defaults.')
              }
            }}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Settings
          </Button>
        </CardContent>
      </Card>

      {/* Backup History */}
      {backupHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Backups</span>
            </CardTitle>
            <CardDescription>
              Your recent backup history (stored in browser session)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {backupHistory.map((backup, index) => (
                <div key={backup.timestamp} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      Backup {new Date(backup.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(backup.timestamp).toLocaleTimeString()} • 
                      Version {backup.version} • 
                      {formatFileSize(backup.metadata.totalSize)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dataStr = JSON.stringify(backup, null, 2)
                      const blob = new Blob([dataStr], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `devkit-flow-backup-${backup.timestamp.split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}