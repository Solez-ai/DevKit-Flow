import type { CommitSuggestion } from '@/types'

// Conventional commit format configuration
export interface CommitFormatConfig {
  maxSubjectLength: number
  maxBodyLineLength: number
  includeBody: boolean
  includeFooter: boolean
  enforceTypeCase: 'lower' | 'upper' | 'title'
  enforceScopeCase: 'lower' | 'upper' | 'title'
  scopeRequired: boolean
  bodyRequired: boolean
  allowedTypes: string[]
  customTypes: Record<string, string>
}

// User customization rules
export interface CommitGenerationRules {
  format: CommitFormatConfig
  templates: Record<string, string>
  autoGenerate: boolean
  includeTimestamp: boolean
  includeAuthor: boolean
  customPatterns: CustomPattern[]
}

export interface CustomPattern {
  id: string
  name: string
  pattern: RegExp
  replacement: string
  type: string
  scope?: string
  description: string
  enabled: boolean
}

// Default configuration
const DEFAULT_CONFIG: CommitFormatConfig = {
  maxSubjectLength: 50,
  maxBodyLineLength: 72,
  includeBody: true,
  includeFooter: false,
  enforceTypeCase: 'lower',
  enforceScopeCase: 'lower',
  scopeRequired: false,
  bodyRequired: false,
  allowedTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf'],
  customTypes: {}
}

const DEFAULT_RULES: CommitGenerationRules = {
  format: DEFAULT_CONFIG,
  templates: {
    feat: 'feat{scope}: {description}\n\n{body}',
    fix: 'fix{scope}: {description}\n\n{body}',
    docs: 'docs{scope}: {description}\n\n{body}',
    style: 'style{scope}: {description}\n\n{body}',
    refactor: 'refactor{scope}: {description}\n\n{body}',
    test: 'test{scope}: {description}\n\n{body}',
    chore: 'chore{scope}: {description}\n\n{body}',
    perf: 'perf{scope}: {description}\n\n{body}'
  },
  autoGenerate: true,
  includeTimestamp: false,
  includeAuthor: false,
  customPatterns: []
}

export class CommitMessageGenerator {
  private rules: CommitGenerationRules

  constructor(rules?: Partial<CommitGenerationRules>) {
    this.rules = { ...DEFAULT_RULES, ...rules }
    if (rules?.format) {
      this.rules.format = { ...DEFAULT_CONFIG, ...rules.format }
    }
  }

  /**
   * Generates a formatted commit message from a suggestion
   */
  generateMessage(suggestion: CommitSuggestion): string {
    const { templates } = this.rules

    // Apply custom patterns first
    const processedSuggestion = this.applyCustomPatterns(suggestion)

    // Validate type
    const validatedType = this.validateAndFormatType(processedSuggestion.type)
    
    // Format scope
    const formattedScope = this.formatScope(processedSuggestion.scope)
    
    // Format description
    const formattedDescription = this.formatDescription(processedSuggestion.description)
    
    // Format body
    const formattedBody = this.formatBody(processedSuggestion.body)

    // Use template if available
    const template = templates[validatedType] || templates.feat
    
    let message = template
      .replace('{type}', validatedType)
      .replace('{scope}', formattedScope ? `(${formattedScope})` : '')
      .replace('{description}', formattedDescription)
      .replace('{body}', formattedBody || '')

    // Clean up extra whitespace and newlines
    message = this.cleanupMessage(message)

    // Add optional metadata
    message = this.addMetadata(message)

    return message
  }

  /**
   * Generates multiple message variations
   */
  generateVariations(suggestion: CommitSuggestion): string[] {
    const variations: string[] = []
    
    // Primary message
    variations.push(this.generateMessage(suggestion))
    
    // Variation without scope
    if (suggestion.scope) {
      const noScopeVariation = { ...suggestion, scope: '' }
      variations.push(this.generateMessage(noScopeVariation))
    }
    
    // Variation without body
    if (suggestion.body) {
      const noBodyVariation = { ...suggestion, body: '' }
      variations.push(this.generateMessage(noBodyVariation))
    }
    
    // Short variation (description only)
    const shortVariation = {
      ...suggestion,
      body: '',
      description: this.shortenDescription(suggestion.description)
    }
    variations.push(this.generateMessage(shortVariation))
    
    // Remove duplicates
    return [...new Set(variations)]
  }

