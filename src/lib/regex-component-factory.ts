import type { PlacedComponent, RegexComponent, Position } from '../types'
import { getComponentById, validateComponentParameters, generateComponentPattern } from './regex-components'
import { nanoid } from 'nanoid'

/**
 * Factory for creating and managing placed regex components
 */

/**
 * Create a new placed component from a component definition
 */
export function createPlacedComponent(
  componentId: string,
  position: Position,
  parameters: Record<string, any> = {}
): PlacedComponent | null {
  const component = getComponentById(componentId)
  if (!component) {
    console.error(`Component with ID ${componentId} not found`)
    return null
  }

  // Validate parameters
  const validationErrors = validateComponentParameters(component, parameters)
  
  // Use default parameters if not provided
  const finalParameters = { ...parameters }
  if (component.parameters) {
    for (const param of component.parameters) {
      if (finalParameters[param.name] === undefined) {
        finalParameters[param.name] = param.default
      }
    }
  }

  return {
    id: nanoid(),
    componentId,
    position,
    parameters: finalParameters,
    isValid: validationErrors.length === 0,
    validationErrors
  }
}

/**
 * Update parameters of a placed component
 */
export function updatePlacedComponentParameters(
  placedComponent: PlacedComponent,
  newParameters: Record<string, any>
): PlacedComponent {
  const component = getComponentById(placedComponent.componentId)
  if (!component) {
    return {
      ...placedComponent,
      isValid: false,
      validationErrors: ['Component definition not found']
    }
  }

  const mergedParameters = { ...placedComponent.parameters, ...newParameters }
  const validationErrors = validateComponentParameters(component, mergedParameters)

  return {
    ...placedComponent,
    parameters: mergedParameters,
    isValid: validationErrors.length === 0,
    validationErrors
  }
}

/**
 * Move a placed component to a new position
 */
export function movePlacedComponent(
  placedComponent: PlacedComponent,
  newPosition: Position
): PlacedComponent {
  return {
    ...placedComponent,
    position: newPosition
  }
}

/**
 * Validate a placed component
 */
export function validatePlacedComponent(placedComponent: PlacedComponent): PlacedComponent {
  const component = getComponentById(placedComponent.componentId)
  if (!component) {
    return {
      ...placedComponent,
      isValid: false,
      validationErrors: ['Component definition not found']
    }
  }

  const validationErrors = validateComponentParameters(component, placedComponent.parameters)

  return {
    ...placedComponent,
    isValid: validationErrors.length === 0,
    validationErrors
  }
}

/**
 * Get the regex pattern for a placed component
 */
export function getPlacedComponentPattern(placedComponent: PlacedComponent): string {
  const component = getComponentById(placedComponent.componentId)
  if (!component) {
    return ''
  }

  return generateComponentPattern(component, placedComponent.parameters)
}

/**
 * Clone a placed component
 */
export function clonePlacedComponent(
  placedComponent: PlacedComponent,
  newPosition?: Position
): PlacedComponent {
  return {
    ...placedComponent,
    id: nanoid(),
    position: newPosition || {
      x: placedComponent.position.x + 20,
      y: placedComponent.position.y + 20
    }
  }
}

/**
 * Get component metadata for a placed component
 */
export function getPlacedComponentMetadata(placedComponent: PlacedComponent): {
  component: RegexComponent | null
  pattern: string
  isValid: boolean
  errors: string[]
} {
  const component = getComponentById(placedComponent.componentId)
  
  return {
    component: component || null,
    pattern: component ? generateComponentPattern(component, placedComponent.parameters) : '',
    isValid: placedComponent.isValid,
    errors: placedComponent.validationErrors
  }
}

/**
 * Sort placed components by position (left to right, top to bottom)
 */
export function sortPlacedComponentsByPosition(components: PlacedComponent[]): PlacedComponent[] {
  return [...components].sort((a, b) => {
    if (Math.abs(a.position.y - b.position.y) < 10) {
      // Same row, sort by x position
      return a.position.x - b.position.x
    }
    // Different rows, sort by y position
    return a.position.y - b.position.y
  })
}

/**
 * Generate regex pattern from multiple placed components
 */
export function generatePatternFromComponents(components: PlacedComponent[]): string {
  const sortedComponents = sortPlacedComponentsByPosition(components)
  
  return sortedComponents
    .map(placedComponent => getPlacedComponentPattern(placedComponent))
    .join('')
}

/**
 * Find components that overlap with a given position
 */
export function findComponentsAtPosition(
  components: PlacedComponent[],
  position: Position,
  tolerance: number = 50
): PlacedComponent[] {
  return components.filter(component => {
    const dx = Math.abs(component.position.x - position.x)
    const dy = Math.abs(component.position.y - position.y)
    return dx <= tolerance && dy <= tolerance
  })
}

/**
 * Get component usage statistics
 */
export function getComponentUsageStats(components: PlacedComponent[]): Record<string, number> {
  const stats: Record<string, number> = {}
  
  for (const component of components) {
    stats[component.componentId] = (stats[component.componentId] || 0) + 1
  }
  
  return stats
}

/**
 * Validate all components in a pattern
 */
export function validateAllComponents(components: PlacedComponent[]): {
  isValid: boolean
  errors: Array<{ componentId: string; errors: string[] }>
} {
  const errors: Array<{ componentId: string; errors: string[] }> = []
  
  for (const component of components) {
    const validated = validatePlacedComponent(component)
    if (!validated.isValid) {
      errors.push({
        componentId: component.id,
        errors: validated.validationErrors
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get component suggestions based on current pattern
 */
export function getComponentSuggestions(
  currentComponents: PlacedComponent[],
  lastComponent?: PlacedComponent
): RegexComponent[] {
  // This is a simplified suggestion system
  // In a real implementation, this would use more sophisticated logic
  
  if (!lastComponent) {
    // Suggest common starting components
    return [
      getComponentById('start-anchor'),
      getComponentById('word-char'),
      getComponentById('digit'),
      getComponentById('any-char')
    ].filter(Boolean) as RegexComponent[]
  }
  
  const component = getComponentById(lastComponent.componentId)
  if (!component) return []
  
  // Suggest quantifiers after character classes
  if (component.category === 'character-classes') {
    return [
      getComponentById('zero-or-more'),
      getComponentById('one-or-more'),
      getComponentById('zero-or-one')
    ].filter(Boolean) as RegexComponent[]
  }
  
  // Suggest anchors at the end
  if (currentComponents.length > 0) {
    return [
      getComponentById('end-anchor'),
      getComponentById('word-boundary')
    ].filter(Boolean) as RegexComponent[]
  }
  
  return []
}