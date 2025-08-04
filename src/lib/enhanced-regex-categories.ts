/**
 * Enhanced component categories with pattern library integration
 * Implements the enhanced category system for Task 9.1
 */

import type { 
  ComponentCategory,
  EnhancedComponentCategory,
  ComponentSubcategory,
  PatternLibraryIntegration,
  PatternLibrary,
  PatternLibraryItem
} from '../types/enhanced-regex-components'
import { componentCategories } from './regex-components'

/**
 * Enhanced component categories with more metadata and organization
 */
export const enhancedComponentCategories: Record<ComponentCategory, EnhancedComponentCategory> = {
  'character-classes': {
    id: 'character-classes',
    name: 'Character Classes',
    description: 'Match specific types of characters and character sets',
    color: '#3B82F6',
    icon: 'Type',
    difficulty: 'beginner',
    order: 1,
    subcategories: [
      {
        id: 'basic-classes',
        name: 'Basic Classes',
        description: 'Fundamental character matching patterns',
        components: ['any-char', 'digit', 'word-char', 'whitespace'],
        order: 1
      },
      {
        id: 'custom-classes',
        name: 'Custom Classes',
        description: 'User-defined character sets',
        components: ['custom-class', 'negated-class'],
        order: 2
      },
      {
        id: 'unicode-classes',
        name: 'Unicode Classes',
        description: 'Unicode-aware character matching',
        components: ['unicode-category', 'unicode-script'],
        order: 3
      }
    ],
    learningPath: ['any-char', 'digit', 'word-char', 'whitespace', 'custom-class', 'negated-class'],
    prerequisites: []
  },

  'anchors': {
    id: 'anchors',
    name: 'Anchors',
    description: 'Match positions in text rather than characters',
    color: '#059669',
    icon: 'Anchor',
    difficulty: 'beginner',
    order: 2,
    subcategories: [
      {
        id: 'line-anchors',
        name: 'Line Anchors',
        description: 'Match start and end of lines',
        components: ['start-anchor', 'end-anchor'],
        order: 1
      },
      {
        id: 'word-boundaries',
        name: 'Word Boundaries',
        description: 'Match word boundaries and positions',
        components: ['word-boundary', 'non-word-boundary'],
        order: 2
      }
    ],
    learningPath: ['start-anchor', 'end-anchor', 'word-boundary', 'non-word-boundary'],
    prerequisites: ['character-classes']
  },

  'quantifiers': {
    id: 'quantifiers',
    name: 'Quantifiers',
    description: 'Specify how many times patterns should match',
    color: '#F97316',
    icon: 'Repeat',
    difficulty: 'intermediate',
    order: 3,
    subcategories: [
      {
        id: 'basic-quantifiers',
        name: 'Basic Quantifiers',
        description: 'Common repetition patterns',
        components: ['zero-or-more', 'one-or-more', 'zero-or-one'],
        order: 1
      },
      {
        id: 'precise-quantifiers',
        name: 'Precise Quantifiers',
        description: 'Exact and range-based repetition',
        components: ['exact-count', 'range-count'],
        order: 2
      },
      {
        id: 'lazy-quantifiers',
        name: 'Lazy Quantifiers',
        description: 'Non-greedy matching patterns',
        components: ['lazy-zero-or-more', 'lazy-one-or-more', 'lazy-zero-or-one'],
        order: 3
      }
    ],
    learningPath: ['zero-or-more', 'one-or-more', 'zero-or-one', 'exact-count', 'range-count'],
    prerequisites: ['character-classes', 'anchors']
  },

  'groups': {
    id: 'groups',
    name: 'Groups',
    description: 'Group patterns and capture matches',
    color: '#1D4ED8',
    icon: 'Group',
    difficulty: 'intermediate',
    order: 4,
    subcategories: [
      {
        id: 'capturing-groups',
        name: 'Capturing Groups',
        description: 'Groups that capture matched text',
        components: ['capturing-group', 'named-group'],
        order: 1
      },
      {
        id: 'non-capturing-groups',
        name: 'Non-Capturing Groups',
        description: 'Groups for organization without capture',
        components: ['non-capturing-group', 'atomic-group'],
        order: 2
      },
      {
        id: 'alternation',
        name: 'Alternation',
        description: 'Match one of several alternatives',
        components: ['alternation', 'conditional-group'],
        order: 3
      }
    ],
    learningPath: ['capturing-group', 'non-capturing-group', 'alternation', 'named-group'],
    prerequisites: ['character-classes', 'quantifiers']
  },

  'lookarounds': {
    id: 'lookarounds',
    name: 'Lookarounds',
    description: 'Match based on surrounding context without consuming characters',
    color: '#059669',
    icon: 'Eye',
    difficulty: 'advanced',
    order: 5,
    subcategories: [
      {
        id: 'lookaheads',
        name: 'Lookaheads',
        description: 'Check what follows the current position',
        components: ['positive-lookahead', 'negative-lookahead'],
        order: 1
      },
      {
        id: 'lookbehinds',
        name: 'Lookbehinds',
        description: 'Check what precedes the current position',
        components: ['positive-lookbehind', 'negative-lookbehind'],
        order: 2
      }
    ],
    learningPath: ['positive-lookahead', 'negative-lookahead', 'positive-lookbehind', 'negative-lookbehind'],
    prerequisites: ['character-classes', 'quantifiers', 'groups']
  },

  'modifiers': {
    id: 'modifiers',
    name: 'Modifiers',
    description: 'Change how patterns behave',
    color: '#7C3AED',
    icon: 'Settings',
    difficulty: 'intermediate',
    order: 6,
    subcategories: [
      {
        id: 'case-modifiers',
        name: 'Case Modifiers',
        description: 'Control case sensitivity',
        components: ['case-insensitive'],
        order: 1
      },
      {
        id: 'line-modifiers',
        name: 'Line Modifiers',
        description: 'Control line-based matching',
        components: ['multiline', 'dotall'],
        order: 2
      }
    ],
    learningPath: ['case-insensitive', 'multiline', 'dotall'],
    prerequisites: ['anchors']
  },

  'shortcuts': {
    id: 'shortcuts',
    name: 'Common Patterns',
    description: 'Pre-built patterns for common use cases',
    color: '#0F766E',
    icon: 'Zap',
    difficulty: 'beginner',
    order: 7,
    subcategories: [
      {
        id: 'validation-patterns',
        name: 'Validation Patterns',
        description: 'Common validation use cases',
        components: ['email-pattern', 'phone-pattern', 'url-pattern'],
        order: 1
      },
      {
        id: 'extraction-patterns',
        name: 'Extraction Patterns',
        description: 'Patterns for data extraction',
        components: ['date-pattern', 'time-pattern', 'number-pattern'],
        order: 2
      },
      {
        id: 'formatting-patterns',
        name: 'Formatting Patterns',
        description: 'Patterns for text formatting',
        components: ['credit-card-pattern', 'ssn-pattern', 'zip-pattern'],
        order: 3
      }
    ],
    learningPath: ['email-pattern', 'phone-pattern', 'url-pattern', 'date-pattern'],
    prerequisites: []
  }
}

