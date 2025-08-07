import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { useUIState } from '@/hooks/use-app-store'
import { cn } from '@/lib/utils'

interface MobileWrapperProps {
  children: ReactNode
  className?: string
}

export function MobileWrapper({ children, className }: MobileWrapperProps) {
  const { isMobile, isTablet, touchSupported, addTouchListeners } = useMobile()
  const { sidebarCollapsed, toggleSidebar } = useUIState()

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      toggleSidebar()
    }
  }, [isMobile, sidebarCollapsed, toggleSidebar])

  // Add touch gesture support for mobile navigation
  useEffect(() => {
    if (!touchSupported) return

    const element = document.body
    
    const cleanup = addTouchListeners(element, {
      onSwipeRight: () => {
        if (isMobile && sidebarCollapsed) {
          toggleSidebar()
        }
      },
      onSwipeLeft: () => {
        if (isMobile && !sidebarCollapsed) {
          toggleSidebar()
        }
      }
    })

    return cleanup
  }, [touchSupported, isMobile, sidebarCollapsed, toggleSidebar, addTouchListeners])

  return (
    <div 
      className={cn(
        'mobile-wrapper',
        {
          'mobile-layout': isMobile,
          'tablet-layout': isTablet,
          'touch-enabled': touchSupported
        },
        className
      )}
    >
      {children}
    </div>
  )
}