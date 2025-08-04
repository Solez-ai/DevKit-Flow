import type { 
  DevFlowSession, 
  DevFlowNode, 
  TodoItem, 
  CodeSnippet,
  CommitSuggestion,
  CommitAnalysis 
} from '@/types'

// Commit type keywords and their patterns
const COMMIT_TYPE_PATTERNS = {
  feat: [
    'add', 'create', 'implement', 'introduce', 'new', 'feature',
    'build', 'develop', 'establish', 'setup', 'configure'
  ],
  fix: [
    'fix', 'resolve', 'correct', 'repair', 'patch', 'debug',
    'solve', 'address', 'handle', 'bug', 'issue', 'error'
  ],
  docs: [
    'document', 'readme', 'comment', 'guide', 'manual', 'help',
    'documentation', 'explain', 'describe', 'clarify'
  ],
  style: [
    'format', 'style', 'lint', 'prettier', 'indent', 'spacing',
    'cleanup', 'organize', 'structure', 'layout'
  ],
  refactor: [
    'refactor', 'restructure', 'reorganize', 'optimize', 'improve',
    'enhance', 'simplify', 'clean', 'modernize', 'update'
  ],
  test: [
    'test', 'spec', 'unit', 'integration', 'e2e', 'coverage',
    'mock', 'stub', 'verify', 'validate', 'assert'
  ],
  chore: [
    'chore', 'maintenance', 'dependency', 'package', 'config',
    'build', 'ci', 'deploy', 'release', 'version'
  ],
  perf: [
    'performance', 'optimize', 'speed', 'cache', 'memory',
    'efficient', 'fast', 'benchmark', 'profile'
  ]
}

// Scope extraction patterns
const SCOPE_PATTERNS = [
  // Technology/framework patterns
  /\b(react|vue|angular|node|express|api|database|db|auth|ui|ux)\b/i,
  // Component patterns
  /\b(component|service|util|helper|hook|store|model|controller)\b/i,
  // Feature patterns
  /\b(login|signup|dashboard|profile|settings|admin|user|payment)\b/i,
  // File type patterns
  /\.(js|ts|jsx|tsx|css|scss|html|json|md)$/i
]

export class CommitAnalysisEngine {
  /**
   * Analyzes a session to extract commit-relevant information
   */
  analyzeSession(session: DevFlowSession, timeRange?: { start: Date; end: Date }): CommitAnalysis {
    const now = new Date()
    const defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
    
    const analysisTimeRange = timeRange || { start: defaultStart, end: now }
    
    // Get completed todos within time range
    const completedTodos = this.getCompletedTodos(session, analysisTimeRange)
    
    // Get modified nodes within time range
    const modifiedNodes = this.getModifiedNodes(session, analysisTimeRange)
    
    // Get relevant code snippets
    const codeSnippets = this.getRelevantCodeSnippets(modifiedNodes)
    
    return {
      completedTodos,
      modifiedNodes,
      codeSnippets,
      timeRange: analysisTimeRange
    }
  }

