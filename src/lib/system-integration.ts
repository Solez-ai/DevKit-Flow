/**
 * System Integration Manager
 * Ensures all components work together properly and handles cross-component communication
 */

import { useAppStore } from '@/store/app-store';
import { aiService } from './ai-service';
import { sessionManager } from './session-manager';
import { templateManager } from './template-manager';
import { exportImportManager } from './export-import-manager';
import { storageManager } from './storage-manager';
import { performanceMonitor } from './performance-monitor';

export class SystemIntegrationManager {
  private static instance: SystemIntegrationManager;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): SystemIntegrationManager {
    if (!SystemIntegrationManager.instance) {
      SystemIntegrationManager.instance = new SystemIntegrationManager();
    }
    return SystemIntegrationManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing DevKit Flow System Integration...');

      // Initialize performance monitoring
      try {
        performanceMonitor.startMonitoring();
        console.log('✅ Performance monitoring started');
      } catch (error) {
        console.warn('⚠️ Performance monitoring failed to start:', error);
      }

      // Initialize storage systems
      try {
        await storageManager.initialize();
        console.log('✅ Storage systems initialized');
      } catch (error) {
        console.error('❌ Storage initialization failed:', error);
        throw error;
      }

      // Initialize session management
      await sessionManager.initialize();
      console.log('✅ Session management initialized');

      // Initialize template management
      await templateManager.initialize();
      console.log('✅ Template management initialized');

      // Initialize export/import system
      await exportImportManager.initialize();
      console.log('✅ Export/Import system initialized');

      // Initialize AI service (non-blocking)
      this.initializeAIService();

      // Set up cross-component communication
      this.setupCrossComponentCommunication();

      // Set up error recovery mechanisms
      this.setupErrorRecovery();

      // Set up data synchronization
      this.setupDataSynchronization();

      this.initialized = true;
      console.log('🎉 DevKit Flow System Integration completed successfully');

    } catch (error) {
      console.error('❌ System integration failed:', error);
      throw error;
    }
  }

  private async initializeAIService(): Promise<void> {
    try {
      const store = useAppStore.getState();
      if (store.aiConfig.isEnabled) {
        await aiService.initialize(store.aiConfig);
        console.log('✅ AI service initialized');
      } else {
        console.log('ℹ️ AI service disabled by user');
      }
    } catch (error) {
      console.warn('⚠️ AI service initialization failed (non-critical):', error);
      // AI failure shouldn't block the app
    }
  }

  private setupCrossComponentCommunication(): void {
    // Set up event listeners for cross-component communication
    
    // Session updates should trigger template suggestions
    this.setupSessionTemplateIntegration();
    
    // Pattern updates should sync with DevFlow Studio
    this.setupPatternStudioIntegration();
    
    // AI responses should integrate with both workspaces
    this.setupAIIntegration();
    
    console.log('✅ Cross-component communication setup complete');
  }

  private setupSessionTemplateIntegration(): void {
    // When a session is created or updated, check for template suggestions
    const originalUpdateSession = sessionManager.updateSession.bind(sessionManager);
    sessionManager.updateSession = async (sessionId: string, updates: any) => {
      const result = await originalUpdateSession(sessionId, updates);
      
      // Trigger template suggestions based on session content
      this.suggestTemplatesForSession(sessionId);
      
      return result;
    };
  }

  private setupPatternStudioIntegration(): void {
    // Enable importing regex patterns into DevFlow Studio code nodes
    window.addEventListener('pattern-created', (event: any) => {
      const { pattern } = event.detail;
      this.integratePatternWithStudio(pattern);
    });
  }

  private setupAIIntegration(): void {
    // Set up AI response handling for both workspaces
    // Note: AI service integration is currently disabled
    // TODO: Implement proper AI service integration when needed
    if (aiService && typeof aiService.onResponse === 'function') {
      aiService.onResponse((response: any, context: any) => {
        this.handleAIResponse(response, context);
      });
    }
  }

  // Duplicate methods removed - see implementations below

  private setupErrorRecovery(): void {
    // Set up automatic error recovery mechanisms
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledError(event.reason);
    });

    window.addEventListener('error', (event) => {
      this.handleUnhandledError(event.error);
    });

    console.log('✅ Error recovery mechanisms setup complete');
  }

  private setupDataSynchronization(): void {
    // Set up automatic data synchronization between components
    setInterval(() => {
      this.syncDataAcrossComponents();
    }, 30000); // Sync every 30 seconds

    // Sync on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncDataAcrossComponents();
      }
    });

    console.log('✅ Data synchronization setup complete');
  }

  private async suggestTemplatesForSession(sessionId: string): Promise<void> {
    try {
      const session = await sessionManager.loadSession(sessionId);
      if (!session) return;

      // Analyze session content and suggest relevant templates
      // TODO: Implement template suggestion logic
      // const suggestions = await templateManager.suggestTemplates(session);
      
      // For now, just log that we would suggest templates
      console.log('Template suggestions would be generated for session:', sessionId);
    } catch (error) {
      console.warn('Template suggestion failed:', error);
    }
  }

  private integratePatternWithStudio(pattern: any): void {
    try {
      const store = useAppStore.getState();
      const currentSession = store.sessions.find(s => s.id === store.currentSessionId);
      
      if (currentSession && store.currentWorkspace === 'studio') {
        // Show option to add pattern as code snippet to current session
        this.showPatternIntegrationOption(pattern, currentSession.id);
      }
    } catch (error) {
      console.warn('Pattern integration failed:', error);
    }
  }

  private handleAIResponse(response: any, context: any): void {
    try {
      // Route AI responses to appropriate components
      switch (context.workspace) {
        case 'studio':
          this.handleStudioAIResponse(response, context);
          break;
        case 'regexr':
          this.handleRegexrAIResponse(response, context);
          break;
        default:
          console.warn('Unknown workspace for AI response:', context.workspace);
      }
    } catch (error) {
      console.warn('AI response handling failed:', error);
    }
  }

  private handleStudioAIResponse(response: any, context: any): void {
    // Handle AI responses in DevFlow Studio
    if (response.type === 'code-generation') {
      this.addAICodeToSession(response.code, response.language, context.sessionId);
    } else if (response.type === 'architecture-suggestion') {
      this.showArchitectureSuggestion(response.suggestion, context.sessionId);
    }
  }

  private handleRegexrAIResponse(response: any, context: any): void {
    // Handle AI responses in Regexr++
    if (response.type === 'pattern-generation') {
      this.updateRegexPattern(response.pattern, response.explanation);
    } else if (response.type === 'pattern-optimization') {
      this.showPatternOptimization(response.optimizedPattern, response.explanation);
    }
  }

  private handleUnhandledError(error: any): void {
    console.error('Unhandled error caught by system integration:', error);
    
    // Attempt recovery based on error type
    if (error.name === 'QuotaExceededError') {
      this.handleStorageQuotaExceeded();
    } else if (error.message?.includes('network')) {
      this.handleNetworkError();
    } else {
      this.handleGenericError(error);
    }
  }

  private async syncDataAcrossComponents(): Promise<void> {
    try {
      // Sync storage quota
      const store = useAppStore.getState();
      await store.updateStorageQuota();

      // Sync session data
      await this.syncSessionData();

      // Sync template data
      await this.syncTemplateData();

      // Sync pattern data
      await this.syncPatternData();

    } catch (error) {
      console.warn('Data synchronization failed:', error);
    }
  }

  private async syncSessionData(): Promise<void> {
    // Ensure session data is consistent across components
    const store = useAppStore.getState();
    const storedSessions = await sessionManager.loadAllSessions();
    
    // Check for discrepancies and resolve them
    if (storedSessions.length !== store.sessions.length) {
      console.log('Session data out of sync, reloading...');
      await store.loadSessions();
    }
  }

  private async syncTemplateData(): Promise<void> {
    // Ensure template data is consistent
    const store = useAppStore.getState();
    const storedTemplates = await templateManager.getAllTemplates();
    
    if (storedTemplates.length !== store.sessionTemplates.length) {
      console.log('Template data out of sync, reloading...');
      await store.loadTemplates();
    }
  }

  private async syncPatternData(): Promise<void> {
    // Sync regex pattern data
    // Implementation depends on pattern storage system
  }

  private handleStorageQuotaExceeded(): void {
    console.warn('Storage quota exceeded, attempting cleanup...');
    
    // Trigger storage cleanup
    storageManager.cleanup().catch(console.error);
    
    // Notify user
    this.notifyUser('Storage space is running low. Some old data has been cleaned up.', 'warning');
  }

  private handleNetworkError(): void {
    console.warn('Network error detected, switching to offline mode...');
    
    // Disable AI features temporarily
    const store = useAppStore.getState();
    store.updateAIConfig({ isEnabled: false });
    
    // Notify user
    this.notifyUser('Network connection lost. Working in offline mode.', 'info');
  }

  private handleGenericError(error: any): void {
    console.error('Generic error handled by system integration:', error);
    
    // Add to error store for user notification
    const store = useAppStore.getState();
    store.addError({
      code: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred. The application will continue to work.',
      details: error,
      timestamp: new Date()
    });
  }

  // Helper methods for integration features
  private notifyTemplateSuggestions(suggestions: any[]): void {
    // Implementation for template suggestions notification
    console.log('Template suggestions:', suggestions);
  }

  private showPatternIntegrationOption(pattern: any, sessionId: string): void {
    // Implementation for pattern integration option
    console.log('Pattern integration option:', pattern, sessionId);
  }

  private addAICodeToSession(code: string, language: string, sessionId: string): void {
    // Implementation for adding AI-generated code to session
    console.log('Adding AI code to session:', { code, language, sessionId });
  }

  private showArchitectureSuggestion(suggestion: string, sessionId: string): void {
    // Implementation for architecture suggestions
    console.log('Architecture suggestion:', suggestion, sessionId);
  }

  private updateRegexPattern(pattern: string, explanation: string): void {
    // Implementation for updating regex pattern
    console.log('Updating regex pattern:', { pattern, explanation });
  }

  private showPatternOptimization(optimizedPattern: string, explanation: string): void {
    // Implementation for pattern optimization display
    console.log('Pattern optimization:', { optimizedPattern, explanation });
  }

  private notifyUser(message: string, type: 'info' | 'warning' | 'error'): void {
    // Implementation for user notifications
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  // Public methods for external integration
  public async exportAllData(): Promise<string> {
    const store = useAppStore.getState();
    return store.exportData();
  }

  public async importAllData(data: string): Promise<boolean> {
    const store = useAppStore.getState();
    return store.importData(data);
  }

  public getSystemStatus(): any {
    return {
      initialized: this.initialized,
      aiServiceAvailable: aiService.isAvailable(),
      storageQuota: useAppStore.getState().storageQuota,
      activeErrors: useAppStore.getState().errors.length,
      performance: performanceMonitor.getMetrics()
    };
  }
}

// Export singleton instance
export const systemIntegration = SystemIntegrationManager.getInstance();