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
    const initializeApp = async () => {
      try {
        // Initialize system integration (handles all subsystems)
        await systemIntegration.initialize()
        
        // Update storage quota on app start
        await updateStorageQuota()
        
        // Load sessions and templates
        await Promise.all([
          loadSessions(),
          loadTemplates()
        ])
        
        // Initialize AI service (non-blocking)
        initializeAI().catch(console.warn)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [updateStorageQuota, initializeAI, loadSessions, loadTemplates])

  return (
    <>
      <div className="min-h-screen bg-background font-sans antialiased">
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
