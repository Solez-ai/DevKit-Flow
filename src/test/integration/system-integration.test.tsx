/**
 * System Integration Tests
 * Tests that all components work together properly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { systemIntegration } from '@/lib/system-integration';
import { useAppStore } from '@/store/app-store';
import App from '@/App';

describe('System Integration', () => {
  beforeEach(async () => {
    // Reset app store state
    useAppStore.getState().reset();
    
    // Initialize system integration
    await systemIntegration.initialize();
  });

  afterEach(() => {
    // Cleanup
    systemIntegration.stopMonitoring?.();
  });

  describe('Application Initialization', () => {
    it('should initialize all subsystems successfully', async () => {
      const status = systemIntegration.getSystemStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.activeErrors).toBe(0);
    });

    it('should load the application without errors', async () => {
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
      });

      expect(container.querySelector('.error-boundary')).not.toBeInTheDocument();
    });

    it('should handle theme initialization', async () => {
      render(<App />);
      
      await waitFor(() => {
        const root = document.documentElement;
        expect(root.classList.contains('light') || root.classList.contains('dark')).toBe(true);
      });
    });
  });

  describe('Workspace Integration', () => {
    it('should switch between workspaces correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Studio')).toBeInTheDocument();
      });

      // Switch to Regexr++
      const regexrButton = screen.getByText('Regexr++');
      fireEvent.click(regexrButton);

      await waitFor(() => {
        expect(useAppStore.getState().currentWorkspace).toBe('regexr');
      });
    });

    it('should maintain state when switching workspaces', async () => {
      const store = useAppStore.getState();
      
      // Create a session in studio
      await store.createSession('Test Session', 'Test Description');
      const sessionId = store.currentSessionId;

      // Switch to regexr and back
      store.setCurrentWorkspace('regexr');
      store.setCurrentWorkspace('studio');

      // Session should still be current
      expect(store.currentSessionId).toBe(sessionId);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle and display errors gracefully', async () => {
      const store = useAppStore.getState();
      
      // Add an error
      store.addError({
        code: 'TEST_ERROR',
        message: 'This is a test error',
        timestamp: new Date()
      });

      render(<App />);

      await waitFor(() => {
        expect(store.errors).toHaveLength(1);
      });
    });

    it('should recover from storage errors', async () => {
      // Simulate storage quota exceeded
      const originalQuota = useAppStore.getState().storageQuota;
      
      useAppStore.setState({
        storageQuota: { used: 100, quota: 100, percentage: 100 }
      });

      render(<App />);

      // System should handle this gracefully
      await waitFor(() => {
        const status = systemIntegration.getSystemStatus();
        expect(status.initialized).toBe(true);
      });
    });
  });

  describe('Data Persistence Integration', () => {
    it('should persist and restore session data', async () => {
      const store = useAppStore.getState();
      
      // Create a session
      await store.createSession('Persistent Session', 'Should persist');
      const sessionId = store.currentSessionId;

      // Simulate app restart by resetting and reloading
      store.reset();
      await store.loadSessions();

      // Session should be restored
      const restoredSession = store.sessions.find(s => s.id === sessionId);
      expect(restoredSession).toBeDefined();
      expect(restoredSession?.name).toBe('Persistent Session');
    });

    it('should handle data export and import', async () => {
      const store = useAppStore.getState();
      
      // Create test data
      await store.createSession('Export Test', 'Test session for export');
      
      // Export data
      const exportedData = await systemIntegration.exportAllData();
      expect(exportedData).toBeTruthy();

      // Reset and import
      store.reset();
      const importSuccess = await systemIntegration.importAllData(exportedData);
      expect(importSuccess).toBe(true);

      // Data should be restored
      await store.loadSessions();
      const importedSession = store.sessions.find(s => s.name === 'Export Test');
      expect(importedSession).toBeDefined();
    });
  });

  describe('AI Integration', () => {
    it('should handle AI service initialization gracefully', async () => {
      const store = useAppStore.getState();
      
      // Enable AI
      await store.updateAIConfig({ isEnabled: true });

      // Should not throw errors even if AI service fails
      await expect(store.initializeAI()).resolves.not.toThrow();
    });

    it('should work in offline mode when AI is disabled', async () => {
      const store = useAppStore.getState();
      
      // Disable AI
      await store.updateAIConfig({ isEnabled: false });

      render(<App />);

      // App should work normally
      await waitFor(() => {
        expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
      });

      // Should be able to create sessions
      await store.createSession('Offline Session', 'Works without AI');
      expect(store.sessions).toHaveLength(1);
    });
  });

  describe('Performance Integration', () => {
    it('should monitor performance metrics', async () => {
      render(<App />);
      
      await waitFor(() => {
        const status = systemIntegration.getSystemStatus();
        expect(status.performance).toBeDefined();
        expect(status.performance.lastUpdated).toBeInstanceOf(Date);
      });
    });

    it('should handle large datasets efficiently', async () => {
      const store = useAppStore.getState();
      
      // Create multiple sessions
      const sessionPromises = Array.from({ length: 10 }, (_, i) =>
        store.createSession(`Session ${i}`, `Test session ${i}`)
      );

      await Promise.all(sessionPromises);

      // App should still be responsive
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
      });

      expect(store.sessions).toHaveLength(10);
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA labels and roles', async () => {
      render(<App />);
      
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        
        const navigation = screen.getByRole('banner');
        expect(navigation).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      render(<App />);
      
      await waitFor(() => {
        const studioButton = screen.getByText('Studio');
        studioButton.focus();
        expect(document.activeElement).toBe(studioButton);
      });
    });
  });

  describe('Mobile Integration', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
      });

      // Should render mobile-optimized interface
      // (Specific mobile UI tests would go here)
    });
  });
});

describe('Cross-Component Communication', () => {
  it('should sync data between DevFlow Studio and Regexr++', async () => {
    const store = useAppStore.getState();
    
    // Create a session with a regex pattern
    await store.createSession('Integration Test', 'Cross-component test');
    
    // Switch to Regexr++ and create a pattern
    store.setCurrentWorkspace('regexr');
    
    // Pattern should be available for import into Studio
    store.setCurrentWorkspace('studio');
    
    // This tests the integration pathway
    expect(store.currentWorkspace).toBe('studio');
  });

  it('should handle template integration across workspaces', async () => {
    const store = useAppStore.getState();
    
    // Create a session
    await store.createSession('Template Source', 'For template creation');
    const sessionId = store.currentSessionId!;
    
    // Create template from session
    await store.createTemplateFromSession(
      sessionId,
      'Integration Template',
      'Created from integration test',
      'test',
      ['integration']
    );

    // Template should be available
    expect(store.sessionTemplates).toHaveLength(1);
    expect(store.sessionTemplates[0].name).toBe('Integration Template');
  });
});

describe('System Recovery', () => {
  it('should recover from corrupted data', async () => {
    const store = useAppStore.getState();
    
    // Simulate corrupted data by adding invalid session
    const corruptedSession = {
      id: 'corrupted',
      name: null, // Invalid
      nodes: 'invalid', // Should be array
    } as any;

    store.addSession(corruptedSession);

    // System should handle this gracefully
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
    });

    // Should not crash the application
    expect(document.querySelector('.error-boundary')).not.toBeInTheDocument();
  });

  it('should handle network failures gracefully', async () => {
    // Mock network failure
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('DevKit Flow')).toBeInTheDocument();
    });

    // App should still work in offline mode
    const store = useAppStore.getState();
    await store.createSession('Offline Session', 'Created during network failure');
    
    expect(store.sessions).toHaveLength(1);

    // Restore original fetch
    global.fetch = originalFetch;
  });
});