import { useEffect, Suspense } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/app-shell'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { SkipLinks, AccessibilityAnnouncer } from '@/components/accessibility'
import { MobileWrapper } from '@/components/mobile'
import { ErrorBoundary, GlobalErrorHandler } from '@/components/error'
import { RecoveryModal, useRecoveryModal } from '@/components/error/recovery-modal'
import { errorRecovery } from '@/lib/error-recovery'
import { FullPageLoader } from '@/components/loading'
import { useTheme, useStorage, useAIConfig, useLoading, useSessions, useTemplates } from '@/hooks/use-app-store'
import { useSettings } from '@/hooks/use-settings'
import { useAccessibility } from '@/hooks/use-accessibility'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { systemIntegration } from '@/lib/system-integration'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function AppContent() {
  useTheme()
  const { updateStorageQuota } = useStorage()
  const { initializeAI } = useAIConfig()
  const { isLoading, loadingMessage } = useLoading()
  const { loadSessions } = useSessions()
  const { loadTemplates } = useTemplates()
  
  // Initialize recovery modal
  const recoveryModal = useRecoveryModal()
  
  // Initialize enhanced settings system
  useSettings()
  
  // Initialize accessibility features
  useAccessibility()
  useKeyboardNavigation()

  useEffect(() => {
    console.log('App: Initializing...')
    const initializeApp = async () => {
      try {
        console.log('App: Starting system integration...')
        // Initialize system integration (handles all subsystems)
        await systemIntegration.initialize()
        
        console.log('App: Updating storage quota...')
        // Update storage quota on app start
        await updateStorageQuota()
        
        console.log('App: Loading sessions and templates...')
        // Load sessions and templates
        await Promise.all([
          loadSessions(),
          loadTemplates()
        ])
        
        console.log('App: Initializing AI service...')
        // Initialize AI service (non-blocking)
        initializeAI().catch(console.warn)
        
        console.log('App: Initialization complete!')
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [updateStorageQuota, initializeAI, loadSessions, loadTemplates])

  useEffect(() => {
    // Debug theme and CSS variables
    console.log('App: Current theme classes:', document.documentElement.classList.toString())
    console.log('App: CSS variables check:')
    console.log('  --background:', getComputedStyle(document.documentElement).getPropertyValue('--background'))
    console.log('  --foreground:', getComputedStyle(document.documentElement).getPropertyValue('--foreground'))
    console.log('  --primary:', getComputedStyle(document.documentElement).getPropertyValue('--primary'))
  }, [])

  return (
    <>
      <div className="app-container">
        <SkipLinks />
        <AppShell />
        <OnboardingModal />
        <AccessibilityAnnouncer />
        <Toaster />
        <GlobalErrorHandler />
        <RecoveryModal {...recoveryModal} />
      </div>
      {isLoading && <FullPageLoader message={loadingMessage} />}
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="devkit-flow-theme">
        <Router>
          <MobileWrapper>
            <Suspense fallback={<FullPageLoader message="Loading DevKit Flow..." />}>
              <AppContent />
            </Suspense>
          </MobileWrapper>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
