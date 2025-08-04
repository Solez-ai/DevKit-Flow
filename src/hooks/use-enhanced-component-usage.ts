/**
 * Enhanced component usage hook with AI assistance and advanced analytics
 * Extends the basic usage tracking for Task 9.1
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { 
  EnhancedRegexComponent,
  ComponentAnalytics,
  ComponentSearchOptions,
  ComponentSearchResult,
  UsageTrendPoint,
  ComponentCombination,
  ComponentTemplate
} from '../types/enhanced-regex-components'
import type { ComponentCategory } from '../types'
import { 
  enhancedComponentFactory,
  validateEnhancedComponent,
  getComponentImprovementSuggestions
} from '../lib/enhanced-regex-component-factory'
import { 
  getAllEnhancedCategories,
  getEnhancedCategory,
  searchPatternLibrary,
  getPopularPatterns
} from '../lib/enhanced-regex-categories'
import { enhancedValidationEngine } from '../lib/enhanced-regex-validation'

interface EnhancedUsageData {
  components: Map<string, EnhancedRegexComponent>
  analytics: Map<string, ComponentAnalytics>
  favorites: Set<string>
  recentlyUsed: Array<{ componentId: string; timestamp: Date }>
  customComponents: Map<string, EnhancedRegexComponent>
  templates: Map<string, ComponentTemplate>
  searchHistory: string[]
  usagePatterns: ComponentCombination[]
}

const STORAGE_KEY = 'enhanced-component-usage'
const MAX_RECENT_ITEMS = 50
const MAX_SEARCH_HISTORY = 20

/**
 * Enhanced component usage hook
 */
