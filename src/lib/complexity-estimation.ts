import type { 
  DevFlowNode, 
  DevFlowSession,
  ComplexityEstimate,
  ComplexityFactor,
  ComplexityLevel,
  ComplexityAnalysis,
  ComplexityHeatmapData,
  ComplexityRecommendation,
  ComplexitySettings,
  EstimationAccuracy
} from '@/types'

/**
 * Default complexity factors used for automatic estimation
 */
export const DEFAULT_COMPLEXITY_FACTORS: ComplexityFactor[] = [
  {
    id: 'todo-count',
    name: 'Number of Tasks',
    description: 'More todos indicate higher complexity',
    weight: 0.3,
    value: 0,
    category: 'scope',
    reasoning: 'Tasks with many subtasks are typically more complex'
  },
  {
    id: 'code-snippets',
    name: 'Code Complexity',
    description: 'Number and complexity of code snippets',
    weight: 0.25,
    value: 0,
    category: 'technical',
    reasoning: 'More code snippets suggest technical complexity'
  },
  {
    id: 'dependencies',
    name: 'Dependencies',
    description: 'Number of incoming connections/dependencies',
    weight: 0.2,
    value: 0,
    category: 'dependencies',
    reasoning: 'More dependencies increase coordination complexity'
  },
  {
    id: 'references',
    name: 'Research Required',
    description: 'Number of external references needed',
    weight: 0.15,
    value: 0,
    category: 'uncertainty',
    reasoning: 'More references suggest research and learning required'
  },
  {
    id: 'node-type',
    name: 'Node Type Complexity',
    description: 'Inherent complexity based on node type',
    weight: 0.1,
    value: 0,
    category: 'technical',
    reasoning: 'Different node types have different inherent complexity levels'
  }
]

/**
 * Default complexity settings
 */
export const DEFAULT_COMPLEXITY_SETTINGS: ComplexitySettings = {
  enableAutoEstimation: true,
  defaultEstimationMethod: 'story-points',
  storyPointToHoursRatio: 4, // 4 hours per story point
  complexityFactors: DEFAULT_COMPLEXITY_FACTORS,
  showHeatmap: true,
  heatmapOpacity: 0.6,
  enableAIAssistance: false,
  trackEstimationAccuracy: true
}

/**
 * Complexity Estimation Engine
 * Provides automatic complexity estimation, analysis, and tracking
 */
export class ComplexityEstimationEngine {
  private settings: ComplexitySettings

  constructor(settings: ComplexitySettings = DEFAULT_COMPLEXITY_SETTINGS) {
    this.settings = settings
  }

  /**
   * Estimate complexity for a single node
   */
  estimateNodeComplexity(
    node: DevFlowNode, 
    session: DevFlowSession,
    method: 'automatic' | 'ai-assisted' = 'automatic'
  ): ComplexityEstimate {
    const factors = this.calculateComplexityFactors(node, session)
    const storyPoints = this.calculateStoryPoints(factors)
    const confidence = this.calculateConfidence(factors, method)
    const estimatedHours = storyPoints * this.settings.storyPointToHoursRatio

    return {
      storyPoints,
      confidence,
      factors,
      estimatedHours,
      estimatedAt: new Date(),
      estimatedBy: method === 'ai-assisted' ? 'ai' : 'algorithm',
      notes: this.generateEstimationNotes(factors, storyPoints)
    }
  }

  /**
   * Update complexity estimation for a node
   */
  updateNodeComplexity(
    node: DevFlowNode,
    updates: Partial<ComplexityEstimate>
  ): ComplexityEstimate {
    const currentEstimate = node.complexity || this.estimateNodeComplexity(node, {} as DevFlowSession)
    
    const updatedEstimate: ComplexityEstimate = {
      ...currentEstimate,
      ...updates,
      estimatedAt: new Date(),
      estimatedBy: 'user'
    }

    // Recalculate estimated hours if story points changed
    if (updates.storyPoints && updates.storyPoints !== currentEstimate.storyPoints) {
      updatedEstimate.estimatedHours = updates.storyPoints * this.settings.storyPointToHoursRatio
    }

    return updatedEstimate
  }