/**
 * Pattern library integration with built-in and community patterns
 */
export const patternLibraryIntegration: PatternLibraryIntegration = {
  enabled: true,
  libraries: [
    {
      id: 'builtin-patterns',
      name: 'Built-in Patterns',
      description: 'Curated collection of common regex patterns',
      patterns: [
        {
          id: 'email-basic',
          name: 'Basic Email',
          description: 'Simple email validation pattern',
          pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
          category: 'validation',
          tags: ['email', 'validation', 'basic'],
          examples: ['user@example.com', 'test.email+tag@domain.co.uk'],
          testCases: ['user@example.com', 'invalid-email', 'test@domain'],
          difficulty: 'beginner',
          popularity: 95,
          rating: 4.5,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'phone-us',
          name: 'US Phone Number',
          description: 'US phone number with various formats',
          pattern: '\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}',
          category: 'validation',
          tags: ['phone', 'us', 'validation'],
          examples: ['(555) 123-4567', '555-123-4567', '555.123.4567'],
          testCases: ['(555) 123-4567', '555-123-4567', '123-456-789'],
          difficulty: 'beginner',
          popularity: 85,
          rating: 4.3,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'url-http',
          name: 'HTTP/HTTPS URL',
          description: 'Basic URL pattern for HTTP and HTTPS',
          pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?',
          category: 'validation',
          tags: ['url', 'http', 'web'],
          examples: ['https://example.com', 'http://sub.domain.org/path'],
          testCases: ['https://example.com', 'ftp://example.com', 'not-a-url'],
          difficulty: 'intermediate',
          popularity: 80,
          rating: 4.2,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'date-mmddyyyy',
          name: 'Date MM/DD/YYYY',
          description: 'US date format MM/DD/YYYY',
          pattern: '\\d{1,2}/\\d{1,2}/\\d{4}',
          category: 'extraction',
          tags: ['date', 'us', 'format'],
          examples: ['12/31/2023', '1/1/2024', '06/15/2023'],
          testCases: ['12/31/2023', '13/32/2023', '2023-12-31'],
          difficulty: 'beginner',
          popularity: 75,
          rating: 4.1,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'password-strong',
          name: 'Strong Password',
          description: 'Password with uppercase, lowercase, digit, and special character',
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
          category: 'validation',
          tags: ['password', 'security', 'validation'],
          examples: ['MyPass123!', 'SecureP@ss1'],
          testCases: ['MyPass123!', 'password', 'PASSWORD123'],
          difficulty: 'advanced',
          popularity: 70,
          rating: 4.4,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'ipv4-address',
          name: 'IPv4 Address',
          description: 'IPv4 address validation',
          pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
          category: 'validation',
          tags: ['ip', 'network', 'validation'],
          examples: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
          testCases: ['192.168.1.1', '256.1.1.1', '192.168.1'],
          difficulty: 'intermediate',
          popularity: 65,
          rating: 4.0,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'hex-color',
          name: 'Hex Color Code',
          description: 'Hexadecimal color code with optional #',
          pattern: '#?[0-9A-Fa-f]{6}',
          category: 'extraction',
          tags: ['color', 'hex', 'css'],
          examples: ['#FF0000', 'ff0000', '#123ABC'],
          testCases: ['#FF0000', 'GG0000', '#FFF'],
          difficulty: 'beginner',
          popularity: 60,
          rating: 4.2,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'credit-card',
          name: 'Credit Card Number',
          description: 'Credit card number with optional spaces or dashes',
          pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}',
          category: 'validation',
          tags: ['credit-card', 'payment', 'validation'],
          examples: ['1234 5678 9012 3456', '1234-5678-9012-3456', '1234567890123456'],
          testCases: ['1234 5678 9012 3456', '1234-567-890-123', '123456789012345'],
          difficulty: 'beginner',
          popularity: 55,
          rating: 3.9,
          author: 'DevKit Flow',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ],
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: '1.0.0',
        tags: ['builtin', 'curated', 'common'],
        license: 'MIT',
        downloadCount: 0,
        rating: 4.3,
        reviews: []
      }
    },
    {
      id: 'community-patterns',
      name: 'Community Patterns',
      description: 'User-contributed regex patterns',
      patterns: [],
      metadata: {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: '1.0.0',
        tags: ['community', 'user-contributed'],
        license: 'Various',
        downloadCount: 0,
        rating: 0,
        reviews: []
      }
    }
  ],
  customPatterns: [],
  sharedPatterns: [],
  importedPatterns: []
}

