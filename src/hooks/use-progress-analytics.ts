import { useState, useEffect, useCallback } from 'react'
import { progressAnalyticsEngine, type ProgressAnalytics, type ProgressInsight } from '@/lib/progress-analytics'
import { useSessions } from '@/hooks/use-app-store'
import { useTimeline } from '@/hooks/use-timeline'
import type { DevFlowSession } from '@/types'

interface UseProgressAnalyticsOptions {
  sessionId?: string
  refreshInterval?: number
  includeInsights?: boolean
}

interface UseProgressAnalyticsReturn {
  analytics: ProgressAnalytics | null
  insights: ProgressInsight[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  
  // Specific metric getters
  getCompletionRate: () => number
  getVelocity: () => number
  getBlockedNodesCount: () => number
  getEstimatedTimeRemaining: () => number
  getMostProductiveTime: () => string
  getTopBlockingReason: () => string | null
}

export function useProgressAnalytics(options: UseProgressAnalyticsOptions = {}): UseProgressAnalyticsReturn {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null)
  const [insights, setInsights] = useState<ProgressInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { sessions, currentSession } = useSessions()
  const { refresh: refreshTimeline } = useTimeline({ sessionId: options.sessionId })

  const targetSession = options.sessionId 
    ? sessions.find(s => s.id === options.sessionId)
    : currentSession

  const analyzeProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let result: ProgressAnalytics

      if (targetSession) {
        // Analyze single session
        result = progressAnalyticsEngine.analyzeSession(targetSession)
      } else {
        // Analyze all sessions
        result = progressAnalyticsEngine.analyzeMultipleSessions(sessions)
      }

      setAnalytics(result)

