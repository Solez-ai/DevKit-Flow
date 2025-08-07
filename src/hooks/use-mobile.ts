import { useState, useEffect, useCallback } from 'react'

interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  touchSupported: boolean
}

interface ViewportDimensions {
  width: number
  height: number
}

export function useMobile() {
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    screenSize: 'lg',
    touchSupported: false
  })

  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  // Breakpoints (matching Tailwind CSS)
  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  // Determine screen size based on width
  const getScreenSize = useCallback((width: number): MobileState['screenSize'] => {
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  }, [])

  // Update mobile state based on viewport
  const updateMobileState = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const screenSize = getScreenSize(width)
    
    // Detect device type
    const isMobile = width < breakpoints.md
    const isTablet = width >= breakpoints.md && width < breakpoints.lg
    const isDesktop = width >= breakpoints.lg
    
    // Detect orientation
    const orientation: 'portrait' | 'landscape' = height > width ? 'portrait' : 'landscape'
    
    // Detect touch support
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    setMobileState({
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      screenSize,
      touchSupported
    })

    setViewport({ width, height })
  }, [getScreenSize])

  // Handle resize events
  useEffect(() => {
    updateMobileState()

    const handleResize = () => {
      updateMobileState()
    }

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(updateMobileState, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateMobileState])

  // Mobile-specific utilities
  const isMobileSize = useCallback((size: 'xs' | 'sm' | 'md' = 'md') => {
    return viewport.width < breakpoints[size]
  }, [viewport.width])

  const isTabletSize = useCallback(() => {
    return viewport.width >= breakpoints.md && viewport.width < breakpoints.lg
  }, [viewport.width])

  const isDesktopSize = useCallback((size: 'lg' | 'xl' | '2xl' = 'lg') => {
    return viewport.width >= breakpoints[size]
  }, [viewport.width])

  // Touch gesture helpers
  const addTouchListeners = useCallback((
    element: HTMLElement,
    handlers: {
      onTouchStart?: (e: TouchEvent) => void
      onTouchMove?: (e: TouchEvent) => void
      onTouchEnd?: (e: TouchEvent) => void
      onSwipeLeft?: () => void
      onSwipeRight?: () => void
      onSwipeUp?: () => void
      onSwipeDown?: () => void
    }
  ) => {
    if (!mobileState.touchSupported) return () => {}

    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      handlers.onTouchStart?.(e)
    }

    const handleTouchMove = (e: TouchEvent) => {
      handlers.onTouchMove?.(e)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const minSwipeDistance = 50

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.()
          } else {
            handlers.onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.()
          } else {
            handlers.onSwipeUp?.()
          }
        }
      }

      handlers.onTouchEnd?.(e)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [mobileState.touchSupported])

  // Responsive class helpers
  const getResponsiveClasses = useCallback((classes: {
    mobile?: string
    tablet?: string
    desktop?: string
    default?: string
  }) => {
    if (mobileState.isMobile && classes.mobile) return classes.mobile
    if (mobileState.isTablet && classes.tablet) return classes.tablet
    if (mobileState.isDesktop && classes.desktop) return classes.desktop
    return classes.default || ''
  }, [mobileState])

  return {
    ...mobileState,
    viewport,
    breakpoints,
    isMobileSize,
    isTabletSize,
    isDesktopSize,
    addTouchListeners,
    getResponsiveClasses
  }
}