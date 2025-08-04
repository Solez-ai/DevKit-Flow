import { useState, useCallback, useMemo } from 'react'
import type { 
  DevFlowNode, 
  DevFlowSession,
  ComplexityEstimate,
  ComplexityAnalysis,
  ComplexityHeatmapData,
  ComplexitySettings,
  ComplexityLevel
} from '@/types'
import { complexityEstimationEngine } from '@/lib/complexity-estimation'

export interface UseComplexityEstimationReturn {
  // Estimation functions
  estimateNodeComplexity: (node: DevFlowNode, session: DevFlowSession) => ComplexityEstimate
  updateNodeComplexity: (node: DevFlowNode, updates: Partial<ComplexityEstimate>) => ComplexityEstimate
  
  // Analysis functions
  analyzeSessionComplexity: (session: DevFlowSession) => ComplexityAnalysis
  generateHeatmapData: (session: DevFlowSession) => ComplexityHeatmapData[]
  
  // Settings
  settings: ComplexitySettings
  updateSettings: (newSettings: Partial<ComplexitySettings>) => void
  
  // State
  isEstimating: boolean
  lastAnalysis: ComplexityAnalysis | null
  
  // Utilities
  getComplexityColor: (storyPoints: ComplexityLevel) => string
  getComplexityLabel: (storyPoints: ComplexityLevel) => string
  formatEstimationTime: (hours: number) => string
}

/**
 * Hook for complexity estimation functionality
 */
export function useComplexityEstimation(): UseComplexityEstimationReturn {
  const [isEstimating, setIsEstimating] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<ComplexityAnalysis | null>(null)
  const [settings, setSettings] = useState<ComplexitySettings>(
    complexityEstimationEngine.getSettings()
  )

  /**
   * Estimate complexity for a node
   */
  const estimateNodeComplexity = useCallback((
    node: DevFlowNode, 
    session: DevFlowSession
  ): ComplexityEstimate => {
    setIsEstimating(true)
    try {
      const method = settings.enableAIAssistance ? 'ai-assisted' : 'automatic'
      return complexityEstimationEngine.estimateNodeComplexity(node, session, method)
    } finally {
      setIsEstimating(false)
    }
  }, [settings.enableAIAssistance])

  /**
   * Update node complexity
   */
  const updateNodeComplexity = useCallback((
    node: DevFlowNode,
    updates: Partial<ComplexityEstimate>
  ): ComplexityEstimate => {
    return complexityEstimationEngine.updateNodeComplexity(node, updates)
  }, [])

  /**
   * Analyze session complexity
   */
  const analyzeSessionComplexity = useCallback((session: DevFlowSession): ComplexityAnalysis => {
    setIsEstimating(true)
    try {
      const analysis = complexityEstimationEngine.analyzeSessionComplexity(session)
      setLastAnalysis(analysis)
      return analysis
    } finally {
      setIsEstimating(false)
    }
  }, [])

  /**
   * Generate heatmap data
   */
  const generateHeatmapData = useCallback((session: DevFlowSession): ComplexityHeatmapData[] => {
    return complexityEstimationEngine.generateComplexityHeatmap(session)
  }, [])

  /**
   * Update settings
   */
  const updateSettings = useCallback((newSettings: Partial<ComplexitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    complexityEstimationEngine.updateSettings(newSettings)
  }, [settings])

  /**
   * Get color for complexity level
   */
  const getComplexityColor = useCallback((storyPoints: ComplexityLevel): string => {
    const colors = {
      1: '#22c55e', // Green - Simple
      2: '#84cc16', // Light Green - Easy
      3: '#eab308', // Yellow - Moderate
      4: '#f97316', // Orange - Complex
      5: '#ef4444'  // Red - Very Complex
    }
    
    return colors[storyPoints]
  }, [])

  /**
   * Get label for complexity level
   */
  const getComplexityLabel = useCallback((storyPoints: ComplexityLevel): string => {
    const labels = {
      1: 'Simple',
      2: 'Easy',
      3: 'Moderate',
      4: 'Complex',
      5: 'Very Complex'
    }
    
    return labels[storyPoints]
  }, [])

  /**
   * Format estimation time
   */
  const formatEstimationTime = useCallback((hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    } else if (hours < 8) {
      return `${hours.toFixed(1)}h`
    } else {
      const days = Math.floor(hours / 8)
      const remainingHours = hours % 8
      if (remainingHours === 0) {
        return `${days}d`
      } else {
        return `${days}d ${remainingHours.toFixed(1)}h`
      }
    }
  }, [])

  return {
    estimateNodeComplexity,
    updateNodeComplexity,
    analyzeSessionComplexity,
    generateHeatmapData,
    settings,
    updateSettings,
    isEstimating,
    lastAnalysis,
    getComplexityColor,
    getComplexityLabel,
    formatEstimationTime
  }
}

/**
 * Hook for complexity analysis with automatic updates
 */
export function useComplexityAnalysis(session: DevFlowSession | null) {
  const { analyzeSessionComplexity, isEstimating } = useComplexityEstimation()
  
  const analysis = useMemo(() => {
    if (!session) return null
    return analyzeSessionComplexity(session)
  }, [session, analyzeSessionComplexity])

  return {
    analysis,
    isAnalyzing: isEstimating
  }
}

/**
 * Hook for complexity heatmap data
 */
export function useComplexityHeatmap(session: DevFlowSession | null) {
  const { generateHeatmapData, settings } = useComplexityEstimation()
  
  const heatmapData = useMemo(() => {
    if (!session || !settings.showHeatmap) return []
    return generateHeatmapData(session)
  }, [session, generateHeatmapData, settings.showHeatmap])

  return {
    heatmapData,
    isVisible: settings.showHeatmap,
    opacity: settings.heatmapOpacity
  }
}