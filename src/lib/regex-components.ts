import type { RegexComponent, ComponentCategory } from '../types'

/**
 * Comprehensive library of regex components for visual pattern building
 * Each component represents a regex construct with visual representation and parameters
 */

// Character Classes Components
const characterClassComponents: RegexComponent[] = [
  {
    id: 'any-char',
    name: 'Any Character',
    description: 'Matches any single character except newline',
    category: 'character-classes',
    regexPattern: '.',
    visualRepresentation: {
      icon: '•',
      color: '#3B82F6',
      label: 'Any'
    },
    examples: ['a', '5', '@', ' '],
    commonUses: ['Wildcard matching', 'Placeholder for unknown characters']
  },
  {
    id: 'digit',
    name: 'Digit',
    description: 'Matches any digit (0-9)',
    category: 'character-classes',
    regexPattern: '\\d',
    visualRepresentation: {
      icon: '0-9',
      color: '#10B981',
      label: 'Digit'
    },
    examples: ['0', '5', '9'],
    commonUses: ['Phone numbers', 'IDs', 'Numeric validation']
  },
  {
    id: 'word-char',
    name: 'Word Character',
    description: 'Matches letters, digits, and underscores',
    category: 'character-classes',
    regexPattern: '\\w',
    visualRepresentation: {
      icon: 'A-z',
      color: '#8B5CF6',
      label: 'Word'
    },
    examples: ['a', 'Z', '5', '_'],
    commonUses: ['Variable names', 'Identifiers', 'Alphanumeric text']
  },
  {
    id: 'whitespace',
    name: 'Whitespace',
    description: 'Matches spaces, tabs, newlines',
    category: 'character-classes',
    regexPattern: '\\s',
    visualRepresentation: {
      icon: '⎵',
      color: '#6B7280',
      label: 'Space'
    },
    examples: [' ', '\t', '\n'],
    commonUses: ['Separating words', 'Formatting', 'Line breaks']
  },
  {
    id: 'custom-class',
    name: 'Custom Character Class',
    description: 'Matches any character in the specified set',
    category: 'character-classes',
    regexPattern: '[{chars}]',
    visualRepresentation: {
      icon: '[...]',
      color: '#F59E0B',
      label: 'Custom'
    },
    parameters: [
      {
        name: 'chars',
        type: 'string',
        description: 'Characters to match',
        placeholder: 'abc123',
        default: 'abc'
      }
    ],
    examples: ['[abc]', '[0-9]', '[A-Za-z]'],
    commonUses: ['Specific character sets', 'Case-insensitive matching', 'Limited character ranges']
  },
  {
    id: 'negated-class',
    name: 'Negated Character Class',
    description: 'Matches any character NOT in the specified set',
    category: 'character-classes',
    regexPattern: '[^{chars}]',
    visualRepresentation: {
      icon: '[^...]',
      color: '#EF4444',
      label: 'Not'
    },
    parameters: [
      {
        name: 'chars',
        type: 'string',
        description: 'Characters to exclude',
        placeholder: 'abc123',
        default: 'abc'
      }
    ],
    examples: ['[^abc]', '[^0-9]', '[^A-Za-z]'],
    commonUses: ['Excluding specific characters', 'Non-digit matching', 'Non-whitespace']
  }
]

// Anchors Components
const anchorComponents: RegexComponent[] = [
  {
    id: 'start-anchor',
    name: 'Start of String',
    description: 'Matches the beginning of the string',
    category: 'anchors',
    regexPattern: '^',
    visualRepresentation: {
      icon: '⌃',
      color: '#059669',
      label: 'Start'
    },
    examples: ['^Hello matches "Hello world"'],
    commonUses: ['Line beginning', 'String validation', 'Prefix matching']
  },
  {
    id: 'end-anchor',
    name: 'End of String',
    description: 'Matches the end of the string',
    category: 'anchors',
    regexPattern: '$',
    visualRepresentation: {
      icon: '$',
      color: '#DC2626',
      label: 'End'
    },
    examples: ['world$ matches "Hello world"'],
    commonUses: ['Line ending', 'String validation', 'Suffix matching']
  },
  {
    id: 'word-boundary',
    name: 'Word Boundary',
    description: 'Matches between word and non-word characters',
    category: 'anchors',
    regexPattern: '\\b',
    visualRepresentation: {
      icon: '|',
      color: '#7C3AED',
      label: 'Boundary'
    },
    examples: ['\\bcat\\b matches "cat" but not "category"'],
    commonUses: ['Whole word matching', 'Word isolation', 'Preventing partial matches']
  },
  {
    id: 'non-word-boundary',
    name: 'Non-Word Boundary',
    description: 'Matches where there is no word boundary',
    category: 'anchors',
    regexPattern: '\\B',
    visualRepresentation: {
      icon: '¦',
      color: '#BE185D',
      label: 'Non-Boundary'
    },
    examples: ['\\Bcat\\B matches "cat" in "concatenate"'],
    commonUses: ['Partial word matching', 'Inside word patterns', 'Continuous text']
  }
]