export function useEnhancedComponentUsage() {
  const [usageData, setUsageData] = useState<EnhancedUsageData>(() => loadEnhancedUsageData())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    setUsageData(loadEnhancedUsageData())
  }, [])

  // Save data when it changes
  useEffect(() => {
    saveEnhancedUsageData(usageData)
  }, [usageData])

  /**
   * Record component usage with enhanced analytics
   */
  const recordUsage = useCallback((componentId: string, context?: any) => {
    setUsageData(prev => {
      const newData = { ...prev }
      const now = new Date()

      // Update recent usage
      newData.recentlyUsed = [
        { componentId, timestamp: now },
        ...newData.recentlyUsed.filter(item => item.componentId !== componentId)
      ].slice(0, MAX_RECENT_ITEMS)

      // Update analytics
      const analytics = newData.analytics.get(componentId) || createDefaultAnalytics(componentId)
      analytics.totalUsage++
      analytics.usageTrend.push({
        date: now,
        usage: 1,
        uniqueUsers: 1,
        errors: 0
      })
      
      // Keep only last 30 days of trend data
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      analytics.usageTrend = analytics.usageTrend.filter(point => point.date >= thirtyDaysAgo)
      
      newData.analytics.set(componentId, analytics)

      return newData
    })
  }, [])

  /**
   * Toggle component favorite status
   */
  const toggleFavorite = useCallback((componentId: string) => {
    setUsageData(prev => {
      const newData = { ...prev }
      if (newData.favorites.has(componentId)) {
        newData.favorites.delete(componentId)
      } else {
        newData.favorites.add(componentId)
      }
      return newData
    })
  }, [])

  /**
   * Rate a component
   */
  const rateComponent = useCallback((componentId: string, rating: number) => {
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    setUsageData(prev => {
      const newData = { ...prev }
      const analytics = newData.analytics.get(componentId) || createDefaultAnalytics(componentId)
      
      // Update rating
      const totalScore = analytics.averageRating * analytics.totalRatings + rating
      analytics.totalRatings++
      analytics.averageRating = totalScore / analytics.totalRatings
      
      newData.analytics.set(componentId, analytics)
      return newData
    })

    setError(null)
  }, [])

  /**
   * Create custom component
   */
  const createCustomComponent = useCallback((definition: any) => {
    try {
      const component = enhancedComponentFactory.createComponent(definition)
      
      setUsageData(prev => {
        const newData = { ...prev }
        newData.customComponents.set(component.id, component)
        newData.components.set(component.id, component)
        return newData
      })

      return component
    } catch (error) {
      setError(`Failed to create component: ${error}`)
      return null
    }
  }, [])

  /**
   * Create component from template
   */
  const createFromTemplate = useCallback((templateId: string, parameters?: Record<string, any>) => {
    try {
      const component = enhancedComponentFactory.createFromTemplate(templateId, parameters)
      
      setUsageData(prev => {
        const newData = { ...prev }
        newData.customComponents.set(component.id, component)
        newData.components.set(component.id, component)
        return newData
      })

      recordUsage(component.id, { source: 'template', templateId })
      return component
    } catch (error) {
      setError(`Failed to create component from template: ${error}`)
      return null
    }
  }, [recordUsage])

  /**
   * Search components with enhanced filtering
   */
  const searchComponents = useCallback(async (options: ComponentSearchOptions): Promise<ComponentSearchResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Add to search history
      if (options.query) {
        setUsageData(prev => {
          const newData = { ...prev }
          newData.searchHistory = [
            options.query!,
            ...newData.searchHistory.filter(q => q !== options.query)
          ].slice(0, MAX_SEARCH_HISTORY)
          return newData
        })
      }

      // Perform search (simplified implementation)
      const allComponents = Array.from(usageData.components.values())
      let filteredComponents = allComponents

      // Apply filters
      if (options.query) {
        const query = options.query.toLowerCase()
        filteredComponents = filteredComponents.filter(component =>
          component.name.toLowerCase().includes(query) ||
          component.description.toLowerCase().includes(query) ||
          component.metadata.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }

      if (options.categories && options.categories.length > 0) {
        filteredComponents = filteredComponents.filter(component =>
          options.categories!.includes(component.category)
        )
      }

      if (options.difficulty && options.difficulty.length > 0) {
        filteredComponents = filteredComponents.filter(component =>
          options.difficulty!.includes(component.metadata.difficulty)
        )
      }

      if (options.minRating) {
        filteredComponents = filteredComponents.filter(component =>
          component.metadata.averageRating >= options.minRating!
        )
      }

      if (options.hasTemplates) {
        filteredComponents = filteredComponents.filter(component =>
          component.templates.length > 0
        )
      }

      if (options.isCustom !== undefined) {
        filteredComponents = filteredComponents.filter(component =>
          component.metadata.isCustom === options.isCustom
        )
      }

      // Apply sorting
      if (options.sortBy) {
        filteredComponents.sort((a, b) => {
          let comparison = 0
          switch (options.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'popularity':
              comparison = b.metadata.popularity - a.metadata.popularity
              break
            case 'rating':
              comparison = b.metadata.averageRating - a.metadata.averageRating
              break
            case 'recent':
              comparison = b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
              break
            default:
              comparison = a.name.localeCompare(b.name)
          }
          return options.sortOrder === 'desc' ? -comparison : comparison
        })
      }

      // Apply pagination
      const total = filteredComponents.length
      const offset = options.offset || 0
      const limit = options.limit || 50
      const paginatedComponents = filteredComponents.slice(offset, offset + limit)

      // Generate facets
      const facets = generateSearchFacets(allComponents)

      // Generate suggestions
      const suggestions = generateSearchSuggestions(options.query || '', allComponents)

      return {
        components: paginatedComponents,
        total,
        facets,
        suggestions
      }
    } catch (error) {
      setError(`Search failed: ${error}`)
      return {
        components: [],
        total: 0,
        facets: {
          categories: {},
          difficulties: {},
          tags: {},
          ratings: {}
        },
        suggestions: []
      }
    } finally {
      setIsLoading(false)
    }
  }, [usageData.components])

  /**
   * Get component recommendations
   */
  const getRecommendations = useCallback((
    currentComponents: string[] = [],
    limit: number = 5
  ): EnhancedRegexComponent[] => {
    const analytics = Array.from(usageData.analytics.values())
    
    // Score components based on various factors
    const scores = new Map<string, number>()
    
    for (const analytic of analytics) {
      if (currentComponents.includes(analytic.componentId)) continue
      
      let score = 0
      
      // Usage-based scoring
      score += analytic.totalUsage * 0.3
      score += analytic.averageRating * 0.2
      
      // Recency boost
      const recentUsage = usageData.recentlyUsed.find(item => item.componentId === analytic.componentId)
      if (recentUsage) {
        const daysSince = (Date.now() - recentUsage.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        score += Math.max(0, 10 - daysSince) * 0.1
      }
      
      // Combination boost
      for (const combination of analytic.commonCombinations) {
        if (combination.components.some(id => currentComponents.includes(id))) {
          score += combination.frequency * 0.4
        }
      }
      
      scores.set(analytic.componentId, score)
    }
    
    // Get top recommendations
    const sortedRecommendations = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([componentId]) => usageData.components.get(componentId))
      .filter(Boolean) as EnhancedRegexComponent[]
    
    return sortedRecommendations
  }, [usageData])

  /**
   * Get usage analytics for a component
   */
  const getComponentAnalytics = useCallback((componentId: string): ComponentAnalytics | null => {
    return usageData.analytics.get(componentId) || null
  }, [usageData.analytics])

  /**
   * Get improvement suggestions for a component
   */
  const getImprovementSuggestions = useCallback((componentId: string) => {
    const component = usageData.components.get(componentId)
    if (!component) return []
    
    return getComponentImprovementSuggestions(component)
  }, [usageData.components])

  /**
   * Validate a component
   */
  const validateComponent = useCallback((componentId: string) => {
    const component = usageData.components.get(componentId)
    if (!component) return null
    
    return validateEnhancedComponent(component)
  }, [usageData.components])

  // Computed values
  const favorites = useMemo(() => 
    Array.from(usageData.favorites), 
    [usageData.favorites]
  )

  const recentComponents = useMemo(() => 
    usageData.recentlyUsed.slice(0, 10).map(item => item.componentId),
    [usageData.recentlyUsed]
  )

  const mostUsedComponents = useMemo(() => {
    return Array.from(usageData.analytics.entries())
      .sort((a, b) => b[1].totalUsage - a[1].totalUsage)
      .slice(0, 10)
      .map(([componentId]) => componentId)
  }, [usageData.analytics])

  const customComponents = useMemo(() => 
    Array.from(usageData.customComponents.values()),
    [usageData.customComponents]
  )

  return {
    // Data
    usageData,
    favorites,
    recentComponents,
    mostUsedComponents,
    customComponents,
    
    // State
    isLoading,
    error,
    
    // Actions
    recordUsage,
    toggleFavorite,
    rateComponent,
    createCustomComponent,
    createFromTemplate,
    searchComponents,
    getRecommendations,
    getComponentAnalytics,
    getImprovementSuggestions,
    validateComponent,
    
    // Utilities
    clearError: () => setError(null)
  }
}

