import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { initializeTheme, setupThemeListener, resolveTheme, applyTheme } from '@/lib/theme'
import { getStorageQuota, type StorageQuota } from '@/lib/storage'
import { sessionManager } from '@/lib/session-manager'
import { templateManager } from '@/lib/template-manager'
import { exportImportManager } from '@/lib/export-import-manager'
import { aiService } from '@/lib/ai-service'
import { builtInPromptTemplates } from '@/lib/prompt-templates'
import { complexityEstimationEngine } from '@/lib/complexity-estimation'
import { AppStoreCommandFactory } from './commands'
import type { 
  WorkspaceType, 
  ThemeType, 
  UserPreferences, 
  DevFlowSession, 
  RegexPattern,
  SessionTemplate,
  AppError,
  DevFlowNode,
  NodeConnection,
  CodeSnippet,
  ClaudeMCPConfig,
  ComplexityEstimate,
  TimeEstimate,
  ComplexityAnalysis,
  ComplexityHeatmapData
} from '@/types'

interface AppState {
  // Current workspace
  currentWorkspace: WorkspaceType
  
  // Theme and preferences
  theme: ThemeType
  userPreferences: UserPreferences
  
  // AI Configuration
  aiConfig: ClaudeMCPConfig
  
  // DevFlow Studio state
  sessions: DevFlowSession[]
  currentSessionId: string | null
  sessionTemplates: SessionTemplate[]
  
  // Regexr++ state
  patterns: RegexPattern[]
  currentPatternId: string | null
  
  // UI state
  sidebarCollapsed: boolean
  propertiesPanelOpen: boolean
  
  // Error handling
  errors: AppError[]
  
  // Loading states
  isLoading: boolean
  loadingMessage?: string
  
  // Storage information
  storageQuota: StorageQuota
  
  // Theme listener cleanup
  themeListenerCleanup?: () => void
}

interface AppActions {
  // Workspace actions
  setCurrentWorkspace: (workspace: WorkspaceType) => void
  
  // Theme actions
  setTheme: (theme: ThemeType) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  
  // AI actions
  updateAIConfig: (config: Partial<ClaudeMCPConfig>) => void
  initializeAI: () => Promise<void>
  
