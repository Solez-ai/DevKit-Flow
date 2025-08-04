/**
 * History manager for undo/redo functionality
 */

import type { Command } from './commands'

export interface HistoryOptions {
  maxSize?: number
  enableMerging?: boolean
  mergeTimeout?: number
}

export interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  undoCount: number
  redoCount: number
  currentIndex: number
  totalCommands: number
}

export class HistoryManager {
  private history: Command[] = []
  private currentIndex = -1
  private maxSize: number
  private enableMerging: boolean
  private mergeTimeout: number
  private listeners: Set<(state: HistoryState) => void> = new Set()

  constructor(options: HistoryOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.enableMerging = options.enableMerging !== false
    this.mergeTimeout = options.mergeTimeout || 1000
  }

  /**
   * Execute a command and add it to history
   */
  async executeCommand(command: Command): Promise<void> {
    try {
      await command.execute()
      this.addToHistory(command)
    } catch (error) {
      console.error('Failed to execute command:', error)
      throw error
    }
  }

  /**
   * Add a command to history without executing it
   */
  private addToHistory(command: Command): void {
    // Try to merge with the last command if merging is enabled
    if (this.enableMerging && this.history.length > 0 && this.currentIndex >= 0) {
      const lastCommand = this.history[this.currentIndex]
      const timeDiff = command.timestamp.getTime() - lastCommand.timestamp.getTime()
      
      if (timeDiff <= this.mergeTimeout) {
        const mergedCommand = lastCommand.merge?.(command)
        if (mergedCommand) {
          this.history[this.currentIndex] = mergedCommand
          this.notifyListeners()
          return
        }
      }
    }

    // Remove any commands after current index (when undoing and then executing new command)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add the new command
    this.history.push(command)
    this.currentIndex++

    // Maintain max size
    if (this.history.length > this.maxSize) {
      this.history.shift()
      this.currentIndex--
    }

    this.notifyListeners()
  }

  /**
   * Undo the last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) {
      return false
    }

    const command = this.history[this.currentIndex]
    
    try {
      if (command.canUndo()) {
        await command.undo()
        this.currentIndex--
        this.notifyListeners()
        return true
      }
    } catch (error) {
      console.error('Failed to undo command:', error)
    }

    return false
  }

  /**
   * Redo the next command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) {
      return false
    }

    const command = this.history[this.currentIndex + 1]
    
    try {
      if (command.canRedo()) {
        await command.execute()
        this.currentIndex++
        this.notifyListeners()
        return true
      }
    } catch (error) {
      console.error('Failed to redo command:', error)
    }

    return false
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0 && 
           this.currentIndex < this.history.length &&
           this.history[this.currentIndex]?.canUndo()
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1 &&
           this.history[this.currentIndex + 1]?.canRedo()
  }

  /**
   * Get current history state
   */
  getState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.currentIndex + 1,
      redoCount: this.history.length - this.currentIndex - 1,
      currentIndex: this.currentIndex,
      totalCommands: this.history.length
    }
  }

  /**
   * Get history summary
   */
  getHistory(): Array<{
    id: string
    type: string
    description: string
    timestamp: Date
    isCurrent: boolean
  }> {
    return this.history.map((command, index) => ({
      id: command.id,
      type: command.type,
      description: command.description,
      timestamp: command.timestamp,
      isCurrent: index === this.currentIndex
    }))
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
    this.notifyListeners()
  }

  /**
   * Get the last executed command
   */
  getLastCommand(): Command | null {
    return this.currentIndex >= 0 ? this.history[this.currentIndex] : null
  }

  /**
   * Get the next command to redo
   */
  getNextCommand(): Command | null {
    return this.currentIndex < this.history.length - 1 ? 
           this.history[this.currentIndex + 1] : null
  }

  /**
   * Subscribe to history state changes
   */
  subscribe(listener: (state: HistoryState) => void): () => void {
    this.listeners.add(listener)
    
    // Send initial state
    listener(this.getState())
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in history listener:', error)
      }
    })
  }

  /**
   * Set maximum history size
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = Math.max(1, maxSize)
    
    // Trim history if needed
    if (this.history.length > this.maxSize) {
      const excess = this.history.length - this.maxSize
      this.history = this.history.slice(excess)
      this.currentIndex = Math.max(-1, this.currentIndex - excess)
      this.notifyListeners()
    }
  }

  /**
   * Enable or disable command merging
   */
  setMergingEnabled(enabled: boolean): void {
    this.enableMerging = enabled
  }

  /**
   * Set merge timeout
   */
  setMergeTimeout(timeout: number): void {
    this.mergeTimeout = Math.max(0, timeout)
  }

  /**
   * Get statistics about the history
   */
  getStats(): {
    totalCommands: number
    undoableCommands: number
    redoableCommands: number
    memoryUsage: number
    oldestCommand?: Date
    newestCommand?: Date
    commandTypes: Record<string, number>
  } {
    const commandTypes: Record<string, number> = {}
    let memoryUsage = 0
    
    this.history.forEach(command => {
      commandTypes[command.type] = (commandTypes[command.type] || 0) + 1
      memoryUsage += JSON.stringify(command).length
    })

    return {
      totalCommands: this.history.length,
      undoableCommands: this.currentIndex + 1,
      redoableCommands: this.history.length - this.currentIndex - 1,
      memoryUsage,
      oldestCommand: this.history[0]?.timestamp,
      newestCommand: this.history[this.history.length - 1]?.timestamp,
      commandTypes
    }
  }

  /**
   * Export history for debugging
   */
  exportHistory(): any {
    return {
      history: this.history.map(cmd => ({
        id: cmd.id,
        type: cmd.type,
        description: cmd.description,
        timestamp: cmd.timestamp.toISOString()
      })),
      currentIndex: this.currentIndex,
      maxSize: this.maxSize,
      enableMerging: this.enableMerging,
      mergeTimeout: this.mergeTimeout
    }
  }
}