// Quantifiers Components
const quantifierComponents: RegexComponent[] = [
  {
    id: 'zero-or-more',
    name: 'Zero or More',
    description: 'Matches zero or more of the preceding element',
    category: 'quantifiers',
    regexPattern: '*',
    visualRepresentation: {
      icon: '*',
      color: '#F97316',
      label: '0+'
    },
    examples: ['a* matches "", "a", "aa", "aaa"'],
    commonUses: ['Optional repetition', 'Variable length matching', 'Flexible patterns']
  },
  {
    id: 'one-or-more',
    name: 'One or More',
    description: 'Matches one or more of the preceding element',
    category: 'quantifiers',
    regexPattern: '+',
    visualRepresentation: {
      icon: '+',
      color: '#EA580C',
      label: '1+'
    },
    examples: ['a+ matches "a", "aa", "aaa" but not ""'],
    commonUses: ['Required repetition', 'Non-empty sequences', 'Multiple occurrences']
  },
  {
    id: 'zero-or-one',
    name: 'Zero or One',
    description: 'Matches zero or one of the preceding element',
    category: 'quantifiers',
    regexPattern: '?',
    visualRepresentation: {
      icon: '?',
      color: '#0EA5E9',
      label: '0-1'
    },
    examples: ['colou?r matches "color" and "colour"'],
    commonUses: ['Optional elements', 'Alternative spellings', 'Conditional matching']
  },
  {
    id: 'exact-count',
    name: 'Exact Count',
    description: 'Matches exactly n occurrences',
    category: 'quantifiers',
    regexPattern: '{{count}}',
    visualRepresentation: {
      icon: '{n}',
      color: '#7C2D12',
      label: 'Exact'
    },
    parameters: [
      {
        name: 'count',
        type: 'number',
        description: 'Exact number of occurrences',
        min: 1,
        max: 999,
        default: 3
      }
    ],
    examples: ['a{3} matches "aaa"'],
    commonUses: ['Fixed length patterns', 'Specific repetitions', 'Format validation']
  },
  {
    id: 'range-count',
    name: 'Range Count',
    description: 'Matches between min and max occurrences',
    category: 'quantifiers',
    regexPattern: '{{min},{max}}',
    visualRepresentation: {
      icon: '{n,m}',
      color: '#92400E',
      label: 'Range'
    },
    parameters: [
      {
        name: 'min',
        type: 'number',
        description: 'Minimum occurrences',
        min: 0,
        max: 999,
        default: 2
      },
      {
        name: 'max',
        type: 'number',
        description: 'Maximum occurrences',
        min: 1,
        max: 999,
        default: 5
      }
    ],
    examples: ['a{2,4} matches "aa", "aaa", "aaaa"'],
    commonUses: ['Flexible length', 'Bounded repetition', 'Range validation']
  }
]

// Groups Components
const groupComponents: RegexComponent[] = [
  {
    id: 'capturing-group',
    name: 'Capturing Group',
    description: 'Groups elements and captures the match',
    category: 'groups',
    regexPattern: '({content})',
    visualRepresentation: {
      icon: '( )',
      color: '#1D4ED8',
      label: 'Group',
      isContainer: true
    },
    parameters: [
      {
        name: 'content',
        type: 'components',
        description: 'Content to group and capture',
        default: 'abc'
      }
    ],
    examples: ['(abc) captures "abc" as group 1'],
    commonUses: ['Extracting parts', 'Backreferences', 'Organizing patterns']
  },
  {
    id: 'non-capturing-group',
    name: 'Non-Capturing Group',
    description: 'Groups elements without capturing',
    category: 'groups',
    regexPattern: '(?:{content})',
    visualRepresentation: {
      icon: '(?:)',
      color: '#1E40AF',
      label: 'Non-Cap',
      isContainer: true
    },
    parameters: [
      {
        name: 'content',
        type: 'components',
        description: 'Content to group without capturing',
        default: 'abc'
      }
    ],
    examples: ['(?:abc) groups but doesn\'t capture'],
    commonUses: ['Grouping for quantifiers', 'Organizing without capture', 'Performance optimization']
  },
  {
    id: 'alternation',
    name: 'Alternation',
    description: 'Matches one of several alternatives',
    category: 'groups',
    regexPattern: '({option1}|{option2})',
    visualRepresentation: {
      icon: 'A|B',
      color: '#7C3AED',
      label: 'Or'
    },
    parameters: [
      {
        name: 'option1',
        type: 'string',
        description: 'First alternative',
        default: 'cat'
      },
      {
        name: 'option2',
        type: 'string',
        description: 'Second alternative',
        default: 'dog'
      }
    ],
    examples: ['(cat|dog) matches "cat" or "dog"'],
    commonUses: ['Multiple options', 'Alternative spellings', 'Choice patterns']
  }
]