/**
 * Load enhanced usage data from storage
 */
function loadEnhancedUsageData(): EnhancedUsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      
      // Convert serialized data back to proper types
      return {
        components: new Map(data.components || []),
        analytics: new Map(data.analytics || []),
        favorites: new Set(data.favorites || []),
        recentlyUsed: (data.recentlyUsed || []).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })),
        customComponents: new Map(data.customComponents || []),
        templates: new Map(data.templates || []),
        searchHistory: data.searchHistory || [],
        usagePatterns: data.usagePatterns || []
      }
    }
  } catch (error) {
    console.error('Failed to load enhanced usage data:', error)
  }
  
  return {
    components: new Map(),
    analytics: new Map(),
    favorites: new Set(),
    recentlyUsed: [],
    customComponents: new Map(),
    templates: new Map(),
    searchHistory: [],
    usagePatterns: []
  }
}

/**
 * Save enhanced usage data to storage
 */
function saveEnhancedUsageData(data: EnhancedUsageData): void {
  try {
    const serializable = {
      components: Array.from(data.components.entries()),
      analytics: Array.from(data.analytics.entries()),
      favorites: Array.from(data.favorites),
      recentlyUsed: data.recentlyUsed,
      customComponents: Array.from(data.customComponents.entries()),
      templates: Array.from(data.templates.entries()),
      searchHistory: data.searchHistory,
      usagePatterns: data.usagePatterns
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (error) {
    console.error('Failed to save enhanced usage data:', error)
  }
}

/**
 * Create default analytics for a component
 */
function createDefaultAnalytics(componentId: string): ComponentAnalytics {
  return {
    componentId,
    totalUsage: 0,
    uniqueUsers: 0,
    averageRating: 0,
    usageTrend: [],
    popularParameters: {},
    commonCombinations: [],
    errorPatterns: [],
    performanceMetrics: {
      averageExecutionTime: 0,
      memoryUsage: 0,
      backtrackingRisk: 'low',
      complexityScore: 0,
      optimizationSuggestions: []
    }
  }
}

/**
 * Generate search facets
 */
function generateSearchFacets(components: EnhancedRegexComponent[]): any {
  const facets = {
    categories: {} as Record<ComponentCategory, number>,
    difficulties: {} as Record<string, number>,
    tags: {} as Record<string, number>,
    ratings: {} as Record<number, number>
  }
  
  for (const component of components) {
    // Categories
    facets.categories[component.category] = (facets.categories[component.category] || 0) + 1
    
    // Difficulties
    facets.difficulties[component.metadata.difficulty] = (facets.difficulties[component.metadata.difficulty] || 0) + 1
    
    // Tags
    for (const tag of component.metadata.tags) {
      facets.tags[tag] = (facets.tags[tag] || 0) + 1
    }
    
    // Ratings
    const rating = Math.floor(component.metadata.averageRating)
    facets.ratings[rating] = (facets.ratings[rating] || 0) + 1
  }
  
  return facets
}

/**
 * Generate search suggestions
 */
function generateSearchSuggestions(query: string, components: EnhancedRegexComponent[]): string[] {
  if (!query) return []
  
  const suggestions = new Set<string>()
  const lowercaseQuery = query.toLowerCase()
  
  for (const component of components) {
    // Add similar component names
    if (component.name.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(component.name)
    }
    
    // Add matching tags
    for (const tag of component.metadata.tags) {
      if (tag.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(tag)
      }
    }
  }
  
  return Array.from(suggestions).slice(0, 5)
}