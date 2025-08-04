/**
 * React hook for undo/redo functionality
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { HistoryManager, type HistoryState } from '@/lib/history'
import { KeyboardManager } from '@/lib/keyboard'
import type { Command } from '@/lib/commands'

// Global instances
const historyManager = new HistoryManager({
  maxSize: 100,
  enableMerging: true,
  mergeTimeout: 1000
})

const keyboardManager = new KeyboardManager()

/**
 * Hook for undo/redo functionality
 */
export function useHistory() {
  const [historyState, setHistoryState] = useState<HistoryState>(() => 
    historyManager.getState()
  )

  useEffect(() => {
    const unsubscribe = historyManager.subscribe(setHistoryState)
    return unsubscribe
  }, [])

  const executeCommand = useCallback(async (command: Command) => {
    await historyManager.executeCommand(command)
  }, [])

  const undo = useCallback(async () => {
    await historyManager.undo()
  }, [])

  const redo = useCallback(async () => {
    await historyManager.redo()
  }, [])

  const clear = useCallback(() => {
    historyManager.clear()
  }, [])

  const getHistory = useCallback(() => {
    return historyManager.getHistory()
  }, [])

  const getStats = useCallback(() => {
    return historyManager.getStats()
  }, [])

  return {
    ...historyState,
    executeCommand,
    undo,
    redo,
    clear,
    getHistory,
    getStats
  }
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(enabled = true) {
  const { undo, redo } = useHistory()
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    // Register undo/redo shortcuts
    keyboardManager.register({
      id: 'global-undo',
      shortcut: { key: 'z', ctrlKey: true },
      handler: async () => {
        if (enabledRef.current) {
          await undo()
        }
      },
      description: 'Undo last action'
    })

    keyboardManager.register({
      id: 'global-redo',
      shortcut: { key: 'y', ctrlKey: true },
      handler: async () => {
        if (enabledRef.current) {
          await redo()
        }
      },
      description: 'Redo last action'
    })

    keyboardManager.register({
      id: 'global-redo-alt',
      shortcut: { key: 'z', ctrlKey: true, shiftKey: true },
      handler: async () => {
        if (enabledRef.current) {
          await redo()
        }
      },
      description: 'Redo last action (alternative)'
    })

    return () => {
      keyboardManager.unregister('global-undo')
      keyboardManager.unregister('global-redo')
      keyboardManager.unregister('global-redo-alt')
    }
  }, [undo, redo])

  const registerShortcut = useCallback((
    id: string,
    shortcut: Parameters<typeof keyboardManager.register>[0]['shortcut'],
    handler: Parameters<typeof keyboardManager.register>[0]['handler'],
    description: string,
    context?: string
  ) => {
    keyboardManager.register({
      id,
      shortcut,
      handler,
      description,
      context
    })

    return () => keyboardManager.unregister(id)
  }, [])

  const setContext = useCallback((context: string | null) => {
    keyboardManager.setContext(context)
  }, [])

  const setShortcutEnabled = useCallback((id: string, enabled: boolean) => {
    keyboardManager.setEnabled(id, enabled)
  }, [])

  const getShortcuts = useCallback(() => {
    return keyboardManager.getShortcuts()
  }, [])

  const formatShortcut = useCallback((shortcut: Parameters<typeof keyboardManager.formatShortcut>[0]) => {
    return keyboardManager.formatShortcut(shortcut)
  }, [])

  return {
    registerShortcut,
    setContext,
    setShortcutEnabled,
    getShortcuts,
    formatShortcut
  }
}

/**
 * Hook for command creation helpers
 */
export function useCommands() {
  const { executeCommand } = useHistory()

  const createAndExecute = useCallback(async (command: Command) => {
    await executeCommand(command)
  }, [executeCommand])

  return {
    createAndExecute,
    executeCommand
  }
}

/**
 * Hook for history visualization
 */
export function useHistoryVisualization() {
  const [history, setHistory] = useState(() => historyManager.getHistory())
  const [stats, setStats] = useState(() => historyManager.getStats())

  useEffect(() => {
    const updateData = () => {
      setHistory(historyManager.getHistory())
      setStats(historyManager.getStats())
    }

    const unsubscribe = historyManager.subscribe(updateData)
    return unsubscribe
  }, [])

  return {
    history,
    stats
  }
}

/**
 * Hook for managing history settings
 */
export function useHistorySettings() {
  const [maxSize, setMaxSizeState] = useState(100)
  const [mergingEnabled, setMergingEnabledState] = useState(true)
  const [mergeTimeout, setMergeTimeoutState] = useState(1000)

  const setMaxSize = useCallback((size: number) => {
    historyManager.setMaxSize(size)
    setMaxSizeState(size)
  }, [])

  const setMergingEnabled = useCallback((enabled: boolean) => {
    historyManager.setMergingEnabled(enabled)
    setMergingEnabledState(enabled)
  }, [])

  const setMergeTimeout = useCallback((timeout: number) => {
    historyManager.setMergeTimeout(timeout)
    setMergeTimeoutState(timeout)
  }, [])

  const exportHistory = useCallback(() => {
    return historyManager.exportHistory()
  }, [])

  return {
    maxSize,
    mergingEnabled,
    mergeTimeout,
    setMaxSize,
    setMergingEnabled,
    setMergeTimeout,
    exportHistory
  }
}

// Export the global instances for direct access if needed
export { historyManager, keyboardManager }