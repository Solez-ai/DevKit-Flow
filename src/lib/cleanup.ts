/**
 * Storage cleanup utilities
 */

import { storageManager } from './storage-manager'
import type { DevFlowSession, RegexPattern, SessionTemplate } from '@/types'

export interface CleanupOptions {
  maxAge?: number // in milliseconds
  maxItems?: number
  keepRecent?: number
  dryRun?: boolean
}

export interface CleanupResult {
  itemsRemoved: number
  spaceFreed: number
  errors: string[]
}

export class StorageCleanup {
  /**
   * Clean up old sessions
   */
  static async cleanupSessions(options: CleanupOptions = {}): Promise<CleanupResult> {
    const {
      maxAge = 90 * 24 * 60 * 60 * 1000, // 90 days
      maxItems = 100,
      keepRecent = 10,
      dryRun = false
    } = options

    const result: CleanupResult = {
      itemsRemoved: 0,
      spaceFreed: 0,
      errors: []
    }

    try {
      const sessions = await storageManager.loadAll<DevFlowSession>('sessions')
      
      // Sort by last updated date
      const sortedSessions = sessions.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      )

      const cutoffDate = new Date(Date.now() - maxAge)
      const sessionsToRemove: DevFlowSession[] = []

      // Remove old sessions
      for (const session of sortedSessions) {
        if (new Date(session.metadata.updatedAt) < cutoffDate) {
          sessionsToRemove.push(session)
        }
      }

      // Remove excess sessions (keep only maxItems, but always keep keepRecent)
      if (sortedSessions.length > maxItems) {
        const excessSessions = sortedSessions.slice(Math.max(keepRecent, maxItems))
        sessionsToRemove.push(...excessSessions)
      }

      // Remove duplicates
      const uniqueSessionsToRemove = Array.from(
        new Map(sessionsToRemove.map(s => [s.id, s])).values()
      )

      if (!dryRun) {
        for (const session of uniqueSessionsToRemove) {
          try {
            await storageManager.delete('sessions', session.id)
            result.itemsRemoved++
            result.spaceFreed += this.estimateSize(session)
          } catch (error) {
            result.errors.push(`Failed to delete session ${session.id}: ${error}`)
          }
        }
      } else {
        result.itemsRemoved = uniqueSessionsToRemove.length
        result.spaceFreed = uniqueSessionsToRemove.reduce(
          (total, session) => total + this.estimateSize(session),
          0
        )
      }

    } catch (error) {
      result.errors.push(`Failed to cleanup sessions: ${error}`)
    }

