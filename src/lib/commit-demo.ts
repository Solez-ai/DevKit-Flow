import { commitAnalysisEngine } from './commit-analysis'
import { commitMessageGenerator } from './commit-generator'
import type { DevFlowSession } from '@/types'

// Demo function to show commit generation in action
export function demonstrateCommitGeneration() {
  // Create a mock session with completed todos
  const mockSession: DevFlowSession = {
    id: 'demo-session',
    name: 'Feature Development Session',
    description: 'Working on user authentication feature',
    nodes: [
      {
        id: 'node-1',
        type: 'task',
        title: 'Implement user authentication',
        description: 'Add login and signup functionality',
        position: { x: 100, y: 100 },
        size: { width: 250, height: 200 },
        status: 'completed',
        content: {
          todos: [
            {
              id: 'todo-1',
              text: 'Create login form component',
              completed: true,
              completedAt: new Date()
            },
            {
              id: 'todo-2',
              text: 'Add password validation',
              completed: true,
              completedAt: new Date()
            },
            {
              id: 'todo-3',
              text: 'Implement JWT token handling',
              completed: true,
              completedAt: new Date()
            }
          ],
          codeSnippets: [
            {
              id: 'code-1',
              title: 'Auth Service',
              language: 'typescript',
              code: `class AuthService {
  async login(email: string, password: string) {
    // Implementation
  }
  
  async signup(userData: UserData) {
    // Implementation
  }
}`,
              isTemplate: false,
              tags: ['auth', 'service', 'typescript']
            }
          ],
          references: [],
          comments: []
        },
        metadata: {
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(),
          priority: 4,
          tags: ['auth', 'feature', 'frontend']
        }
      },
      {
        id: 'node-2',
        type: 'code',
        title: 'API endpoints for authentication',
        description: 'Backend API routes',
        position: { x: 400, y: 100 },
        size: { width: 250, height: 200 },
        status: 'active',
        content: {
          todos: [
            {
              id: 'todo-4',
              text: 'Create POST /api/login endpoint',
              completed: true,
              completedAt: new Date()
            },
            {
              id: 'todo-5',
              text: 'Add input validation middleware',
              completed: true,
              completedAt: new Date()
            }
          ],
          codeSnippets: [
            {
              id: 'code-2',
              title: 'Login Route',
              language: 'javascript',
              code: `app.post('/api/login', validateInput, async (req, res) => {
  // Login logic
})`,
              isTemplate: false,
              tags: ['api', 'backend', 'express']
            }
          ],
          references: [],
          comments: []
        },
        metadata: {
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          updatedAt: new Date(),
          priority: 3,
          tags: ['api', 'backend', 'auth']
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        type: 'dependency',
        label: 'requires',
        style: {
          strokeColor: '#3b82f6',
          strokeWidth: 2
        }
      }
    ],
    settings: {
      gridSize: 20,
      snapToGrid: true,
      autoLayout: false,
      theme: 'system'
    },
    metadata: {
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      updatedAt: new Date(),
      version: '1.0.0',
      tags: ['auth', 'feature']
    },
    timeline: []
  }

  console.log('🚀 DevKit Flow - Smart Git Commit Generator Demo')
  console.log('=' .repeat(50))
  
  // Step 1: Analyze the session
  console.log('\n📊 Step 1: Analyzing session...')
  const analysis = commitAnalysisEngine.analyzeSession(mockSession)
  
  console.log(`✅ Found ${analysis.completedTodos.length} completed todos`)
  console.log(`✅ Found ${analysis.modifiedNodes.length} modified nodes`)
  console.log(`✅ Found ${analysis.codeSnippets.length} code snippets`)
  
  // Step 2: Generate commit suggestions
  console.log('\n💡 Step 2: Generating commit suggestions...')
  const suggestions = commitAnalysisEngine.generateCommitSuggestions(analysis)
  
  console.log(`✅ Generated ${suggestions.length} commit suggestions`)
  
  // Step 3: Format commit messages
  console.log('\n📝 Step 3: Formatted commit messages:')
  console.log('-'.repeat(40))
  
  suggestions.forEach((suggestion, index) => {
    const message = commitMessageGenerator.generateMessage(suggestion)
    console.log(`\n${index + 1}. Confidence: ${Math.round(suggestion.confidence * 100)}%`)
    console.log(`Type: ${suggestion.type}`)
    console.log(`Scope: ${suggestion.scope || 'none'}`)
    console.log(`Message:`)
    console.log(message)
    console.log('-'.repeat(40))
  })
  
  // Step 4: Show analysis details
  console.log('\n🔍 Analysis Details:')
  console.log('Completed todos:')
  analysis.completedTodos.forEach(todo => {
    console.log(`  • ${todo.text}`)
  })
  
  console.log('\nModified nodes:')
  analysis.modifiedNodes.forEach(node => {
    console.log(`  • ${node.title} (${node.type})`)
  })
  
  console.log('\nCode snippets:')
  analysis.codeSnippets.forEach(snippet => {
    console.log(`  • ${snippet.title} (${snippet.language})`)
  })
  
  return {
    analysis,
    suggestions,
    messages: suggestions.map(s => commitMessageGenerator.generateMessage(s))
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).demonstrateCommitGeneration = demonstrateCommitGeneration
}