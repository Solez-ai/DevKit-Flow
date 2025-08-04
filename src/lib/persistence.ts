/**
 * Data persistence layer with automatic saving
 */

import { storageManager, StorageError } from './storage-manager'
import type { DevFlowSession, RegexPattern, SessionTemplate, UserPreferences } from '@/types'

export interface PersistenceOptions {
  autoSave?: boolean
  saveInterval?: number // in milliseconds
  compress?: boolean
}

export interface PersistenceStats {
  lastSave: Date | null
  saveCount: number
  errorCount: number
  pendingSaves: number
}

class PersistenceManager {
  private options: Required<PersistenceOptions> = {
    autoSave: true,
    saveInterval: 5000, // 5 seconds
    compress: false
  }
  
  private stats: PersistenceStats = {
    lastSave: null,
    saveCount: 0,
    errorCount: 0,
    pendingSaves: 0
  }
  
  private saveQueue = new Map<string, { data: any; timestamp: number }>()
  private saveTimer: ReturnType<typeof setInterval> | null = null
  private initialized = false

  /**
   * Initialize the persistence manager
   */
  async init(options: Partial<PersistenceOptions> = {}): Promise<void> {
    if (this.initialized) return

    this.options = { ...this.options, ...options }
    
    await storageManager.init()
    
    if (this.options.autoSave) {
      this.startAutoSave()
    }
    
    this.initialized = true
  }

  /**
   * Save a session
   */
  async saveSession(session: DevFlowSession): Promise<void> {
    try {
      this.stats.pendingSaves++
      await storageManager.save('sessions', session.id, session, {
        compress: this.options.compress
      })
      this.updateStats(true)
    } catch (error) {
      this.updateStats(false)
      throw new StorageError(
        'Failed to save session',
        'write',
        'sessions',
        error as Error
      )
    } finally {
      this.stats.pendingSaves--
    }
  }

