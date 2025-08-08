import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HelpCircle, Lightbulb, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface TooltipContent {
  title: string;
  description: string;
  quickTips?: string[];
  relatedFeatures?: string[];
  keyboardShortcut?: string;
  aiEnhanceable?: boolean;
}

interface ContextualTooltipProps {
  content: TooltipContent;
  feature: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showAIButton?: boolean;
  onOpenHelp?: (feature: string) => void;
}

interface SmartSuggestion {
  type: 'tip' | 'warning' | 'enhancement' | 'shortcut';
  content: string;
  action?: string;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  content,
  feature,
  children,
  side = 'top',
  align = 'center',
  className,
  showAIButton = true,
  onOpenHelp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasLoadedAI, setHasLoadedAI] = useState(false);
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate AI-powered suggestions for the feature
  const generateAISuggestions = useCallback(async () => {
    if (!aiEnabled || !content.aiEnhanceable || hasLoadedAI) return;
    
    setIsLoadingAI(true);
    try {
      const prompt = `Provide smart, contextual suggestions for the DevKit Flow feature: "${content.title}".
      
      Feature description: ${content.description}
      Feature context: ${feature}
      
      Please provide 2-3 brief suggestions in JSON format with this structure:
      [
        {
          "type": "tip|warning|enhancement|shortcut",
          "content": "Brief, actionable suggestion",
          "action": "Optional action text"
        }
      ]
      
      Focus on:
      - Productivity tips
      - Common pitfalls to avoid
      - Advanced usage patterns
      - Workflow optimizations
      
      Keep suggestions concise and practical.`;
      
      const response = await generateResponse(prompt, 'contextual-help');
      
      try {
        const suggestions = JSON.parse(response);
        if (Array.isArray(suggestions)) {
          setAiSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
          setHasLoadedAI(true);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI suggestions:', parseError);
        // Fallback to basic suggestions
        setAiSuggestions([
          {
            type: 'tip',
            content: 'Use keyboard shortcuts for faster workflow',
            action: 'View shortcuts'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [aiEnabled, content, feature, hasLoadedAI, generateResponse]);

  // Load AI suggestions when tooltip opens
  useEffect(() => {
    if (isOpen && content.aiEnhanceable && aiEnabled && !hasLoadedAI) {
      // Delay AI loading slightly to avoid blocking UI
      timeoutRef.current = setTimeout(generateAISuggestions, 300);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, generateAISuggestions, content.aiEnhanceable, aiEnabled, hasLoadedAI]);

  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="h-3 w-3 text-blue-500" />;
      case 'warning':
        return <HelpCircle className="h-3 w-3 text-yellow-500" />;
      case 'enhancement':
        return <ChevronRight className="h-3 w-3 text-green-500" />;
      case 'shortcut':
        return <ExternalLink className="h-3 w-3 text-purple-500" />;
      default:
        return <HelpCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'tip':
        return 'border-blue-200 bg-blue-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'enhancement':
        return 'border-green-200 bg-green-50/50';
      case 'shortcut':
        return 'border-purple-200 bg-purple-50/50';
      default:
        return 'border-gray-200 bg-gray-50/50';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("inline-flex", className)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        side={side} 
        align={align} 
        className="w-80 p-0"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">{content.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {content.description}
                </CardDescription>
              </div>
              {content.keyboardShortcut && (
                <Badge variant="outline" className="text-xs ml-2">
                  {content.keyboardShortcut}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Quick Tips */}
            {content.quickTips && content.quickTips.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Tips</h4>
                <ul className="space-y-1">
                  {content.quickTips.map((tip, index) => (
                    <li key={index} className="text-xs flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI-Powered Suggestions */}
            {content.aiEnhanceable && aiEnabled && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  <h4 className="text-xs font-medium text-muted-foreground">Smart Suggestions</h4>
                  {isLoadingAI && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
                  )}
                </div>
                
                {isLoadingAI && !hasLoadedAI ? (
                  <div className="text-xs text-muted-foreground">
                    Generating personalized suggestions...
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-2 rounded-md border text-xs",
                          getSuggestionColor(suggestion.type)
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <p>{suggestion.content}</p>
                            {suggestion.action && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs mt-1"
                                onClick={() => onOpenHelp?.(feature)}
                              >
                                {suggestion.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Related Features */}
            {content.relatedFeatures && content.relatedFeatures.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Related Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.relatedFeatures.map((relatedFeature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-secondary/80"
                        onClick={() => onOpenHelp?.(relatedFeature)}
                      >
                        {relatedFeature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Help Button */}
            {showAIButton && onOpenHelp && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    onOpenHelp(feature);
                    setIsOpen(false);
                  }}
                >
                  <HelpCircle className="h-3 w-3 mr-2" />
                  View Detailed Help
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Helper component for adding contextual help to any element
export const WithContextualHelp: React.FC<{
  feature: string;
  title: string;
  description: string;
  quickTips?: string[];
  relatedFeatures?: string[];
  keyboardShortcut?: string;
  children: React.ReactNode;
  onOpenHelp?: (feature: string) => void;
}> = ({ feature, title, description, quickTips, relatedFeatures, keyboardShortcut, children, onOpenHelp }) => {
  return (
    <ContextualTooltip
      feature={feature}
      content={{
        title,
        description,
        quickTips,
        relatedFeatures,
        keyboardShortcut,
        aiEnhanceable: true
      }}
      onOpenHelp={onOpenHelp}
    >
      {children}
    </ContextualTooltip>
  );
};

export default ContextualTooltip;