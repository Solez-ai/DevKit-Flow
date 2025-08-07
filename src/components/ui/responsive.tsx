import type { ReactNode } from 'react'
import { useMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface ResponsiveProps {
  children: ReactNode
  mobile?: ReactNode
  tablet?: ReactNode
  desktop?: ReactNode
  className?: string
}

export function Responsive({ children, mobile, tablet, desktop, className }: ResponsiveProps) {
  const { isMobile, isTablet, isDesktop } = useMobile()

  if (isMobile && mobile) return <div className={className}>{mobile}</div>
  if (isTablet && tablet) return <div className={className}>{tablet}</div>
  if (isDesktop && desktop) return <div className={className}>{desktop}</div>

  return <div className={className}>{children}</div>
}

interface ShowOnProps {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
  className?: string
}

export function ShowOn({ children, mobile, tablet, desktop, className }: ShowOnProps) {
  const { isMobile, isTablet, isDesktop } = useMobile()

  const shouldShow = (
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktop)
  )

  if (!shouldShow) return null

  return <div className={className}>{children}</div>
}

interface HideOnProps {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
  className?: string
}

export function HideOn({ children, mobile, tablet, desktop, className }: HideOnProps) {
  const { isMobile, isTablet, isDesktop } = useMobile()

  const shouldHide = (
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktop)
  )

  if (shouldHide) return null

  return <div className={className}>{children}</div>
}

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  className?: string
}

export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  className 
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useMobile()

  const currentCols = isMobile ? cols.mobile : isTablet ? cols.tablet : cols.desktop
  const currentGap = isMobile ? gap.mobile : isTablet ? gap.tablet : gap.desktop

  return (
    <div 
      className={cn(
        'grid',
        `grid-cols-${currentCols}`,
        `gap-${currentGap}`,
        className
      )}
    >
      {children}
    </div>
  )
}

interface TouchTargetProps {
  children: ReactNode
  className?: string
}

export function TouchTarget({ children, className }: TouchTargetProps) {
  const { touchSupported } = useMobile()

  return (
    <div 
      className={cn(
        touchSupported && 'min-h-[44px] min-w-[44px] flex items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  )
}