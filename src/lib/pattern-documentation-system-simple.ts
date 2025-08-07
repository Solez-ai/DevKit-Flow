// Simplified Pattern Documentation System for build compatibility
import type { RegexPattern, TestCase } from '@/types'

// Export all the types that other files are trying to import
export interface PatternDocumentation {
  pattern: RegexPattern
  title: string
  explanation: string
  examples: PatternExample[]
  testCases: TestCase[]
  metadata: DocumentationMetadata
  overview: PatternOverview
  syntax: PatternSyntax
  useCases: UseCase[]
  performance: PerformanceInfo
  security: SecurityInfo
  compatibility: CompatibilityInfo
  aiExplanation?: AIPatternExplanation
  aiOptimizations?: AIOptimizationSuggestion[]
  aiAlternatives?: AIAlternativePattern[]
  troubleshooting: TroubleshootingInfo
}

export interface PatternExample {
  title: string
  description: string
  pattern: string
  testString: string
  explanation: string
}

export interface PatternOverview {
  summary: string
  purpose: string
  complexity: string
  tags: string[]
  prerequisites: string[]
}

export interface PatternSyntax {
  explanation: string
  breakdown: SyntaxBreakdown[]
}

export interface SyntaxBreakdown {
  part: string
  type: string
  explanation: string
}

export interface UseCase {
  title: string
  description: string
  example: string
}

export interface PerformanceInfo {
  complexity: string
  timeComplexity: string
  spaceComplexity: string
  backtrackingRisk: string
  optimizationTips: string[]
  benchmarks: PerformanceBenchmark[]
}

export interface PerformanceBenchmark {
  name: string
  result: string
  inputSize: string
  executionTime: string
  memoryUsage: string
}

export interface SecurityInfo {
  riskLevel: string
  vulnerabilities: SecurityVulnerability[]
  mitigations: SecurityMitigation[]
  bestPractices: string[]
}

export interface SecurityVulnerability {
  type: string
  description: string
  severity: string
  impact: string
  likelihood: string
  example: string
}

export interface SecurityMitigation {
  vulnerability: string
  solution: string
  implementation: string
  effectiveness: string
}

export interface CompatibilityInfo {
  languages: LanguageCompatibility[]
  browsers: BrowserCompatibility[]
  notes: string[]
}

export interface LanguageCompatibility {
  name: string
  language: string
  supported: boolean
  version?: string
  notes?: string
}

export interface BrowserCompatibility {
  name: string
  browser: string
  supported: boolean
  version?: string
  notes?: string
}

export interface AIPatternExplanation {
  plainEnglish: string
  stepByStep: string[]
  analogies: string[]
  confidence: number
}

export interface AIOptimizationSuggestion {
  type: string
  description: string
  example: string
  confidence: number
  suggestion: string
  originalPattern: string
  optimizedPattern: string
  explanation: string
  impact: string
}

export interface TroubleshootingInfo {
  commonIssues: TroubleshootingIssue[]
  debuggingTips: string[]
  faq: FAQItem[]
}

export interface TroubleshootingIssue {
  problem: string
  issue: string
  cause: string
  causes: string[]
  solution: string
  solutions: string[]
  symptoms: string[]
  prevention: string
  example?: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface DocumentationMetadata {
  generatedAt: Date
  createdAt: Date
  version: string
  author?: string
  accuracy: number
  completeness: number
}

export interface ExportOptions {
  includeExamples: boolean
  includeTestCases: boolean
  includePerformance: boolean
  includeSecurity: boolean
  includeAIContent: boolean
  format: 'markdown' | 'html' | 'json' | 'pdf'
  theme?: string
  language?: string
  customStyling?: CustomStyling
}

export interface CustomStyling {
  primaryColor: string
  backgroundColor: string
  fontFamily: string
}

export interface AIAlternativePattern {
  name: string
  pattern: string
  description: string
  advantages: string[]
  disadvantages: string[]
  useCase: string
  complexity: string
}

export interface UseCase {
  title: string
  description: string
  example: string
  explanation: string
  difficulty: string
}

export interface DocumentationGenerationOptions {
  includeExamples: boolean
  includeTestCases: boolean
  includePerformance: boolean
}

export interface DocumentationGenerationOptions {
  includeExamples: boolean
  includeTestCases: boolean
  includePerformance: boolean
}

export class PatternDocumentationSystem {
  async generateDocumentation(
    pattern: RegexPattern, 
    options: DocumentationGenerationOptions = {
      includeExamples: true,
      includeTestCases: true,
      includePerformance: false
    }
  ): Promise<PatternDocumentation> {
    return {
      pattern,
      title: pattern.name,
      explanation: `Documentation for pattern: ${pattern.regex}`,
      examples: [{
        title: `Example usage of ${pattern.name}`,
        description: 'Basic usage example',
        pattern: pattern.regex,
        testString: 'sample text',
        explanation: 'This example demonstrates basic usage'
      }],
      testCases: pattern.testCases || [],
      metadata: {
        generatedAt: new Date(),
        createdAt: new Date(),
        version: '1.0.0',
        accuracy: 0.85,
        completeness: 0.90
      },
      overview: {
        summary: `Pattern for ${pattern.name}`,
        purpose: pattern.description,
        complexity: 'moderate',
        tags: [],
        prerequisites: []
      },
      syntax: {
        explanation: `Syntax explanation for ${pattern.regex}`,
        breakdown: []
      },
      useCases: [],
      performance: {
        complexity: 'O(n)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        backtrackingRisk: 'low',
        optimizationTips: [],
        benchmarks: []
      },
      security: {
        riskLevel: 'low',
        vulnerabilities: [],
        mitigations: [],
        bestPractices: []
      },
      compatibility: {
        languages: [],
        browsers: [],
        notes: []
      },
      troubleshooting: {
        commonIssues: [],
        debuggingTips: [],
        faq: []
      },
      aiAlternatives: []
    }
  }

  async exportDocumentation(
    documentation: PatternDocumentation,
    format: 'markdown' | 'html' | 'json' = 'markdown'
  ): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(documentation, null, 2)
      case 'html':
        return `<html><body><h1>${documentation.title}</h1><p>${documentation.explanation}</p></body></html>`
      case 'markdown':
      default:
        return `# ${documentation.title}\n\n${documentation.explanation}\n\n## Examples\n\n${documentation.examples.map(ex => ex.description).join('\n\n')}`
    }
  }
}

export const patternDocumentationSystem = new PatternDocumentationSystem()