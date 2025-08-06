import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/app-shell'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { useTheme, useStorage, useAIConfig } from '@/hooks/use-app-store'
import { useSettings } from '@/hooks/use-settings'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  useTheme() // theme not used
  const { updateStorageQuota } = useStorage()
  const { initializeAI } = useAIConfig()
  
  // Initialize enhanced settings system
  useSettings()

  useEffect(() => {
    // Update storage quota on app start
    updateStorageQuota()
    
    // Initialize AI service
    initializeAI()
  }, [updateStorageQuota, initializeAI])

  return (
    <ThemeProvider defaultTheme="system" storageKey="devkit-flow-theme">
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <AppShell />
          <OnboardingModal />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
