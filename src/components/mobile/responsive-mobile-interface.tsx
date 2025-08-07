import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Menu, 
  X, 
  Smartphone, 
  Tablet, 
  Monitor,
  Fingerprint,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Navigation,
  Settings,
  Eye,
  Vibrate,
  Volume2
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useWorkspace } from '@/hooks/use-app-store';
import { cn } from '@/lib/utils';

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  duration: number;
  fingers: number;
}

interface MobileViewport {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
  isFullscreen: boolean;
}

interface ResponsiveMobileInterfaceProps {
  children: React.ReactNode;
  enableGestures?: boolean;
  enableVibration?: boolean;
  adaptiveLayout?: boolean;
}

export const ResponsiveMobileInterface: React.FC<ResponsiveMobileInterfaceProps> = ({
  children,
  enableGestures = true,
  enableVibration = true,
  adaptiveLayout = true
}) => {
  const [viewport, setViewport] = useState<MobileViewport>({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    devicePixelRatio: window.devicePixelRatio || 1,
    isFullscreen: false
  });
  const [currentGesture, setCurrentGesture] = useState<TouchGesture | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState(true);
  const [gestureHints, setGestureHints] = useState(true);

  const { isMobile, isTablet, touchSupported } = useMobile();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gestureTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Update viewport on resize and orientation change
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        devicePixelRatio: window.devicePixelRatio || 1,
        isFullscreen: document.fullscreenElement !== null
      });
    };

    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    document.addEventListener('fullscreenchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      document.removeEventListener('fullscreenchange', updateViewport);
    };
  }, []);

  // Haptic feedback helper
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (enableVibration && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [enableVibration]);

  // Touch gesture recognition
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableGestures || !touchSupported) return;

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Long press detection
    gestureTimeoutRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        const gesture: TouchGesture = {
          type: 'long-press',
          startX: touchStartRef.current.x,
          startY: touchStartRef.current.y,
          duration: Date.now() - touchStartRef.current.time,
          fingers: event.touches.length
        };
        setCurrentGesture(gesture);
        handleGesture(gesture);
        vibrate(100);
      }
    }, 500);
  }, [enableGestures, touchSupported, vibrate]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enableGestures || !touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too much
    if (distance > 10 && gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }

    // Handle pinch-to-zoom
    if (event.touches.length === 2) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Simple zoom implementation (would need more sophisticated handling in production)
      const newZoom = Math.max(0.5, Math.min(3, zoomLevel * (distance / 200)));
      setZoomLevel(newZoom);
    }
  }, [enableGestures, zoomLevel]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enableGestures || !touchStartRef.current) return;

    const endTime = Date.now();
    const duration = endTime - touchStartRef.current.time;
    
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }

    // Only process if not a long press
    if (duration < 500) {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let gesture: TouchGesture;

      if (distance < 10) {
        // Tap or double-tap
        gesture = {
          type: 'tap',
          startX: touchStartRef.current.x,
          startY: touchStartRef.current.y,
          endX: touch.clientX,
          endY: touch.clientY,
          duration,
          fingers: 1
        };
      } else {
        // Swipe
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        gesture = {
          type: 'swipe',
          startX: touchStartRef.current.x,
          startY: touchStartRef.current.y,
          endX: touch.clientX,
          endY: touch.clientY,
          duration,
          fingers: 1
        };
      }

      setCurrentGesture(gesture);
      handleGesture(gesture);
      
      if (touchFeedback) {
        vibrate(25);
      }
    }

    touchStartRef.current = null;
  }, [enableGestures, touchFeedback, vibrate]);

  // Handle recognized gestures
  const handleGesture = useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'swipe':
        if (!gesture.endX || !gesture.endY) return;
        
        const deltaX = gesture.endX - gesture.startX;
        const deltaY = gesture.endY - gesture.startY;
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
        if (isHorizontal) {
          if (deltaX > 50) {
            // Swipe right - open navigation
            setIsNavigationOpen(true);
          } else if (deltaX < -50) {
            // Swipe left - close navigation
            setIsNavigationOpen(false);
          }
        } else {
          if (deltaY > 50) {
            // Swipe down - could trigger refresh or other action
            console.log('Swipe down detected');
          } else if (deltaY < -50) {
            // Swipe up - could show more options
            console.log('Swipe up detected');
          }
        }
        break;
        
      case 'long-press':
        // Show context menu or additional options
        console.log('Long press detected at', gesture.startX, gesture.startY);
        break;
        
      case 'double-tap':
        // Toggle zoom or other action
        setZoomLevel(zoomLevel === 1 ? 2 : 1);
        break;
    }
  }, [zoomLevel]);

  // Set up touch event listeners
  useEffect(() => {
    if (!enableGestures || !touchSupported || !containerRef.current) return;

    const container = containerRef.current;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableGestures, touchSupported, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Adaptive layout classes
  const getLayoutClasses = () => {
    const classes = ['mobile-interface'];
    
    if (isMobile) classes.push('mobile-layout');
    if (isTablet) classes.push('tablet-layout');
    if (viewport.orientation === 'landscape') classes.push('landscape');
    if (viewport.orientation === 'portrait') classes.push('portrait');
    if (touchSupported) classes.push('touch-enabled');
    if (viewport.isFullscreen) classes.push('fullscreen');
    
    return classes.join(' ');
  };

  // Mobile navigation component
  const MobileNavigation = () => (
    <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DF</span>
              </div>
              <span className="font-bold">DevKit Flow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNavigationOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-4">
            <Tabs value={currentWorkspace} onValueChange={(value) => setCurrentWorkspace(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="studio">Studio</TabsTrigger>
                <TabsTrigger value="regexr">Regexr++</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 space-y-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Device Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Screen:</span>
                      <span>{viewport.width}×{viewport.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orientation:</span>
                      <span>{viewport.orientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pixel Ratio:</span>
                      <span>{viewport.devicePixelRatio}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Touch:</span>
                      <span>{touchSupported ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>

                {gestureHints && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Gesture className="h-4 w-4" />
                        Gesture Hints
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>• Swipe right to open menu</div>
                      <div>• Swipe left to close menu</div>
                      <div>• Long press for context menu</div>
                      <div>• Pinch to zoom canvas</div>
                      <div>• Double tap to reset zoom</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </Tabs>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Mobile Settings</span>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Touch Feedback</span>
                <Button
                  variant={touchFeedback ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTouchFeedback(!touchFeedback)}
                >
                  {touchFeedback ? <Vibrate className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs">Gesture Hints</span>
                <Button
                  variant={gestureHints ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGestureHints(!gestureHints)}
                >
                  {gestureHints ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Mobile toolbar
  const MobileToolbar = () => (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b p-2 flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsNavigationOpen(true)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {isMobile ? <Smartphone className="h-3 w-3 mr-1" /> : <Tablet className="h-3 w-3 mr-1" />}
          {viewport.orientation}
        </Badge>
        
        {zoomLevel !== 1 && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(zoomLevel * 100)}%
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomLevel(1)}
          disabled={zoomLevel === 1}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Gesture indicator
  const GestureIndicator = () => {
    if (!currentGesture || !gestureHints) return null;

    return (
      <div className="fixed bottom-4 left-4 z-50 bg-background border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <Fingerprint className="h-3 w-3" />
          <span>{currentGesture.type}</span>
          {currentGesture.fingers > 1 && (
            <Badge variant="outline" className="text-xs">
              {currentGesture.fingers} fingers
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (!isMobile && !isTablet) {
    return <div className={getLayoutClasses()}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(getLayoutClasses(), 'relative overflow-hidden')}
      style={{
        transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        transformOrigin: 'top left',
        minHeight: '100vh'
      }}
    >
      <MobileToolbar />
      <MobileNavigation />
      
      <div 
        className="pt-16 pb-4 px-2"
        style={{ 
          minHeight: `${viewport.height}px`,
          width: '100%'
        }}
      >
        {children}
      </div>
      
      <GestureIndicator />

      {/* Touch target enhancement for small elements */}
      <style jsx global>{`
        .mobile-interface button,
        .mobile-interface [role="button"],
        .mobile-interface input,
        .mobile-interface select,
        .mobile-interface textarea {
          min-height: 44px;
          min-width: 44px;
        }
        
        .mobile-interface .touch-enabled {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        .mobile-interface.portrait {
          --mobile-sidebar-width: 100%;
        }
        
        .mobile-interface.landscape {
          --mobile-sidebar-width: 320px;
        }
        
        @media (max-width: 768px) {
          .mobile-interface .desktop-only {
            display: none !important;
          }
          
          .mobile-interface .mobile-hidden {
            display: none !important;
          }
          
          .mobile-interface .mobile-stack {
            flex-direction: column !important;
          }
          
          .mobile-interface .mobile-full-width {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for mobile-specific functionality
export const useMobileInterface = () => {
  const { isMobile, isTablet, touchSupported } = useMobile();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.warn('Failed to enter fullscreen:', error);
      }
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn('Failed to exit fullscreen:', error);
      }
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    isMobile,
    isTablet,
    touchSupported,
    orientation,
    enterFullscreen,
    exitFullscreen,
    vibrate
  };
};

export default ResponsiveMobileInterface;