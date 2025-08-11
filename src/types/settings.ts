// Settings and customization types for Task 15

export interface UserSettings {
  // AI and Enhanced Features
  enhancedFeatures: boolean
  aiEnabled: boolean
  mcpApiKey?: string
  
  // UI Preferences
  theme: 'light' | 'dark' | 'system'
  autoSave: boolean
  exportFormatDefault: 'markdown' | 'json' | 'pdf'
  gridSnapping: boolean
  showLineNumbers: boolean
  devToolsVisible: boolean
  
  // Workspace Preferences
  defaultWorkspace: 'studio' | 'regexr'
  canvasZoomLevel: number
  sidebarWidth: number
  
  // Privacy and Data
  dataRetentionDays: number
  analyticsEnabled: boolean
  feedbackSubmitted: boolean
  
  // Accessibility
  accessibility?: {
    highContrast?: boolean
    reducedMotion?: boolean
    largeText?: boolean
    screenReaderOptimized?: boolean
    keyboardNavigation?: boolean
    focusIndicators?: boolean
  }
}

export interface OnboardingState {
  isFirstLaunch: boolean
  currentStep: number
  totalSteps: number
  aiFeatureChoice?: 'enabled' | 'disabled' | 'undecided'
  completedSteps: string[]
  skippedSteps: string[]
}

export interface LocalStorageSchema {
  df_user_settings: UserSettings
  df_workspace_state: WorkspaceState
  df_regex_library: RegexLibrary
  df_recent_files: RecentFile[]
  df_mcp_token?: string
  df_theme_override?: string
  df_feedback_submitted: boolean
  df_onboarding_state: OnboardingState
}

export interface WorkspaceState {
  currentSession?: any // DevFlowSession
  openTabs: WorkspaceTab[]
  canvasState: any // CanvasState
  lastSaved: Date
  version: string
}

export interface RegexLibrary {
  patterns: SavedRegexPattern[]
  categories: PatternCategory[]
  favorites: string[]
  recentlyUsed: string[]
}

export interface SavedRegexPattern {
  id: string
  name: string
  pattern: string
  description: string
  tags: string[]
  createdAt: Date
  lastUsed: Date
}

export interface PatternCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

export interface RecentFile {
  id: string
  name: string
  type: 'session' | 'pattern' | 'template'
  lastModified: Date
  thumbnail?: string
  path?: string
}

export interface WorkspaceTab {
  id: string
  title: string
  type: 'session' | 'pattern' | 'settings'
  isDirty: boolean
  lastAccessed: Date
}

export interface SettingsPanel {
  activeCategory: 'general' | 'ai' | 'appearance' | 'behavior' | 'accessibility' | 'data' | 'advanced'
  categories: SettingsCategory[]
  searchQuery?: string
  hasUnsavedChanges: boolean
}

export interface SettingsCategory {
  id: string
  name: string
  icon: string
  settings: SettingItem[]
  description?: string
}

export interface SettingItem {
  key: string
  label: string
  description: string
  type: 'boolean' | 'string' | 'number' | 'select' | 'color' | 'keyBinding'
  value: any
  options?: SettingOption[]
  validation?: ValidationRule
  requiresRestart?: boolean
}

export interface SettingOption {
  value: any
  label: string
  description?: string
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  custom?: (value: any) => boolean | string
}

// AI Model Selection types
export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  logo?: string
  isAvailable: boolean
  requiresApiKey: boolean
  features: string[]
  pricing: 'free' | 'premium' | 'usage-based'
}

export interface AIModelConfig {
  selectedModel: string
  customApiKey?: string
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    burstAllowance: number
    priorityQueue: boolean
  }
  usageStats: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    lastUsed: Date
  }
}

// Rate Limiting types
export interface RateLimitSettings {
  enabled: boolean
  requestsPerMinute: number
  burstAllowance: number
  priorityQueue: boolean
  cooldownPeriod: number
}

export interface UsageStatistics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  requestsToday: number
  requestsThisWeek: number
  requestsThisMonth: number
  lastReset: Date
}

// Theme System types
export interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: ColorScheme
  fonts: FontConfiguration
  spacing: SpacingConfiguration
  isCustom: boolean
  author?: string
  createdAt: Date
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveForeground: string
  warning: string
  warningForeground: string
  success: string
  successForeground: string
}

export interface FontConfiguration {
  sans: string[]
  mono: string[]
  heading: string[]
  body: string[]
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
}

export interface SpacingConfiguration {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

// Keyboard Shortcuts types
export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  category: string
  defaultKeys: string[]
  currentKeys: string[]
  context: 'global' | 'studio' | 'regexr' | 'settings'
  action: string
  isCustom: boolean
}

export interface ShortcutConflict {
  shortcut: KeyboardShortcut
  conflictsWith: KeyboardShortcut[]
  severity: 'warning' | 'error'
  suggestion?: string
}

export interface ShortcutPreset {
  id: string
  name: string
  description: string
  shortcuts: Record<string, string[]>
  isBuiltIn: boolean
}

// Data Management types
export interface DataManagementInfo {
  totalSize: number
  breakdown: {
    sessions: number
    patterns: number
    templates: number
    settings: number
    cache: number
  }
  lastBackup?: Date
  autoBackupEnabled: boolean
  retentionPolicy: {
    sessions: number // days
    patterns: number // days
    analytics: number // days
  }
}

export interface BackupOptions {
  includeSessions: boolean
  includePatterns: boolean
  includeTemplates: boolean
  includeSettings: boolean
  format: 'json' | 'zip'
  encryption: boolean
}

export interface ImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'skip'
  validateData: boolean
  createBackup: boolean
}