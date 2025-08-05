import type { 
  DevFlowSession, 
  DevFlowNode, 
  TimelineEvent
} from '@/types'
import { timelineEventManager } from './timeline-events'

export interface ProgressAnalytics {
  // Basic metrics
  totalNodes: number
  completedNodes: number
  activeNodes: number
  blockedNodes: number
  idleNodes: number
  completionPercentage: number
  
  // Time metrics
  totalTimeSpent: number
  averageTimePerNode: number
  estimatedTimeRemaining: number
  averageSessionLength: number
  
  // Velocity metrics
  completionVelocity: number // nodes completed per day
  todoCompletionRate: number // todos completed per day
  averageNodeCompletionTime: number // average time to complete a node
  
  // Productivity insights
  mostProductiveTimeOfDay: string
  mostProductiveDayOfWeek: string
  longestWorkSession: number
  averageBreakBetweenSessions: number
  
  // Bottleneck analysis
  blockedNodeDetails: Array<{
    node: DevFlowNode
    blockedDuration: number
    blockingReasons: string[]
    dependencies: string[]
  }>
  commonBlockingReasons: Array<{
    reason: string
    frequency: number
    averageDuration: number
  }>
  
  // Pattern recognition
  workPatterns: Array<{
    pattern: string
    frequency: number
    description: string
    recommendation?: string
  }>
  
  // Trends
  completionTrend: Array<{
    date: string
    completed: number
    created: number
    netProgress: number
  }>
  velocityTrend: Array<{
    date: string
    velocity: number
    movingAverage: number
  }>
}

export interface ProgressInsight {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  metric?: number
  recommendation?: string
  actionable?: boolean
}

/**
 * Progress Analytics Engine
 * Analyzes session data and timeline events to provide insights
 */
export class ProgressAnalyticsEngine {
  /**
   * Analyze progress for a single session
   */
  analyzeSession(session: DevFlowSession): ProgressAnalytics {
    const events = timelineEventManager.getSessionEvents(session.id)
    
    const basicMetrics = this.calculateBasicMetrics(session)
    const timeMetrics = this.calculateTimeMetrics(session, events)
    const velocityMetrics = this.calculateVelocityMetrics(session, events)
    const productivityPatterns = this.analyzeProductivityPatterns(events)
    const bottleneckMetrics = this.analyzeBottlenecks(session, events)
    const patterns = this.recognizePatterns(session, events)
    const trends = this.calculateTrends(session, events)

    return {
      totalNodes: basicMetrics.totalNodes || 0,
      completedNodes: basicMetrics.completedNodes || 0,
      activeNodes: basicMetrics.activeNodes || 0,
      blockedNodes: basicMetrics.blockedNodes || 0,
      idleNodes: basicMetrics.idleNodes || 0,
      completionPercentage: basicMetrics.completionPercentage || 0,
      totalTimeSpent: timeMetrics.totalTimeSpent || 0,
      averageTimePerNode: timeMetrics.averageTimePerNode || 0,
      estimatedTimeRemaining: timeMetrics.estimatedTimeRemaining || 0,
      averageSessionLength: timeMetrics.averageSessionLength || 0,
      completionVelocity: velocityMetrics.completionVelocity || 0,
      todoCompletionRate: velocityMetrics.todoCompletionRate || 0,
      averageNodeCompletionTime: timeMetrics.averageNodeCompletionTime || 0,
      mostProductiveTimeOfDay: productivityPatterns.mostProductiveTimeOfDay || 'Unknown',
      mostProductiveDayOfWeek: productivityPatterns.mostProductiveDayOfWeek || 'Unknown',
      longestWorkSession: timeMetrics.longestWorkSession || 0,
      averageBreakBetweenSessions: timeMetrics.averageBreakBetweenSessions || 0,
      blockedNodeDetails: bottleneckMetrics.blockedNodeDetails || [],
      commonBlockingReasons: bottleneckMetrics.commonBlockingReasons || [],
      workPatterns: patterns.workPatterns || [],
      completionTrend: trends.completionTrend || [],
      velocityTrend: trends.velocityTrend || []
    }
  }

