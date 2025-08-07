import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  UserSettings, 
  SettingsPanel, 
  SettingsCategory, 
  AIModelConfig,
  ThemeConfig,
  KeyboardShortcut,
  DataManagementInfo,
  OnboardingState
} from '../types/settings'

interface SettingsStore {
  // Settings state
  settings: UserSettings
  panel: SettingsPanel
  aiConfig: AIModelConfig
  themes: ThemeConfig[]
  shortcuts: KeyboardShortcut[]
  dataInfo: DataManagementInfo
  onboarding: OnboardingState
  
  // Actions
  updateSetting: (key: keyof UserSettings, value: any) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (data: string) => boolean
  
  // Panel actions
  setActiveCategory: (category: SettingsPanel['activeCategory']) => void
  setSearchQuery: (query: string) => void
  markUnsavedChanges: (hasChanges: boolean) => void
  
  // AI configuration
  updateAIConfig: (config: Partial<AIModelConfig>) => void
  
  // Theme management
  addCustomTheme: (theme: ThemeConfig) => void
  removeCustomTheme: (themeId: string) => void
  applyTheme: (themeId: string) => void
  
  // Keyboard shortcuts
  updateShortcut: (shortcutId: string, keys: string[]) => void
  resetShortcuts: () => void
  
  // Data management
  updateDataInfo: () => Promise<void>
  clearData: (types: string[]) => Promise<void>
  
  // Onboarding
  updateOnboarding: (state: Partial<OnboardingState>) => void
  completeOnboarding: () => void
}

const defaultSettings: UserSettings = {
  // AI and Enhanced Features
  enhancedFeatures: true,
  aiEnabled: false,
  mcpApiKey: undefined,
  
  // UI Preferences
  theme: 'system',
  autoSave: true,
  exportFormatDefault: 'json',
  gridSnapping: true,
  showLineNumbers: true,
  devToolsVisible: false,
  
  // Workspace Preferences
  defaultWorkspace: 'studio',
  canvasZoomLevel: 1,
  sidebarWidth: 320,
  
  // Privacy and Data
  dataRetentionDays: 30,
  analyticsEnabled: true,
  feedbackSubmitted: false
}

const defaultAIConfig: AIModelConfig = {
  selectedModel: 'kimi-k2-free',
  customApiKey: undefined,
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 10,
    burstAllowance: 5,
    priorityQueue: false
  },
  usageStats: {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastUsed: new Date()
  }
}

