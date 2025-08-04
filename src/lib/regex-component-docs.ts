import type { RegexComponent, ComponentCategory } from '../types'
import { allRegexComponents, componentCategories } from './regex-components'

/**
 * Documentation and metadata system for regex components
 */

export interface ComponentDocumentation {
  component: RegexComponent
  detailedDescription: string
  syntaxExplanation: string
  useCases: Array<{
    title: string
    description: string
    example: string
    explanation: string
  }>
  relatedComponents: RegexComponent[]
  commonMistakes: Array<{
    mistake: string
    correction: string
    explanation: string
  }>
  performanceNotes: string[]
  browserSupport: {
    chrome: boolean
    firefox: boolean
    safari: boolean
    edge: boolean
    notes?: string
  }
}

/**
 * Comprehensive documentation for each component
 */
const componentDocumentation: Record<string, ComponentDocumentation> = {
  'any-char': {
    component: allRegexComponents.find(c => c.id === 'any-char')!,
    detailedDescription: 'The dot (.) metacharacter matches any single character except newline characters. It\'s one of the most commonly used regex elements but should be used carefully as it can match more than intended.',
    syntaxExplanation: 'The dot character (.) is a special metacharacter that represents "any character". In most regex flavors, it matches any character except \\n (newline).',
    useCases: [
      {
        title: 'Wildcard Matching',
        description: 'Match files with any single character in a specific position',
        example: 'file.txt matches "file1.txt", "fileA.txt", "file_.txt"',
        explanation: 'The dot matches any single character between "file" and ".txt"'
      },
      {
        title: 'Template Matching',
        description: 'Match patterns where one character can vary',
        example: 'c.t matches "cat", "cut", "cot", "c@t"',
        explanation: 'Useful for finding words with similar patterns but one variable character'
      }
    ],
    relatedComponents: [
      allRegexComponents.find(c => c.id === 'custom-class')!,
      allRegexComponents.find(c => c.id === 'word-char')!
    ],
    commonMistakes: [
      {
        mistake: 'Using . when you want a literal dot',
        correction: 'Use \\. to match a literal dot character',
        explanation: 'The dot is a metacharacter, so it needs to be escaped to match literally'
      },
      {
        mistake: 'Expecting . to match newlines',
        correction: 'Use [\\s\\S] or enable dotall mode',
        explanation: 'By default, dot doesn\'t match newline characters'
      }
    ],
    performanceNotes: [
      'Can be slow with large texts as it matches almost everything',
      'Consider using more specific character classes when possible'
    ],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true
    }
  },
  
  'digit': {
    component: allRegexComponents.find(c => c.id === 'digit')!,
    detailedDescription: 'The \\d character class matches any digit from 0 to 9. It\'s equivalent to [0-9] and is commonly used for numeric validation and extraction.',
    syntaxExplanation: '\\d is a predefined character class that matches any ASCII digit (0-9). It\'s a shorthand for the character class [0-9].',
    useCases: [
      {
        title: 'Phone Number Validation',
        description: 'Extract or validate phone numbers',
        example: '\\d{3}-\\d{3}-\\d{4} matches "555-123-4567"',
        explanation: 'Matches exactly 3 digits, hyphen, 3 digits, hyphen, 4 digits'
      },
      {
        title: 'ID Extraction',
        description: 'Find numeric IDs in text',
        example: 'ID: \\d+ matches "ID: 12345"',
        explanation: 'Matches "ID: " followed by one or more digits'
      }
    ],
    relatedComponents: [
      allRegexComponents.find(c => c.id === 'word-char')!,
      allRegexComponents.find(c => c.id === 'custom-class')!
    ],
    commonMistakes: [
      {
        mistake: 'Expecting \\d to match Unicode digits',
        correction: 'Use [0-9] for ASCII only, or check Unicode support',
        explanation: 'In some contexts, \\d might match Unicode digits beyond 0-9'
      }
    ],
    performanceNotes: [
      'Very efficient as it\'s a built-in character class',
      'Faster than equivalent [0-9] in most regex engines'
    ],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true
    }
  },

  'start-anchor': {
    component: allRegexComponents.find(c => c.id === 'start-anchor')!,
    detailedDescription: 'The caret (^) anchor matches the position at the beginning of the string or line. It doesn\'t consume any characters but asserts a position.',
    syntaxExplanation: 'The ^ symbol is an anchor that asserts the position at the start of a string. In multiline mode, it also matches the start of each line.',
    useCases: [
      {
        title: 'String Validation',
        description: 'Ensure a pattern matches from the very beginning',
        example: '^Hello matches only strings that start with "Hello"',
        explanation: 'Without ^, "Hello" would match anywhere in the string'
      },
      {
        title: 'Line-by-line Processing',
        description: 'Match patterns at the start of each line',
        example: '^\\d+ matches numbers at the start of lines',
        explanation: 'In multiline mode, matches digits at the beginning of any line'
      }
    ],
    relatedComponents: [
      allRegexComponents.find(c => c.id === 'end-anchor')!,
      allRegexComponents.find(c => c.id === 'word-boundary')!
    ],
    commonMistakes: [
      {
        mistake: 'Using ^ inside character classes',
        correction: 'Use ^ outside brackets for start anchor, inside for negation',
        explanation: 'Inside [], ^ means "not these characters", outside it means "start of string"'
      }
    ],
    performanceNotes: [
      'Very fast as it\'s just a position check',
      'Can significantly improve performance by preventing unnecessary backtracking'
    ],
    browserSupport: {
      chrome: true,
      firefox: true,
      safari: true,
      edge: true
    }
  }
}

/**
 * Get documentation for a component
 */