// Lookarounds Components
const lookaroundComponents: RegexComponent[] = [
  {
    id: 'positive-lookahead',
    name: 'Positive Lookahead',
    description: 'Matches if followed by the specified pattern',
    category: 'lookarounds',
    regexPattern: '(?={pattern})',
    visualRepresentation: {
      icon: '(?=)',
      color: '#059669',
      label: 'Look+'
    },
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'Pattern that must follow',
        default: 'abc'
      }
    ],
    examples: ['\\d(?=px) matches digits followed by "px"'],
    commonUses: ['Conditional matching', 'Context validation', 'Complex patterns']
  },
  {
    id: 'negative-lookahead',
    name: 'Negative Lookahead',
    description: 'Matches if NOT followed by the specified pattern',
    category: 'lookarounds',
    regexPattern: '(?!{pattern})',
    visualRepresentation: {
      icon: '(?!)',
      color: '#DC2626',
      label: 'Look-'
    },
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'Pattern that must NOT follow',
        default: 'abc'
      }
    ],
    examples: ['\\d(?!px) matches digits not followed by "px"'],
    commonUses: ['Exclusion patterns', 'Negative conditions', 'Complex validation']
  },
  {
    id: 'positive-lookbehind',
    name: 'Positive Lookbehind',
    description: 'Matches if preceded by the specified pattern',
    category: 'lookarounds',
    regexPattern: '(?<={pattern})',
    visualRepresentation: {
      icon: '(?<=)',
      color: '#0891B2',
      label: 'Behind+'
    },
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'Pattern that must precede',
        default: 'abc'
      }
    ],
    examples: ['(?<=\\$)\\d+ matches numbers after "$"'],
    commonUses: ['Context-dependent matching', 'Prefix validation', 'Advanced patterns']
  },
  {
    id: 'negative-lookbehind',
    name: 'Negative Lookbehind',
    description: 'Matches if NOT preceded by the specified pattern',
    category: 'lookarounds',
    regexPattern: '(?<!{pattern})',
    visualRepresentation: {
      icon: '(?<!)',
      color: '#BE185D',
      label: 'Behind-'
    },
    parameters: [
      {
        name: 'pattern',
        type: 'string',
        description: 'Pattern that must NOT precede',
        default: 'abc'
      }
    ],
    examples: ['(?<!\\$)\\d+ matches numbers not after "$"'],
    commonUses: ['Exclusion patterns', 'Negative context', 'Complex validation']
  }
]

// Shortcuts Components
const shortcutComponents: RegexComponent[] = [
  {
    id: 'email-pattern',
    name: 'Email Pattern',
    description: 'Common email validation pattern',
    category: 'shortcuts',
    regexPattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    visualRepresentation: {
      icon: '@',
      color: '#0F766E',
      label: 'Email'
    },
    examples: ['user@example.com', 'test.email+tag@domain.co.uk'],
    commonUses: ['Email validation', 'Contact forms', 'User registration']
  },
  {
    id: 'url-pattern',
    name: 'URL Pattern',
    description: 'Basic URL matching pattern',
    category: 'shortcuts',
    regexPattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?',
    visualRepresentation: {
      icon: '🔗',
      color: '#1E40AF',
      label: 'URL'
    },
    examples: ['https://example.com', 'http://sub.domain.org/path'],
    commonUses: ['Link validation', 'URL extraction', 'Web scraping']
  },
  {
    id: 'phone-pattern',
    name: 'Phone Pattern',
    description: 'US phone number pattern',
    category: 'shortcuts',
    regexPattern: '\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}',
    visualRepresentation: {
      icon: '📞',
      color: '#7C2D12',
      label: 'Phone'
    },
    examples: ['(555) 123-4567', '555-123-4567', '555.123.4567'],
    commonUses: ['Phone validation', 'Contact forms', 'Data extraction']
  },
  {
    id: 'date-pattern',
    name: 'Date Pattern',
    description: 'MM/DD/YYYY date format',
    category: 'shortcuts',
    regexPattern: '\\d{1,2}/\\d{1,2}/\\d{4}',
    visualRepresentation: {
      icon: '📅',
      color: '#B45309',
      label: 'Date'
    },
    examples: ['12/31/2023', '1/1/2024', '06/15/2023'],
    commonUses: ['Date validation', 'Form inputs', 'Data parsing']
  }
]

