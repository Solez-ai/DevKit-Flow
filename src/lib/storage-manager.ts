/**
 * Storage manager with IndexedDB primary and localStorage fallback
 */

import { indexedDBManager, type StoreName } from './indexed-db'
import { compressData, decompressData, isStorageAvailable } from './storage'

export interface StorageOptions {
  compress?: boolean
  fallbackToLocalStorage?: boolean
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: 'read' | 'write' | 'delete',
    public readonly store: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

class StorageManager {
  private initialized = false
  private useIndexedDB = false
  private useLocalStorage = false

  /**
   * Initialize the storage manager
   */
  async init(): Promise<void> {
    if (this.initialized) return

    // Try to initialize IndexedDB first
    if (isStorageAvailable('indexedDB')) {
      try {
        await indexedDBManager.init()
        this.useIndexedDB = true
        console.log('IndexedDB initialized successfully')
      } catch (error) {
        console.warn('Failed to initialize IndexedDB, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage
    if (!this.useIndexedDB && isStorageAvailable('localStorage')) {
      this.useLocalStorage = true
      console.log('Using localStorage as storage backend')
    }

    if (!this.useIndexedDB && !this.useLocalStorage) {
      throw new Error('No storage backend available')
    }

    this.initialized = true
  }

  /**
   * Initialize the storage manager (alias for init() for compatibility)
   */
  async initialize(): Promise<void> {
    return this.init()
  }

  /**
   * Save data to storage
   */
  async save<T>(
    storeName: StoreName,
    key: string,
    data: T,
    options: StorageOptions = {}
  ): Promise<void> {
    await this.ensureInitialized()

    const { compress = false, fallbackToLocalStorage = true } = options

    try {
      if (this.useIndexedDB) {
        const item = { id: key, ...data }
        await indexedDBManager.put(storeName, item)
        return
      }
    } catch (error) {
      console.error('IndexedDB save failed:', error)
      
      if (!fallbackToLocalStorage) {
        throw new StorageError(
          'Failed to save to IndexedDB',
          'write',
          storeName,
          error as Error
        )
      }
    }

    // Fallback to localStorage
    if (this.useLocalStorage) {
      try {
        const storageKey = `devkit-flow-${storeName}-${key}`
        const serializedData = compress ? compressData(data) : JSON.stringify(data)
        localStorage.setItem(storageKey, serializedData)
      } catch (error) {
        throw new StorageError(
          'Failed to save to localStorage',
          'write',
          storeName,
          error as Error
        )
      }
    }
  }

  /**
   * Load data from storage
   */
  async load<T>(
    storeName: StoreName,
    key: string,
    options: StorageOptions = {}
  ): Promise<T | null> {
    await this.ensureInitialized()

    const { compress = false, fallbackToLocalStorage = true } = options

    try {
      if (this.useIndexedDB) {
        const result = await indexedDBManager.get<T & { id: string }>(storeName, key)
        if (result) {
          const { id, ...data } = result
          return data as T
        }
      }
    } catch (error) {
      console.error('IndexedDB load failed:', error)
      
      if (!fallbackToLocalStorage) {
        throw new StorageError(
          'Failed to load from IndexedDB',
          'read',
          storeName,
          error as Error
        )
      }
    }

    // Fallback to localStorage
    if (this.useLocalStorage) {
      try {
        const storageKey = `devkit-flow-${storeName}-${key}`
        const serializedData = localStorage.getItem(storageKey)
        
        if (serializedData) {
          return compress 
            ? decompressData<T>(serializedData)
            : JSON.parse(serializedData)
        }
      } catch (error) {
        throw new StorageError(
          'Failed to load from localStorage',
          'read',
          storeName,
          error as Error
        )
      }
    }

    return null
  }

  /**
   * Load all data from a store
   */
  async loadAll<T>(
    storeName: StoreName,
    options: StorageOptions = {}
  ): Promise<T[]> {
    await this.ensureInitialized()

    const { compress = false, fallbackToLocalStorage = true } = options

    try {
      if (this.useIndexedDB) {
        const results = await indexedDBManager.getAll<T & { id: string }>(storeName)
        return results.map(result => {
          const { id, ...data } = result
          return data as T
        })
      }
    } catch (error) {
      console.error('IndexedDB loadAll failed:', error)
      
      if (!fallbackToLocalStorage) {
        throw new StorageError(
          'Failed to load all from IndexedDB',
          'read',
          storeName,
          error as Error
        )
      }
    }

    // Fallback to localStorage
    if (this.useLocalStorage) {
      try {
        const prefix = `devkit-flow-${storeName}-`
        const items: T[] = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            const serializedData = localStorage.getItem(key)
            if (serializedData) {
              const data = compress 
                ? decompressData<T>(serializedData)
                : JSON.parse(serializedData)
              if (data) {
                items.push(data)
              }
            }
          }
        }
        
        return items
      } catch (error) {
        throw new StorageError(
          'Failed to load all from localStorage',
          'read',
          storeName,
          error as Error
        )
      }
    }

    return []
  }

  /**
   * Delete data from storage
   */
  async delete(
    storeName: StoreName,
    key: string,
    options: StorageOptions = {}
  ): Promise<void> {
    await this.ensureInitialized()

    const { fallbackToLocalStorage = true } = options

    try {
      if (this.useIndexedDB) {
        await indexedDBManager.delete(storeName, key)
        return
      }
    } catch (error) {
      console.error('IndexedDB delete failed:', error)
      
      if (!fallbackToLocalStorage) {
        throw new StorageError(
          'Failed to delete from IndexedDB',
          'delete',
          storeName,
          error as Error
        )
      }
    }

    // Fallback to localStorage
    if (this.useLocalStorage) {
      try {
        const storageKey = `devkit-flow-${storeName}-${key}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        throw new StorageError(
          'Failed to delete from localStorage',
          'delete',
          storeName,
          error as Error
        )
      }
    }
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName: StoreName, options: StorageOptions = {}): Promise<void> {
    await this.ensureInitialized()

    const { fallbackToLocalStorage = true } = options

    try {
      if (this.useIndexedDB) {
        await indexedDBManager.clear(storeName)
        return
      }
    } catch (error) {
      console.error('IndexedDB clear failed:', error)
      
      if (!fallbackToLocalStorage) {
        throw new StorageError(
          'Failed to clear IndexedDB store',
          'delete',
          storeName,
          error as Error
        )
      }
    }

    // Fallback to localStorage
    if (this.useLocalStorage) {
      try {
        const prefix = `devkit-flow-${storeName}-`
        const keysToRemove: string[] = []
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        throw new StorageError(
          'Failed to clear localStorage store',
          'delete',
          storeName,
          error as Error
        )
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    backend: 'indexedDB' | 'localStorage' | 'none'
    itemCounts: Record<StoreName, number>
    totalSize: number
  }> {
    await this.ensureInitialized()

    const backend = this.useIndexedDB ? 'indexedDB' : this.useLocalStorage ? 'localStorage' : 'none'
    const itemCounts: Record<StoreName, number> = {
      sessions: 0,
      patterns: 0,
      templates: 0,
      settings: 0,
      timeline: 0
    }

    let totalSize = 0

    try {
      if (this.useIndexedDB) {
        for (const storeName of Object.keys(itemCounts) as StoreName[]) {
          itemCounts[storeName] = await indexedDBManager.count(storeName)
        }
      } else if (this.useLocalStorage) {
        for (const storeName of Object.keys(itemCounts) as StoreName[]) {
          const prefix = `devkit-flow-${storeName}-`
          let count = 0
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(prefix)) {
              count++
              const value = localStorage.getItem(key)
              if (value) {
                totalSize += new Blob([value]).size
              }
            }
          }
          
          itemCounts[storeName] = count
        }
      }
    } catch (error) {
      console.error('Failed to get storage stats:', error)
    }

    return { backend, itemCounts, totalSize }
  }

  /**
   * Cleanup old data
   */
  async cleanup(options: {
    maxTimelineEvents?: number
    maxAge?: number // in milliseconds
  } = {}): Promise<void> {
    await this.ensureInitialized()

    const { maxTimelineEvents = 1000, maxAge = 30 * 24 * 60 * 60 * 1000 } = options // 30 days default

    try {
      // Cleanup timeline events
      if (this.useIndexedDB) {
        const timelineEvents = await indexedDBManager.getAll<any>('timeline')
        
        // Sort by timestamp and keep only the most recent events
        const sortedEvents = timelineEvents.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        
        if (sortedEvents.length > maxTimelineEvents) {
          const eventsToDelete = sortedEvents.slice(maxTimelineEvents)
          for (const event of eventsToDelete) {
            await indexedDBManager.delete('timeline', event.id)
          }
        }
        
        // Delete old events
        const cutoffDate = new Date(Date.now() - maxAge)
        const oldEvents = timelineEvents.filter(event => 
          new Date(event.timestamp) < cutoffDate
        )
        
        for (const event of oldEvents) {
          await indexedDBManager.delete('timeline', event.id)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup storage:', error)
    }
  }

  /**
   * Ensure storage is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }

  /**
   * Get storage backend info
   */
  getBackendInfo(): {
    backend: 'indexedDB' | 'localStorage' | 'none'
    initialized: boolean
  } {
    return {
      backend: this.useIndexedDB ? 'indexedDB' : this.useLocalStorage ? 'localStorage' : 'none',
      initialized: this.initialized
    }
  }
}

// Singleton instance
export const storageManager = new StorageManager()