/**
 * Get enhanced category by ID
 */
export function getEnhancedCategory(categoryId: ComponentCategory): EnhancedComponentCategory | null {
  return enhancedComponentCategories[categoryId] || null
}

/**
 * Get all enhanced categories sorted by order
 */
export function getAllEnhancedCategories(): EnhancedComponentCategory[] {
  return Object.values(enhancedComponentCategories).sort((a, b) => a.order - b.order)
}

/**
 * Get categories by difficulty level
 */
export function getCategoriesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): EnhancedComponentCategory[] {
  return Object.values(enhancedComponentCategories)
    .filter(category => category.difficulty === difficulty)
    .sort((a, b) => a.order - b.order)
}

/**
 * Get learning path for all categories
 */
export function getCategoryLearningPath(): EnhancedComponentCategory[] {
  const beginnerCategories = getCategoriesByDifficulty('beginner')
  const intermediateCategories = getCategoriesByDifficulty('intermediate')
  const advancedCategories = getCategoriesByDifficulty('advanced')
  
  return [...beginnerCategories, ...intermediateCategories, ...advancedCategories]
}

/**
 * Search pattern library
 */
export function searchPatternLibrary(query: string): PatternLibraryItem[] {
  const lowercaseQuery = query.toLowerCase()
  const allPatterns: PatternLibraryItem[] = []
  
  // Collect all patterns from all libraries
  for (const library of patternLibraryIntegration.libraries) {
    allPatterns.push(...library.patterns)
  }
  
  return allPatterns.filter(pattern =>
    pattern.name.toLowerCase().includes(lowercaseQuery) ||
    pattern.description.toLowerCase().includes(lowercaseQuery) ||
    pattern.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    pattern.category.toLowerCase().includes(lowercaseQuery)
  )
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: string): PatternLibraryItem[] {
  const allPatterns: PatternLibraryItem[] = []
  
  for (const library of patternLibraryIntegration.libraries) {
    allPatterns.push(...library.patterns.filter(p => p.category === category))
  }
  
  return allPatterns.sort((a, b) => b.popularity - a.popularity)
}

