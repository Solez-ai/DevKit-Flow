/**
 * Component usage tracking and favorites management
 */

export interface ComponentUsageStats {
  componentId: string
  usageCount: number
  lastUsed: Date
  averageRating: number
  totalRatings: number
}

export interface ComponentFavorites {
  favorites: string[]
  recentComponents: Array<{
    componentId: string
    timestamp: Date
  }>
  usageStats: Record<string, ComponentUsageStats>
}

const STORAGE_KEY = 'regexr-component-usage'
const MAX_RECENT_COMPONENTS = 20

/**
 * Load component usage data from localStorage
 */
export function loadComponentUsage(): ComponentFavorites {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      // Convert date strings back to Date objects
      data.recentComponents = data.recentComponents.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      
      // Convert usage stats dates
      Object.values(data.usageStats).forEach((stat: any) => {
        stat.lastUsed = new Date(stat.lastUsed)
      })
      
      return data
    }
  } catch (error) {
    console.error('Failed to load component usage data:', error)
  }
  
  return {
    favorites: [],
    recentComponents: [],
    usageStats: {}
  }
}

/**
 * Save component usage data to localStorage
 */
export function saveComponentUsage(data: ComponentFavorites): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save component usage data:', error)
  }
}

/**
 * Add a component to favorites
 */
export function addToFavorites(componentId: string): ComponentFavorites {
  const data = loadComponentUsage()
  
  if (!data.favorites.includes(componentId)) {
    data.favorites.push(componentId)
    saveComponentUsage(data)
  }
  
  return data
}

/**
 * Remove a component from favorites
 */
export function removeFromFavorites(componentId: string): ComponentFavorites {
  const data = loadComponentUsage()
  
  data.favorites = data.favorites.filter(id => id !== componentId)
  saveComponentUsage(data)
  
  return data
}

/**
 * Toggle component favorite status
 */
export function toggleFavorite(componentId: string): ComponentFavorites {
  const data = loadComponentUsage()
  
  if (data.favorites.includes(componentId)) {
    return removeFromFavorites(componentId)
  } else {
    return addToFavorites(componentId)
  }
}

/**
 * Record component usage
 */
export function recordComponentUsage(componentId: string): ComponentFavorites {
  const data = loadComponentUsage()
  const now = new Date()
  
  // Update recent components
  data.recentComponents = data.recentComponents.filter(item => item.componentId !== componentId)
  data.recentComponents.unshift({ componentId, timestamp: now })
  data.recentComponents = data.recentComponents.slice(0, MAX_RECENT_COMPONENTS)
  
  // Update usage stats
  if (!data.usageStats[componentId]) {
    data.usageStats[componentId] = {
      componentId,
      usageCount: 0,
      lastUsed: now,
      averageRating: 0,
      totalRatings: 0
    }
  }
  
  data.usageStats[componentId].usageCount++
  data.usageStats[componentId].lastUsed = now
  
  saveComponentUsage(data)
  return data
}

/**
 * Rate a component
 */
export function rateComponent(componentId: string, rating: number): ComponentFavorites {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  const data = loadComponentUsage()
  
  if (!data.usageStats[componentId]) {
    data.usageStats[componentId] = {
      componentId,
      usageCount: 0,
      lastUsed: new Date(),
      averageRating: 0,
      totalRatings: 0
    }
  }
  
  const stats = data.usageStats[componentId]
  const totalScore = stats.averageRating * stats.totalRatings + rating
  stats.totalRatings++
  stats.averageRating = totalScore / stats.totalRatings
  
  saveComponentUsage(data)
  return data
}

/**
 * Get most used components
 */
export function getMostUsedComponents(limit: number = 10): string[] {
  const data = loadComponentUsage()
  
  return Object.values(data.usageStats)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
    .map(stat => stat.componentId)
}

/**
 * Get recently used components
 */
export function getRecentComponents(limit: number = 10): string[] {
  const data = loadComponentUsage()
  
  return data.recentComponents
    .slice(0, limit)
    .map(item => item.componentId)
}

/**
 * Get favorite components
 */
export function getFavoriteComponents(): string[] {
  const data = loadComponentUsage()
  return [...data.favorites]
}

/**
 * Get component recommendations based on usage patterns
 */
export function getComponentRecommendations(
  currentComponents: string[],
  limit: number = 5
): string[] {
  const data = loadComponentUsage()
  
  // Simple recommendation: suggest components that are often used together
  // This is a basic implementation - could be enhanced with more sophisticated algorithms
  
  const recommendations = new Map<string, number>()
  
  // Score components based on usage frequency and ratings
  Object.values(data.usageStats).forEach(stat => {
    if (!currentComponents.includes(stat.componentId)) {
      let score = stat.usageCount
      
      // Boost score for highly rated components
      if (stat.totalRatings > 0) {
        score *= (stat.averageRating / 5)
      }
      
      // Boost score for recently used components
      const daysSinceLastUse = (Date.now() - stat.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastUse < 7) {
        score *= 1.5
      }
      
      recommendations.set(stat.componentId, score)
    }
  })
  
  return Array.from(recommendations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([componentId]) => componentId)
}

/**
 * Get usage statistics for a component
 */
export function getComponentStats(componentId: string): ComponentUsageStats | null {
  const data = loadComponentUsage()
  return data.usageStats[componentId] || null
}

/**
 * Clear all usage data
 */
export function clearUsageData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Export usage data
 */
export function exportUsageData(): ComponentFavorites {
  return loadComponentUsage()
}

/**
 * Import usage data
 */
export function importUsageData(data: ComponentFavorites): void {
  saveComponentUsage(data)
}