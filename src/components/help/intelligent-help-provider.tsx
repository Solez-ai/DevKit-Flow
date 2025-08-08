import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AIContextualHelpPanel } from './ai-contextual-help-panel';
import { useAIService } from '@/hooks/use-ai-service';

interface HelpContext {
  feature: string;
  component: string;
  userAction?: string;
  currentData?: any;
  sessionContext?: {
    nodeCount: number;
    completedTasks: number;
    currentWorkspace: 'studio' | 'regexr';
    recentActions: string[];
  };
}

interface HelpState {
  isVisible: boolean;
  context: HelpContext | null;
  position: 'floating' | 'sidebar' | 'modal';
  autoShow: boolean;
  userPreferences: {
    showOnHover: boolean;
    showOnFocus: boolean;
    autoHideDelay: number;
    preferredPosition: 'floating' | 'sidebar' | 'modal';
  };
}

interface IntelligentHelpContextType {
  // State
  helpState: HelpState;
  
  // Actions
  showHelp: (context: HelpContext, options?: { position?: HelpState['position']; autoHide?: boolean }) => void;
  hideHelp: () => void;
  toggleHelp: () => void;
  updateContext: (context: Partial<HelpContext>) => void;
  
  // Smart features
  registerHelpTrigger: (element: HTMLElement, context: HelpContext) => () => void;
  trackUserAction: (action: string, context?: Partial<HelpContext>) => void;
  setUserPreferences: (preferences: Partial<HelpState['userPreferences']>) => void;
  
  // Progressive disclosure
  requestDetailedHelp: (feature: string) => void;
  suggestNextSteps: (currentContext: HelpContext) => Promise<string[]>;
}

const IntelligentHelpContext = createContext<IntelligentHelpContextType | null>(null);

export const useIntelligentHelp = () => {
  const context = useContext(IntelligentHelpContext);
  if (!context) {
    throw new Error('useIntelligentHelp must be used within an IntelligentHelpProvider');
  }
  return context;
};

interface IntelligentHelpProviderProps {
  children: React.ReactNode;
  defaultPreferences?: Partial<HelpState['userPreferences']>;
}

