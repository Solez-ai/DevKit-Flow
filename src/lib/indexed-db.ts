/**
 * IndexedDB wrapper for offline storage
 */

export interface DBSchema {
  sessions: {
    key: string
    value: any
  }
  patterns: {
    key: string
    value: any
  }
  templates: {
    key: string
    value: any
  }
  settings: {
    key: string
    value: any
  }
  timeline: {
    key: string
    value: any
  }
}

export type StoreName = keyof DBSchema

class IndexedDBManager {
  private dbName = 'devkit-flow-storage'
  private version = 1
  private db: IDBDatabase | null = null

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event: any) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
          sessionStore.createIndex('name', 'name', { unique: false })
          sessionStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
          sessionStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('patterns')) {
          const patternStore = db.createObjectStore('patterns', { keyPath: 'id' })
          patternStore.createIndex('name', 'name', { unique: false })
          patternStore.createIndex('category', 'metadata.category', { unique: false })
          patternStore.createIndex('createdAt', 'metadata.createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('templates')) {
          const templateStore = db.createObjectStore('templates', { keyPath: 'id' })
          templateStore.createIndex('name', 'name', { unique: false })
          templateStore.createIndex('category', 'category', { unique: false })
          templateStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('timeline')) {
          const timelineStore = db.createObjectStore('timeline', { keyPath: 'id' })
          timelineStore.createIndex('timestamp', 'timestamp', { unique: false })
          timelineStore.createIndex('sessionId', 'sessionId', { unique: false })
          timelineStore.createIndex('type', 'type', { unique: false })
        }
      }
    })
  }

  /**
   * Get a single item by key
   */
  async get<T>(storeName: StoreName, key: string): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => {
        reject(new Error(`Failed to get item from ${storeName}`))
      }

      request.onsuccess = () => {
        resolve(request.result || null)
      }
    })
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${storeName}`))
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  /**
   * Save an item to a store
   */
  async put<T>(storeName: StoreName, item: T): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onerror = () => {
        reject(new Error(`Failed to save item to ${storeName}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  /**
   * Delete an item from a store
   */
  async delete(storeName: StoreName, key: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => {
        reject(new Error(`Failed to delete item from ${storeName}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  /**
   * Clear all items from a store
   */
  async clear(storeName: StoreName): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  /**
   * Get items by index
   */
  async getByIndex<T>(
    storeName: StoreName,
    indexName: string,
    value: any
  ): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onerror = () => {
        reject(new Error(`Failed to get items by index from ${storeName}`))
      }

      request.onsuccess = () => {
        resolve(request.result || [])
      }
    })
  }

  /**
   * Count items in a store
   */
  async count(storeName: StoreName): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onerror = () => {
        reject(new Error(`Failed to count items in ${storeName}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }
    })
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * Delete the entire database
   */
  async deleteDatabase(): Promise<void> {
    this.close()

    return new Promise<void>((resolve, reject) => {
      const deleteRequest = window.indexedDB.deleteDatabase(this.dbName)

      deleteRequest.onerror = () => {
        reject(new Error('Failed to delete database'))
      }

      deleteRequest.onsuccess = () => {
        resolve()
      }
    })
  }
}

// Singleton instance
export const indexedDBManager = new IndexedDBManager()