  // Session actions
  addSession: (session: DevFlowSession) => void
  updateSession: (sessionId: string, updates: Partial<DevFlowSession>) => void
  deleteSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string | null) => void
  duplicateSession: (sessionId: string) => void
  createSession: (name: string, description?: string) => Promise<void>
  loadSessions: () => Promise<void>
  validateSession: (sessionId: string) => Promise<boolean>
  
  // Pattern actions
  addPattern: (pattern: RegexPattern) => void
  updatePattern: (patternId: string, updates: Partial<RegexPattern>) => void
  deletePattern: (patternId: string) => void
  setCurrentPattern: (patternId: string | null) => void
  
  // Template actions
  addTemplate: (template: SessionTemplate) => void
  updateTemplate: (templateId: string, updates: Partial<SessionTemplate>) => void
  deleteTemplate: (templateId: string) => void
  loadTemplates: () => Promise<void>
  createTemplateFromSession: (sessionId: string, name: string, description: string, category?: string, tags?: string[]) => Promise<void>
  applyTemplate: (templateId: string, options?: any) => Promise<void>
  exportTemplate: (templateId: string) => Promise<string>
  importTemplate: (jsonData: string) => Promise<void>
  
  // UI actions
  toggleSidebar: () => void
  togglePropertiesPanel: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setPropertiesPanelOpen: (open: boolean) => void
  
  // Error actions
  addError: (error: AppError) => void
  removeError: (errorId: string) => void
  clearErrors: () => void
  
  // Loading actions
  setLoading: (loading: boolean, message?: string) => void
  
  // Storage actions
  updateStorageQuota: () => Promise<void>
  
  // Theme actions
  initializeTheme: () => void
  setupThemeListener: () => void
  cleanupThemeListener: () => void
  
  // Command factory
  getCommandFactory: () => AppStoreCommandFactory
  
  // Node actions (for command factory)
  addNodeToSession: (sessionId: string, node: DevFlowNode) => void
  removeNodeFromSession: (sessionId: string, nodeId: string) => void
  updateNodeInSession: (sessionId: string, nodeId: string, updates: Partial<DevFlowNode>) => void
  
  // Connection actions (for command factory)
  addConnectionToSession: (sessionId: string, connection: NodeConnection) => void
  removeConnectionFromSession: (sessionId: string, connectionId: string) => void
  
  // Code snippet actions
  addCodeSnippetToNode: (sessionId: string, nodeId: string, codeSnippet: CodeSnippet) => void
  updateCodeSnippetInNode: (sessionId: string, nodeId: string, snippetId: string, updates: Partial<CodeSnippet>) => void
  removeCodeSnippetFromNode: (sessionId: string, nodeId: string, snippetId: string) => void
  
  // Complexity estimation actions
  updateNodeComplexity: (sessionId: string, nodeId: string, complexity: ComplexityEstimate) => void
  updateNodeTimeEstimate: (sessionId: string, nodeId: string, timeEstimate: TimeEstimate) => void
  estimateSessionComplexity: (sessionId: string) => Promise<ComplexityAnalysis>
  generateComplexityHeatmap: (sessionId: string) => ComplexityHeatmapData[]
  
  // Export/Import actions
  exportSessionsToJSON: (sessionIds: string[], options?: any) => Promise<string>
  exportSessionToMarkdown: (sessionId: string) => Promise<string>
  exportTemplatesToJSON: (templateIds: string[]) => Promise<string>
  importFromJSON: (jsonData: string, options?: any) => Promise<any>
  handleFileImport: (file: File) => Promise<any>

  // Utility actions
  reset: () => void
  exportData: () => string
  importData: (data: string) => boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  font: {
    family: 'JetBrains Mono',
    size: 14
  },
  behavior: {
    autoSave: true,
    confirmDelete: true,
    showTooltips: true,
    gridVisible: true,
    snapToGrid: true
  },
  keyboardShortcuts: {
    'new-node': 'Ctrl+N',
    'save-session': 'Ctrl+S',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y',
    'delete': 'Delete',
    'duplicate': 'Ctrl+D',
    'select-all': 'Ctrl+A',
    'zoom-in': 'Ctrl+=',
    'zoom-out': 'Ctrl+-',
    'reset-zoom': 'Ctrl+0',
    'toggle-grid': 'Ctrl+G',
    'toggle-sidebar': 'Ctrl+B'
  }
}

const defaultAIConfig: ClaudeMCPConfig = {
  isEnabled: false,
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'anthropic/claude-3-haiku',
  rateLimiting: {
    requestsPerMinute: 20,
    cooldownPeriod: 60,
    maxConcurrentRequests: 3
  },
  promptTemplates: [...builtInPromptTemplates]
}

