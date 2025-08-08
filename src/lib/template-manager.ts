/**
 * Session template management with built-in templates and customization
 */

import { persistenceManager } from './persistence'
import { generateId } from './utils'
import { sessionManager } from './session-manager'
import type { 
  SessionTemplate, 
  DevFlowSession, 
  DevFlowNode, 
  NodeConnection,
  SessionSettings,
  NodeType,
  ConnectionType,
  NodeMetadata
} from '@/types'

// Helper function to create complete metadata
function createNodeMetadata(priority: 1 | 2 | 3 | 4 | 5, tags: string[]): NodeMetadata {
  const now = new Date()
  return {
    createdAt: now,
    updatedAt: now,
    priority,
    tags
  }
}

export interface TemplateApplicationOptions {
  customName?: string
  customDescription?: string
  customSettings?: Partial<SessionSettings>
  nodePositionOffset?: { x: number; y: number }
  preserveNodeIds?: boolean
}

export interface TemplateValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

class TemplateManager {
  private initialized = false
  private builtInTemplates: SessionTemplate[] = []

  /**
   * Initialize the template manager
   */
  async init(): Promise<void> {
    if (this.initialized) return

    await persistenceManager.init()
    this.createBuiltInTemplates()
    
    this.initialized = true
  }

  /**
   * Initialize the template manager (alias for init)
   */
  async initialize(): Promise<void> {
    return this.init()
  }

  /**
   * Create built-in templates
   */
  private createBuiltInTemplates(): void {
    this.builtInTemplates = [
      this.createApiIntegrationTemplate(),
      this.createFeatureDevelopmentTemplate(),
      this.createBugFixTemplate(),
      this.createCodeReviewTemplate(),
      this.createResearchTemplate()
    ]
  }

