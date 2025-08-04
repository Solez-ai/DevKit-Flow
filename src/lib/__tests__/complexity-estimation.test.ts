import { describe, it, expect, beforeEach } from 'vitest'
import { ComplexityEstimationEngine, DEFAULT_COMPLEXITY_FACTORS } from '../complexity-estimation'
import type { DevFlowNode, DevFlowSession, ComplexityLevel } from '@/types'

describe('ComplexityEstimationEngine', () => {
  let engine: ComplexityEstimationEngine
  let mockNode: DevFlowNode
  let mockSession: DevFlowSession

  beforeEach(() => {
    engine = new ComplexityEstimationEngine()
    
    mockNode = {
      id: 'test-node-1',
      type: 'task',
      title: 'Test Task',
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
      status: 'idle',
      content: {
        todos: [
          { id: '1', text: 'Todo 1', completed: false },
          { id: '2', text: 'Todo 2', completed: false }
        ],
        codeSnippets: [
          { 
            id: '1', 
            title: 'Test Code', 
            language: 'javascript', 
            code: 'console.log("test")', 
            isTemplate: false, 
            tags: [] 
          }
        ],
        references: [
          { id: '1', title: 'Test Ref', type: 'documentation', importance: 'medium' }
        ],
        comments: []
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: 3,
        tags: []
      }
    }

    mockSession = {
      id: 'test-session-1',
      name: 'Test Session',
      nodes: [mockNode],
      connections: [],
      settings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'light'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: []
      },
      timeline: []
    }
  })

  describe('estimateNodeComplexity', () => {
    it('should estimate complexity for a simple node', () => {
      const estimate = engine.estimateNodeComplexity(mockNode, mockSession)
      
      expect(estimate.storyPoints).toBeGreaterThanOrEqual(1)
      expect(estimate.storyPoints).toBeLessThanOrEqual(5)
      expect(estimate.confidence).toBeGreaterThan(0)
      expect(estimate.confidence).toBeLessThanOrEqual(1)
      expect(estimate.factors).toHaveLength(DEFAULT_COMPLEXITY_FACTORS.length)
      expect(estimate.estimatedHours).toBeGreaterThan(0)
    })

    it('should assign higher complexity to nodes with more todos', () => {
      const simpleNode = { ...mockNode }
      const complexNode = {
        ...mockNode,
        id: 'complex-node',
        content: {
          ...mockNode.content,
          todos: Array.from({ length: 10 }, (_, i) => ({
            id: `todo-${i}`,
            text: `Todo ${i}`,
            completed: false
          }))
        }
      }

      const simpleEstimate = engine.estimateNodeComplexity(simpleNode, mockSession)
      const complexEstimate = engine.estimateNodeComplexity(complexNode, mockSession)

      expect(complexEstimate.storyPoints).toBeGreaterThanOrEqual(simpleEstimate.storyPoints)
    })

    it('should assign higher complexity to code nodes', () => {
      const taskNode = { ...mockNode, type: 'task' as const }
      const codeNode = { ...mockNode, type: 'code' as const, id: 'code-node' }

      const taskEstimate = engine.estimateNodeComplexity(taskNode, mockSession)
      const codeEstimate = engine.estimateNodeComplexity(codeNode, mockSession)

      expect(codeEstimate.storyPoints).toBeGreaterThanOrEqual(taskEstimate.storyPoints)
    })

    it('should consider dependencies in complexity calculation', () => {
      const dependentNode = { ...mockNode, id: 'dependent-node' }
      const sessionWithDependencies = {
        ...mockSession,
        nodes: [mockNode, dependentNode],
        connections: [
          {
            id: 'conn-1',
            sourceNodeId: mockNode.id,
            targetNodeId: dependentNode.id,
            type: 'dependency' as const,
            style: { strokeColor: '#000', strokeWidth: 2 }
          }
        ]
      }

      const independentEstimate = engine.estimateNodeComplexity(mockNode, mockSession)
      const dependentEstimate = engine.estimateNodeComplexity(dependentNode, sessionWithDependencies)

      // Dependent node should have higher complexity due to dependencies
      expect(dependentEstimate.storyPoints).toBeGreaterThanOrEqual(independentEstimate.storyPoints)
    })
  })

  describe('updateNodeComplexity', () => {
    it('should update node complexity with user input', () => {
      // const originalEstimate = engine.estimateNodeComplexity(mockNode, mockSession)
      const updates = { storyPoints: 5 as ComplexityLevel, notes: 'Very complex task' }
      
      const updatedEstimate = engine.updateNodeComplexity(mockNode, updates)
      
      expect(updatedEstimate.storyPoints).toBe(5)
      expect(updatedEstimate.notes).toBe('Very complex task')
      expect(updatedEstimate.estimatedBy).toBe('user')
      expect(updatedEstimate.estimatedHours).toBe(5 * engine.getSettings().storyPointToHoursRatio)
    })
  })

  describe('analyzeSessionComplexity', () => {
    it('should analyze complexity across a session', () => {
      const analysis = engine.analyzeSessionComplexity(mockSession)
      
      expect(analysis.sessionId).toBe(mockSession.id)
      expect(analysis.totalNodes).toBe(1)
      expect(analysis.averageComplexity).toBeGreaterThan(0)
      expect(analysis.complexityDistribution).toBeDefined()
      expect(analysis.recommendations).toBeDefined()
    })

    it('should identify high complexity nodes', () => {
      const highComplexityNode = {
        ...mockNode,
        id: 'high-complexity',
        content: {
          ...mockNode.content,
          todos: Array.from({ length: 15 }, (_, i) => ({
            id: `todo-${i}`,
            text: `Complex todo ${i}`,
            completed: false
          })),
          codeSnippets: Array.from({ length: 5 }, (_, i) => ({
            id: `code-${i}`,
            title: `Complex Code ${i}`,
            language: 'javascript',
            code: 'async function complexFunction() { /* complex logic */ }',
            isTemplate: false,
            tags: []
          }))
        }
      }

      const sessionWithHighComplexity = {
        ...mockSession,
        nodes: [mockNode, highComplexityNode]
      }

      const analysis = engine.analyzeSessionComplexity(sessionWithHighComplexity)
      
      expect(analysis.highComplexityNodes.length).toBeGreaterThan(0)
      expect(analysis.recommendations.some(r => r.type === 'warning')).toBe(true)
    })
  })

  describe('generateComplexityHeatmap', () => {
    it('should generate heatmap data for session nodes', () => {
      const heatmapData = engine.generateComplexityHeatmap(mockSession)
      
      expect(heatmapData).toHaveLength(1)
      expect(heatmapData[0].nodeId).toBe(mockNode.id)
      expect(heatmapData[0].complexity).toBeGreaterThanOrEqual(1)
      expect(heatmapData[0].complexity).toBeLessThanOrEqual(5)
      expect(heatmapData[0].color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(heatmapData[0].intensity).toBeGreaterThan(0)
      expect(heatmapData[0].intensity).toBeLessThanOrEqual(1)
    })
  })

  describe('settings management', () => {
    it('should update settings correctly', () => {
      const newSettings = {
        storyPointToHoursRatio: 6,
        enableAIAssistance: true
      }
      
      engine.updateSettings(newSettings)
      const updatedSettings = engine.getSettings()
      
      expect(updatedSettings.storyPointToHoursRatio).toBe(6)
      expect(updatedSettings.enableAIAssistance).toBe(true)
    })

    it('should recalculate estimated hours when ratio changes', () => {
      const originalEstimate = engine.estimateNodeComplexity(mockNode, mockSession)
      const originalHours = originalEstimate.estimatedHours

      engine.updateSettings({ storyPointToHoursRatio: 8 })
      const newEstimate = engine.estimateNodeComplexity(mockNode, mockSession)
      
      expect(newEstimate.estimatedHours).toBe(originalEstimate.storyPoints * 8)
      expect(newEstimate.estimatedHours).not.toBe(originalHours)
    })
  })

  describe('complexity factors', () => {
    it('should calculate all default complexity factors', () => {
      const estimate = engine.estimateNodeComplexity(mockNode, mockSession)
      
      const factorIds = estimate.factors.map(f => f.id)
      const expectedFactorIds = DEFAULT_COMPLEXITY_FACTORS.map(f => f.id)
      
      expect(factorIds).toEqual(expect.arrayContaining(expectedFactorIds))
    })

    it('should provide reasoning for each factor', () => {
      const estimate = engine.estimateNodeComplexity(mockNode, mockSession)
      
      estimate.factors.forEach(factor => {
        expect(factor.reasoning).toBeDefined()
        expect(factor.reasoning).toContain(factor.name.toLowerCase().includes('todo') ? 'todos' : '')
      })
    })
  })
})