// Modifiers Components
const modifierComponents: RegexComponent[] = [
  {
    id: 'case-insensitive',
    name: 'Case Insensitive',
    description: 'Makes the pattern case-insensitive',
    category: 'modifiers',
    regexPattern: '(?i)',
    visualRepresentation: {
      icon: 'Aa',
      color: '#7C3AED',
      label: 'Case'
    },
    examples: ['(?i)hello matches "Hello", "HELLO", "hello"'],
    commonUses: ['Case-insensitive matching', 'User input validation', 'Flexible text search']
  },
  {
    id: 'multiline',
    name: 'Multiline Mode',
    description: 'Makes ^ and $ match line boundaries instead of string boundaries',
    category: 'modifiers',
    regexPattern: '(?m)',
    visualRepresentation: {
      icon: '↵',
      color: '#7C3AED',
      label: 'Multi'
    },
    examples: ['(?m)^line matches "line" at the start of any line'],
    commonUses: ['Multi-line text processing', 'Line-by-line matching', 'Text file parsing']
  },
  {
    id: 'dotall',
    name: 'Dot All Mode',
    description: 'Makes . match newline characters as well',
    category: 'modifiers',
    regexPattern: '(?s)',
    visualRepresentation: {
      icon: '.\\n',
      color: '#7C3AED',
      label: 'DotAll'
    },
    examples: ['(?s).* matches text including newlines'],
    commonUses: ['Multi-line content matching', 'HTML/XML parsing', 'Full text extraction']
  }
]

// Combine all components
export const allRegexComponents: RegexComponent[] = [
  ...characterClassComponents,
  ...anchorComponents,
  ...quantifierComponents,
  ...groupComponents,
  ...lookaroundComponents,
  ...modifierComponents,
  ...shortcutComponents
]

// Component categories for organization
export const componentCategories: { [key in ComponentCategory]: { name: string; description: string; color: string } } = {
  'character-classes': {
    name: 'Character Classes',
    description: 'Match specific types of characters',
    color: '#3B82F6'
  },
  'anchors': {
    name: 'Anchors',
    description: 'Match positions in text',
    color: '#059669'
  },
  'quantifiers': {
    name: 'Quantifiers',
    description: 'Specify how many times to match',
    color: '#F97316'
  },
  'groups': {
    name: 'Groups',
    description: 'Group and capture parts of patterns',
    color: '#1D4ED8'
  },
  'lookarounds': {
    name: 'Lookarounds',
    description: 'Match based on surrounding context',
    color: '#059669'
  },
  'modifiers': {
    name: 'Modifiers',
    description: 'Modify pattern behavior',
    color: '#7C3AED'
  },
  'shortcuts': {
    name: 'Common Patterns',
    description: 'Pre-built patterns for common use cases',
    color: '#0F766E'
  }
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: ComponentCategory): RegexComponent[] {
  return allRegexComponents.filter(component => component.category === category)
}

/**
 * Get component by ID
 */
export function getComponentById(id: string): RegexComponent | undefined {
  return allRegexComponents.find(component => component.id === id)
}

/**
 * Search components by name or description
 */
export function searchComponents(query: string): RegexComponent[] {
  const lowercaseQuery = query.toLowerCase()
  return allRegexComponents.filter(component =>
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.description.toLowerCase().includes(lowercaseQuery) ||
    component.commonUses.some(use => use.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Validate component parameters
 */
export function validateComponentParameters(component: RegexComponent, parameters: Record<string, any>): string[] {
  const errors: string[] = []
  
  if (!component.parameters) return errors
  
  for (const param of component.parameters) {
    const value = parameters[param.name]
    
    if (value === undefined || value === null || value === '') {
      errors.push(`Parameter '${param.name}' is required`)
      continue
    }
    
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
  
  return errors
}

/**
 * Generate regex pattern from component with parameters
 */
export function generateComponentPattern(component: RegexComponent, parameters: Record<string, any> = {}): string {
  let pattern = component.regexPattern
  
  if (component.parameters) {
    for (const param of component.parameters) {
      const value = parameters[param.name] ?? param.default
      const placeholder = `{${param.name}}`
      
      if (pattern.includes(placeholder)) {
        // Use a simple string replacement instead of regex to avoid escaping issues
        pattern = pattern.split(placeholder).join(String(value))
      }
    }
  }
  
  return pattern
}