const initialState: AppState = {
  currentWorkspace: 'studio',
  theme: 'system',
  userPreferences: defaultPreferences,
  aiConfig: defaultAIConfig,
  sessions: [],
  currentSessionId: null,
  sessionTemplates: [],
  patterns: [],
  currentPatternId: null,
  sidebarCollapsed: false,
  propertiesPanelOpen: false,
  errors: [],
  isLoading: false,
  storageQuota: { used: 0, quota: 0, percentage: 0 }
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      
      // Workspace actions
      setCurrentWorkspace: (workspace) => set((state) => {
        state.currentWorkspace = workspace
      }),
      
      // Theme actions
      setTheme: (theme) => set((state) => {
        state.theme = theme
        state.userPreferences.theme = theme
        const resolvedTheme = resolveTheme(theme)
        applyTheme(resolvedTheme)
      }),
      
      updateUserPreferences: (preferences) => set((state) => {
        Object.assign(state.userPreferences, preferences)
      }),
      
      // AI actions
      updateAIConfig: (config) => set(async (state) => {
        try {
          Object.assign(state.aiConfig, config)
          await aiService.initialize(state.aiConfig)
        } catch (error) {
          console.error('Failed to update AI config:', error)
          state.errors.push({
            code: 'AI_CONFIG_UPDATE_FAILED',
            message: `Failed to update AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),

      initializeAI: async () => {
        try {
          const state = get()
          await aiService.initialize(state.aiConfig)
        } catch (error) {
          console.error('Failed to initialize AI service:', error)
          set((state) => {
            state.errors.push({
              code: 'AI_INIT_FAILED',
              message: `Failed to initialize AI service: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },
      
      // Session actions
      addSession: (session) => set((state) => {
        state.sessions.push(session)
        state.currentSessionId = session.id
      }),
      
      updateSession: (sessionId, updates) => set(async (state) => {
        try {
          const updatedSession = await sessionManager.updateSession(sessionId, updates)
          if (updatedSession) {
            const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
            if (sessionIndex !== -1) {
              state.sessions[sessionIndex] = updatedSession
            }
          }
        } catch (error) {
          console.error('Failed to update session:', error)
          state.errors.push({
            code: 'SESSION_UPDATE_FAILED',
            message: `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),
      
      deleteSession: (sessionId) => set(async (state) => {
        try {
          await sessionManager.deleteSession(sessionId)
          state.sessions = state.sessions.filter(s => s.id !== sessionId)
          if (state.currentSessionId === sessionId) {
            state.currentSessionId = state.sessions.length > 0 ? state.sessions[0].id : null
          }
        } catch (error) {
          console.error('Failed to delete session:', error)
          state.errors.push({
            code: 'SESSION_DELETE_FAILED',
            message: `Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),
      
      setCurrentSession: (sessionId) => set((state) => {
        state.currentSessionId = sessionId
      }),
      
      duplicateSession: (sessionId) => set(async (state) => {
        try {
          const duplicatedSession = await sessionManager.duplicateSession(sessionId)
          state.sessions.push(duplicatedSession)
          state.currentSessionId = duplicatedSession.id
        } catch (error) {
          console.error('Failed to duplicate session:', error)
          state.errors.push({
            code: 'SESSION_DUPLICATE_FAILED',
            message: `Failed to duplicate session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),

      createSession: async (name, description) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Creating session...'
          })

          const session = await sessionManager.createSession(name, description)
          
          set((state) => {
            state.sessions.push(session)
            state.currentSessionId = session.id
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to create session:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'SESSION_CREATE_FAILED',
              message: `Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },

      loadSessions: async () => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Loading sessions...'
          })

          const sessions = await sessionManager.loadAllSessions()
          
          set((state) => {
            state.sessions = sessions
            if (sessions.length > 0 && !state.currentSessionId) {
              state.currentSessionId = sessions[0].id
            }
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to load sessions:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'SESSION_LOAD_FAILED',
              message: `Failed to load sessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },

      validateSession: async (sessionId) => {
        try {
          const session = get().sessions.find(s => s.id === sessionId)
          if (!session) {
            return false
          }

          const validation = await sessionManager.validateSession(session)
          
          if (!validation.isValid) {
            set((state) => {
              state.errors.push({
                code: 'SESSION_VALIDATION_FAILED',
                message: `Session validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
                details: validation,
                timestamp: new Date()
              })
            })
          }

          return validation.isValid
        } catch (error) {
          console.error('Failed to validate session:', error)
          return false
        }
      },
      
      // Pattern actions
      addPattern: (pattern) => set((state) => {
        state.patterns.push(pattern)
        state.currentPatternId = pattern.id
      }),
      
      updatePattern: (patternId, updates) => set((state) => {
        const patternIndex = state.patterns.findIndex(p => p.id === patternId)
        if (patternIndex !== -1) {
          Object.assign(state.patterns[patternIndex], updates)
          state.patterns[patternIndex].metadata.updatedAt = new Date()
        }
      }),
      
      deletePattern: (patternId) => set((state) => {
        state.patterns = state.patterns.filter(p => p.id !== patternId)
        if (state.currentPatternId === patternId) {
          state.currentPatternId = state.patterns.length > 0 ? state.patterns[0].id : null
        }
      }),
      
      setCurrentPattern: (patternId) => set((state) => {
        state.currentPatternId = patternId
      }),
      
      // Template actions
      addTemplate: (template) => set((state) => {
        state.sessionTemplates.push(template)
      }),
      
      updateTemplate: (templateId, updates) => set(async (state) => {
        try {
          const updatedTemplate = await templateManager.updateTemplate(templateId, updates)
          if (updatedTemplate) {
            const templateIndex = state.sessionTemplates.findIndex(t => t.id === templateId)
            if (templateIndex !== -1) {
              state.sessionTemplates[templateIndex] = updatedTemplate
            }
          }
        } catch (error) {
          console.error('Failed to update template:', error)
          state.errors.push({
            code: 'TEMPLATE_UPDATE_FAILED',
            message: `Failed to update template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),
      
      deleteTemplate: (templateId) => set(async (state) => {
        try {
          await templateManager.deleteTemplate(templateId)
          state.sessionTemplates = state.sessionTemplates.filter(t => t.id !== templateId)
        } catch (error) {
          console.error('Failed to delete template:', error)
          state.errors.push({
            code: 'TEMPLATE_DELETE_FAILED',
            message: `Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error,
            timestamp: new Date()
          })
        }
      }),

      loadTemplates: async () => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Loading templates...'
          })

          const templates = await templateManager.getAllTemplates()
          
          set((state) => {
            state.sessionTemplates = templates
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to load templates:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'TEMPLATE_LOAD_FAILED',
              message: `Failed to load templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },

      createTemplateFromSession: async (sessionId, name, description, category, tags) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Creating template...'
          })

          const template = await templateManager.createTemplateFromSession(
            sessionId, 
            name, 
            description, 
            category, 
            tags
          )
          
          set((state) => {
            state.sessionTemplates.push(template)
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to create template:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'TEMPLATE_CREATE_FAILED',
              message: `Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },

      applyTemplate: async (templateId, options) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Applying template...'
          })

          const session = await templateManager.applyTemplate(templateId, options)
          
          set((state) => {
            state.sessions.push(session)
            state.currentSessionId = session.id
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to apply template:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'TEMPLATE_APPLY_FAILED',
              message: `Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },

      exportTemplate: async (templateId) => {
        try {
          return await templateManager.exportTemplate(templateId)
        } catch (error) {
          console.error('Failed to export template:', error)
          set((state) => {
            state.errors.push({
              code: 'TEMPLATE_EXPORT_FAILED',
              message: `Failed to export template: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      importTemplate: async (jsonData) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Importing template...'
          })

          const template = await templateManager.importTemplate(jsonData)
          
          set((state) => {
            state.sessionTemplates.push(template)
            state.isLoading = false
            state.loadingMessage = undefined
          })
        } catch (error) {
          console.error('Failed to import template:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'TEMPLATE_IMPORT_FAILED',
              message: `Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
        }
      },
      
      // UI actions
      toggleSidebar: () => set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed
      }),
      
      togglePropertiesPanel: () => set((state) => {
        state.propertiesPanelOpen = !state.propertiesPanelOpen
      }),
      
      setSidebarCollapsed: (collapsed) => set((state) => {
        state.sidebarCollapsed = collapsed
      }),
      
      setPropertiesPanelOpen: (open) => set((state) => {
        state.propertiesPanelOpen = open
      }),
      
      // Error actions
      addError: (error) => set((state) => {
        state.errors.push(error)
      }),
      
      removeError: (errorId) => set((state) => {
        state.errors = state.errors.filter(e => e.code !== errorId)
      }),
      
      clearErrors: () => set((state) => {
        state.errors = []
      }),
      
      // Loading actions
      setLoading: (loading, message) => set((state) => {
        state.isLoading = loading
        state.loadingMessage = message
      }),
      
      // Storage actions
      updateStorageQuota: async () => {
        const quota = await getStorageQuota()
        set((state) => {
          state.storageQuota = quota
        })
      },
      
      // Theme actions
      initializeTheme: () => {
        const state = get()
        initializeTheme(state.theme)
      },
      
      setupThemeListener: () => set((state) => {
        if (state.themeListenerCleanup) {
          state.themeListenerCleanup()
        }
        
        state.themeListenerCleanup = setupThemeListener((systemTheme) => {
          const currentState = get()
          if (currentState.theme === 'system') {
            applyTheme(systemTheme)
          }
        })
      }),
      
      cleanupThemeListener: () => set((state) => {
        if (state.themeListenerCleanup) {
          state.themeListenerCleanup()
          state.themeListenerCleanup = undefined
        }
      }),
      
      // Command factory
      getCommandFactory: () => {
        const state = get()
        return new AppStoreCommandFactory(
          {
            addSession: state.addSession,
            updateSession: state.updateSession,
            deleteSession: state.deleteSession,
            addPattern: state.addPattern,
            updatePattern: state.updatePattern,
            deletePattern: state.deletePattern,
            addTemplate: state.addTemplate,
            updateTemplate: state.updateTemplate,
            deleteTemplate: state.deleteTemplate
          },
          {
            getSession: (sessionId: string) => state.sessions.find(s => s.id === sessionId),
            getPattern: (patternId: string) => state.patterns.find(p => p.id === patternId),
            getTemplate: (templateId: string) => state.sessionTemplates.find(t => t.id === templateId),
            getNode: (sessionId: string, nodeId: string) => {
              const session = state.sessions.find(s => s.id === sessionId)
              return session?.nodes.find(n => n.id === nodeId)
            },
            getConnection: (sessionId: string, connectionId: string) => {
              const session = state.sessions.find(s => s.id === sessionId)
              return session?.connections.find(c => c.id === connectionId)
            }
          }
        )
      },
      
      // Node actions (for command factory)
      addNodeToSession: (sessionId, node) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].nodes.push(node)
          state.sessions[sessionIndex].metadata.updatedAt = new Date()
        }
      }),
      
      removeNodeFromSession: (sessionId, nodeId) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].nodes = state.sessions[sessionIndex].nodes.filter(n => n.id !== nodeId)
          // Also remove connections involving this node
          state.sessions[sessionIndex].connections = state.sessions[sessionIndex].connections.filter(
            c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
          )
          state.sessions[sessionIndex].metadata.updatedAt = new Date()
        }
      }),
      
      updateNodeInSession: (sessionId, nodeId, updates) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            Object.assign(state.sessions[sessionIndex].nodes[nodeIndex], updates)
            state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
            state.sessions[sessionIndex].metadata.updatedAt = new Date()
          }
        }
      }),
      
      // Connection actions (for command factory)
      addConnectionToSession: (sessionId, connection) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].connections.push(connection)
          state.sessions[sessionIndex].metadata.updatedAt = new Date()
        }
      }),
      
      removeConnectionFromSession: (sessionId, connectionId) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].connections = state.sessions[sessionIndex].connections.filter(c => c.id !== connectionId)
          state.sessions[sessionIndex].metadata.updatedAt = new Date()
        }
      }),
      
      // Export/Import actions
      exportSessionsToJSON: async (sessionIds, options) => {
        try {
          return await exportImportManager.exportSessionsToJSON(sessionIds, options)
        } catch (error) {
          console.error('Failed to export sessions:', error)
          set((state) => {
            state.errors.push({
              code: 'EXPORT_FAILED',
              message: `Failed to export sessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      exportSessionToMarkdown: async (sessionId) => {
        try {
          return await exportImportManager.exportSessionToMarkdown(sessionId)
        } catch (error) {
          console.error('Failed to export session to markdown:', error)
          set((state) => {
            state.errors.push({
              code: 'EXPORT_MARKDOWN_FAILED',
              message: `Failed to export session to markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      exportTemplatesToJSON: async (templateIds) => {
        try {
          return await exportImportManager.exportTemplatesToJSON(templateIds)
        } catch (error) {
          console.error('Failed to export templates:', error)
          set((state) => {
            state.errors.push({
              code: 'EXPORT_TEMPLATES_FAILED',
              message: `Failed to export templates: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      importFromJSON: async (jsonData, options) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Importing data...'
          })

          const result = await exportImportManager.importFromJSON(jsonData, options)
          
          // Reload sessions and templates after import
          await get().loadSessions()
          await get().loadTemplates()

          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            
            if (!result.success && result.errors) {
              result.errors.forEach(error => {
                state.errors.push({
                  code: 'IMPORT_ERROR',
                  message: error,
                  details: result,
                  timestamp: new Date()
                })
              })
            }
          })

          return result
        } catch (error) {
          console.error('Failed to import data:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'IMPORT_FAILED',
              message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      handleFileImport: async (file) => {
        try {
          set((state) => {
            state.isLoading = true
            state.loadingMessage = 'Processing file...'
          })

          const result = await exportImportManager.handleFileImport(file)
          
          // Reload sessions and templates after import
          await get().loadSessions()
          await get().loadTemplates()

          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            
            if (!result.success && result.errors) {
              result.errors.forEach(error => {
                state.errors.push({
                  code: 'FILE_IMPORT_ERROR',
                  message: error,
                  details: result,
                  timestamp: new Date()
                })
              })
            }
          })

          return result
        } catch (error) {
          console.error('Failed to import file:', error)
          set((state) => {
            state.isLoading = false
            state.loadingMessage = undefined
            state.errors.push({
              code: 'FILE_IMPORT_FAILED',
              message: `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              details: error,
              timestamp: new Date()
            })
          })
          throw error
        }
      },

      // Code snippet actions
      addCodeSnippetToNode: (sessionId, nodeId, codeSnippet) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            state.sessions[sessionIndex].nodes[nodeIndex].content.codeSnippets.push(codeSnippet)
            state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
            state.sessions[sessionIndex].metadata.updatedAt = new Date()
          }
        }
      }),

      updateCodeSnippetInNode: (sessionId, nodeId, snippetId, updates) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            const snippetIndex = state.sessions[sessionIndex].nodes[nodeIndex].content.codeSnippets.findIndex(s => s.id === snippetId)
            if (snippetIndex !== -1) {
              Object.assign(state.sessions[sessionIndex].nodes[nodeIndex].content.codeSnippets[snippetIndex], updates)
              state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
              state.sessions[sessionIndex].metadata.updatedAt = new Date()
            }
          }
        }
      }),

      removeCodeSnippetFromNode: (sessionId, nodeId, snippetId) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            state.sessions[sessionIndex].nodes[nodeIndex].content.codeSnippets = 
              state.sessions[sessionIndex].nodes[nodeIndex].content.codeSnippets.filter(s => s.id !== snippetId)
            state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
            state.sessions[sessionIndex].metadata.updatedAt = new Date()
          }
        }
      }),

      // Complexity estimation actions
      updateNodeComplexity: (sessionId, nodeId, complexity) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            state.sessions[sessionIndex].nodes[nodeIndex].complexity = complexity
            state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
            state.sessions[sessionIndex].metadata.updatedAt = new Date()
          }
        }
      }),

      updateNodeTimeEstimate: (sessionId, nodeId, timeEstimate) => set((state) => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId)
        if (sessionIndex !== -1) {
          const nodeIndex = state.sessions[sessionIndex].nodes.findIndex(n => n.id === nodeId)
          if (nodeIndex !== -1) {
            state.sessions[sessionIndex].nodes[nodeIndex].timeEstimate = timeEstimate
            state.sessions[sessionIndex].nodes[nodeIndex].metadata.updatedAt = new Date()
            state.sessions[sessionIndex].metadata.updatedAt = new Date()
          }
        }
      }),

      estimateSessionComplexity: async (sessionId) => {
        const state = get()
        const session = state.sessions.find(s => s.id === sessionId)
        if (!session) {
          throw new Error(`Session with id ${sessionId} not found`)
        }
        return complexityEstimationEngine.analyzeSessionComplexity(session)
      },

      generateComplexityHeatmap: (sessionId) => {
        const state = get()
        const session = state.sessions.find(s => s.id === sessionId)
        if (!session) {
          return []
        }
        return complexityEstimationEngine.generateComplexityHeatmap(session)
      },

      // Utility actions
      reset: () => set(() => ({ ...initialState })),
      
      exportData: () => {
        const state = get()
        return JSON.stringify({
          sessions: state.sessions,
          patterns: state.patterns,
          templates: state.sessionTemplates,
          preferences: state.userPreferences,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }, null, 2)
      },
      
      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set((state) => {
            if (parsed.sessions) state.sessions = parsed.sessions
            if (parsed.patterns) state.patterns = parsed.patterns
            if (parsed.templates) state.sessionTemplates = parsed.templates
            if (parsed.preferences) state.userPreferences = { ...state.userPreferences, ...parsed.preferences }
          })
          return true
        } catch (error) {
          console.error('Failed to import data:', error)
          return false
        }
      }
    })),
    {
      name: 'devkit-flow-storage',
      partialize: (state) => ({
        theme: state.theme,
        userPreferences: state.userPreferences,
        sessions: state.sessions,
        patterns: state.patterns,
        sessionTemplates: state.sessionTemplates,
        currentSessionId: state.currentSessionId,
        currentPatternId: state.currentPatternId,
        sidebarCollapsed: state.sidebarCollapsed,
        propertiesPanelOpen: state.propertiesPanelOpen
      })
    }
  )
)