  /**
   * Generates commit suggestions based on analysis
   */
  generateCommitSuggestions(analysis: CommitAnalysis): CommitSuggestion[] {
    const suggestions: CommitSuggestion[] = []
    
    // Analyze completed todos for commit types
    const todoAnalysis = this.analyzeTodos(analysis.completedTodos)
    
    // Analyze node changes for additional context
    const nodeAnalysis = this.analyzeNodes(analysis.modifiedNodes)
    
    // Analyze code snippets for technical details
    const codeAnalysis = this.analyzeCodeSnippets(analysis.codeSnippets)
    
    // Combine analyses to generate suggestions
    const combinedAnalysis = this.combineAnalyses(todoAnalysis, nodeAnalysis, codeAnalysis)
    
    // Generate primary suggestion
    const primarySuggestion = this.generatePrimarySuggestion(combinedAnalysis)
    if (primarySuggestion) {
      suggestions.push(primarySuggestion)
    }
    
    // Generate alternative suggestions
    const alternatives = this.generateAlternativeSuggestions(combinedAnalysis)
    suggestions.push(...alternatives)
    
    // Sort by confidence score
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Extracts completed todos within the specified time range
   */
  private getCompletedTodos(session: DevFlowSession, timeRange: { start: Date; end: Date }): TodoItem[] {
    const completedTodos: TodoItem[] = []
    
    for (const node of session.nodes) {
      for (const todo of node.content.todos) {
        if (todo.completed && todo.completedAt) {
          const completedAt = new Date(todo.completedAt)
          if (completedAt >= timeRange.start && completedAt <= timeRange.end) {
            completedTodos.push(todo)
          }
        }
      }
    }
    
    return completedTodos
  }

  /**
   * Extracts nodes that were modified within the specified time range
   */
  private getModifiedNodes(session: DevFlowSession, timeRange: { start: Date; end: Date }): DevFlowNode[] {
    return session.nodes.filter(node => {
      const updatedAt = new Date(node.metadata.updatedAt)
      return updatedAt >= timeRange.start && updatedAt <= timeRange.end
    })
  }

  /**
   * Extracts relevant code snippets from modified nodes
   */
  private getRelevantCodeSnippets(nodes: DevFlowNode[]): CodeSnippet[] {
    const snippets: CodeSnippet[] = []
    
    for (const node of nodes) {
      snippets.push(...node.content.codeSnippets)
    }
    
    return snippets
  }

  /**
   * Analyzes todos to determine commit types and scopes
   */
  private analyzeTodos(todos: TodoItem[]): TodoAnalysisResult {
    const typeScores: Record<string, number> = {}
    const scopes: string[] = []
    const descriptions: string[] = []
    
    for (const todo of todos) {
      const text = todo.text.toLowerCase()
      descriptions.push(todo.text)
      
      // Analyze for commit types
      for (const [type, keywords] of Object.entries(COMMIT_TYPE_PATTERNS)) {
        let score = 0
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            score += 1
          }
        }
        typeScores[type] = (typeScores[type] || 0) + score
      }
      
      // Extract potential scopes
      const extractedScopes = this.extractScopes(todo.text)
      scopes.push(...extractedScopes)
    }
    
