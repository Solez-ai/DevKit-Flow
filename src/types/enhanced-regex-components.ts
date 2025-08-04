/**
 * Enhanced TypeScript interfaces for regex components with templates and AI integration
 * This extends the existing component system with advanced features for Task 9.1
 */

import type { 
  RegexComponent, 
  ComponentCategory, 
  ComponentParameter, 
  ComponentVisual,
  PlacedComponent,
  Position 
} from './index'

// Enhanced component interfaces
export interface EnhancedRegexComponent extends RegexComponent {
  // Template system
  templates: ComponentTemplate[]
  
  // Enhanced metadata
  metadata: ComponentMetadata
  
  // AI integration
  aiAssistance: AIComponentAssistance
  
  // Usage statistics
  statistics: ComponentStatistics
  
  // Validation rules
  validation: ComponentValidation
  
  // Documentation
  documentation: ComponentDocumentation
}

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  parameters: Record<string, any>
  tags: string[]
  usageExample: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  popularity: number
  createdAt: Date
  updatedAt: Date
}

export interface ComponentMetadata {
  version: string
  author?: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  popularity: number
  usageCount: number
  averageRating: number
  totalRatings: number
  isCustom: boolean
  isDeprecated: boolean
  deprecationReason?: string
  replacementComponentId?: string
}

export interface AIComponentAssistance {
  enabled: boolean
  promptTemplates: AIPromptTemplate[]
  suggestions: AISuggestion[]
  explanations: AIExplanation[]
  optimizations: AIOptimization[]
}

export interface AIPromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: 'generation' | 'explanation' | 'optimization' | 'debugging'
  parameters: string[]
}

export interface AISuggestion {
  id: string
  type: 'parameter' | 'alternative' | 'optimization' | 'usage'
  title: string
  description: string
  confidence: number // 0-1
  reasoning: string
  implementation?: any
}

export interface AIExplanation {
  id: string
  type: 'pattern' | 'usage' | 'performance' | 'compatibility'
  content: string
  examples: string[]
  relatedConcepts: string[]
}

export interface AIOptimization {
  id: string
  type: 'performance' | 'readability' | 'maintainability'
  suggestion: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  beforePattern: string
  afterPattern: string
  explanation: string
}

export interface ComponentStatistics {
  totalUsage: number
  recentUsage: number
  averageSessionUsage: number
  popularCombinations: string[]
  commonParameters: Record<string, any>
  errorRate: number
  successRate: number
  performanceMetrics: PerformanceMetrics
}

export interface PerformanceMetrics {
  averageExecutionTime: number
  memoryUsage: number
  backtrackingRisk: 'low' | 'medium' | 'high'
  complexityScore: number
  optimizationSuggestions: string[]
}

export interface ComponentValidation {
  rules: ValidationRule[]
  customValidators: CustomValidator[]
  errorMessages: Record<string, string>
  warningMessages: Record<string, string>
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  type: 'required' | 'format' | 'range' | 'custom'
  parameters: Record<string, any>
  errorMessage: string
  severity: 'error' | 'warning' | 'info'
}

export interface CustomValidator {
  id: string
  name: string
  description: string
  validator: (value: any, context: ValidationContext) => ValidationResult
}

export interface ValidationContext {
  component: EnhancedRegexComponent
  allParameters: Record<string, any>
  placedComponent?: PlacedComponent
  pattern?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  suggestion?: string
}

export interface ValidationSuggestion {
  field: string
  message: string
  code: string
  autoFix?: any
}

export interface ComponentDocumentation {
  summary: string
  detailedDescription: string
  syntaxExplanation: string
  useCases: UseCase[]
  examples: DocumentationExample[]
  relatedComponents: string[]
  commonMistakes: CommonMistake[]
  performanceNotes: string[]
  browserSupport: BrowserSupport
  languageSupport: LanguageSupport
  tutorials: Tutorial[]
}

export interface UseCase {
  id: string
  title: string
  description: string
  example: string
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

export interface DocumentationExample {
  id: string
  title: string
  description: string
  pattern: string
  testString: string
  expectedMatches: string[]
  explanation: string
  interactive: boolean
}

export interface CommonMistake {
  id: string
  mistake: string
  correction: string
  explanation: string
  example: string
}

export interface BrowserSupport {
  chrome: boolean
  firefox: boolean
  safari: boolean
  edge: boolean
  notes?: string
}

export interface LanguageSupport {
  javascript: boolean
  python: boolean
  java: boolean
  csharp: boolean
  php: boolean
  ruby: boolean
  go: boolean
  rust: boolean
  notes: Record<string, string>
}

export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: TutorialStep[]
  estimatedTime: number // in minutes
  prerequisites: string[]
}

export interface TutorialStep {
  id: string
  title: string
  description: string
  instruction: string
  example?: string
  hint?: string
  solution?: string
  interactive: boolean
}

// Enhanced component categories with more metadata
export interface EnhancedComponentCategory {
  id: ComponentCategory
  name: string
  description: string
  color: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number
  subcategories: ComponentSubcategory[]
  learningPath: string[]
  prerequisites: string[]
}

export interface ComponentSubcategory {
  id: string
  name: string
  description: string
  components: string[]
  order: number
}

// Enhanced placed component with more features
export interface EnhancedPlacedComponent extends PlacedComponent {
  // Template information
  templateId?: string
  templateName?: string
  
  // AI assistance
  aiSuggestions: AISuggestion[]
  aiOptimizations: AIOptimization[]
  
  // Performance metrics
  performanceMetrics?: PerformanceMetrics
  
  // Usage context
  usageContext: UsageContext
  