  /**
   * Analyze progress across multiple sessions
   */
  analyzeMultipleSessions(sessions: DevFlowSession[]): ProgressAnalytics {
    const allEvents = sessions.flatMap(session => 
      timelineEventManager.getSessionEvents(session.id)
    )

    // Aggregate metrics from all sessions
    const aggregated = sessions.reduce((acc, session) => {
      const sessionAnalytics = this.analyzeSession(session)
      
      return {
        totalNodes: acc.totalNodes + sessionAnalytics.totalNodes,
        completedNodes: acc.completedNodes + sessionAnalytics.completedNodes,
        activeNodes: acc.activeNodes + sessionAnalytics.activeNodes,
        blockedNodes: acc.blockedNodes + sessionAnalytics.blockedNodes,
        idleNodes: acc.idleNodes + sessionAnalytics.idleNodes,
        totalTimeSpent: acc.totalTimeSpent + sessionAnalytics.totalTimeSpent,
        averageSessionLength: (acc.averageSessionLength + sessionAnalytics.averageSessionLength) / 2,
        blockedNodeDetails: [...acc.blockedNodeDetails, ...sessionAnalytics.blockedNodeDetails],
        workPatterns: [...acc.workPatterns, ...sessionAnalytics.workPatterns],
        completionTrend: [...acc.completionTrend, ...sessionAnalytics.completionTrend],
        velocityTrend: [...acc.velocityTrend, ...sessionAnalytics.velocityTrend]
      }
    }, {
      totalNodes: 0,
      completedNodes: 0,
      activeNodes: 0,
      blockedNodes: 0,
      idleNodes: 0,
      totalTimeSpent: 0,
      averageSessionLength: 0,
      blockedNodeDetails: [] as any[],
      workPatterns: [] as any[],
      completionTrend: [] as any[],
      velocityTrend: [] as any[]
    })

    // Calculate derived metrics
    const completionPercentage = aggregated.totalNodes > 0 
      ? (aggregated.completedNodes / aggregated.totalNodes) * 100 
      : 0

    const averageTimePerNode = aggregated.completedNodes > 0 
      ? aggregated.totalTimeSpent / aggregated.completedNodes 
      : 0

    const estimatedTimeRemaining = (aggregated.totalNodes - aggregated.completedNodes) * averageTimePerNode

    // Calculate velocity and productivity metrics
    const velocityMetrics = this.calculateVelocityMetrics(sessions[0], allEvents)
    const productivityMetrics = this.analyzeProductivityPatterns(allEvents)
    const bottleneckMetrics = this.analyzeBottlenecksAcrossSessions(sessions, allEvents)
    const patternMetrics = this.recognizePatternsAcrossSessions(sessions, allEvents)
    const trendMetrics = this.calculateTrendsAcrossSessions(sessions, allEvents)

    return {
      ...aggregated,
      completionPercentage,
      averageTimePerNode,
      estimatedTimeRemaining,
      completionVelocity: velocityMetrics.completionVelocity || 0,
      todoCompletionRate: velocityMetrics.todoCompletionRate || 0,
      averageNodeCompletionTime: velocityMetrics.averageNodeCompletionTime || 0,
      mostProductiveTimeOfDay: productivityMetrics.mostProductiveTimeOfDay || 'Unknown',
      mostProductiveDayOfWeek: productivityMetrics.mostProductiveDayOfWeek || 'Unknown',
      longestWorkSession: productivityMetrics.longestWorkSession || 0,
      averageBreakBetweenSessions: productivityMetrics.averageBreakBetweenSessions || 0,
      commonBlockingReasons: bottleneckMetrics.commonBlockingReasons || [],
      ...patternMetrics,
      ...trendMetrics
    }
  }

