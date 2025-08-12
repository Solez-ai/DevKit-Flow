import { createContext, useContext, useEffect, useState } from "react"
import { useTheme as useAppTheme } from "@/hooks/use-app-store"
import type { ThemeType } from "@/types"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "devkit-flow-theme",
  ...props
}: ThemeProviderProps) {
  const { theme: storeTheme, setTheme: setStoreTheme } = useAppTheme()
  const [theme, setTheme] = useState<Theme>(
    () => (storeTheme as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    console.log('ThemeProvider: Setting theme to', theme)

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      
      console.log('ThemeProvider: System theme detected as', systemTheme)
      root.classList.add(systemTheme)
      
      // Also set the theme in the store
      setStoreTheme(systemTheme as ThemeType)
      return
    }

    console.log('ThemeProvider: Adding theme class', theme)
    root.classList.add(theme)
    
    // Also set the theme in the store
    setStoreTheme(theme as ThemeType)
  }, [theme, setStoreTheme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      console.log('ThemeProvider: setTheme called with', theme)
      setTheme(theme)
      setStoreTheme(theme as ThemeType)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}