import { useEffect, useCallback, useRef } from 'react'
import { useWorkspace, useUIState } from './use-app-store'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'editing' | 'workspace' | 'accessibility'
}

interface FocusableElement {
  element: HTMLElement
  priority: number
  group: string
}

export function useKeyboardNavigation() {
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const { toggleSidebar } = useUIState()
  const focusableElementsRef = useRef<FocusableElement[]>([])
  const currentFocusIndexRef = useRef(0)

  // Register focusable elements for keyboard navigation
  const registerFocusableElement = useCallback((
    element: HTMLElement,
    priority: number = 0,
    group: string = 'default'
  ) => {
    const focusableElement: FocusableElement = { element, priority, group }
    focusableElementsRef.current.push(focusableElement)
    
    // Sort by priority (higher priority first)
    focusableElementsRef.current.sort((a, b) => b.priority - a.priority)
    
    return () => {
      focusableElementsRef.current = focusableElementsRef.current.filter(
        fe => fe.element !== element
      )
    }
  }, [])

  // Navigate to next/previous focusable element
  const navigateFocus = useCallback((direction: 'next' | 'previous') => {
    const elements = focusableElementsRef.current
    if (elements.length === 0) return

    const currentIndex = currentFocusIndexRef.current
    let nextIndex: number

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % elements.length
    } else {
      nextIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1
    }

    const nextElement = elements[nextIndex]
    if (nextElement && nextElement.element) {
      nextElement.element.focus()
      currentFocusIndexRef.current = nextIndex
    }
  }, [])

  // Focus management for specific groups
  const focusGroup = useCallback((groupName: string) => {
    const groupElements = focusableElementsRef.current.filter(
      fe => fe.group === groupName
    )
    if (groupElements.length > 0) {
      groupElements[0].element.focus()
    }
  }, [])

  // Skip to main content
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('[role="main"]') as HTMLElement
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Keyboard shortcuts configuration
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      altKey: true,
      action: () => setCurrentWorkspace('studio'),
      description: 'Switch to DevFlow Studio',
      category: 'navigation'
    },
    {
      key: '2',
      altKey: true,
      action: () => setCurrentWorkspace('regexr'),
      description: 'Switch to Regexr++',
      category: 'navigation'
    },
    {
      key: '3',
      altKey: true,
      action: () => setCurrentWorkspace('settings'),
      description: 'Open Settings',
      category: 'navigation'
    },
    {
      key: 'b',
      ctrlKey: true,
      action: toggleSidebar,
      description: 'Toggle Sidebar',
      category: 'navigation'
    },
    {
      key: 'Tab',
      action: () => navigateFocus('next'),
      description: 'Navigate to next element',
      category: 'navigation'
    },
    {
      key: 'Tab',
      shiftKey: true,
      action: () => navigateFocus('previous'),
      description: 'Navigate to previous element',
      category: 'navigation'
    },
    // Accessibility shortcuts
    {
      key: 'Enter',
      action: skipToMainContent,
      description: 'Skip to main content',
      category: 'accessibility'
    },
    {
      key: 'h',
      altKey: true,
      action: () => focusGroup('header'),
      description: 'Focus header navigation',
      category: 'accessibility'
    },
    {
      key: 's',
      altKey: true,
      action: () => focusGroup('sidebar'),
      description: 'Focus sidebar',
      category: 'accessibility'
    },
    {
      key: 'm',
      altKey: true,
      action: () => focusGroup('main'),
      description: 'Focus main content',
      category: 'accessibility'
    }
  ]

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with input elements
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key === event.key &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      )
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.action()
    }
  }, [shortcuts, navigateFocus, setCurrentWorkspace, toggleSidebar, skipToMainContent, focusGroup])

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Announce workspace changes to screen readers
  useEffect(() => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = `Switched to ${currentWorkspace} workspace`
    
    document.body.appendChild(announcement)
    
    const timer = setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
    
    return () => {
      clearTimeout(timer)
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }
  }, [currentWorkspace])

  return {
    registerFocusableElement,
    navigateFocus,
    focusGroup,
    skipToMainContent,
    shortcuts
  }
}