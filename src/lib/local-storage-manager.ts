/**
 * Local Data Storage System
 * Task 15.6: Implement structured localStorage schema with organized keys
 */

import type { 
  LocalStorageSchema, 
  UserSettings, 
  OnboardingState,
  WorkspaceState,
  RegexLibrary,
  RecentFile
} from '@/types/settings'

// Storage key constants
export const STORAGE_KEYS = {
  USER_SETTINGS: 'df_user_settings',
  WORKSPACE_STATE: 'df_workspace_state',
  REGEX_LIBRARY: 'df_regex_library',
  RECENT_FILES: 'df_recent_files',
  MCP_TOKEN: 'df_mcp_token',
  THEME_OVERRIDE: 'df_theme_override',
  FEEDBACK_SUBMITTED: 'df_feedback_submitted',
  ONBOARDING_STATE: 'df_onboarding_state',
  TEMPLATES: 'df_templates',
  ANALYTICS: 'df_analytics',
  CACHE: 'df_cache'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

interface StorageItem<T = any> {
  data: T
  timestamp: number
  version: string
  checksum?: string
}

interface StorageMetadata {
  key: string
  size: number
  lastModified: Date
  version: string
  type: 'settings' | 'data' | 'cache' | 'temporary'
  encrypted: boolean
}

/**
 * Enhanced Local Storage Manager with structured schema
 */
export class LocalStorageManager {
  private static instance: LocalStorageManager
  private readonly version = '1.0.0'
  private readonly maxRetries = 3
  private readonly compressionThreshold = 1024 // 1KB

  private constructor() {
    this.initializeStorage()
  }

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager()
    }
    return LocalStorageManager.instance
  }

  /**
   * Initialize storage with default values
   */
  private initializeStorage(): void {
    try {
      // Check if this is the first run
      const hasExistingData = this.hasKey(STORAGE_KEYS.USER_SETTINGS)
      
      if (!hasExistingData) {
        this.setDefaults()
      }

      // Migrate old data if needed
      this.migrateOldData()
      
      // Clean up expired data
      this.cleanupExpiredData()
      
    } catch (error) {
      console.error('Failed to initialize storage:', error)
    }
  }

  /**
   * Set default values for new installations
   */
  private setDefaults(): void {
    const defaultSettings: UserSettings = {
      enhancedFeatures: true,
      aiEnabled: false,
      theme: 'system',
      autoSave: true,
      exportFormatDefault: 'json',
      gridSnapping: true,
      showLineNumbers: true,
      devToolsVisible: false,
      defaultWorkspace: 'studio',
      canvasZoomLevel: 1,
      sidebarWidth: 320,
      dataRetentionDays: 30,
      analyticsEnabled: true,
      feedbackSubmitted: false
    }

    const defaultOnboarding: OnboardingState = {
      isFirstLaunch: true,
      currentStep: 0,
      totalSteps: 5,
      aiFeatureChoice: 'undecided',
      completedSteps: [],
      skippedSteps: []
    }

    const defaultRegexLibrary: RegexLibrary = {
      patterns: [],
      categories: [
        {
          id: 'email',
          name: 'Email',
          description: 'Email validation patterns',
          color: '#3b82f6',
          icon: 'Mail'
        },
        {
          id: 'phone',
          name: 'Phone',
          description: 'Phone number patterns',
          color: '#10b981',
          icon: 'Phone'
        },
        {
          id: 'url',
          name: 'URL',
          description: 'URL validation patterns',
          color: '#f59e0b',
          icon: 'Link'
        },
        {
          id: 'date',
          name: 'Date',
          description: 'Date format patterns',
          color: '#ef4444',
          icon: 'Calendar'
        },
        {
          id: 'custom',
          name: 'Custom',
          description: 'User-created patterns',
          color: '#8b5cf6',
          icon: 'Star'
        }
      ],
      favorites: [],
      recentlyUsed: []
    }

    this.setItem(STORAGE_KEYS.USER_SETTINGS, defaultSettings)
    this.setItem(STORAGE_KEYS.ONBOARDING_STATE, defaultOnboarding)
    this.setItem(STORAGE_KEYS.REGEX_LIBRARY, defaultRegexLibrary)
    this.setItem(STORAGE_KEYS.RECENT_FILES, [])
  }

  /**
   * Migrate data from older versions
   */
  private migrateOldData(): void {
    try {
      // Check for old storage keys and migrate them
      const oldKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('devkit-flow-') || key.startsWith('df-')
      )

      for (const oldKey of oldKeys) {
        const newKey = this.mapOldKeyToNew(oldKey)
        if (newKey && !this.hasKey(newKey)) {
          const oldData = localStorage.getItem(oldKey)
          if (oldData) {
            try {
              const parsedData = JSON.parse(oldData)
              this.setItem(newKey, parsedData)
              localStorage.removeItem(oldKey)
            } catch (error) {
              console.warn(`Failed to migrate ${oldKey}:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }

  /**
   * Map old storage keys to new ones
   */
  private mapOldKeyToNew(oldKey: string): StorageKey | null {
    const keyMappings: Record<string, StorageKey> = {
      'devkit-flow-settings': STORAGE_KEYS.USER_SETTINGS,
      'devkit-flow-theme': STORAGE_KEYS.THEME_OVERRIDE,
      'df-settings': STORAGE_KEYS.USER_SETTINGS,
      'df-workspace': STORAGE_KEYS.WORKSPACE_STATE,
      'df-patterns': STORAGE_KEYS.REGEX_LIBRARY
    }

    return keyMappings[oldKey] || null
  }

  /**
   * Clean up expired data based on retention policies
   */
  private cleanupExpiredData(): void {
    try {
      const settings = this.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS)
      if (!settings) return

      const retentionDays = settings.dataRetentionDays || 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      // Clean up old analytics data
      this.cleanupByDate(STORAGE_KEYS.ANALYTICS, cutoffDate)
      
      // Clean up old cache data
      this.cleanupByDate(STORAGE_KEYS.CACHE, cutoffDate)

      // Clean up old recent files
      const recentFiles = this.getItem<RecentFile[]>(STORAGE_KEYS.RECENT_FILES) || []
      const filteredFiles = recentFiles.filter(file => 
        new Date(file.lastModified) > cutoffDate
      )
      
      if (filteredFiles.length !== recentFiles.length) {
        this.setItem(STORAGE_KEYS.RECENT_FILES, filteredFiles)
      }

    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  /**
   * Clean up data older than specified date
   */
  private cleanupByDate(key: StorageKey, cutoffDate: Date): void {
    try {
      const item = localStorage.getItem(key)
      if (!item) return

      const storageItem: StorageItem = JSON.parse(item)
      if (storageItem.timestamp < cutoffDate.getTime()) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Failed to cleanup ${key}:`, error)
    }
  }

  /**
   * Set an item in localStorage with metadata
   */
  setItem<T>(key: StorageKey, data: T, options: { 
    compress?: boolean
    encrypt?: boolean
    ttl?: number // Time to live in milliseconds
  } = {}): boolean {
    try {
      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.version
      }

      // Add TTL if specified
      if (options.ttl) {
        (storageItem as any).expiresAt = Date.now() + options.ttl
      }

      let serialized = JSON.stringify(storageItem)

      // Compress if data is large
      if (options.compress || serialized.length > this.compressionThreshold) {
        serialized = this.compress(serialized)
        storageItem.checksum = this.generateChecksum(serialized)
      }

      // Encrypt if requested (basic encryption for demo)
      if (options.encrypt) {
        serialized = this.encrypt(serialized)
      }

      localStorage.setItem(key, serialized)
      return true

    } catch (error) {
      console.error(`Failed to set ${key}:`, error)
      
      // Try to free up space and retry
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.freeUpSpace()
        return this.setItem(key, data, options)
      }
      
      return false
    }
  }

  /**
   * Get an item from localStorage with validation
   */
  getItem<T>(key: StorageKey, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue || null

      let serialized = item

      // Decrypt if needed (detect encrypted data)
      if (this.isEncrypted(serialized)) {
        serialized = this.decrypt(serialized)
      }

      // Decompress if needed (detect compressed data)
      if (this.isCompressed(serialized)) {
        serialized = this.decompress(serialized)
      }

      const storageItem: StorageItem<T> = JSON.parse(serialized)

      // Check if item has expired
      if ((storageItem as any).expiresAt && Date.now() > (storageItem as any).expiresAt) {
        localStorage.removeItem(key)
        return defaultValue || null
      }

      // Validate checksum if present
      if (storageItem.checksum) {
        const currentChecksum = this.generateChecksum(JSON.stringify(storageItem.data))
        if (currentChecksum !== storageItem.checksum) {
          console.warn(`Checksum mismatch for ${key}, data may be corrupted`)
        }
      }

      return storageItem.data

    } catch (error) {
      console.error(`Failed to get ${key}:`, error)
      return defaultValue || null
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(key: StorageKey): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error)
      return false
    }
  }

  /**
   * Check if a key exists
   */
  hasKey(key: StorageKey): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * Get all DevKit Flow storage keys
   */
  getAllKeys(): StorageKey[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('df_'))
      .filter(key => Object.values(STORAGE_KEYS).includes(key as StorageKey)) as StorageKey[]
  }

  /**
   * Get storage metadata for all items
   */
  getStorageMetadata(): StorageMetadata[] {
    const metadata: StorageMetadata[] = []

    for (const key of this.getAllKeys()) {
      try {
        const item = localStorage.getItem(key)
        if (!item) continue

        const size = new Blob([item]).size
        let storageItem: StorageItem

        try {
          let serialized = item
          if (this.isEncrypted(serialized)) {
            serialized = this.decrypt(serialized)
          }
          if (this.isCompressed(serialized)) {
            serialized = this.decompress(serialized)
          }
          storageItem = JSON.parse(serialized)
        } catch {
          // If parsing fails, create minimal metadata
          storageItem = {
            data: null,
            timestamp: Date.now(),
            version: 'unknown'
          }
        }

        metadata.push({
          key,
          size,
          lastModified: new Date(storageItem.timestamp),
          version: storageItem.version,
          type: this.getStorageType(key),
          encrypted: this.isEncrypted(item)
        })

      } catch (error) {
        console.warn(`Failed to get metadata for ${key}:`, error)
      }
    }

    return metadata
  }

  /**
   * Get total storage usage
   */
  getStorageUsage(): {
    total: number
    breakdown: Record<string, number>
    percentage: number
  } {
    const breakdown: Record<string, number> = {}
    let total = 0

    for (const key of this.getAllKeys()) {
      const item = localStorage.getItem(key)
      if (item) {
        const size = new Blob([item]).size
        breakdown[key] = size
        total += size
      }
    }

    // Estimate quota (most browsers have 5-10MB limit)
    const estimatedQuota = 5 * 1024 * 1024 // 5MB
    const percentage = (total / estimatedQuota) * 100

    return { total, breakdown, percentage }
  }

  /**
   * Export all data
   */
  exportAllData(): string {
    const exportData: Record<string, any> = {}

    for (const key of this.getAllKeys()) {
      const data = this.getItem(key)
      if (data !== null) {
        exportData[key] = data
      }
    }

    return JSON.stringify({
      version: this.version,
      timestamp: new Date().toISOString(),
      data: exportData
    }, null, 2)
  }

  /**
   * Import data from export
   */
  importData(exportedData: string, options: {
    overwrite?: boolean
    validate?: boolean
  } = {}): boolean {
    try {
      const parsed = JSON.parse(exportedData)
      
      if (options.validate) {
        if (!parsed.version || !parsed.timestamp || !parsed.data) {
          throw new Error('Invalid export format')
        }
      }

      for (const [key, value] of Object.entries(parsed.data)) {
        if (Object.values(STORAGE_KEYS).includes(key as StorageKey)) {
          if (options.overwrite || !this.hasKey(key as StorageKey)) {
            this.setItem(key as StorageKey, value)
          }
        }
      }

      return true

    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  /**
   * Clear all DevKit Flow data
   */
  clearAllData(options: {
    keepSettings?: boolean
    keepOnboarding?: boolean
  } = {}): boolean {
    try {
      const keysToKeep: StorageKey[] = []
      
      if (options.keepSettings) {
        keysToKeep.push(STORAGE_KEYS.USER_SETTINGS)
      }
      
      if (options.keepOnboarding) {
        keysToKeep.push(STORAGE_KEYS.ONBOARDING_STATE)
      }

      for (const key of this.getAllKeys()) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      }

      return true

    } catch (error) {
      console.error('Clear all data failed:', error)
      return false
    }
  }

  /**
   * Free up storage space by removing old/large items
   */
  private freeUpSpace(): void {
    try {
      const metadata = this.getStorageMetadata()
      
      // Sort by size (largest first) and age (oldest first)
      metadata.sort((a, b) => {
        if (a.type === 'cache' && b.type !== 'cache') return -1
        if (b.type === 'cache' && a.type !== 'cache') return 1
        return b.size - a.size || a.lastModified.getTime() - b.lastModified.getTime()
      })

      // Remove cache items first, then largest/oldest items
      let freedSpace = 0
      const targetSpace = 1024 * 1024 // 1MB

      for (const item of metadata) {
        if (freedSpace >= targetSpace) break
        
        if (item.type === 'cache' || item.type === 'temporary') {
          localStorage.removeItem(item.key)
          freedSpace += item.size
        }
      }

    } catch (error) {
      console.error('Failed to free up space:', error)
    }
  }

  // Utility methods
  private getStorageType(key: string): 'settings' | 'data' | 'cache' | 'temporary' {
    if (key.includes('settings') || key.includes('onboarding')) return 'settings'
    if (key.includes('cache')) return 'cache'
    if (key.includes('temp')) return 'temporary'
    return 'data'
  }

  private compress(data: string): string {
    // Simple compression simulation (in real app, use a proper compression library)
    return `COMPRESSED:${btoa(data)}`
  }

  private decompress(data: string): string {
    if (data.startsWith('COMPRESSED:')) {
      return atob(data.substring(11))
    }
    return data
  }

  private isCompressed(data: string): boolean {
    return data.startsWith('COMPRESSED:')
  }

  private encrypt(data: string): string {
    // Simple encryption simulation (in real app, use proper encryption)
    return `ENCRYPTED:${btoa(data)}`
  }

  private decrypt(data: string): string {
    if (data.startsWith('ENCRYPTED:')) {
      return atob(data.substring(10))
    }
    return data
  }

  private isEncrypted(data: string): boolean {
    return data.startsWith('ENCRYPTED:')
  }

  private generateChecksum(data: string): string {
    // Simple checksum (in real app, use proper hashing)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }
}

// Export singleton instance
export const localStorageManager = LocalStorageManager.getInstance()

// Export utility functions
export const storage = {
  get: <T>(key: StorageKey, defaultValue?: T) => localStorageManager.getItem(key, defaultValue),
  set: <T>(key: StorageKey, data: T, options?: any) => localStorageManager.setItem(key, data, options),
  remove: (key: StorageKey) => localStorageManager.removeItem(key),
  has: (key: StorageKey) => localStorageManager.hasKey(key),
  clear: (options?: any) => localStorageManager.clearAllData(options),
  export: () => localStorageManager.exportAllData(),
  import: (data: string, options?: any) => localStorageManager.importData(data, options),
  usage: () => localStorageManager.getStorageUsage(),
  metadata: () => localStorageManager.getStorageMetadata()
}