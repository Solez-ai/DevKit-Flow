/**
 * Storage utilities for data persistence
 */

export interface StorageQuota {
  used: number
  quota: number
  percentage: number
}

/**
 * Get storage quota information
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (used / quota) * 100 : 0
      
      return { used, quota, percentage }
    } catch (error) {
      console.warn('Failed to get storage estimate:', error)
    }
  }
  
  // Fallback for browsers without storage API
  return { used: 0, quota: 0, percentage: 0 }
}

/**
 * Clear all application storage
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear IndexedDB if available
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('devkit-flow-storage')
    }
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}

/**
 * Export storage data as JSON string
 */
export function exportStorageData(): string | null {
  try {
    const data: Record<string, any> = {}
    
    // Export localStorage data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('devkit-flow')) {
        data[key] = localStorage.getItem(key)
      }
    }
    
    return JSON.stringify({
      localStorage: data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2)
  } catch (error) {
    console.error('Failed to export storage data:', error)
    return null
  }
}

/**
 * Import storage data from JSON string
 */
export function importStorageData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData)
    
    if (data.localStorage) {
      Object.entries(data.localStorage).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
        }
      })
    }
    
    return true
  } catch (error) {
    console.error('Failed to import storage data:', error)
    return false
  }
}

/**
 * Compress data for storage
 */
export function compressData(data: any): string {
  try {
    const jsonString = JSON.stringify(data)
    // Use simple compression for now, can be enhanced later
    return jsonString
  } catch (error) {
    console.error('Failed to compress data:', error)
    return JSON.stringify(data)
  }
}

/**
 * Decompress data from storage
 */
export function decompressData<T>(compressedData: string): T | null {
  try {
    return JSON.parse(compressedData)
  } catch (error) {
    console.error('Failed to decompress data:', error)
    return null
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage' | 'indexedDB'): boolean {
  try {
    switch (type) {
      case 'localStorage':
        return typeof Storage !== 'undefined' && 'localStorage' in window
      case 'sessionStorage':
        return typeof Storage !== 'undefined' && 'sessionStorage' in window
      case 'indexedDB':
        return 'indexedDB' in window
      default:
        return false
    }
  } catch (error) {
    return false
  }
}