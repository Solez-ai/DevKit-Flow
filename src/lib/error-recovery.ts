/**
 * Advanced Error Recovery System
 * Provides intelligent error handling and automatic recovery mechanisms
 */

import { useAppStore } from '@/store/app-store';
import { storageManager } from './storage-manager';
import { sessionManager } from './session-manager';
import { performanceMonitor } from './performance-monitor';

export interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<boolean>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  userAgent: string;
  timestamp: Date;
  appState: any;
  performanceMetrics: any;
}

class ErrorRecoverySystem {
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  private errorHistory: ErrorContext[] = [];
  private maxErrorHistory = 50;
  private recoveryInProgress = false;

  constructor() {
    this.setupRecoveryActions();
    this.setupGlobalErrorHandlers();
  }

  private setupRecoveryActions(): void {
    // Storage-related recovery actions
    this.addRecoveryAction('QuotaExceededError', {
      id: 'cleanup-storage',
      name: 'Clean Up Storage',
      description: 'Remove old data to free up storage space',
      execute: async () => {
        try {
          await storageManager.cleanup();
          await useAppStore.getState().updateStorageQuota();
          return true;
        } catch (error) {
          console.error('Storage cleanup failed:', error);
          return false;
        }
      },
      priority: 'high'
    });

    this.addRecoveryAction('QuotaExceededError', {
      id: 'compress-data',
      name: 'Compress Data',
      description: 'Compress stored data to reduce storage usage',
      execute: async () => {
        try {
          // TODO: Implement data compression functionality
          console.log('Data compression not yet implemented');
          return true;
        } catch (error) {
          console.error('Data compression failed:', error);
          return false;
        }
      },
      priority: 'medium'
    });

    // Session-related recovery actions
    this.addRecoveryAction('SESSION_LOAD_FAILED', {
      id: 'reload-sessions',
      name: 'Reload Sessions',
      description: 'Attempt to reload sessions from storage',
      execute: async () => {
        try {
          await useAppStore.getState().loadSessions();
          return true;
        } catch (error) {
          console.error('Session reload failed:', error);
          return false;
        }
      },
      priority: 'high'
    });

    this.addRecoveryAction('SESSION_CORRUPTION', {
      id: 'restore-backup',
      name: 'Restore from Backup',
      description: 'Restore sessions from the most recent backup',
      execute: async () => {
        try {
          // TODO: Implement backup restoration functionality
          console.log('Backup restoration not yet implemented');
          await useAppStore.getState().loadSessions();
          return true;
        } catch (error) {
          console.error('Session loading failed:', error);
          return false;
        }
      },
      priority: 'critical'
    });

    // Network-related recovery actions
    this.addRecoveryAction('NetworkError', {
      id: 'enable-offline-mode',
      name: 'Enable Offline Mode',
      description: 'Switch to offline mode and disable network-dependent features',
      execute: async () => {
        try {
          const store = useAppStore.getState();
          await store.updateAIConfig({ isEnabled: false });
          this.notifyUser('Switched to offline mode due to network issues', 'info');
          return true;
        } catch (error) {
          console.error('Offline mode activation failed:', error);
          return false;
        }
      },
      priority: 'medium'
    });

    // AI service recovery actions
    this.addRecoveryAction('AI_SERVICE_ERROR', {
      id: 'reinitialize-ai',
      name: 'Reinitialize AI Service',
      description: 'Attempt to reinitialize the AI service',
      execute: async () => {
        try {
          const store = useAppStore.getState();
          await store.initializeAI();
          return true;
        } catch (error) {
          console.error('AI service reinitialization failed:', error);
          return false;
        }
      },
      priority: 'low'
    });

    // Memory-related recovery actions
    this.addRecoveryAction('OutOfMemoryError', {
      id: 'clear-caches',
      name: 'Clear Caches',
      description: 'Clear application caches to free up memory',
      execute: async () => {
        try {
          // Clear various caches
          this.clearApplicationCaches();
          
          // Force garbage collection if available
          if ('gc' in window) {
            (window as any).gc();
          }
          
          return true;
        } catch (error) {
          console.error('Cache clearing failed:', error);
          return false;
        }
      },
      priority: 'high'
    });

    // UI state recovery actions
    this.addRecoveryAction('UI_STATE_ERROR', {
      id: 'reset-ui-state',
      name: 'Reset UI State',
      description: 'Reset the user interface to default state',
      execute: async () => {
        try {
          const store = useAppStore.getState();
          store.setSidebarCollapsed(false);
          store.setPropertiesPanelOpen(false);
          store.setCurrentWorkspace('studio');
          return true;
        } catch (error) {
          console.error('UI state reset failed:', error);
          return false;
        }
      },
      priority: 'medium'
    });
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'UnhandledPromiseRejection');
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'GlobalError');
    });

    // Handle React error boundary errors
    window.addEventListener('react-error', (event: any) => {
      this.handleError(event.detail.error, 'ReactError');
    });
  }

  private addRecoveryAction(errorType: string, action: RecoveryAction): void {
    if (!this.recoveryActions.has(errorType)) {
      this.recoveryActions.set(errorType, []);
    }
    this.recoveryActions.get(errorType)!.push(action);
  }

  public async handleError(error: any, errorType: string = 'Unknown'): Promise<void> {
    if (this.recoveryInProgress) {
      console.warn('Recovery already in progress, queuing error:', error);
      return;
    }

    console.error(`Error handled by recovery system [${errorType}]:`, error);

    // Record error context
    const context = this.captureErrorContext(error, errorType);
    this.errorHistory.push(context);

    // Trim error history if needed
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxErrorHistory);
    }

    // Record error in performance monitor
    performanceMonitor.recordError();

    // Attempt automatic recovery
    await this.attemptRecovery(errorType, error);
  }

  private captureErrorContext(error: any, errorType: string): ErrorContext {
    return {
      errorType,
      errorMessage: error?.message || String(error),
      stackTrace: error?.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      appState: this.captureAppState(),
      performanceMetrics: performanceMonitor.getMetrics()
    };
  }

  private captureAppState(): any {
    try {
      const store = useAppStore.getState();
      return {
        currentWorkspace: store.currentWorkspace,
        sessionCount: store.sessions.length,
        currentSessionId: store.currentSessionId,
        patternCount: store.patterns.length,
        errorCount: store.errors.length,
        isLoading: store.isLoading,
        storageQuota: store.storageQuota
      };
    } catch (error) {
      console.warn('Failed to capture app state:', error);
      return { captureError: error?.message };
    }
  }

  private async attemptRecovery(errorType: string, originalError: any): Promise<void> {
    this.recoveryInProgress = true;

    try {
      // Get recovery actions for this error type
      const actions = this.getRecoveryActions(errorType, originalError);

      if (actions.length === 0) {
        console.warn(`No recovery actions available for error type: ${errorType}`);
        this.handleUnrecoverableError(originalError, errorType);
        return;
      }

      // Sort actions by priority
      actions.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

      // Attempt recovery actions
      for (const action of actions) {
        console.log(`Attempting recovery action: ${action.name}`);
        
        try {
          const success = await action.execute();
          
          if (success) {
            console.log(`Recovery action succeeded: ${action.name}`);
            this.notifyUser(`Recovered from error: ${action.description}`, 'success');
            return;
          } else {
            console.warn(`Recovery action failed: ${action.name}`);
          }
        } catch (actionError) {
          console.error(`Recovery action threw error: ${action.name}`, actionError);
        }
      }

      // If all recovery actions failed
      console.error('All recovery actions failed');
      this.handleUnrecoverableError(originalError, errorType);

    } finally {
      this.recoveryInProgress = false;
    }
  }

  private getRecoveryActions(errorType: string, error: any): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Get exact match actions
    if (this.recoveryActions.has(errorType)) {
      actions.push(...this.recoveryActions.get(errorType)!);
    }

    // Get pattern-based actions
    if (error?.name && this.recoveryActions.has(error.name)) {
      actions.push(...this.recoveryActions.get(error.name)!);
    }

    // Get generic actions based on error characteristics
    if (error?.message?.includes('storage') || error?.message?.includes('quota')) {
      actions.push(...(this.recoveryActions.get('QuotaExceededError') || []));
    }

    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      actions.push(...(this.recoveryActions.get('NetworkError') || []));
    }

    if (error?.message?.includes('memory') || error?.name === 'RangeError') {
      actions.push(...(this.recoveryActions.get('OutOfMemoryError') || []));
    }

    // Remove duplicates
    const uniqueActions = actions.filter((action, index, self) => 
      self.findIndex(a => a.id === action.id) === index
    );

    return uniqueActions;
  }

  private getPriorityWeight(priority: RecoveryAction['priority']): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private handleUnrecoverableError(error: any, errorType: string): void {
    console.error('Unrecoverable error:', error);

    // Add to app store errors
    const store = useAppStore.getState();
    store.addError({
      code: `UNRECOVERABLE_${errorType}`,
      message: `An unrecoverable error occurred: ${error?.message || String(error)}`,
      details: error,
      timestamp: new Date()
    });

    // Notify user
    this.notifyUser(
      'A serious error occurred that could not be automatically recovered. Please refresh the page.',
      'error'
    );

    // Offer manual recovery options
    this.showManualRecoveryOptions(error, errorType);
  }

  private clearApplicationCaches(): void {
    // Clear various application caches
    try {
      // Clear React Query cache if available
      if ('queryClient' in window) {
        (window as any).queryClient.clear();
      }

      // Clear any custom caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('devkit-flow')) {
              caches.delete(name);
            }
          });
        });
      }

      // Clear session storage (but preserve localStorage)
      sessionStorage.clear();

    } catch (error) {
      console.warn('Failed to clear some caches:', error);
    }
  }

  private notifyUser(message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    // Use toast notification system
    const event = new CustomEvent('show-toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  private showManualRecoveryOptions(error: any, errorType: string): void {
    // Show modal with manual recovery options
    const event = new CustomEvent('show-recovery-modal', {
      detail: { error, errorType, actions: this.getManualRecoveryOptions() }
    });
    window.dispatchEvent(event);
  }

  private getManualRecoveryOptions(): RecoveryAction[] {
    return [
      {
        id: 'refresh-page',
        name: 'Refresh Page',
        description: 'Refresh the page to restart the application',
        execute: async () => {
          window.location.reload();
          return true;
        },
        priority: 'high'
      },
      {
        id: 'clear-all-data',
        name: 'Clear All Data',
        description: 'Clear all stored data and restart fresh (WARNING: This will delete all your work)',
        execute: async () => {
          localStorage.clear();
          sessionStorage.clear();
          if ('indexedDB' in window) {
            // Clear IndexedDB
            const databases = await indexedDB.databases();
            databases.forEach(db => {
              if (db.name?.includes('devkit-flow')) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          }
          window.location.reload();
          return true;
        },
        priority: 'critical'
      },
      {
        id: 'export-data',
        name: 'Export Data',
        description: 'Export your data before taking recovery actions',
        execute: async () => {
          try {
            const store = useAppStore.getState();
            const data = store.exportData();
            
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devkit-flow-backup-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
          } catch (error) {
            console.error('Data export failed:', error);
            return false;
          }
        },
        priority: 'medium'
      }
    ];
  }

  // Public methods for external use
  public getErrorHistory(): ErrorContext[] {
    return [...this.errorHistory];
  }

  public getRecoveryStatistics(): any {
    return {
      totalErrors: this.errorHistory.length,
      errorsByType: this.errorHistory.reduce((acc, error) => {
        acc[error.errorType] = (acc[error.errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentErrors: this.errorHistory.slice(-10),
      recoveryInProgress: this.recoveryInProgress
    };
  }

  public async testRecoveryAction(actionId: string): Promise<boolean> {
    // Find and test a specific recovery action
    for (const actions of this.recoveryActions.values()) {
      const action = actions.find(a => a.id === actionId);
      if (action) {
        try {
          return await action.execute();
        } catch (error) {
          console.error(`Test execution failed for action ${actionId}:`, error);
          return false;
        }
      }
    }
    return false;
  }
}

// Export singleton instance
export const errorRecovery = new ErrorRecoverySystem();