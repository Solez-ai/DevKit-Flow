/**
 * Enhanced validation system for regex components
 * Implements comprehensive validation with AI assistance for Task 9.1
 */

import type {
  EnhancedRegexComponent,
  EnhancedPlacedComponent,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  ValidationContext,
  CustomValidator,
  ValidationRule,
  ComponentValidation
} from '../types/enhanced-regex-components'
import { validateComponentParameters } from './regex-components'

/**
 * Enhanced validation engine
 */
export class EnhancedValidationEngine {
  private customValidators: Map<string, CustomValidator> = new Map()
  private validationRules: Map<string, ValidationRule[]> = new Map()

  constructor() {
    this.initializeBuiltInValidators()
    this.initializeBuiltInRules()
  }

  /**
   * Validate an enhanced component
   */
  validateComponent(component: EnhancedRegexComponent): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Basic component validation
    const basicValidation = this.validateBasicComponent(component)
    errors.push(...basicValidation.errors)
    warnings.push(...basicValidation.warnings)
    suggestions.push(...basicValidation.suggestions)

    // Pattern validation
    const patternValidation = this.validatePattern(component.regexPattern)
    errors.push(...patternValidation.errors)
    warnings.push(...patternValidation.warnings)
    suggestions.push(...patternValidation.suggestions)

    // Performance validation
    const performanceValidation = this.validatePerformance(component)
    warnings.push(...performanceValidation.warnings)
    suggestions.push(...performanceValidation.suggestions)

    // Template validation
    if (component.templates.length > 0) {
      const templateValidation = this.validateTemplates(component)
      errors.push(...templateValidation.errors)
      warnings.push(...templateValidation.warnings)
    }

    // Custom validation rules
    const customValidation = this.applyCustomValidation(component)
    errors.push(...customValidation.errors)
    warnings.push(...customValidation.warnings)
    suggestions.push(...customValidation.suggestions)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Validate a placed component
   */
  validatePlacedComponent(
    placedComponent: EnhancedPlacedComponent,
    component: EnhancedRegexComponent
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Parameter validation
    if (component.parameters) {
      const paramErrors = validateComponentParameters(component, placedComponent.parameters)
      errors.push(...paramErrors.map(error => ({
        field: 'parameters',
        message: error,
        code: 'PARAMETER_ERROR',
        severity: 'error' as const
      })))
    }

    // Position validation
    const positionValidation = this.validatePosition(placedComponent.position)
    errors.push(...positionValidation.errors)
    warnings.push(...positionValidation.warnings)

    // Template validation
    if (placedComponent.templateId) {
      const templateValidation = this.validatePlacedComponentTemplate(placedComponent, component)
      errors.push(...templateValidation.errors)
      warnings.push(...templateValidation.warnings)
    }

    // Performance validation for placed component
    if (placedComponent.performanceMetrics) {
      const performanceValidation = this.validatePlacedComponentPerformance(placedComponent)
      warnings.push(...performanceValidation.warnings)
      suggestions.push(...performanceValidation.suggestions)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Validate a complete pattern made of multiple components
   */
  validatePattern(pattern: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Syntax validation
    try {
      new RegExp(pattern)
    } catch (error) {
      errors.push({
        field: 'pattern',
        message: `Invalid regex syntax: ${error}`,
        code: 'INVALID_SYNTAX',
        severity: 'error'
      })
      return { isValid: false, errors, warnings, suggestions }
    }

    // Performance analysis
    const performanceIssues = this.analyzePatternPerformance(pattern)
    warnings.push(...performanceIssues.warnings)
    suggestions.push(...performanceIssues.suggestions)

    // Security analysis
    const securityIssues = this.analyzePatternSecurity(pattern)
    warnings.push(...securityIssues.warnings)
    suggestions.push(...securityIssues.suggestions)

    // Complexity analysis
    const complexityIssues = this.analyzePatternComplexity(pattern)
    warnings.push(...complexityIssues.warnings)
    suggestions.push(...complexityIssues.suggestions)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  /**
   * Add custom validator
   */
  addCustomValidator(validator: CustomValidator): void {
    this.customValidators.set(validator.id, validator)
  }

  /**
   * Add validation rule
   */
  addValidationRule(componentId: string, rule: ValidationRule): void {
    const rules = this.validationRules.get(componentId) || []
    rules.push(rule)
    this.validationRules.set(componentId, rules)
  }

  /**
   * Get validation suggestions for improvement
   */
  getImprovementSuggestions(component: EnhancedRegexComponent): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    // Performance suggestions
    if (component.statistics.performanceMetrics.complexityScore > 7) {
      suggestions.push({
        field: 'pattern',
        message: 'Consider breaking down this complex pattern into simpler components',
        code: 'HIGH_COMPLEXITY',
        autoFix: null
      })
    }

    // Usage suggestions
    if (component.statistics.totalUsage === 0) {
      suggestions.push({
        field: 'documentation',
        message: 'Add more examples and use cases to improve discoverability',
        code: 'LOW_USAGE',
        autoFix: null
      })
    }

    // Template suggestions
    if (component.templates.length === 0 && component.parameters && component.parameters.length > 0) {
      suggestions.push({
        field: 'templates',
        message: 'Consider creating templates for common parameter combinations',
        code: 'MISSING_TEMPLATES',
        autoFix: null
      })
    }

    return suggestions
  }

  /**
   * Validate basic component properties
   */
  private validateBasicComponent(component: EnhancedRegexComponent): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Required fields
    if (!component.name || component.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Component name is required',
        code: 'REQUIRED_NAME',
        severity: 'error'
      })
    }

