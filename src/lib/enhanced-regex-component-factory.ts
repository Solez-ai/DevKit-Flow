/**
 * Enhanced regex component factory with template support and AI integration
 * Implements the enhanced component architecture for Task 9.1
 */

import { nanoid } from 'nanoid'
import type { 
  EnhancedRegexComponent,
  ComponentTemplate,
  ComponentMetadata,
  ComponentDefinition,
  ComponentFactory,
  ValidationResult,
  AIOptimization,
  ComponentDocumentation,
  EnhancedPlacedComponent,
  UsageContext,
} from '../types/enhanced-regex-components'
import type { RegexComponent, PlacedComponent, Position } from '../types'
import { 
  allRegexComponents, 
  getComponentById, 
  validateComponentParameters,
  generateComponentPattern 
} from './regex-components'

/**
 * Enhanced component factory implementation
 */
export class EnhancedComponentFactory implements ComponentFactory {
  private componentTemplates: Map<string, ComponentTemplate[]> = new Map()
  private customComponents: Map<string, EnhancedRegexComponent> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  /**
   * Create an enhanced component from a basic component definition
   */
  createComponent(definition: ComponentDefinition): EnhancedRegexComponent {
    const metadata: ComponentMetadata = {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      difficulty: 'beginner',
      popularity: 0,
      usageCount: 0,
      averageRating: 0,
      totalRatings: 0,
      isCustom: true,
      isDeprecated: false,
      ...definition.metadata
    }

    const enhancedComponent: EnhancedRegexComponent = {
      id: nanoid(),
      name: definition.name,
      description: definition.description,
      category: definition.category,
      regexPattern: definition.regexPattern,
      visualRepresentation: definition.visualRepresentation,
      parameters: definition.parameters,
      examples: definition.examples,
      commonUses: definition.commonUses,
      
      // Enhanced features
      templates: definition.templates || [],
      metadata,
      
      aiAssistance: {
        enabled: true,
        promptTemplates: this.generateAIPromptTemplates(definition),
        suggestions: [],
        explanations: [],
        optimizations: []
      },
      
      statistics: {
        totalUsage: 0,
        recentUsage: 0,
        averageSessionUsage: 0,
        popularCombinations: [],
        commonParameters: {},
        errorRate: 0,
        successRate: 1,
        performanceMetrics: {
          averageExecutionTime: 0,
          memoryUsage: 0,
          backtrackingRisk: 'low',
          complexityScore: this.calculateComplexityScore(definition.regexPattern),
          optimizationSuggestions: []
        }
      },
      
      validation: {
        rules: this.generateValidationRules(definition),
        customValidators: [],
        errorMessages: {},
        warningMessages: {}
      },
      
      documentation: {
        summary: definition.documentation?.summary || definition.description || '',
        detailedDescription: definition.documentation?.detailedDescription || definition.description || '',
        syntaxExplanation: definition.documentation?.syntaxExplanation || definition.regexPattern || '',
        useCases: [],
        examples: [],
        relatedComponents: [],
        commonMistakes: [],
        performanceNotes: [],
        browserSupport: { chrome: true, firefox: true, safari: true, edge: true },
        languageSupport: { javascript: true, python: true, java: true, csharp: true, php: true, ruby: true, go: true, rust: true, notes: {} },
        tutorials: []
      }
    }

    // Store custom component
    this.customComponents.set(enhancedComponent.id, enhancedComponent)
    
    return enhancedComponent
  }

