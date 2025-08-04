/**
 * Keyboard shortcuts manager
 */

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export interface ShortcutHandler {
  id: string
  shortcut: KeyboardShortcut
  handler: (event: KeyboardEvent) => void | Promise<void>
  description: string
  enabled: boolean
  context?: string // Optional context for conditional shortcuts
}

export class KeyboardManager {
  private handlers = new Map<string, ShortcutHandler>()
  private listeners = new Set<(event: KeyboardEvent) => void>()
  private enabled = true
  private currentContext: string | null = null

  constructor() {
    this.setupGlobalListener()
  }

  /**
   * Register a keyboard shortcut
   */
  register(handler: Omit<ShortcutHandler, 'enabled'>): void {
    const fullHandler: ShortcutHandler = {
      ...handler,
      enabled: true
    }
    
    this.handlers.set(handler.id, fullHandler)
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string): void {
    this.handlers.delete(id)
  }

  /**
   * Enable or disable a specific shortcut
   */
  setEnabled(id: string, enabled: boolean): void {
    const handler = this.handlers.get(id)
    if (handler) {
      handler.enabled = enabled
    }
  }

  /**
   * Enable or disable all shortcuts
   */
  setGlobalEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Set the current context for conditional shortcuts
   */
  setContext(context: string | null): void {
    this.currentContext = context
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): ShortcutHandler[] {
    return Array.from(this.handlers.values())
  }

  /**
   * Get shortcuts for a specific context
   */
  getShortcutsForContext(context: string): ShortcutHandler[] {
    return Array.from(this.handlers.values()).filter(
      handler => !handler.context || handler.context === context
    )
  }

  /**
   * Check if a keyboard event matches a shortcut
   */
  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const key = event.key.toLowerCase()
    const shortcutKey = shortcut.key.toLowerCase()
    
    // Handle special key mappings
    const normalizedKey = this.normalizeKey(key)
    const normalizedShortcutKey = this.normalizeKey(shortcutKey)
    
    if (normalizedKey !== normalizedShortcutKey) {
      return false
    }

    // Check modifier keys
    const ctrlMatch = (shortcut.ctrlKey || false) === (event.ctrlKey || event.metaKey)
    const altMatch = (shortcut.altKey || false) === event.altKey
    const shiftMatch = (shortcut.shiftKey || false) === event.shiftKey
    const metaMatch = (shortcut.metaKey || false) === event.metaKey