  /**
   * Generate actionable insights from analytics
   */
  generateInsights(analytics: ProgressAnalytics): ProgressInsight[] {
    const insights: ProgressInsight[] = []

    // Completion rate insights
    if (analytics.completionPercentage > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Progress',
        description: `You've completed ${analytics.completionPercentage.toFixed(1)}% of your nodes. Keep up the great work!`,
        metric: analytics.completionPercentage
      })
    } else if (analytics.completionPercentage < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Completion Rate',
        description: `Only ${analytics.completionPercentage.toFixed(1)}% of nodes are completed. Consider breaking down large tasks or removing unnecessary ones.`,
        metric: analytics.completionPercentage,
        recommendation: 'Break down large nodes into smaller, manageable tasks',
        actionable: true
      })
    }

    // Blocked nodes insights
    if (analytics.blockedNodes > 0) {
      const blockedPercentage = (analytics.blockedNodes / analytics.totalNodes) * 100
      insights.push({
        type: 'error',
        title: 'Blocked Nodes Detected',
        description: `${analytics.blockedNodes} nodes (${blockedPercentage.toFixed(1)}%) are currently blocked.`,
        metric: analytics.blockedNodes,
        recommendation: 'Review blocked nodes and resolve dependencies or blockers',
        actionable: true
      })
    }

    // Velocity insights
    if (analytics.completionVelocity > 0) {
      const daysToCompletion = (analytics.totalNodes - analytics.completedNodes) / analytics.completionVelocity
      if (daysToCompletion > 30) {
        insights.push({
          type: 'warning',
          title: 'Slow Progress Velocity',
          description: `At current velocity (${analytics.completionVelocity.toFixed(1)} nodes/day), it will take ${daysToCompletion.toFixed(0)} days to complete remaining work.`,
          metric: analytics.completionVelocity,
          recommendation: 'Consider increasing focus time or simplifying complex nodes',
          actionable: true
        })
      } else if (daysToCompletion < 7) {
        insights.push({
          type: 'success',
          title: 'Great Velocity',
          description: `You're on track to complete remaining work in ${daysToCompletion.toFixed(0)} days!`,
          metric: analytics.completionVelocity
        })
      }
    }

    // Time estimation insights
    if (analytics.averageTimePerNode > 0) {
      const hoursRemaining = analytics.estimatedTimeRemaining / (1000 * 60 * 60)
      insights.push({
        type: 'info',
        title: 'Time Estimation',
        description: `Based on your average completion time, you need approximately ${hoursRemaining.toFixed(1)} hours to complete remaining work.`,
        metric: hoursRemaining
      })
    }

    // Productivity pattern insights
    if (analytics.mostProductiveTimeOfDay) {
      insights.push({
        type: 'info',
        title: 'Peak Productivity Time',
        description: `You're most productive during ${analytics.mostProductiveTimeOfDay}. Schedule important tasks during this time.`,
        recommendation: `Block ${analytics.mostProductiveTimeOfDay} for your most challenging work`,
        actionable: true
      })
    }

    // Common blocking reasons
    if (analytics.commonBlockingReasons.length > 0) {
      const topBlocker = analytics.commonBlockingReasons[0]
      insights.push({
        type: 'warning',
        title: 'Common Blocker Identified',
        description: `"${topBlocker.reason}" is your most common blocker, affecting ${topBlocker.frequency} nodes with an average duration of ${(topBlocker.averageDuration / (1000 * 60 * 60)).toFixed(1)} hours.`,
        metric: topBlocker.frequency,
        recommendation: 'Create a strategy to proactively address this common blocker',
        actionable: true
      })
    }

    // Work pattern insights
    analytics.workPatterns.forEach(pattern => {
      if (pattern.recommendation) {
        insights.push({
          type: 'info',
          title: `Pattern: ${pattern.pattern}`,
          description: pattern.description,
          metric: pattern.frequency,
          recommendation: pattern.recommendation,
          actionable: true
        })
      }
    })

    return insights
  }

  /**
   * Calculate basic progress metrics
   */
  private calculateBasicMetrics(session: DevFlowSession): Partial<ProgressAnalytics> {
    const totalNodes = session.nodes.length
    const completedNodes = session.nodes.filter(node => node.status === 'completed').length
    const activeNodes = session.nodes.filter(node => node.status === 'active').length
    const blockedNodes = session.nodes.filter(node => node.status === 'blocked').length
    const idleNodes = session.nodes.filter(node => node.status === 'idle').length
    
    const completionPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

    return {
      totalNodes,
      completedNodes,
      activeNodes,
      blockedNodes,
      idleNodes,
      completionPercentage
    }
  }

  /**
   * Calculate time-related metrics
   */
  private calculateTimeMetrics(session: DevFlowSession, events: TimelineEvent[]): Partial<ProgressAnalytics> {
    // Calculate total time spent from node metadata and timeline events
    const totalTimeSpent = session.nodes.reduce((total, node) => {
      return total + (node.metadata.timeSpent || 0)
    }, 0)

    const completedNodes = session.nodes.filter(node => node.status === 'completed')
    const averageTimePerNode = completedNodes.length > 0 
      ? totalTimeSpent / completedNodes.length 
      : 0

    const remainingNodes = session.nodes.length - completedNodes.length
    const estimatedTimeRemaining = remainingNodes * averageTimePerNode

    // Calculate session length from timeline events
    const sessionEvents = events.filter(e => e.type === 'session_created' || e.type === 'session_updated')
    const sessionStart = sessionEvents.length > 0 ? sessionEvents[sessionEvents.length - 1].timestamp : new Date()
    const sessionEnd = events.length > 0 ? events[0].timestamp : new Date()
    const averageSessionLength = sessionEnd.getTime() - sessionStart.getTime()

    return {
      totalTimeSpent,
      averageTimePerNode,
      estimatedTimeRemaining,
      averageSessionLength: averageSessionLength || 0
    }
  }

  /**
   * Calculate velocity metrics
   */
  private calculateVelocityMetrics(_session: DevFlowSession, events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Calculate completion velocity (nodes completed per day)
    const recentCompletions = events.filter(e => 
      e.type === 'node_completed' && e.timestamp >= weekAgo
    )
    const completionVelocity = recentCompletions.length / 7

    // Calculate todo completion rate
    const recentTodoCompletions = events.filter(e => 
      e.type === 'todo_completed' && e.timestamp >= weekAgo
    )
    const todoCompletionRate = recentTodoCompletions.length / 7

    // Calculate average node completion time
    const completionEvents = events.filter(e => e.type === 'node_completed' && e.duration)
    const averageNodeCompletionTime = completionEvents.length > 0
      ? completionEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / completionEvents.length
      : 0

    return {
      completionVelocity,
      todoCompletionRate,
      averageNodeCompletionTime
    }
  }

  /**
   * Analyze productivity patterns
   */
  private analyzeProductivityPatterns(events: TimelineEvent[]): Partial<ProgressAnalytics> {
    // Analyze time of day patterns
    const hourlyActivity = new Array(24).fill(0)
    events.forEach(event => {
      const hour = event.timestamp.getHours()
      hourlyActivity[hour]++
    })

    const mostActiveHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))
    const mostProductiveTimeOfDay = this.formatTimeOfDay(mostActiveHour)

    // Analyze day of week patterns
    const dailyActivity = new Array(7).fill(0)
    events.forEach(event => {
      const day = event.timestamp.getDay()
      dailyActivity[day]++
    })

    const mostActiveDay = dailyActivity.indexOf(Math.max(...dailyActivity))
    const mostProductiveDayOfWeek = this.formatDayOfWeek(mostActiveDay)

    // Calculate session lengths
    const sessionLengths = this.calculateSessionLengths(events)
    const longestWorkSession = Math.max(...sessionLengths, 0)
    const averageBreakBetweenSessions = this.calculateAverageBreakTime(events)

    return {
      mostProductiveTimeOfDay,
      mostProductiveDayOfWeek,
      longestWorkSession,
      averageBreakBetweenSessions
    }
  }

  /**
   * Analyze bottlenecks and blocked nodes
   */
  private analyzeBottlenecks(session: DevFlowSession, events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const blockedNodeDetails = session.nodes
      .filter(node => node.status === 'blocked')
      .map(node => {
        const blockingEvents = events.filter(e => 
          e.nodeId === node.id && e.type === 'node_status_changed' && 
          e.metadata?.newStatus === 'blocked'
        )
        
        const latestBlockEvent = blockingEvents[0]
        const blockedDuration = latestBlockEvent 
          ? Date.now() - latestBlockEvent.timestamp.getTime()
          : 0

        // Analyze blocking reasons from node content and connections
        const blockingReasons = this.identifyBlockingReasons(node, session)
        const dependencies = this.findNodeDependencies(node, session)

        return {
          node,
          blockedDuration,
          blockingReasons,
          dependencies
        }
      })

    // Analyze common blocking reasons
    const reasonFrequency = new Map<string, { count: number, totalDuration: number }>()
    
    blockedNodeDetails.forEach(detail => {
      detail.blockingReasons.forEach(reason => {
        const current = reasonFrequency.get(reason) || { count: 0, totalDuration: 0 }
        reasonFrequency.set(reason, {
          count: current.count + 1,
          totalDuration: current.totalDuration + detail.blockedDuration
        })
      })
    })

    const commonBlockingReasons = Array.from(reasonFrequency.entries())
      .map(([reason, data]) => ({
        reason,
        frequency: data.count,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)

    return {
      blockedNodeDetails,
      commonBlockingReasons
    }
  }

  /**
   * Recognize work patterns
   */
  private recognizePatterns(_session: DevFlowSession, events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const workPatterns: Array<{
      pattern: string
      frequency: number
      description: string
      recommendation?: string
    }> = []

    // Pattern: Rapid task creation without completion
    const creationEvents = events.filter(e => e.type === 'node_created')
    const completionEvents = events.filter(e => e.type === 'node_completed')
    
    if (creationEvents.length > completionEvents.length * 2) {
      workPatterns.push({
        pattern: 'Task Creation Overload',
        frequency: creationEvents.length - completionEvents.length,
        description: 'You create tasks faster than you complete them, leading to an ever-growing backlog.',
        recommendation: 'Focus on completing existing tasks before creating new ones'
      })
    }

    // Pattern: Long periods without activity
    const inactivityPeriods = this.findInactivityPeriods(events)
    if (inactivityPeriods.length > 0) {
      const avgInactivity = inactivityPeriods.reduce((sum, period) => sum + period, 0) / inactivityPeriods.length
      workPatterns.push({
        pattern: 'Inconsistent Work Schedule',
        frequency: inactivityPeriods.length,
        description: `You have ${inactivityPeriods.length} periods of inactivity averaging ${(avgInactivity / (1000 * 60 * 60)).toFixed(1)} hours.`,
        recommendation: 'Try to maintain more consistent work sessions'
      })
    }

    // Pattern: Frequent status changes without completion
    const statusChangeEvents = events.filter(e => e.type === 'node_status_changed')
    const frequentChangers = this.findNodesWithFrequentStatusChanges(statusChangeEvents)
    
    if (frequentChangers.length > 0) {
      workPatterns.push({
        pattern: 'Status Change Cycling',
        frequency: frequentChangers.length,
        description: `${frequentChangers.length} nodes have frequent status changes without completion.`,
        recommendation: 'Identify why these tasks keep changing status and address root causes'
      })
    }

    return { workPatterns }
  }

  /**
   * Calculate trends over time
   */
  private calculateTrends(_session: DevFlowSession, events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const completionTrend = this.calculateCompletionTrend(events)
    const velocityTrend = this.calculateVelocityTrend(events)

    return {
      completionTrend,
      velocityTrend
    }
  }

  // Helper methods for cross-session analysis
  private analyzeBottlenecksAcrossSessions(sessions: DevFlowSession[], _events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const allBlockedNodes = sessions.flatMap(session => 
      session.nodes.filter(node => node.status === 'blocked')
    )

    const reasonFrequency = new Map<string, { count: number, totalDuration: number }>()
    
    allBlockedNodes.forEach(node => {
      const session = sessions.find(s => s.nodes.includes(node))!
      const blockingReasons = this.identifyBlockingReasons(node, session)
      
      blockingReasons.forEach(reason => {
        const current = reasonFrequency.get(reason) || { count: 0, totalDuration: 0 }
        reasonFrequency.set(reason, {
          count: current.count + 1,
          totalDuration: current.totalDuration + (node.metadata.timeSpent || 0)
        })
      })
    })

    const commonBlockingReasons = Array.from(reasonFrequency.entries())
      .map(([reason, data]) => ({
        reason,
        frequency: data.count,
        averageDuration: data.count > 0 ? data.totalDuration / data.count : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)

    return { commonBlockingReasons }
  }

  private recognizePatternsAcrossSessions(_sessions: DevFlowSession[], _events: TimelineEvent[]): Partial<ProgressAnalytics> {
    // This would implement cross-session pattern recognition
    return { workPatterns: [] }
  }

  private calculateTrendsAcrossSessions(_sessions: DevFlowSession[], events: TimelineEvent[]): Partial<ProgressAnalytics> {
    const completionTrend = this.calculateCompletionTrend(events)
    const velocityTrend = this.calculateVelocityTrend(events)

    return { completionTrend, velocityTrend }
  }

  // Utility helper methods
  private formatTimeOfDay(hour: number): string {
    if (hour < 6) return 'Early Morning (12-6 AM)'
    if (hour < 12) return 'Morning (6 AM-12 PM)'
    if (hour < 18) return 'Afternoon (12-6 PM)'
    return 'Evening (6 PM-12 AM)'
  }

  private formatDayOfWeek(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  private calculateSessionLengths(_events: TimelineEvent[]): number[] {
    // Implementation would calculate work session lengths from timeline events
    return []
  }

  private calculateAverageBreakTime(_events: TimelineEvent[]): number {
    // Implementation would calculate average break time between sessions
    return 0
  }

  private identifyBlockingReasons(node: DevFlowNode, session: DevFlowSession): string[] {
    const reasons: string[] = []
    
    // Check for dependency blocks
    const incomingConnections = session.connections.filter(c => c.targetNodeId === node.id)
    const dependencyBlocks = incomingConnections.filter(c => {
      const sourceNode = session.nodes.find(n => n.id === c.sourceNodeId)
      return sourceNode && sourceNode.status !== 'completed'
    })
    
    if (dependencyBlocks.length > 0) {
      reasons.push('Waiting for dependencies')
    }

    // Check for incomplete todos
    const incompleteTodos = node.content.todos.filter(t => !t.completed)
    if (incompleteTodos.length > 0) {
      reasons.push('Incomplete todos')
    }

    // Check for missing references
    if (node.content.references.length === 0 && node.type !== 'comment') {
      reasons.push('Missing references or documentation')
    }

    return reasons.length > 0 ? reasons : ['Unknown blocking reason']
  }

  private findNodeDependencies(node: DevFlowNode, session: DevFlowSession): string[] {
    return session.connections
      .filter(c => c.targetNodeId === node.id)
      .map(c => {
        const sourceNode = session.nodes.find(n => n.id === c.sourceNodeId)
        return sourceNode ? sourceNode.title : 'Unknown dependency'
      })
  }

  private findInactivityPeriods(_events: TimelineEvent[]): number[] {
    // Implementation would find periods of inactivity
    return []
  }

  private findNodesWithFrequentStatusChanges(statusChangeEvents: TimelineEvent[]): string[] {
    const nodeChangeCounts = new Map<string, number>()
    
    statusChangeEvents.forEach(event => {
      if (event.nodeId) {
        const count = nodeChangeCounts.get(event.nodeId) || 0
        nodeChangeCounts.set(event.nodeId, count + 1)
      }
    })

    return Array.from(nodeChangeCounts.entries())
      .filter(([_, count]) => count > 3) // More than 3 status changes
      .map(([nodeId, _]) => nodeId)
  }

  private calculateCompletionTrend(events: TimelineEvent[]): Array<{
    date: string
    completed: number
    created: number
    netProgress: number
  }> {
    const dailyStats = new Map<string, { completed: number, created: number }>()
    
    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0]
      const stats = dailyStats.get(dateKey) || { completed: 0, created: 0 }
      
      if (event.type === 'node_completed') {
        stats.completed++
      } else if (event.type === 'node_created') {
        stats.created++
      }
      
      dailyStats.set(dateKey, stats)
    })

    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        completed: stats.completed,
        created: stats.created,
        netProgress: stats.completed - stats.created
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculateVelocityTrend(events: TimelineEvent[]): Array<{
    date: string
    velocity: number
    movingAverage: number
  }> {
    const completionTrend = this.calculateCompletionTrend(events)
    
    return completionTrend.map((day, index) => {
      // Calculate 7-day moving average
      const start = Math.max(0, index - 6)
      const window = completionTrend.slice(start, index + 1)
      const movingAverage = window.reduce((sum, d) => sum + d.completed, 0) / window.length
      
      return {
        date: day.date,
        velocity: day.completed,
        movingAverage
      }
    })
  }
}

// Global progress analytics engine instance
export const progressAnalyticsEngine = new ProgressAnalyticsEngine()