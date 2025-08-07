import { useEffect, useState, useCallback } from 'react'
import { useSettings } from './use-settings'

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
}

interface AccessibilityAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  timeout?: number
}

export function useAccessibility() {
  const { settings, updateSettings } = useSettings()
  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([])
  
  // Default accessibility settings
  const defaultAccessibilitySettings: AccessibilitySettings = {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusIndicators: true
  }

  const accessibilitySettings = {
    ...defaultAccessibilitySettings,
    ...settings.accessibility
  }

  // Detect user preferences from system
  const detectSystemPreferences = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    const prefersLargeText = window.matchMedia('(min-resolution: 2dppx)').matches

    if (prefersReducedMotion || prefersHighContrast || prefersLargeText) {
      updateSettings({
        accessibility: {
          ...accessibilitySettings,
          reducedMotion: prefersReducedMotion,
          highContrast: prefersHighContrast,
          largeText: prefersLargeText
        }
      })
    }
  }, [accessibilitySettings, updateSettings])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement

    // High contrast mode
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Large text
    if (accessibilitySettings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Screen reader optimization
    if (accessibilitySettings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized')
    } else {
      root.classList.remove('screen-reader-optimized')
    }

    // Enhanced focus indicators
    if (accessibilitySettings.focusIndicators) {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }
  }, [accessibilitySettings])

  // Announce messages to screen readers
  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
    timeout: number = 3000
  ) => {
    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      timeout
    }

    setAnnouncements(prev => [...prev, announcement])

    // Remove announcement after timeout
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== announcement))
    }, timeout)
  }, [])

  // Update accessibility setting
  const updateAccessibilitySetting = useCallback((
    key: keyof AccessibilitySettings,
    value: boolean
  ) => {
    updateSettings({
      accessibility: {
        ...accessibilitySettings,
        [key]: value
      }
    })
  }, [accessibilitySettings, updateSettings])

  // Toggle accessibility features
  const toggleHighContrast = useCallback(() => {
    updateAccessibilitySetting('highContrast', !accessibilitySettings.highContrast)
    announce(
      `High contrast mode ${!accessibilitySettings.highContrast ? 'enabled' : 'disabled'}`,
      'assertive'
    )
  }, [accessibilitySettings.highContrast, updateAccessibilitySetting, announce])

  const toggleReducedMotion = useCallback(() => {
    updateAccessibilitySetting('reducedMotion', !accessibilitySettings.reducedMotion)
    announce(
      `Reduced motion ${!accessibilitySettings.reducedMotion ? 'enabled' : 'disabled'}`,
      'assertive'
    )
  }, [accessibilitySettings.reducedMotion, updateAccessibilitySetting, announce])

  const toggleLargeText = useCallback(() => {
    updateAccessibilitySetting('largeText', !accessibilitySettings.largeText)
    announce(
      `Large text ${!accessibilitySettings.largeText ? 'enabled' : 'disabled'}`,
      'assertive'
    )
  }, [accessibilitySettings.largeText, updateAccessibilitySetting, announce])

  const toggleScreenReaderOptimization = useCallback(() => {
    updateAccessibilitySetting('screenReaderOptimized', !accessibilitySettings.screenReaderOptimized)
    announce(
      `Screen reader optimization ${!accessibilitySettings.screenReaderOptimized ? 'enabled' : 'disabled'}`,
      'assertive'
    )
  }, [accessibilitySettings.screenReaderOptimized, updateAccessibilitySetting, announce])

  // Initialize system preference detection
  useEffect(() => {
    detectSystemPreferences()

    // Listen for system preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ]

    const handleChange = () => detectSystemPreferences()

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleChange)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleChange)
      })
    }
  }, [detectSystemPreferences])

  return {
    settings: accessibilitySettings,
    announcements,
    announce,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    toggleScreenReaderOptimization,
    updateAccessibilitySetting
  }
}