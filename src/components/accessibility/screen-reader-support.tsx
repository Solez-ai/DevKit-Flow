import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Settings, 
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Navigation,
  FileText,
  Code,
  Zap
} from 'lucide-react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

interface LiveRegion {
  id: string;
  priority: 'polite' | 'assertive' | 'off';
  content: string;
  timestamp: Date;
  category: 'navigation' | 'status' | 'error' | 'success' | 'progress';
}

interface ScreenReaderContext {
  currentElement: string;
  elementType: string;
  elementRole: string;
  elementState: string;
  parentContext: string[];
  landmarks: string[];
  headingLevel?: number;
}

interface ScreenReaderSupportProps {
  enabled?: boolean;
  verboseMode?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export const ScreenReaderSupport: React.FC<ScreenReaderSupportProps> = ({
  enabled = true,
  verboseMode = false,
  onToggle
}) => {
  const [liveRegions, setLiveRegions] = useState<LiveRegion[]>([]);
  const [currentContext, setCurrentContext] = useState<ScreenReaderContext | null>(null);
  const [isScreenReaderDetected, setIsScreenReaderDetected] = useState(false);
  const [announceProgress, setAnnounceProgress] = useState(true);
  const [announceNavigation, setAnnounceNavigation] = useState(true);
  const [announceStatusEnabled, setAnnounceStatusEnabled] = useState(true);

  const { announce } = useAccessibility();
  const contextUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  const progressAnnouncementRef = useRef<NodeJS.Timeout>();

  // Detect screen reader presence
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReaderCSS = window.getComputedStyle(document.body).getPropertyValue('speak') !== '';
      const hasAriaLive = document.querySelectorAll('[aria-live]').length > 0;
      const hasScreenReaderUA = /JAWS|NVDA|ORCA|VoiceOver|TalkBack/i.test(navigator.userAgent);
      
      // Check for Windows High Contrast mode (often used with screen readers)
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Check for reduced motion (often used with assistive technologies)
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const detected = hasScreenReaderCSS || hasAriaLive || hasScreenReaderUA || hasHighContrast;
      setIsScreenReaderDetected(detected);

      if (detected && enabled) {
        announce('Screen reader support activated. DevKit Flow is optimized for accessibility.', 'polite');
      }
    };

    detectScreenReader();
    
    // Re-check when media queries change
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    highContrastQuery.addEventListener('change', detectScreenReader);
    reducedMotionQuery.addEventListener('change', detectScreenReader);