export const IntelligentHelpProvider: React.FC<IntelligentHelpProviderProps> = ({
  children,
  defaultPreferences = {}
}) => {
  const [helpState, setHelpState] = useState<HelpState>({
    isVisible: false,
    context: null,
    position: 'floating',
    autoShow: false,
    userPreferences: {
      showOnHover: false,
      showOnFocus: true,
      autoHideDelay: 5000,
      preferredPosition: 'floating',
      ...defaultPreferences
    }
  });

  const [recentActions, setRecentActions] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState<{
    nodeCount: number;
    completedTasks: number;
    currentWorkspace: 'studio' | 'regexr';
  }>({
    nodeCount: 0,
    completedTasks: 0,
    currentWorkspace: 'studio'
  });

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const helpTriggersRef = useRef<Map<HTMLElement, { context: HelpContext; cleanup: () => void }>>(new Map());

  // Auto-hide help after delay
  const scheduleAutoHide = useCallback((delay?: number) => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
    
    const hideDelay = delay ?? helpState.userPreferences.autoHideDelay;
    if (hideDelay > 0) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setHelpState(prev => ({ ...prev, isVisible: false }));
      }, hideDelay);
    }
  }, [helpState.userPreferences.autoHideDelay]);

  // Show contextual help
  const showHelp = useCallback((
    context: HelpContext, 
    options: { position?: HelpState['position']; autoHide?: boolean } = {}
  ) => {
    const position = options.position ?? helpState.userPreferences.preferredPosition;
    
    setHelpState(prev => ({
      ...prev,
      isVisible: true,
      context: {
        ...context,
        sessionContext: {
          ...sessionStats,
          recentActions: recentActions.slice(-5)
        }
      },
      position
    }));

    if (options.autoHide !== false) {
      scheduleAutoHide();
    }
  }, [helpState.userPreferences.preferredPosition, sessionStats, recentActions, scheduleAutoHide]);

  // Hide help
  const hideHelp = useCallback(() => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
    setHelpState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Toggle help visibility
  const toggleHelp = useCallback(() => {
    if (helpState.isVisible) {
      hideHelp();
    } else if (helpState.context) {
      showHelp(helpState.context);
    }
  }, [helpState.isVisible, helpState.context, showHelp, hideHelp]);

  // Update current context
  const updateContext = useCallback((contextUpdate: Partial<HelpContext>) => {
    setHelpState(prev => ({
      ...prev,
      context: prev.context ? { ...prev.context, ...contextUpdate } : null
    }));
  }, []);

  // Register help trigger for an element
  const registerHelpTrigger = useCallback((element: HTMLElement, context: HelpContext) => {
    const handleMouseEnter = () => {
      if (helpState.userPreferences.showOnHover) {
        showHelp(context, { autoHide: true });
      }
    };

    const handleFocus = () => {
      if (helpState.userPreferences.showOnFocus) {
        showHelp(context, { autoHide: true });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        showHelp(context);
      }
    };

    // Add event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('keydown', handleKeyDown);

    const cleanup = () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('keydown', handleKeyDown);
    };

    // Store the trigger
    helpTriggersRef.current.set(element, { context, cleanup });

    // Return cleanup function
    return cleanup;
  }, [helpState.userPreferences, showHelp]);

  // Track user actions for better context
  const trackUserAction = useCallback((action: string, context?: Partial<HelpContext>) => {
    setRecentActions(prev => [...prev.slice(-9), action]); // Keep last 10 actions
    
    if (context) {
      updateContext(context);
    }

    // Update session stats based on action
    if (action.includes('node-created')) {
      setSessionStats(prev => ({ ...prev, nodeCount: prev.nodeCount + 1 }));
    } else if (action.includes('task-completed')) {
      setSessionStats(prev => ({ ...prev, completedTasks: prev.completedTasks + 1 }));
    } else if (action.includes('workspace-switched')) {
      const workspace = action.includes('studio') ? 'studio' : 'regexr';
      setSessionStats(prev => ({ ...prev, currentWorkspace: workspace }));
    }
  }, [updateContext]);

  // Set user preferences
  const setUserPreferences = useCallback((preferences: Partial<HelpState['userPreferences']>) => {
    setHelpState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  }, []);

  // Request detailed help (opens comprehensive help system)
  const requestDetailedHelp = useCallback((feature: string) => {
    // This would integrate with the comprehensive help system
    console.log('Requesting detailed help for:', feature);
    // Implementation would open the comprehensive help modal
  }, []);

  // AI-powered next steps suggestions
  const suggestNextSteps = useCallback(async (currentContext: HelpContext): Promise<string[]> => {
    if (!aiEnabled) {
      return [
        'Explore related features',
        'Check keyboard shortcuts',
        'View documentation'
      ];
    }

    try {
      const prompt = `Based on the current context in DevKit Flow, suggest 3-5 logical next steps for the user:

Current Context:
- Feature: ${currentContext.feature}
- Component: ${currentContext.component}
- User Action: ${currentContext.userAction || 'viewing'}
- Recent Actions: ${recentActions.slice(-3).join(', ')}
- Session Stats: ${JSON.stringify(sessionStats)}

Provide suggestions as a JSON array of strings, each being a concise, actionable next step.
Focus on workflow progression and productivity improvements.

Example: ["Create a new node", "Connect related components", "Export your progress"]`;

      const response = await generateResponse(prompt, 'next-steps');
      const suggestions = JSON.parse(response);
      
      if (Array.isArray(suggestions)) {
        return suggestions.slice(0, 5); // Limit to 5 suggestions
      }
    } catch (error) {
      console.error('Failed to generate next steps:', error);
    }

    // Fallback suggestions
    return [
      'Explore related features',
      'Use keyboard shortcuts for efficiency',
      'Save your current progress'
    ];
  }, [aiEnabled, generateResponse, recentActions, sessionStats]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // F1 - Show help for current context
      if (event.key === 'F1') {
        event.preventDefault();
        if (helpState.context) {
          showHelp(helpState.context);
        }
      }
      
      // Ctrl+Shift+H - Toggle help
      if (event.key === 'H' && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        toggleHelp();
      }
      
      // Escape - Hide help
      if (event.key === 'Escape' && helpState.isVisible) {
        hideHelp();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [helpState.context, helpState.isVisible, showHelp, toggleHelp, hideHelp]);

  // Cleanup help triggers on unmount
  useEffect(() => {
    return () => {
      helpTriggersRef.current.forEach(({ cleanup }) => cleanup());
      helpTriggersRef.current.clear();
      
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: IntelligentHelpContextType = {
    helpState,
    showHelp,
    hideHelp,
    toggleHelp,
    updateContext,
    registerHelpTrigger,
    trackUserAction,
    setUserPreferences,
    requestDetailedHelp,
    suggestNextSteps
  };

  return (
    <IntelligentHelpContext.Provider value={contextValue}>
      {children}
      
      {/* Render the help panel */}
      {helpState.isVisible && helpState.context && (
        <AIContextualHelpPanel
          context={helpState.context}
          isVisible={helpState.isVisible}
          onClose={hideHelp}
          position={helpState.position}
          onExpand={() => {
            setHelpState(prev => ({
              ...prev,
              position: prev.position === 'floating' ? 'sidebar' : 'floating'
            }));
          }}
        />
      )}
    </IntelligentHelpContext.Provider>
  );
};

export default IntelligentHelpProvider;