  /**
   * Create API Integration template
   */
  private createApiIntegrationTemplate(): SessionTemplate {
    const nodes: Partial<DevFlowNode>[] = [
      {
        type: 'reference' as NodeType,
        title: 'API Documentation',
        description: 'Review API documentation and endpoints',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [
            {
              id: generateId(),
              title: 'API Documentation',
              type: 'documentation',
              importance: 'high',
              description: 'Main API documentation'
            }
          ],
          comments: []
        },
        metadata: createNodeMetadata(5, ['api', 'documentation'])
      },
      {
        type: 'task' as NodeType,
        title: 'Authentication Setup',
        description: 'Implement API authentication',
        position: { x: 450, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Set up API keys/tokens',
              completed: false
            },
            {
              id: generateId(),
              text: 'Implement authentication headers',
              completed: false
            },
            {
              id: generateId(),
              text: 'Handle authentication errors',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['authentication', 'security'])
      },
      {
        type: 'code' as NodeType,
        title: 'API Client Implementation',
        description: 'Core API client code',
        position: { x: 275, y: 350 },
        size: { width: 350, height: 250 },
        content: {
          todos: [],
          codeSnippets: [
            {
              id: generateId(),
              title: 'API Client Class',
              language: 'typescript',
              code: `class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    // Implementation here
  }
}`,
              isTemplate: true,
              tags: ['api', 'client']
            }
          ],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['implementation', 'api'])
      },
      {
        type: 'task' as NodeType,
        title: 'Error Handling',
        description: 'Implement comprehensive error handling',
        position: { x: 100, y: 650 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Handle network errors',
              completed: false
            },
            {
              id: generateId(),
              text: 'Handle API rate limiting',
              completed: false
            },
            {
              id: generateId(),
              text: 'Implement retry logic',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['error-handling', 'resilience'])
      },
      {
        type: 'task' as NodeType,
        title: 'Testing',
        description: 'Write tests for API integration',
        position: { x: 450, y: 650 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Unit tests for API client',
              completed: false
            },
            {
              id: generateId(),
              text: 'Integration tests',
              completed: false
            },
            {
              id: generateId(),
              text: 'Mock API responses',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(3, ['testing', 'quality'])
      }
    ]

    const connections: Partial<NodeConnection>[] = [
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[0].id || 'ref-1',
        targetNodeId: nodes[1].id || 'task-1',
        label: 'requires',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[1].id || 'task-1',
        targetNodeId: nodes[2].id || 'code-1',
        label: 'then',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[3].id || 'task-2',
        label: 'needs',
        style: { strokeColor: '#f59e0b', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[4].id || 'task-3',
        label: 'needs',
        style: { strokeColor: '#f59e0b', strokeWidth: 2 }
      }
    ]

    return {
      id: 'template-api-integration',
      name: 'API Integration',
      description: 'Template for integrating with external APIs',
      category: 'Integration',
      tags: ['api', 'integration', 'backend'],
      nodes,
      connections,
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create Feature Development template
   */
  private createFeatureDevelopmentTemplate(): SessionTemplate {
    const nodes: Partial<DevFlowNode>[] = [
      {
        type: 'task' as NodeType,
        title: 'Requirements Analysis',
        description: 'Analyze and document feature requirements',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Define user stories',
              completed: false
            },
            {
              id: generateId(),
              text: 'Identify acceptance criteria',
              completed: false
            },
            {
              id: generateId(),
              text: 'Document edge cases',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['requirements', 'planning'])
      },
      {
        type: 'task' as NodeType,
        title: 'Design & Architecture',
        description: 'Design the feature architecture',
        position: { x: 450, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Create system design',
              completed: false
            },
            {
              id: generateId(),
              text: 'Define data models',
              completed: false
            },
            {
              id: generateId(),
              text: 'Plan API endpoints',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['design', 'architecture'])
      },
      {
        type: 'code' as NodeType,
        title: 'Core Implementation',
        description: 'Main feature implementation',
        position: { x: 275, y: 350 },
        size: { width: 350, height: 250 },
        content: {
          todos: [],
          codeSnippets: [
            {
              id: generateId(),
              title: 'Feature Module',
              language: 'typescript',
              code: `// Feature implementation
export class FeatureService {
  // Core feature logic here
}`,
              isTemplate: true,
              tags: ['feature', 'implementation']
            }
          ],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['implementation', 'core'])
      },
      {
        type: 'task' as NodeType,
        title: 'Testing',
        description: 'Comprehensive testing strategy',
        position: { x: 100, y: 650 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Write unit tests',
              completed: false
            },
            {
              id: generateId(),
              text: 'Integration tests',
              completed: false
            },
            {
              id: generateId(),
              text: 'End-to-end tests',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['testing', 'quality'])
      },
      {
        type: 'task' as NodeType,
        title: 'Documentation',
        description: 'Feature documentation and guides',
        position: { x: 450, y: 650 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'API documentation',
              completed: false
            },
            {
              id: generateId(),
              text: 'User guide',
              completed: false
            },
            {
              id: generateId(),
              text: 'Developer notes',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(3, ['documentation', 'guides'])
      }
    ]

    const connections: Partial<NodeConnection>[] = [
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[0].id || 'task-1',
        targetNodeId: nodes[1].id || 'task-2',
        label: 'then',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[1].id || 'task-2',
        targetNodeId: nodes[2].id || 'code-1',
        label: 'then',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[3].id || 'task-3',
        label: 'needs',
        style: { strokeColor: '#f59e0b', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[4].id || 'task-4',
        label: 'needs',
        style: { strokeColor: '#f59e0b', strokeWidth: 2 }
      }
    ]

    return {
      id: 'template-feature-development',
      name: 'Feature Development',
      description: 'Complete workflow for developing new features',
      category: 'Development',
      tags: ['feature', 'development', 'workflow'],
      nodes,
      connections,
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create Bug Fix template
   */
  private createBugFixTemplate(): SessionTemplate {
    const nodes: Partial<DevFlowNode>[] = [
      {
        type: 'task' as NodeType,
        title: 'Bug Investigation',
        description: 'Investigate and reproduce the bug',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Reproduce the bug',
              completed: false
            },
            {
              id: generateId(),
              text: 'Identify root cause',
              completed: false
            },
            {
              id: generateId(),
              text: 'Document findings',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['investigation', 'debugging'])
      },
      {
        type: 'reference' as NodeType,
        title: 'Bug Report',
        description: 'Original bug report and related information',
        position: { x: 450, y: 100 },
        size: { width: 300, height: 200 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [
            {
              id: generateId(),
              title: 'Bug Report',
              type: 'internal',
              importance: 'high',
              description: 'Link to original bug report'
            }
          ],
          comments: []
        },
        metadata: createNodeMetadata(4, ['bug-report', 'reference'])
      },
      {
        type: 'code' as NodeType,
        title: 'Bug Fix Implementation',
        description: 'Code changes to fix the bug',
        position: { x: 275, y: 350 },
        size: { width: 350, height: 250 },
        content: {
          todos: [],
          codeSnippets: [
            {
              id: generateId(),
              title: 'Bug Fix',
              language: 'typescript',
              code: '// Bug fix implementation',
              isTemplate: true,
              tags: ['bugfix', 'implementation']
            }
          ],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['implementation', 'fix'])
      },
      {
        type: 'task' as NodeType,
        title: 'Testing & Verification',
        description: 'Test the fix and verify it works',
        position: { x: 275, y: 650 },
        size: { width: 350, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Test the fix',
              completed: false
            },
            {
              id: generateId(),
              text: 'Verify no regressions',
              completed: false
            },
            {
              id: generateId(),
              text: 'Add regression tests',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['testing', 'verification'])
      }
    ]

    const connections: Partial<NodeConnection>[] = [
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[1].id || 'ref-1',
        targetNodeId: nodes[0].id || 'task-1',
        label: 'informs',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[0].id || 'task-1',
        targetNodeId: nodes[2].id || 'code-1',
        label: 'then',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[3].id || 'task-2',
        label: 'then',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      }
    ]

    return {
      id: 'template-bug-fix',
      name: 'Bug Fix',
      description: 'Systematic approach to fixing bugs',
      category: 'Maintenance',
      tags: ['bug', 'fix', 'debugging'],
      nodes,
      connections,
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create Code Review template
   */
  private createCodeReviewTemplate(): SessionTemplate {
    const nodes: Partial<DevFlowNode>[] = [
      {
        type: 'reference' as NodeType,
        title: 'Pull Request',
        description: 'Link to the pull request being reviewed',
        position: { x: 275, y: 100 },
        size: { width: 350, height: 150 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [
            {
              id: generateId(),
              title: 'Pull Request',
              type: 'internal',
              importance: 'high',
              description: 'PR to review'
            }
          ],
          comments: []
        },
        metadata: createNodeMetadata(5, ['pr', 'review'])
      },
      {
        type: 'task' as NodeType,
        title: 'Code Quality Review',
        description: 'Review code quality and standards',
        position: { x: 100, y: 300 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Check code style',
              completed: false
            },
            {
              id: generateId(),
              text: 'Review naming conventions',
              completed: false
            },
            {
              id: generateId(),
              text: 'Check for code smells',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(4, ['quality', 'standards'])
      },
      {
        type: 'task' as NodeType,
        title: 'Logic & Functionality',
        description: 'Review business logic and functionality',
        position: { x: 450, y: 300 },
        size: { width: 300, height: 200 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Verify business logic',
              completed: false
            },
            {
              id: generateId(),
              text: 'Check edge cases',
              completed: false
            },
            {
              id: generateId(),
              text: 'Review error handling',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['logic', 'functionality'])
      },
      {
        type: 'comment' as NodeType,
        title: 'Review Comments',
        description: 'Feedback and suggestions',
        position: { x: 275, y: 550 },
        size: { width: 350, height: 200 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [],
          comments: [
            {
              id: generateId(),
              text: 'Add review comments here',
              createdAt: new Date()
            }
          ]
        },
        metadata: createNodeMetadata(3, ['feedback', 'comments'])
      }
    ]

    const connections: Partial<NodeConnection>[] = [
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[0].id || 'ref-1',
        targetNodeId: nodes[1].id || 'task-1',
        label: 'review',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[0].id || 'ref-1',
        targetNodeId: nodes[2].id || 'task-2',
        label: 'review',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[1].id || 'task-1',
        targetNodeId: nodes[3].id || 'comment-1',
        label: 'feedback',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[2].id || 'task-2',
        targetNodeId: nodes[3].id || 'comment-1',
        label: 'feedback',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      }
    ]

    return {
      id: 'template-code-review',
      name: 'Code Review',
      description: 'Structured approach to code reviews',
      category: 'Quality',
      tags: ['review', 'quality', 'collaboration'],
      nodes,
      connections,
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create Research template
   */
  private createResearchTemplate(): SessionTemplate {
    const nodes: Partial<DevFlowNode>[] = [
      {
        type: 'task' as NodeType,
        title: 'Research Goals',
        description: 'Define what you want to research',
        position: { x: 275, y: 100 },
        size: { width: 350, height: 150 },
        content: {
          todos: [
            {
              id: generateId(),
              text: 'Define research questions',
              completed: false
            },
            {
              id: generateId(),
              text: 'Set success criteria',
              completed: false
            }
          ],
          codeSnippets: [],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(5, ['goals', 'planning'])
      },
      {
        type: 'reference' as NodeType,
        title: 'Research Sources',
        description: 'Collect relevant sources and references',
        position: { x: 100, y: 300 },
        size: { width: 300, height: 250 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [
            {
              id: generateId(),
              title: 'Documentation',
              type: 'documentation',
              importance: 'high',
              description: 'Official documentation'
            },
            {
              id: generateId(),
              title: 'Articles',
              type: 'article',
              importance: 'medium',
              description: 'Relevant articles'
            }
          ],
          comments: []
        },
        metadata: createNodeMetadata(4, ['sources', 'references'])
      },
      {
        type: 'code' as NodeType,
        title: 'Experiments & Prototypes',
        description: 'Code experiments and prototypes',
        position: { x: 450, y: 300 },
        size: { width: 300, height: 250 },
        content: {
          todos: [],
          codeSnippets: [
            {
              id: generateId(),
              title: 'Experiment 1',
              language: 'typescript',
              code: '// Research experiment code',
              isTemplate: true,
              tags: ['experiment', 'prototype']
            }
          ],
          references: [],
          comments: []
        },
        metadata: createNodeMetadata(3, ['experiments', 'prototypes'])
      },
      {
        type: 'comment' as NodeType,
        title: 'Findings & Notes',
        description: 'Document research findings',
        position: { x: 275, y: 600 },
        size: { width: 350, height: 200 },
        content: {
          todos: [],
          codeSnippets: [],
          references: [],
          comments: [
            {
              id: generateId(),
              text: 'Research findings and insights',
              createdAt: new Date()
            }
          ]
        },
        metadata: createNodeMetadata(4, ['findings', 'notes'])
      }
    ]

    const connections: Partial<NodeConnection>[] = [
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[0].id || 'task-1',
        targetNodeId: nodes[1].id || 'ref-1',
        label: 'guides',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'sequence' as ConnectionType,
        sourceNodeId: nodes[0].id || 'task-1',
        targetNodeId: nodes[2].id || 'code-1',
        label: 'guides',
        style: { strokeColor: '#10b981', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[1].id || 'ref-1',
        targetNodeId: nodes[3].id || 'comment-1',
        label: 'informs',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      },
      {
        type: 'dependency' as ConnectionType,
        sourceNodeId: nodes[2].id || 'code-1',
        targetNodeId: nodes[3].id || 'comment-1',
        label: 'informs',
        style: { strokeColor: '#3b82f6', strokeWidth: 2 }
      }
    ]

    return {
      id: 'template-research',
      name: 'Research & Investigation',
      description: 'Structured approach to research and investigation',
      category: 'Research',
      tags: ['research', 'investigation', 'learning'],
      nodes,
      connections,
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Get all built-in templates
   */
  getBuiltInTemplates(): SessionTemplate[] {
    return [...this.builtInTemplates]
  }

  /**
   * Get all custom templates
   */
  async getCustomTemplates(): Promise<SessionTemplate[]> {
    await this.ensureInitialized()
    return await persistenceManager.loadAllTemplates()
  }

  /**
   * Get all templates (built-in + custom)
   */
  async getAllTemplates(): Promise<SessionTemplate[]> {
    await this.ensureInitialized()
    const customTemplates = await this.getCustomTemplates()
    return [...this.builtInTemplates, ...customTemplates]
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<SessionTemplate | null> {
    await this.ensureInitialized()
    
    // Check built-in templates first
    const builtInTemplate = this.builtInTemplates.find(t => t.id === templateId)
    if (builtInTemplate) {
      return builtInTemplate
    }

    // Check custom templates
    const customTemplates = await this.getCustomTemplates()
    return customTemplates.find(t => t.id === templateId) || null
  }

  /**
   * Apply template to create a new session
   */
  async applyTemplate(
    templateId: string,
    options: TemplateApplicationOptions = {}
  ): Promise<DevFlowSession> {
    await this.ensureInitialized()

    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const {
      customName,
      customDescription,
      customSettings,
      nodePositionOffset = { x: 0, y: 0 },
      preserveNodeIds = false
    } = options

    // Create new session from template
    const sessionName = customName || `${template.name} Session`
    const sessionDescription = customDescription || template.description

    const session = await sessionManager.createSession(
      sessionName,
      sessionDescription,
      { ...template.defaultSettings, ...customSettings }
    )

    // Generate new IDs for nodes and connections if not preserving
    const nodeIdMap = new Map<string, string>()
    
    // Create nodes from template
    const nodes: DevFlowNode[] = template.nodes.map(templateNode => {
      const nodeId = preserveNodeIds && templateNode.id ? templateNode.id : generateId()
      if (templateNode.id) {
        nodeIdMap.set(templateNode.id, nodeId)
      }

      const now = new Date()
      return {
        id: nodeId,
        type: templateNode.type!,
        title: templateNode.title!,
        description: templateNode.description,
        position: {
          x: (templateNode.position?.x || 0) + nodePositionOffset.x,
          y: (templateNode.position?.y || 0) + nodePositionOffset.y
        },
        size: templateNode.size || { width: 300, height: 200 },
        status: 'idle',
        content: {
          todos: templateNode.content?.todos || [],
          codeSnippets: templateNode.content?.codeSnippets || [],
          references: templateNode.content?.references || [],
          comments: templateNode.content?.comments || []
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          priority: templateNode.metadata?.priority || 3,
          tags: templateNode.metadata?.tags || [],
          timeSpent: 0
        }
      }
    })

    // Create connections from template
    const connections: NodeConnection[] = template.connections.map(templateConnection => {
      const sourceNodeId = nodeIdMap.get(templateConnection.sourceNodeId!) || templateConnection.sourceNodeId!
      const targetNodeId = nodeIdMap.get(templateConnection.targetNodeId!) || templateConnection.targetNodeId!

      return {
        id: generateId(),
        sourceNodeId,
        targetNodeId,
        type: templateConnection.type!,
        label: templateConnection.label,
        style: templateConnection.style || { strokeColor: '#3b82f6', strokeWidth: 2 }
      }
    })

    // Update session with nodes and connections
    const updatedSession = await sessionManager.updateSession(session.id, {
      nodes,
      connections
    })

    if (!updatedSession) {
      throw new Error('Failed to apply template to session')
    }

    // Update template usage count
    await this.incrementTemplateUsage(templateId)

    return updatedSession
  }

  /**
   * Create custom template from session
   */
  async createTemplateFromSession(
    sessionId: string,
    templateName: string,
    templateDescription: string,
    category: string = 'Custom',
    tags: string[] = []
  ): Promise<SessionTemplate> {
    await this.ensureInitialized()

    const session = await sessionManager.loadSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const template: SessionTemplate = {
      id: generateId(),
      name: templateName,
      description: templateDescription,
      category,
      tags,
      nodes: session.nodes.map(node => ({
        ...node,
        id: undefined, // Remove ID so new ones are generated
        status: 'idle', // Reset status
        metadata: {
          ...node.metadata,
          timeSpent: undefined // Remove time tracking
        }
      })),
      connections: session.connections.map(connection => ({
        ...connection,
        id: undefined // Remove ID so new ones are generated
      })),
      defaultSettings: session.settings,
      author: 'User',
      version: '1.0.0',
      usageCount: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validate template
    const validation = this.validateTemplate(template)
    if (!validation.isValid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`)
    }

    // Save template
    await persistenceManager.saveTemplate(template)

    return template
  }

  /**
   * Update custom template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<SessionTemplate>
  ): Promise<SessionTemplate | null> {
    await this.ensureInitialized()

    // Cannot update built-in templates
    if (this.builtInTemplates.some(t => t.id === templateId)) {
      throw new Error('Cannot update built-in templates')
    }

    const existingTemplate = await this.getTemplate(templateId)
    if (!existingTemplate) {
      throw new Error(`Template ${templateId} not found`)
    }

    const updatedTemplate: SessionTemplate = {
      ...existingTemplate,
      ...updates,
      id: templateId, // Ensure ID cannot be changed
      updatedAt: new Date()
    }

    // Validate updated template
    const validation = this.validateTemplate(updatedTemplate)
    if (!validation.isValid) {
      throw new Error(`Invalid template update: ${validation.errors.join(', ')}`)
    }

    await persistenceManager.saveTemplate(updatedTemplate)
    return updatedTemplate
  }

  /**
   * Delete custom template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.ensureInitialized()

    // Cannot delete built-in templates
    if (this.builtInTemplates.some(t => t.id === templateId)) {
      throw new Error('Cannot delete built-in templates')
    }

    await persistenceManager.deleteTemplate(templateId)
  }

  /**
   * Validate template
   */
  validateTemplate(template: SessionTemplate): TemplateValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    if (!template.id || template.id.trim() === '') {
      errors.push('Template ID is required')
    }

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required')
    }

    if (!template.description || template.description.trim() === '') {
      warnings.push('Template description is recommended')
    }

    if (!template.category || template.category.trim() === '') {
      warnings.push('Template category is recommended')
    }

    // Validate nodes
    if (!template.nodes || template.nodes.length === 0) {
      warnings.push('Template should have at least one node')
    }

    // Validate connections reference existing nodes
    if (template.connections && template.connections.length > 0) {
      const nodeIds = new Set(template.nodes.map(n => n.id).filter(Boolean))
      
      for (const connection of template.connections) {
        if (connection.sourceNodeId && !nodeIds.has(connection.sourceNodeId)) {
          errors.push(`Connection references non-existent source node: ${connection.sourceNodeId}`)
        }
        
        if (connection.targetNodeId && !nodeIds.has(connection.targetNodeId)) {
          errors.push(`Connection references non-existent target node: ${connection.targetNodeId}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Export template as JSON
   */
  async exportTemplate(templateId: string): Promise<string> {
    await this.ensureInitialized()

    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    return JSON.stringify({
      template,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2)
  }

  /**
   * Import template from JSON
   */
  async importTemplate(jsonData: string): Promise<SessionTemplate> {
    await this.ensureInitialized()

    try {
      const data = JSON.parse(jsonData)
      
      if (!data.template) {
        throw new Error('Invalid template format: missing template data')
      }

      const template: SessionTemplate = {
        ...data.template,
        id: generateId(), // Generate new ID to avoid conflicts
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0 // Reset usage count
      }

      // Validate imported template
      const validation = this.validateTemplate(template)
      if (!validation.isValid) {
        throw new Error(`Invalid imported template: ${validation.errors.join(', ')}`)
      }

      // Save imported template
      await persistenceManager.saveTemplate(template)

      return template
    } catch (error) {
      throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Increment template usage count
   */
  private async incrementTemplateUsage(templateId: string): Promise<void> {
    // Only increment for custom templates (built-in templates are read-only)
    if (this.builtInTemplates.some(t => t.id === templateId)) {
      return
    }

    const template = await this.getTemplate(templateId)
    if (template) {
      await this.updateTemplate(templateId, {
        usageCount: template.usageCount + 1
      })
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<{
    totalTemplates: number
    builtInTemplates: number
    customTemplates: number
    mostUsedTemplate: SessionTemplate | null
    totalUsage: number
  }> {
    await this.ensureInitialized()

    const customTemplates = await this.getCustomTemplates()
    const allTemplates = [...this.builtInTemplates, ...customTemplates]
    
    const mostUsedTemplate = allTemplates.reduce((prev, current) => 
      (current.usageCount > (prev?.usageCount || 0)) ? current : prev
    , null as SessionTemplate | null)

    const totalUsage = allTemplates.reduce((sum, template) => sum + template.usageCount, 0)

    return {
      totalTemplates: allTemplates.length,
      builtInTemplates: this.builtInTemplates.length,
      customTemplates: customTemplates.length,
      mostUsedTemplate,
      totalUsage
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, category?: string): Promise<SessionTemplate[]> {
    await this.ensureInitialized()

    const allTemplates = await this.getAllTemplates()
    const lowerQuery = query.toLowerCase()

    return allTemplates.filter(template => {
      const matchesQuery = 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))

      const matchesCategory = !category || template.category === category

      return matchesQuery && matchesCategory
    })
  }

  /**
   * Ensure manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }
}

// Singleton instance
export const templateManager = new TemplateManager()
