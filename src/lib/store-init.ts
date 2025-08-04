/**
 * Store initialization utilities
 */

import { useAppStore } from '@/store/app-store'

/**
 * Initialize the app store with default data and setup
 */
export function initializeAppStore() {
  const store = useAppStore.getState()
  
  // Initialize theme
  store.initializeTheme()
  
  // Setup theme listener
  store.setupThemeListener()
  
  // Update storage quota
  store.updateStorageQuota()
  
  // Add default templates if none exist
  if (store.sessionTemplates.length === 0) {
    addDefaultTemplates()
  }
}

/**
 * Add default session templates
 */
function addDefaultTemplates() {
  const store = useAppStore.getState()
  
  const defaultTemplates = [
    {
      id: 'api-integration-template',
      name: 'API Integration',
      description: 'Template for integrating with external APIs',
      category: 'Development',
      tags: ['api', 'integration', 'backend'],
      nodes: [
        {
          id: 'research-node',
          type: 'reference' as const,
          title: 'API Documentation Research',
          description: 'Research and understand the API endpoints',
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-1', text: 'Read API documentation', completed: false },
              { id: 'todo-2', text: 'Identify required endpoints', completed: false },
              { id: 'todo-3', text: 'Check authentication requirements', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'implementation-node',
          type: 'code' as const,
          title: 'API Client Implementation',
          description: 'Implement the API client code',
          position: { x: 500, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-4', text: 'Create API client class', completed: false },
              { id: 'todo-5', text: 'Implement authentication', completed: false },
              { id: 'todo-6', text: 'Add error handling', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'testing-node',
          type: 'task' as const,
          title: 'Testing & Validation',
          description: 'Test the API integration',
          position: { x: 300, y: 400 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-7', text: 'Write unit tests', completed: false },
              { id: 'todo-8', text: 'Test error scenarios', completed: false },
              { id: 'todo-9', text: 'Validate response handling', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'research-node',
          targetNodeId: 'implementation-node',
          type: 'sequence' as const,
          style: { strokeColor: '#3b82f6', strokeWidth: 2 }
        },
        {
          id: 'conn-2',
          sourceNodeId: 'implementation-node',
          targetNodeId: 'testing-node',
          type: 'sequence' as const,
          style: { strokeColor: '#3b82f6', strokeWidth: 2 }
        }
      ],
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system' as const
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'feature-development-template',
      name: 'Feature Development',
      description: 'Template for developing new features',
      category: 'Development',
      tags: ['feature', 'development', 'planning'],
      nodes: [
        {
          id: 'planning-node',
          type: 'task' as const,
          title: 'Feature Planning',
          description: 'Plan and design the feature',
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-1', text: 'Define feature requirements', completed: false },
              { id: 'todo-2', text: 'Create user stories', completed: false },
              { id: 'todo-3', text: 'Design UI/UX mockups', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'implementation-node',
          type: 'code' as const,
          title: 'Implementation',
          description: 'Implement the feature',
          position: { x: 500, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-4', text: 'Set up component structure', completed: false },
              { id: 'todo-5', text: 'Implement core functionality', completed: false },
              { id: 'todo-6', text: 'Add styling and animations', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'testing-node',
          type: 'task' as const,
          title: 'Testing',
          description: 'Test the feature thoroughly',
          position: { x: 300, y: 400 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-7', text: 'Write unit tests', completed: false },
              { id: 'todo-8', text: 'Perform integration testing', completed: false },
              { id: 'todo-9', text: 'User acceptance testing', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'planning-node',
          targetNodeId: 'implementation-node',
          type: 'sequence' as const,
          style: { strokeColor: '#10b981', strokeWidth: 2 }
        },
        {
          id: 'conn-2',
          sourceNodeId: 'implementation-node',
          targetNodeId: 'testing-node',
          type: 'sequence' as const,
          style: { strokeColor: '#10b981', strokeWidth: 2 }
        }
      ],
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system' as const
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'bug-fix-template',
      name: 'Bug Fix',
      description: 'Template for fixing bugs systematically',
      category: 'Maintenance',
      tags: ['bug', 'fix', 'debugging'],
      nodes: [
        {
          id: 'reproduction-node',
          type: 'task' as const,
          title: 'Bug Reproduction',
          description: 'Reproduce and understand the bug',
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-1', text: 'Reproduce the bug', completed: false },
              { id: 'todo-2', text: 'Identify steps to reproduce', completed: false },
              { id: 'todo-3', text: 'Document expected vs actual behavior', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'investigation-node',
          type: 'code' as const,
          title: 'Root Cause Analysis',
          description: 'Investigate and find the root cause',
          position: { x: 500, y: 100 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-4', text: 'Debug the code', completed: false },
              { id: 'todo-5', text: 'Identify root cause', completed: false },
              { id: 'todo-6', text: 'Plan the fix approach', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        },
        {
          id: 'fix-node',
          type: 'code' as const,
          title: 'Implement Fix',
          description: 'Implement and test the fix',
          position: { x: 300, y: 400 },
          size: { width: 300, height: 200 },
          status: 'idle' as const,
          content: {
            todos: [
              { id: 'todo-7', text: 'Implement the fix', completed: false },
              { id: 'todo-8', text: 'Test the fix', completed: false },
              { id: 'todo-9', text: 'Verify no regression', completed: false }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'reproduction-node',
          targetNodeId: 'investigation-node',
          type: 'sequence' as const,
          style: { strokeColor: '#ef4444', strokeWidth: 2 }
        },
        {
          id: 'conn-2',
          sourceNodeId: 'investigation-node',
          targetNodeId: 'fix-node',
          type: 'sequence' as const,
          style: { strokeColor: '#ef4444', strokeWidth: 2 }
        }
      ],
      defaultSettings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system' as const
      },
      author: 'DevKit Flow',
      version: '1.0.0',
      usageCount: 0,
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  defaultTemplates.forEach(template => {
    store.addTemplate(template)
  })
}

/**
 * Cleanup store resources
 */
export function cleanupAppStore() {
  const store = useAppStore.getState()
  store.cleanupThemeListener()
}