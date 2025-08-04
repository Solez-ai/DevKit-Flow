import type { ComponentParameter } from '../types'

/**
 * Parameter presets for common component configurations
 */

export interface ParameterPreset {
  id: string
  name: string
  description: string
  componentId: string
  parameters: Record<string, any>
  tags: string[]
  usageExample: string
}

/**
 * Predefined parameter presets for common use cases
 */
export const parameterPresets: ParameterPreset[] = [
  // Custom Character Class Presets
  {
    id: 'custom-class-letters',
    name: 'Letters Only',
    description: 'Match only alphabetic characters',
    componentId: 'custom-class',
    parameters: { chars: 'a-zA-Z' },
    tags: ['letters', 'alphabet', 'text'],
    usageExample: 'Match names, words without numbers'
  },
  {
    id: 'custom-class-alphanumeric',
    name: 'Alphanumeric',
    description: 'Match letters and numbers',
    componentId: 'custom-class',
    parameters: { chars: 'a-zA-Z0-9' },
    tags: ['alphanumeric', 'username', 'id'],
    usageExample: 'Match usernames, IDs, codes'
  },
  {
    id: 'custom-class-hex',
    name: 'Hexadecimal',
    description: 'Match hexadecimal characters',
    componentId: 'custom-class',
    parameters: { chars: '0-9A-Fa-f' },
    tags: ['hex', 'color', 'hash'],
    usageExample: 'Match color codes, hash values'
  },
  {
    id: 'custom-class-vowels',
    name: 'Vowels',
    description: 'Match vowel characters',
    componentId: 'custom-class',
    parameters: { chars: 'aeiouAEIOU' },
    tags: ['vowels', 'linguistics'],
    usageExample: 'Text analysis, word patterns'
  },
  {
    id: 'custom-class-consonants',
    name: 'Consonants',
    description: 'Match consonant characters',
    componentId: 'custom-class',
    parameters: { chars: 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ' },
    tags: ['consonants', 'linguistics'],
    usageExample: 'Text analysis, phonetic patterns'
  },

  // Negated Character Class Presets
  {
    id: 'negated-class-no-digits',
    name: 'No Digits',
    description: 'Match anything except digits',
    componentId: 'negated-class',
    parameters: { chars: '0-9' },
    tags: ['no-digits', 'text-only'],
    usageExample: 'Filter out numeric characters'
  },
  {
    id: 'negated-class-no-whitespace',
    name: 'No Whitespace',
    description: 'Match non-whitespace characters',
    componentId: 'negated-class',
    parameters: { chars: ' \\t\\n\\r' },
    tags: ['no-space', 'compact'],
    usageExample: 'Match continuous text without spaces'
  },
  {
    id: 'negated-class-no-punctuation',
    name: 'No Punctuation',
    description: 'Match characters except punctuation',
    componentId: 'negated-class',
    parameters: { chars: '.,;:!?"\'-()[]{}' },
    tags: ['no-punctuation', 'clean-text'],
    usageExample: 'Extract clean text without punctuation'
  },

  // Exact Count Presets
  {
    id: 'exact-count-phone',
    name: 'Phone Digits',
    description: 'Exactly 10 digits for phone numbers',
    componentId: 'exact-count',
    parameters: { count: 10 },
    tags: ['phone', 'digits', 'validation'],
    usageExample: 'US phone number validation'
  },
  {
    id: 'exact-count-zip',
    name: 'ZIP Code',
    description: 'Exactly 5 digits for ZIP codes',
    componentId: 'exact-count',
    parameters: { count: 5 },
    tags: ['zip', 'postal', 'validation'],
    usageExample: 'US ZIP code validation'
  },
  {
    id: 'exact-count-ssn',
    name: 'SSN Segment',
    description: 'Exactly 4 digits for SSN last segment',
    componentId: 'exact-count',
    parameters: { count: 4 },
    tags: ['ssn', 'id', 'validation'],
    usageExample: 'Social Security Number validation'
  },

  // Range Count Presets
  {
    id: 'range-count-password',
    name: 'Password Length',
    description: '8-20 characters for passwords',
    componentId: 'range-count',
    parameters: { min: 8, max: 20 },
    tags: ['password', 'security', 'validation'],
    usageExample: 'Password length validation'
  },
  {
    id: 'range-count-username',
    name: 'Username Length',
    description: '3-15 characters for usernames',
    componentId: 'range-count',
    parameters: { min: 3, max: 15 },
    tags: ['username', 'validation'],
    usageExample: 'Username length validation'
  },
  {
    id: 'range-count-name',
    name: 'Name Length',
    description: '2-50 characters for names',
    componentId: 'range-count',
    parameters: { min: 2, max: 50 },
    tags: ['name', 'validation'],
    usageExample: 'First/last name validation'
  },

  // Alternation Presets
  {
    id: 'alternation-boolean',
    name: 'Boolean Values',
    description: 'Match true or false',
    componentId: 'alternation',
    parameters: { option1: 'true', option2: 'false' },
    tags: ['boolean', 'config', 'validation'],
    usageExample: 'Configuration file parsing'
  },
  {
    id: 'alternation-yes-no',
    name: 'Yes/No',
    description: 'Match yes or no responses',
    componentId: 'alternation',
    parameters: { option1: 'yes', option2: 'no' },
    tags: ['response', 'survey', 'validation'],
    usageExample: 'Survey response validation'
  },
  {
    id: 'alternation-http-methods',
    name: 'HTTP Methods',
    description: 'Match GET or POST',
    componentId: 'alternation',
    parameters: { option1: 'GET', option2: 'POST' },
    tags: ['http', 'api', 'web'],
    usageExample: 'HTTP request parsing'
  },

  // Lookahead Presets
  {
    id: 'positive-lookahead-password',
    name: 'Password with Digit',
    description: 'Ensure password contains at least one digit',
    componentId: 'positive-lookahead',
    parameters: { pattern: '.*\\d' },
    tags: ['password', 'security', 'validation'],
    usageExample: 'Password strength validation'
  },
  {
    id: 'positive-lookahead-uppercase',
    name: 'Contains Uppercase',
    description: 'Ensure text contains uppercase letter',
    componentId: 'positive-lookahead',
    parameters: { pattern: '.*[A-Z]' },
    tags: ['uppercase', 'validation'],
    usageExample: 'Text format validation'
  },
  {
    id: 'positive-lookahead-special',
    name: 'Contains Special Character',
    description: 'Ensure text contains special character',
    componentId: 'positive-lookahead',
    parameters: { pattern: '.*[!@#$%^&*]' },
    tags: ['special', 'security', 'validation'],
    usageExample: 'Strong password validation'
  }
]

/**
 * Get presets for a specific component
 */
export function getPresetsForComponent(componentId: string): ParameterPreset[] {
  return parameterPresets.filter(preset => preset.componentId === componentId)
}

/**
 * Get preset by ID
 */
export function getPresetById(presetId: string): ParameterPreset | undefined {
  return parameterPresets.find(preset => preset.id === presetId)
}

/**
 * Search presets by name, description, or tags
 */
export function searchPresets(query: string): ParameterPreset[] {
  const lowercaseQuery = query.toLowerCase()
  
  return parameterPresets.filter(preset =>
    preset.name.toLowerCase().includes(lowercaseQuery) ||
    preset.description.toLowerCase().includes(lowercaseQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    preset.usageExample.toLowerCase().includes(lowercaseQuery)
  )
}

/**
 * Get presets by tags
 */
export function getPresetsByTags(tags: string[]): ParameterPreset[] {
  return parameterPresets.filter(preset =>
    tags.some(tag => preset.tags.includes(tag.toLowerCase()))
  )
}

/**
 * Get popular presets (most commonly used)
 */
export function getPopularPresets(limit: number = 10): ParameterPreset[] {
  // This would be based on usage statistics in a real implementation
  // For now, return a curated list of commonly used presets
  const popularIds = [
    'custom-class-letters',
    'custom-class-alphanumeric',
    'exact-count-phone',
    'range-count-password',
    'alternation-boolean',
    'positive-lookahead-password',
    'negated-class-no-digits',
    'custom-class-hex',
    'range-count-username',
    'alternation-yes-no'
  ]
  
  return popularIds
    .map(id => getPresetById(id))
    .filter(Boolean)
    .slice(0, limit) as ParameterPreset[]
}

/**
 * Create a custom preset
 */
export function createCustomPreset(
  name: string,
  description: string,
  componentId: string,
  parameters: Record<string, any>,
  tags: string[] = [],
  usageExample: string = ''
): ParameterPreset {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    componentId,
    parameters,
    tags,
    usageExample
  }
}

/**
 * Validate preset parameters against component definition
 */
export function validatePreset(preset: ParameterPreset, componentParameters: ComponentParameter[]): string[] {
  const errors: string[] = []
  
  for (const param of componentParameters) {
    const value = preset.parameters[param.name]
    
    if (value === undefined && param.default === undefined) {
      errors.push(`Missing required parameter: ${param.name}`)
      continue
    }
    
    if (value !== undefined) {
      switch (param.type) {
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`Parameter '${param.name}' must be a number`)
          } else {
            if (param.min !== undefined && value < param.min) {
              errors.push(`Parameter '${param.name}' must be at least ${param.min}`)
            }
            if (param.max !== undefined && value > param.max) {
              errors.push(`Parameter '${param.name}' must be at most ${param.max}`)
            }
          }
          break
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Parameter '${param.name}' must be a string`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Parameter '${param.name}' must be a boolean`)
          }
          break
      }
    }
  }
  
  return errors
}