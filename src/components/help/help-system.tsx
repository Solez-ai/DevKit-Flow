import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HelpCircle, Search, X, ChevronRight, Lightbulb, Book, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'devflow-studio' | 'regexr' | 'ai-features' | 'shortcuts' | 'troubleshooting';
  content: string;
  keywords: string[];
  relatedTopics: string[];
  aiEnhanced?: boolean;
}

interface ContextualHelpProps {
  context?: string;
  feature?: string;
  visible?: boolean;
  onClose?: () => void;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with DevKit Flow',
    description: 'Learn the basics of using DevKit Flow for development planning',
    category: 'getting-started',
    content: 'DevKit Flow is a comprehensive developer productivity workspace...',
    keywords: ['basics', 'introduction', 'overview', 'start'],
    relatedTopics: ['devflow-studio-basics', 'regexr-basics'],
    aiEnhanced: true
  },
  {
    id: 'devflow-studio-basics',
    title: 'DevFlow Studio Fundamentals',
    description: 'Understanding nodes, connections, and visual planning',
    category: 'devflow-studio',
    content: 'DevFlow Studio allows you to create visual representations...',
    keywords: ['nodes', 'connections', 'canvas', 'planning'],
    relatedTopics: ['node-types', 'connections'],
    aiEnhanced: true
  },
  {
    id: 'ai-assistance',
    title: 'AI-Powered Features',
    description: 'How to use Claude MCP integration for enhanced productivity',
    category: 'ai-features',
    content: 'DevKit Flow integrates with Claude MCP to provide intelligent assistance...',
    keywords: ['ai', 'claude', 'assistance', 'smart'],
    relatedTopics: ['code-generation', 'regex-ai'],
    aiEnhanced: true
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Essential keyboard shortcuts for efficient workflow',
    category: 'shortcuts',
    content: 'Master these keyboard shortcuts to work more efficiently...',
    keywords: ['shortcuts', 'keyboard', 'hotkeys', 'efficiency'],
    relatedTopics: ['customization'],
    aiEnhanced: false
  }
];

export const ContextualHelpSystem: React.FC<ContextualHelpProps> = ({
  context,
  feature,
  visible = false,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter topics based on search query and context
  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = !searchQuery || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesContext = !context || topic.category === context || topic.keywords.includes(context);
    
    return matchesSearch && matchesContext;
  });

  // Get AI-enhanced explanation for a topic
  const getAIExplanation = useCallback(async (topic: HelpTopic) => {
    if (!aiEnabled || !topic.aiEnhanced) return;
    
    setIsLoadingAI(true);
    try {
      const prompt = `Provide a detailed, contextual explanation for the DevKit Flow feature: "${topic.title}". 
      Context: ${topic.description}
      Current user context: ${context || 'general usage'}
      
      Please provide:
      1. A clear explanation of what this feature does
      2. Step-by-step instructions for using it
      3. Common use cases and examples
      4. Tips for getting the most out of this feature
      
      Keep the explanation practical and developer-focused.`;
      
      const response = await generateResponse(prompt, 'help-system');
      setAiExplanation(response);
    } catch (error) {
      console.error('Failed to get AI explanation:', error);
      setAiExplanation('AI explanation temporarily unavailable. Please refer to the basic documentation below.');
    } finally {
      setIsLoadingAI(false);
    }
  }, [aiEnabled, context, generateResponse]);

  // Auto-focus search when help opens
  useEffect(() => {
    if (visible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [visible]);

  // Load AI explanation when topic is selected
  useEffect(() => {
    if (selectedTopic && selectedTopic.aiEnhanced) {
      getAIExplanation(selectedTopic);
    } else {
      setAiExplanation('');
    }
  }, [selectedTopic, getAIExplanation]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Documentation
                {aiEnabled && (
                  <Badge variant="secondary" className="ml-2">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {context ? `Help for ${context}` : 'Find answers and learn about DevKit Flow features'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          {/* Topics List */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <div className="space-y-2">
              {filteredTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTopic?.id === topic.id && "bg-muted border-primary"
                  )}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {topic.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {topic.category.replace('-', ' ')}
                          </Badge>
                          {topic.aiEnhanced && aiEnabled && (
                            <Badge variant="secondary" className="text-xs">
                              <Lightbulb className="h-2 w-2 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {selectedTopic ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTopic.title}</h2>
                  <p className="text-muted-foreground">{selectedTopic.description}</p>
                </div>

                {/* AI-Enhanced Explanation */}
                {selectedTopic.aiEnhanced && aiEnabled && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        AI-Enhanced Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAI ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Generating personalized explanation...
                        </div>
                      ) : aiExplanation ? (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap text-sm">{aiExplanation}</div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Basic Documentation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">{selectedTopic.content}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Related Topics */}
                {selectedTopic.relatedTopics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Related Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedTopic.relatedTopics.map((relatedId) => {
                          const relatedTopic = helpTopics.find(t => t.id === relatedId);
                          return relatedTopic ? (
                            <Button
                              key={relatedId}
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTopic(relatedTopic)}
                              className="text-xs"
                            >
                              {relatedTopic.title}
                            </Button>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Keyboard Shortcuts for this feature */}
                {selectedTopic.category === 'shortcuts' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        Keyboard Shortcuts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Open Help</span>
                          <Badge variant="outline">F1</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Search Help</span>
                          <Badge variant="outline">Ctrl+Shift+H</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Close Help</span>
                          <Badge variant="outline">Escape</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a help topic</h3>
                  <p className="text-muted-foreground">
                    Choose a topic from the list to view detailed information
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextualHelpSystem;