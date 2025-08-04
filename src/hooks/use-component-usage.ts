import { useState, useEffect, useCallback } from 'react'
import type { ComponentFavorites } from '../lib/regex-component-usage'
import {
  loadComponentUsage,
  toggleFavorite,
  recordComponentUsage,
  rateComponent,
  getMostUsedComponents,
  getRecentComponents,
  getFavoriteComponents,
  getComponentRecommendations
} from '../lib/regex-component-usage'

/**
 * Hook for managing component usage, favorites, and recommendations
 */
export function useComponentUsage() {
  const [usageData, setUsageData] = useState<ComponentFavorites>(() => loadComponentUsage())

  // Reload usage data when component mounts
  useEffect(() => {
    setUsageData(loadComponentUsage())
  }, [])

  const handleToggleFavorite = useCallback((componentId: string) => {
    const newData = toggleFavorite(componentId)
    setUsageData(newData)
  }, [])

  const handleRecordUsage = useCallback((componentId: string) => {
    const newData = recordComponentUsage(componentId)
    setUsageData(newData)
  }, [])

  const handleRateComponent = useCallback((componentId: string, rating: number) => {
    try {
      const newData = rateComponent(componentId, rating)
      setUsageData(newData)
    } catch (error) {
      console.error('Failed to rate component:', error)
    }
  }, [])

  const favorites = getFavoriteComponents()
  const recentComponents = getRecentComponents()
  const mostUsedComponents = getMostUsedComponents()

  const getRecommendations = useCallback((currentComponents: string[], limit?: number) => {
    return getComponentRecommendations(currentComponents, limit)
  }, [])

  return {
    usageData,
    favorites,
    recentComponents,
    mostUsedComponents,
    toggleFavorite: handleToggleFavorite,
    recordUsage: handleRecordUsage,
    rateComponent: handleRateComponent,
    getRecommendations
  }
}