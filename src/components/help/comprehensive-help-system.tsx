import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Keyboard, 
  MessageSquare, 
  Zap,
  Sparkles,
  X,
  Settings,
  Eye,
  Volume2
} from 'lucide-react';
import { ContextualHelpSystem } from './help-system';
import { InteractiveTutorials } from './interactive-tutorials';
import { IntelligentDocumentation } from './intelligent-documentation';
import { EnhancedKeyboardNavigation } from '../accessibility/enhanced-keyboard-navigation';
import { ScreenReaderSupport } from '../accessibility/screen-reader-support';
import { ResponsiveMobileInterface } from '../mobile/responsive-mobile-interface';
import { useAIService } from '@/hooks/use-ai-service';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useMobile } from '@/hooks/use-mobile';

interface ComprehensiveHelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'help' | 'tutorials' | 'documentation' | 'shortcuts' | 'accessibility';
  context?: string;
  feature?: string;
}

export const ComprehensiveHelpSystem: React.FC<ComprehensiveHelpSystemProps> = ({
  isOpen,
  onClose,
  initialTab = 'help',
  context,
  feature
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(true);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  const { isEnabled: aiEnabled } = useAIService();
  const { announcements } = useAccessibility();
  const { isMobile, isTablet } = useMobile();

  // Auto-detect screen reader and adjust interface
  useEffect(() => {
    const detectScreenReader = () => {
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasScreenReaderUA = /JAWS|NVDA|ORCA|VoiceOver|TalkBack/i.test(navigator.userAgent);
      
      if (hasScreenReaderUA || hasHighContrast) {
        setScreenReaderMode(true);
        setActiveTab('documentation'); // Start with documentation for screen readers
      }
    };

    if (isOpen) {
      detectScreenReader();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts for help system
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === '?' && event.ctrlKey) {
        setShowKeyboardShortcuts(true);
      } else if (event.key >= '1' && event.key <= '5' && event.altKey) {
        const tabs = ['help', 'tutorials', 'documentation', 'shortcuts', 'accessibility'];
        const tabIndex = parseInt(event.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex] as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'help': return <HelpCircle className="h-4 w-4" />;
      case 'tutorials': return <BookOpen className="h-4 w-4" />;
      case 'documentation': return <MessageSquare className="h-4 w-4" />;
      case 'shortcuts': return <Keyboard className="h-4 w-4" />;
      case 'accessibility': return <Eye className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'help': return 'Help';
      case 'tutorials': return 'Tutorials';
      case 'documentation': return 'Docs';
      case 'shortcuts': return 'Shortcuts';
      case 'accessibility': return 'Accessibility';
      default: return 'Help';
    }
  };

  if (!isOpen) return null;

  return (
    <ResponsiveMobileInterface>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  DevKit Flow Help Center
                  {aiEnabled && (
                    <Badge variant="secondary" className="ml-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                  {screenReaderMode && (
                    <Badge variant="outline" className="ml-2">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Screen Reader
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive help, tutorials, and accessibility features
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="hidden md:flex"
                >
                  <Keyboard className="h-3 w-3 mr-2" />
                  Shortcuts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAccessibilityEnabled(!accessibilityEnabled)}
                >
                  <Eye className="h-3 w-3 mr-2" />
                  A11y
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'} mx-6 mt-4`}>
                <TabsTrigger value="help" className="flex items-center gap-2">
                  {getTabIcon('help')}
                  <span className={isMobile ? 'sr-only' : ''}>{getTabLabel('help')}</span>
                </TabsTrigger>
                <TabsTrigger value="tutorials" className="flex items-center gap-2">
                  {getTabIcon('tutorials')}
                  <span className={isMobile ? 'sr-only' : ''}>{getTabLabel('tutorials')}</span>
                </TabsTrigger>
                <TabsTrigger value="documentation" className="flex items-center gap-2">
                  {getTabIcon('documentation')}
                  <span className={isMobile ? 'sr-only' : ''}>{getTabLabel('documentation')}</span>
                </TabsTrigger>
                {!isMobile && (
                  <>
                    <TabsTrigger value="shortcuts" className="flex items-center gap-2">
                      {getTabIcon('shortcuts')}
                      <span>{getTabLabel('shortcuts')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="flex items-center gap-2">
                      {getTabIcon('accessibility')}
                      <span>{getTabLabel('accessibility')}</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="help" className="h-full m-0">
                  <ContextualHelpSystem
                    context={context}
                    feature={feature}
                    visible={true}
                    onClose={() => {}} // Handled by parent
                  />
                </TabsContent>

                <TabsContent value="tutorials" className="h-full m-0">
                  <InteractiveTutorials
                    isOpen={true}
                    onClose={() => {}} // Handled by parent
                    initialTutorial={feature}
                  />
                </TabsContent>

                <TabsContent value="documentation" className="h-full m-0">
                  <IntelligentDocumentation
                    category={context}
                    onClose={() => {}} // Handled by parent
                  />
                </TabsContent>

                {!isMobile && (
                  <>
                    <TabsContent value="shortcuts" className="h-full m-0 p-6">
                      <div className="h-full">
                        <EnhancedKeyboardNavigation
                          showShortcutsDialog={true}
                          onCloseShortcuts={() => setActiveTab('help')}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="accessibility" className="h-full m-0 p-6">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">Accessibility Features</h2>
                          <p className="text-muted-foreground">
                            DevKit Flow is designed to be accessible to all users. Configure accessibility features below.
                          </p>
                        </div>

                        <div className="grid gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Screen Reader Support</h3>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-medium">Enhanced Screen Reader Mode</p>
                                <p className="text-sm text-muted-foreground">
                                  Optimized interface and announcements for screen readers
                                </p>
                              </div>
                              <Button
                                variant={screenReaderMode ? 'default' : 'outline'}
                                onClick={() => setScreenReaderMode(!screenReaderMode)}
                              >
                                {screenReaderMode ? 'Enabled' : 'Enable'}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <p className="font-medium">Enhanced Keyboard Navigation</p>
                                <p className="text-sm text-muted-foreground">
                                  Advanced keyboard shortcuts and spatial navigation
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setShowKeyboardShortcuts(true)}
                              >
                                Configure
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Mobile Accessibility</h3>
                            <div className="p-4 border rounded-lg">
                              <p className="font-medium mb-2">Touch and Gesture Support</p>
                              <p className="text-sm text-muted-foreground mb-3">
                                Optimized touch targets and gesture recognition for mobile devices
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant={isMobile ? 'default' : 'outline'}>
                                  Mobile: {isMobile ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant={isTablet ? 'default' : 'outline'}>
                                  Tablet: {isTablet ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {announcements.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Recent Announcements</h3>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {announcements.slice(-5).map((announcement, index) => (
                                  <div key={index} className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {announcement.priority}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date().toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm">{announcement.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>

          {/* Quick Access Footer for Mobile */}
          {isMobile && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                >
                  <Keyboard className="h-3 w-3 mr-2" />
                  Shortcuts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScreenReaderMode(!screenReaderMode)}
                >
                  <Volume2 className="h-3 w-3 mr-2" />
                  A11y
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('documentation')}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Docs
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Keyboard Navigation */}
      {accessibilityEnabled && (
        <EnhancedKeyboardNavigation
          showShortcutsDialog={showKeyboardShortcuts}
          onCloseShortcuts={() => setShowKeyboardShortcuts(false)}
        />
      )}

      {/* Screen Reader Support */}
      {screenReaderMode && (
        <ScreenReaderSupport
          enabled={true}
          verboseMode={screenReaderMode}
          onToggle={setScreenReaderMode}
        />
      )}
    </ResponsiveMobileInterface>
  );
};

export default ComprehensiveHelpSystem;