  /**
   * Calculate complexity factors for a node
   */
  private calculateComplexityFactors(node: DevFlowNode, session: DevFlowSession): ComplexityFactor[] {
    return this.settings.complexityFactors.map(factor => {
      const value = this.calculateFactorValue(factor, node, session)
      return {
        ...factor,
        value,
        reasoning: this.generateFactorReasoning(factor, value, node)
      }
    })
  }

  /**
   * Calculate the value for a specific complexity factor
   */
  private calculateFactorValue(
    factor: ComplexityFactor, 
    node: DevFlowNode, 
    session: DevFlowSession
  ): number {
    switch (factor.id) {
      case 'todo-count':
        return this.normalizeTodoCount(node.content.todos.length)
      
      case 'code-snippets':
        return this.normalizeCodeComplexity(node.content.codeSnippets)
      
      case 'dependencies':
        return this.normalizeDependencyCount(node, session)
      
      case 'references':
        return this.normalizeReferenceCount(node.content.references.length)
      
      case 'node-type':
        return this.getNodeTypeComplexity(node.type)
      
      default:
        return 0
    }
  }

  /**
   * Normalize todo count to 0-1 scale
   */
  private normalizeTodoCount(count: number): number {
    // 0 todos = 0, 1-2 todos = 0.2, 3-5 todos = 0.5, 6-10 todos = 0.8, 10+ todos = 1.0
    if (count === 0) return 0
    if (count <= 2) return 0.2
    if (count <= 5) return 0.5
    if (count <= 10) return 0.8
    return 1.0
  }

  /**
   * Normalize code complexity to 0-1 scale
   */
  private normalizeCodeComplexity(codeSnippets: any[]): number {
    if (codeSnippets.length === 0) return 0
    
    // Consider both quantity and estimated complexity of code snippets
    const baseComplexity = Math.min(codeSnippets.length / 5, 1) // 5+ snippets = max complexity
    
    // Analyze code content for additional complexity indicators
    const complexityIndicators = codeSnippets.reduce((total, snippet) => {
      const code = snippet.code || ''
      let indicators = 0
      
      // Check for complexity patterns
      if (code.includes('async') || code.includes('await')) indicators += 0.1
      if (code.includes('Promise') || code.includes('callback')) indicators += 0.1
      if (code.includes('class') || code.includes('interface')) indicators += 0.1
      if (code.includes('try') || code.includes('catch')) indicators += 0.1
      if (code.length > 500) indicators += 0.2 // Long code snippets
      
      return total + indicators
    }, 0)

    return Math.min(baseComplexity + (complexityIndicators / codeSnippets.length), 1)
  }

  /**
   * Normalize dependency count to 0-1 scale
   */
  private normalizeDependencyCount(node: DevFlowNode, session: DevFlowSession): number {
    const dependencies = session.connections?.filter(c => c.targetNodeId === node.id) || []
    const count = dependencies.length
    
    // 0 deps = 0, 1-2 deps = 0.3, 3-4 deps = 0.6, 5+ deps = 1.0
    if (count === 0) return 0
    if (count <= 2) return 0.3
    if (count <= 4) return 0.6
    return 1.0
  }

  /**
   * Normalize reference count to 0-1 scale
   */
  private normalizeReferenceCount(count: number): number {
    // 0 refs = 0, 1-2 refs = 0.2, 3-5 refs = 0.5, 6+ refs = 1.0
    if (count === 0) return 0
    if (count <= 2) return 0.2
    if (count <= 5) return 0.5
    return 1.0
  }

  /**
   * Get inherent complexity for node type
   */
  private getNodeTypeComplexity(nodeType: string): number {
    const complexityMap: Record<string, number> = {
      'comment': 0.1,
      'reference': 0.2,
      'task': 0.4,
      'template': 0.5,
      'file': 0.6,
      'folder': 0.3,
      'code': 0.8,
      'component': 0.9
    }
    
    return complexityMap[nodeType] || 0.5
  }

  /**
   * Calculate story points from complexity factors
   */
  private calculateStoryPoints(factors: ComplexityFactor[]): ComplexityLevel {
    const weightedScore = factors.reduce((total, factor) => {
      return total + (factor.value * factor.weight)
    }, 0)

    // Convert weighted score (0-1) to story points (1-5)
    if (weightedScore <= 0.2) return 1
    if (weightedScore <= 0.4) return 2
    if (weightedScore <= 0.6) return 3
    if (weightedScore <= 0.8) return 4
    return 5
  }

