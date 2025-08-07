import { Header } from './header'
import { Sidebar } from './sidebar'
import { MainContent } from './main-content'
import { useUIState } from '@/hooks/use-app-store'
import { useMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function AppShell() {
  const { sidebarCollapsed } = useUIState()
  const { isMobile, isTablet } = useMobile()

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className={cn(
          "flex-1 transition-all duration-300",
          // Mobile: full width, no margin
          isMobile ? "ml-0" : 
          // Tablet: smaller sidebar
          isTablet ? (sidebarCollapsed ? "ml-16" : "ml-48") :
          // Desktop: full sidebar
          (sidebarCollapsed ? "ml-16" : "ml-64")
        )}>
          <MainContent />
        </div>
      </div>
    </div>
  )
}