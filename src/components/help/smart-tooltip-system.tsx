import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  Lightbulb, 
  Zap, 
  Brain, 
  ChevronRight,
  ExternalLink,
  Keyboard,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIntelligentHelp } from './intelligent-help-provider';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface SmartTooltipContent {
  title: string;
  description: string;
  quickTips?: string[];
  keyboardShortcut?: string;
  aiEnhanced?: boolean;
  contextualActions?: {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }[];
}

interface SmartTooltipProps {
  content: SmartTooltipContent;
  feature: string;
  component: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showAIInsights?: boolean;
  delayDuration?: number;
  skipDelayDuration?: number;
}

interface AIInsight {
  type: 'tip' | 'warning' | 'optimization';
  content: string;
  confidence: number;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  feature,
  component,
  children,
  side = 'top',
  align = 'center',
  className,
  showAIInsights = true,
  delayDuration = 700,
  skipDelayDuration = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [hasLoadedInsights, setHasLoadedInsights] = useState(false);
  
  const { showHelp, trackUserAction, registerHelpTrigger } = useIntelligentHelp();
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const elementRef = useRef<HTMLDivElement>(null);
  const insightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate AI insights for the tooltip
  const generateAIInsights = useCallback(async () => {
    if (!aiEnabled || !content.aiEnhanced || hasLoadedInsights) return;
    
    setIsLoadingInsights(true);
    try {
      const prompt = `Provide 1-2 smart, contextual insights for this DevKit Flow UI element:

Title: ${content.title}
Description: ${content.description}
Feature: ${feature}
Component: ${component}

Return insights as JSON array:
[
  {
    "type": "tip|warning|optimization",
    "content": "Brief, actionable insight (max 50 words)",
    "confidence": 0.8
  }
]

Focus on:
- Productivity improvements
- Common mistakes to avoid
- Advanced usage tips
- Workflow optimizations

Keep insights concise and immediately actionable.`;

      const response = await generateResponse(prompt, 'tooltip-insights');
      
      try {
        const insights = JSON.parse(response);
        if (Array.isArray(insights)) {
          setAiInsights(insights.slice(0, 2)); // Limit to 2 insights
          setHasLoadedInsights(true);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI insights:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [aiEnabled, content, feature, component, hasLoadedInsights, generateResponse]);

  // Load AI insights when tooltip opens (with delay)
  useEffect(() => {
    if (isOpen && content.aiEnhanced && showAIInsights && !hasLoadedInsights) {
      insightTimeoutRef.current = setTimeout(generateAIInsights, 500);
    }
    
    return () => {
      if (insightTimeoutRef.current) {
        clearTimeout(insightTimeoutRef.current);
      }
    };
  }, [isOpen, generateAIInsights, content.aiEnhanced, showAIInsights, hasLoadedInsights]);

  // Register help trigger when component mounts
  useEffect(() => {
    if (elementRef.current) {
      const cleanup = registerHelpTrigger(elementRef.current, {
        feature,
        component,
        userAction: 'viewing-tooltip'
      });
      
      return cleanup;
    }
  }, [feature, component, registerHelpTrigger]);

  // Track tooltip interactions
  const handleTooltipOpen = useCallback(() => {
    setIsOpen(true);
    trackUserAction(`tooltip-opened-${feature}-${component}`, {
      feature,
      component,
      userAction: 'tooltip-opened'
    });
  }, [feature, component, trackUserAction]);

  const handleTooltipClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleShowDetailedHelp = useCallback(() => {
    showHelp({
      feature,
      component,
      userAction: 'requested-detailed-help'
    });
    setIsOpen(false);
    trackUserAction(`detailed-help-requested-${feature}`, {
      feature,
      component,
      userAction: 'detailed-help-requested'
    });
  }, [feature, component, showHelp, trackUserAction]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'tip': return <Lightbulb className="h-3 w-3 text-blue-500" />;
      case 'warning': return <HelpCircle className="h-3 w-3 text-yellow-500" />;
      case 'optimization': return <Zap className="h-3 w-3 text-green-500" />;
      default: return <HelpCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'tip': return 'border-blue-200 bg-blue-50/30';
      case 'warning': return 'border-yellow-200 bg-yellow-50/30';
      case 'optimization': return 'border-green-200 bg-green-50/30';
      default: return 'border-gray-200 bg-gray-50/30';
    }
  };

  return (
    <TooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      <Tooltip open={isOpen} onOpenChange={(open) => open ? handleTooltipOpen() : handleTooltipClose()}>
        <TooltipTrigger asChild>
          <div ref={elementRef} className={cn("inline-flex", className)}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className="max-w-sm p-0 border-0 shadow-lg"
          sideOffset={8}
        >
          <Card className="border shadow-none">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight">{content.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {content.description}
                  </p>
                </div>
                {content.keyboardShortcut && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {content.keyboardShortcut}
                  </Badge>
                )}
              </div>

              {/* Quick Tips */}
              {content.quickTips && content.quickTips.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Quick Tips</span>
                  </div>
                  <ul className="space-y-1">
                    {content.quickTips.map((tip, index) => (
                      <li key={index} className="text-xs flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Insights */}
              {content.aiEnhanced && showAIInsights && aiEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">Smart Insights</span>
                    {isLoadingInsights && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
                    )}
                  </div>
                  
                  {isLoadingInsights && !hasLoadedInsights ? (
                    <div className="text-xs text-muted-foreground italic">
                      Analyzing context...
                    </div>
                  ) : aiInsights.length > 0 ? (
                    <div className="space-y-2">
                      {aiInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-2 rounded border text-xs",
                            getInsightColor(insight.type)
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1 min-w-0">
                              <p className="leading-relaxed">{insight.content}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(insight.confidence * 100)}% confident
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Contextual Actions */}
              {content.contextualActions && content.contextualActions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Quick Actions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {content.contextualActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          action.action();
                          setIsOpen(false);
                          trackUserAction(`contextual-action-${action.label}`, {
                            feature,
                            component,
                            userAction: `contextual-action-${action.label}`
                          });
                        }}
                      >
                        {action.icon && <span className="mr-1">{action.icon}</span>}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs justify-start h-6"
                  onClick={handleShowDetailedHelp}
                >
                  <HelpCircle className="h-3 w-3 mr-2" />
                  Get Detailed Help
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper component for adding smart tooltips to any element
export const WithSmartTooltip: React.FC<{
  feature: string;
  component: string;
  title: string;
  description: string;
  quickTips?: string[];
  keyboardShortcut?: string;
  contextualActions?: SmartTooltipContent['contextualActions'];
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}> = ({ 
  feature, 
  component, 
  title, 
  description, 
  quickTips, 
  keyboardShortcut, 
  contextualActions,
  children, 
  side,
  className 
}) => {
  return (
    <SmartTooltip
      feature={feature}
      component={component}
      content={{
        title,
        description,
        quickTips,
        keyboardShortcut,
        contextualActions,
        aiEnhanced: true
      }}
      side={side}
      className={className}
    >
      {children}
    </SmartTooltip>
  );
};

export default SmartTooltip;