    return () => {
      highContrastQuery.removeEventListener('change', detectScreenReader);
      reducedMotionQuery.removeEventListener('change', detectScreenReader);
    };
  }, [enabled, announce]);

  // Add live region for announcements
  const addLiveRegion = useCallback((
    content: string, 
    priority: LiveRegion['priority'] = 'polite',
    category: LiveRegion['category'] = 'status'
  ) => {
    const region: LiveRegion = {
      id: `live-${Date.now()}`,
      priority,
      content,
      timestamp: new Date(),
      category
    };

    setLiveRegions(prev => [...prev.slice(-9), region]); // Keep last 10 regions

    // Clean up old regions after 30 seconds
    setTimeout(() => {
      setLiveRegions(prev => prev.filter(r => r.id !== region.id));
    }, 30000);
  }, []);

  // Enhanced context tracking
  const updateContext = useCallback((element: Element) => {
    if (!enabled) return;

    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const ariaDescribedBy = element.getAttribute('aria-describedby') || '';
    const title = element.getAttribute('title') || '';
    
    // Build parent context
    const parentContext: string[] = [];
    let current = element.parentElement;
    while (current && current !== document.body) {
      const parentRole = current.getAttribute('role');
      const parentLabel = current.getAttribute('aria-label') || current.getAttribute('title');
      
      if (parentRole || parentLabel) {
        parentContext.unshift(parentRole ? `${parentRole}: ${parentLabel || ''}` : parentLabel || '');
      }
      
      // Stop at landmark elements
      if (['main', 'navigation', 'banner', 'contentinfo', 'complementary', 'region'].includes(parentRole || '')) {
        break;
      }
      
      current = current.parentElement;
    }

    // Find landmarks
    const landmarks = Array.from(document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"], [role="region"], main, nav, header, footer, aside'))
      .map(landmark => {
        const landmarkRole = landmark.getAttribute('role') || landmark.tagName.toLowerCase();
        const landmarkLabel = landmark.getAttribute('aria-label') || landmark.getAttribute('title') || '';
        return `${landmarkRole}${landmarkLabel ? `: ${landmarkLabel}` : ''}`;
      });

    // Get heading level
    const headingMatch = tagName.match(/^h([1-6])$/);
    const headingLevel = headingMatch ? parseInt(headingMatch[1]) : undefined;

    // Determine element state
    const states: string[] = [];
    if (element.hasAttribute('aria-expanded')) {
      states.push(element.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed');
    }
    if (element.hasAttribute('aria-selected')) {
      states.push(element.getAttribute('aria-selected') === 'true' ? 'selected' : 'not selected');
    }
    if (element.hasAttribute('aria-checked')) {
      const checked = element.getAttribute('aria-checked');
      states.push(checked === 'true' ? 'checked' : checked === 'false' ? 'unchecked' : 'mixed');
    }
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      states.push('disabled');
    }

    const context: ScreenReaderContext = {
      currentElement: ariaLabel || title || (element as HTMLElement).innerText?.slice(0, 50) || tagName,
      elementType: tagName,
      elementRole: role || tagName,
      elementState: states.join(', '),
      parentContext,
      landmarks,
      headingLevel
    };

    setCurrentContext(context);

    // Announce context changes if verbose mode is enabled
    if (verboseMode && announceNavigation) {
      const contextDescription = [
        context.elementRole,
        context.currentElement,
        context.elementState
      ].filter(Boolean).join(', ');

      if (contextUpdateTimeoutRef.current) {
        clearTimeout(contextUpdateTimeoutRef.current);
      }

      contextUpdateTimeoutRef.current = setTimeout(() => {
        addLiveRegion(contextDescription, 'polite', 'navigation');
      }, 100);
    }
  }, [enabled, verboseMode, announceNavigation, addLiveRegion]);

  // Progress announcement helper
  const announceProgressUpdate = useCallback((
    label: string, 
    current: number, 
    total: number, 
    unit: string = 'items'
  ) => {
    if (!announceProgress) return;

    const percentage = Math.round((current / total) * 100);
    const message = `${label}: ${current} of ${total} ${unit} complete, ${percentage}%`;

    // Throttle progress announcements
    if (progressAnnouncementRef.current) {
      clearTimeout(progressAnnouncementRef.current);
    }

    progressAnnouncementRef.current = setTimeout(() => {
      addLiveRegion(message, 'polite', 'progress');
    }, 1000);
  }, [announceProgress, addLiveRegion]);

  // Status announcement helper
  const announceStatus = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    if (!announceStatusEnabled) return;

    const priority = type === 'error' ? 'assertive' : 'polite';
    const category = type === 'error' ? 'error' : type === 'success' ? 'success' : 'status';
    
    addLiveRegion(`${type}: ${message}`, priority, category);
  }, [announceStatusEnabled, addLiveRegion]);

  // Set up focus tracking
  useEffect(() => {
    if (!enabled) return;

    const handleFocusChange = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        updateContext(event.target);
      }
    };

    document.addEventListener('focusin', handleFocusChange);
    return () => document.removeEventListener('focusin', handleFocusChange);
  }, [enabled, updateContext]);

  // Expose methods globally for other components to use
  useEffect(() => {
    if (enabled) {
      (window as any).screenReaderSupport = {
        announceProgress: announceProgressUpdate,
        announceStatus,
        addLiveRegion
      };
    }

    return () => {
      if ((window as any).screenReaderSupport) {
        delete (window as any).screenReaderSupport;
      }
    };
  }, [enabled, announceProgressUpdate, announceStatus, addLiveRegion]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (contextUpdateTimeoutRef.current) {
        clearTimeout(contextUpdateTimeoutRef.current);
      }
      if (progressAnnouncementRef.current) {
        clearTimeout(progressAnnouncementRef.current);
      }
    };
  }, []);

  const getCategoryIcon = (category: LiveRegion['category']) => {
    switch (category) {
      case 'navigation': return <Navigation className="h-3 w-3" />;
      case 'status': return <Info className="h-3 w-3" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'success': return <CheckCircle className="h-3 w-3" />;
      case 'progress': return <Clock className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: LiveRegion['category']) => {
    switch (category) {
      case 'navigation': return 'text-blue-600';
      case 'status': return 'text-gray-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'progress': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Live Regions for Screen Reader Announcements */}
      <div className="sr-only">
        {liveRegions.map((region) => (
          <div
            key={region.id}
            aria-live={region.priority}
            aria-atomic="true"
            role={region.category === 'error' ? 'alert' : region.category === 'status' ? 'status' : undefined}
          >
            {region.content}
          </div>
        ))}
      </div>

      {/* Screen Reader Status Indicator (visible for debugging) */}
      {isScreenReaderDetected && (
        <div className="fixed top-4 right-4 z-50 bg-background border rounded-lg p-3 shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">Screen Reader Active</span>
          </div>
          
          {currentContext && (
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Current: </span>
                <span>{currentContext.currentElement}</span>
              </div>
              <div>
                <span className="font-medium">Role: </span>
                <span>{currentContext.elementRole}</span>
              </div>
              {currentContext.elementState && (
                <div>
                  <span className="font-medium">State: </span>
                  <span>{currentContext.elementState}</span>
                </div>
              )}
              {currentContext.headingLevel && (
                <div>
                  <span className="font-medium">Heading: </span>
                  <span>Level {currentContext.headingLevel}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnnounceNavigation(!announceNavigation)}
              className="text-xs"
            >
              {announceNavigation ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              Nav
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnnounceProgress(!announceProgress)}
              className="text-xs"
            >
              {announceProgress ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnnounceStatusEnabled(!announceStatusEnabled)}
              className="text-xs"
            >
              {announceStatusEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              Status
            </Button>
          </div>
        </div>
      )}

      {/* Recent Announcements (for debugging) */}
      {liveRegions.length > 0 && isScreenReaderDetected && (
        <div className="fixed bottom-4 right-4 z-40 bg-background border rounded-lg p-3 shadow-lg max-w-md max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium text-sm">Recent Announcements</span>
          </div>
          <div className="space-y-2">
            {liveRegions.slice(-5).map((region) => (
              <div key={region.id} className="text-xs border-l-2 border-muted pl-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className={getCategoryColor(region.category)}>
                    {getCategoryIcon(region.category)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {region.priority}
                  </Badge>
                  <span className="text-muted-foreground">
                    {region.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{region.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic Structure Helpers */}
      <div className="sr-only">
        <h1>DevKit Flow - Developer Productivity Workspace</h1>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="#devflow-studio">DevFlow Studio</a></li>
            <li><a href="#regexr-plus">Regexr++</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </div>

      {/* Landmark Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="false">
        {currentContext?.landmarks.length && (
          <div>
            Available landmarks: {currentContext.landmarks.join(', ')}
          </div>
        )}
      </div>

      {/* Progress Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {/* Progress updates will be announced here */}
      </div>

      {/* Error Announcements */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {/* Error messages will be announced here */}
      </div>
    </>
  );
};

// Helper component for announcing progress in other components
export const ProgressAnnouncer: React.FC<{
  label: string;
  current: number;
  total: number;
  unit?: string;
}> = ({ label, current, total, unit = 'items' }) => {
  useEffect(() => {
    if ((window as any).screenReaderSupport?.announceProgress) {
      (window as any).screenReaderSupport.announceProgress(label, current, total, unit);
    }
  }, [label, current, total, unit]);

  return null;
};

// Helper component for announcing status changes
export const StatusAnnouncer: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}> = ({ message, type = 'info' }) => {
  useEffect(() => {
    if ((window as any).screenReaderSupport?.announceStatus) {
      (window as any).screenReaderSupport.announceStatus(message, type);
    }
  }, [message, type]);

  return null;
};

export default ScreenReaderSupport;