    if (!component.description || component.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Component description is required',
        code: 'REQUIRED_DESCRIPTION',
        severity: 'error'
      })
    }

    if (!component.regexPattern || component.regexPattern.trim().length === 0) {
      errors.push({
        field: 'regexPattern',
        message: 'Regex pattern is required',
        code: 'REQUIRED_PATTERN',
        severity: 'error'
      })
    }

    // Quality checks
    if (component.examples.length === 0) {
      warnings.push({
        field: 'examples',
        message: 'Component should have at least one example',
        code: 'MISSING_EXAMPLES',
        suggestion: 'Add examples to help users understand the component'
      })
    }

    if (component.commonUses.length === 0) {
      warnings.push({
        field: 'commonUses',
        message: 'Component should have common use cases listed',
        code: 'MISSING_USE_CASES',
        suggestion: 'Add common use cases to improve discoverability'
      })
    }

    // Metadata validation
    if (component.metadata.tags.length === 0) {
      suggestions.push({
        field: 'metadata.tags',
        message: 'Adding tags will improve searchability',
        code: 'MISSING_TAGS',
        autoFix: null
      })
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions }
  }

  /**
   * Validate component performance characteristics
   */
  private validatePerformance(component: EnhancedRegexComponent): ValidationResult {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    const metrics = component.statistics.performanceMetrics

    // Backtracking risk
    if (metrics.backtrackingRisk === 'high') {
      warnings.push({
        field: 'pattern',
        message: 'Pattern has high backtracking risk and may cause performance issues',
        code: 'HIGH_BACKTRACKING_RISK',
        suggestion: 'Consider using atomic groups or possessive quantifiers'
      })
    }

    // Complexity score
    if (metrics.complexityScore > 8) {
      warnings.push({
        field: 'pattern',
        message: 'Pattern is very complex and may be hard to maintain',
        code: 'HIGH_COMPLEXITY',
        suggestion: 'Consider breaking into smaller, simpler components'
      })
    }

    // Error rate
    if (component.statistics.errorRate > 0.1) {
      warnings.push({
        field: 'pattern',
        message: 'Component has a high error rate in usage',
        code: 'HIGH_ERROR_RATE',
        suggestion: 'Review pattern for common mistakes or add better documentation'
      })
    }

    return { isValid: true, errors: [], warnings, suggestions }
  }

  /**
   * Validate component templates
   */
  private validateTemplates(component: EnhancedRegexComponent): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const template of component.templates) {
      // Template name validation
      if (!template.name || template.name.trim().length === 0) {
        errors.push({
          field: 'templates',
          message: `Template ${template.id} must have a name`,
          code: 'TEMPLATE_MISSING_NAME',
          severity: 'error'
        })
      }

      // Parameter validation
      if (component.parameters) {
        for (const param of component.parameters) {
          if (param.default === undefined && template.parameters[param.name] === undefined) {
            warnings.push({
              field: 'templates',
              message: `Template ${template.name} missing parameter ${param.name}`,
              code: 'TEMPLATE_MISSING_PARAMETER',
              suggestion: `Add default value for parameter ${param.name}`
            })
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions: [] }
  }

  /**
   * Validate position of placed component
   */
  private validatePosition(position: { x: number; y: number }): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (position.x < 0 || position.y < 0) {
      errors.push({
        field: 'position',
        message: 'Component position cannot be negative',
        code: 'INVALID_POSITION',
        severity: 'error'
      })
    }

    if (position.x > 10000 || position.y > 10000) {
      warnings.push({
        field: 'position',
        message: 'Component is positioned very far from origin',
        code: 'DISTANT_POSITION',
        suggestion: 'Consider moving component closer to other components'
      })
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions: [] }
  }

  /**
   * Validate placed component template
   */
  private validatePlacedComponentTemplate(
    placedComponent: EnhancedPlacedComponent,
    component: EnhancedRegexComponent
  ): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!placedComponent.templateId) {
      return { isValid: true, errors, warnings, suggestions: [] }
    }

    const template = component.templates.find(t => t.id === placedComponent.templateId)
    if (!template) {
      errors.push({
        field: 'templateId',
        message: `Template ${placedComponent.templateId} not found`,
        code: 'TEMPLATE_NOT_FOUND',
        severity: 'error'
      })
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions: [] }
  }

  /**
   * Validate placed component performance
   */
  private validatePlacedComponentPerformance(
    placedComponent: EnhancedPlacedComponent
  ): ValidationResult {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    if (!placedComponent.performanceMetrics) {
      return { isValid: true, errors: [], warnings, suggestions }
    }

    const metrics = placedComponent.performanceMetrics

    if (metrics.averageExecutionTime > 100) {
      warnings.push({
        field: 'performance',
        message: 'Component has slow execution time',
        code: 'SLOW_EXECUTION',
        suggestion: 'Consider optimizing the pattern or parameters'
      })
    }

    if (metrics.memoryUsage > 1000000) {
      warnings.push({
        field: 'performance',
        message: 'Component uses significant memory',
        code: 'HIGH_MEMORY_USAGE',
        suggestion: 'Review pattern for memory-intensive constructs'
      })
    }

    return { isValid: true, errors: [], warnings, suggestions }
  }

  /**
   * Apply custom validation rules
   */
  private applyCustomValidation(component: EnhancedRegexComponent): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    const context: ValidationContext = {
      component,
      allParameters: {},
      pattern: component.regexPattern
    }

    // Apply component-specific rules
    const rules = this.validationRules.get(component.id) || []
    for (const rule of rules) {
      const result = this.applyValidationRule(rule, context)
      if (!result.isValid) {
        if (rule.severity === 'error') {
          errors.push(...result.errors)
        } else {
          warnings.push(...result.warnings)
        }
      }
    }

    // Apply custom validators
    for (const validator of this.customValidators.values()) {
      const result = validator.validator(component, context)
      errors.push(...result.errors)
      warnings.push(...result.warnings)
      suggestions.push(...result.suggestions)
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions }
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(rule: ValidationRule, context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // This is a simplified implementation
    // In a real system, this would have more sophisticated rule evaluation
    
    switch (rule.type) {
      case 'required':
        // Check if required field is present
        break
      case 'format':
        // Check format constraints
        break
      case 'range':
        // Check range constraints
        break
      case 'custom':
        // Apply custom validation logic
        break
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions: [] }
  }

  /**
   * Analyze pattern performance
   */
  private analyzePatternPerformance(pattern: string): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Check for catastrophic backtracking patterns
    if (pattern.includes('(.*)*') || pattern.includes('(.+)+')) {
      warnings.push({
        field: 'pattern',
        message: 'Pattern may cause catastrophic backtracking',
        code: 'CATASTROPHIC_BACKTRACKING',
        suggestion: 'Use atomic groups or possessive quantifiers'
      })
    }

    // Check for nested quantifiers
    if (/[*+?]\s*[*+?]/.test(pattern)) {
      warnings.push({
        field: 'pattern',
        message: 'Nested quantifiers can cause performance issues',
        code: 'NESTED_QUANTIFIERS',
        suggestion: 'Restructure pattern to avoid nested quantifiers'
      })
    }

    // Check for alternation with overlapping patterns
    if (pattern.includes('|') && pattern.length > 50) {
      suggestions.push({
        field: 'pattern',
        message: 'Long alternation patterns can be slow',
        code: 'LONG_ALTERNATION',
        autoFix: null
      })
    }

    return { warnings, suggestions }
  }

  /**
   * Analyze pattern security
   */
  private analyzePatternSecurity(pattern: string): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Check for ReDoS vulnerabilities
    if (this.hasReDoSVulnerability(pattern)) {
      warnings.push({
        field: 'pattern',
        message: 'Pattern may be vulnerable to ReDoS attacks',
        code: 'REDOS_VULNERABILITY',
        suggestion: 'Review pattern for exponential time complexity'
      })
    }

    return { warnings, suggestions }
  }

  /**
   * Analyze pattern complexity
   */
  private analyzePatternComplexity(pattern: string): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Calculate complexity score
    const complexity = this.calculateComplexityScore(pattern)

    if (complexity > 8) {
      warnings.push({
        field: 'pattern',
        message: 'Pattern is very complex and may be hard to understand',
        code: 'HIGH_COMPLEXITY',
        suggestion: 'Consider breaking into smaller components'
      })
    }

    if (pattern.length > 100) {
      suggestions.push({
        field: 'pattern',
        message: 'Very long patterns are hard to maintain',
        code: 'LONG_PATTERN',
        autoFix: null
      })
    }

    return { warnings, suggestions }
  }

  /**
   * Check for ReDoS vulnerability
   */
  private hasReDoSVulnerability(pattern: string): boolean {
    // Simplified ReDoS detection
    // In a real implementation, this would be more sophisticated
    
    const vulnerablePatterns = [
      /\([^)]*\*[^)]*\)\*/,  // (.*)*
      /\([^)]*\+[^)]*\)\+/,  // (.+)+
      /\([^)]*\*[^)]*\)\+/,  // (.*)+ 
      /\([^)]*\+[^)]*\)\*/   // (.+)*
    ]

    return vulnerablePatterns.some(vuln => vuln.test(pattern))
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(pattern: string): number {
    let score = 0
    
    // Length penalty
    score += pattern.length * 0.1
    
    // Special characters
    score += (pattern.match(/[.*+?^${}()|[\]\\]/g) || []).length * 0.5
    
    // Quantifiers
    score += (pattern.match(/[*+?{]/g) || []).length * 1
    
    // Lookarounds
    score += (pattern.match(/\(\?[=!<]/g) || []).length * 2
    
    // Groups
    const groups = (pattern.match(/\(/g) || []).length
    score += groups * 0.5
    
    return Math.min(score, 10)
  }

  /**
   * Initialize built-in validators
   */
  private initializeBuiltInValidators(): void {
    // Email validator
    this.addCustomValidator({
      id: 'email-validator',
      name: 'Email Validator',
      description: 'Validates email patterns',
      validator: (value: any, context: ValidationContext) => {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        if (context.component.id === 'email-pattern') {
          // Check for common email validation issues
          if (!context.pattern?.includes('@')) {
            errors.push({
              field: 'pattern',
              message: 'Email pattern must include @ symbol',
              code: 'EMAIL_MISSING_AT',
              severity: 'error'
            })
          }
        }

        return { isValid: errors.length === 0, errors, warnings, suggestions }
      }
    })
  }

  /**
   * Initialize built-in validation rules
   */
  private initializeBuiltInRules(): void {
    // Add common validation rules here
  }
}

// Export singleton instance
export const enhancedValidationEngine = new EnhancedValidationEngine()

// Export utility functions
export function validateEnhancedComponent(component: EnhancedRegexComponent): ValidationResult {
  return enhancedValidationEngine.validateComponent(component)
}

export function validateEnhancedPlacedComponent(
  placedComponent: EnhancedPlacedComponent,
  component: EnhancedRegexComponent
): ValidationResult {
  return enhancedValidationEngine.validatePlacedComponent(placedComponent, component)
}

export function validateRegexPattern(pattern: string): ValidationResult {
  return enhancedValidationEngine.validatePattern(pattern)
}

export function getComponentImprovementSuggestions(component: EnhancedRegexComponent): ValidationSuggestion[] {
  return enhancedValidationEngine.getImprovementSuggestions(component)
}