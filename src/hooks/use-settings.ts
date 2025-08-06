import { useEffect } from 'react'
import { useSettingsStore } from '../store/settings-store'

/**
 * Hook to integrate settings with the application
 * Handles theme application and other settings side effects
 */
export const useSettings = () => {
  const { settings, updateSetting } = useSettingsStore()

  // Apply theme changes to the document
  useEffect(() => {
    const root = document.documentElement
    
    // Apply theme
    root.setAttribute('data-theme', settings.theme)
    
    // Apply other CSS custom properties based on settings
    if (settings.gridSnapping) {
      root.style.setProperty('--grid-snap', '1')
    } else {
      root.style.setProperty('--grid-snap', '0')
    }
    
    // Apply canvas zoom level
    root.style.setProperty('--canvas-zoom', settings.canvasZoomLevel.toString())
    
    // Apply sidebar width
    root.style.setProperty('--sidebar-width', `${settings.sidebarWidth}px`)
    
  }, [settings])

  return {
    settings,
    updateSetting
  }
}

/**
 * Hook specifically for theme management
 */
export const useThemeSettings = () => {
  const { settings, updateSetting } = useSettingsStore()
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', theme)
  }
  
  const getEffectiveTheme = () => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.theme
  }
  
  return {
    theme: settings.theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme
  }
}

/**
 * Hook for AI settings management
 */
export const useAISettings = () => {
  const { settings, aiConfig, updateSetting, updateAIConfig } = useSettingsStore()
  
  return {
    aiEnabled: settings.aiEnabled,
    enhancedFeatures: settings.enhancedFeatures,
    aiConfig,
    enableAI: (enabled: boolean) => updateSetting('aiEnabled', enabled),
    enableEnhancedFeatures: (enabled: boolean) => updateSetting('enhancedFeatures', enabled),
    updateAIConfig
  }
}