  /**
   * Calculate confidence in the estimation
   */
  private calculateConfidence(factors: ComplexityFactor[], method: string): number {
    // Base confidence depends on method
    let baseConfidence = method === 'ai-assisted' ? 0.8 : 0.6

    // Adjust based on factor consistency
    const factorValues = factors.map(f => f.value)
    const variance = this.calculateVariance(factorValues)
    
    // Lower variance = higher confidence
    const varianceAdjustment = Math.max(0, 0.3 - variance)
    
    return Math.min(baseConfidence + varianceAdjustment, 1)
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }

  /**
   * Generate estimation notes
   */
  private generateEstimationNotes(factors: ComplexityFactor[], storyPoints: ComplexityLevel): string {
    const highFactors = factors.filter(f => f.value > 0.7)
    const notes = [`Estimated at ${storyPoints} story points`]

    if (highFactors.length > 0) {
      notes.push(`High complexity factors: ${highFactors.map(f => f.name).join(', ')}`)
    }

    return notes.join('. ')
  }

  /**
   * Generate reasoning for a specific factor
   */
  private generateFactorReasoning(factor: ComplexityFactor, value: number, node: DevFlowNode): string {
    switch (factor.id) {
      case 'todo-count':
        return `Node has ${node.content.todos.length} todos (complexity: ${(value * 100).toFixed(0)}%)`
      case 'code-snippets':
        return `Node has ${node.content.codeSnippets.length} code snippets (complexity: ${(value * 100).toFixed(0)}%)`
      case 'references':
        return `Node has ${node.content.references.length} references (complexity: ${(value * 100).toFixed(0)}%)`
      case 'node-type':
        return `Node type "${node.type}" has inherent complexity of ${(value * 100).toFixed(0)}%`
      default:
        return factor.reasoning || `Complexity factor value: ${(value * 100).toFixed(0)}%`
    }
  }

  /**
   * Analyze complexity across an entire session
   */
  analyzeSessionComplexity(session: DevFlowSession): ComplexityAnalysis {
    const nodesWithComplexity = session.nodes.map(node => ({
      ...node,
      complexity: node.complexity || this.estimateNodeComplexity(node, session)
    }))

    const totalNodes = nodesWithComplexity.length
    const averageComplexity = totalNodes > 0 
      ? nodesWithComplexity.reduce((sum, node) => sum + node.complexity!.storyPoints, 0) / totalNodes
      : 0

    const complexityDistribution = this.calculateComplexityDistribution(nodesWithComplexity)
    const highComplexityNodes = nodesWithComplexity.filter(node => node.complexity!.storyPoints >= 4)
    const recommendations = this.generateComplexityRecommendations(nodesWithComplexity, session)

    return {
      sessionId: session.id,
      totalNodes,
      averageComplexity,
      complexityDistribution,
      highComplexityNodes,
      complexityTrend: [], // Would be calculated from historical data
      estimationAccuracy: this.calculateEstimationAccuracy(nodesWithComplexity),
      recommendations
    }
  }

  /**
   * Calculate complexity distribution
   */
  private calculateComplexityDistribution(nodes: DevFlowNode[]): Record<ComplexityLevel, number> {
    const distribution: Record<ComplexityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    nodes.forEach(node => {
      if (node.complexity) {
        distribution[node.complexity.storyPoints]++
      }
    })

    return distribution
  }

  /**
   * Calculate estimation accuracy
   */
  private calculateEstimationAccuracy(nodes: DevFlowNode[]): EstimationAccuracy {
    const nodesWithActualTime = nodes.filter(node => 
      node.complexity?.actualHours && node.complexity?.estimatedHours
    )

    if (nodesWithActualTime.length === 0) {
      return {
        totalEstimations: 0,
        accurateEstimations: 0,
        accuracyPercentage: 0,
        averageVariance: 0,
        overestimations: 0,
        underestimations: 0
      }
    }

    let accurateCount = 0
    let overestimations = 0
    let underestimations = 0
    let totalVariance = 0

    nodesWithActualTime.forEach(node => {
      const estimated = node.complexity!.estimatedHours!
      const actual = node.complexity!.actualHours!
      const variance = Math.abs(estimated - actual) / estimated

      totalVariance += variance

      if (variance <= 0.2) { // Within 20% is considered accurate
        accurateCount++
      } else if (estimated > actual) {
        overestimations++
      } else {
        underestimations++
      }
    })

    return {
      totalEstimations: nodesWithActualTime.length,
      accurateEstimations: accurateCount,
      accuracyPercentage: (accurateCount / nodesWithActualTime.length) * 100,
      averageVariance: totalVariance / nodesWithActualTime.length,
      overestimations,
      underestimations
    }
  }