  // Collaboration features
  comments: ComponentComment[]
  annotations: ComponentAnnotation[]
}

export interface UsageContext {
  sessionId: string
  patternId: string
  createdAt: Date
  lastModified: Date
  modificationHistory: ModificationHistory[]
  tags: string[]
  notes: string
}

export interface ModificationHistory {
  id: string
  timestamp: Date
  type: 'created' | 'modified' | 'moved' | 'deleted'
  changes: Record<string, any>
  reason?: string
  userId?: string
}

export interface ComponentComment {
  id: string
  author: string
  content: string
  timestamp: Date
  type: 'note' | 'question' | 'suggestion' | 'issue'
  resolved: boolean
  replies: ComponentComment[]
}

export interface ComponentAnnotation {
  id: string
  type: 'highlight' | 'warning' | 'info' | 'error'
  message: string
  position: Position
  color: string
  visible: boolean
  createdAt: Date
}

// Component library and pattern library integration
export interface ComponentLibrary {
  id: string
  name: string
  description: string
  version: string
  author: string
  components: EnhancedRegexComponent[]
  templates: ComponentTemplate[]
  categories: EnhancedComponentCategory[]
  metadata: LibraryMetadata
}

export interface LibraryMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  tags: string[]
  license: string
  homepage?: string
  repository?: string
  documentation?: string
  downloadCount: number
  rating: number
  reviews: LibraryReview[]
}

export interface LibraryReview {
  id: string
  author: string
  rating: number
  title: string
  content: string
  timestamp: Date
  helpful: number
  verified: boolean
}

// Pattern library integration
export interface PatternLibraryIntegration {
  enabled: boolean
  libraries: PatternLibrary[]
  customPatterns: CustomPattern[]
  sharedPatterns: SharedPattern[]
  importedPatterns: ImportedPattern[]
}

export interface PatternLibrary {
  id: string
  name: string
  description: string
  url?: string
  patterns: PatternLibraryItem[]
  metadata: LibraryMetadata
}

export interface PatternLibraryItem {
  id: string
  name: string
  description: string
  pattern: string
  category: string
  tags: string[]
  examples: string[]
  testCases: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  popularity: number
  rating: number
  author: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomPattern {
  id: string
  name: string
  description: string
  components: EnhancedPlacedComponent[]
  pattern: string
  tags: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

export interface SharedPattern {
  id: string
  originalId: string
  sharedBy: string
  sharedWith: string[]
  permissions: PatternPermissions
  sharedAt: Date
  expiresAt?: Date
}

export interface PatternPermissions {
  canView: boolean
  canEdit: boolean
  canShare: boolean
  canDelete: boolean
}

export interface ImportedPattern {
  id: string
  sourceId: string
  sourceLibrary: string
  importedAt: Date
  lastSynced?: Date
  autoSync: boolean
  localModifications: boolean
}

// Component factory enhancements
export interface ComponentFactory {
  createComponent(definition: ComponentDefinition): EnhancedRegexComponent
  createFromTemplate(templateId: string, parameters?: Record<string, any>): EnhancedRegexComponent
  cloneComponent(componentId: string, modifications?: Partial<EnhancedRegexComponent>): EnhancedRegexComponent
  validateComponent(component: EnhancedRegexComponent): ValidationResult
  optimizeComponent(component: EnhancedRegexComponent): AIOptimization[]
  generateDocumentation(component: EnhancedRegexComponent): ComponentDocumentation
}

export interface ComponentDefinition {
  name: string
  description: string
  category: ComponentCategory
  regexPattern: string
  visualRepresentation: ComponentVisual
  parameters?: ComponentParameter[]
  examples: string[]
  commonUses: string[]
  metadata?: Partial<ComponentMetadata>
  templates?: ComponentTemplate[]
  documentation?: Partial<ComponentDocumentation>
}

// Search and filtering enhancements
export interface ComponentSearchOptions {
  query?: string
  categories?: ComponentCategory[]
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[]
  tags?: string[]
  minRating?: number
  maxComplexity?: number
  hasTemplates?: boolean
  hasAIAssistance?: boolean
  isCustom?: boolean
  sortBy?: 'name' | 'popularity' | 'rating' | 'recent' | 'alphabetical'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ComponentSearchResult {
  components: EnhancedRegexComponent[]
  total: number
  facets: SearchFacets
  suggestions: string[]
}

export interface SearchFacets {
  categories: Record<ComponentCategory, number>
  difficulties: Record<string, number>
  tags: Record<string, number>
  ratings: Record<number, number>
}

// Component usage analytics
export interface ComponentAnalytics {
  componentId: string
  totalUsage: number
  uniqueUsers: number
  averageRating: number
  usageTrend: UsageTrendPoint[]
  popularParameters: Record<string, number>
  commonCombinations: ComponentCombination[]
  errorPatterns: ErrorPattern[]
  performanceMetrics: PerformanceMetrics
}

export interface UsageTrendPoint {
  date: Date
  usage: number
  uniqueUsers: number
  errors: number
}

export interface ComponentCombination {
  components: string[]
  frequency: number
  successRate: number
  averagePerformance: number
}

export interface ErrorPattern {
  error: string
  frequency: number
  commonCause: string
  solution: string
  examples: string[]
}

// Export interfaces for external use
export type {
  EnhancedRegexComponent,
  ComponentTemplate,
  ComponentMetadata,
  AIComponentAssistance,
  ComponentStatistics,
  ComponentValidation,
  ComponentDocumentation,
  EnhancedComponentCategory,
  EnhancedPlacedComponent,
  ComponentLibrary,
  PatternLibraryIntegration,
  ComponentFactory,
  ComponentSearchOptions,
  ComponentAnalytics
}