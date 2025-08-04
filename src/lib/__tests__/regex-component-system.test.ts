import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  allRegexComponents, 
  getComponentsByCategory, 
  searchComponents,
  componentCategories 
} from '../regex-components'
import { 
  createPlacedComponent, 
  updatePlacedComponentParameters,
  generatePatternFromComponents,
  sortPlacedComponentsByPosition
} from '../regex-component-factory'
import { 
  getPresetsForComponent, 
  getPresetById,
  searchPresets,
  getPopularPresets
} from '../regex-parameter-presets'
import {
  loadComponentUsage,
  toggleFavorite,
  recordComponentUsage,
  clearUsageData
} from '../regex-component-usage'

describe('Regex Component System Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearUsageData()
  })

  afterEach(() => {
    // Clean up after each test
    clearUsageData()
  })

  describe('Component Library', () => {
    it('should have components in all categories', () => {
      const categories = Object.keys(componentCategories)
      
      for (const category of categories) {
        const components = getComponentsByCategory(category as any)
        expect(components.length).toBeGreaterThan(0)
      }
    })

    it('should have consistent component structure', () => {
      for (const component of allRegexComponents) {
        expect(component).toHaveProperty('id')
        expect(component).toHaveProperty('name')
        expect(component).toHaveProperty('description')
        expect(component).toHaveProperty('category')
        expect(component).toHaveProperty('regexPattern')
        expect(component).toHaveProperty('visualRepresentation')
        expect(component).toHaveProperty('examples')
        expect(component).toHaveProperty('commonUses')
        
        expect(typeof component.id).toBe('string')
        expect(typeof component.name).toBe('string')
        expect(typeof component.description).toBe('string')
        expect(Array.isArray(component.examples)).toBe(true)
        expect(Array.isArray(component.commonUses)).toBe(true)
      }
    })

    it('should search components correctly', () => {
      const emailResults = searchComponents('email')
      expect(emailResults.length).toBeGreaterThan(0)
      expect(emailResults.some(c => c.commonUses.some(use => use.toLowerCase().includes('email')))).toBe(true)

      const digitResults = searchComponents('digit')
      expect(digitResults.length).toBeGreaterThan(0)
      expect(digitResults.some(c => c.name.toLowerCase().includes('digit'))).toBe(true)
    })
  })

  describe('Component Factory', () => {
    it('should create and manage placed components', () => {
      const placedComponent = createPlacedComponent('digit', { x: 100, y: 200 })
      
      expect(placedComponent).toBeDefined()
      expect(placedComponent?.componentId).toBe('digit')
      expect(placedComponent?.position).toEqual({ x: 100, y: 200 })
      expect(placedComponent?.isValid).toBe(true)
    })

    it('should update component parameters', () => {
      const placedComponent = createPlacedComponent('custom-class', { x: 0, y: 0 }, { chars: 'abc' })
      expect(placedComponent).toBeDefined()

      const updatedComponent = updatePlacedComponentParameters(placedComponent!, { chars: 'xyz' })
      expect(updatedComponent.parameters.chars).toBe('xyz')
      expect(updatedComponent.isValid).toBe(true)
    })

    it('should generate patterns from multiple components', () => {
      const components = [
        createPlacedComponent('start-anchor', { x: 0, y: 0 }),
        createPlacedComponent('digit', { x: 50, y: 0 }),
        createPlacedComponent('one-or-more', { x: 100, y: 0 }),
        createPlacedComponent('end-anchor', { x: 150, y: 0 })
      ].filter(Boolean)

      const pattern = generatePatternFromComponents(components as any)
      expect(pattern).toBe('^\\d+$')
    })

    it('should sort components by position', () => {
      const components = [
        createPlacedComponent('digit', { x: 100, y: 0 }),
        createPlacedComponent('start-anchor', { x: 0, y: 0 }),
        createPlacedComponent('end-anchor', { x: 200, y: 0 })
      ].filter(Boolean) as any

      const sorted = sortPlacedComponentsByPosition(components)
      expect(sorted[0].componentId).toBe('start-anchor')
      expect(sorted[1].componentId).toBe('digit')
      expect(sorted[2].componentId).toBe('end-anchor')
    })
  })

  describe('Parameter Presets', () => {
    it('should have presets for parameterized components', () => {
      const customClassPresets = getPresetsForComponent('custom-class')
      expect(customClassPresets.length).toBeGreaterThan(0)

      const exactCountPresets = getPresetsForComponent('exact-count')
      expect(exactCountPresets.length).toBeGreaterThan(0)
    })

    it('should find presets by ID', () => {
      const preset = getPresetById('custom-class-letters')
      expect(preset).toBeDefined()
      expect(preset?.name).toBe('Letters Only')
      expect(preset?.componentId).toBe('custom-class')
      expect(preset?.parameters.chars).toBe('a-zA-Z')
    })

    it('should search presets', () => {
      const passwordPresets = searchPresets('password')
      expect(passwordPresets.length).toBeGreaterThan(0)
      expect(passwordPresets.some(p => p.tags.includes('password'))).toBe(true)
    })

    it('should return popular presets', () => {
      const popularPresets = getPopularPresets(5)
      expect(popularPresets.length).toBeLessThanOrEqual(5)
      expect(popularPresets.length).toBeGreaterThan(0)
    })
  })

  describe('Usage Tracking', () => {
    it('should track component usage', () => {
      const initialData = loadComponentUsage()
      expect(initialData.favorites).toHaveLength(0)
      expect(initialData.recentComponents).toHaveLength(0)

      // Record usage
      recordComponentUsage('digit')
      const afterUsage = loadComponentUsage()
      expect(afterUsage.recentComponents).toHaveLength(1)
      expect(afterUsage.recentComponents[0].componentId).toBe('digit')
      expect(afterUsage.usageStats['digit']).toBeDefined()
      expect(afterUsage.usageStats['digit'].usageCount).toBe(1)
    })

    it('should manage favorites', () => {
      // Add to favorites
      toggleFavorite('digit')
      let data = loadComponentUsage()
      expect(data.favorites).toContain('digit')

      // Remove from favorites
      toggleFavorite('digit')
      data = loadComponentUsage()
      expect(data.favorites).not.toContain('digit')
    })

    it('should maintain recent components order', () => {
      recordComponentUsage('digit')
      recordComponentUsage('word-char')
      recordComponentUsage('any-char')

      const data = loadComponentUsage()
      expect(data.recentComponents).toHaveLength(3)
      expect(data.recentComponents[0].componentId).toBe('any-char')
      expect(data.recentComponents[1].componentId).toBe('word-char')
      expect(data.recentComponents[2].componentId).toBe('digit')
    })

    it('should limit recent components', () => {
      // Add more than the limit
      for (let i = 0; i < 25; i++) {
        recordComponentUsage(`component-${i}`)
      }

      const data = loadComponentUsage()
      expect(data.recentComponents.length).toBeLessThanOrEqual(20)
    })
  })

  describe('End-to-End Workflow', () => {
    it('should support complete component workflow', () => {
      // 1. Search for a component
      const searchResults = searchComponents('email')
      expect(searchResults.length).toBeGreaterThan(0)
      
      const emailComponent = searchResults.find(c => c.id === 'email-pattern')
      expect(emailComponent).toBeDefined()

      // 2. Create a placed component
      const placedComponent = createPlacedComponent(emailComponent!.id, { x: 100, y: 100 })
      expect(placedComponent).toBeDefined()

      // 3. Record usage
      recordComponentUsage(emailComponent!.id)
      const usageData = loadComponentUsage()
      expect(usageData.recentComponents[0].componentId).toBe(emailComponent!.id)

      // 4. Add to favorites
      toggleFavorite(emailComponent!.id)
      const updatedUsageData = loadComponentUsage()
      expect(updatedUsageData.favorites).toContain(emailComponent!.id)

      // 5. Generate pattern
      const pattern = generatePatternFromComponents([placedComponent!])
      expect(pattern).toBe(emailComponent!.regexPattern)
    })

    it('should support parameterized component workflow', () => {
      // 1. Find a parameterized component
      const customClassComponent = allRegexComponents.find(c => c.id === 'custom-class')
      expect(customClassComponent).toBeDefined()
      expect(customClassComponent?.parameters).toBeDefined()

      // 2. Get presets for the component
      const presets = getPresetsForComponent('custom-class')
      expect(presets.length).toBeGreaterThan(0)

      const lettersPreset = presets.find(p => p.id === 'custom-class-letters')
      expect(lettersPreset).toBeDefined()

      // 3. Create placed component with preset parameters
      const placedComponent = createPlacedComponent(
        'custom-class',
        { x: 0, y: 0 },
        lettersPreset!.parameters
      )
      expect(placedComponent).toBeDefined()
      expect(placedComponent?.parameters.chars).toBe('a-zA-Z')

      // 4. Update parameters
      const updatedComponent = updatePlacedComponentParameters(
        placedComponent!,
        { chars: 'A-Z' }
      )
      expect(updatedComponent.parameters.chars).toBe('A-Z')

      // 5. Generate pattern
      const pattern = generatePatternFromComponents([updatedComponent])
      expect(pattern).toBe('[A-Z]')
    })
  })
})