const defaultOnboarding: OnboardingState = {
  isFirstLaunch: true,
  currentStep: 0,
  totalSteps: 5,
  aiFeatureChoice: 'undecided',
  completedSteps: [],
  skippedSteps: []
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'general',
    name: 'General',
    icon: 'Settings',
    description: 'Basic application preferences',
    settings: [
      {
        key: 'defaultWorkspace',
        label: 'Default Workspace',
        description: 'Which workspace to open by default',
        type: 'select',
        value: 'studio',
        options: [
          { value: 'studio', label: 'DevFlow Studio' },
          { value: 'regexr', label: 'Regexr++' }
        ]
      },
      {
        key: 'autoSave',
        label: 'Auto Save',
        description: 'Automatically save changes',
        type: 'boolean',
        value: true
      },
      {
        key: 'exportFormatDefault',
        label: 'Default Export Format',
        description: 'Default format for exports',
        type: 'select',
        value: 'json',
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'markdown', label: 'Markdown' },
          { value: 'pdf', label: 'PDF' }
        ]
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    icon: 'Bot',
    description: 'AI features and model configuration',
    settings: [
      {
        key: 'aiEnabled',
        label: 'Enable AI Features',
        description: 'Enable AI-powered assistance',
        type: 'boolean',
        value: false
      },
      {
        key: 'enhancedFeatures',
        label: 'Enhanced Features',
        description: 'Enable advanced AI-powered features',
        type: 'boolean',
        value: true
      }
    ]
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: 'Palette',
    description: 'Theme and visual preferences',
    settings: [
      {
        key: 'theme',
        label: 'Theme',
        description: 'Application color theme',
        type: 'select',
        value: 'system',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]
      },
      {
        key: 'showLineNumbers',
        label: 'Show Line Numbers',
        description: 'Display line numbers in code editors',
        type: 'boolean',
        value: true
      }
    ]
  },
  {
    id: 'behavior',
    name: 'Behavior',
    icon: 'Zap',
    description: 'Application behavior settings',
    settings: [
      {
        key: 'gridSnapping',
        label: 'Grid Snapping',
        description: 'Snap nodes to grid in canvas',
        type: 'boolean',
        value: true
      },
      {
        key: 'devToolsVisible',
        label: 'Developer Tools',
        description: 'Show developer tools and debug info',
        type: 'boolean',
        value: false
      }
    ]
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: 'Eye',
    description: 'Accessibility and mobile support settings',
    settings: [
      {
        key: 'highContrast',
        label: 'High Contrast Mode',
        description: 'Increases contrast for better visibility',
        type: 'boolean',
        value: false
      },
      {
        key: 'reducedMotion',
        label: 'Reduced Motion',
        description: 'Minimizes animations and transitions',
        type: 'boolean',
        value: false
      },
      {
        key: 'largeText',
        label: 'Large Text',
        description: 'Increases text size for better readability',
        type: 'boolean',
        value: false
      },
      {
        key: 'screenReaderOptimized',
        label: 'Screen Reader Optimization',
        description: 'Optimizes interface for screen readers',
        type: 'boolean',
        value: false
      },
      {
        key: 'keyboardNavigation',
        label: 'Enhanced Keyboard Navigation',
        description: 'Enables comprehensive keyboard shortcuts',
        type: 'boolean',
        value: true
      },
      {
        key: 'focusIndicators',
        label: 'Enhanced Focus Indicators',
        description: 'Shows clear focus indicators for keyboard navigation',
        type: 'boolean',
        value: true
      }
    ]
  },
  {
    id: 'data',
    name: 'Data & Privacy',
    icon: 'Database',
    description: 'Data management and privacy settings',
    settings: [
      {
        key: 'analyticsEnabled',
        label: 'Analytics',
        description: 'Enable usage analytics',
        type: 'boolean',
        value: true
      },
      {
        key: 'dataRetentionDays',
        label: 'Data Retention (days)',
        description: 'How long to keep data',
        type: 'number',
        value: 30,
        validation: { min: 1, max: 365 }
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: 'Cog',
    description: 'Advanced configuration options',
    settings: []
  }
]

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      panel: {
        activeCategory: 'general',
        categories: settingsCategories,
        searchQuery: '',
        hasUnsavedChanges: false
      },
      aiConfig: defaultAIConfig,
      themes: [], // Will be populated with built-in themes
      shortcuts: [], // Will be populated with default shortcuts
      dataInfo: {
        totalSize: 0,
        breakdown: {
          sessions: 0,
          patterns: 0,
          templates: 0,
          settings: 0,
          cache: 0
        },
        autoBackupEnabled: false,
        retentionPolicy: {
          sessions: 30,
          patterns: 90,
          analytics: 7
        }
      },
      onboarding: defaultOnboarding,

      // Settings actions
      updateSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
          panel: { ...state.panel, hasUnsavedChanges: true }
        }))
        
        // Apply setting immediately if needed
        const { settings } = get()
        if (key === 'theme') {
          document.documentElement.setAttribute('data-theme', value)
        }
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          panel: { ...get().panel, hasUnsavedChanges: false }
        })
      },

      exportSettings: () => {
        const { settings, aiConfig, shortcuts } = get()
        return JSON.stringify({
          settings,
          aiConfig,
          shortcuts: shortcuts.filter(s => s.isCustom),
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }, null, 2)
      },

      importSettings: (data) => {
        try {
          const imported = JSON.parse(data)
          if (imported.settings) {
            set((state) => ({
              settings: { ...defaultSettings, ...imported.settings },
              aiConfig: imported.aiConfig || state.aiConfig,
              panel: { ...state.panel, hasUnsavedChanges: true }
            }))
            return true
          }
          return false
        } catch {
          return false
        }
      },

      // Panel actions
      setActiveCategory: (category) => {
        set((state) => ({
          panel: { ...state.panel, activeCategory: category }
        }))
      },

      setSearchQuery: (query) => {
        set((state) => ({
          panel: { ...state.panel, searchQuery: query }
        }))
      },

      markUnsavedChanges: (hasChanges) => {
        set((state) => ({
          panel: { ...state.panel, hasUnsavedChanges: hasChanges }
        }))
      },

      // AI configuration
      updateAIConfig: (config) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...config },
          panel: { ...state.panel, hasUnsavedChanges: true }
        }))
      },

      // Theme management
      addCustomTheme: (theme) => {
        set((state) => ({
          themes: [...state.themes, theme]
        }))
      },

      removeCustomTheme: (themeId) => {
        set((state) => ({
          themes: state.themes.filter(t => t.id !== themeId)
        }))
      },

      applyTheme: (themeId) => {
        const theme = get().themes.find(t => t.id === themeId)
        if (theme) {
          // Apply theme CSS variables
          const root = document.documentElement
          Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value)
          })
        }
      },

      // Keyboard shortcuts
      updateShortcut: (shortcutId, keys) => {
        set((state) => ({
          shortcuts: state.shortcuts.map(s => 
            s.id === shortcutId 
              ? { ...s, currentKeys: keys, isCustom: true }
              : s
          )
        }))
      },

      resetShortcuts: () => {
        set((state) => ({
          shortcuts: state.shortcuts.map(s => ({
            ...s,
            currentKeys: s.defaultKeys,
            isCustom: false
          }))
        }))
      },

      // Data management
      updateDataInfo: async () => {
        // Calculate storage usage
        let totalSize = 0
        const breakdown = {
          sessions: 0,
          patterns: 0,
          templates: 0,
          settings: 0,
          cache: 0
        }

        // Estimate localStorage usage
        for (const key in localStorage) {
          if (key.startsWith('df_')) {
            const size = localStorage[key].length
            totalSize += size
            
            if (key.includes('session')) breakdown.sessions += size
            else if (key.includes('pattern')) breakdown.patterns += size
            else if (key.includes('template')) breakdown.templates += size
            else if (key.includes('settings')) breakdown.settings += size
            else breakdown.cache += size
          }
        }

        set((state) => ({
          dataInfo: {
            ...state.dataInfo,
            totalSize,
            breakdown
          }
        }))
      },

      clearData: async (types) => {
        types.forEach(type => {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('df_') && key.includes(type)) {
              localStorage.removeItem(key)
            }
          })
        })
        
        await get().updateDataInfo()
      },

      // Onboarding
      updateOnboarding: (state) => {
        set((current) => ({
          onboarding: { ...current.onboarding, ...state }
        }))
      },

      completeOnboarding: () => {
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            isFirstLaunch: false,
            currentStep: state.onboarding.totalSteps
          }
        }))
      }
    }),
    {
      name: 'devkit-flow-settings',
      partialize: (state) => ({
        settings: state.settings,
        aiConfig: state.aiConfig,
        shortcuts: state.shortcuts.filter(s => s.isCustom),
        onboarding: state.onboarding
      })
    }
  )
)