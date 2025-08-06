import React from 'react'
import { Database, Download, Upload, Trash2, Shield, HardDrive } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Progress } from '../../ui/progress'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Alert, AlertDescription } from '../../ui/alert'

export const DataManagement: React.FC = () => {
  const { dataInfo, clearData, updateDataInfo } = useSettingsStore()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const storagePercentage = Math.min((dataInfo.totalSize / (10 * 1024 * 1024)) * 100, 100) // Assume 10MB limit

  const handleClearData = async (types: string[]) => {
    if (confirm(`Are you sure you want to clear ${types.join(', ')} data? This cannot be undone.`)) {
      await clearData(types)
    }
  }

  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting data...')
  }

  const handleImportData = () => {
    // Implementation for data import
    console.log('Importing data...')
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>
            Monitor your local data storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Usage</span>
              <span>{formatBytes(dataInfo.totalSize)} / 10 MB</span>
            </div>
            <Progress value={storagePercentage} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {Math.round(storagePercentage)}% of available storage used
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Storage Breakdown</h4>
            {Object.entries(dataInfo.breakdown).map(([type, size]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="capitalize">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearData([type])}
                    disabled={size === 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and backup your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleExportData}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Export Data</div>
                <div className="text-xs text-muted-foreground">
                  Download all your data
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleImportData}
            >
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Import Data</div>
                <div className="text-xs text-muted-foreground">
                  Restore from backup
                </div>
              </div>
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearData(['cache'])}
              >
                Clear Cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearData(['sessions', 'patterns'])}
              >
                Clear All Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updateDataInfo}
              >
                Refresh Usage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control how your data is handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All your data is stored locally in your browser. We never send your 
              sessions, patterns, or personal data to our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto Backup</div>
                <div className="text-sm text-muted-foreground">
                  Automatically backup data to local storage
                </div>
              </div>
              <Badge variant="outline">
                {dataInfo.autoBackupEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Data Retention Policy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span>{dataInfo.retentionPolicy.sessions} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Patterns:</span>
                  <span>{dataInfo.retentionPolicy.patterns} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics:</span>
                  <span>{dataInfo.retentionPolicy.analytics} days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}