    return {
      typeScores,
      scopes: [...new Set(scopes)], // Remove duplicates
      descriptions,
      totalTodos: todos.length
    }
  }

  /**
   * Analyzes nodes for additional context
   */
  private analyzeNodes(nodes: DevFlowNode[]): NodeAnalysisResult {
    const nodeTypes: Record<string, number> = {}
    const titles: string[] = []
    const tags: string[] = []
    
    for (const node of nodes) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1
      titles.push(node.title)
      tags.push(...node.metadata.tags)
      
      // Extract scopes from node titles
      const extractedScopes = this.extractScopes(node.title)
      tags.push(...extractedScopes)
    }
    
    return {
      nodeTypes,
      titles,
      tags: [...new Set(tags)], // Remove duplicates
      totalNodes: nodes.length
    }
  }

  /**
   * Analyzes code snippets for technical context
   */
  private analyzeCodeSnippets(snippets: CodeSnippet[]): CodeAnalysisResult {
    const languages: Record<string, number> = {}
    const tags: string[] = []
    const titles: string[] = []
    
    for (const snippet of snippets) {
      languages[snippet.language] = (languages[snippet.language] || 0) + 1
      tags.push(...snippet.tags)
      titles.push(snippet.title)
    }
    
    return {
      languages,
      tags: [...new Set(tags)], // Remove duplicates
      titles,
      totalSnippets: snippets.length
    }
  }

  /**
   * Combines all analyses into a unified result
   */
  private combineAnalyses(
    todoAnalysis: TodoAnalysisResult,
    nodeAnalysis: NodeAnalysisResult,
    codeAnalysis: CodeAnalysisResult
  ): CombinedAnalysis {
    // Determine primary commit type
    const primaryType = this.determinePrimaryType(todoAnalysis.typeScores)
    
    // Determine scope
    const scope = this.determineScope([
      ...todoAnalysis.scopes,
      ...nodeAnalysis.tags,
      ...codeAnalysis.tags
    ])
    
    // Generate description
    const description = this.generateDescription(
      todoAnalysis.descriptions,
      nodeAnalysis.titles,
      codeAnalysis.titles
    )
    
    return {
      primaryType,
      scope,
      description,
      confidence: this.calculateConfidence(todoAnalysis, nodeAnalysis, codeAnalysis),
      todoAnalysis,
      nodeAnalysis,
      codeAnalysis
    }
  }

  /**
   * Generates the primary commit suggestion
   */
  private generatePrimarySuggestion(analysis: CombinedAnalysis): CommitSuggestion | null {
    if (!analysis.primaryType || !analysis.description) {
      return null
    }
    
    const body = this.generateCommitBody(analysis)
    
    return {
      type: analysis.primaryType,
      scope: analysis.scope,
      description: analysis.description,
      body,
      confidence: analysis.confidence
    }
  }

  /**
   * Generates alternative commit suggestions
   */
  private generateAlternativeSuggestions(analysis: CombinedAnalysis): CommitSuggestion[] {
    const alternatives: CommitSuggestion[] = []
    
    // Generate alternatives based on different type interpretations
    const typeScores = analysis.todoAnalysis.typeScores
    const sortedTypes = Object.entries(typeScores)
      .sort(([, a], [, b]) => b - a)
      .slice(1, 3) // Take 2nd and 3rd highest scoring types
    
    for (const [type, score] of sortedTypes) {
      if (score > 0 && type !== analysis.primaryType) {
        alternatives.push({
          type,
          scope: analysis.scope,
          description: analysis.description,
          body: this.generateCommitBody(analysis),
          confidence: Math.max(0.1, analysis.confidence - 0.3) // Lower confidence
        })
      }
    }
    
    return alternatives
  }

  /**
   * Extracts potential scopes from text
   */
  private extractScopes(text: string): string[] {
    const scopes: string[] = []
    
    for (const pattern of SCOPE_PATTERNS) {
      const matches = text.match(pattern)
      if (matches) {
        scopes.push(...matches.map(match => match.toLowerCase().replace(/^\./, '')))
      }
    }
    
    return scopes
  }

  /**
   * Determines the primary commit type based on scores
   */
  private determinePrimaryType(typeScores: Record<string, number>): string {
    const entries = Object.entries(typeScores)
    if (entries.length === 0) return 'chore'
    
    const [primaryType] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
    
    return primaryType
  }

  /**
   * Determines the most appropriate scope
   */
  private determineScope(scopes: string[]): string {
    if (scopes.length === 0) return ''
    
    // Count occurrences and pick the most common
    const scopeCounts: Record<string, number> = {}
    for (const scope of scopes) {
      scopeCounts[scope] = (scopeCounts[scope] || 0) + 1
    }
    
    const [mostCommonScope] = Object.entries(scopeCounts)
      .reduce((max, current) => current[1] > max[1] ? current : max)
    
    return mostCommonScope
  }

  /**
   * Generates a concise description from various sources
   */
  private generateDescription(
    todoDescriptions: string[],
    nodeTitles: string[],
    codeSnippetTitles: string[]
  ): string {
    // Prioritize todo descriptions as they're most specific
    if (todoDescriptions.length > 0) {
      // Find the most descriptive todo (longest non-trivial text)
      const bestTodo = todoDescriptions
        .filter(desc => desc.length > 10) // Filter out trivial todos
        .sort((a, b) => b.length - a.length)[0]
      
      if (bestTodo) {
        return this.cleanDescription(bestTodo)
      }
    }
    
    // Fall back to node titles
    if (nodeTitles.length > 0) {
      const bestTitle = nodeTitles
        .filter(title => title.length > 5)
        .sort((a, b) => b.length - a.length)[0]
      
      if (bestTitle) {
        return this.cleanDescription(bestTitle)
      }
    }
    
    // Fall back to code snippet titles
    if (codeSnippetTitles.length > 0) {
      const bestSnippetTitle = codeSnippetTitles
        .filter(title => title.length > 5)
        .sort((a, b) => b.length - a.length)[0]
      
      if (bestSnippetTitle) {
        return this.cleanDescription(bestSnippetTitle)
      }
    }
    
    return 'update project files'
  }

  /**
   * Cleans and formats description text for commit messages
   */
  private cleanDescription(text: string): string {
    return text
      .toLowerCase()
      .replace(/^(add|create|implement|fix|update|remove)\s+/i, '') // Remove redundant action words
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 50) // Limit length
  }

  /**
   * Generates commit body with detailed changes
   */
  private generateCommitBody(analysis: CombinedAnalysis): string {
    const bodyParts: string[] = []
    
    // Add todo summary
    if (analysis.todoAnalysis.totalTodos > 0) {
      bodyParts.push(`- Completed ${analysis.todoAnalysis.totalTodos} task${analysis.todoAnalysis.totalTodos > 1 ? 's' : ''}`)
    }
    
    // Add node summary
    if (analysis.nodeAnalysis.totalNodes > 0) {
      bodyParts.push(`- Modified ${analysis.nodeAnalysis.totalNodes} node${analysis.nodeAnalysis.totalNodes > 1 ? 's' : ''}`)
    }
    
    // Add code snippet summary
    if (analysis.codeAnalysis.totalSnippets > 0) {
      const languages = Object.keys(analysis.codeAnalysis.languages).join(', ')
      bodyParts.push(`- Updated code snippets (${languages})`)
    }
    
    return bodyParts.join('\n')
  }

  /**
   * Calculates confidence score based on available data
   */
  private calculateConfidence(
    todoAnalysis: TodoAnalysisResult,
    nodeAnalysis: NodeAnalysisResult,
    codeAnalysis: CodeAnalysisResult
  ): number {
    let confidence = 0.1 // Base confidence
    
    // Boost confidence based on completed todos
    if (todoAnalysis.totalTodos > 0) {
      confidence += Math.min(0.4, todoAnalysis.totalTodos * 0.1)
    }
    
    // Boost confidence based on modified nodes
    if (nodeAnalysis.totalNodes > 0) {
      confidence += Math.min(0.3, nodeAnalysis.totalNodes * 0.05)
    }
    
    // Boost confidence based on code snippets
    if (codeAnalysis.totalSnippets > 0) {
      confidence += Math.min(0.2, codeAnalysis.totalSnippets * 0.05)
    }
    
    // Boost confidence if we have clear type indicators
    const maxTypeScore = Math.max(...Object.values(todoAnalysis.typeScores))
    if (maxTypeScore > 2) {
      confidence += 0.2
    }
    
    return Math.min(1.0, confidence)
  }
}

// Analysis result interfaces
interface TodoAnalysisResult {
  typeScores: Record<string, number>
  scopes: string[]
  descriptions: string[]
  totalTodos: number
}

interface NodeAnalysisResult {
  nodeTypes: Record<string, number>
  titles: string[]
  tags: string[]
  totalNodes: number
}

interface CodeAnalysisResult {
  languages: Record<string, number>
  tags: string[]
  titles: string[]
  totalSnippets: number
}

interface CombinedAnalysis {
  primaryType: string
  scope: string
  description: string
  confidence: number
  todoAnalysis: TodoAnalysisResult
  nodeAnalysis: NodeAnalysisResult
  codeAnalysis: CodeAnalysisResult
}

// Export singleton instance
export const commitAnalysisEngine = new CommitAnalysisEngine()