export function getComponentDocumentation(componentId: string): ComponentDocumentation | null {
  return componentDocumentation[componentId] || null
}

/**
 * Get all documented components
 */
export function getAllDocumentedComponents(): ComponentDocumentation[] {
  return Object.values(componentDocumentation)
}

/**
 * Search component documentation
 */
export function searchComponentDocumentation(query: string): ComponentDocumentation[] {
  const lowercaseQuery = query.toLowerCase()
  
  return Object.values(componentDocumentation).filter(doc => {
    return (
      doc.component.name.toLowerCase().includes(lowercaseQuery) ||
      doc.component.description.toLowerCase().includes(lowercaseQuery) ||
      doc.detailedDescription.toLowerCase().includes(lowercaseQuery) ||
      doc.useCases.some(useCase => 
        useCase.title.toLowerCase().includes(lowercaseQuery) ||
        useCase.description.toLowerCase().includes(lowercaseQuery)
      )
    )
  })
}

/**
 * Get components by difficulty level
 */
export function getComponentsByDifficulty(level: 'beginner' | 'intermediate' | 'advanced'): RegexComponent[] {
  const beginnerComponents = ['any-char', 'digit', 'word-char', 'whitespace', 'start-anchor', 'end-anchor']
  const intermediateComponents = ['custom-class', 'negated-class', 'word-boundary', 'zero-or-more', 'one-or-more', 'zero-or-one']
  const advancedComponents = ['positive-lookahead', 'negative-lookahead', 'positive-lookbehind', 'negative-lookbehind']
  
  let componentIds: string[]
  switch (level) {
    case 'beginner':
      componentIds = beginnerComponents
      break
    case 'intermediate':
      componentIds = [...beginnerComponents, ...intermediateComponents]
      break
    case 'advanced':
      componentIds = [...beginnerComponents, ...intermediateComponents, ...advancedComponents]
      break
  }
  
  return allRegexComponents.filter(component => componentIds.includes(component.id))
}

/**
 * Get learning path for regex components
 */
export function getComponentLearningPath(): Array<{
  level: string
  title: string
  description: string
  components: RegexComponent[]
  exercises: Array<{
    title: string
    description: string
    pattern: string
    testCases: string[]
  }>
}> {
  return [
    {
      level: 'Beginner',
      title: 'Basic Character Matching',
      description: 'Learn to match specific characters and positions',
      components: getComponentsByDifficulty('beginner').slice(0, 6),
      exercises: [
        {
          title: 'Match any digit',
          description: 'Create a pattern that matches any single digit',
          pattern: '\\d',
          testCases: ['5', 'a', '123', '']
        },
        {
          title: 'Match word at start',
          description: 'Match "hello" only at the beginning of text',
          pattern: '^hello',
          testCases: ['hello world', 'say hello', 'hello', 'HELLO']
        }
      ]
    },
    {
      level: 'Intermediate',
      title: 'Quantifiers and Groups',
      description: 'Control how many times patterns match and group them',
      components: getComponentsByDifficulty('intermediate').slice(6, 12),
      exercises: [
        {
          title: 'Match phone numbers',
          description: 'Match US phone numbers in format (xxx) xxx-xxxx',
          pattern: '\\(\\d{3}\\) \\d{3}-\\d{4}',
          testCases: ['(555) 123-4567', '555-123-4567', '(555)123-4567']
        }
      ]
    },
    {
      level: 'Advanced',
      title: 'Lookarounds and Complex Patterns',
      description: 'Master advanced regex features for complex matching',
      components: getComponentsByDifficulty('advanced').slice(12),
      exercises: [
        {
          title: 'Password validation',
          description: 'Match passwords with at least one digit and one letter',
          pattern: '^(?=.*\\d)(?=.*[a-zA-Z]).{8,}$',
          testCases: ['password123', 'PASSWORD', '12345678', 'Pass123!']
        }
      ]
    }
  ]
}

/**
 * Get component compatibility information
 */
export function getComponentCompatibility(componentId: string): {
  javascript: boolean
  python: boolean
  java: boolean
  csharp: boolean
  php: boolean
  notes: string[]
} {
  // This would be expanded with real compatibility data
  const defaultCompatibility = {
    javascript: true,
    python: true,
    java: true,
    csharp: true,
    php: true,
    notes: []
  }
  
  // Special cases for components with limited support
  const specialCases: Record<string, any> = {
    'positive-lookbehind': {
      javascript: true, // Modern browsers support it
      python: true,
      java: true,
      csharp: true,
      php: true,
      notes: ['Lookbehind support varies by JavaScript engine version']
    },
    'negative-lookbehind': {
      javascript: true,
      python: true,
      java: true,
      csharp: true,
      php: true,
      notes: ['Lookbehind support varies by JavaScript engine version']
    }
  }
  
  return specialCases[componentId] || defaultCompatibility
}

/**
 * Generate component cheat sheet
 */
export function generateComponentCheatSheet(): string {
  let cheatSheet = '# Regex Components Cheat Sheet\n\n'
  
  for (const [categoryKey, categoryInfo] of Object.entries(componentCategories)) {
    cheatSheet += `## ${categoryInfo.name}\n`
    cheatSheet += `${categoryInfo.description}\n\n`
    
    const categoryComponents = allRegexComponents.filter(c => c.category === categoryKey as ComponentCategory)
    
    for (const component of categoryComponents) {
      cheatSheet += `### ${component.name}\n`
      cheatSheet += `**Pattern:** \`${component.regexPattern}\`\n`
      cheatSheet += `**Description:** ${component.description}\n`
      cheatSheet += `**Examples:** ${component.examples.join(', ')}\n\n`
    }
  }
  
  return cheatSheet
}