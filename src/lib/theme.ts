/**
 * Theme detection and management utilities
 */

export type ThemeType = 'light' | 'dark' | 'system'

/**
 * Detects the system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves the actual theme to apply based on user preference
 */
export function resolveTheme(themePreference: ThemeType): 'light' | 'dark' {
  if (themePreference === 'system') {
    return getSystemTheme()
  }
  return themePreference
}

/**
 * Applies theme to the document
 */
export function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Sets up system theme change listener
 */
export function setupThemeListener(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window === 'undefined') return () => {}
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
}

/**
 * Initialize theme on app startup
 */
export function initializeTheme(themePreference: ThemeType) {
  const resolvedTheme = resolveTheme(themePreference)
  applyTheme(resolvedTheme)
  return resolvedTheme
}