      // Generate insights if requested
      if (options.includeInsights !== false) {
        const generatedInsights = progressAnalyticsEngine.generateInsights(result)
        setInsights(generatedInsights)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze progress')
      console.error('Progress analytics error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [targetSession, sessions, options.includeInsights])

  const refresh = useCallback(() => {
    refreshTimeline()
    analyzeProgress()
  }, [refreshTimeline, analyzeProgress])

  // Initial analysis and auto-refresh
  useEffect(() => {
    analyzeProgress()

    if (options.refreshInterval && options.refreshInterval > 0) {
      const interval = setInterval(analyzeProgress, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [analyzeProgress, options.refreshInterval])

  // Re-analyze when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      analyzeProgress()
    }
  }, [sessions, analyzeProgress])

  // Memoized metric getters
  const getCompletionRate = useCallback(() => {
    return analytics?.completionPercentage || 0
  }, [analytics])

  const getVelocity = useCallback(() => {
    return analytics?.completionVelocity || 0
  }, [analytics])

  const getBlockedNodesCount = useCallback(() => {
    return analytics?.blockedNodes || 0
  }, [analytics])

  const getEstimatedTimeRemaining = useCallback(() => {
    return analytics?.estimatedTimeRemaining || 0
  }, [analytics])

  const getMostProductiveTime = useCallback(() => {
    return analytics?.mostProductiveTimeOfDay || 'Unknown'
  }, [analytics])

  const getTopBlockingReason = useCallback(() => {
    return analytics?.commonBlockingReasons?.[0]?.reason || null
  }, [analytics])

  return {
    analytics,
    insights,
    isLoading,
    error,
    refresh,
    getCompletionRate,
    getVelocity,
    getBlockedNodesCount,
    getEstimatedTimeRemaining,
    getMostProductiveTime,
    getTopBlockingReason
  }
}

/**
 * Hook for comparing progress across multiple sessions
 */
export function useProgressComparison(sessionIds: string[]) {
  const [comparisons, setComparisons] = useState<Array<{
    session: DevFlowSession
    analytics: ProgressAnalytics
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { sessions } = useSessions()

  const compareProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const targetSessions = sessions.filter(s => sessionIds.includes(s.id))
      const results = targetSessions.map(session => ({
        session,
        analytics: progressAnalyticsEngine.analyzeSession(session)
      }))

      setComparisons(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare progress')
    } finally {
      setIsLoading(false)
    }
  }, [sessions, sessionIds])

  useEffect(() => {
    if (sessionIds.length > 0) {
      compareProgress()
    }
  }, [compareProgress])

  const getBestPerforming = useCallback((metric: keyof ProgressAnalytics) => {
    if (comparisons.length === 0) return null

    return comparisons.reduce((best, current) => {
      const currentValue = current.analytics[metric] as number
      const bestValue = best.analytics[metric] as number
      return currentValue > bestValue ? current : best
    })
  }, [comparisons])

  const getWorstPerforming = useCallback((metric: keyof ProgressAnalytics) => {
    if (comparisons.length === 0) return null

    return comparisons.reduce((worst, current) => {
      const currentValue = current.analytics[metric] as number
      const worstValue = worst.analytics[metric] as number
      return currentValue < worstValue ? current : worst
    })
  }, [comparisons])

  const getAverageMetric = useCallback((metric: keyof ProgressAnalytics) => {
    if (comparisons.length === 0) return 0

    const sum = comparisons.reduce((total, comparison) => {
      return total + (comparison.analytics[metric] as number || 0)
    }, 0)

    return sum / comparisons.length
  }, [comparisons])

  return {
    comparisons,
    isLoading,
    error,
    refresh: compareProgress,
    getBestPerforming,
    getWorstPerforming,
    getAverageMetric
  }
}

/**
 * Hook for tracking progress trends over time
 */
export function useProgressTrends(sessionId?: string, days: number = 30) {
  const [trends, setTrends] = useState<{
    completion: Array<{ date: string; completed: number; created: number }>
    velocity: Array<{ date: string; velocity: number; movingAverage: number }>
    insights: Array<{ date: string; insight: string; type: 'positive' | 'negative' | 'neutral' }>
  }>({
    completion: [],
    velocity: [],
    insights: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { sessions, currentSession } = useSessions()

  const targetSession = sessionId 
    ? sessions.find(s => s.id === sessionId)
    : currentSession

  const analyzeTrends = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!targetSession) {
        setTrends({ completion: [], velocity: [], insights: [] })
        return
      }

      const analytics = progressAnalyticsEngine.analyzeSession(targetSession)
      
      // Filter trends to the specified number of days
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      const cutoffString = cutoffDate.toISOString().split('T')[0]

      const completion = analytics.completionTrend.filter(t => t.date >= cutoffString)
      const velocity = analytics.velocityTrend.filter(t => t.date >= cutoffString)

      // Generate trend insights
      const insights = completion.map(day => {
        let insight = 'Steady progress'
        let type: 'positive' | 'negative' | 'neutral' = 'neutral'

        if (day.netProgress > 2) {
          insight = 'Excellent progress day'
          type = 'positive'
        } else if (day.netProgress < -1) {
          insight = 'More tasks created than completed'
          type = 'negative'
        } else if (day.completed > 0) {
          insight = 'Good completion rate'
          type = 'positive'
        }

        return { date: day.date, insight, type }
      })

      setTrends({ completion, velocity, insights })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze trends')
    } finally {
      setIsLoading(false)
    }
  }, [targetSession, days])

  useEffect(() => {
    analyzeTrends()
  }, [analyzeTrends])

  const getTrendDirection = useCallback((metric: 'completion' | 'velocity') => {
    const data = trends[metric]
    if (data.length < 2) return 'stable'

    const recent = data.slice(-7) // Last 7 days
    const earlier = data.slice(-14, -7) // Previous 7 days

    if (recent.length === 0 || earlier.length === 0) return 'stable'

    const recentAvg = recent.reduce((sum, d) => {
      if (metric === 'completion') {
        return sum + ('completed' in d ? d.completed : 0)
      } else {
        return sum + ('velocity' in d ? d.velocity : 0)
      }
    }, 0) / recent.length
    
    const earlierAvg = earlier.reduce((sum, d) => {
      if (metric === 'completion') {
        return sum + ('completed' in d ? d.completed : 0)
      } else {
        return sum + ('velocity' in d ? d.velocity : 0)
      }
    }, 0) / earlier.length

    const change = (recentAvg - earlierAvg) / earlierAvg
    
    if (change > 0.1) return 'improving'
    if (change < -0.1) return 'declining'
    return 'stable'
  }, [trends])

  return {
    trends,
    isLoading,
    error,
    refresh: analyzeTrends,
    getTrendDirection
  }
}