  /**
   * Validates commit message format
   */
  validateMessage(message: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    const lines = message.split('\n')
    const subjectLine = lines[0]
    
    // Check subject line length
    if (subjectLine.length > this.rules.format.maxSubjectLength) {
      errors.push(`Subject line too long (${subjectLine.length}/${this.rules.format.maxSubjectLength})`)
    }
    
    // Check conventional commit format
    const conventionalPattern = /^(\w+)(\(.+\))?: .+/
    if (!conventionalPattern.test(subjectLine)) {
      errors.push('Subject line does not follow conventional commit format')
    }
    
    // Extract type and validate
    const typeMatch = subjectLine.match(/^(\w+)/)
    if (typeMatch) {
      const type = typeMatch[1]
      if (!this.rules.format.allowedTypes.includes(type) && !this.rules.format.customTypes[type]) {
        warnings.push(`Unknown commit type: ${type}`)
      }
    }
    
    // Check body line lengths
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i]
      if (line.length > this.rules.format.maxBodyLineLength) {
        warnings.push(`Body line ${i + 1} too long (${line.length}/${this.rules.format.maxBodyLineLength})`)
      }
    }
    
    // Check required fields
    if (this.rules.format.scopeRequired && !subjectLine.includes('(')) {
      errors.push('Scope is required but missing')
    }
    
    if (this.rules.format.bodyRequired && lines.length < 3) {
      errors.push('Body is required but missing')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Updates generation rules
   */
  updateRules(newRules: Partial<CommitGenerationRules>): void {
    this.rules = { ...this.rules, ...newRules }
    if (newRules.format) {
      this.rules.format = { ...this.rules.format, ...newRules.format }
    }
  }

  /**
   * Gets current rules
   */
  getRules(): CommitGenerationRules {
    return { ...this.rules }
  }

  /**
   * Exports rules as JSON
   */
  exportRules(): string {
    return JSON.stringify(this.rules, null, 2)
  }

  /**
   * Imports rules from JSON
   */
  importRules(jsonRules: string): void {
    try {
      const rules = JSON.parse(jsonRules) as Partial<CommitGenerationRules>
      this.updateRules(rules)
    } catch (error) {
      throw new Error(`Invalid rules JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Applies custom patterns to suggestion
   */
  private applyCustomPatterns(suggestion: CommitSuggestion): CommitSuggestion {
    let processed = { ...suggestion }
    
    for (const pattern of this.rules.customPatterns) {
      if (!pattern.enabled) continue
      
      // Apply pattern to description
      if (pattern.pattern.test(processed.description)) {
        processed.description = processed.description.replace(pattern.pattern, pattern.replacement)
        
        // Override type if specified
        if (pattern.type) {
          processed.type = pattern.type
        }
        
        // Override scope if specified
        if (pattern.scope) {
          processed.scope = pattern.scope
        }
      }
    }
    
    return processed
  }

  /**
   * Validates and formats commit type
   */
  private validateAndFormatType(type: string): string {
    const { format } = this.rules
    
    // Check if type is allowed
    if (!format.allowedTypes.includes(type) && !format.customTypes[type]) {
      // Default to 'chore' for unknown types
      type = 'chore'
    }
    
    // Apply case formatting
    switch (format.enforceTypeCase) {
      case 'upper':
        return type.toUpperCase()
      case 'title':
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
      case 'lower':
      default:
        return type.toLowerCase()
    }
  }

  /**
   * Formats scope according to rules
   */
  private formatScope(scope: string): string {
    if (!scope) return ''
    
    const { format } = this.rules
    
    // Apply case formatting
    switch (format.enforceScopeCase) {
      case 'upper':
        return scope.toUpperCase()
      case 'title':
        return scope.charAt(0).toUpperCase() + scope.slice(1).toLowerCase()
      case 'lower':
      default:
        return scope.toLowerCase()
    }
  }

  /**
   * Formats description according to rules
   */
  private formatDescription(description: string): string {
    const { format } = this.rules
    
    // Ensure description doesn't exceed max length
    if (description.length > format.maxSubjectLength - 20) { // Reserve space for type and scope
      description = description.substring(0, format.maxSubjectLength - 23) + '...'
    }
    
    // Ensure description starts with lowercase (conventional commit style)
    return description.charAt(0).toLowerCase() + description.slice(1)
  }

  /**
   * Formats body according to rules
   */
  private formatBody(body?: string): string {
    if (!body || !this.rules.format.includeBody) return ''
    
    const { format } = this.rules
    
    // Split into lines and wrap long lines
    const lines = body.split('\n')
    const wrappedLines: string[] = []
    
    for (const line of lines) {
      if (line.length <= format.maxBodyLineLength) {
        wrappedLines.push(line)
      } else {
        // Simple word wrapping
        const words = line.split(' ')
        let currentLine = ''
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= format.maxBodyLineLength) {
            currentLine += (currentLine ? ' ' : '') + word
          } else {
            if (currentLine) {
              wrappedLines.push(currentLine)
            }
            currentLine = word
          }
        }
        
        if (currentLine) {
          wrappedLines.push(currentLine)
        }
      }
    }
    
    return wrappedLines.join('\n')
  }

  /**
   * Cleans up message formatting
   */
  private cleanupMessage(message: string): string {
    return message
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra blank lines
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .trim()
  }

  /**
   * Adds optional metadata to message
   */
  private addMetadata(message: string): string {
    const metadata: string[] = []
    
    if (this.rules.includeTimestamp) {
      metadata.push(`Timestamp: ${new Date().toISOString()}`)
    }
    
    if (this.rules.includeAuthor) {
      // This would typically come from git config or user settings
      metadata.push('Author: DevKit Flow')
    }
    
    if (metadata.length > 0) {
      message += '\n\n' + metadata.join('\n')
    }
    
    return message
  }

  /**
   * Creates a shortened version of description
   */
  private shortenDescription(description: string): string {
    if (description.length <= 30) return description
    
    // Try to find a natural break point
    const words = description.split(' ')
    let shortened = ''
    
    for (const word of words) {
      if ((shortened + ' ' + word).length > 30) {
        break
      }
      shortened += (shortened ? ' ' : '') + word
    }
    
    return shortened || description.substring(0, 27) + '...'
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Export singleton instance with default rules
export const commitMessageGenerator = new CommitMessageGenerator()

// Export factory function for custom instances
export const createCommitMessageGenerator = (rules?: Partial<CommitGenerationRules>) => {
  return new CommitMessageGenerator(rules)
}