import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  Zap, 
  BookOpen, 
  Keyboard, 
  ExternalLink,
  ChevronRight,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface ContextualHelpContext {
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

interface AIInsight {
  type: 'tip' | 'warning' | 'optimization' | 'workflow' | 'shortcut';
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
  priority: 'low' | 'medium' | 'high';
}

interface SmartSuggestion {
  category: 'productivity' | 'learning' | 'troubleshooting' | 'advanced';
  suggestions: AIInsight[];
}

interface AIContextualHelpPanelProps {
  context: ContextualHelpContext;
  isVisible: boolean;
  onClose: () => void;
  onExpand?: () => void;
  className?: string;
  position?: 'floating' | 'sidebar' | 'modal';
}

export const AIContextualHelpPanel: React.FC<AIContextualHelpPanelProps> = ({
  context,
  isVisible,
  onClose,
  onExpand,
  className,
  position = 'floating'
}) => {
  const [insights, setInsights] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'help' | 'shortcuts'>('insights');
  const [userInteractions, setUserInteractions] = useState<string[]>([]);
  
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<string>('');

  // Generate AI-powered contextual insights
  const generateContextualInsights = useCallback(async () => {
    if (!aiEnabled || !context) return;

    const contextKey = `${context.feature}-${context.component}-${context.userAction}`;
    if (contextKey === lastContextRef.current) return; // Avoid duplicate requests
    
    setIsLoading(true);
    lastContextRef.current = contextKey;

    try {
      const prompt = `As an AI assistant for DevKit Flow, provide intelligent contextual help for:

Feature: ${context.feature}
Component: ${context.component}
User Action: ${context.userAction || 'viewing'}
Workspace: ${context.sessionContext?.currentWorkspace || 'unknown'}
Session Context: ${JSON.stringify(context.sessionContext, null, 2)}

Provide 4-6 smart insights in JSON format with this structure:
{
  "productivity": [
    {
      "type": "tip|warning|optimization|workflow|shortcut",
      "title": "Brief insight title",
      "content": "Detailed, actionable insight (2-3 sentences max)",
      "confidence": 0.8,
      "actionable": true,
      "priority": "high|medium|low"
    }
  ],
  "learning": [...],
  "troubleshooting": [...],
  "advanced": [...]
}

Focus on:
1. Context-aware productivity tips
2. Common pitfalls and how to avoid them
3. Advanced usage patterns for power users
4. Workflow optimizations specific to current context
5. Keyboard shortcuts and time-savers
6. Integration opportunities with other features

Make insights specific to the current context and user's apparent skill level.`;

      const response = await generateResponse(prompt, 'contextual-help');
      
      try {
        const parsedInsights = JSON.parse(response);
        const formattedSuggestions: SmartSuggestion[] = Object.entries(parsedInsights)
          .map(([category, suggestions]) => ({
            category: category as SmartSuggestion['category'],
            suggestions: (suggestions as any[]).map(insight => ({
              ...insight,
              confidence: insight.confidence || 0.7,
              actionable: insight.actionable !== false,
              priority: insight.priority || 'medium'
            }))
          }))
          .filter(suggestion => suggestion.suggestions.length > 0);

        setInsights(formattedSuggestions);
      } catch (parseError) {
        console.warn('Failed to parse AI insights:', parseError);
        // Fallback to basic contextual help
        setInsights([{
          category: 'productivity',
          suggestions: [{
            type: 'tip',
            title: 'Context-Aware Help',
            content: `Get the most out of ${context.feature} by exploring the available options and keyboard shortcuts.`,
            confidence: 0.6,
            actionable: true,
            priority: 'medium'
          }]
        }]);
      }
    } catch (error) {
      console.error('Failed to generate contextual insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiEnabled, context, generateResponse]);

  // Track user interactions for better suggestions
  const trackInteraction = useCallback((interaction: string) => {
    setUserInteractions(prev => [...prev.slice(-4), interaction]); // Keep last 5 interactions
  }, []);

  // Generate insights when context changes
  useEffect(() => {
    if (isVisible && context) {
      generateContextualInsights();
    }
  }, [isVisible, context, generateContextualInsights]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        const tabs = ['insights', 'help', 'shortcuts'];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        setActiveTab(tabs[nextIndex] as any);
      } else if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        const tabs = ['insights', 'help', 'shortcuts'];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex] as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, activeTab, onClose]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'optimization': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'workflow': return <Target className="h-4 w-4 text-purple-500" />;
      case 'shortcut': return <Keyboard className="h-4 w-4 text-indigo-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50';
      case 'medium': return 'border-blue-200 bg-blue-50/50';
      case 'low': return 'border-gray-200 bg-gray-50/50';
      default: return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getCategoryIcon = (category: SmartSuggestion['category']) => {
    switch (category) {
      case 'productivity': return <Zap className="h-4 w-4 text-green-500" />;
      case 'learning': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'troubleshooting': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'advanced': return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isVisible) return null;

  const panelContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-sm">Smart Help</h3>
          {aiEnabled && (
            <Badge variant="secondary" className="text-xs">
              AI-Powered
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(!isExpanded);
                onExpand();
              }}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Info */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        <div className="flex items-center gap-2">
          <Target className="h-3 w-3" />
          <span>{context.feature} • {context.component}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="help" className="text-xs">
            <HelpCircle className="h-3 w-3 mr-1" />
            Help
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="text-xs">
            <Keyboard className="h-3 w-3 mr-1" />
            Shortcuts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4">
          <ScrollArea className={cn("space-y-3", isExpanded ? "h-96" : "h-64")}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Generating insights...
                </span>
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category.category)}
                      <h4 className="text-sm font-medium capitalize">
                        {category.category}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {category.suggestions.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {category.suggestions
                        .sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return priorityOrder[b.priority] - priorityOrder[a.priority];
                        })
                        .map((insight, insightIndex) => (
                          <Card
                            key={insightIndex}
                            className={cn(
                              "p-3 border cursor-pointer hover:shadow-sm transition-shadow",
                              getPriorityColor(insight.priority)
                            )}
                            onClick={() => trackInteraction(`viewed-${insight.type}-${insight.title}`)}
                          >
                            <div className="flex items-start gap-3">
                              {getInsightIcon(insight.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="text-sm font-medium">{insight.title}</h5>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {Math.round(insight.confidence * 100)}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {insight.content}
                                </p>
                                {insight.action && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      insight.action?.callback();
                                      trackInteraction(`action-${insight.action?.label || 'unknown'}`);
                                    }}
                                  >
                                    {insight.action.label}
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insights available for this context</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <ScrollArea className={cn("space-y-3", isExpanded ? "h-96" : "h-64")}>
            <div className="space-y-3">
              <Card className="p-3">
                <h4 className="text-sm font-medium mb-2">About {context.feature}</h4>
                <p className="text-xs text-muted-foreground">
                  Get contextual help and documentation for the current feature.
                </p>
              </Card>
              
              <Card className="p-3">
                <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <BookOpen className="h-3 w-3 mr-2" />
                    View Documentation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Open Tutorial
                  </Button>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shortcuts" className="mt-4">
          <ScrollArea className={cn("space-y-3", isExpanded ? "h-96" : "h-64")}>
            <div className="space-y-3">
              <Card className="p-3">
                <h4 className="text-sm font-medium mb-2">Context Shortcuts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Toggle Help</span>
                    <Badge variant="outline">F1</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Quick Search</span>
                    <Badge variant="outline">Ctrl+K</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Switch Tabs</span>
                    <Badge variant="outline">Tab</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (position === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl max-h-[80vh] m-4">
          <CardContent className="p-6">
            {panelContent}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-40 bg-background border rounded-lg shadow-lg",
        position === 'floating' && "top-20 right-4 w-80",
        position === 'sidebar' && "top-0 right-0 h-full w-96 rounded-none border-l",
        className
      )}
    >
      <div className="p-4 h-full overflow-hidden">
        {panelContent}
      </div>
    </div>
  );
};

export default AIContextualHelpPanel;