    return result
  }

  /**
   * Clean up old patterns
   */
  static async cleanupPatterns(options: CleanupOptions = {}): Promise<CleanupResult> {
    const {
      maxAge = 60 * 24 * 60 * 60 * 1000, // 60 days
      maxItems = 200,
      keepRecent = 20,
      dryRun = false
    } = options

    const result: CleanupResult = {
      itemsRemoved: 0,
      spaceFreed: 0,
      errors: []
    }

    try {
      const patterns = await storageManager.loadAll<RegexPattern>('patterns')
      
      // Sort by last updated date
      const sortedPatterns = patterns.sort((a, b) => 
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      )

      const cutoffDate = new Date(Date.now() - maxAge)
      const patternsToRemove: RegexPattern[] = []

      // Remove old patterns
      for (const pattern of sortedPatterns) {
        if (new Date(pattern.metadata.updatedAt) < cutoffDate) {
          patternsToRemove.push(pattern)
        }
      }

      // Remove excess patterns
      if (sortedPatterns.length > maxItems) {
        const excessPatterns = sortedPatterns.slice(Math.max(keepRecent, maxItems))
        patternsToRemove.push(...excessPatterns)
      }

      // Remove duplicates
      const uniquePatternsToRemove = Array.from(
        new Map(patternsToRemove.map(p => [p.id, p])).values()
      )

      if (!dryRun) {
        for (const pattern of uniquePatternsToRemove) {
          try {
            await storageManager.delete('patterns', pattern.id)
            result.itemsRemoved++
            result.spaceFreed += this.estimateSize(pattern)
          } catch (error) {
            result.errors.push(`Failed to delete pattern ${pattern.id}: ${error}`)
          }
        }
      } else {
        result.itemsRemoved = uniquePatternsToRemove.length
        result.spaceFreed = uniquePatternsToRemove.reduce(
          (total, pattern) => total + this.estimateSize(pattern),
          0
        )
      }

    } catch (error) {
      result.errors.push(`Failed to cleanup patterns: ${error}`)
    }

    return result
  }

  /**
   * Clean up unused templates
   */
  static async cleanupTemplates(options: CleanupOptions = {}): Promise<CleanupResult> {
    const {
      maxAge = 180 * 24 * 60 * 60 * 1000, // 180 days
      dryRun = false
    } = options

    const result: CleanupResult = {
      itemsRemoved: 0,
      spaceFreed: 0,
      errors: []
    }

    try {
      const templates = await storageManager.loadAll<SessionTemplate>('templates')
      const cutoffDate = new Date(Date.now() - maxAge)
      
      const templatesToRemove = templates.filter(template => 
        template.usageCount === 0 && 
        new Date(template.updatedAt) < cutoffDate &&
        template.author !== 'DevKit Flow' // Keep default templates
      )

      if (!dryRun) {
        for (const template of templatesToRemove) {
          try {
            await storageManager.delete('templates', template.id)
            result.itemsRemoved++
            result.spaceFreed += this.estimateSize(template)
          } catch (error) {
            result.errors.push(`Failed to delete template ${template.id}: ${error}`)
          }
        }
      } else {
        result.itemsRemoved = templatesToRemove.length
        result.spaceFreed = templatesToRemove.reduce(
          (total, template) => total + this.estimateSize(template),
          0
        )
      }

    } catch (error) {
      result.errors.push(`Failed to cleanup templates: ${error}`)
    }

    return result
  }

  /**
   * Clean up timeline events
   */
  static async cleanupTimeline(options: CleanupOptions = {}): Promise<CleanupResult> {
    const {
      maxAge = 30 * 24 * 60 * 60 * 1000, // 30 days
      maxItems = 1000,
      keepRecent = 100,
      dryRun = false
    } = options

    const result: CleanupResult = {
      itemsRemoved: 0,
      spaceFreed: 0,
      errors: []
    }

    try {
      const timelineEvents = await storageManager.loadAll<any>('timeline')
      
      // Sort by timestamp
      const sortedEvents = timelineEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      const cutoffDate = new Date(Date.now() - maxAge)
      const eventsToRemove: any[] = []

      // Remove old events
      for (const event of sortedEvents) {
        if (new Date(event.timestamp) < cutoffDate) {
          eventsToRemove.push(event)
        }
      }

      // Remove excess events
      if (sortedEvents.length > maxItems) {
        const excessEvents = sortedEvents.slice(Math.max(keepRecent, maxItems))
        eventsToRemove.push(...excessEvents)
      }

      // Remove duplicates
      const uniqueEventsToRemove = Array.from(
        new Map(eventsToRemove.map(e => [e.id, e])).values()
      )

      if (!dryRun) {
        for (const event of uniqueEventsToRemove) {
          try {
            await storageManager.delete('timeline', event.id)
            result.itemsRemoved++
            result.spaceFreed += this.estimateSize(event)
          } catch (error) {
            result.errors.push(`Failed to delete timeline event ${event.id}: ${error}`)
          }
        }
      } else {
        result.itemsRemoved = uniqueEventsToRemove.length
        result.spaceFreed = uniqueEventsToRemove.reduce(
          (total, event) => total + this.estimateSize(event),
          0
        )
      }

    } catch (error) {
      result.errors.push(`Failed to cleanup timeline: ${error}`)
    }

    return result
  }

  /**
   * Run comprehensive cleanup
   */
  static async runFullCleanup(options: CleanupOptions = {}): Promise<{
    sessions: CleanupResult
    patterns: CleanupResult
    templates: CleanupResult
    timeline: CleanupResult
    total: {
      itemsRemoved: number
      spaceFreed: number
      errors: string[]
    }
  }> {
    const [sessions, patterns, templates, timeline] = await Promise.all([
      this.cleanupSessions(options),
      this.cleanupPatterns(options),
      this.cleanupTemplates(options),
      this.cleanupTimeline(options)
    ])

    const total = {
      itemsRemoved: sessions.itemsRemoved + patterns.itemsRemoved + templates.itemsRemoved + timeline.itemsRemoved,
      spaceFreed: sessions.spaceFreed + patterns.spaceFreed + templates.spaceFreed + timeline.spaceFreed,
      errors: [...sessions.errors, ...patterns.errors, ...templates.errors, ...timeline.errors]
    }

    return { sessions, patterns, templates, timeline, total }
  }

  /**
   * Estimate the size of an object in bytes
   */
  private static estimateSize(obj: any): number {
    try {
      return new Blob([JSON.stringify(obj)]).size
    } catch {
      return 0
    }
  }

  /**
   * Get cleanup recommendations
   */
  static async getCleanupRecommendations(): Promise<{
    sessions: { count: number; oldCount: number; excessCount: number }
    patterns: { count: number; oldCount: number; excessCount: number }
    templates: { count: number; unusedCount: number }
    timeline: { count: number; oldCount: number; excessCount: number }
    totalSpaceUsed: number
  }> {
    try {
      const [sessions, patterns, templates, timelineEvents] = await Promise.all([
        storageManager.loadAll<DevFlowSession>('sessions'),
        storageManager.loadAll<RegexPattern>('patterns'),
        storageManager.loadAll<SessionTemplate>('templates'),
        storageManager.loadAll<any>('timeline')
      ])

      const now = Date.now()
      const sessionCutoff = now - (90 * 24 * 60 * 60 * 1000) // 90 days
      const patternCutoff = now - (60 * 24 * 60 * 60 * 1000) // 60 days
      const templateCutoff = now - (180 * 24 * 60 * 60 * 1000) // 180 days
      const timelineCutoff = now - (30 * 24 * 60 * 60 * 1000) // 30 days

      const oldSessions = sessions.filter(s => 
        new Date(s.metadata.updatedAt).getTime() < sessionCutoff
      ).length

      const oldPatterns = patterns.filter(p => 
        new Date(p.metadata.updatedAt).getTime() < patternCutoff
      ).length

      const unusedTemplates = templates.filter(t => 
        t.usageCount === 0 && 
        new Date(t.updatedAt).getTime() < templateCutoff &&
        t.author !== 'DevKit Flow'
      ).length

      const oldTimelineEvents = timelineEvents.filter(e => 
        new Date(e.timestamp).getTime() < timelineCutoff
      ).length

      const totalSpaceUsed = [
        ...sessions,
        ...patterns,
        ...templates,
        ...timelineEvents
      ].reduce((total, item) => total + this.estimateSize(item), 0)

      return {
        sessions: {
          count: sessions.length,
          oldCount: oldSessions,
          excessCount: Math.max(0, sessions.length - 100)
        },
        patterns: {
          count: patterns.length,
          oldCount: oldPatterns,
          excessCount: Math.max(0, patterns.length - 200)
        },
        templates: {
          count: templates.length,
          unusedCount: unusedTemplates
        },
        timeline: {
          count: timelineEvents.length,
          oldCount: oldTimelineEvents,
          excessCount: Math.max(0, timelineEvents.length - 1000)
        },
        totalSpaceUsed
      }
    } catch (error) {
      console.error('Failed to get cleanup recommendations:', error)
      return {
        sessions: { count: 0, oldCount: 0, excessCount: 0 },
        patterns: { count: 0, oldCount: 0, excessCount: 0 },
        templates: { count: 0, unusedCount: 0 },
        timeline: { count: 0, oldCount: 0, excessCount: 0 },
        totalSpaceUsed: 0
      }
    }
  }
}