  /**
   * Create a component from a template
   */
  createFromTemplate(templateId: string, parameters?: Record<string, any>): EnhancedRegexComponent {
    const template = this.findTemplate(templateId)
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`)
    }

    // Find the base component
    const baseComponent = this.getEnhancedComponent(template.id.split('-')[0])
    if (!baseComponent) {
      throw new Error(`Base component for template ${templateId} not found`)
    }

    // Create a new component based on the template
    const enhancedComponent: EnhancedRegexComponent = {
      ...baseComponent,
      id: nanoid(),
      metadata: {
        ...baseComponent.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [...baseComponent.metadata.tags, ...template.tags],
        isCustom: true
      }
    }

    // Apply template parameters
    if (parameters) {
      enhancedComponent.templates = [{
        ...template,
        parameters: { ...template.parameters, ...parameters }
      }]
    }

    this.customComponents.set(enhancedComponent.id, enhancedComponent)
    return enhancedComponent
  }

  /**
   * Clone an existing component with modifications
   */
  cloneComponent(
    componentId: string, 
    modifications?: Partial<EnhancedRegexComponent>
  ): EnhancedRegexComponent {
    const originalComponent = this.getEnhancedComponent(componentId)
    if (!originalComponent) {
      throw new Error(`Component with ID ${componentId} not found`)
    }

    const clonedComponent: EnhancedRegexComponent = {
      ...originalComponent,
      id: nanoid(),
      metadata: {
        ...originalComponent.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: true
      },
      ...modifications
    }

    this.customComponents.set(clonedComponent.id, clonedComponent)
    return clonedComponent
  }

  /**
   * Validate a component
   */
  validateComponent(component: EnhancedRegexComponent): ValidationResult {
    const errors: any[] = []
    const warnings: any[] = []
    const suggestions: any[] = []

    // Basic validation
    if (!component.name || component.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Component name is required',
        code: 'REQUIRED_NAME',
        severity: 'error' as const
      })
    }

    if (!component.regexPattern || component.regexPattern.trim().length === 0) {
      errors.push({
        field: 'regexPattern',
        message: 'Regex pattern is required',
        code: 'REQUIRED_PATTERN',
        severity: 'error' as const
      })
    }

    // Pattern validation
    try {
      new RegExp(component.regexPattern)
    } catch (error) {
      errors.push({
        field: 'regexPattern',
        message: `Invalid regex pattern: ${error}`,
        code: 'INVALID_PATTERN',
        severity: 'error' as const
      })
    }

    // Performance warnings
    if (component.statistics.performanceMetrics.backtrackingRisk === 'high') {
      warnings.push({
        field: 'regexPattern',
        message: 'Pattern may cause excessive backtracking',
        code: 'HIGH_BACKTRACKING_RISK',
        suggestion: 'Consider using atomic groups or possessive quantifiers'
      })
    }

    // Complexity suggestions
    if (component.statistics.performanceMetrics.complexityScore > 8) {
      suggestions.push({
        field: 'regexPattern',
        message: 'Pattern is complex and may be hard to maintain',
        code: 'HIGH_COMPLEXITY',
        autoFix: null
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Generate AI optimizations for a component
   */
  optimizeComponent(component: EnhancedRegexComponent): AIOptimization[] {
    const optimizations: AIOptimization[] = []

    // Performance optimization
    if (component.regexPattern.includes('.*.*')) {
      optimizations.push({
        id: nanoid(),
        type: 'performance',
        suggestion: 'Replace nested .* with more specific patterns',
        impact: 'high',
        effort: 'medium',
        beforePattern: component.regexPattern,
        afterPattern: component.regexPattern.replace(/\.\*\.\*/, '[\\s\\S]*'),
        explanation: 'Nested .* can cause exponential backtracking. Use more specific patterns or atomic groups.'
      })
    }

    // Readability optimization
    if (component.regexPattern.length > 50) {
      optimizations.push({
        id: nanoid(),
        type: 'readability',
        suggestion: 'Break down complex pattern into smaller components',
        impact: 'medium',
        effort: 'high',
        beforePattern: component.regexPattern,
        afterPattern: '// Consider breaking this into multiple components',
        explanation: 'Long regex patterns are hard to read and maintain. Consider using multiple simpler patterns.'
      })
    }

    return optimizations
  }

  /**
   * Generate documentation for a component
   */
  generateDocumentation(component: EnhancedRegexComponent): ComponentDocumentation {
    return {
      summary: component.description,
      detailedDescription: `The ${component.name} component ${component.description.toLowerCase()}.`,
      syntaxExplanation: `Pattern: ${component.regexPattern}`,
      useCases: component.commonUses.map((use, index) => ({
        id: `${component.id}-use-${index}`,
        title: use,
        description: `Use this component for ${use.toLowerCase()}`,
        example: component.examples[index] || component.regexPattern,
        explanation: `This pattern helps with ${use.toLowerCase()}`,
        difficulty: component.metadata.difficulty,
        tags: [use.toLowerCase().replace(/\s+/g, '-')]
      })),
      examples: component.examples.map((example, index) => ({
        id: `${component.id}-example-${index}`,
        title: `Example ${index + 1}`,
        description: `Example usage of ${component.name}`,
        pattern: component.regexPattern,
        testString: example,
        expectedMatches: [example],
        explanation: `This example demonstrates ${component.name}`,
        interactive: true
      })),
      relatedComponents: [],
      commonMistakes: [],
      performanceNotes: component.statistics.performanceMetrics.optimizationSuggestions,
      browserSupport: {
        chrome: true,
        firefox: true,
        safari: true,
        edge: true
      },
      languageSupport: {
        javascript: true,
        python: true,
        java: true,
        csharp: true,
        php: true,
        ruby: true,
        go: true,
        rust: true,
        notes: {}
      },
      tutorials: []
    }
  }

  /**
   * Create an enhanced placed component
   */
  createEnhancedPlacedComponent(
    componentId: string,
    position: Position,
    parameters: Record<string, any> = {},
    templateId?: string
  ): EnhancedPlacedComponent {
    const component = this.getEnhancedComponent(componentId)
    if (!component) {
      throw new Error(`Component with ID ${componentId} not found`)
    }

    const template = templateId ? this.findTemplate(templateId) : null
    const finalParameters = template ? { ...template.parameters, ...parameters } : parameters

    // Validate parameters
    const validationErrors = component.parameters 
      ? validateComponentParameters(component, finalParameters)
      : []

    const usageContext: UsageContext = {
      sessionId: nanoid(),
      patternId: nanoid(),
      createdAt: new Date(),
      lastModified: new Date(),
      modificationHistory: [{
        id: nanoid(),
        timestamp: new Date(),
        type: 'created',
        changes: { parameters: finalParameters },
        reason: 'Initial creation'
      }],
      tags: [],
      notes: ''
    }

    return {
      id: nanoid(),
      componentId,
      position,
      parameters: finalParameters,
      isValid: validationErrors.length === 0,
      validationErrors,
      
      // Enhanced features
      templateId,
      templateName: template?.name,
      aiSuggestions: [],
      aiOptimizations: this.optimizeComponent(component),
      performanceMetrics: component.statistics.performanceMetrics,
      usageContext,
      comments: [],
      annotations: []
    }
  }

  /**
   * Get an enhanced component by ID
   */
  private getEnhancedComponent(componentId: string): EnhancedRegexComponent | null {
    // Check custom components first
    if (this.customComponents.has(componentId)) {
      return this.customComponents.get(componentId)!
    }

    // Convert basic component to enhanced
    const basicComponent = getComponentById(componentId)
    if (basicComponent) {
      return this.convertToEnhanced(basicComponent)
    }

    return null
  }

  /**
   * Convert a basic component to enhanced
   */
  private convertToEnhanced(component: RegexComponent): EnhancedRegexComponent {
    const metadata: ComponentMetadata = {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      difficulty: 'beginner',
      popularity: 0,
      usageCount: 0,
      averageRating: 0,
      totalRatings: 0,
      isCustom: false,
      isDeprecated: false
    }

    return {
      ...component,
      templates: this.componentTemplates.get(component.id) || [],
      metadata,
      aiAssistance: {
        enabled: true,
        promptTemplates: [],
        suggestions: [],
        explanations: [],
        optimizations: []
      },
      statistics: {
        totalUsage: 0,
        recentUsage: 0,
        averageSessionUsage: 0,
        popularCombinations: [],
        commonParameters: {},
        errorRate: 0,
        successRate: 1,
        performanceMetrics: {
          averageExecutionTime: 0,
          memoryUsage: 0,
          backtrackingRisk: 'low',
          complexityScore: this.calculateComplexityScore(component.regexPattern),
          optimizationSuggestions: []
        }
      },
      validation: {
        rules: [],
        customValidators: [],
        errorMessages: {},
        warningMessages: {}
      },
      documentation: this.generateBasicDocumentation({
        name: component.name,
        description: component.description,
        category: component.category,
        regexPattern: component.regexPattern,
        visualRepresentation: component.visualRepresentation,
        parameters: component.parameters,
        examples: component.examples,
        commonUses: component.commonUses
      })
    }
  }

  /**
   * Initialize component templates
   */
  private initializeTemplates(): void {
    // This would be loaded from a configuration file or database
    // For now, we'll create some basic templates
    
    const emailTemplate: ComponentTemplate = {
      id: 'email-pattern-basic',
      name: 'Basic Email',
      description: 'Simple email validation pattern',
      parameters: {},
      tags: ['email', 'validation', 'basic'],
      usageExample: 'Validate basic email addresses',
      difficulty: 'beginner',
      category: 'validation',
      popularity: 95,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.componentTemplates.set('email-pattern', [emailTemplate])
  }

  /**
   * Find a template by ID
   */
  private findTemplate(templateId: string): ComponentTemplate | null {
    for (const templates of this.componentTemplates.values()) {
      const template = templates.find(t => t.id === templateId)
      if (template) return template
    }
    return null
  }

  /**
   * Generate AI prompt templates for a component
   */
  private generateAIPromptTemplates(definition: ComponentDefinition): any[] {
    return [
      {
        id: nanoid(),
        name: 'Generate Pattern',
        description: 'Generate a regex pattern for this component',
        prompt: `Generate a regex pattern for ${definition.name}: ${definition.description}`,
        category: 'generation',
        parameters: ['description', 'examples']
      },
      {
        id: nanoid(),
        name: 'Explain Pattern',
        description: 'Explain how this pattern works',
        prompt: `Explain this regex pattern: ${definition.regexPattern}`,
        category: 'explanation',
        parameters: ['pattern']
      }
    ]
  }

  /**
   * Generate validation rules for a component
   */
  private generateValidationRules(definition: ComponentDefinition): any[] {
    const rules: any[] = []

    if (definition.parameters) {
      for (const param of definition.parameters) {
        if (param.type === 'number' && param.min !== undefined) {
          rules.push({
            id: nanoid(),
            name: `${param.name}_min`,
            description: `${param.name} must be at least ${param.min}`,
            type: 'range',
            parameters: { min: param.min },
            errorMessage: `${param.name} must be at least ${param.min}`,
            severity: 'error'
          })
        }
      }
    }

    return rules
  }

  /**
   * Calculate complexity score for a regex pattern
   */
  private calculateComplexityScore(pattern: string): number {
    let score = 0
    
    // Basic length penalty
    score += pattern.length * 0.1
    
    // Special character penalties
    score += (pattern.match(/[.*+?^${}()|[\]\\]/g) || []).length * 0.5
    
    // Quantifier penalties
    score += (pattern.match(/[*+?{]/g) || []).length * 1
    
    // Lookaround penalties
    score += (pattern.match(/\(\?[=!<]/g) || []).length * 2
    
    // Nested group penalties
    const openParens = (pattern.match(/\(/g) || []).length
    const closeParens = (pattern.match(/\)/g) || []).length
    score += Math.min(openParens, closeParens) * 0.5
    
    return Math.min(score, 10) // Cap at 10
  }

  /**
   * Generate basic documentation for a component
   */
  private generateBasicDocumentation(definition: ComponentDefinition): ComponentDocumentation {
    return {
      summary: definition.description,
      detailedDescription: `The ${definition.name} component ${definition.description.toLowerCase()}.`,
      syntaxExplanation: `Pattern: ${definition.regexPattern}`,
      useCases: definition.commonUses.map((use, index) => ({
        id: `use-${index}`,
        title: use,
        description: `Use this component for ${use.toLowerCase()}`,
        example: definition.examples[index] || definition.regexPattern,
        explanation: `This pattern helps with ${use.toLowerCase()}`,
        difficulty: 'beginner',
        tags: [use.toLowerCase().replace(/\s+/g, '-')]
      })),
      examples: definition.examples.map((example, index) => ({
        id: `example-${index}`,
        title: `Example ${index + 1}`,
        description: `Example usage of ${definition.name}`,
        pattern: definition.regexPattern,
        testString: example,
        expectedMatches: [example],
        explanation: `This example demonstrates ${definition.name}`,
        interactive: true
      })),
      relatedComponents: [],
      commonMistakes: [],
      performanceNotes: [],
      browserSupport: {
        chrome: true,
        firefox: true,
        safari: true,
        edge: true
      },
      languageSupport: {
        javascript: true,
        python: true,
        java: true,
        csharp: true,
        php: true,
        ruby: true,
        go: true,
        rust: true,
        notes: {}
      },
      tutorials: []
    }
  }
}

// Export singleton instance
export const enhancedComponentFactory = new EnhancedComponentFactory()

// Export utility functions
export function createEnhancedComponent(definition: ComponentDefinition): EnhancedRegexComponent {
  return enhancedComponentFactory.createComponent(definition)
}

export function createFromTemplate(templateId: string, parameters?: Record<string, any>): EnhancedRegexComponent {
  return enhancedComponentFactory.createFromTemplate(templateId, parameters)
}

export function cloneEnhancedComponent(
  componentId: string, 
  modifications?: Partial<EnhancedRegexComponent>
): EnhancedRegexComponent {
  return enhancedComponentFactory.cloneComponent(componentId, modifications)
}

export function validateEnhancedComponent(component: EnhancedRegexComponent): ValidationResult {
  return enhancedComponentFactory.validateComponent(component)
}

export function optimizeEnhancedComponent(component: EnhancedRegexComponent): AIOptimization[] {
  return enhancedComponentFactory.optimizeComponent(component)
}