    return ctrlMatch && altMatch && shiftMatch && metaMatch
  }

  /**
   * Normalize key names for consistent matching
   */
  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
      'delete': 'del',
      'escape': 'esc'
    }

    return keyMap[key.toLowerCase()] || key.toLowerCase()
  }

  /**
   * Setup global keyboard event listener
   */
  private setupGlobalListener(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.enabled) return

      // Skip if typing in input elements
      const target = event.target as HTMLElement
      if (this.isInputElement(target)) {
        return
      }

      // Find matching handlers
      const matchingHandlers = Array.from(this.handlers.values()).filter(handler => {
        if (!handler.enabled) return false
        
        // Check context
        if (handler.context && handler.context !== this.currentContext) {
          return false
        }

        return this.matchesShortcut(event, handler.shortcut)
      })

      // Execute handlers
      for (const handler of matchingHandlers) {
        try {
          if (handler.shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          
          if (handler.shortcut.stopPropagation !== false) {
            event.stopPropagation()
          }

          handler.handler(event)
        } catch (error) {
          console.error(`Error executing keyboard shortcut ${handler.id}:`, error)
        }
      }

      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in keyboard listener:', error)
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
  }

  /**
   * Check if element is an input element where shortcuts should be disabled
   */
  private isInputElement(element: HTMLElement): boolean {
    const inputTags = ['input', 'textarea', 'select']
    const tagName = element.tagName.toLowerCase()
    
    if (inputTags.includes(tagName)) {
      return true
    }

    // Check for contenteditable
    if (element.contentEditable === 'true') {
      return true
    }

    // Check for Monaco editor or other code editors
    if (element.classList.contains('monaco-editor') ||
        element.closest('.monaco-editor') ||
        element.classList.contains('cm-editor') ||
        element.closest('.cm-editor')) {
      return true
    }

    return false
  }

  /**
   * Add a global keyboard event listener
   */
  addListener(listener: (event: KeyboardEvent) => void): () => void {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrlKey || shortcut.metaKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    }
    
    if (shortcut.altKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt')
    }
    
    if (shortcut.shiftKey) {
      parts.push('⇧')
    }
    
    // Format key name
    let keyName = shortcut.key
    const keyDisplayMap: Record<string, string> = {
      ' ': 'Space',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'delete': 'Del',
      'escape': 'Esc',
      'enter': '↵',
      'tab': '⇥'
    }
    
    keyName = keyDisplayMap[keyName.toLowerCase()] || keyName.toUpperCase()
    parts.push(keyName)
    
    return parts.join('+')
  }

  /**
   * Parse shortcut string into KeyboardShortcut object
   */
  parseShortcut(shortcutString: string): KeyboardShortcut {
    const parts = shortcutString.toLowerCase().split('+').map(p => p.trim())
    const shortcut: KeyboardShortcut = { key: '' }
    
    for (const part of parts) {
      switch (part) {
        case 'ctrl':
        case 'cmd':
        case '⌘':
          shortcut.ctrlKey = true
          break
        case 'alt':
        case '⌥':
          shortcut.altKey = true
          break
        case 'shift':
        case '⇧':
          shortcut.shiftKey = true
          break
        case 'meta':
          shortcut.metaKey = true
          break
        default:
          shortcut.key = part
          break
      }
    }
    
    return shortcut
  }

  /**
   * Register default application shortcuts
   */
  registerDefaults(handlers: {
    undo: () => void
    redo: () => void
    save: () => void
    newSession: () => void
    deleteSelected: () => void
    selectAll: () => void
    copy: () => void
    paste: () => void
    cut: () => void
    find: () => void
    toggleSidebar: () => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
  }): void {
    const shortcuts: Array<Omit<ShortcutHandler, 'enabled'>> = [
      {
        id: 'undo',
        shortcut: { key: 'z', ctrlKey: true },
        handler: handlers.undo,
        description: 'Undo last action'
      },
      {
        id: 'redo',
        shortcut: { key: 'y', ctrlKey: true },
        handler: handlers.redo,
        description: 'Redo last undone action'
      },
      {
        id: 'redo-alt',
        shortcut: { key: 'z', ctrlKey: true, shiftKey: true },
        handler: handlers.redo,
        description: 'Redo last undone action (alternative)'
      },
      {
        id: 'save',
        shortcut: { key: 's', ctrlKey: true },
        handler: handlers.save,
        description: 'Save current work'
      },
      {
        id: 'new-session',
        shortcut: { key: 'n', ctrlKey: true },
        handler: handlers.newSession,
        description: 'Create new session'
      },
      {
        id: 'delete',
        shortcut: { key: 'Delete' },
        handler: handlers.deleteSelected,
        description: 'Delete selected items'
      },
      {
        id: 'select-all',
        shortcut: { key: 'a', ctrlKey: true },
        handler: handlers.selectAll,
        description: 'Select all items'
      },
      {
        id: 'copy',
        shortcut: { key: 'c', ctrlKey: true },
        handler: handlers.copy,
        description: 'Copy selected items'
      },
      {
        id: 'paste',
        shortcut: { key: 'v', ctrlKey: true },
        handler: handlers.paste,
        description: 'Paste copied items'
      },
      {
        id: 'cut',
        shortcut: { key: 'x', ctrlKey: true },
        handler: handlers.cut,
        description: 'Cut selected items'
      },
      {
        id: 'find',
        shortcut: { key: 'f', ctrlKey: true },
        handler: handlers.find,
        description: 'Find and search'
      },
      {
        id: 'toggle-sidebar',
        shortcut: { key: 'b', ctrlKey: true },
        handler: handlers.toggleSidebar,
        description: 'Toggle sidebar'
      },
      {
        id: 'zoom-in',
        shortcut: { key: '=', ctrlKey: true },
        handler: handlers.zoomIn,
        description: 'Zoom in'
      },
      {
        id: 'zoom-out',
        shortcut: { key: '-', ctrlKey: true },
        handler: handlers.zoomOut,
        description: 'Zoom out'
      },
      {
        id: 'reset-zoom',
        shortcut: { key: '0', ctrlKey: true },
        handler: handlers.resetZoom,
        description: 'Reset zoom'
      }
    ]

    shortcuts.forEach(shortcut => this.register(shortcut))
  }

  /**
   * Cleanup and remove all listeners
   */
  destroy(): void {
    this.handlers.clear()
    this.listeners.clear()
    this.enabled = false
  }
}