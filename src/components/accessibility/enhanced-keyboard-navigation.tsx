import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Keyboard, 
  Navigation, 
  Focus, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  Info,
  X
} from 'lucide-react';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useAccessibility } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

interface KeyboardShortcutGroup {
  category: string;
  icon: React.ReactNode;
  shortcuts: Array<{
    keys: string[];
    description: string;
    action?: () => void;
    context?: string;
  }>;
}

interface FocusIndicatorProps {
  visible: boolean;
  position: { x: number; y: number; width: number; height: number };
}

interface EnhancedKeyboardNavigationProps {
  showShortcutsDialog?: boolean;
  onCloseShortcuts?: () => void;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({ visible, position }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 border-2 border-blue-500 bg-blue-500/10 rounded-md transition-all duration-200"
      style={{
        left: position.x - 2,
        top: position.y - 2,
        width: position.width + 4,
        height: position.height + 4,
      }}
    >
      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        Focused Element
      </div>
    </div>
  );
};

export const EnhancedKeyboardNavigation: React.FC<EnhancedKeyboardNavigationProps> = ({
  showShortcutsDialog = false,
  onCloseShortcuts
}) => {
  const [focusIndicatorVisible, setFocusIndicatorVisible] = useState(false);
  const [focusPosition, setFocusPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [currentFocusPath, setCurrentFocusPath] = useState<string[]>([]);
  const [navigationMode, setNavigationMode] = useState<'normal' | 'spatial' | 'sequential'>('normal');
  const [announceNavigation, setAnnounceNavigation] = useState(true);

  const { shortcuts, registerFocusableElement, navigateFocus, focusGroup } = useKeyboardNavigation();
  const { announce } = useAccessibility();
  const focusObserverRef = useRef<MutationObserver | null>(null);

  // Enhanced keyboard shortcuts with spatial navigation
  const enhancedShortcuts: KeyboardShortcutGroup[] = [
    {
      category: 'Navigation',
      icon: <Navigation className="h-4 w-4" />,
      shortcuts: [
        {
          keys: ['Tab'],
          description: 'Navigate to next focusable element',
          context: 'Global'
        },
        {
          keys: ['Shift', 'Tab'],
          description: 'Navigate to previous focusable element',
          context: 'Global'
        },
        {
          keys: ['Alt', '1'],
          description: 'Switch to DevFlow Studio',
          context: 'Global'
        },
        {
          keys: ['Alt', '2'],
          description: 'Switch to Regexr++',
          context: 'Global'
        },
        {
          keys: ['Alt', '3'],
          description: 'Open Settings',
          context: 'Global'
        },
        {
          keys: ['Ctrl', 'B'],
          description: 'Toggle Sidebar',
          context: 'Global'
        }
      ]
    },
    {
      category: 'Spatial Navigation',
      icon: <ArrowUp className="h-4 w-4" />,
      shortcuts: [
        {
          keys: ['Arrow Up'],
          description: 'Navigate up in spatial mode',
          context: 'Canvas/Grid'
        },
        {
          keys: ['Arrow Down'],
          description: 'Navigate down in spatial mode',
          context: 'Canvas/Grid'
        },
        {
          keys: ['Arrow Left'],
          description: 'Navigate left in spatial mode',
          context: 'Canvas/Grid'
        },
        {
          keys: ['Arrow Right'],
          description: 'Navigate right in spatial mode',
          context: 'Canvas/Grid'
        },
        {
          keys: ['Ctrl', 'Arrow Keys'],
          description: 'Move focused element',
          context: 'Canvas'
        }
      ]
    },
    {
      category: 'Focus Management',
      icon: <Focus className="h-4 w-4" />,
      shortcuts: [
        {
          keys: ['Alt', 'H'],
          description: 'Focus header navigation',
          context: 'Global'
        },
        {
          keys: ['Alt', 'S'],
          description: 'Focus sidebar',
          context: 'Global'
        },
        {
          keys: ['Alt', 'M'],
          description: 'Focus main content',
          context: 'Global'
        },
        {
          keys: ['Enter'],
          description: 'Skip to main content',
          context: 'Skip links'
        },
        {
          keys: ['F6'],
          description: 'Cycle through page regions',
          context: 'Global'
        }
      ]
    },
    {
      category: 'Accessibility',
      icon: <Eye className="h-4 w-4" />,
      shortcuts: [
        {
          keys: ['Ctrl', 'Alt', 'F'],
          description: 'Toggle focus indicator',
          action: () => setFocusIndicatorVisible(!focusIndicatorVisible),
          context: 'Global'
        },
        {
          keys: ['Ctrl', 'Alt', 'A'],
          description: 'Toggle navigation announcements',
          action: () => setAnnounceNavigation(!announceNavigation),
          context: 'Global'
        },
        {
          keys: ['Ctrl', 'Alt', 'N'],
          description: 'Cycle navigation mode',
          action: () => {
            const modes: typeof navigationMode[] = ['normal', 'spatial', 'sequential'];
            const currentIndex = modes.indexOf(navigationMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setNavigationMode(nextMode);
            announce(`Navigation mode changed to ${nextMode}`, 'polite');
          },
          context: 'Global'
        },
        {
          keys: ['Ctrl', '?'],
          description: 'Show keyboard shortcuts',
          context: 'Global'
        }
      ]
    }
  ];

  // Track focus changes and update focus indicator
  const updateFocusIndicator = useCallback((element: Element) => {
    if (!focusIndicatorVisible) return;

    const rect = element.getBoundingClientRect();
    setFocusPosition({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });

    // Build focus path for screen readers
    const path: string[] = [];
    let current = element;
    while (current && current !== document.body) {
      const role = current.getAttribute('role');
      const label = current.getAttribute('aria-label') || 
                   current.getAttribute('title') ||
                   (current as HTMLElement).innerText?.slice(0, 20);
      
      if (role || label) {
        path.unshift(role ? `${role}: ${label || ''}` : label || '');
      }
      current = current.parentElement!;
    }
    setCurrentFocusPath(path);

    if (announceNavigation && path.length > 0) {
      announce(`Focused: ${path[path.length - 1]}`, 'polite');
    }
  }, [focusIndicatorVisible, announceNavigation, announce]);

  // Spatial navigation implementation
  const spatialNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentElement = document.activeElement as HTMLElement;
    if (!currentElement || !focusableElements.includes(currentElement)) return;

    const currentRect = currentElement.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    // Find the best candidate in the specified direction
    let bestCandidate: HTMLElement | null = null;
    let bestDistance = Infinity;

    focusableElements.forEach(element => {
      if (element === currentElement) return;

      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      let isInDirection = false;
      let distance = 0;

      switch (direction) {
        case 'up':
          isInDirection = center.y < currentCenter.y;
          distance = Math.sqrt(
            Math.pow(center.x - currentCenter.x, 2) + 
            Math.pow(Math.max(0, currentCenter.y - center.y), 2)
          );
          break;
        case 'down':
          isInDirection = center.y > currentCenter.y;
          distance = Math.sqrt(
            Math.pow(center.x - currentCenter.x, 2) + 
            Math.pow(Math.max(0, center.y - currentCenter.y), 2)
          );
          break;
        case 'left':
          isInDirection = center.x < currentCenter.x;
          distance = Math.sqrt(
            Math.pow(Math.max(0, currentCenter.x - center.x), 2) + 
            Math.pow(center.y - currentCenter.y, 2)
          );
          break;
        case 'right':
          isInDirection = center.x > currentCenter.x;
          distance = Math.sqrt(
            Math.pow(Math.max(0, center.x - currentCenter.x), 2) + 
            Math.pow(center.y - currentCenter.y, 2)
          );
          break;
      }

      if (isInDirection && distance < bestDistance) {
        bestCandidate = element;
        bestDistance = distance;
      }
    });

    if (bestCandidate) {
      bestCandidate.focus();
      updateFocusIndicator(bestCandidate);
    }
  }, [updateFocusIndicator]);

  // Enhanced keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if typing in input elements
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    // Handle spatial navigation
    if (navigationMode === 'spatial' && !event.ctrlKey && !event.altKey) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          spatialNavigate('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          spatialNavigate('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          spatialNavigate('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          spatialNavigate('right');
          break;
      }
    }

    // Handle enhanced shortcuts
    enhancedShortcuts.forEach(group => {
      group.shortcuts.forEach(shortcut => {
        if (shortcut.action) {
          const keys = shortcut.keys;
          const matchesKey = keys.includes(event.key) || 
                           (keys.includes('Arrow Keys') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key));
          
          const matchesModifiers = 
            (keys.includes('Ctrl') ? event.ctrlKey : !event.ctrlKey || keys.includes('Ctrl')) &&
            (keys.includes('Alt') ? event.altKey : !event.altKey || keys.includes('Alt')) &&
            (keys.includes('Shift') ? event.shiftKey : !event.shiftKey || keys.includes('Shift'));

          if (matchesKey && matchesModifiers) {
            event.preventDefault();
            shortcut.action();
          }
        }
      });
    });
  }, [navigationMode, spatialNavigate, enhancedShortcuts]);

  // Set up focus tracking
  useEffect(() => {
    const handleFocusChange = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        updateFocusIndicator(event.target);
      }
    };

    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('keydown', handleKeyDown);

    // Set up mutation observer to track DOM changes
    focusObserverRef.current = new MutationObserver(() => {
      if (document.activeElement instanceof Element) {
        updateFocusIndicator(document.activeElement);
      }
    });

    focusObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('keydown', handleKeyDown);
      if (focusObserverRef.current) {
        focusObserverRef.current.disconnect();
      }
    };
  }, [updateFocusIndicator, handleKeyDown]);

  return (
    <>
      {/* Focus Indicator */}
      <FocusIndicator visible={focusIndicatorVisible} position={focusPosition} />

      {/* Navigation Status */}
      {(focusIndicatorVisible || navigationMode !== 'normal') && (
        <div className="fixed bottom-4 right-4 z-40 bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Keyboard className="h-4 w-4" />
            <span>Navigation: {navigationMode}</span>
            {focusIndicatorVisible && (
              <Badge variant="secondary" className="text-xs">
                <Eye className="h-2 w-2 mr-1" />
                Focus Visible
              </Badge>
            )}
            {!announceNavigation && (
              <Badge variant="outline" className="text-xs">
                <VolumeX className="h-2 w-2 mr-1" />
                Silent
              </Badge>
            )}
          </div>
          {currentFocusPath.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentFocusPath.join(' → ')}
            </div>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsDialog && (
        <Dialog open={showShortcutsDialog} onOpenChange={onCloseShortcuts}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5" />
                    Keyboard Shortcuts
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete list of keyboard shortcuts and navigation options
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onCloseShortcuts}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Navigation Mode Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Navigation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Navigation Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Current mode: {navigationMode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['normal', 'spatial', 'sequential'].map((mode) => (
                        <Button
                          key={mode}
                          variant={navigationMode === mode ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNavigationMode(mode as typeof navigationMode)}
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Focus Indicator</p>
                      <p className="text-sm text-muted-foreground">
                        Visual highlight for focused elements
                      </p>
                    </div>
                    <Button
                      variant={focusIndicatorVisible ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFocusIndicatorVisible(!focusIndicatorVisible)}
                    >
                      {focusIndicatorVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Navigation Announcements</p>
                      <p className="text-sm text-muted-foreground">
                        Audio announcements for screen readers
                      </p>
                    </div>
                    <Button
                      variant={announceNavigation ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAnnounceNavigation(!announceNavigation)}
                    >
                      {announceNavigation ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shortcut Groups */}
              {enhancedShortcuts.map((group, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {group.icon}
                      {group.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, shortcutIndex) => (
                        <div key={shortcutIndex} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{shortcut.description}</p>
                            {shortcut.context && (
                              <p className="text-xs text-muted-foreground">
                                Context: {shortcut.context}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <Badge key={keyIndex} variant="outline" className="font-mono text-xs">
                                {key}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Navigation Mode Explanations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Navigation Modes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Normal Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Standard tab-based navigation following DOM order. Best for most users.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Spatial Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Navigate using arrow keys based on visual position. Useful for canvas-based interfaces.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Sequential Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Strict sequential navigation with enhanced focus management. Best for screen reader users.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EnhancedKeyboardNavigation;