import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw,
  HardDrive,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react'
import { localStorageManager, STORAGE_KEYS } from '@/lib/local-storage-manager'
import type { StorageKey } from '@/lib/local-storage-manager'

interface StorageBreakdown {
  key: string
  name: string
  size: number
  percentage: number
  type: 'settings' | 'data' | 'cache' | 'temporary'
  lastModified: Date
  canClear: boolean
}

export const DataManagement: React.FC = () => {
  const [storageData, setStorageData] = useState<{
    total: number
    breakdown: Record<string, number>
    percentage: number
  }>({ total: 0, breakdown: {}, percentage: 0 })
  
  const [storageBreakdown, setStorageBreakdown] = useState<StorageBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [autoCleanup, setAutoCleanup] = useState(true)

  useEffect(() => {
    loadStorageData()
  }, [])

  const loadStorageData = async () => {
    setIsLoading(true)
    
    try {
      const usage = localStorageManager.getStorageUsage()
      const metadata = localStorageManager.getStorageMetadata()
      
      setStorageData(usage)
      
      const breakdown: StorageBreakdown[] = metadata.map(item => ({
        key: item.key,
        name: getStorageName(item.key),
        size: item.size,
        percentage: (item.size / usage.total) * 100,
        type: item.type,
        lastModified: item.lastModified,
        canClear: canClearStorage(item.key)
      }))
      
      breakdown.sort((a, b) => b.size - a.size)
      setStorageBreakdown(breakdown)
      
    } catch (error) {
      console.error('Failed to load storage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStorageName = (key: string): string => {
    const names: Record<string, string> = {
      [STORAGE_KEYS.USER_SETTINGS]: 'User Settings',
      [STORAGE_KEYS.WORKSPACE_STATE]: 'Workspace State',
      [STORAGE_KEYS.REGEX_LIBRARY]: 'Regex Library',
      [STORAGE_KEYS.RECENT_FILES]: 'Recent Files',
      [STORAGE_KEYS.ONBOARDING_STATE]: 'Onboarding State',
      [STORAGE_KEYS.TEMPLATES]: 'Templates',
      [STORAGE_KEYS.ANALYTICS]: 'Analytics Data',
      [STORAGE_KEYS.CACHE]: 'Cache Data',
      [STORAGE_KEYS.MCP_TOKEN]: 'AI API Token',
      [STORAGE_KEYS.THEME_OVERRIDE]: 'Theme Override'
    }
    
    return names[key] || key.replace('df_', '').replace(/_/g, ' ')
  }

  const canClearStorage = (key: string): boolean => {
    // Don't allow clearing critical settings
    const protectedKeys = [
      STORAGE_KEYS.USER_SETTINGS,
      STORAGE_KEYS.ONBOARDING_STATE
    ]
    
    return !protectedKeys.includes(key as StorageKey)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStorageColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTypeColor = (type: string): string => {
    const colors = {
      settings: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      data: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cache: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      temporary: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[type as keyof typeof colors] || colors.data
  }

  const handleClearSelected = async () => {
    if (selectedItems.length === 0) return
    
    const confirmMessage = `Are you sure you want to clear ${selectedItems.length} storage item${selectedItems.length > 1 ? 's' : ''}? This cannot be undone.`
    
    if (!confirm(confirmMessage)) return
    
    try {
      for (const key of selectedItems) {
        localStorageManager.removeItem(key as StorageKey)
      }
      
      setSelectedItems([])
      await loadStorageData()
      
    } catch (error) {
      console.error('Failed to clear selected items:', error)
      alert('Failed to clear some items. Please try again.')
    }
  }

  const handleClearCache = async () => {
    if (!confirm('Clear all cache data? This will not affect your settings or saved work.')) return
    
    try {
      const cacheItems = storageBreakdown.filter(item => item.type === 'cache')
      
      for (const item of cacheItems) {
        localStorageManager.removeItem(item.key as StorageKey)
      }
      
      await loadStorageData()
      
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear cache. Please try again.')
    }
  }

  const handleExportData = () => {
    try {
      const exportData = localStorageManager.exportAllData()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `devkit-flow-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const success = localStorageManager.importData(data, { validate: true })
        
        if (success) {
          alert('Data imported successfully! Please refresh the page to see changes.')
          loadStorageData()
        } else {
          alert('Failed to import data. Please check the file format.')
        }
        
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import data. Please check the file format.')
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const handleSelectItem = (key: string) => {
    setSelectedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    )
  }

  const handleSelectAll = () => {
    const clearableItems = storageBreakdown.filter(item => item.canClear).map(item => item.key)
    setSelectedItems(prev => 
      prev.length === clearableItems.length ? [] : clearableItems
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading storage data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5" />
            <span>Storage Overview</span>
          </CardTitle>
          <CardDescription>
            Your local data usage and storage breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage Used</span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(storageData.total)} ({storageData.percentage.toFixed(1)}% of estimated quota)
            </span>
          </div>
          
          <Progress 
            value={Math.min(storageData.percentage, 100)} 
            className="h-2"
          />
          
          {storageData.percentage > 80 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Storage usage is high. Consider clearing cache or old data to free up space.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadStorageData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Breakdown</CardTitle>
            <CardDescription>
              Detailed view of what's using your storage space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedItems.length === storageBreakdown.filter(item => item.canClear).length 
                      ? 'Deselect All' 
                      : 'Select All Clearable'
                    }
                  </Button>
                  
                  {selectedItems.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearSelected}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Selected ({selectedItems.length})
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  disabled={!storageBreakdown.some(item => item.type === 'cache')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
              
              <div className="space-y-2">
                {storageBreakdown.map((item) => (
                  <div key={item.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {item.canClear && (
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.key)}
                        onChange={() => handleSelectItem(item.key)}
                        className="rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatBytes(item.size)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-muted-foreground">
                          Last modified: {item.lastModified.toLocaleDateString()}
                        </div>
                        <div className="w-24">
                          <div className={`h-1 rounded-full ${getStorageColor(item.percentage)}`} 
                               style={{ width: `${Math.min(item.percentage * 2, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Export, import, and manage your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download all your data as a JSON file for backup or transfer
              </p>
              <Button onClick={handleExportData} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Restore data from a previously exported JSON file
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-cleanup" className="font-medium">
                  Automatic Cleanup
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically remove old cache and temporary data
                </p>
              </div>
              <Switch
                id="auto-cleanup"
                checked={autoCleanup}
                onCheckedChange={setAutoCleanup}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                All your data is stored locally in your browser. Nothing is sent to external servers 
                unless you explicitly use AI features with your own API key.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">What's Stored Locally:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your settings and preferences</li>
                  <li>• DevFlow sessions and projects</li>
                  <li>• Regex patterns and templates</li>
                  <li>• Recent files and workspace state</li>
                  <li>• Usage analytics (if enabled)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Security Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Data validation and checksums</li>
                  <li>• Automatic cleanup of old data</li>
                  <li>• Secure API key storage</li>
                  <li>• Export/import with validation</li>
                  <li>• No external data transmission</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}