  /**
   * Load a session
   */
  async loadSession(sessionId: string): Promise<DevFlowSession | null> {
    try {
      return await storageManager.load<DevFlowSession>('sessions', sessionId, {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load session',
        'read',
        'sessions',
        error as Error
      )
    }
  }

  /**
   * Load all sessions
   */
  async loadAllSessions(): Promise<DevFlowSession[]> {
    try {
      return await storageManager.loadAll<DevFlowSession>('sessions', {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load all sessions',
        'read',
        'sessions',
        error as Error
      )
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await storageManager.delete('sessions', sessionId)
    } catch (error) {
      throw new StorageError(
        'Failed to delete session',
        'delete',
        'sessions',
        error as Error
      )
    }
  }

  /**
   * Save a pattern
   */
  async savePattern(pattern: RegexPattern): Promise<void> {
    try {
      this.stats.pendingSaves++
      await storageManager.save('patterns', pattern.id, pattern, {
        compress: this.options.compress
      })
      this.updateStats(true)
    } catch (error) {
      this.updateStats(false)
      throw new StorageError(
        'Failed to save pattern',
        'write',
        'patterns',
        error as Error
      )
    } finally {
      this.stats.pendingSaves--
    }
  }

  /**
   * Load a pattern
   */
  async loadPattern(patternId: string): Promise<RegexPattern | null> {
    try {
      return await storageManager.load<RegexPattern>('patterns', patternId, {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load pattern',
        'read',
        'patterns',
        error as Error
      )
    }
  }

  /**
   * Load all patterns
   */
  async loadAllPatterns(): Promise<RegexPattern[]> {
    try {
      return await storageManager.loadAll<RegexPattern>('patterns', {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load all patterns',
        'read',
        'patterns',
        error as Error
      )
    }
  }

  /**
   * Delete a pattern
   */
  async deletePattern(patternId: string): Promise<void> {
    try {
      await storageManager.delete('patterns', patternId)
    } catch (error) {
      throw new StorageError(
        'Failed to delete pattern',
        'delete',
        'patterns',
        error as Error
      )
    }
  }

  /**
   * Save a template
   */
  async saveTemplate(template: SessionTemplate): Promise<void> {
    try {
      this.stats.pendingSaves++
      await storageManager.save('templates', template.id, template, {
        compress: this.options.compress
      })
      this.updateStats(true)
    } catch (error) {
      this.updateStats(false)
      throw new StorageError(
        'Failed to save template',
        'write',
        'templates',
        error as Error
      )
    } finally {
      this.stats.pendingSaves--
    }
  }

  /**
   * Load all templates
   */
  async loadAllTemplates(): Promise<SessionTemplate[]> {
    try {
      return await storageManager.loadAll<SessionTemplate>('templates', {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load all templates',
        'read',
        'templates',
        error as Error
      )
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await storageManager.delete('templates', templateId)
    } catch (error) {
      throw new StorageError(
        'Failed to delete template',
        'delete',
        'templates',
        error as Error
      )
    }
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      this.stats.pendingSaves++
      await storageManager.save('settings', 'preferences', preferences, {
        compress: this.options.compress
      })
      this.updateStats(true)
    } catch (error) {
      this.updateStats(false)
      throw new StorageError(
        'Failed to save preferences',
        'write',
        'settings',
        error as Error
      )
    } finally {
      this.stats.pendingSaves--
    }
  }

  /**
   * Load user preferences
   */
  async loadPreferences(): Promise<UserPreferences | null> {
    try {
      return await storageManager.load<UserPreferences>('settings', 'preferences', {
        compress: this.options.compress
      })
    } catch (error) {
      throw new StorageError(
        'Failed to load preferences',
        'read',
        'settings',
        error as Error
      )
    }
  }

  /**
   * Queue data for batch saving
   */
  queueSave(key: string, data: any): void {
    this.saveQueue.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Process the save queue
   */
  private async processSaveQueue(): Promise<void> {
    if (this.saveQueue.size === 0) return

    const entries = Array.from(this.saveQueue.entries())
    this.saveQueue.clear()

    for (const [key, { data }] of entries) {
      try {
        const [storeName] = key.split(':')
        
        switch (storeName) {
          case 'sessions':
            await this.saveSession(data)
            break
          case 'patterns':
            await this.savePattern(data)
            break
          case 'templates':
            await this.saveTemplate(data)
            break
          case 'preferences':
            await this.savePreferences(data)
            break
        }
      } catch (error) {
        console.error(`Failed to save queued item ${key}:`, error)
      }
    }
  }

  /**
   * Start automatic saving
   */
  private startAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer)
    }

    this.saveTimer = setInterval(() => {
      this.processSaveQueue()
    }, this.options.saveInterval)
  }

  /**
   * Stop automatic saving
   */
  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer)
      this.saveTimer = null
    }
  }

  /**
   * Force save all queued items
   */
  async forceSave(): Promise<void> {
    await this.processSaveQueue()
  }

  /**
   * Update persistence statistics
   */
  private updateStats(success: boolean): void {
    if (success) {
      this.stats.saveCount++
      this.stats.lastSave = new Date()
    } else {
      this.stats.errorCount++
    }
  }

  /**
   * Get persistence statistics
   */
  getStats(): PersistenceStats {
    return { ...this.stats }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        storageManager.clear('sessions'),
        storageManager.clear('patterns'),
        storageManager.clear('templates'),
        storageManager.clear('settings'),
        storageManager.clear('timeline')
      ])
    } catch (error) {
      throw new StorageError(
        'Failed to clear all data',
        'delete',
        'all',
        error as Error
      )
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    return await storageManager.getStats()
  }

  /**
   * Cleanup old data
   */
  async cleanup(options?: { maxTimelineEvents?: number; maxAge?: number }): Promise<void> {
    await storageManager.cleanup(options)
  }

  /**
   * Destroy the persistence manager
   */
  destroy(): void {
    this.stopAutoSave()
    this.saveQueue.clear()
    this.initialized = false
  }
}

// Singleton instance
export const persistenceManager = new PersistenceManager()