/**
 * Get popular patterns
 */
export function getPopularPatterns(limit: number = 10): PatternLibraryItem[] {
  const allPatterns: PatternLibraryItem[] = []
  
  for (const library of patternLibraryIntegration.libraries) {
    allPatterns.push(...library.patterns)
  }
  
  return allPatterns
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

/**
 * Get pattern by ID
 */
export function getPatternById(patternId: string): PatternLibraryItem | null {
  for (const library of patternLibraryIntegration.libraries) {
    const pattern = library.patterns.find(p => p.id === patternId)
    if (pattern) return pattern
  }
  return null
}

/**
 * Add custom pattern to library
 */
export function addCustomPattern(pattern: Omit<PatternLibraryItem, 'id' | 'createdAt' | 'updatedAt'>): PatternLibraryItem {
  const newPattern: PatternLibraryItem = {
    ...pattern,
    id: `custom-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // Add to community library
  const communityLibrary = patternLibraryIntegration.libraries.find(l => l.id === 'community-patterns')
  if (communityLibrary) {
    communityLibrary.patterns.push(newPattern)
  }
  
  return newPattern
}

/**
 * Get component recommendations based on category
 */
export function getComponentRecommendations(
  categoryId: ComponentCategory,
  currentComponents: string[] = [],
  limit: number = 5
): string[] {
  const category = enhancedComponentCategories[categoryId]
  if (!category) return []
  
  // Get components from learning path that aren't already used
  const recommendations = category.learningPath.filter(componentId => 
    !currentComponents.includes(componentId)
  )
  
  return recommendations.slice(0, limit)
}

/**
 * Validate category prerequisites
 */
export function validateCategoryPrerequisites(
  categoryId: ComponentCategory,
  completedCategories: ComponentCategory[]
): { isValid: boolean; missingPrerequisites: ComponentCategory[] } {
  const category = enhancedComponentCategories[categoryId]
  if (!category) {
    return { isValid: false, missingPrerequisites: [] }
  }
  
  const missingPrerequisites = category.prerequisites.filter(
    prereq => !completedCategories.includes(prereq as ComponentCategory)
  )
  
  return {
    isValid: missingPrerequisites.length === 0,
    missingPrerequisites: missingPrerequisites as ComponentCategory[]
  }
}