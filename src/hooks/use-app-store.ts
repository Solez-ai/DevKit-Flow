/**
 * Custom hooks for app store usage
 */

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'

/**
 * Hook for theme management with automatic initialization
 */
export function useTheme() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const initializeTheme = useAppStore((state) => state.initializeTheme)
  const setupThemeListener = useAppStore((state) => state.setupThemeListener)
  const cleanupThemeListener = useAppStore((state) => state.cleanupThemeListener)
  
  useEffect(() => {
    // Initialize theme on mount
    initializeTheme()
    setupThemeListener()
    
    // Cleanup on unmount
    return () => {
      cleanupThemeListener()
    }
  }, [initializeTheme, setupThemeListener, cleanupThemeListener])
  
  return {
    theme,
    setTheme
  }
}

/**
 * Hook for workspace management
 */
export function useWorkspace() {
  const currentWorkspace = useAppStore((state) => state.currentWorkspace)
  const setCurrentWorkspace = useAppStore((state) => state.setCurrentWorkspace)
  
  return {
    currentWorkspace,
    setCurrentWorkspace
  }
}

/**
 * Hook for user preferences
 */
export function useUserPreferences() {
  const userPreferences = useAppStore((state) => state.userPreferences)
  const updateUserPreferences = useAppStore((state) => state.updateUserPreferences)
  
  return {
    userPreferences,
    updateUserPreferences
  }
}

/**
 * Hook for session management
 */
export function useSessions() {
  const sessions = useAppStore((state) => state.sessions)
  const currentSessionId = useAppStore((state) => state.currentSessionId)
  const addSession = useAppStore((state) => state.addSession)
  const updateSession = useAppStore((state) => state.updateSession)
  const deleteSession = useAppStore((state) => state.deleteSession)
  const setCurrentSession = useAppStore((state) => state.setCurrentSession)
  const duplicateSession = useAppStore((state) => state.duplicateSession)
  const loadSessions = useAppStore((state) => state.loadSessions)
  
  const currentSession = sessions.find(s => s.id === currentSessionId) || null
  
  return {
    sessions,
    currentSession,
    currentSessionId,
    addSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    duplicateSession,
    loadSessions
  }
}

/**
 * Hook for pattern management
 */
export function usePatterns() {
  const patterns = useAppStore((state) => state.patterns)
  const currentPatternId = useAppStore((state) => state.currentPatternId)
  const addPattern = useAppStore((state) => state.addPattern)
  const updatePattern = useAppStore((state) => state.updatePattern)
  const deletePattern = useAppStore((state) => state.deletePattern)
  const setCurrentPattern = useAppStore((state) => state.setCurrentPattern)
  
  const currentPattern = patterns.find(p => p.id === currentPatternId) || null
  
  return {
    patterns,
    currentPattern,
    currentPatternId,
    addPattern,
    updatePattern,
    deletePattern,
    setCurrentPattern
  }
}

/**
 * Hook for UI state management
 */
export function useUIState() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const propertiesPanelOpen = useAppStore((state) => state.propertiesPanelOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const togglePropertiesPanel = useAppStore((state) => state.togglePropertiesPanel)
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed)
  const setPropertiesPanelOpen = useAppStore((state) => state.setPropertiesPanelOpen)
  
  return {
    sidebarCollapsed,
    propertiesPanelOpen,
    toggleSidebar,
    togglePropertiesPanel,
    setSidebarCollapsed,
    setPropertiesPanelOpen
  }
}

/**
 * Hook for error management
 */
export function useErrors() {
  const errors = useAppStore((state) => state.errors)
  const addError = useAppStore((state) => state.addError)
  const removeError = useAppStore((state) => state.removeError)
  const clearErrors = useAppStore((state) => state.clearErrors)
  
  return {
    errors,
    addError,
    removeError,
    clearErrors
  }
}

/**
 * Hook for loading state management
 */
export function useLoading() {
  const isLoading = useAppStore((state) => state.isLoading)
  const loadingMessage = useAppStore((state) => state.loadingMessage)
  const setLoading = useAppStore((state) => state.setLoading)
  
  return {
    isLoading,
    loadingMessage,
    setLoading
  }
}

/**
 * Hook for storage management
 */
export function useStorage() {
  const storageQuota = useAppStore((state) => state.storageQuota)
  const updateStorageQuota = useAppStore((state) => state.updateStorageQuota)
  const exportData = useAppStore((state) => state.exportData)
  const importData = useAppStore((state) => state.importData)
  
  useEffect(() => {
    // Update storage quota on mount and periodically
    updateStorageQuota()
    
    const interval = setInterval(updateStorageQuota, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [updateStorageQuota])
  
  return {
    storageQuota,
    updateStorageQuota,
    exportData,
    importData
  }
}

/**
 * Hook for template management
 */
export function useTemplates() {
  const sessionTemplates = useAppStore((state) => state.sessionTemplates)
  const addTemplate = useAppStore((state) => state.addTemplate)
  const updateTemplate = useAppStore((state) => state.updateTemplate)
  const deleteTemplate = useAppStore((state) => state.deleteTemplate)
  const loadTemplates = useAppStore((state) => state.loadTemplates)
  
  return {
    sessionTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplates
  }
}

/**
 * Hook for AI configuration management
 */
export function useAIConfig() {
  const aiConfig = useAppStore((state) => state.aiConfig)
  const updateAIConfig = useAppStore((state) => state.updateAIConfig)
  const initializeAI = useAppStore((state) => state.initializeAI)
  
  return {
    aiConfig,
    updateAIConfig,
    initializeAI
  }
}

/**
 * Hook for node management
 */
export function useNodes() {
  const addNodeToSession = useAppStore((state) => state.addNodeToSession)
  const removeNodeFromSession = useAppStore((state) => state.removeNodeFromSession)
  const updateNodeInSession = useAppStore((state) => state.updateNodeInSession)
  const addCodeSnippetToNode = useAppStore((state) => state.addCodeSnippetToNode)
  const updateCodeSnippetInNode = useAppStore((state) => state.updateCodeSnippetInNode)
  const removeCodeSnippetFromNode = useAppStore((state) => state.removeCodeSnippetFromNode)
  
  return {
    addNodeToSession,
    removeNodeFromSession,
    updateNodeInSession,
    addCodeSnippetToNode,
    updateCodeSnippetInNode,
    removeCodeSnippetFromNode
  }
}