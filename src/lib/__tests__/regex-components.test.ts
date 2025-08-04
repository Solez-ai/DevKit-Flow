import { describe, it, expect } from 'vitest'
import { 
  allRegexComponents, 
  getComponentsByCategory, 
  getComponentById, 
  searchComponents,
  validateComponentParameters,
  generateComponentPattern
} from '../regex-components'
import { createPlacedComponent, updatePlacedComponentParameters } from '../regex-component-factory'

describe('Regex Components', () => {
  it('should have all expected components', () => {
    expect(allRegexComponents.length).toBeGreaterThan(0)
    
    // Check that we have components from each category
    const categories = ['character-classes', 'anchors', 'quantifiers', 'groups', 'lookarounds', 'shortcuts']
    for (const category of categories) {
      const categoryComponents = getComponentsByCategory(category as any)
      expect(categoryComponents.length).toBeGreaterThan(0)
    }
  })

  it('should find components by ID', () => {
    const digitComponent = getComponentById('digit')
    expect(digitComponent).toBeDefined()
    expect(digitComponent?.name).toBe('Digit')
    expect(digitComponent?.regexPattern).toBe('\\d')
  })

  it('should search components correctly', () => {
    const digitResults = searchComponents('digit')
    expect(digitResults.length).toBeGreaterThan(0)
    expect(digitResults.some(c => c.id === 'digit')).toBe(true)

    const emailResults = searchComponents('email')
    expect(emailResults.length).toBeGreaterThan(0)
    expect(emailResults.some(c => c.id === 'email-pattern')).toBe(true)
  })

  it('should validate component parameters', () => {
    const customClassComponent = getComponentById('custom-class')
    expect(customClassComponent).toBeDefined()

    // Valid parameters
    const validParams = { chars: 'abc123' }
    const validErrors = validateComponentParameters(customClassComponent!, validParams)
    expect(validErrors).toHaveLength(0)

    // Invalid parameters (empty)
    const invalidParams = { chars: '' }
    const invalidErrors = validateComponentParameters(customClassComponent!, invalidParams)
    expect(invalidErrors.length).toBeGreaterThan(0)
  })

  it('should generate patterns correctly', () => {
    const customClassComponent = getComponentById('custom-class')
    expect(customClassComponent).toBeDefined()

    const pattern = generateComponentPattern(customClassComponent!, { chars: 'abc' })
    expect(pattern).toBe('[abc]')

    const exactCountComponent = getComponentById('exact-count')
    expect(exactCountComponent).toBeDefined()

    const countPattern = generateComponentPattern(exactCountComponent!, { count: 5 })
    expect(countPattern).toBe('{5}')
  })
})

describe('Regex Component Factory', () => {
  it('should create placed components', () => {
    const placedComponent = createPlacedComponent('digit', { x: 100, y: 200 })
    
    expect(placedComponent).toBeDefined()
    expect(placedComponent?.componentId).toBe('digit')
    expect(placedComponent?.position).toEqual({ x: 100, y: 200 })
    expect(placedComponent?.isValid).toBe(true)
    expect(placedComponent?.validationErrors).toHaveLength(0)
  })

  it('should create placed components with parameters', () => {
    const placedComponent = createPlacedComponent(
      'custom-class', 
      { x: 0, y: 0 }, 
      { chars: 'xyz' }
    )
    
    expect(placedComponent).toBeDefined()
    expect(placedComponent?.parameters.chars).toBe('xyz')
    expect(placedComponent?.isValid).toBe(true)
  })

  it('should update component parameters', () => {
    const placedComponent = createPlacedComponent('custom-class', { x: 0, y: 0 }, { chars: 'abc' })
    expect(placedComponent).toBeDefined()

    const updatedComponent = updatePlacedComponentParameters(placedComponent!, { chars: 'xyz' })
    expect(updatedComponent.parameters.chars).toBe('xyz')
    expect(updatedComponent.isValid).toBe(true)
  })

  it('should handle invalid component IDs', () => {
    const placedComponent = createPlacedComponent('invalid-id', { x: 0, y: 0 })
    expect(placedComponent).toBeNull()
  })
})