  /**
   * Generate complexity recommendations
   */
  private generateComplexityRecommendations(
    nodes: DevFlowNode[], 
    session: DevFlowSession
  ): ComplexityRecommendation[] {
    const recommendations: ComplexityRecommendation[] = []

    // Check for overly complex nodes (4 or 5 story points)
    const veryComplexNodes = nodes.filter(node => node.complexity!.storyPoints >= 4)
    if (veryComplexNodes.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'High Complexity Nodes Detected',
        description: `${veryComplexNodes.length} nodes have high complexity (4+ story points). Consider breaking them down into smaller tasks.`,
        nodeIds: veryComplexNodes.map(n => n.id),
        actionable: true,
        priority: 'high'
      })
    }

    // Check for maximum complexity nodes specifically
    const maxComplexityNodes = nodes.filter(node => node.complexity!.storyPoints === 5)
    if (maxComplexityNodes.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Maximum Complexity Nodes',
        description: `${maxComplexityNodes.length} nodes have maximum complexity (5 story points). These should be prioritized for breakdown.`,
        nodeIds: maxComplexityNodes.map(n => n.id),
        actionable: true,
        priority: 'high'
      })
    }

    // Check for complexity imbalance
    const averageComplexity = nodes.reduce((sum, node) => sum + node.complexity!.storyPoints, 0) / nodes.length
    if (averageComplexity > 3.5) {
      recommendations.push({
        type: 'suggestion',
        title: 'High Average Complexity',
        description: `Session has high average complexity (${averageComplexity.toFixed(1)}). Consider adding simpler tasks to balance the workload.`,
        actionable: true,
        priority: 'medium'
      })
    }

    // Check for nodes with many todos
    const todoHeavyNodes = nodes.filter(node => node.content.todos.length > 10)
    if (todoHeavyNodes.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Todo-Heavy Nodes',
        description: `${todoHeavyNodes.length} nodes have more than 10 todos. Consider splitting these into multiple nodes.`,
        nodeIds: todoHeavyNodes.map(n => n.id),
        actionable: true,
        priority: 'medium'
      })
    }

    // Check for dependency complexity
    const highDependencyNodes = nodes.filter(node => {
      const dependencies = session.connections?.filter(c => c.targetNodeId === node.id) || []
      return dependencies.length > 3
    })

    if (highDependencyNodes.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'High Dependency Complexity',
        description: `${highDependencyNodes.length} nodes have many dependencies, which may cause bottlenecks.`,
        nodeIds: highDependencyNodes.map(n => n.id),
        actionable: true,
        priority: 'medium'
      })
    }

    return recommendations
  }

  /**
   * Generate heatmap data for complexity visualization
   */
  generateComplexityHeatmap(session: DevFlowSession): ComplexityHeatmapData[] {
    return session.nodes.map(node => {
      const complexity = node.complexity || this.estimateNodeComplexity(node, session)
      const intensity = complexity.storyPoints / 5 // Normalize to 0-1
      
      return {
        nodeId: node.id,
        complexity: complexity.storyPoints,
        position: node.position,
        size: node.size,
        color: this.getComplexityColor(complexity.storyPoints),
        intensity
      }
    })
  }

  /**
   * Get color for complexity level
   */
  private getComplexityColor(storyPoints: ComplexityLevel): string {
    const colors = {
      1: '#22c55e', // Green - Simple
      2: '#84cc16', // Light Green - Easy
      3: '#eab308', // Yellow - Moderate
      4: '#f97316', // Orange - Complex
      5: '#ef4444'  // Red - Very Complex
    }
    
    return colors[storyPoints]
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<ComplexitySettings>): void {
    this.settings = { ...this.settings, ...newSettings }
  }

  /**
   * Get current settings
   */
  getSettings(): ComplexitySettings {
    return { ...this.settings }
  }
}

// Global complexity estimation engine instance
export const complexityEstimationEngine = new ComplexityEstimationEngine()